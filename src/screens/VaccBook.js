import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Assuming MaterialIcons for icons
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import useChildren from '../store/hook/useChildren';
import useVaccineTemplate from '../store/hook/useVaccineTemplate';

const VaccBook = ({ navigation }) => {
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;
  const { children, loading: loadingChildren } = useChildren();
  const [selectedChildId, setSelectedChildId] = useState(null);
  const selectedChild = children.find(child => child.childId?.toString() === selectedChildId);

  // Function để tính tuổi chính xác
  const calculateAge = (birthDate) => {
    if (!birthDate) return '';
    
    const now = new Date();
    const birth = new Date(birthDate);
    const diffTime = Math.abs(now - birth);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffMonths = Math.floor(diffDays / 30.44); // Trung bình ngày/tháng
    const diffYears = Math.floor(diffDays / 365.25); // Trung bình ngày/năm

    if (diffDays <= 60) {
      return `${diffDays} ngày tuổi`;
    } else if (diffMonths < 24) {
      return `${diffMonths} tháng tuổi`;
    } else {
      return `${diffYears} tuổi`;
    }
  };

  // Function để chuẩn hóa chuỗi tìm kiếm (bỏ dấu, chuyển thường)
  const normalizeString = (str) => {
    if (!str) return '';
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Bỏ dấu tiếng Việt
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'd');
  };

  // Lấy dữ liệu vaccine template cho trẻ được chọn
  const { vaccineBook, loading: loadingBook } = useVaccineTemplate(selectedChildId);

  // Tính toán progress và status
  const progressData = React.useMemo(() => {
    let completedDoses = 0, totalDoses = 0, completedDiseases = 0, totalDiseases = 0, missingDosesDiseases = 0, unvacinatedDiseases = 0;
    if (vaccineBook && vaccineBook.length) {
      totalDiseases = vaccineBook.length;
      vaccineBook.forEach(disease => {
        totalDoses += disease.totalDoses;
        completedDoses += disease.completedDoses;
        
        if (disease.overallStatus === 'Đã đủ liều') completedDiseases++;
        else if (disease.overallStatus === 'Chưa đủ liều') missingDosesDiseases++;
        else unvacinatedDiseases++;
      });
    }
    return { completedDoses, totalDoses, completedDiseases, totalDiseases, missingDosesDiseases, unvacinatedDiseases };
  }, [vaccineBook]);

  // Filter vaccines based on search query
  const filteredVaccineBook = React.useMemo(() => {
    if (!searchQuery.trim()) return vaccineBook;
    const normalizedQuery = normalizeString(searchQuery);
    return vaccineBook.filter(disease => 
      normalizeString(disease.diseaseName).includes(normalizedQuery)
    );
  }, [vaccineBook, searchQuery]);

  // Pagination logic
  const totalPages = Math.ceil(filteredVaccineBook.length / itemsPerPage);
  const currentPageData = React.useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredVaccineBook.slice(startIndex, endIndex);
  }, [filteredVaccineBook, currentPage]);

  // Reset page when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    Animated.timing(progressAnimation, {
      toValue: progressData.totalDoses > 0 ? progressData.completedDoses / progressData.totalDoses : 0,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [progressData]);

  const progressWidth = progressAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  // Xử lý chọn trẻ
  useEffect(() => {
    if (!selectedChildId && children.length > 0) {
      setSelectedChildId(children[0].childId?.toString());
    }
  }, [children, selectedChildId]);

  // Lấy thông tin chi tiết trẻ
  const childDetail = selectedChild;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, marginTop: 20 }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <FontAwesomeIcon icon={faArrowLeft} size={25} color="black" />
        </TouchableOpacity>
        <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', flex: 1 }}>Sổ tiêm chủng</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {/* Child Profile */}
        <View style={styles.childProfileContainer}>
          {childDetail && (
            <Image
              source={require('../../assets/vnvc.jpg')}
              style={styles.childImage}
            />
          )}
          <View style={styles.childInfo}>
            {childDetail && (
              <Text style={styles.childName}>{childDetail.fullName}</Text>
            )}
            {childDetail && (
              <Text style={styles.childAge}>{calculateAge(childDetail.birthDate)}</Text>
            )}
          </View>
          <TouchableOpacity style={styles.dropdownToggle} onPress={() => setIsDropdownVisible(!isDropdownVisible)}>
            <Icon name="keyboard-arrow-down" size={24} color="#000" />
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
                  onPress={() => { setSelectedChildId(child.childId?.toString()); setIsDropdownVisible(false); }}
                >
                  <Image
                    source={require('../../assets/vnvc.jpg')}
                    style={styles.dropdownItemImage}
                  />
                  <View style={styles.dropdownItemTextContainer}>
                    <Text style={styles.dropdownItemName}>{child.fullName}</Text>
                    <Text style={styles.dropdownItemAge}>{calculateAge(child.birthDate)}</Text>
                  </View>
                  {selectedChildId === child.childId?.toString() && <Text style={styles.selectedIcon}> ✅</Text>}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Vaccination Progress */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBarBackground}>
            <Animated.View style={[styles.progressBarFill, { width: progressWidth }]} />
          </View>
          <Text style={styles.progressText}>{progressData.completedDoses}/{progressData.totalDoses} mũi đã tiêm</Text>
        </View>

        {/* Status Summary */}
        <View style={styles.statusSummaryContainer}>
          <View style={styles.statusItem}>
            <Icon name="check-circle" size={20} color="green" />
            <Text style={styles.statusText}>{progressData.completedDiseases}/{progressData.totalDiseases} bệnh đã tiêm đủ</Text>
          </View>
          <View style={styles.statusItem}>
            <Icon name="access-time" size={20} color="orange" />
            <Text style={styles.statusText}>{progressData.missingDosesDiseases} bệnh còn thiếu mũi</Text>
          </View>
          <View style={styles.statusItem}>
            <Icon name="cancel" size={20} color="red" />
            <Text style={styles.statusText}>{progressData.unvacinatedDiseases} bệnh chưa tiêm mũi nào</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBarContainer}>
          <Icon name="search" size={20} color="#888" />
          <TextInput
            style={styles.searchBarInput}
            placeholder="Tìm theo tên bệnh..."
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Legend */}
        <View style={styles.legendContainer}>
          <Text style={styles.legendTitle}>Chú thích:</Text>
          <View style={styles.legendItem}>
            <Text style={styles.legendSymbol}>*</Text>
            <Text style={styles.legendText}> = Mũi tiêm bắt buộc</Text>
          </View>
          <View style={styles.legendItem}>
            <Icon name="check-circle" size={16} color="green" />
            <Text style={styles.legendText}> = Đã đủ liều</Text>
          </View>
          <View style={styles.legendItem}>
            <Icon name="access-time" size={16} color="orange" />
            <Text style={styles.legendText}> = Chưa đủ liều</Text>
          </View>
          <View style={styles.legendItem}>
            <Icon name="cancel" size={16} color="red" />
            <Text style={styles.legendText}> = Chưa tiêm</Text>
          </View>
        </View>

        {/* Vaccine List Items */}
        {loadingBook ? (
          <Text style={{ textAlign: 'center', marginTop: 20 }}>Đang tải dữ liệu...</Text>
        ) : filteredVaccineBook.length === 0 ? (
          <Text style={{ textAlign: 'center', marginTop: 20, color: '#666' }}>
            {searchQuery ? 'Không tìm thấy bệnh nào phù hợp' : 'Chưa có dữ liệu vaccine'}
          </Text>
        ) : (
          <>
            {currentPageData.map((disease, index) => (
            <View key={index} style={styles.vaccineListItem}>
              <View style={styles.vaccineHeader}>
                <Text style={styles.vaccineTitle}>{disease.diseaseName}</Text>
                {/* Status icon */}
                {(() => {
                  if (disease.overallStatus === 'Đã đủ liều') return <Icon name="check-circle" size={20} color="green" />;
                  if (disease.overallStatus === 'Chưa đủ liều') return <Icon name="access-time" size={20} color="orange" />;
                  return <Icon name="cancel" size={20} color="red" />;
                })()}
              </View>
              <View style={styles.vaccineTable}>
                <View style={styles.tableRow}>
                  <Text style={styles.tableHeader}>Mũi</Text>
                  <Text style={styles.tableHeader}>Trạng thái</Text>
                  <Text style={styles.tableHeader}>Thời gian tiêm</Text>
                  <Text style={styles.tableHeader}>Tiến độ</Text>
                </View>
                {disease.doses.map((dose, doseIdx) => (
                  <View key={doseIdx} style={styles.tableRow}>
                    <Text style={styles.tableCell}>Mũi {dose.doseNum}</Text>
                    {/* Status icon */}
                    <View style={[styles.tableCell, { alignItems: 'center' }]}>
                      {dose.status === 'Đã đủ liều' ? (
                        <Icon name="check-circle" size={16} color="green" />
                      ) : dose.status === 'Chưa đủ liều' ? (
                        <Icon name="access-time" size={16} color="orange" />
                      ) : (
                        <Icon name="cancel" size={16} color="red" />
                      )}
                    </View>
                    <Text style={styles.tableCell}>{dose.periodFrom} - {dose.periodTo}</Text>
                    <Text style={styles.tableCell}>
                      {dose.completedDoseNum}/{dose.doseNum}
                      {dose.isRequired && <Text style={{ color: 'red', fontWeight: 'bold' }}> *</Text>}
                    </Text>
                  </View>
                ))}
              </View>
              {/* Disease summary */}
              <View style={styles.diseaseSummary}>
                <Text style={styles.diseaseSummaryText}>
                  Tổng: {disease.completedDoses}/{disease.totalDoses} mũi đã hoàn thành
                </Text>
                <Text style={[styles.diseaseStatus, { 
                  color: disease.overallStatus === 'Đã đủ liều' ? 'green' : 
                        disease.overallStatus === 'Chưa đủ liều' ? 'orange' : 'red' 
                }]}>
                  {disease.overallStatus}
                </Text>
              </View>
            </View>
          ))}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <View style={styles.paginationContainer}>
              <TouchableOpacity 
                style={styles.paginationArrow}
                onPress={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <Icon name="chevron-left" size={24} color={currentPage === 1 ? '#ccc' : '#007AFF'} />
              </TouchableOpacity>
              
              <View style={styles.paginationInfo}>
                <Text style={styles.paginationText}>
                  Trang {currentPage} / {totalPages}
                </Text>
                <Text style={styles.paginationSubText}>
                  ({filteredVaccineBook.length} bệnh)
                </Text>
              </View>
              
              <TouchableOpacity 
                style={styles.paginationArrow}
                onPress={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                <Icon name="chevron-right" size={24} color={currentPage === totalPages ? '#ccc' : '#007AFF'} />
              </TouchableOpacity>
            </View>
          )}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  childProfileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 15,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  childImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  childAge: {
    fontSize: 14,
    color: '#666',
  },
  progressContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    marginTop: 10,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 5,
  },
  progressText: {
    fontSize: 14,
    color: '#000',
    marginBottom: 10,
  },
  statusSummaryContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    marginTop: 10,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    marginLeft: 10,
    color: '#000',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 15,
    paddingHorizontal: 15,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  searchBarInput: {
    flex: 1,
    marginLeft: 10,
    height: 40,
    color: '#000',
  },
  vaccineListItem: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginTop: 15,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  vaccineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  vaccineTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  vaccineTable: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 5,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tableHeader: {
    flex: 1,
    padding: 8,
    fontWeight: 'bold',
    backgroundColor: '#f9f9f9',
    color: '#000',
    textAlign: 'center',
  },
  tableCell: {
    flex: 1,
    padding: 8,
    color: '#000',
    textAlign: 'center',
  },
  dropdownContainer: {
    backgroundColor: '#fff',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginHorizontal: 15,
    marginBottom: 10,
    marginTop: -15, // To overlap with the section above
  },
  dropdownScroll: {
    maxHeight: 150,
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
  diseaseSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  diseaseSummaryText: {
    fontSize: 12,
    color: '#666',
  },
  diseaseStatus: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  legendContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginTop: 15,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  legendSymbol: {
    color: 'red',
    fontWeight: 'bold',
    fontSize: 16,
    width: 16,
    textAlign: 'center',
  },
  legendText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginTop: 15,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  paginationArrow: {
    padding: 8,
  },
  paginationInfo: {
    alignItems: 'center',
    flex: 1,
  },
  paginationText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  paginationSubText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
});

export default VaccBook;
