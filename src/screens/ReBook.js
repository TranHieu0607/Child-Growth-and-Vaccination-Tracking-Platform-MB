import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft, faCalendarAlt, faChevronLeft, faChevronRight, faBaby } from '@fortawesome/free-solid-svg-icons';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';

// Import APIs
import vaccinationFacilitiesApi from '../store/api/vaccinationFacilitiesApi';
import vaccinesApi from '../store/api/vaccinesApi';
import diseasesApi from '../store/api/diseasesApi';
import appointmentApi from '../store/api/appointmentApi';
import scheduleApi from '../store/api/scheduleApi';
import childrenApi from '../store/api/childrenApi';
import orderApi from '../store/api/orderApi';
import rebookApi from '../store/api/rebookApi';

const ReBook = ({ navigation, route }) => {
  // Lấy thông tin vaccine từ route params
  const { vaccine, child, childVaccineProfileId } = route.params;
  
  // States
  const [facilities, setFacilities] = useState([]);
  const [filteredFacilities, setFilteredFacilities] = useState([]);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [vaccineInfo, setVaccineInfo] = useState(null);
  const [diseaseInfo, setDiseaseInfo] = useState(null);
  const [note, setNote] = useState('');
  const [loadingFacilities, setLoadingFacilities] = useState(false);
  
  // Order states
  const [availableOrders, setAvailableOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [imageErrors, setImageErrors] = useState({});
  
  // Calendar states
  const [calendarMonth, setCalendarMonth] = useState(dayjs().month() + 1);
  const [calendarYear, setCalendarYear] = useState(dayjs().year());
  
  const token = useSelector(state => state.auth.token);

  // Fetch vaccine và disease info
  useEffect(() => {
    const fetchVaccineAndDiseaseInfo = async () => {
      try {
        const [vaccinesRes, diseasesRes] = await Promise.all([
          vaccinesApi.getAllVaccines(),
          diseasesApi.getAllDiseases()
        ]);
        
        const vaccineObj = vaccinesRes.data?.find(v => v.vaccineId === vaccine.vaccineId);
        const diseaseObj = diseasesRes.data?.find(d => d.diseaseId === vaccine.diseaseId);
        
        setVaccineInfo(vaccineObj);
        setDiseaseInfo(diseaseObj);
      } catch (error) {
        console.error('Error fetching vaccine/disease info:', error);
      }
    };
    
    fetchVaccineAndDiseaseInfo();
  }, [vaccine.vaccineId, vaccine.diseaseId]);

  // Fetch available orders that match disease and vaccine
  useEffect(() => {
    const fetchAvailableOrders = async () => {
      if (!token) return;
      
      setLoadingOrders(true);
      try {
        const ordersRes = await orderApi.getMyOrders(1, 50, token);
        const allOrders = ordersRes.data?.data || [];
        
        // Lọc orders có status "Paid"
        const paidOrders = allOrders.filter(order => order.status === 'Paid');
        
        // Lọc orders có orderDetails chứa diseaseId và vaccineId khớp
        const matchingOrders = paidOrders.filter(order => {
          return order.orderDetails?.some(detail => 
            detail.diseaseId === vaccine.diseaseId && 
            detail.facilityVaccine?.vaccineId === vaccine.vaccineId
          );
        });
        
        setAvailableOrders(matchingOrders);
        
      } catch (error) {
        console.error('Lỗi khi tìm kiếm orders:', error);
        setAvailableOrders([]);
      } finally {
        setLoadingOrders(false);
      }
    };
    
    fetchAvailableOrders();
  }, [vaccine.vaccineId, vaccine.diseaseId, token]);

  // Fetch facilities that have this vaccine
  useEffect(() => {
    const fetchFacilities = async () => {
      if (!token) return; // Chờ có token trước
      
      setLoadingFacilities(true);
      try {
        // Sử dụng API FacilityVaccines để lấy tất cả facility vaccines
        const facilityVaccinesRes = await vaccinesApi.getAllFacilityVaccines(token);
        
        // Xử lý dữ liệu trả về - có thể là facilityVaccinesRes.data.data hoặc facilityVaccinesRes.data
        let allFacilityVaccines = [];
        if (facilityVaccinesRes?.data?.data && Array.isArray(facilityVaccinesRes.data.data)) {
          allFacilityVaccines = facilityVaccinesRes.data.data;
        } else if (facilityVaccinesRes?.data && Array.isArray(facilityVaccinesRes.data)) {
          allFacilityVaccines = facilityVaccinesRes.data;
        } else {
          console.error('Dữ liệu trả về không đúng định dạng:', facilityVaccinesRes);
          allFacilityVaccines = [];
        }
        
        // Lọc các facility vaccines có vaccineId khớp
        const matchingFacilityVaccines = allFacilityVaccines.filter(fv => 
          fv && fv.vaccineId === vaccine.vaccineId
        );
        
        if (matchingFacilityVaccines.length > 0) {
          // Lấy danh sách facilityId duy nhất
          const facilityIds = [...new Set(matchingFacilityVaccines.map(fv => fv.facilityId))];
          
          // Lấy thông tin đầy đủ của các facilities
          const allFacilitiesRes = await vaccinationFacilitiesApi.getVaccinationFacilities(1, 100);
          const allFacilities = allFacilitiesRes.data || [];
          
          // Filter facilities có trong danh sách facilityIds
          const filteredFacilities = allFacilities.filter(facility => 
            facilityIds.includes(facility.facilityId)
          );
          
          setFacilities(filteredFacilities);
          setFilteredFacilities(filteredFacilities);
        } else {
          setFacilities([]);
          setFilteredFacilities([]);
        }
        
      } catch (error) {
        console.error('Lỗi khi tìm kiếm cơ sở:', error);
        setFacilities([]);
        setFilteredFacilities([]);
      } finally {
        setLoadingFacilities(false);
      }
    };
    
    fetchFacilities();
  }, [vaccine.vaccineId, token]);

  // Fetch available slots when facility and date selected
  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (selectedFacility && selectedDate && token) {
        try {
          const response = await scheduleApi.getFacilitySchedules(
            selectedFacility.facilityId,
            selectedDate,
            selectedDate,
            token
          );
          
          // Lấy slots từ response như trong Booking.js
          const slots = response.data?.dailySchedules?.[0]?.availableSlots || [];
          setAvailableSlots(slots);
        } catch (error) {
          console.error('Error fetching slots:', error);
          setAvailableSlots([]);
        }
      } else {
        setAvailableSlots([]);
      }
    };
    
    fetchAvailableSlots();
  }, [selectedFacility, selectedDate, token]);

  // Handle order selection
  const handleSelectOrder = (order) => {
    setSelectedOrder(order);
    
    // Tìm orderDetail có vaccine và disease khớp
    const matchingDetail = order.orderDetails?.find(detail => 
      detail.diseaseId === vaccine.diseaseId && 
      detail.facilityVaccine?.vaccineId === vaccine.vaccineId
    );
    
    if (matchingDetail?.facilityVaccine) {
      // Cố định facility theo order
      const facilityId = matchingDetail.facilityVaccine.facilityId;
      
      // Tìm facility info từ danh sách facilities
      const orderFacility = facilities.find(f => f.facilityId === facilityId);
      if (orderFacility) {
        setSelectedFacility(orderFacility);
      } else {
        // Nếu chưa có trong danh sách, fetch facility info
        fetchFacilityInfo(facilityId);
      }
    }
    
    // Reset date và slot
    setSelectedDate(null);
    setSelectedSlot(null);
    setAvailableSlots([]);
  };

  // Fetch single facility info
  const fetchFacilityInfo = async (facilityId) => {
    try {
      const facilitiesRes = await vaccinationFacilitiesApi.getVaccinationFacilities(1, 100);
      const allFacilities = facilitiesRes.data || [];
      const facility = allFacilities.find(f => f.facilityId === facilityId);
      
      if (facility) {
        setSelectedFacility(facility);
      }
    } catch (error) {
      console.error('Error fetching facility info:', error);
    }
  };

  // Handle facility selection
  const handleSelectFacility = (facility) => {
    setSelectedFacility(facility);
    // Reset order khi chọn cơ sở khác (tiêm lẻ)
    setSelectedOrder(null);
    // Reset date và slot khi chọn cơ sở mới
    setSelectedDate(null);
    setSelectedSlot(null);
    setAvailableSlots([]);
  };

  // Handle date selection
  const handleSelectDate = (year, month, day) => {
    const dayStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    setSelectedDate(dayStr);
    setSelectedSlot(null);
  };

  // Handle slot selection
  const handleSelectSlot = (slot) => {
    setSelectedSlot(slot);
  };

  // Handle booking
  const handleBookAppointment = async () => {
    if (!selectedFacility || !selectedDate || !selectedSlot) {
      Alert.alert('Thông báo', 'Vui lòng chọn đầy đủ cơ sở, ngày và giờ khám!');
      return;
    }

    try {
      const rebookData = {
        childVaccineProfileId: childVaccineProfileId,
        scheduleId: selectedSlot.scheduleId,
        note: note
      };

      // Chỉ thêm orderId khi có order được chọn (tiêm theo gói)
      if (selectedOrder) {
        rebookData.orderId = selectedOrder.orderId;
      }
      // Với tiêm lẻ: không thêm orderId field

      const response = await rebookApi.rebookAppointment(rebookData, token);
      
      const bookingType = selectedOrder ? 'theo gói đã mua' : 'tiêm lẻ';
      Alert.alert(
        'Đặt lại lịch thành công!', 
        `Lịch hẹn ${bookingType} của bạn đã được đặt lại thành công.`,
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('HistoryVacc')
          }
        ]
      );
    } catch (error) {
      console.error('Error rebooking appointment:', error);
      Alert.alert('Lỗi', 'Không thể đặt lại lịch hẹn. Vui lòng thử lại!');
    }
  };

  // Calendar helper functions
  const getDaysInMonth = (month, year) => dayjs().year(year).month(month - 1).daysInMonth();
  const getFirstDayOfWeek = (month, year) => dayjs().year(year).month(month - 1).date(1).day();
  const isPastDate = (year, month, day) => dayjs().year(year).month(month - 1).date(day).isBefore(dayjs(), 'day');
  const today = dayjs();

  // Render calendar
  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(calendarMonth, calendarYear);
    const firstDayOfWeek = getFirstDayOfWeek(calendarMonth, calendarYear);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(<View key={`empty-${i}`} style={styles.dayButton} />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = selectedDate && 
        dayjs(selectedDate).year() === calendarYear &&
        dayjs(selectedDate).month() === calendarMonth - 1 &&
        dayjs(selectedDate).date() === day;
      
      const isPast = isPastDate(calendarYear, calendarMonth, day);

      days.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.dayButton,
            isSelected && styles.dayButtonSelected,
            isPast && styles.dayButtonDisabled
          ]}
          onPress={() => !isPast && handleSelectDate(calendarYear, calendarMonth, day)}
          disabled={isPast}
        >
          <Text style={[
            styles.dayButtonText,
            isSelected && styles.dayButtonTextSelected,
            isPast && styles.dayButtonTextDisabled
          ]}>
            {day}
          </Text>
        </TouchableOpacity>
      );
    }

    return days;
  };

  // Calculate age helper function
  const calculateAge = (dob) => {
    if (!dob) return '';
    const birthDate = new Date(dob);
    const today = new Date();
    let years = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      years--;
    }
    if (years > 0) {
      const remainingMonths = m < 0 ? 12 + m : m;
      return `${years} tuổi${remainingMonths > 0 ? ` ${remainingMonths} tháng` : ''}`;
    }
    let months = today.getMonth() - birthDate.getMonth() + (12 * (today.getFullYear() - birthDate.getFullYear()));
    if(today.getDate() < birthDate.getDate()) {
        months--;
    }
    return `${months} tháng`;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity 
          onPress={() => navigation.navigate('HistoryVacc')}
          style={{ padding: 10 }}
        >
          <FontAwesomeIcon icon={faArrowLeft} size={25} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đặt lại lịch tiêm chủng</Text>
      </View>

      {/* Child Info */}
      <View style={styles.childInfoContainer}>
        <View style={styles.childInfo}>
          {child?.imageURL && !imageErrors[child.imageURL] ? (
            <Image
              source={{ uri: child.imageURL }}
              style={styles.profileImage}
              onError={() => setImageErrors(prev => ({ ...prev, [child.imageURL]: true }))}
            />
          ) : (
            <View style={[styles.profileImage, {
              backgroundColor: '#E6F0FE',
              justifyContent: 'center',
              alignItems: 'center'
            }]}>
              <FontAwesomeIcon icon={faBaby} size={16} color="#2F80ED" />
            </View>
          )}
          <View>
            <Text style={styles.childName}>{child?.fullName}</Text>
            <Text style={styles.childAge}>{calculateAge(child?.dateOfBirth)}</Text>
          </View>
        </View>
      </View>

      {/* Vaccine Info */}
      <View style={styles.vaccineInfoContainer}>
        <Text style={styles.sectionTitle}>
          {vaccineInfo ? vaccineInfo.name : `Vaccine ${vaccine.vaccineId}`}
        </Text>
        <View style={styles.vaccineDetailItem}>
          <MaterialIcons name="vaccines" size={20} color="#007bff" />
          <View style={styles.vaccineTextContainer}>
            <Text style={styles.vaccineShotName}>
              {diseaseInfo?.name || `Disease ${vaccine.diseaseId}`} - Mũi {vaccine.doseNum}
            </Text>
            <Text style={styles.vaccineDetails}>
              {vaccine.priority} - {vaccine.isRequired ? 'Bắt buộc' : 'Tùy chọn'}
            </Text>
          </View>
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>Chưa tiêm lần</Text>
            <Text style={styles.expectedDate}>Dự kiến: {vaccine.expectedDate}</Text>
          </View>
        </View>
      </View>

      {/* Available Orders Section */}
      {availableOrders.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Gói vaccine đã mua</Text>
          {loadingOrders ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Đang tải gói vaccine...</Text>
            </View>
          ) : (
            availableOrders.map(order => {
              const matchingDetail = order.orderDetails?.find(detail => 
                detail.diseaseId === vaccine.diseaseId && 
                detail.facilityVaccine?.vaccineId === vaccine.vaccineId
              );
              
              return (
                                 <TouchableOpacity
                   key={order.orderId}
                   style={[
                     styles.orderCard,
                     selectedOrder?.orderId === order.orderId && styles.orderCardSelected
                   ]}
                   onPress={() => handleSelectOrder(order)}
                 >
                   <View style={styles.orderHeader}>
                     <MaterialIcons name="shopping-bag" size={20} color="#28a745" />
                                           <Text style={styles.orderTitle}>
                        {order.packageName || 
                         order.package?.name || 
                         `Gói ${order.orderId}`}
                      </Text>
                     <View style={styles.orderStatusContainer}>
                       <Text style={styles.orderStatus}>Đã thanh toán</Text>
                     </View>
                   </View>
                   <Text style={styles.orderDate}>
                     Ngày mua: {new Date(order.orderDate).toLocaleDateString('vi-VN')}
                   </Text>
                   <Text style={styles.orderAmount}>
                     Tổng tiền: {order.totalAmount?.toLocaleString('vi-VN')}đ
                   </Text>
                   {matchingDetail && (
                     <Text style={styles.orderRemaining}>
                       Số lượng còn lại: {matchingDetail.remainingQuantity}
                     </Text>
                   )}
                 </TouchableOpacity>
              );
            })
          )}
        </>
      )}

      {/* Facility Selection - Chỉ hiển thị khi chưa chọn order */}
      {!selectedOrder && (
        <>
          <Text style={styles.sectionTitle}>Hoặc chọn cơ sở để tiêm lẻ</Text>
          {loadingFacilities ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Đang tìm kiếm cơ sở có vaccine...</Text>
            </View>
          ) : filteredFacilities.length === 0 ? (
            <View style={styles.noFacilitiesContainer}>
              <Text style={styles.noFacilitiesText}>
                Không tìm thấy cơ sở nào có vaccine {vaccineInfo?.name || `Vaccine ${vaccine.vaccineId}`}
              </Text>
            </View>
          ) : (
            filteredFacilities.map(facility => (
              <TouchableOpacity
                key={facility.facilityId}
                style={[
                  styles.facilityCard,
                  selectedFacility?.facilityId === facility.facilityId && styles.facilityCardSelected
                ]}
                onPress={() => handleSelectFacility(facility)}
              >
                <View style={styles.facilityHeader}>
                  <MaterialIcons name="location-on" size={20} color="#007bff" />
                  <Text style={styles.facilityName}>{facility.facilityName}</Text>
                </View>
                <Text style={styles.facilityAddress}>{facility.address}</Text>
              </TouchableOpacity>
            ))
          )}
        </>
      )}

      {/* Selected Facility Display - Hiển thị khi đã chọn order */}
      {selectedOrder && selectedFacility && (
        <>
          <Text style={styles.sectionTitle}>Cơ sở tiêm (theo gói đã mua)</Text>
          <View style={styles.selectedFacilityCard}>
            <View style={styles.facilityHeader}>
              <MaterialIcons name="location-on" size={20} color="#28a745" />
              <Text style={styles.facilityName}>{selectedFacility.facilityName}</Text>
            </View>
            <Text style={styles.facilityAddress}>{selectedFacility.address}</Text>
            <TouchableOpacity 
              style={styles.changeFacilityButton}
              onPress={() => {
                setSelectedOrder(null);
                setSelectedFacility(null);
              }}
            >
              <Text style={styles.changeFacilityText}>Chọn cơ sở khác (tiêm lẻ)</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Date Selection - Luôn hiển thị lịch */}
      <Text style={styles.sectionTitle}>Chọn ngày và giờ</Text>
      {/* Calendar chọn ngày động */}
      <View style={styles.calendarContainer}>
         {/* Calendar header động */}
         <View style={styles.calendarHeader}>
            <FontAwesomeIcon icon={faCalendarAlt} size={18} color="#007bff" style={{ marginRight: 5 }} />
            <Text style={styles.calendarHeaderText}>
              Tháng {calendarMonth}, {calendarYear}
            </Text>
            <View style={{flex: 1}} />{/* Spacer */}
            <TouchableOpacity
              onPress={() => {
                if (calendarMonth === 1) {
                  setCalendarMonth(12);
                  setCalendarYear(calendarYear - 1);
                } else {
                  setCalendarMonth(calendarMonth - 1);
                }
              }}
            >
              <FontAwesomeIcon icon={faChevronLeft} size={15} color="gray" style={{ marginRight: 15 }} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                if (calendarMonth === 12) {
                  setCalendarMonth(1);
                  setCalendarYear(calendarYear + 1);
                } else {
                  setCalendarMonth(calendarMonth + 1);
                }
              }}
            >
              <FontAwesomeIcon icon={faChevronRight} size={15} color="gray" />
            </TouchableOpacity>
         </View>
         {/* Weekdays giữ nguyên */}
         <View style={styles.weekdaysContainer}>
            <Text style={styles.weekdayText}>CN</Text>
            <Text style={styles.weekdayText}>T2</Text>
            <Text style={styles.weekdayText}>T3</Text>
            <Text style={styles.weekdayText}>T4</Text>
            <Text style={styles.weekdayText}>T5</Text>
            <Text style={styles.weekdayText}>T6</Text>
            <Text style={styles.weekdayText}>T7</Text>
         </View>
         {/* Calendar days động, không cho chọn ngày quá khứ */}
         <View style={styles.daysContainer}>
            {/* Padding đầu tháng cho đúng thứ */}
            {Array(getFirstDayOfWeek(calendarMonth, calendarYear)).fill(0).map((_, idx) => (
              <View key={`pad-${idx}`} style={{ width: '14%', aspectRatio: 1 }} />
            ))}
            {/* Render ngày */}
            {Array(getDaysInMonth(calendarMonth, calendarYear)).fill(0).map((_, index) => {
               const day = index + 1;
               const dayStr = `${calendarYear}-${calendarMonth.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
               const isSelected = selectedDate === dayStr;
               const disabled = isPastDate(calendarYear, calendarMonth, day) || (!selectedFacility && !selectedOrder);
               return (
                  <TouchableOpacity
                    key={day}
                    style={[styles.dayButton, isSelected && styles.dayButtonSelected, disabled && { opacity: 0.3 }]}
                    onPress={() => !disabled && handleSelectDate(calendarYear, calendarMonth, day)}
                    disabled={disabled}
                  >
                     <Text style={[styles.dayButtonText, isSelected && styles.dayButtonTextSelected]}>{day}</Text>
                  </TouchableOpacity>
               );
            })}
         </View>
      </View>
      
      {/* Render slot giờ động */}
      <Text style={[styles.sectionTitle, styles.timeSlotSectionTitle]}>Chọn giờ</Text>
      <View style={styles.timeSlotContainer}>
        {!selectedFacility && !selectedOrder ? (
          <Text style={{ color: '#888', textAlign: 'center', width: '100%' }}>Vui lòng chọn gói hoặc cơ sở trước</Text>
        ) : !selectedDate ? (
          <Text style={{ color: '#888', textAlign: 'center', width: '100%' }}>Vui lòng chọn ngày trước</Text>
        ) : availableSlots.length === 0 ? (
          <Text style={{ color: '#888', textAlign: 'center', width: '100%' }}>Không có khung giờ khả dụng</Text>
        ) : (
          availableSlots.map(slot => (
            <TouchableOpacity
              key={slot.slotId}
              style={selectedSlot?.slotId === slot.slotId ? styles.timeSlotButtonSelected : styles.timeSlotButton}
              onPress={() => handleSelectSlot(slot)}
            >
              <Text style={selectedSlot?.slotId === slot.slotId ? styles.timeSlotButtonTextSelected : styles.timeSlotButtonText}>
                {slot.slotTime}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Book Button */}
      <TouchableOpacity 
        style={styles.bookButton}
        onPress={handleBookAppointment}
      >
        <Text style={styles.bookButtonText}>Đặt lại lịch</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 55,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    backgroundColor: '#fff',
    marginHorizontal: -15,
    marginTop: -50,
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 2.5,
    elevation: 4,
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
    marginLeft: -25,
    color: '#222',
  },
  childInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 0.8,
    elevation: 1,
  },
  childInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  childName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  childAge: {
    fontSize: 14,
    color: '#666',
  },
  vaccineInfoContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 0.8,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
    marginHorizontal: 15,
    color: '#333',
  },
  timeSlotSectionTitle: {
    marginTop: 0,
  },
  vaccineDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  vaccineTextContainer: {
    flex: 1,
    marginLeft: 10,
  },
  vaccineShotName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  vaccineDetails: {
    fontSize: 14,
    color: '#666',
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusText: {
    fontSize: 12,
    color: '#007bff',
  },
  expectedDate: {
    fontSize: 12,
    color: '#666',
  },
  facilityCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 0.8,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#eee',
  },
  facilityCardSelected: {
    borderColor: '#007bff',
    borderWidth: 2,
  },
  facilityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  facilityName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#333',
  },
  facilityAddress: {
    fontSize: 14,
    color: '#666',
    marginLeft: 28,
  },
  calendarContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 0.8,
    elevation: 1,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  calendarHeaderText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#007bff',
  },
  weekdaysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  weekdayText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#555',
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  dayButton: {
    width: '14%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
    borderRadius: 15,
  },
  dayButtonSelected: {
    backgroundColor: '#007bff',
  },
  dayButtonDisabled: {
    opacity: 0.3,
  },
  dayButtonText: {
    fontSize: 14,
    color: '#333',
  },
  dayButtonTextSelected: {
    color: '#fff',
  },
  dayButtonTextDisabled: {
    color: '#ccc',
  },
  timeSlotContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 15,
    marginBottom: 10,
    justifyContent: 'flex-start',
  },
  timeSlotButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginRight: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 0.8,
    elevation: 1,
  },
  timeSlotButtonSelected: {
    borderWidth: 1,
    borderColor: '#007bff',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginRight: 10,
    marginBottom: 10,
    backgroundColor: '#007bff',
    shadowColor: '#007bff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  timeSlotButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  timeSlotButtonTextSelected: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  facilitySlotText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  facilitySlotTextSelected: {
    color: '#fff',
  },
  noSlotsText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    paddingVertical: 20,
    marginHorizontal: 15,
  },
  bookButton: {
    backgroundColor: '#007bff',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 15,
    marginTop: 25,
    marginBottom: 25,
    shadowColor: '#007bff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  bookButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    marginHorizontal: 15,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 0.8,
    elevation: 1,
  },
  loadingText: {
    fontSize: 14,
    color: '#007bff',
    fontStyle: 'italic',
  },
  noFacilitiesContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    marginHorizontal: 15,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 0.8,
    elevation: 1,
  },
  noFacilitiesText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 0.8,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#eee',
  },
  orderCardSelected: {
    borderColor: '#28a745',
    borderWidth: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#333',
    flex: 1,
  },
  orderStatusContainer: {
    backgroundColor: '#28a745',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  orderStatus: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  orderAmount: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginBottom: 4,
  },
  orderRemaining: {
    fontSize: 14,
    color: '#007bff',
    fontWeight: '500',
  },
  selectedFacilityCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#28a745',
  },
  changeFacilityButton: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#007bff',
    alignSelf: 'flex-start',
  },
  changeFacilityText: {
    fontSize: 14,
    color: '#007bff',
    fontWeight: '500',
  },
});

export default ReBook;
