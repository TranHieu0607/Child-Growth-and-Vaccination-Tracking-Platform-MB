import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft, faChevronDown, faSearch, faStar, faStarHalfAlt, faCalendarAlt, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';


const Booking = ({ navigation }) => {


  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <FontAwesomeIcon icon={faArrowLeft} size={25} color="black" />
        </TouchableOpacity>
        <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', flex: 1 }}>Đặt lịch tiêm chủng</Text>
      </View>

      {/* Chọn Bé */}
      <Text style={styles.sectionTitle}>Chọn bé</Text>
      <View style={styles.babySelectContainer}>
         <Text style={styles.babySelectText}>Chọn hồ sơ bé</Text>
         <FontAwesomeIcon icon={faChevronDown} size={15} color="gray" />{/* Placeholder for dropdown icon */}
      </View>

      {/* Gợi ý tiêm chủng */}
      <View style={styles.suggestionBox}>
        <Text style={styles.suggestionTitle}>Gợi ý tiêm chủng</Text>
        <Text style={styles.suggestionText}>• Mũi 2 vắc-xin Viêm gan B</Text>
        <Text style={styles.suggestionText}>• Mũi nhắc Sởi - Rubella</Text>
      </View>

      {/* Chọn Bệnh Cần Tiêm */}
      <Text style={[styles.sectionTitle, styles.diseaseSectionTitle]}>Chọn Bệnh Cần Tiêm</Text>
      <View style={styles.chipContainer}>
        {/* Placeholder chips for diseases */}
        <TouchableOpacity style={styles.chipButton}><Text style={styles.chipButtonText}>Viêm gan B</Text></TouchableOpacity>
        <TouchableOpacity style={styles.chipButton}><Text style={styles.chipButtonText}>Sởi</Text></TouchableOpacity>
        <TouchableOpacity style={styles.chipButton}><Text style={styles.chipButtonText}>Thủy đậu</Text></TouchableOpacity>
        <TouchableOpacity style={styles.chipButton}><Text style={styles.chipButtonText}>Bạch hầu</Text></TouchableOpacity>
        <TouchableOpacity style={styles.chipButton}><Text style={styles.chipButtonText}>Ho gà</Text></TouchableOpacity>
        <TouchableOpacity style={styles.chipButton}><Text style={styles.chipButtonText}>Uốn ván</Text></TouchableOpacity>
      </View>

      {/* Chọn cơ sở tiêm chủng */}
      <Text style={styles.sectionTitle}>Chọn cơ sở tiêm chủng</Text>
      <View style={styles.searchBarContainer}>
        {/* Placeholder for search icon */}
         <FontAwesomeIcon icon={faSearch} size={20} color="#888" style={styles.searchIcon} />
        <TextInput style={styles.searchBarInput} placeholder="Tìm kiếm cơ sở" />
      </View>
      {/* Placeholder for facility list */}
      <View style={styles.filterButtonContainer}>
         <TouchableOpacity style={[styles.filterButton, styles.filterButtonActive]}><Text style={styles.filterButtonText}>Gần nhất</Text></TouchableOpacity>
         <TouchableOpacity style={styles.filterButton}><Text style={styles.filterButtonText}>Đánh giá cao</Text></TouchableOpacity>
      </View>

      {/* Placeholder for actual facility list items */}
      <View style={styles.facilityItem}>
         <View style={styles.facilityInfo}>
           <Text style={styles.facilityName}>Trung tâm Tiêm chủng ABC</Text>
           <Text style={styles.facilityAddress}>123 Nguyễn Văn A, Quận 1, TP.HCM</Text>
           {/* Placeholder for star rating */}
           <View style={styles.ratingContainer}>
             <FontAwesomeIcon icon={faStar} size={15} color="#ffc107" />
             <FontAwesomeIcon icon={faStar} size={15} color="#ffc107" />
             <FontAwesomeIcon icon={faStar} size={15} color="#ffc107" />
             <FontAwesomeIcon icon={faStar} size={15} color="#ffc107" />
             <FontAwesomeIcon icon={faStarHalfAlt} size={15} color="#ffc107" />{/* Example of half star */}
             <Text style={styles.ratingText}>(128)</Text>
           </View>
         </View>
         <Text style={styles.distanceText}>0.8km</Text>
      </View>
      <View style={styles.facilityItem}>
         <View style={styles.facilityInfo}>
           <Text style={styles.facilityName}>Phòng khám Đa khoa XYZ</Text>
           <Text style={styles.facilityAddress}>456 Lê Văn B, Quận 3, TP.HCM</Text>
           {/* Placeholder for star rating */}
            <View style={styles.ratingContainer}>
             <FontAwesomeIcon icon={faStar} size={15} color="#ffc107" />
             <FontAwesomeIcon icon={faStar} size={15} color="#ffc107" />
             <FontAwesomeIcon icon={faStar} size={15} color="#ffc107" />
             <FontAwesomeIcon icon={faStar} size={15} color="#ffc107" />
             <FontAwesomeIcon icon={faStar} size={15} color="#ffc107" />
             <Text style={styles.ratingText}>(256)</Text>
           </View>
         </View>
         <Text style={styles.distanceText}>1.2km</Text>
      </View>

      {/* Gói tiêm phù hợp */}
      <Text style={styles.sectionTitle}>Gói tiêm phù hợp</Text>
      {/* Placeholder for package items */}
      <View style={styles.packageItem}>
         <Text style={styles.packageName}>Gói tiêm cơ bản 6 trong 1</Text>
         <Text style={styles.packageDetails}>Viêm gan B, Bạch hầu, Ho gà, Uốn ván, Bại liệt, Viêm phổi</Text>
         <Text style={styles.packagePrice}>2.500.000đ</Text>
      </View>
      <View style={[styles.packageItem, styles.packageItemSelected]}>
         <Text style={[styles.packageName, styles.packageTextSelected]}>Gói tiêm Viêm gan B</Text>
         <Text style={[styles.packageDetails, styles.packageTextSelected]}>Viêm gan B (3 mũi)</Text>
         <Text style={[styles.packagePrice, styles.packageTextSelected]}>800.000đ</Text>
      </View>

      {/* Chọn ngày và giờ */}
      <Text style={styles.sectionTitle}>Chọn ngày và giờ</Text>
      {/* Placeholder for calendar and time slots */}
      <View style={styles.calendarContainer}>
         {/* Placeholder for calendar header */}
         <View style={styles.calendarHeader}>
            <FontAwesomeIcon icon={faCalendarAlt} size={18} color="#007bff" style={{ marginRight: 5 }} />
            <Text style={styles.calendarHeaderText}>Tháng 2, 2024</Text>
            <View style={{flex: 1}} />{/* Spacer */}
            <FontAwesomeIcon icon={faChevronLeft} size={15} color="gray" style={{ marginRight: 15 }} />
            <FontAwesomeIcon icon={faChevronRight} size={15} color="gray" />
         </View>

         {/* Placeholder for weekdays */}
         <View style={styles.weekdaysContainer}>
            <Text style={styles.weekdayText}>CN</Text>
            <Text style={styles.weekdayText}>T2</Text>
            <Text style={styles.weekdayText}>T3</Text>
            <Text style={styles.weekdayText}>T4</Text>
            <Text style={styles.weekdayText}>T5</Text>
            <Text style={styles.weekdayText}>T6</Text>
            <Text style={styles.weekdayText}>T7</Text>
         </View>

         {/* Placeholder for calendar days */}
         <View style={styles.daysContainer}>
            {[...Array(31)].map((_, index) => {
               const day = index + 1;
               const isSelected = day === 15; // Example: day 15 is selected
               return (
                  <TouchableOpacity key={index} style={[styles.dayButton, isSelected && styles.dayButtonSelected]}>
                     <Text style={[styles.dayButtonText, isSelected && styles.dayButtonTextSelected]}>{day}</Text>
                  </TouchableOpacity>
               );
            })}
         </View>
      </View>

      <Text style={[styles.sectionTitle, styles.timeSlotSectionTitle]}>Chọn giờ</Text>
      <View style={styles.timeSlotContainer}>
         <TouchableOpacity style={styles.timeSlotButton}><Text style={styles.timeSlotButtonText}>08:00</Text></TouchableOpacity>
         <TouchableOpacity style={styles.timeSlotButtonSelected}><Text style={styles.timeSlotButtonTextSelected}>09:00</Text></TouchableOpacity>
         <TouchableOpacity style={styles.timeSlotButton}><Text style={styles.timeSlotButtonText}>10:00</Text></TouchableOpacity>
      </View>
       <View style={styles.timeSlotContainer}>
         <TouchableOpacity style={styles.timeSlotButton}><Text style={styles.timeSlotButtonText}>14:00</Text></TouchableOpacity>
         <TouchableOpacity style={styles.timeSlotButton}><Text style={styles.timeSlotButtonText}>15:00</Text></TouchableOpacity>
         <TouchableOpacity style={styles.timeSlotButton}><Text style={styles.timeSlotButtonText}>16:00</Text></TouchableOpacity>
      </View>

      {/* Ghi chú */}
      <Text style={styles.sectionTitle}>Ghi chú</Text>
      <TextInput
        style={styles.notesInput}
        placeholder="Nhập ghi chú (nếu có)"
        placeholderTextColor="#888"
        multiline
        numberOfLines={4}
      />

      {/* Đặt lịch button */}
      <TouchableOpacity style={styles.bookButton}>
        <Text style={styles.bookButtonText}>Đặt lịch</Text>
      </TouchableOpacity>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15, // Keep padding consistent
    backgroundColor: '#f4f7f9', // Slightly brighter background grey
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
  babySelectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 15, // Increased horizontal padding
    marginBottom: 15, // Increased bottom margin
    backgroundColor: '#fff', // White background
    paddingVertical: 15, // Increased vertical padding
    shadowColor: '#000', // Add shadow
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 0.8,
    elevation: 1,
  },
  babySelectText: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#555',
    lineHeight: 50, // Center text vertically if height is fixed
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
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  chipButton: {
    borderWidth: 1,
    borderColor: '#ddd', // Lighter border for chips
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginRight: 10,
    marginBottom: 10,
    backgroundColor: '#fff', // White background for unselected chips
    shadowColor: '#000', // Add shadow
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 0.8,
    elevation: 1,
  },
  chipButtonText: {
    fontSize: 14,
    color: '#333',
  },
   searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff', // White background
    borderRadius: 25,
    paddingHorizontal: 15, // Increased horizontal padding
    marginBottom: 15,
    shadowColor: '#000', // Add shadow
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 0.8,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 10,
    color: '#888', // Grey color for search icon
  },
  searchBarInput: {
    flex: 1,
    height: 45, // Slightly reduced height
    fontSize: 16,
    color: '#333',
  },
  filterButtonContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  filterButton: {
    borderWidth: 1,
    borderColor: '#007bff', // Blue border
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginRight: 10,
    marginBottom: 10,
    alignSelf: 'flex-start', // Align buttons to the start
    backgroundColor: '#fff', // White background
    shadowColor: '#000', // Add shadow
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 0.8,
    elevation: 1,
  },
  filterButtonActive: {
    backgroundColor: '#007bff',
    shadowColor: '#007bff', // Blue shadow
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 1.5,
    elevation: 2,
  },
  filterButtonText: {
    color: '#007bff',
  },
  facilityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff', // White background
    borderRadius: 8,
    paddingVertical: 15,
    marginBottom: 10,
    paddingHorizontal: 15,
    shadowColor: '#000', // Add shadow
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 0.8,
    elevation: 1,
    borderWidth: 1, // Add a subtle border
    borderColor: '#eee', // Light grey border
  },
  facilityInfo: {
    flex: 1,
    marginRight: 10,
  },
  facilityName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 3,
    color: '#333',
  },
  facilityAddress: {
    fontSize: 14,
    color: '#555',
    marginBottom: 3,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 5,
  },
  distanceText: {
    fontSize: 14,
    color: '#007bff', // Blue color for distance
    fontWeight: 'bold',
  },
  facilityItemPlaceholder: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#fff',
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
});

export default Booking; 