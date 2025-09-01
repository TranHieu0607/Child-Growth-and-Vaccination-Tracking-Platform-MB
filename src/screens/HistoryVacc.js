import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image, FlatList, Alert } from 'react-native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft, faTrash, faBaby } from '@fortawesome/free-solid-svg-icons';
import { useFocusEffect } from '@react-navigation/native';
import childrenApi from '../store/api/childrenApi';
import childVaccineProfileApi from '../store/api/childVaccineProfileApi';
import vaccinesApi from '../store/api/vaccinesApi';
import diseasesApi from '../store/api/diseasesApi';
import appointmentApi from '../store/api/appointmentApi';
import vaccinationFacilitiesApi from '../store/api/vaccinationFacilitiesApi';
import { useSelector } from 'react-redux';

const HistoryVacc = ({ navigation }) => {   
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('history'); // 'history' or 'tracking'
  const [historySubTab, setHistorySubTab] = useState('completed'); // 'completed' or 'scheduled'
  const [trackingStatusFilter, setTrackingStatusFilter] = useState('all'); // 'all', 'Completed', 'Pending', 'Canceled'
  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState(null);
  const [imageErrors, setImageErrors] = useState({});
  const [vaccineHistory, setVaccineHistory] = useState([]);
  const [vaccines, setVaccines] = useState([]);
  const [diseases, setDiseases] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [appointmentHistory, setAppointmentHistory] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyPerPage] = useState(4);
  const [trackingPage, setTrackingPage] = useState(1);
  const [trackingPerPage] = useState(3);
  const [searchQuery, setSearchQuery] = useState('');
  const token = useSelector(state => state.auth.token);

  // Fetch children một lần duy nhất khi component mount
  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const res = await childrenApi.getMyChildren();
        const data = res.data || [];
        setChildren(data);
        if (data.length > 0) setSelectedChildId(data[0].childId);
      } catch (e) {
        setChildren([]);
      }
    };
    fetchChildren();
  }, []);

  // Tự động fetch lại vaccine history mỗi khi màn hình được focus
  useFocusEffect(
    React.useCallback(() => {
      if (!selectedChildId) return;
      
      const fetchVaccineHistory = async () => {
        try {
          const res = await childVaccineProfileApi.getByChildId(selectedChildId);
          setVaccineHistory(res.data || []);
          // Reset về trang 1 khi fetch lại dữ liệu
          setHistoryPage(1);
        } catch (e) {
          console.error('Error fetching vaccine history:', e);
          setVaccineHistory([]);
          setHistoryPage(1);
        }
      };
      
      fetchVaccineHistory();
    }, [selectedChildId])
  );

  useEffect(() => {
    const fetchVaccinesAndDiseases = async () => {
      try {
        const [vaccinesRes, diseasesRes, facilitiesRes] = await Promise.all([
          vaccinesApi.getAllVaccines(),
          diseasesApi.getAllDiseases(),
          vaccinationFacilitiesApi.getVaccinationFacilities(1, 100) // Lấy 100 cơ sở đầu tiên
        ]);
        setVaccines(vaccinesRes.data || []);
        setDiseases(diseasesRes.data || []);
        setFacilities(facilitiesRes.data || []);
      } catch (e) {
        setVaccines([]);
        setDiseases([]);
        setFacilities([]);
      }
    };
    fetchVaccinesAndDiseases();
  }, []);

  // Lấy lịch sử đặt lịch tiêm chủng khi sang tab tracking
  useFocusEffect(
    React.useCallback(() => {
      if (activeTab !== 'tracking' || !selectedChildId || !token) return;
      
      const fetchAppointmentHistory = async () => {
        try {
          const res = await appointmentApi.getMyAppointmentHistory(selectedChildId, token);
          setAppointmentHistory(res.data?.appointments || []);
        } catch (e) {
          console.error('Error fetching appointment history:', e);
          setAppointmentHistory([]);
        }
      };
      
      fetchAppointmentHistory();
    }, [activeTab, selectedChildId, token])
  );

  const handleSelectChildPress = () => {
    setIsDropdownVisible(!isDropdownVisible);
  };

  const handleSelectChild = (childId) => {
    setSelectedChildId(childId);
    setIsDropdownVisible(false);
    setHistoryPage(1); // Reset về trang 1 khi chọn trẻ khác
    setTrackingPage(1); // Reset về trang 1 khi chọn trẻ khác
    setSearchQuery(''); // Reset search query khi chọn trẻ khác
  };

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

  const selectedChild = children.find(child => child.childId === selectedChildId);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10 }}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <FontAwesomeIcon icon={faArrowLeft} size={25} color="black" />
        </TouchableOpacity>
        <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', flex: 1 }}>lịch sử tiêm</Text>
      </View>

      {/* User Info and Dropdown */}
      <View style={styles.childInfoContainer}>
        <View style={styles.childInfo}>
          {selectedChildId && (
            <>
              {selectedChild?.imageURL && !imageErrors[selectedChild.imageURL] ? (
                <Image
                  source={{ uri: selectedChild.imageURL }}
                  style={styles.avatar}
                  onError={() => setImageErrors(prev => ({ ...prev, [selectedChild.imageURL]: true }))}
                />
              ) : (
                <View style={[styles.avatar, {
                  backgroundColor: '#E6F0FE',
                  justifyContent: 'center',
                  alignItems: 'center'
                }]}>
                  <FontAwesomeIcon icon={faBaby} size={16} color="#2F80ED" />
                </View>
              )}
            </>
          )}
          <View>
            {selectedChildId && (
              <Text style={styles.userName}>
                {selectedChild?.fullName}
              </Text>
            )}
            {selectedChildId && (
              <Text style={styles.userAge}>
                {calculateAge(selectedChild?.dateOfBirth)}
              </Text>
            )}
          </View>
        </View>

        <TouchableOpacity style={styles.dropdownToggle} onPress={handleSelectChildPress}>
          <MaterialIcons name="keyboard-arrow-down" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* Child Selection Dropdown */}
      {isDropdownVisible && (
        <View style={styles.dropdownContainer}>
          {(children || []).map(child => (
            <TouchableOpacity
              key={child.childId}
              style={styles.dropdownItem}
              onPress={() => handleSelectChild(child.childId)}
            >
              {child.imageURL && !imageErrors[child.imageURL] ? (
                <Image
                  source={{ uri: child.imageURL }}
                  style={styles.dropdownItemImage}
                  onError={() => setImageErrors(prev => ({ ...prev, [child.imageURL]: true }))}
                />
              ) : (
                <View style={[styles.dropdownItemImage, {
                  backgroundColor: '#E6F0FE',
                  justifyContent: 'center',
                  alignItems: 'center'
                }]}>
                  <FontAwesomeIcon icon={faBaby} size={12} color="#2F80ED" />
                </View>
              )}
              <View style={styles.dropdownItemTextContainer}>
                <Text style={styles.dropdownItemName}>{child.fullName}</Text>
                <Text style={styles.dropdownItemAge}>{calculateAge(child.dateOfBirth)}</Text>
              </View>
              {selectedChildId === child.childId && <Text style={styles.selectedIcon}> ✅</Text>}
            </TouchableOpacity>
          ))}
        </View>
      )}

             {/* Tabs */}
       <View style={styles.tabs}>
         <TouchableOpacity
           style={activeTab === 'history' ? styles.activeTab : styles.tab}
           onPress={() => {
             setActiveTab('history');
             setHistoryPage(1); // Reset về trang 1 khi chuyển tab
           }}
         >
           <Text style={activeTab === 'history' ? styles.activeTabText : styles.tabText}>Lịch sử tiêm chủng</Text>
         </TouchableOpacity>
         <TouchableOpacity
           style={activeTab === 'tracking' ? styles.activeTab : styles.tab}
           onPress={() => {
             setActiveTab('tracking');
             setTrackingPage(1); // Reset về trang 1 khi chuyển tab
           }}
         >
           <Text style={activeTab === 'tracking' ? styles.activeTabText : styles.tabText}>Gói đang theo dõi</Text>
         </TouchableOpacity>
       </View>

      {activeTab === 'history' && selectedChild && (
        <>
          {/* Search Bar */}
          <View style={styles.searchBar}>
            <Feather name="search" size={20} color="gray" />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm mũi tiêm..."
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                setHistoryPage(1); // Reset về trang 1 khi tìm kiếm
              }}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery('');
                  setHistoryPage(1);
                }}
                style={{ padding: 5 }}
              >
                <MaterialIcons name="close" size={20} color="gray" />
              </TouchableOpacity>
            )}
          </View>

          {/* Sub Tabs for History */}
          <View style={styles.subTabs}>
            <TouchableOpacity
              style={historySubTab === 'completed' ? styles.activeSubTab : styles.subTab}
              onPress={() => {
                setHistorySubTab('completed');
                setHistoryPage(1); // Reset về trang 1 khi chuyển tab
                setSearchQuery(''); // Reset search query
              }}
            >
              <Text style={historySubTab === 'completed' ? styles.activeSubTabText : styles.subTabText}>
                ✅ Đã tiêm
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={historySubTab === 'scheduled' ? styles.activeSubTab : styles.subTab}
              onPress={() => {
                setHistorySubTab('scheduled');
                setHistoryPage(1); // Reset về trang 1 khi chuyển tab
                setSearchQuery(''); // Reset search query
              }}
            >
              <Text style={historySubTab === 'scheduled' ? styles.activeSubTabText : styles.subTabText}>
                📅 Dự kiến tiêm
              </Text>
            </TouchableOpacity>
          </View>

          {/* Vaccination History List */}
          <View style={styles.vaccineList}>
            {historySubTab === 'completed' && (
              <View style={styles.sectionContainer}>
                {(() => {
                  // Lọc vaccine theo search query
                  const completedVaccines = vaccineHistory.filter(vaccine => {
                    if (vaccine.status !== 'Completed') return false;
                    
                    if (!searchQuery.trim()) return true;
                    
                    const query = searchQuery.toLowerCase().trim();
                    const vaccineObj = vaccines.find(v => v.vaccineId === vaccine.vaccineId);
                    const diseaseObj = diseases.find(d => d.diseaseId === vaccine.diseaseId);
                    const facilityObj = facilities.find(f => f.facilityId === vaccine.facilityId);
                    
                    // Tìm kiếm theo tên vaccine
                    if (vaccineObj?.name?.toLowerCase().includes(query)) return true;
                    
                    // Tìm kiếm theo tên bệnh
                    if (diseaseObj?.name?.toLowerCase().includes(query)) return true;
                    
                    // Tìm kiếm theo tên cơ sở
                    if (facilityObj?.facilityName?.toLowerCase().includes(query)) return true;
                    
                    // Tìm kiếm theo ghi chú
                    if (vaccine.note?.toLowerCase().includes(query)) return true;
                    
                    // Tìm kiếm theo ngày tiêm
                    if (vaccine.actualDate?.toLowerCase().includes(query)) return true;
                    
                    return false;
                  });
                  
                  const totalPages = Math.ceil(completedVaccines.length / historyPerPage);
                  const startIndex = (historyPage - 1) * historyPerPage;
                  const endIndex = startIndex + historyPerPage;
                  const currentVaccines = completedVaccines.slice(startIndex, endIndex);
                  
                  return (
                    <>
                      {currentVaccines.length === 0 ? (
                        <Text style={styles.emptyText}>Chưa có mũi tiêm nào được hoàn thành</Text>
                      ) : (
                        currentVaccines.map(vaccine => {
                          const vaccineObj = vaccines.find(v => v.vaccineId === vaccine.vaccineId);
                          const diseaseObj = diseases.find(d => d.diseaseId === vaccine.diseaseId);
                          const facilityObj = facilities.find(f => f.facilityId === vaccine.facilityId);

                          return (
                            <View key={vaccine.vaccineProfileId} style={styles.vaccineItem}>
                              <MaterialIcons name="check-circle" size={24} color="#28a745" style={styles.checkIcon} />
                              <View style={styles.vaccineDetails}>
                                <Text style={styles.vaccineName}>{vaccineObj ? vaccineObj.name : `Vaccine ID: ${vaccine.vaccineId}`}</Text>
                                <Text style={{ color: '#28a745', fontWeight: 'bold', marginBottom: 5 }}>
                                  Mũi số {vaccine.doseNum} - Đã hoàn thành
                                </Text>
                                <Text style={styles.vaccineDescription}>{diseaseObj ? diseaseObj.name : `Disease ID: ${vaccine.diseaseId}`}</Text>
                                <View style={styles.detailRow}>
                                  <MaterialIcons name="access-time" size={16} color="gray" />
                                  <Text style={styles.detailText}>Ngày tiêm: {vaccine.actualDate}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                  <MaterialIcons name="location-on" size={16} color="gray" />
                                  <Text style={styles.detailText}>Cơ sở: {facilityObj ? facilityObj.facilityName : (vaccine.facilityId ? `ID ${vaccine.facilityId}` : 'Chưa xác định')}</Text>
                                </View>
                                {vaccine.note && (
                                  <View style={styles.detailRow}>
                                    <MaterialIcons name="info-outline" size={16} color="gray" />
                                    <Text style={styles.detailText}>Ghi chú: {vaccine.note}</Text>
                                  </View>
                                )}
                              </View>
                            </View>
                          );
                        })
                      )}
                      
                      {/* Pagination for Completed Vaccines */}
                      {completedVaccines.length > 0 && totalPages > 1 && (
                        <View style={styles.paginationContainer}>
                          <TouchableOpacity
                            style={[
                              styles.paginationButton,
                              historyPage === 1 && styles.paginationButtonDisabled
                            ]}
                            onPress={() => setHistoryPage(prev => Math.max(1, prev - 1))}
                            disabled={historyPage === 1}
                          >
                            <Text style={styles.paginationText}>Trước</Text>
                          </TouchableOpacity>
                          
                          <Text style={styles.paginationText}>
                            Trang {historyPage} / {totalPages}
                          </Text>
                          
                          <TouchableOpacity
                            style={[
                              styles.paginationButton,
                              historyPage === totalPages && styles.paginationButtonDisabled
                            ]}
                            onPress={() => setHistoryPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={historyPage === totalPages}
                          >
                            <Text style={styles.paginationText}>Sau</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </>
                  );
                })()}
              </View>
            )}

            {historySubTab === 'scheduled' && (
              <View style={styles.sectionContainer}>
                {(() => {
                  // Lọc vaccine theo search query
                  const scheduledVaccines = vaccineHistory.filter(vaccine => {
                    if (vaccine.status !== 'Scheduled') return false;
                    
                    if (!searchQuery.trim()) return true;
                    
                    const query = searchQuery.toLowerCase().trim();
                    const vaccineObj = vaccines.find(v => v.vaccineId === vaccine.vaccineId);
                    const diseaseObj = diseases.find(d => d.diseaseId === vaccine.diseaseId);
                    
                    // Tìm kiếm theo tên vaccine
                    if (vaccineObj?.name?.toLowerCase().includes(query)) return true;
                    
                    // Tìm kiếm theo tên bệnh
                    if (diseaseObj?.name?.toLowerCase().includes(query)) return true;
                    
                    // Tìm kiếm theo ghi chú
                    if (vaccine.note?.toLowerCase().includes(query)) return true;
                    
                    // Tìm kiếm theo ngày dự kiến
                    if (vaccine.expectedDate?.toLowerCase().includes(query)) return true;
                    
                    // Tìm kiếm theo priority
                    if (vaccine.priority?.toLowerCase().includes(query)) return true;
                    
                    return false;
                  });
                  
                  const totalPages = Math.ceil(scheduledVaccines.length / historyPerPage);
                  const startIndex = (historyPage - 1) * historyPerPage;
                  const endIndex = startIndex + historyPerPage;
                  const currentVaccines = scheduledVaccines.slice(startIndex, endIndex);
                  
                  return (
                    <>
                      {currentVaccines.length === 0 ? (
                        <Text style={styles.emptyText}>Không có lịch tiêm dự kiến</Text>
                      ) : (
                        currentVaccines.map(vaccine => {
                          const vaccineObj = vaccines.find(v => v.vaccineId === vaccine.vaccineId);
                          const diseaseObj = diseases.find(d => d.diseaseId === vaccine.diseaseId);

                          return (
                            <View key={vaccine.vaccineProfileId} style={styles.packageCard}>
                              {/* Header với icon và tên vaccine */}
                              <View style={styles.packageHeader}>
                                <MaterialIcons name="vaccines" size={24} color="#007bff" />
                                <Text style={styles.packageTitle}>
                                  {vaccineObj ? vaccineObj.name : `Vaccine ${vaccine.vaccineId}`}
                                </Text>
                                {/* Status indicator */}
                                <View style={[
                                  styles.statusBadge, 
                                  vaccine.status === 'Pending' ? styles.statusPending : styles.statusScheduled
                                ]}>
                                  <Text style={styles.statusText}>
                                    {vaccine.status === 'Pending' ? 'Chờ xác nhận' : 'Đã lên lịch'}
                                  </Text>
                                </View>
                              </View>

                              {/* Chi tiết vaccine */}
                              <View style={styles.vaccineDetailItem}>
                                <MaterialIcons name="schedule" size={20} color="#ffc107" />
                                <View style={styles.vaccineTextContainer}>
                                  <Text style={styles.vaccineShotName}>
                                    {diseaseObj ? diseaseObj.name : `Disease ${vaccine.diseaseId}`} - Mũi {vaccine.doseNum}
                                  </Text>
                                  <Text style={styles.vaccineDiseases}>
                                    {vaccine.priority} - {vaccine.isRequired ? 'Bắt buộc' : 'Tùy chọn'}
                                  </Text>
                                </View>
                                <Text style={styles.vaccineDate}>{vaccine.expectedDate}</Text>
                                <MaterialIcons name="schedule" size={16} color="gray" />
                              </View>

                              {/* Gợi ý tiêm tiếp */}
                              <Text style={styles.vaccineDiseases}>
                                Gợi ý tiêm tiếp: {vaccine.expectedDate}
                              </Text>

                              {/* Nút đặt lịch */}
                              <TouchableOpacity 
                                style={styles.scheduleButton}
                                onPress={() => navigation.navigate('ReBook', {
                                  vaccine: vaccine,
                                  child: selectedChild,
                                  childVaccineProfileId: vaccine.vaccineProfileId
                                })}
                              >
                                <Text style={styles.scheduleButtonText}>ĐẶT LỊCH MŨI TIÊM THEO</Text>
                                <MaterialIcons name="arrow-forward" size={16} color="#fff" />
                              </TouchableOpacity>

                              {/* Thông tin bổ sung */}
                              {vaccine.note && (
                                <View style={styles.suggestionRow}>
                                  <MaterialIcons name="info-outline" size={16} color="#007bff" />
                                  <Text style={styles.suggestionText}>Ghi chú: {vaccine.note}</Text>
                                </View>
                              )}
                            </View>
                          );
                        })
                      )}
                      
                      {/* Pagination for Scheduled Vaccines */}
                      {scheduledVaccines.length > 0 && totalPages > 1 && (
                        <View style={styles.paginationContainer}>
                          <TouchableOpacity
                            style={[
                              styles.paginationButton,
                              historyPage === 1 && styles.paginationButtonDisabled
                            ]}
                            onPress={() => setHistoryPage(prev => Math.max(1, prev - 1))}
                            disabled={historyPage === 1}
                          >
                            <Text style={styles.paginationText}>Trước</Text>
                          </TouchableOpacity>
                          
                          <Text style={styles.paginationText}>
                            Trang {historyPage} / {totalPages}
                          </Text>
                          
                          <TouchableOpacity
                            style={[
                              styles.paginationButton,
                              historyPage === totalPages && styles.paginationButtonDisabled
                            ]}
                            onPress={() => setHistoryPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={historyPage === totalPages}
                          >
                            <Text style={styles.paginationText}>Sau</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </>
                  );
                })()}
              </View>
            )}
          </View>
        </>
      )}

      {activeTab === 'tracking' && selectedChild && (
        <>
          {/* Status Filter for Tracking */}
          <View style={styles.statusFilterContainer}>
            <Text style={styles.filterTitle}>Lọc theo trạng thái:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScrollView}>
                             <TouchableOpacity
                 style={[
                   styles.filterChip,
                   trackingStatusFilter === 'all' && styles.activeFilterChip
                 ]}
                 onPress={() => {
                   setTrackingStatusFilter('all');
                   setTrackingPage(1); // Reset về trang 1
                 }}
               >
                 <Text style={[
                   styles.filterChipText,
                   trackingStatusFilter === 'all' && styles.activeFilterChipText
                 ]}>Tất cả</Text>
               </TouchableOpacity>
               <TouchableOpacity
                 style={[
                   styles.filterChip,
                   trackingStatusFilter === 'Completed' && styles.activeFilterChip
                 ]}
                 onPress={() => {
                   setTrackingStatusFilter('Completed');
                   setTrackingPage(1); // Reset về trang 1
                 }}
               >
                 <Text style={[
                   styles.filterChipText,
                   trackingStatusFilter === 'Completed' && styles.activeFilterChipText
                 ]}>✅ Hoàn thành</Text>
               </TouchableOpacity>
               <TouchableOpacity
                 style={[
                   styles.filterChip,
                   trackingStatusFilter === 'Pending' && styles.activeFilterChip
                 ]}
                 onPress={() => {
                   setTrackingStatusFilter('Pending');
                   setTrackingPage(1); // Reset về trang 1
                 }}
               >
                 <Text style={[
                   styles.filterChipText,
                   trackingStatusFilter === 'Pending' && styles.activeFilterChipText
                 ]}>⏳ Chờ xác nhận</Text>
               </TouchableOpacity>
               <TouchableOpacity
                 style={[
                   styles.filterChip,
                   trackingStatusFilter === 'Canceled' && styles.activeFilterChip
                 ]}
                 onPress={() => {
                   setTrackingStatusFilter('Canceled');
                   setTrackingPage(1); // Reset về trang 1
                 }}
               >
                 <Text style={[
                   styles.filterChipText,
                   trackingStatusFilter === 'Canceled' && styles.activeFilterChipText
                 ]}>❌ Đã hủy</Text>
               </TouchableOpacity>
            </ScrollView>
          </View>

                     <View style={styles.trackingPackagesList}>
             {(() => {
               const filteredAppointments = trackingStatusFilter === 'all' 
                 ? appointmentHistory 
                 : appointmentHistory.filter(app => app.status === trackingStatusFilter);
               
               // Lọc bỏ những lịch hẹn đã qua thời gian
               const validAppointments = filteredAppointments.filter(app => 
                 app.timeUntilAppointment !== 'Đã qua'
               );
               
               // Sắp xếp: Pending lên đầu, sau đó theo thời gian gần nhất
               const sortedAppointments = validAppointments.sort((a, b) => {
                 // Ưu tiên status Pending lên đầu
                 if (a.status === 'Pending' && b.status !== 'Pending') return -1;
                 if (a.status !== 'Pending' && b.status === 'Pending') return 1;
                 
                 // Nếu cả hai đều Pending hoặc không Pending, sắp xếp theo thời gian
                 if (a.timeUntilAppointment && b.timeUntilAppointment) {
                   // Trích xuất số giờ hoặc ngày từ timeUntilAppointment
                   const getTimeValue = (timeStr) => {
                     // Kiểm tra "ngày nữa" trước
                     const dayMatch = timeStr.match(/(\d+)\s*ngày/);
                     if (dayMatch) return parseInt(dayMatch[1]) * 24; // Chuyển ngày thành giờ
                     
                     // Kiểm tra "giờ nữa"
                     const hourMatch = timeStr.match(/(\d+)\s*giờ/);
                     if (hourMatch) return parseInt(hourMatch[1]);
                     
                     return Infinity;
                   };
                   
                   const timeA = getTimeValue(a.timeUntilAppointment);
                   const timeB = getTimeValue(b.timeUntilAppointment);
                   
                   // Sắp xếp theo thời gian gần nhất (số giờ nhỏ nhất lên đầu)
                   return timeA - timeB;
                 }
                 
                 return 0;
               });
               
               // Tính toán phân trang
               const totalPages = Math.ceil(sortedAppointments.length / trackingPerPage);
               const startIndex = (trackingPage - 1) * trackingPerPage;
               const endIndex = startIndex + trackingPerPage;
               const currentAppointments = sortedAppointments.slice(startIndex, endIndex);
               
               return (
                 <>
                   {currentAppointments.length === 0 ? (
                     <Text style={{ color: '#888', textAlign: 'center', marginTop: 20 }}>
                       {trackingStatusFilter === 'all' ? 'Không có lịch hẹn nào' : `Không có lịch hẹn ${trackingStatusFilter === 'Completed' ? 'hoàn thành' : trackingStatusFilter === 'Pending' ? 'chờ xác nhận' : 'đã hủy'}`}
                     </Text>
                   ) : (
                     currentAppointments.map(app => (
                       <View key={app.appointmentId} style={styles.packageCard}>
                         <View style={styles.packageHeader}>
                           <MaterialIcons name="archive" size={24} color="#007bff" />
                           <Text style={styles.packageTitle}>{app.packageName || app.vaccineNames?.join(', ') || 'Lịch tiêm lẻ'}</Text>
                           {app.status === 'Pending' && (
                             <TouchableOpacity
                               style={{ marginLeft: 40 }}
                               onPress={() => {
                                 Alert.alert(
                                   'Xác nhận hủy',
                                   'Bạn có chắc muốn hủy lịch hẹn này?',
                                   [
                                     { text: 'Không', style: 'cancel' },
                                     {
                                       text: 'Có',
                                       style: 'destructive',
                                       onPress: async () => {
                                         try {
                                           await appointmentApi.cancelAppointment(app.appointmentId, '', token);
                                           Alert.alert('Hủy thành công', 'Lịch hẹn đã được hủy!');
                                           const res = await appointmentApi.getMyAppointmentHistory(selectedChildId, token);
                                           setAppointmentHistory(res.data?.appointments || []);
                                         } catch (e) {
                                           Alert.alert('Hủy thất bại', 'Không thể hủy lịch hẹn.');
                                         }
                                       }
                                     }
                                   ]
                                 );
                               }}
                             >
                               <FontAwesomeIcon icon={faTrash} size={20} color="#ff4444" />
                             </TouchableOpacity>
                           )}
                         </View>
                         <Text style={styles.vaccineDiseases}>Cơ sở: {app.facilityName} - {app.facilityAddress}</Text>
                         <Text style={styles.vaccineDiseases}>Ngày: {app.appointmentDate} - Giờ: {app.appointmentTime}</Text>
                         <Text style={styles.vaccineDiseases}>Trạng thái: {app.status}</Text>
                         <Text style={styles.vaccineDiseases}>Chi phí dự kiến: {app.estimatedCost?.toLocaleString('vi-VN')}đ</Text>
                         {app.note && <Text style={styles.vaccineDiseases}>Ghi chú: {app.note}</Text>}
                         {app.timeUntilAppointment && (
                           <Text style={styles.vaccineDiseases}>{app.timeUntilAppointment}</Text>
                         )}
                       </View>
                     ))
                   )}
                   
                   {/* Pagination for Tracking */}
                   {sortedAppointments.length > 0 && totalPages > 1 && (
                     <View style={styles.paginationContainer}>
                       <TouchableOpacity
                         style={[
                           styles.paginationButton,
                           trackingPage === 1 && styles.paginationButtonDisabled
                         ]}
                         onPress={() => setTrackingPage(prev => Math.max(1, prev - 1))}
                         disabled={trackingPage === 1}
                       >
                         <Text style={styles.paginationText}>Trước</Text>
                       </TouchableOpacity>
                       
                       <Text style={styles.paginationText}>
                         Trang {trackingPage} / {totalPages}
                       </Text>
                       
                       <TouchableOpacity
                         style={[
                           styles.paginationButton,
                           trackingPage === totalPages && styles.paginationButtonDisabled
                         ]}
                         onPress={() => setTrackingPage(prev => Math.min(totalPages, prev + 1))}
                         disabled={trackingPage === totalPages}
                       >
                         <Text style={styles.paginationText}>Sau</Text>
                       </TouchableOpacity>
                     </View>
                   )}
                 </>
               );
             })()}
           </View>
        </>
      )}
    </ ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  userAge: {
    fontSize: 14,
    color: 'gray',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
  },
  activeTab: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#007bff',
  },
  tabText: {
    fontSize: 16,
    color: 'gray',
  },
  activeTabText: {
    fontSize: 16,
    color: '#007bff',
    fontWeight: 'bold',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    margin: 15,
    padding: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
  },
  filters: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  vaccineList: {
    flex: 1,
    paddingHorizontal: 15,
  },
  vaccineItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  checkIcon: {
    marginRight: 10,
    marginTop: 3,
  },
  vaccineDetails: {
    flex: 1,
  },
  vaccineName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  vaccineDescription: {
    fontSize: 14,
    color: 'gray',
    marginBottom: 5,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  detailText: {
    fontSize: 13,
    color: 'gray',
    marginLeft: 5,
  },
  childInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    justifyContent: 'space-between',
  },
  childInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownToggle: {
    paddingHorizontal: 10,
  },
  dropdownContainer: {
    backgroundColor: '#fff',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginHorizontal: 15,
    marginBottom: 10,
    marginTop: -15, // To overlap with the section above
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dropdownItemImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  dropdownItemTextContainer: {
    flex: 1,
  },
  dropdownItemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  dropdownItemAge: {
    fontSize: 12,
    color: '#555',
  },
  selectedIcon: {
    color: 'green',
    fontSize: 16,
    marginLeft: 10,
  },
  packageCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  packageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  packageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
    flex: 1,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 5,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#007bff',
    borderRadius: 5,
  },
  progressText: {
    fontSize: 14,
    color: 'gray',
    marginBottom: 15,
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
  },
  vaccineDiseases: {
    fontSize: 14,
    color: 'gray',
  },
  vaccineDate: {
    fontSize: 14,
    color: 'gray',
    marginRight: 5,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  suggestionText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#007bff',
    fontWeight: 'bold',
  },
  scheduleButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  scheduleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 5,
  },
  trackingPackagesList: {
    flex: 1,
    paddingVertical: 15,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    paddingHorizontal: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#007bff',
    paddingLeft: 10,
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    fontStyle: 'italic',
    marginVertical: 20,
    fontSize: 14,
  },
  subTabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 8,
    padding: 4,
  },
  subTab: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeSubTab: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  subTabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeSubTabText: {
    fontSize: 14,
    color: '#007bff',
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusScheduled: {
    backgroundColor: '#28a745',
  },
  statusPending: {
    backgroundColor: '#ffc107',
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  statusFilterContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  filterScrollView: {
    flexDirection: 'row',
  },
  filterChip: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  activeFilterChip: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  filterChipText: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '500',
  },
  activeFilterChipText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 15,
  },
  paginationButton: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007bff',
    backgroundColor: '#fff',
    marginHorizontal: 10,
  },
  paginationButtonDisabled: {
    borderColor: '#ccc',
    backgroundColor: '#f8f9fa',
  },
  paginationText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginHorizontal: 15,
  },
});

export default HistoryVacc; 