import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image } from 'react-native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const HistoryVacc = ({ navigation }) => {   
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [children, setChildren] = useState([
    { id: 'child1', name: 'Nguyễn Minh Khôi', age: '3 tuổi', image: require('../../assets/vnvc.jpg') },
    { id: 'child2', name: 'Lê Thu Anh', age: '2 tuổi', image: require('../../assets/vnvc.jpg') },
    { id: 'child3', name: 'Trần Văn Bình', age: '4 tuổi', image: require('../../assets/vnvc.jpg') },
  ]);
  const [selectedChildren, setSelectedChildren] = useState(['child1']);

  const handleSelectChildPress = () => {
    setIsDropdownVisible(!isDropdownVisible);
  };

  const handleSelectChild = (childId) => {
    setSelectedChildren([childId]);
    setIsDropdownVisible(false);
  };

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
              source={children.find(child => child.id === selectedChildren[0])?.image || require('../../assets/vnvc.jpg')}
              style={styles.avatar}
            />
          )}
          <View>
            {selectedChildren.length > 0 && (
              <Text style={styles.userName}>
                {children.find(child => child.id === selectedChildren[0])?.name}
              </Text>
            )}
            {selectedChildren.length > 0 && (
              <Text style={styles.userAge}>
                {children.find(child => child.id === selectedChildren[0])?.age}
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
        <TouchableOpacity style={styles.activeTab}>
          <Text style={styles.activeTabText}>Lịch sử tiêm chủng</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text style={styles.tabText}>Gói đang theo dõi</Text>
        </TouchableOpacity>
      </View>

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
        {/* Vaccine Item 1 */}
        <View style={styles.vaccineItem}>
          <MaterialIcons name="check-circle" size={24} color="#007bff" style={styles.checkIcon} />
          <View style={styles.vaccineDetails}>
            <Text style={styles.vaccineName}>Mũi 5 trong 1 - Mũi 2</Text>
            <Text style={styles.vaccineDescription}>Bạch hầu, Ho gà, Uốn ván, Bại liệt, Viêm gan B</Text>
            <View style={styles.detailRow}>
              <MaterialIcons name="access-time" size={16} color="gray" />
              <Text style={styles.detailText}>12/03/2024</Text>
            </View>
            <View style={styles.detailRow}>
              <MaterialIcons name="location-on" size={16} color="gray" />
              <Text style={styles.detailText}>Trung tâm VNVC Tân Bình</Text>
            </View>
            <View style={styles.detailRow}>
              <MaterialIcons name="info-outline" size={16} color="gray" />
              <Text style={styles.detailText}>Bé hơi sốt nhẹ sau tiêm</Text>
            </View>
          </View>
        </View>

        {/* Vaccine Item 2 */}
        <View style={styles.vaccineItem}>
          <MaterialIcons name="check-circle" size={24} color="#007bff" style={styles.checkIcon} />
          <View style={styles.vaccineDetails}>
            <Text style={styles.vaccineName}>Mũi MMR - Mũi 1</Text>
            <Text style={styles.vaccineDescription}>Sởi, Quai bị, Rubella</Text>
            <View style={styles.detailRow}>
              <MaterialIcons name="access-time" size={16} color="gray" />
              <Text style={styles.detailText}>15/02/2024</Text>
            </View>
            <View style={styles.detailRow}>
              <MaterialIcons name="location-on" size={16} color="gray" />
              <Text style={styles.detailText}>Trung tâm VNVC Tân Bình</Text>
            </View>
          </View>
        </View>

        {/* Vaccine Item 3 */}
        <View style={styles.vaccineItem}>
          <MaterialIcons name="check-circle" size={24} color="#007bff" style={styles.checkIcon} />
          <View style={styles.vaccineDetails}>
            <Text style={styles.vaccineName}>Mũi Rotavirus - Mũi 3</Text>
            <Text style={styles.vaccineDescription}>Tiêu chảy do Rotavirus</Text>
            <View style={styles.detailRow}>
              <MaterialIcons name="access-time" size={16} color="gray" />
              <Text style={styles.detailText}>20/01/2024</Text>
            </View>
            <View style={styles.detailRow}>
              <MaterialIcons name="location-on" size={16} color="gray" />
              <Text style={styles.detailText}>Trung tâm VNVC Tân Bình</Text>
            </View>
            <View style={styles.detailRow}>
              <MaterialIcons name="info-outline" size={16} color="gray" />
              <Text style={styles.detailText}>Hoàn thành liệu trình</Text>
            </View>
          </View>
        </View>
      </ScrollView>
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
});

export default HistoryVacc; 