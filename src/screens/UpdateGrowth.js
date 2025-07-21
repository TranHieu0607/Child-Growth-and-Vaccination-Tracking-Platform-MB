import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, StyleSheet } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import childrenApi from '../store/api/childrenApi';
import { getMyChildren, updateGrowthRecord } from '../store/api/growthRecordApi';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

const UpdateGrowth = ({ navigation }) => {
  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      measurementDate: '',
      height: '',
      weight: '',
      headCircumference: '',
      notes: '',
    }
  });

  const [children, setChildren] = useState([]);
  const [selectedChildren, setSelectedChildren] = useState([]);

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

  const onSubmit = async (data) => {
    try {
      const childId = selectedChildren[0];
      const createdAt = data.measurementDate
        ? new Date(data.measurementDate).toISOString()
        : new Date().toISOString();
      const payload = {
        height: Number(data.height),
        weight: Number(data.weight),
        headCircumference: Number(data.headCircumference),
        createdAt,
        note: data.notes || "",
      };
      await updateGrowthRecord(childId, payload);
      alert('Cập nhật chỉ số thành công!');
      navigation.goBack();
    } catch (error) {
      alert('Cập nhật chỉ số thất bại!');
    }
  };

  // Add state for dropdown visibility
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

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

  const selectedChild = children.find(child => child.childId === selectedChildren[0]);

  return (
    <ScrollView style={styles.container}>
      <View style={{...styles.header, marginTop: 20}}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <FontAwesomeIcon icon={faArrowLeft} size={25} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cập nhập chỉ số phát triển</Text>
      </View>

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
              <Text style={styles.childName}>{selectedChild?.fullName}</Text>
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
                </View>
                {selectedChildren[0] === child.childId && <Text style={styles.selectedIcon}> ✅</Text>}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Ngày đo */}
      <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 5 }}>Ngày đo</Text>
      <Controller
        control={control}
        name="measurementDate"
        render={({ field: { onChange, value } }) => {
          const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
          return (
            <>
              <TouchableOpacity
                onPress={() => setDatePickerVisibility(true)}
                style={{ height: 50, borderColor: 'gray', borderWidth: 1, marginBottom: 20, paddingHorizontal: 10, borderRadius: 5, backgroundColor: '#f9f9f9', justifyContent: 'center' }}
              >
                <Text style={{ color: value ? 'black' : '#aaa' }}>
                  {value ? value : 'YYYY-MM-DD'}
                </Text>
              </TouchableOpacity>
              <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="date"
                onConfirm={(date) => {
                  setDatePickerVisibility(false);
                  const formatted = date.toISOString().split('T')[0];
                  onChange(formatted);
                }}
                onCancel={() => setDatePickerVisibility(false)}
                maximumDate={new Date()}
              />
            </>
          );
        }}
      />

      {/* Chiều cao */}
      <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 5 }}>Chiều cao</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', borderColor: 'gray', borderWidth: 1, marginBottom: 20, borderRadius: 5, backgroundColor: '#f9f9f9' }}>
          {/* Icon Placeholder */}
          <View style={{paddingHorizontal: 10}}>{/* Icon */}</View>
          <Controller
            control={control}
            name="height"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={{ height: 50, flex: 1, paddingHorizontal: 10 }}
                placeholder="Nhập chiều cao (cm)"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                keyboardType="numeric"
              />
            )}
          />
          <Text style={{paddingHorizontal: 10, color: 'gray'}}>cm</Text>
      </View>

      {/* Cân nặng */}
      <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 5 }}>Cân nặng</Text>
       <View style={{ flexDirection: 'row', alignItems: 'center', borderColor: 'gray', borderWidth: 1, marginBottom: 20, borderRadius: 5, backgroundColor: '#f9f9f9' }}>
          {/* Icon Placeholder */}
          <View style={{paddingHorizontal: 10}}>{/* Icon */}</View>
          <Controller
            control={control}
            name="weight"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={{ height: 50, flex: 1, paddingHorizontal: 10 }}
                placeholder="Nhập cân nặng (kg)"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                keyboardType="numeric"
              />
            )}
          />
          <Text style={{paddingHorizontal: 10, color: 'gray'}}>kg</Text>
      </View>

      {/* Vòng đầu */}
      <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 5 }}>Vòng đầu</Text>
       <View style={{ flexDirection: 'row', alignItems: 'center', borderColor: 'gray', borderWidth: 1, marginBottom: 20, borderRadius: 5, backgroundColor: '#f9f9f9' }}>
          {/* Icon Placeholder */}
          <View style={{paddingHorizontal: 10}}>{/* Icon */}</View>
          <Controller
            control={control}
            name="headCircumference"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={{ height: 50, flex: 1, paddingHorizontal: 10 }}
                placeholder="Nhập vòng đầu (cm)"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                keyboardType="numeric"
              />
            )}
          />
          <Text style={{paddingHorizontal: 10, color: 'gray'}}>cm</Text>
      </View>

      {/* Ghi chú (tùy chọn) */}
      <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 5 }}>Ghi chú (tùy chọn)</Text>
       <Controller
        control={control}
        name="notes"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={{ height: 100, borderColor: 'gray', borderWidth: 1, marginBottom: 30, paddingHorizontal: 10, paddingTop: 10, borderRadius: 5, backgroundColor: '#f9f9f9' }}
            placeholder="Ghi chú thêm (nếu có)"
            multiline
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
          />
        )}
      />

      {/* CẬP NHẬT CHỈ SỐ button */}
      <TouchableOpacity style={{ backgroundColor: '#007BFF', padding: 15, borderRadius: 5, alignItems: 'center', marginBottom: 40 }} onPress={handleSubmit(onSubmit)}>
        <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>CẬP NHẬT CHỈ SỐ</Text>
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

export default UpdateGrowth; 

