import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Image, Alert, Modal } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft, faChevronDown, faSearch, faStar, faStarHalfAlt, faCalendarAlt, faChevronLeft, faChevronRight, faMapMarkerAlt, faPhone, faEnvelope, faShoppingCart, faTrash, faPlus, faMinus, faTimes, faInfo, faShieldAlt } from '@fortawesome/free-solid-svg-icons';
import { useDispatch, useSelector } from 'react-redux';
import { getMyChildren } from '../store/api/growthRecordApi';
import diseasesApi from '../store/api/diseasesApi';
import vaccinationFacilitiesApi from '../store/api/vaccinationFacilitiesApi';
import vaccinePackagesApi from '../store/api/vaccinePackagesApi';
import vaccinesApi from '../store/api/vaccinesApi';
import { addToCart, selectCartItems, selectCartItemCount, clearCart } from '../store/cartSlice';
import scheduleApi from '../store/api/scheduleApi';
import dayjs from 'dayjs';
import bookingApi from '../store/api/bookingApi';
import orderApi from '../store/api/orderApi';

const Booking = ({ navigation, route }) => {
  const [children, setChildren] = useState([]);
  const [selectedChildren, setSelectedChildren] = useState([]);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  // Disease state
  const [diseases, setDiseases] = useState([]);
  const [filteredDiseases, setFilteredDiseases] = useState([]);
  const [isDiseaseDropdownVisible, setIsDiseaseDropdownVisible] = useState(false);
  const [selectedDisease, setSelectedDisease] = useState(null);
  const [diseaseSearchText, setDiseaseSearchText] = useState('');

  // Facility state
  const [facilities, setFacilities] = useState([]);
  const [filteredFacilities, setFilteredFacilities] = useState([]);
  const [isFacilityDropdownVisible, setIsFacilityDropdownVisible] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [facilitySearchText, setFacilitySearchText] = useState('');

  // Vaccine lẻ state
  const [facilityVaccines, setFacilityVaccines] = useState([]);
  const [filteredFacilityVaccines, setFilteredFacilityVaccines] = useState([]);
  const [selectedSingleVaccine, setSelectedSingleVaccine] = useState(null); // Vaccine lẻ được chọn

  // Vaccine Package state
  const [vaccinePackages, setVaccinePackages] = useState([]);
  const [filteredPackages, setFilteredPackages] = useState([]);
  const [vaccines, setVaccines] = useState([]);
  const [selectedPackageId, setSelectedPackageId] = useState(null);
  const [expandedPackageId, setExpandedPackageId] = useState(null);

  // Thêm state cho ngày, slot và token
  const [selectedDate, setSelectedDate] = useState(null); // Ngày người dùng chọn
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const token = useSelector(state => state.auth.token);
  const [note, setNote] = useState('');

  // State cho calendar động
  const [calendarMonth, setCalendarMonth] = useState(dayjs().month() + 1); // 1-12
  const [calendarYear, setCalendarYear] = useState(dayjs().year());

  // Redux hooks
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);
  const cartItemCount = useSelector(selectCartItemCount);

  const orderId = route?.params?.orderId; // Lấy orderId từ params nếu có

  // Lấy danh sách trẻ từ API khi vào màn hình
  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const res = await getMyChildren();
        setChildren(res);
        if (res.length > 0) {
          setSelectedChildren([res[0].childId]);
        }
      } catch (e) {
        setChildren([]);
      }
    };
    fetchChildren();
  }, []);

  // Lấy danh sách bệnh từ API
  useEffect(() => {
    const fetchDiseases = async () => {
      try {
        const res = await diseasesApi.getAllDiseases();
        const data = res.data || [];
        setDiseases(data);
        setFilteredDiseases(data);
      } catch (e) {
        setDiseases([]);
        setFilteredDiseases([]);
      }
    };
    fetchDiseases();
  }, []);

  // Lấy danh sách cơ sở tiêm chủng từ API
  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const res = await vaccinationFacilitiesApi.getVaccinationFacilities(1, 50); // Lấy 50 facilities
        const data = res.data || [];
        setFacilities(data);
        setFilteredFacilities(data);
      } catch (e) {
        setFacilities([]);
        setFilteredFacilities([]);
      }
    };
    fetchFacilities();
  }, []);

  // Lấy danh sách vaccine (để mapping vaccineId -> diseaseId)
  useEffect(() => {
    const fetchVaccines = async () => {
      try {
        const res = await vaccinesApi.getAllVaccines();
        setVaccines(res.data || []);
      } catch (e) {
        setVaccines([]);
      }
    };
    fetchVaccines();
  }, []);

  // Lấy danh sách package khi đã chọn cơ sở và bệnh
  useEffect(() => {
    const fetchPackages = async () => {
      if (!selectedFacility || !selectedDisease) {
        setFilteredPackages([]);
        return;
      }
      try {
        const res = await vaccinePackagesApi.getAllVaccinePackages();
        const allPackages = res.data || [];
        // Lọc theo facilityId
        const facilityPackages = allPackages.filter(pkg => pkg.facilityId === selectedFacility.facilityId);
        // Lọc package có ít nhất 1 vaccine liên quan đến disease đã chọn
        let matchedPackages = facilityPackages.filter(pkg =>
          pkg.packageVaccines && pkg.packageVaccines.some(pv => pv.diseaseId === selectedDisease.diseaseId)
        );
        
        setFilteredPackages(matchedPackages);
      } catch (e) {
        setFilteredPackages([]);
      }
    };
    fetchPackages();
  }, [selectedFacility, selectedDisease]);

  // Lấy slot lịch tiêm khi chọn cơ sở, ngày, token
  useEffect(() => {
    const fetchSlots = async () => {
      if (selectedFacility && selectedDate && token) {
        try {
          const res = await scheduleApi.getFacilitySchedules(
            selectedFacility.facilityId,
            selectedDate,
            selectedDate,
            token
          );
          const slots = res.data?.dailySchedules?.[0]?.availableSlots || [];
          setAvailableSlots(slots);
        } catch (e) {
          setAvailableSlots([]);
        }
      } else {
        setAvailableSlots([]);
      }
    };
    fetchSlots();
  }, [selectedFacility, selectedDate, token]);

  // Lấy vaccine lẻ theo cơ sở và bệnh
  useEffect(() => {
    const fetchFacilityVaccines = async () => {
      if (!selectedFacility || !selectedDisease || !token) {
        setFacilityVaccines([]);
        setFilteredFacilityVaccines([]);
        return;
      }
      try {
        const res = await vaccinesApi.getFacilityVaccines(selectedFacility.facilityId, token);
        const allVaccines = res.data?.data || [];
        setFacilityVaccines(allVaccines);
        
        // Lọc vaccine liên quan đến disease đã chọn
        let filtered = allVaccines.filter(fv =>
          fv.vaccine && fv.vaccine.diseases &&
          fv.vaccine.diseases.some(d => String(d.diseaseId) === String(selectedDisease.diseaseId))
        );
        
        setFilteredFacilityVaccines(filtered);
      } catch (e) {
        setFacilityVaccines([]);
        setFilteredFacilityVaccines([]);
      }
    };
    fetchFacilityVaccines();
  }, [selectedFacility, selectedDisease, token]);

  // Function to normalize Vietnamese text for search
  const normalizeVietnameseText = (text) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[đ]/g, 'd')
      .replace(/[Đ]/g, 'D');
  };

  // Function to handle disease search
  const handleDiseaseSearch = (searchText) => {
    setDiseaseSearchText(searchText);
    if (!searchText.trim()) {
      setFilteredDiseases(diseases);
      return;
    }

    const normalizedSearch = normalizeVietnameseText(searchText);
    const filtered = diseases.filter(disease => {
      const normalizedName = normalizeVietnameseText(disease.name);
      return normalizedName.includes(normalizedSearch);
    });
    setFilteredDiseases(filtered);
  };

  // Function to handle facility search
  const handleFacilitySearch = (searchText) => {
    setFacilitySearchText(searchText);
    if (!searchText.trim()) {
      setFilteredFacilities(facilities);
      return;
    }

    const normalizedSearch = normalizeVietnameseText(searchText);
    const filtered = facilities.filter(facility => {
      const normalizedName = normalizeVietnameseText(facility.facilityName);
      const normalizedAddress = normalizeVietnameseText(facility.address);
      return normalizedName.includes(normalizedSearch) || normalizedAddress.includes(normalizedSearch);
    });
    setFilteredFacilities(filtered);
  };

  // Function to calculate age in months from date of birth
  const calculateAgeInMonths = (dateOfBirth) => {
    if (!dateOfBirth) return 0;
    const today = dayjs();
    const birthDate = dayjs(dateOfBirth);
    return today.diff(birthDate, 'month');
  };

  // Function to parse age group string and return minimum age in months
  const parseAgeGroup = (ageGroup) => {
    if (!ageGroup) return 0;
    
    const ageStr = ageGroup.toLowerCase().trim();
    
    // Handle "từ x tháng", "x tháng trở lên", "x tháng+"
    const monthMatch = ageStr.match(/(\d+)\s*tháng/);
    if (monthMatch) {
      return parseInt(monthMatch[1]);
    }
    
    // Handle "từ x tuổi", "x tuổi trở lên", "x tuổi+"
    const yearMatch = ageStr.match(/(\d+)\s*tuổi/);
    if (yearMatch) {
      return parseInt(yearMatch[1]) * 12; // Convert years to months
    }
    
    // Handle "từ x năm", "x năm trở lên"
    const ageInYearMatch = ageStr.match(/(\d+)\s*năm/);
    if (ageInYearMatch) {
      return parseInt(ageInYearMatch[1]) * 12; // Convert years to months
    }
    
    // Handle special cases like "sơ sinh", "từ sinh"
    if (ageStr.includes('sơ sinh') || ageStr.includes('từ sinh')) {
      return 0;
    }
    
    return 0; // Default to 0 if can't parse
  };

  // Function to check if vaccine is age-appropriate for child
  const isVaccineAgeAppropriate = (vaccine, childAgeInMonths) => {
    if (!vaccine || !vaccine.ageGroup) return true; // If no age group specified, assume appropriate
    
    const minAgeInMonths = parseAgeGroup(vaccine.ageGroup);
    return childAgeInMonths >= minAgeInMonths;
  };

  // Function to get minimum age group from package vaccines
  const getPackageMinimumAge = (packageVaccines) => {
    if (!packageVaccines || packageVaccines.length === 0) return 0;
    
    let minAge = Infinity;
    packageVaccines.forEach(pv => {
      if (pv.facilityVaccine?.vaccine?.ageGroup) {
        const ageInMonths = parseAgeGroup(pv.facilityVaccine.vaccine.ageGroup);
        if (ageInMonths < minAge) {
          minAge = ageInMonths;
        }
      }
    });
    
    return minAge === Infinity ? 0 : minAge;
  };

  // Function to check if package is age-appropriate for child
  const isPackageAgeAppropriate = (packageItem, childAgeInMonths) => {
    if (!packageItem.packageVaccines || packageItem.packageVaccines.length === 0) return true;
    
    const minRequiredAge = getPackageMinimumAge(packageItem.packageVaccines);
    return childAgeInMonths >= minRequiredAge;
  };

  // Function to format age group for display
  const formatAgeGroup = (ageInMonths) => {
    if (ageInMonths === 0) return "Từ sơ sinh";
    if (ageInMonths < 12) return `Từ ${ageInMonths} tháng tuổi`;
    const years = Math.floor(ageInMonths / 12);
    const months = ageInMonths % 12;
    if (months === 0) return `Từ ${years} tuổi`;
    return `Từ ${years} tuổi ${months} tháng`;
  };

  // Function to handle disease selection
  const handleSelectDisease = (disease) => {
    setSelectedDisease(disease);
    setIsDiseaseDropdownVisible(false);
    setDiseaseSearchText('');
    setFilteredDiseases(diseases);
    // Reset vaccine lẻ được chọn khi thay đổi bệnh
    setSelectedSingleVaccine(null);
  };

  // Function to handle facility selection
  const handleSelectFacility = (facility) => {
    setSelectedFacility(facility);
    setIsFacilityDropdownVisible(false);
    setFacilitySearchText('');
    setFilteredFacilities(facilities);
    // Reset vaccine lẻ được chọn khi thay đổi cơ sở
    setSelectedSingleVaccine(null);
  };

  // Function to handle the dropdown press
  const handleSelectChildPress = () => {
    setIsDropdownVisible(!isDropdownVisible);
  };

  // Function to handle selecting a child from the dropdown
  const handleSelectChild = (childId) => {
    setSelectedChildren([childId]);
    setIsDropdownVisible(false);
    // Reset vaccine lẻ được chọn khi thay đổi trẻ
    setSelectedSingleVaccine(null);
  };

  const selectedChild = children.find(child => child.childId === selectedChildren[0]);

  // Cart functions
  const handleAddToCart = (packageItem) => {
    // Kiểm tra xem đã có vaccine lẻ được chọn chưa
    if (selectedSingleVaccine) {
      Alert.alert('Thông báo', 'Bạn đã chọn vaccine lẻ. Vui lòng bỏ chọn vaccine lẻ trước khi thêm gói tiêm!');
      return;
    }

    dispatch(addToCart(packageItem));
    // Reset vaccine lẻ được chọn khi thêm gói vào giỏ
    setSelectedSingleVaccine(null);
    Alert.alert('Thành công', 'Đã thêm gói tiêm vào giỏ hàng!');
  };

  // Function to handle single vaccine selection
  const handleSelectSingleVaccine = (facilityVaccine) => {
    // Kiểm tra xem đã có gói tiêm trong giỏ hàng chưa
    const hasPackageInCart = cartItems.some(item => item.packageId);
    if (hasPackageInCart) {
      Alert.alert('Thông báo', 'Bạn đã có gói tiêm trong giỏ hàng. Vui lòng xóa gói tiêm trước khi chọn vaccine lẻ!');
      return;
    }

    if (selectedSingleVaccine?.facilityVaccineId === facilityVaccine.facilityVaccineId) {
      // Nếu đã chọn rồi thì bỏ chọn
      setSelectedSingleVaccine(null);
    } else {
      // Chọn vaccine mới
      setSelectedSingleVaccine(facilityVaccine);
    }
  };

  const handleDecreaseCart = (packageItem) => {
    const cartItem = cartItems.find(item => item.packageId === packageItem.packageId);
    if (cartItem && cartItem.quantity > 1) {
      dispatch(addToCart({ ...packageItem, quantity: cartItem.quantity - 1 }));
      Alert.alert('Thành công', 'Đã giảm số lượng gói tiêm trong giỏ!');
    } else if (cartItem) {
      dispatch(addToCart({ ...packageItem, quantity: 1 })); // Remove from cart if quantity is 1
      Alert.alert('Thành công', 'Đã xóa gói tiêm khỏi giỏ!');
    }
  };

  // Helper: Số ngày trong tháng
  const getDaysInMonth = (month, year) => {
    return dayjs(`${year}-${month}-01`).daysInMonth();
  };
  // Helper: Hôm nay
  const today = dayjs();
  // Helper: Đầu tuần của tháng (0=CN, 1=T2...)
  const getFirstDayOfWeek = (month, year) => {
    return dayjs(`${year}-${month}-01`).day();
  };
  // Helper: So sánh ngày có phải quá khứ không
  const isPastDate = (year, month, day) => {
    const date = dayjs(`${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`);
    return date.isBefore(today, 'day');
  };

  const [expandedFacilityVaccineId, setExpandedFacilityVaccineId] = useState(null);
  const [selectedVaccineForModal, setSelectedVaccineForModal] = useState(null);
  const [isVaccineModalVisible, setIsVaccineModalVisible] = useState(false);

  // Function to show vaccine details modal
  const showVaccineDetails = (vaccine) => {
    setSelectedVaccineForModal(vaccine);
    setIsVaccineModalVisible(true);
  };

  // Function to close vaccine details modal
  const closeVaccineDetails = () => {
    setIsVaccineModalVisible(false);
    setSelectedVaccineForModal(null);
  };

  // Hàm đặt lịch
  const handleBookAppointment = async () => {
    if (!selectedChildren[0] || !selectedDisease || !selectedFacility || !selectedSlot) {
      Alert.alert('Thiếu thông tin', 'Vui lòng chọn đầy đủ bé, bệnh, cơ sở, ngày, giờ!');
      return;
    }

    // Kiểm tra có gói tiêm hoặc vaccine lẻ được chọn
    const packageItem = cartItems.find(item => item.packageId);
    if (!packageItem && !selectedSingleVaccine) {
      Alert.alert('Thiếu thông tin', 'Vui lòng chọn gói tiêm hoặc vaccine để đặt lịch!');
      return;
    }

    let data = {
      childId: selectedChildren[0],
      diseaseId: selectedDisease.diseaseId,
      facilityId: selectedFacility.facilityId,
      scheduleId: selectedSlot.scheduleId,
      note: note,
    };

    try {
      if (packageItem) {
        // 1. Tạo order trực tiếp cho gói tiêm
        const orderResponse = await orderApi.createOrder(packageItem, token);
        const orderId = orderResponse.data?.orderId;
        if (!orderId) throw new Error('Không lấy được orderId từ server!');
        data.orderId = orderId;
      } else if (selectedSingleVaccine) {
        // Nếu là vaccine lẻ được chọn
        data.facilityVaccineIds = [selectedSingleVaccine.facilityVaccineId];
      }

      // Log payload trước khi gửi API
      console.log('=== PAYLOAD BOOKING ===');
      console.log('Data:', data);
      console.log('Token:', token);
      console.log('Package Item:', packageItem);
      console.log('Selected Single Vaccine:', selectedSingleVaccine);
      console.log('Selected Children:', selectedChildren);
      console.log('Selected Disease:', selectedDisease);
      console.log('Selected Facility:', selectedFacility);
      console.log('Selected Slot:', selectedSlot);
      console.log('Note:', note);
      console.log('Cart Items:', cartItems);
      console.log('========================');

      const res = await bookingApi.bookAppointment(data, token);
      
      // Kiểm tra response từ server
      if (res.data && res.data.status === false) {
        // Nếu server trả về status false, hiển thị message từ server
        Alert.alert('Đặt lịch thất bại', res.data.message || 'Vui lòng thử lại!');
        return;
      }
      
      // Clear cart và vaccine đã chọn
      dispatch(clearCart());
      setSelectedSingleVaccine(null);
      
      Alert.alert('Đặt lịch thành công', 'Lịch tiêm đã được xác nhận!', [
        { text: 'OK', onPress: () => navigation.navigate('Home') }
      ]);
    } catch (e) {
      // Xử lý lỗi network hoặc lỗi khác
      let errorMessage = 'Vui lòng thử lại!';
      
      if (e.response && e.response.data && e.response.data.message) {
        // Lấy message từ response error
        errorMessage = e.response.data.message;
      } else if (e.message) {
        // Lấy message từ error object
        errorMessage = e.message;
      }
      
      Alert.alert('Đặt lịch thất bại', errorMessage);
    }
  };

  // Function to calculate age from date of birth
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'Chưa có thông tin tuổi';
    
    const today = dayjs();
    const birthDate = dayjs(dateOfBirth);
    
    const years = today.diff(birthDate, 'year');
    const months = today.diff(birthDate.add(years, 'year'), 'month');
    
    if (years > 0) {
      if (months > 0) {
        return `${years} tuổi ${months} tháng`;
      }
      return `${years} tuổi`;
    } else if (months > 0) {
      return `${months} tháng tuổi`;
    } else {
      const days = today.diff(birthDate, 'day');
      return `${days} ngày tuổi`;
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' , padding: 20 }}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <FontAwesomeIcon icon={faArrowLeft} size={25} color="black" />
        </TouchableOpacity>
        <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', flex: 1 }}>Đặt lịch tiêm chủng</Text>
        <TouchableOpacity 
          style={styles.cartButton} 
          onPress={() => navigation.navigate('Cart')}
        >
          <FontAwesomeIcon icon={faShoppingCart} size={20} color="white" />
          {cartItemCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartItemCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Chọn Bé */}
      <Text style={styles.sectionTitle}>Chọn bé</Text>
      
      {/* Child Info and Dropdown */}
      <View style={styles.childInfoContainer}>
        <View style={styles.childInfo}>
          {/* Display profile image of the first selected child */}
          {selectedChildren.length > 0 && (
            <Image
              source={require('../../assets/vnvc.jpg')}
              style={styles.profileImage}
            />
          )}
          <View>
            {/* Display name of the first selected child */}
            {selectedChildren.length > 0 && (
              <>
                <Text style={styles.childName}>{selectedChild?.fullName}</Text>
                <Text style={styles.childAge}>{calculateAge(selectedChild?.birthDate)}</Text>
              </>
            )}
          </View>
        </View>

        {/* Dropdown icon nằm bên phải */}
        <TouchableOpacity style={styles.dropdownToggle} onPress={handleSelectChildPress}>
          <FontAwesomeIcon icon={faChevronDown} size={20} color="black" />
        </TouchableOpacity>
      </View>

      {/* Child Selection Dropdown */}
      {isDropdownVisible && (
        <View style={styles.dropdownContainer}>
          <ScrollView nestedScrollEnabled={true} style={styles.dropdownScroll}>
            {children.map(child => (
              <TouchableOpacity
                key={child.childId}
                style={styles.dropdownItem}
                onPress={() => handleSelectChild(child.childId)}
              >
                <Image
                  source={require('../../assets/vnvc.jpg')}
                  style={styles.dropdownItemImage}
                />
                <View style={styles.dropdownItemTextContainer}>
                  <Text style={styles.dropdownItemName}>{child.fullName}</Text>
                  <Text style={styles.dropdownItemAge}>{calculateAge(child.birthDate)}</Text>
                </View>
                {selectedChildren[0] === child.childId && <Text style={styles.selectedIcon}> ✅</Text>}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
                    <Text style={styles.sectionTitle}>Chọn cơ sở tiêm chủng</Text>
        <View style={styles.searchMoreContainer}>
         <TouchableOpacity
           style={styles.searchMoreButton}
           onPress={() => setIsFacilityDropdownVisible(!isFacilityDropdownVisible)}
         >
           <FontAwesomeIcon icon={faSearch} size={16} color="#007bff" style={styles.searchMoreIcon} />
           <Text style={styles.searchMoreText}>
             {selectedFacility ? 'Thay đổi cơ sở' : 'Tìm kiếm thêm cơ sở khác'}
           </Text>
           <FontAwesomeIcon icon={faChevronDown} size={15} color="gray" />
         </TouchableOpacity>

        {/* Facility Dropdown */}
        {isFacilityDropdownVisible && (
          <View style={styles.facilityDropdownContainer}>
            {/* Search Input */}
            <View style={styles.facilitySearchContainer}>
              <FontAwesomeIcon icon={faSearch} size={16} color="#888" style={styles.facilitySearchIcon} />
              <TextInput
                style={styles.facilitySearchInput}
                placeholder="Tìm kiếm cơ sở..."
                value={facilitySearchText}
                onChangeText={handleFacilitySearch}
                placeholderTextColor="#888"
              />
            </View>
            
            {/* Facility List */}
            <ScrollView nestedScrollEnabled={true} style={styles.facilityListContainer}>
              {filteredFacilities.length === 0 ? (
                <Text style={styles.noFacilityText}>Không tìm thấy cơ sở</Text>
              ) : (
                filteredFacilities.map(facility => (
                  <TouchableOpacity
                    key={facility.facilityId}
                    style={styles.facilityItem}
                    onPress={() => handleSelectFacility(facility)}
                  >
                    <View style={styles.facilityItemContent}>
                      <Text style={styles.facilityItemName}>{facility.facilityName}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                        <FontAwesomeIcon icon={faMapMarkerAlt} size={13} color="#888" style={{ marginRight: 4 }} />
                        <Text style={styles.facilityItemAddress}>{facility.address}</Text>
                      </View>
                      {facility.phone && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                          <FontAwesomeIcon icon={faPhone} size={13} color="#888" style={{ marginRight: 4 }} />
                          <Text style={styles.facilityItemPhone}>{facility.phone}</Text>
                        </View>
                      )}
                    </View>
                    {selectedFacility?.facilityId === facility.facilityId && (
                      <Text style={styles.selectedFacilityIcon}> ✅</Text>
                    )}
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        )}
      </View>
      
             {/* Popular Facilities - Only show when no facility is selected */}
       {!selectedFacility && (
         <View style={styles.popularFacilitiesContainer}>
           <Text style={styles.sectionTitle}>Các cơ sở tiêm chủng</Text>
           {facilities.slice(0, 3).map((facility) => (
             <TouchableOpacity
               key={facility.facilityId}
               style={styles.popularFacilityCardVertical}
               onPress={() => handleSelectFacility(facility)}
             >
               <Text style={styles.popularFacilityName}>{facility.facilityName}</Text>
               <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                 <FontAwesomeIcon icon={faMapMarkerAlt} size={13} color="#888" style={{ marginRight: 4 }} />
                 <Text style={styles.popularFacilityAddress}>{facility.address}</Text>
               </View>
               {facility.phone && (
                 <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                   <FontAwesomeIcon icon={faPhone} size={13} color="#888" style={{ marginRight: 4 }} />
                   <Text style={styles.popularFacilityPhone}>{facility.phone}</Text>
                 </View>
               )}
             </TouchableOpacity>
           ))}
         </View>
       )}
             {selectedFacility && (
        <View style={styles.selectedFacilityContainer}>
          <Text style={styles.selectedFacilityTitle}>Cơ sở đã chọn:</Text>
          <View style={styles.selectedFacilityCard}>
            <Text style={styles.selectedFacilityName}>{selectedFacility.facilityName}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
              <FontAwesomeIcon icon={faMapMarkerAlt} size={13} color="#007bff" style={{ marginRight: 4 }} />
              <Text style={styles.selectedFacilityAddress}>{selectedFacility.address}</Text>
            </View>
            {selectedFacility.phone && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
                <FontAwesomeIcon icon={faPhone} size={13} color="#007bff" style={{ marginRight: 4 }} />
                <Text style={styles.selectedFacilityPhone}>{selectedFacility.phone}</Text>
              </View>
            )}
          </View>
        </View>
      )}
       
      <Text style={[styles.sectionTitle, styles.diseaseSectionTitle]}>Chọn Bệnh Cần Tiêm</Text>
      
      {/* Disease Selection */}
      <View style={styles.diseaseSelectionContainer}>
        <TouchableOpacity
          style={styles.diseaseSelectButton}
          onPress={() => setIsDiseaseDropdownVisible(!isDiseaseDropdownVisible)}
        >
          <Text style={styles.diseaseSelectText}>
            {selectedDisease ? selectedDisease.name : 'Chọn bệnh cần tiêm phòng'}
          </Text>
          <FontAwesomeIcon icon={faChevronDown} size={15} color="gray" />
        </TouchableOpacity>

        {/* Disease Dropdown */}
        {isDiseaseDropdownVisible && (
          <View style={styles.diseaseDropdownContainer}>
            {/* Search Input */}
            <View style={styles.diseaseSearchContainer}>
              <FontAwesomeIcon icon={faSearch} size={16} color="#888" style={styles.diseaseSearchIcon} />
              <TextInput
                style={styles.diseaseSearchInput}
                placeholder="Tìm kiếm bệnh..."
                value={diseaseSearchText}
                onChangeText={handleDiseaseSearch}
                placeholderTextColor="#888"
              />
            </View>
            
            {/* Disease List */}
            <ScrollView nestedScrollEnabled={true} style={styles.diseaseListContainer}>
              {filteredDiseases.length === 0 ? (
                <Text style={styles.noDiseaseText}>Không tìm thấy bệnh</Text>
              ) : (
                filteredDiseases.map(disease => (
                  <TouchableOpacity
                    key={disease.diseaseId}
                    style={styles.diseaseItem}
                    onPress={() => handleSelectDisease(disease)}
                  >
                    <Text style={styles.diseaseItemText}>{disease.name}</Text>
                    {selectedDisease?.diseaseId === disease.diseaseId && (
                      <Text style={styles.selectedDiseaseIcon}> ✅</Text>
                    )}
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        )}
      </View>


      {/* Gói tiêm phù hợp */}
      <Text style={styles.sectionTitle}>Gói tiêm phù hợp</Text>
      {filteredPackages.length === 0 && filteredFacilityVaccines.length === 0 ? (
        <Text style={{ color: '#888', marginBottom: 10 }}>Không có gói/vaccine phù hợp</Text>
      ) : (
        <>
          {/* Vaccine package */}
          {filteredPackages.map(pkg => {
            const isInCart = cartItems.some(item => item.packageId === pkg.packageId);
            const isDisabled = selectedSingleVaccine && !isInCart;
            
            // Get package minimum age info for display
            const packageMinAge = getPackageMinimumAge(pkg.packageVaccines);
            
            const packageCartObj = {
              packageId: pkg.packageId,
              name: pkg.name,
              price: pkg.price,
              description: pkg.description,
              facilityId: pkg.facilityId, // thêm facilityId
              packageVaccines: pkg.packageVaccines, // thêm packageVaccines
            };
            const handleAddPackage = () => {
              if (!isInCart && !isDisabled) handleAddToCart(packageCartObj);
            };
            return (
              <View key={pkg.packageId} style={[
                styles.packageItem, 
                isInCart && styles.packageItemInCart,
                isDisabled && styles.packageItemDisabled
              ]}>
                <TouchableOpacity
                  onPress={() => setExpandedPackageId(expandedPackageId === pkg.packageId ? null : pkg.packageId)}
                  style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                  activeOpacity={0.8}
                >
                  <View style={styles.packageInfo}>
                    <Text style={[
                      styles.packageName, 
                      isInCart && styles.packageTextInCart,
                      isDisabled && styles.packageTextDisabled
                    ]}>{pkg.name}</Text>
                    <Text style={[
                      styles.packagePrice, 
                      isInCart && styles.packageTextInCart,
                      isDisabled && styles.packageTextDisabled
                    ]}>{pkg.price?.toLocaleString('vi-VN')}đ</Text>
                    {packageMinAge !== undefined && (
                      <Text style={[
                        styles.ageGroupText,
                        isInCart && styles.packageTextInCart,
                        isDisabled && styles.packageTextDisabled
                      ]}>
                        {formatAgeGroup(packageMinAge)}
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.addToCartButton, 
                      isInCart && styles.addToCartButtonInCart,
                      isDisabled && styles.addToCartButtonDisabled
                    ]}
                    onPress={handleAddPackage}
                    disabled={isInCart || isDisabled}
                  >
                    <Text style={[
                      styles.addToCartText, 
                      isInCart && styles.addToCartTextInCart,
                      isDisabled && styles.addToCartTextDisabled
                    ]}>
                      {isDisabled ? 'Không thể thêm' : (isInCart ? 'Đã thêm' : 'Thêm vào giỏ')}
                    </Text>
                  </TouchableOpacity>
                </TouchableOpacity>
                {expandedPackageId === pkg.packageId && (
                  <View style={{ marginTop: 8 }}>
                    <Text style={styles.packageDetails}>{pkg.description}</Text>
                    <Text style={{ fontWeight: 'bold', fontSize: 13, marginTop: 5 }}>Vaccine trong gói:</Text>
                    {pkg.packageVaccines && pkg.packageVaccines.length > 0 ? (
                      pkg.packageVaccines.map(pv => (
                        <View key={pv.packageVaccineId} style={{ marginBottom: 8, marginLeft: 5 }}>
                          <Text style={{ fontSize: 13, color: '#222', fontWeight: 'bold' }}>- Bệnh: {pv.disease?.name || 'Không rõ'}</Text>
                          <Text style={{ fontSize: 13, color: '#007bff' }}>  Vaccine: {pv.facilityVaccine?.vaccine?.name || 'Không rõ tên vaccine'}</Text>
                          {pv.disease?.description && (
                            <Text style={{ fontSize: 12, color: '#888', fontStyle: 'italic' }}>  Mô tả bệnh: {pv.disease.description}</Text>
                          )}
                          <Text style={{ fontSize: 12, color: '#888' }}>  Số lượng: {pv.quantity}</Text>
                          <Text style={{ fontSize: 12, color: '#888' }}>  Phác đồ: {pv.facilityVaccine?.vaccine?.numberOfDoses || 1} liều</Text>
                          <Text style={{ fontSize: 12, color: '#888' }}>  Hạn dùng: {pv.facilityVaccine?.expiryDate}</Text>
                          {pv.facilityVaccine?.vaccine?.ageGroup && (
                            <Text style={{ fontSize: 12, color: '#666' }}>  Độ tuổi: {pv.facilityVaccine.vaccine.ageGroup}</Text>
                          )}
                        </View>
                      ))
                    ) : (
                      <Text style={{ fontSize: 13, color: '#888' }}>Không có vaccine</Text>
                    )}
                    {packageMinAge !== undefined && (
                      <Text style={{ fontSize: 12, color: '#666', marginTop: 5 }}>
                        Độ tuổi tối thiểu cho gói: {formatAgeGroup(packageMinAge)}
                      </Text>
                    )}
                  </View>
                )}
              </View>
            );
          })}
          {/* Vaccine lẻ */}
          {filteredFacilityVaccines.map(fv => {
            const isSelected = selectedSingleVaccine?.facilityVaccineId === fv.facilityVaccineId;
            const hasPackageInCart = cartItems.some(item => item.packageId);
            const isDisabled = hasPackageInCart && !isSelected;
            
            const handleSelectVaccine = () => {
              if (!isDisabled) {
                handleSelectSingleVaccine(fv);
              }
            };
            const isExpanded = expandedFacilityVaccineId === fv.facilityVaccineId;
            
            return (
              <View key={fv.facilityVaccineId} style={[
                styles.packageItem, 
                isSelected && styles.packageItemSelected,
                isDisabled && styles.packageItemDisabled
              ]}>
                <TouchableOpacity
                  onPress={() => showVaccineDetails(fv)}
                  style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                  activeOpacity={0.8}
                >
                  <View style={styles.packageInfo}>
                    <Text style={[
                      styles.packageName, 
                      isSelected && styles.packageTextSelected,
                      isDisabled && styles.packageTextDisabled
                    ]}>{fv.vaccine?.name}</Text>
                    <Text style={[
                      styles.packagePrice, 
                      isSelected && styles.packageTextSelected,
                      isDisabled && styles.packageTextDisabled
                    ]}>{fv.price?.toLocaleString('vi-VN')}đ</Text>
                    {fv.vaccine?.ageGroup && (
                      <Text style={[
                        styles.ageGroupText,
                        isSelected && styles.packageTextSelected,
                        isDisabled && styles.packageTextDisabled
                      ]}>
                        Độ tuổi: {fv.vaccine.ageGroup}
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.addToCartButton, 
                      isSelected && styles.addToCartButtonSelected,
                      isDisabled && styles.addToCartButtonDisabled
                    ]}
                    onPress={handleSelectVaccine}
                    disabled={isDisabled}
                  >
                    <Text style={[
                      styles.addToCartText, 
                      isSelected && styles.addToCartTextSelected,
                      isDisabled && styles.addToCartTextDisabled
                    ]}>
                      {isDisabled ? 'Không thể chọn' : (isSelected ? 'Đã chọn' : 'Chọn')}
                    </Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              </View>
            );
          })}
        </>
      )}

      {/* Chọn ngày và giờ */}
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
               const disabled = isPastDate(calendarYear, calendarMonth, day);
               return (
                  <TouchableOpacity
                    key={day}
                    style={[styles.dayButton, isSelected && styles.dayButtonSelected, disabled && { opacity: 0.3 }]}
                    onPress={() => !disabled && setSelectedDate(dayStr)}
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
        {availableSlots.length === 0 ? (
          <Text style={{ color: '#888' }}>Không có khung giờ khả dụng</Text>
        ) : (
          availableSlots.map(slot => (
            <TouchableOpacity
              key={slot.slotId}
              style={selectedSlot?.slotId === slot.slotId ? styles.timeSlotButtonSelected : styles.timeSlotButton}
              onPress={() => setSelectedSlot(slot)}
            >
              <Text style={selectedSlot?.slotId === slot.slotId ? styles.timeSlotButtonTextSelected : styles.timeSlotButtonText}>
                {slot.slotTime}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Ghi chú */}
      <Text style={styles.sectionTitle}>Ghi chú</Text>
      <TextInput
        style={styles.notesInput}
        placeholder="Nhập ghi chú (nếu có)"
        placeholderTextColor="#888"
        multiline
        numberOfLines={4}
        value={note}
        onChangeText={setNote}
      />

      {/* Đặt lịch button */}
      <TouchableOpacity style={styles.bookButton} onPress={handleBookAppointment}>
        <Text style={styles.bookButtonText}>Đặt lịch</Text>
      </TouchableOpacity>

      {/* Vaccine Details Modal */}
      <Modal
        visible={isVaccineModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeVaccineDetails}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {selectedVaccineForModal && (
              <>
                {/* Modal Header */}
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Chi tiết vaccine</Text>
                  <TouchableOpacity onPress={closeVaccineDetails} style={styles.modalCloseButton}>
                    <FontAwesomeIcon icon={faTimes} size={20} color="#666" />
                  </TouchableOpacity>
                </View>

                                                                  {/* Modal Content */}
                                   <ScrollView 
                    style={styles.modalContent} 
                    showsVerticalScrollIndicator={true}
                    contentContainerStyle={styles.modalContentContainer}
                  >
                    <Text style={styles.modalInfoText}>
                      <Text style={styles.modalInfoLabel}>Vaccine: </Text>
                      {selectedVaccineForModal.vaccine?.name}
                    </Text>
                    
                    <Text style={styles.modalInfoText}>
                      <Text style={styles.modalInfoLabel}>Giá: </Text>
                      {selectedVaccineForModal.price?.toLocaleString('vi-VN')}đ
                    </Text>
                    
                    {selectedVaccineForModal.vaccine?.description && (
                      <Text style={styles.modalInfoText}>
                        <Text style={styles.modalInfoLabel}>Mô tả: </Text>
                        {selectedVaccineForModal.vaccine.description}
                      </Text>
                    )}
                    
                    <Text style={styles.modalInfoText}>
                      <Text style={styles.modalInfoLabel}>Độ tuổi: </Text>
                      {selectedVaccineForModal.vaccine?.ageGroup || 'Không xác định'}
                    </Text>
                    
                    <Text style={styles.modalInfoText}>
                      <Text style={styles.modalInfoLabel}>Số liều: </Text>
                      {selectedVaccineForModal.vaccine?.numberOfDoses || 'Không xác định'} liều
                    </Text>
                    
                    <Text style={styles.modalInfoText}>
                      <Text style={styles.modalInfoLabel}>Số lượng còn: </Text>
                      {selectedVaccineForModal.availableQuantity || 'Không xác định'}
                    </Text>
                    
                    <Text style={styles.modalInfoText}>
                      <Text style={styles.modalInfoLabel}>Hạn dùng: </Text>
                      {selectedVaccineForModal.expiryDate || 'Không xác định'}
                    </Text>
                    
                    {selectedVaccineForModal.vaccine?.manufacturer && (
                      <Text style={styles.modalInfoText}>
                        <Text style={styles.modalInfoLabel}>Nhà sản xuất: </Text>
                        {selectedVaccineForModal.vaccine.manufacturer}
                      </Text>
                    )}
                    
                    {selectedVaccineForModal.vaccine?.origin && (
                      <Text style={styles.modalInfoText}>
                        <Text style={styles.modalInfoLabel}>Xuất xứ: </Text>
                        {selectedVaccineForModal.vaccine.origin}
                      </Text>
                    )}
                    
                    {selectedVaccineForModal.vaccine?.diseases && selectedVaccineForModal.vaccine.diseases.length > 0 && (
                      <>
                        <Text style={styles.modalSectionTitle}>Bệnh phòng ngừa:</Text>
                        {selectedVaccineForModal.vaccine.diseases.map(disease => (
                          <Text key={disease.diseaseId} style={styles.modalInfoText}>
                            • {disease.name}: {disease.description || 'Không có mô tả'}
                          </Text>
                        ))}
                      </>
                    )}
                    
                    <Text style={styles.modalInfoText}>
                      <Text style={styles.modalInfoLabel}>Cơ sở cung cấp: </Text>
                      {selectedFacility?.facilityName || 'Không xác định'}
                    </Text>
                    
                    <Text style={styles.modalInfoText}>
                      <Text style={styles.modalInfoLabel}>Trạng thái: </Text>
                      {selectedVaccineForModal.availableQuantity > 0 ? 'Có sẵn' : 'Hết hàng'}
                    </Text>
                    
                    {selectedVaccineForModal.vaccine?.storageConditions && (
                      <Text style={styles.modalInfoText}>
                        <Text style={styles.modalInfoLabel}>Điều kiện bảo quản: </Text>
                        {selectedVaccineForModal.vaccine.storageConditions}
                      </Text>
                    )}
                  </ScrollView>

                {/* Modal Footer */}
                <View style={styles.modalFooter}>
                  <TouchableOpacity 
                    style={styles.modalButton}
                    onPress={closeVaccineDetails}
                  >
                    <Text style={styles.modalButtonText}>Đóng</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15, // Keep padding consistent
    backgroundColor: '#fff', // White background
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15, // Keep padding consistent
    backgroundColor: '#fff', // White background
    marginHorizontal: -15, // Counteract container padding
    marginTop: -15, // Counteract container padding
    paddingHorizontal: 15,
    shadowColor: '#000', // Keep shadow color
    shadowOffset: { width: 0, height: 3 }, // Slightly increased shadow offset
    shadowOpacity: 0.15, // Slightly increased shadow opacity
    shadowRadius: 2.5, // Slightly increased shadow radius
    elevation: 4, // Increased elevation
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
    marginLeft: -25,
    color: '#222', // Darker text color for better contrast
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
    color: '#333',
  },

  suggestionBox: {
    backgroundColor: '#e0f7fa',
    padding: 15,
    borderRadius: 8, // Slightly larger border radius
    marginBottom: 20,
    borderWidth: 1, // Add a subtle border
    borderColor: '#b3e5fc', // Lighter blue border color
  },
  suggestionTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#0056b3', // Keep darker blue
  },
  suggestionText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#555',
  },
  diseaseSectionTitle: {
    marginTop: 10,
  },

 
  packageItem: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#fff', // White background
    shadowColor: '#000', // Add shadow
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 0.8,
    elevation: 1,
    borderColor: '#eee', // Light grey border
  },
  packageItemSelected: {
    borderColor: '#007bff',
    backgroundColor: '#e0f7fa', // Light blue background for selected item
    shadowColor: '#007bff', // Blue shadow
    shadowOffset: { width: 0, height: 1 },
    shadowColor: '#007bff', // Blue shadow for selected item
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  packageName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 3,
    color: '#333', // Darker text color
  },
  packageDetails: {
    fontSize: 14,
    color: '#555',
    marginBottom: 3,
  },
  packagePrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007bff', // Blue color for price
  },
  packageTextSelected: {
    color: '#007bff', // Blue color for text in selected item
  },
  calendarContainer: {
    borderWidth: 1,
    borderColor: '#ddd', // Lighter border
    borderRadius: 8, // Slightly larger border radius
    padding: 15, // Increased padding
    marginBottom: 20,
    backgroundColor: '#fff', // White background
    shadowColor: '#000', // Add shadow
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 0.8,
    elevation: 1,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15, // Increased bottom margin
  },
  calendarHeaderText: {
    fontSize: 17, // Slightly increased font size
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
    width: '14%', // Approx. 1/7th of the container width
    aspectRatio: 1, // Make it a square
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
    borderRadius: 15, // Half of a typical size to make it circular or rounded
  },
  dayButtonSelected: {
    backgroundColor: '#007bff',
  },
  dayButtonText: {
    fontSize: 14,
    color: '#333',
  },
  dayButtonTextSelected: {
    color: '#fff',
  },
  timeSlotSectionTitle: {
    marginTop: 0,
  },
  timeSlotContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  timeSlotButton: {
    borderWidth: 1,
    borderColor: '#ddd', // Lighter border
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginRight: 10,
    marginBottom: 10,
    backgroundColor: '#fff', // White background
    shadowColor: '#000', // Add shadow
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 0.8,
    elevation: 1,
  },
  timeSlotButtonText: {
    fontSize: 14,
    color: '#333',
  },
  timeSlotButtonSelected: {
    borderWidth: 1,
    borderColor: '#007bff', // Blue border
    backgroundColor: '#007bff', // Blue background
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginRight: 10,
    marginBottom: 10,
    shadowColor: '#007bff', // Blue shadow
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 1.5,
    elevation: 2,
  },
  timeSlotButtonTextSelected: {
    color: '#fff',
  },
  notesInput: {
    borderColor: '#ddd', // Lighter border
    borderWidth: 1,
    paddingHorizontal: 15, // Increased horizontal padding
    paddingTop: 10,
    borderRadius: 8, // Slightly larger border radius
    backgroundColor: '#fff', // White background
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
    shadowColor: '#000', // Add shadow
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 0.8,
    elevation: 1,
  },
  bookButton: {
    backgroundColor: '#007bff', // Blue button color
    paddingVertical: 14, // Increased vertical padding
    borderRadius: 8, // Slightly larger border radius
    alignItems: 'center',
    marginTop: 25,
    marginBottom: 25,
    shadowColor: '#007bff', // Blue shadow
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
  childInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
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
    marginTop: 2,
  },
  dropdownToggle: {
    padding: 5,
  },
  dropdownContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
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
    marginHorizontal: 0,
    marginBottom: 10,
    marginTop: -15,
  },
  dropdownScroll: {
    maxHeight: 200, // Limit height of scrollable dropdown
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
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  dropdownItemTextContainer: {
    flex: 1,
  },
  dropdownItemName: {
    fontSize: 15,
    color: '#333',
  },
  dropdownItemAge: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  selectedIcon: {
    marginLeft: 5,
    color: '#007bff',
  },
  diseaseSelectionContainer: {
    marginBottom: 20,
  },
  diseaseSelectButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 0.8,
    elevation: 1,
  },
  diseaseSelectText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  diseaseDropdownContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
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
    marginHorizontal: 0,
    marginBottom: 10,
    marginTop: -15,
  },
  diseaseSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  diseaseSearchIcon: {
    marginRight: 10,
    color: '#888',
  },
  diseaseSearchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  diseaseListContainer: {
    maxHeight: 200,
  },
  diseaseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  diseaseItemText: {
    fontSize: 15,
    color: '#333',
    flex: 1,
  },
  selectedDiseaseIcon: {
    marginLeft: 5,
    color: '#007bff',
  },
  noDiseaseText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    paddingVertical: 10,
  },

  facilityDropdownContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
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
    marginHorizontal: 0,
    marginBottom: 10,
    marginTop: -15,
  },
  facilitySearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  facilitySearchIcon: {
    marginRight: 10,
    color: '#888',
  },
  facilitySearchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  facilityListContainer: {
    maxHeight: 200,
  },
  facilityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  facilityItemContent: {
    flex: 1,
  },
  facilityItemName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 3,
  },
  facilityItemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  facilityItemDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  facilityItemAddress: {
    fontSize: 13,
    color: '#555',
    marginLeft: 5,
  },
  facilityItemPhone: {
    fontSize: 13,
    color: '#007bff', // Blue color for phone number
    marginLeft: 5,
  },
  selectedFacilityIcon: {
    marginLeft: 5,
    color: '#007bff',
  },
  noFacilityText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    paddingVertical: 10,
  },
  popularFacilitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  popularFacilityCard: {
    width: '45%', // Adjust as needed for 2 columns
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 0.8,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#eee',
  },
  popularFacilityItemSelected: {
    borderColor: '#007bff',
    backgroundColor: '#e0f7fa',
    shadowColor: '#007bff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  popularFacilityName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  popularFacilityDistance: {
    fontSize: 12,
    color: '#007bff', // Blue color for distance
    marginLeft: 10,
  },
  popularFacilityAddress: {
    fontSize: 12,
    color: '#888',
    marginLeft: 5,
  },
  popularFacilityPhone: {
    fontSize: 12,
    color: '#007bff', // Blue color for phone number
    marginLeft: 5,
  },
  selectedFacilityContainer: {
    marginBottom: 15,
  },
  selectedFacilityTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  selectedFacilityCard: {
    backgroundColor: '#e8f4fd',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007bff',
  },
  selectedFacilityName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 5,
  },
  selectedFacilityAddress: {
    fontSize: 13,
    color: '#555',
  },
  selectedFacilityPhone: {
    fontSize: 13,
    color: '#007bff',
  },
  searchMoreContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 0.8,
    elevation: 1,
  },
  searchMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchMoreIcon: {
    marginRight: 10,
  },
  searchMoreText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  popularFacilityCardVertical: {
    width: '100%', // Full width for vertical list
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 0.8,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#eee',
  },

  // Cart button styles
  cartButton: {
    backgroundColor: '#007bff',
    padding: 8,
    borderRadius: 20,
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#ff4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },

  // Package styles with cart integration
  packageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  packageInfo: {
    flex: 1,
  },
  packageItemInCart: {
    borderColor: '#28a745',
    backgroundColor: '#fff',
  },
  packageItemSelected: {
    borderColor: '#007bff',
    backgroundColor: '#e0f7fa',
    shadowColor: '#007bff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  packageItemDisabled: {
    borderColor: '#ddd',
    backgroundColor: '#fff',
    opacity: 0.6,
  },
  packageTextInCart: {
    color: '#28a745',
  },
  packageTextSelected: {
    color: '#007bff',
  },
  addToCartButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 10,
  },
  addToCartButtonInCart: {
    backgroundColor: '#28a745',
  },
  addToCartButtonSelected: {
    backgroundColor: '#007bff',
  },
  addToCartButtonDisabled: {
    backgroundColor: '#ccc',
  },
  addToCartText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  addToCartTextInCart: {
    color: 'white',
  },
  addToCartTextSelected: {
    color: 'white',
  },
  addToCartTextDisabled: {
    color: '#666',
  },
  ageGroupText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    fontStyle: 'italic',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '92%',
    maxHeight: '90%',
    minHeight: '60%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 15,
    },
    shadowOpacity: 0.3,
    shadowRadius: 25,
    elevation: 15,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fafafa',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalCloseButton: {
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
  },
  modalContent: {
    flex: 1,
    padding: 20,
    minHeight: 400,
  },
  modalContentContainer: {
    paddingBottom: 20,
  },
  modalVaccineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9ff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  modalVaccineIcon: {
    width: 50,
    height: 50,
    backgroundColor: '#e3f2fd',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  modalVaccineTitleContainer: {
    flex: 1,
  },
  modalVaccineTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  modalVaccinePrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 15,
  },
  modalSection: {
    marginBottom: 25,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    marginTop: 15,
  },
  modalVaccineDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    marginBottom: 15,
  },
  modalDetailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  modalDetailItem: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  modalDetailLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    marginBottom: 4,
  },
  modalDetailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
  },
  modalDiseaseCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e3f2fd',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  modalDiseaseName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  modalDiseaseDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    fontStyle: 'italic',
  },
  modalInfoCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  modalInfoText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 10,
  },
  modalInfoLabel: {
    fontWeight: 'bold',
    color: '#333',
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fafafa',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  modalButton: {
    backgroundColor: '#007bff',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#007bff',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  changeFacilityButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  changeFacilityButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default Booking;