import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, StyleSheet, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import childrenApi from '../store/api/childrenApi';
import { createDailyRecord } from '../store/api/dailyApi';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

const CreateDailyScreen = ({ navigation }) => {
  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      recordDate: '',
      milkAmount: '',
      feedingTimes: '',
      diaperChanges: '',
      sleepHours: '',
      note: '',
    }
  });

  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState(null);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const res = await childrenApi.getMyChildren();
        setChildren(res.data);
        if (res.data.length > 0) setSelectedChildId(res.data[0].childId);
      } catch {
        setChildren([]);
      }
    };
    fetchChildren();
  }, []);

  const onSubmit = async (data) => {
    if (!selectedChildId) return;
    try {
      const payload = {
        childId: selectedChildId,
        recordDate: data.recordDate,
        milkAmount: Number(data.milkAmount),
        feedingTimes: Number(data.feedingTimes),
        diaperChanges: Number(data.diaperChanges),
        sleepHours: Number(data.sleepHours),
        note: data.note || '',
      };
      await createDailyRecord(payload);
      Alert.alert('Thành công', 'Tạo nhật ký thành công!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
      reset();
    } catch (error) {
      Alert.alert('Lỗi', 'Tạo nhật ký thất bại!');
    }
  };

  const selectedChild = children.find(child => child.childId === selectedChildId);

  return (
    <ScrollView style={styles.container}>
      <View style={{...styles.header, marginTop: 20}}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <FontAwesomeIcon icon={faArrowLeft} size={25} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tạo nhật ký hằng ngày</Text>
      </View>

      {/* Child Info and Dropdown */}
      <View style={styles.childInfoContainer}>
        <View style={styles.childInfo}>
          {selectedChild && (
            <Image source={require('../../assets/vnvc.jpg')} style={styles.profileImage} />
          )}
          <View>
            {selectedChild && (
              <Text style={styles.childName}>{selectedChild.fullName}</Text>
            )}
          </View>
        </View>
        <TouchableOpacity style={styles.dropdownToggle} onPress={() => setIsDropdownVisible(!isDropdownVisible)}>
          <FontAwesomeIcon icon={faChevronDown} size={20} color="black" />
        </TouchableOpacity>
      </View>
      {isDropdownVisible && (
        <View style={styles.dropdownContainer}>
          <ScrollView nestedScrollEnabled={true} style={styles.dropdownScroll}>
            {children.map(child => (
              <TouchableOpacity
                key={child.childId}
                style={styles.dropdownItem}
                onPress={() => {
                  setSelectedChildId(child.childId);
                  setIsDropdownVisible(false);
                }}
              >
                <Image source={require('../../assets/vnvc.jpg')} style={styles.dropdownItemImage} />
                <View style={styles.dropdownItemTextContainer}>
                  <Text style={styles.dropdownItemName}>{child.fullName}</Text>
                </View>
                {selectedChildId === child.childId && <Text style={styles.selectedIcon}> ✅</Text>}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Form fields */}
      <Text style={styles.label}>Ngày ghi nhận</Text>
      <Controller
        control={control}
        name="recordDate"
        rules={{ required: 'Vui lòng nhập ngày ghi nhận' }}
        render={({ field: { onChange, value } }) => {
          const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
          return (
            <>
              <TouchableOpacity
                onPress={() => setDatePickerVisibility(true)}
                style={styles.input}
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
      {errors.recordDate && <Text style={styles.error}>{errors.recordDate.message}</Text>}

      <Text style={styles.label}>Lượng sữa (ml)</Text>
      <Controller
        control={control}
        name="milkAmount"
        rules={{ required: 'Vui lòng nhập lượng sữa' }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Nhập lượng sữa (ml)"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            keyboardType="numeric"
          />
        )}
      />
      {errors.milkAmount && <Text style={styles.error}>{errors.milkAmount.message}</Text>}

      <Text style={styles.label}>Số lần bú</Text>
      <Controller
        control={control}
        name="feedingTimes"
        rules={{ required: 'Vui lòng nhập số lần bú' }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Nhập số lần bú"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            keyboardType="numeric"
          />
        )}
      />
      {errors.feedingTimes && <Text style={styles.error}>{errors.feedingTimes.message}</Text>}

      <Text style={styles.label}>Số lần thay tã</Text>
      <Controller
        control={control}
        name="diaperChanges"
        rules={{ required: 'Vui lòng nhập số lần thay tã' }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Nhập số lần thay tã"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            keyboardType="numeric"
          />
        )}
      />
      {errors.diaperChanges && <Text style={styles.error}>{errors.diaperChanges.message}</Text>}

      <Text style={styles.label}>Số giờ ngủ</Text>
      <Controller
        control={control}
        name="sleepHours"
        rules={{ required: 'Vui lòng nhập số giờ ngủ' }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Nhập số giờ ngủ"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            keyboardType="numeric"
          />
        )}
      />
      {errors.sleepHours && <Text style={styles.error}>{errors.sleepHours.message}</Text>}

      <Text style={styles.label}>Ghi chú (tùy chọn)</Text>
      <Controller
        control={control}
        name="note"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={[styles.input, { height: 80 }]}
            placeholder="Ghi chú thêm (nếu có)"
            multiline
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
          />
        )}
      />

      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit(onSubmit)}>
        <Text style={styles.submitText}>TẠO NHẬT KÝ</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', flex: 1 },
  childInfoContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f0f0', padding: 15, borderRadius: 10, marginBottom: 20 },
  childInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  profileImage: { width: 50, height: 50, borderRadius: 25, marginRight: 15 },
  childName: { fontSize: 18, fontWeight: 'bold' },
  dropdownToggle: { marginLeft: 'auto', paddingHorizontal: 10 },
  dropdownContainer: { backgroundColor: '#fff', borderRadius: 5, borderWidth: 1, borderColor: '#ccc', zIndex: 1, marginBottom: 10, marginTop: -15 },
  dropdownScroll: { maxHeight: 150 },
  dropdownItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  dropdownItemImage: { width: 30, height: 30, borderRadius: 15, marginRight: 10 },
  dropdownItemTextContainer: { flex: 1 },
  dropdownItemName: { fontSize: 16, fontWeight: 'bold' },
  selectedIcon: { color: 'green', fontSize: 16, marginLeft: 10 },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  input: { height: 50, borderColor: 'gray', borderWidth: 1, marginBottom: 15, paddingHorizontal: 10, borderRadius: 5, backgroundColor: '#f9f9f9' },
  error: { color: 'red', marginBottom: 10 },
  submitBtn: { backgroundColor: '#007BFF', padding: 15, borderRadius: 5, alignItems: 'center', marginBottom: 40 },
  submitText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});

export default CreateDailyScreen; 