import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Assuming MaterialIcons for icons
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import childrenApi from '../api/childrenApi';

const VaccBook = ({ navigation }) => {
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [children, setChildren] = useState([]);
  const [selectedChildren, setSelectedChildren] = useState(['child1']);
  const [selectedChildDetail, setSelectedChildDetail] = useState(null);

  const handleSelectChildPress = () => {
    setIsDropdownVisible(!isDropdownVisible);
  };

  const handleSelectChild = (childId) => {
    setSelectedChildren([childId]);
    setIsDropdownVisible(false);
  };

  const selectedChild = children.find(child => child.id === selectedChildren[0]);

  const calculateProgress = () => {
    if (!selectedChild || !selectedChild.vaccinationHistory) return { completedDoses: 0, totalDoses: 0, completedDiseases: 0, totalDiseases: 0, missingDosesDiseases: 0, unvacinatedDiseases: 0 };

    const totalDoses = selectedChild.vaccinationHistory.length;
    const completedDoses = selectedChild.vaccinationHistory.filter(vaccine => vaccine.status === 'completed').length;

    const diseases = {};
    selectedChild.vaccinationHistory.forEach(vaccine => {
      if (!diseases[vaccine.vaccineName]) {
        diseases[vaccine.vaccineName] = { total: 0, completed: 0 };
      }
      diseases[vaccine.vaccineName].total++;
      if (vaccine.status === 'completed') {
        diseases[vaccine.vaccineName].completed++;
      }
    });

    let completedDiseases = 0;
    let missingDosesDiseases = 0;
    let unvacinatedDiseases = 0;
    const totalDiseases = Object.keys(diseases).length;

    for (const diseaseName in diseases) {
      if (diseases[diseaseName].completed === diseases[diseaseName].total) {
        completedDiseases++;
      } else if (diseases[diseaseName].completed > 0 && diseases[diseaseName].completed < diseases[diseaseName].total) {
        missingDosesDiseases++;
      } else if (diseases[diseaseName].completed === 0) {
        unvacinatedDiseases++;
      }
    }

    return { completedDoses, totalDoses, completedDiseases, totalDiseases: totalDiseases, missingDosesDiseases, unvacinatedDiseases };
  };

  const { completedDoses, totalDoses, completedDiseases, totalDiseases: totalDiseasesCount, missingDosesDiseases, unvacinatedDiseases } = calculateProgress();

  useEffect(() => {
    Animated.timing(progressAnimation, {
      toValue: totalDoses > 0 ? completedDoses / totalDoses : 0, // Current progress
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [selectedChild]);

  const progressWidth = progressAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const getVaccineList = () => {
    if (!selectedChild || !selectedChild.vaccinationHistory) return [];

    const groupedVaccines = {};
    selectedChild.vaccinationHistory.forEach(vaccine => {
      if (!groupedVaccines[vaccine.vaccineName]) {
        groupedVaccines[vaccine.vaccineName] = {
          status: 'completed', // Default to completed, then check individual doses
          doses: [],
        };
      }
      groupedVaccines[vaccine.vaccineName].doses.push(vaccine);
    });

    // Determine the overall status for each vaccine group
    for (const vaccineName in groupedVaccines) {
      const allCompleted = groupedVaccines[vaccineName].doses.every(dose => dose.status === 'completed');
      const anyPending = groupedVaccines[vaccineName].doses.some(dose => dose.status === 'pending');
      const allPending = groupedVaccines[vaccineName].doses.every(dose => dose.status === 'pending');

      if (allCompleted) {
        groupedVaccines[vaccineName].status = 'completed';
      } else if (anyPending && !allPending) {
        groupedVaccines[vaccineName].status = 'missing';
      } else if (allPending) {
        groupedVaccines[vaccineName].status = 'unvaccinated';
      }
    }

    return Object.keys(groupedVaccines).map(vaccineName => ({
      name: vaccineName,
      status: groupedVaccines[vaccineName].status,
      doses: groupedVaccines[vaccineName].doses,
    }));
  };

  const vaccineList = getVaccineList();

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const res = await childrenApi.getMyChildren();
        // Sắp xếp theo ngày sinh giảm dần (bé nhỏ tuổi nhất đầu tiên)
        const sorted = [...res.data].sort((a, b) => new Date(b.birthDate) - new Date(a.birthDate));
        const apiChildren = sorted.map(child => ({
          id: child.childId.toString(),
          name: child.fullName,
          age: child.birthDate ? `${new Date().getFullYear() - new Date(child.birthDate).getFullYear()} tuổi` : '',
          image: require('../../assets/vnvc.jpg'),
          vaccinationHistory: [],
        }));
        setChildren(apiChildren);
        if (apiChildren.length > 0) {
          setSelectedChildren([apiChildren[0].id]);
        }
      } catch (e) {
        // Có thể hiển thị thông báo lỗi nếu muốn
      }
    };
    fetchChildren();
  }, []);

  useEffect(() => {
    const fetchChildDetail = async () => {
      if (selectedChildren.length > 0) {
        try {
          // Nếu id là số (API thật), còn nếu là dữ liệu mẫu thì bỏ qua
          if (!isNaN(Number(selectedChildren[0]))) {
            const res = await childrenApi.getChildById(selectedChildren[0]);
            setSelectedChildDetail(res.data);
          } else {
            setSelectedChildDetail(null);
          }
        } catch (e) {
          setSelectedChildDetail(null);
        }
      }
    };
    fetchChildDetail();
  }, [selectedChildren]);

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
          {selectedChildren.length > 0 && (
            <Image
              source={selectedChild?.image || require('../../assets/vnvc.jpg')}
              style={styles.childImage}
            />
          )}
          <View style={styles.childInfo}>
            {selectedChildren.length > 0 && (
              <Text style={styles.childName}>{selectedChild?.name}</Text>
            )}
            {selectedChildren.length > 0 && (
              <Text style={styles.childAge}>{selectedChild?.age}</Text>
            )}
            {selectedChildDetail && (
              <View style={{ marginTop: 8 }}>
                <Text style={{ fontSize: 14, color: '#333' }}>
                  Ngày sinh: {selectedChildDetail.birthDate ? selectedChildDetail.birthDate.split('T')[0] : ''}
                </Text>
                <Text style={{ fontSize: 14, color: '#333' }}>
                  Giới tính: {selectedChildDetail.gender?.trim() || ''}
                </Text>
                <Text style={{ fontSize: 14, color: '#333' }}>
                  Nhóm máu: {selectedChildDetail.bloodType || ''}
                </Text>
                <Text style={{ fontSize: 14, color: '#333' }}>
                  Dị ứng: {selectedChildDetail.allergiesNotes || ''}
                </Text>
                <Text style={{ fontSize: 14, color: '#333' }}>
                  Tiền sử bệnh: {selectedChildDetail.medicalHistory || ''}
                </Text>
              </View>
            )}
          </View>
          <TouchableOpacity style={styles.dropdownToggle} onPress={handleSelectChildPress}>
            <Icon name="keyboard-arrow-down" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Child Selection Dropdown */}
        {isDropdownVisible && (
          <View style={styles.dropdownContainer}>
            <ScrollView nestedScrollEnabled={true} style={styles.dropdownScroll}>
              {children.map(child => (
                <TouchableOpacity
                  key={child.id}
                  style={styles.dropdownItem}
                  onPress={() => handleSelectChild(child.id)}
                >
                  <Image
                    source={child.image || require('../../assets/vnvc.jpg')}
                    style={styles.dropdownItemImage}
                  />
                  <View style={styles.dropdownItemTextContainer}>
                    <Text style={styles.dropdownItemName}>{child.name}</Text>
                    <Text style={styles.dropdownItemAge}>{child.age}</Text>
                  </View>
                  {selectedChildren[0] === child.id && <Text style={styles.selectedIcon}> ✅</Text>}
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
          <Text style={styles.progressText}>{completedDoses}/{totalDoses} mũi đã tiêm</Text>
        </View>

        {/* Status Summary */}
        <View style={styles.statusSummaryContainer}>
          <View style={styles.statusItem}>
            <Icon name="check-circle" size={20} color="green" />
            <Text style={styles.statusText}>{completedDiseases}/{totalDiseasesCount} bệnh đã tiêm đủ</Text>
          </View>
          <View style={styles.statusItem}>
            <Icon name="access-time" size={20} color="orange" />
            <Text style={styles.statusText}>{missingDosesDiseases} bệnh còn thiếu mũi</Text>
          </View>
          <View style={styles.statusItem}>
            <Icon name="cancel" size={20} color="red" />
            <Text style={styles.statusText}>{unvacinatedDiseases} bệnh chưa tiêm mũi nào</Text>
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
        {vaccineList.map((vaccineGroup, index) => (
          <View key={index} style={styles.vaccineListItem}>
            <View style={styles.vaccineHeader}>
              <Text style={styles.vaccineTitle}>{vaccineGroup.name}</Text>
              {vaccineGroup.status === 'completed' && <Icon name="check-circle" size={20} color="green" />}
              {vaccineGroup.status === 'missing' && <Icon name="access-time" size={20} color="orange" />}
              {vaccineGroup.status === 'unvaccinated' && <Icon name="cancel" size={20} color="red" />}
            </View>
            <View style={styles.vaccineTable}>
              <View style={styles.tableRow}>
                <Text style={styles.tableHeader}>Mũi</Text>
                <Text style={styles.tableHeader}>Trạng thái</Text>
                <Text style={styles.tableHeader}>Ngày tiêm</Text>
                <Text style={styles.tableHeader}>Ghi chú</Text>
              </View>
              {vaccineGroup.doses.map((dose, doseIndex) => (
                <View key={doseIndex} style={styles.tableRow}>
                  <Text style={styles.tableCell}>{dose.dose}</Text>
                  {dose.status === 'completed' && <Icon name="check-circle" size={16} color="green" style={styles.tableCell} />}
                  {dose.status === 'pending' && <Icon name="cancel" size={16} color="red" style={styles.tableCell} />}
                  <Text style={styles.tableCell}>{dose.date}</Text>
                  <Text style={styles.tableCell}>{dose.note}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}

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
