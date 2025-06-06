import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, StyleSheet } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft, faChevronDown, faSearch, faCalendarAlt, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';

const UpdateVaccHiss = ({ navigation }) => {
  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      diseaseName: '',
      vaccinationShot: '',
      vaccinationDate: '',
      vaccinationFacility: '',
      notes: '',
    }
  });

  const onSubmit = data => {
    console.log(data);
    // Add logic to save vaccination history data
  };

  // Add state for dropdown visibility
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  // Placeholder state for children data and selected children
  const [children, setChildren] = useState([
    { id: 'child1', name: 'Nguyễn Minh Khôi', age: '3 tuổi', image: require('../../assets/vnvc.jpg') },
    { id: 'child2', name: 'Lê Thu Anh', age: '2 tuổi', image: require('../../assets/vnvc.jpg') },
    { id: 'child3', name: 'Trần Văn Bình', age: '4 tuổi', image: require('../../assets/vnvc.jpg') },
  ]);
  const [selectedChildren, setSelectedChildren] = useState(['child1']); // Start with one child selected

  // Function to handle the dropdown press
  const handleSelectChildPress = () => {
    setIsDropdownVisible(!isDropdownVisible);
    console.log('Select child pressed!'); // Placeholder log
  };

  // Function to handle selecting a child from the dropdown
  const handleSelectChild = (childId) => {
    setSelectedChildren([childId]); // Set the selected child
    setIsDropdownVisible(false); // Close the dropdown after selecting
    console.log('Selected child ID:', childId);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <FontAwesomeIcon icon={faArrowLeft} size={25} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nhập lịch sử tiêm</Text>
      </View>

      {/* Child Info and Dropdown */}
      <View style={styles.childInfoContainer}>
        <View style={styles.childInfo}>
          {/* Display profile image of the first selected child */}
          {selectedChildren.length > 0 && (
            <Image
              source={children.find(child => child.id === selectedChildren[0])?.image || require('../../assets/vnvc.jpg')}
              style={styles.profileImage}
            />
          )}
          <View>
            {/* Display name of the first selected child */}
            {selectedChildren.length > 0 && (
              <Text style={styles.childName}>
                {children.find(child => child.id === selectedChildren[0])?.name}
              </Text>
            )}
            {/* Display age of the first selected child */}
            {selectedChildren.length > 0 && (
              <Text style={styles.childAge}>
                {children.find(child => child.id === selectedChildren[0])?.age}
              </Text>
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
                key={child.id}
                style={styles.dropdownItem}
                onPress={() => handleSelectChild(child.id)}
              >
                {/* Add child image */}
                <Image
                  source={child.image || require('../../assets/vnvc.jpg')}
                  style={styles.dropdownItemImage}
                />
                <View style={styles.dropdownItemTextContainer}>
                  <Text style={styles.dropdownItemName}>{child.name}</Text>
                  <Text style={styles.dropdownItemAge}>{child.age}</Text>
                </View>
                {/* Indicate selected child */}
                {selectedChildren[0] === child.id && <Text style={styles.selectedIcon}> ✅</Text>}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Tên bệnh / phòng bệnh */}
      <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 5 }}>Tên bệnh / phòng bệnh</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', borderColor: 'gray', borderWidth: 1, marginBottom: 20, borderRadius: 5, backgroundColor: '#f9f9f9' }}>
          <View style={{paddingHorizontal: 10}}><FontAwesomeIcon icon={faSearch} size={20} color="gray" /></View>
          <Controller
            control={control}
            name="diseaseName"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={{ height: 50, flex: 1, paddingHorizontal: 10 }}
                placeholder="Chọn loại bệnh cần tiêm phòng"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
      </View>

      {/* Mũi tiêm thứ */}
      <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 5 }}>Mũi tiêm thứ</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', borderColor: 'gray', borderWidth: 1, marginBottom: 20, borderRadius: 5, backgroundColor: '#f9f9f9' }}>
          <View style={{paddingHorizontal: 10}}><FontAwesomeIcon icon={faChevronDown} size={20} color="gray" /></View>
          <Controller
            control={control}
            name="vaccinationShot"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={{ height: 50, flex: 1, paddingHorizontal: 10 }}
                placeholder="Chọn mũi tiêm"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
      </View>

      {/* Ngày tiêm */}
      <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 5 }}>Ngày tiêm</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', borderColor: 'gray', borderWidth: 1, marginBottom: 20, paddingHorizontal: 10, borderRadius: 5, backgroundColor: '#f9f9f9' }}>
          <View style={{paddingHorizontal: 10}}><FontAwesomeIcon icon={faCalendarAlt} size={20} color="gray" /></View>
          <Controller
            control={control}
            name="vaccinationDate"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={{ height: 50, flex: 1, paddingHorizontal: 10 }}
                placeholder="2025-05-21" // Placeholder from image
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
      </View>

      {/* Cơ sở tiêm */}
      <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 5 }}>Cơ sở tiêm</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', borderColor: 'gray', borderWidth: 1, marginBottom: 20, paddingHorizontal: 10, borderRadius: 5, backgroundColor: '#f9f9f9' }}>
          <View style={{paddingHorizontal: 10}}><FontAwesomeIcon icon={faMapMarkerAlt} size={20} color="gray" /></View>
          <Controller
            control={control}
            name="vaccinationFacility"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={{ height: 50, flex: 1, paddingHorizontal: 10 }}
                placeholder="Nhập tên cơ sở tiêm chủng"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
      </View>

      {/* Ghi chú thêm (tùy chọn) */}
      <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 5 }}>Ghi chú thêm (tùy chọn)</Text>
      <Controller
        control={control}
        name="notes"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={{ height: 100, borderColor: 'gray', borderWidth: 1, marginBottom: 30, paddingHorizontal: 10, paddingTop: 10, borderRadius: 5, backgroundColor: '#f9f9f9' }}
            placeholder="Nhập ghi chú về mũi tiêm (nếu có)"
            multiline
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
          />
        )}
      />

      {/* LƯU LỊCH SỬ TIÊM button */}
      <TouchableOpacity style={{ backgroundColor: '#007BFF', padding: 15, borderRadius: 5, alignItems: 'center', marginBottom: 40 }} onPress={handleSubmit(onSubmit)}>
        <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>LƯU LỊCH SỬ TIÊM</Text>
      </TouchableOpacity>

    </ScrollView>
  );
};

// Add new styles for the dropdown
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff', // Add background color for consistency
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  childInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  childInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  childName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  childAge: {
    fontSize: 16,
    color: 'gray',
  },
  dropdownToggle: {
     marginLeft: 'auto',
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
    marginHorizontal: 0,
    marginBottom: 10,
    marginTop: -15,
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

export default UpdateVaccHiss; 