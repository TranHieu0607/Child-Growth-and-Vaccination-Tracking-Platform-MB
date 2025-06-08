import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image } from 'react-native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const HistoryVacc = ({ navigation }) => {   
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('history'); // 'history' or 'tracking'
  const [children, setChildren] = useState([
    {
      id: 'child1',
      name: 'Nguyễn Minh Khôi',
      age: '3 tuổi',
      image: require('../../assets/vnvc.jpg'),
      trackingPackages: [
        {
          id: 'mmr-extended',
          title: 'Gói Tiêm MMR mở rộng',
          progress: 33,
          vaccines: [
            { name: 'MMR - Mũi 1', diseases: 'Sởi - Quai bị - Rubella', date: '12/03/2024', status: 'completed' },
            { name: 'MMR - Mũi 2', diseases: 'Sởi - Quai bị - Rubella', date: null, status: 'pending' },
          ],
          suggestedNextShot: '10/06/2025',
        },
        {
          id: '6-in-1',
          title: 'Gói Tiêm 6 trong 1',
          progress: 67,
          vaccines: [
            { name: '6 trong 1 - Mũi 1', diseases: 'Bạch hầu - Ho gà - Uốn ván', date: '15/02/2024', status: 'completed' },
            { name: '6 trong 1 - Mũi 2', diseases: 'Bạch hầu - Ho gà - Uốn ván', date: null, status: 'pending' },
          ],
          suggestedNextShot: '15/05/2024',
        },
      ],
      vaccinationHistory: [
        {
          id: 'vaccine1',
          name: 'Mũi 5 trong 1 - Mũi 2',
          description: 'Bạch hầu, Ho gà, Uốn ván, Bại liệt, Viêm gan B',
          date: '12/03/2024',
          location: 'Trung tâm VNVC Tân Bình',
          notes: 'Bé hơi sốt nhẹ sau tiêm',
        },
        {
          id: 'vaccine2',
          name: 'Mũi MMR - Mũi 1',
          description: 'Sởi, Quai bị, Rubella',
          date: '15/02/2024',
          location: 'Trung tâm VNVC Tân Bình',
          notes: null,
        },
        {
          id: 'vaccine3',
          name: 'Mũi Rotavirus - Mũi 3',
          description: 'Tiêu chảy do Rotavirus',
          date: '20/01/2024',
          location: 'Trung tâm VNVC Tân Bình',
          notes: 'Hoàn thành liệu trình',
        },
      ],
    },
    {
      id: 'child2',
      name: 'Lê Thu Anh',
      age: '2 tuổi',
      image: require('../../assets/vnvc.jpg'),
      trackingPackages: [
        {
          id: 'chickenpox',
          title: 'Gói Tiêm Thủy đậu',
          progress: 50,
          vaccines: [
            { name: 'Thủy đậu - Mũi 1', diseases: 'Thủy đậu', date: '01/01/2024', status: 'completed' },
            { name: 'Thủy đậu - Mũi 2', diseases: 'Thủy đậu', date: null, status: 'pending' },
          ],
          suggestedNextShot: '01/07/2024',
        },
      ],
      vaccinationHistory: [
        {
          id: 'vaccine4',
          name: 'Mũi 6 trong 1 - Mũi 1',
          description: 'Bạch hầu, Ho gà, Uốn ván, Bại liệt, Viêm gan B, Hib',
          date: '10/04/2024',
          location: 'Trung tâm VNVC Hà Nội',
          notes: null,
        },
      ],
    },
    {
      id: 'child3',
      name: 'Trần Văn Bình',
      age: '4 tuổi',
      image: require('../../assets/vnvc.jpg'),
      trackingPackages: [
        {
          id: 'chickenpox',
          title: 'Gói Tiêm Thủy đậu',
          progress: 50,
          vaccines: [
            { name: 'Thủy đậu - Mũi 1', diseases: 'Thủy đậu', date: '01/01/2024', status: 'completed' },
            { name: 'Thủy đậu - Mũi 2', diseases: 'Thủy đậu', date: null, status: 'pending' },
          ],
          suggestedNextShot: '01/07/2024',
        },
      ],
      vaccinationHistory: [
        {
          id: 'vaccine1',
          name: 'Mũi 5 trong 1 - Mũi 2',
          description: 'Bạch hầu, Ho gà, Uốn ván, Bại liệt, Viêm gan B',
          date: '12/03/2024',
          location: 'Trung tâm VNVC Tân Bình',
          notes: 'Bé hơi sốt nhẹ sau tiêm',
        },
        {
          id: 'vaccine2',
          name: 'Mũi MMR - Mũi 1',
          description: 'Sởi, Quai bị, Rubella',
          date: '15/02/2024',
          location: 'Trung tâm VNVC Tân Bình',
          notes: null,
        },
      ], // No vaccination history for this child for now
    },
  ]);
  const [selectedChildren, setSelectedChildren] = useState(['child1']);

  const handleSelectChildPress = () => {
    setIsDropdownVisible(!isDropdownVisible);
  };

  const handleSelectChild = (childId) => {
    setSelectedChildren([childId]);
    setIsDropdownVisible(false);
  };

  const selectedChild = children.find(child => child.id === selectedChildren[0]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {/* Back button - Adjust navigation target if needed */}
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <FontAwesomeIcon icon={faArrowLeft} size={25} color="black" />
        </TouchableOpacity>
        {/* Corrected header title */}
        <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', flex: 1 }}>Lịch sử tiêm chủng</Text>
      </View>

      {/* User Info and Dropdown */}
      <View style={styles.childInfoContainer}>
        <View style={styles.childInfo}>
          {selectedChildren.length > 0 && (
            <Image
              source={selectedChild?.image || require('../../assets/vnvc.jpg')}
              style={styles.avatar}
            />
          )}
          <View>
            {selectedChildren.length > 0 && (
              <Text style={styles.userName}>
                {selectedChild?.name}
              </Text>
            )}
            {selectedChildren.length > 0 && (
              <Text style={styles.userAge}>
                {selectedChild?.age}
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

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={activeTab === 'history' ? styles.activeTab : styles.tab}
          onPress={() => setActiveTab('history')}
        >
          <Text style={activeTab === 'history' ? styles.activeTabText : styles.tabText}>Lịch sử tiêm chủng</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={activeTab === 'tracking' ? styles.activeTab : styles.tab}
          onPress={() => setActiveTab('tracking')}
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
            />
          </View>

          {/* Filters */}
          <View style={styles.filters}>
            <TouchableOpacity style={styles.filterButton}>
              <Text>Năm 2024</Text>
              <MaterialIcons name="keyboard-arrow-down" size={20} color="black" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterButton}>
              <Text>Tất cả quý</Text>
              <MaterialIcons name="keyboard-arrow-down" size={20} color="black" />
            </TouchableOpacity>
          </View>

          {/* Vaccination History List */}
          <ScrollView style={styles.vaccineList}>
            {selectedChild.vaccinationHistory.map(vaccine => (
              <View key={vaccine.id} style={styles.vaccineItem}>
                <MaterialIcons name="check-circle" size={24} color="#007bff" style={styles.checkIcon} />
                <View style={styles.vaccineDetails}>
                  <Text style={styles.vaccineName}>{vaccine.name}</Text>
                  <Text style={styles.vaccineDescription}>{vaccine.description}</Text>
                  <View style={styles.detailRow}>
                    <MaterialIcons name="access-time" size={16} color="gray" />
                    <Text style={styles.detailText}>{vaccine.date}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <MaterialIcons name="location-on" size={16} color="gray" />
                    <Text style={styles.detailText}>{vaccine.location}</Text>
                  </View>
                  {vaccine.notes && (
                    <View style={styles.detailRow}>
                      <MaterialIcons name="info-outline" size={16} color="gray" />
                      <Text style={styles.detailText}>{vaccine.notes}</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </ScrollView>
        </>
      )}

      {activeTab === 'tracking' && selectedChild && (
        <ScrollView style={styles.trackingPackagesList}>
          {selectedChild.trackingPackages.map(pkg => (
            <View key={pkg.id} style={styles.packageCard}>
              <View style={styles.packageHeader}>
                <MaterialIcons name="archive" size={24} color="#007bff" />
                <Text style={styles.packageTitle}>{pkg.title}</Text>
              </View>
              <View style={styles.progressBarBackground}>
                <View style={[styles.progressBarFill, { width: `${pkg.progress}%` }]} />
              </View>
              <Text style={styles.progressText}>{pkg.progress}% hoàn thành</Text>
              {pkg.vaccines.map((vaccine, index) => (
                <View key={index} style={styles.vaccineDetailItem}>
                  <MaterialIcons name="healing" size={20} color="#007bff" />
                  <View style={styles.vaccineTextContainer}>
                    <Text style={styles.vaccineShotName}>{vaccine.name}</Text>
                    <Text style={styles.vaccineDiseases}>{vaccine.diseases}</Text>
                  </View>
                  {vaccine.date && <Text style={styles.vaccineDate}>{vaccine.date}</Text>}
                  {vaccine.status === 'completed' ? (
                    <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
                  ) : (
                    <MaterialIcons name="access-time" size={20} color="gray" />
                  )}
                </View>
              ))}
              {pkg.suggestedNextShot && (
                <View style={styles.suggestionRow}>
                  <MaterialIcons name="calendar-today" size={16} color="gray" />
                  <Text style={styles.suggestionText}>Gợi ý tiêm tiếp: {pkg.suggestedNextShot}</Text>
                </View>
              )}
              <TouchableOpacity style={styles.scheduleButton}>
                <Text style={styles.scheduleButtonText}>ĐẶT LỊCH MŨI TIẾP THEO</Text>
                <MaterialIcons name="arrow-forward-ios" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    paddingTop: 50, // Adjust for status bar
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
});

export default HistoryVacc; 