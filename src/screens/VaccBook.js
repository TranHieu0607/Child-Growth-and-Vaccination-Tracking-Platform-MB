import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Assuming MaterialIcons for icons
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import useChildren from '../store/hook/useChildren';
import useVaccinationBook from '../store/hook/useVaccinationBook';

const VaccBook = ({ navigation }) => {
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const { children, loading: loadingChildren } = useChildren();
  const [selectedChildId, setSelectedChildId] = useState(null);
  const selectedChild = children.find(child => child.childId?.toString() === selectedChildId);

  // Lấy dữ liệu sổ tiêm chủng cho trẻ được chọn
  const { vaccineBook, loading: loadingBook } = useVaccinationBook(selectedChildId);

  // Tính toán progress và status
  const progressData = React.useMemo(() => {
    let completedDoses = 0, totalDoses = 0, completedDiseases = 0, totalDiseases = 0, missingDosesDiseases = 0, unvacinatedDiseases = 0;
    if (vaccineBook && vaccineBook.length) {
      totalDiseases = vaccineBook.length;
      vaccineBook.forEach(group => {
        totalDoses += group.numberOfDoses;
        const completed = group.doses.filter(d => d.status === 'completed').length;
        completedDoses += completed;
        if (completed === group.numberOfDoses) completedDiseases++;
        else if (completed > 0) missingDosesDiseases++;
        else unvacinatedDiseases++;
      });
    }
    return { completedDoses, totalDoses, completedDiseases, totalDiseases, missingDosesDiseases, unvacinatedDiseases };
  }, [vaccineBook]);

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
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10 }}>
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
              <Text style={styles.childAge}>{childDetail.birthDate ? `${new Date().getFullYear() - new Date(childDetail.birthDate).getFullYear()} tuổi` : ''}</Text>
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
                    <Text style={styles.dropdownItemAge}>{child.birthDate ? `${new Date().getFullYear() - new Date(child.birthDate).getFullYear()} tuổi` : ''}</Text>
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
          />
        </View>

        {/* Vaccine List Items */}
        {loadingBook ? (
          <Text style={{ textAlign: 'center', marginTop: 20 }}>Đang tải dữ liệu...</Text>
        ) : (
          vaccineBook.map((group, index) => (
            <View key={index} style={styles.vaccineListItem}>
              <View style={styles.vaccineHeader}>
                <Text style={styles.vaccineTitle}>{group.vaccine.name} ({group.disease.name})</Text>
                {/* Status icon */}
                {(() => {
                  const completed = group.doses.filter(d => d.status === 'completed').length;
                  if (completed === group.numberOfDoses) return <Icon name="check-circle" size={20} color="green" />;
                  if (completed > 0) return <Icon name="access-time" size={20} color="orange" />;
                  return <Icon name="cancel" size={20} color="red" />;
                })()}
              </View>
              <View style={styles.vaccineTable}>
                <View style={styles.tableRow}>
                  <Text style={styles.tableHeader}>Mũi</Text>
                  <Text style={styles.tableHeader}>Trạng thái</Text>
                  <Text style={styles.tableHeader}>Ngày tiêm</Text>
                  <Text style={styles.tableHeader}>Ghi chú</Text>
                </View>
                {Array.from({ length: group.numberOfDoses }).map((_, doseIdx) => {
                  const dose = group.doses.find(d => d.doseNum === doseIdx + 1);
                  return (
                    <View key={doseIdx} style={styles.tableRow}>
                      <Text style={styles.tableCell}>Mũi {doseIdx + 1}</Text>
                      {dose && dose.status === 'completed' ? (
                        <Icon name="check-circle" size={16} color="green" style={styles.tableCell} />
                      ) : (
                        <Icon name="cancel" size={16} color="red" style={styles.tableCell} />
                      )}
                      <Text style={styles.tableCell}>{dose ? dose.actualDate : '-'}</Text>
                      <Text style={styles.tableCell}>{dose ? dose.note : 'Chưa tiêm'}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          ))
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
});

export default VaccBook;
