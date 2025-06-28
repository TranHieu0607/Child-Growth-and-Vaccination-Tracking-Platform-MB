import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native'; // Adjusted imports assuming React Native based on UI style
import { CheckBox } from 'react-native-elements';
import { useForm, Controller } from 'react-hook-form';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useDispatch } from 'react-redux';
import { register as registerChild } from '../store/authSlice';
import childrenApi from '../store/api/childrenApi';
import { registerChildWithGrowth } from '../store/api/childRegisterApi';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

const Register = ({ navigation }) => {
  const dispatch = useDispatch();
  const { control, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    defaultValues: {
      fullName: '',
      birthDate: '',
      gender: 'Nam',
      bloodType: '',
      allergiesNotes: '',
      medicalHistory: '',
      height: '',
      weight: '',
      headCircumference: '',
      growthNote: '',
    }
  });

  const onSubmit = async (data) => {
    try {
      const genderApi = data.gender === 'Nam' ? 'male' : 'female';
      const payload = {
        ...data,
        gender: genderApi,
        height: Number(data.height),
        weight: Number(data.weight),
        headCircumference: Number(data.headCircumference),
        growthNote: data.growthNote,
      };
      const response = await registerChildWithGrowth(payload);
      alert(response.message || 'Tạo trẻ thành công!');
      navigation.navigate('Home');
    } catch (error) {
      alert(error.response?.data?.message || 'Tạo trẻ thất bại!');
    }
  };

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <FontAwesomeIcon icon={faArrowLeft} size={25} color="black" />
        </TouchableOpacity>
        <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', flex: 1 }}>Đăng Ký Thông Tin Bé</Text>
      </View>

      {/* Thông Tin Bé */}
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 20 }}>Thông Tin Bé</Text>
      <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#ccc', alignSelf: 'center', marginVertical: 20 }} />
      <Controller
        control={control}
        name="fullName"
        rules={{ required: 'Vui lòng nhập họ tên bé' }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={{ height: 50, borderColor: 'gray', borderWidth: 1, marginBottom: 10, paddingHorizontal: 10, borderRadius: 5 }}
            placeholder="Nhập họ và tên bé"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            autoCapitalize="none"
            importantForAutofill="no"
          />
        )}
      />
      {errors.fullName && <Text style={{ color: 'red' }}>{errors.fullName.message}</Text>}
      <Controller
        control={control}
        name="birthDate"
        rules={{ required: 'Vui lòng nhập ngày sinh (YYYY-MM-DD)' }}
        render={({ field: { onChange, value } }) => {
          const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
          return (
            <>
              <TouchableOpacity
                onPress={() => setDatePickerVisibility(true)}
                style={{ height: 50, borderColor: 'gray', borderWidth: 1, marginBottom: 10, paddingHorizontal: 10, borderRadius: 5, justifyContent: 'center' }}
              >
                <Text style={{ color: value ? 'black' : '#aaa' }}>
                  {value ? value : 'Ngày sinh (YYYY-MM-DD)'}
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
      {errors.birthDate && <Text style={{ color: 'red' }}>{errors.birthDate.message}</Text>}
      {/* Giới tính */}
      <Text style={{ marginBottom: 10 }}>Giới tính</Text>
      <Controller
        control={control}
        name="gender"
        render={({ field: { onChange, value } }) => (
          <View style={{ flexDirection: 'row', marginBottom: 10 }}>
            {/* Radio Nam */}
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', marginRight: 20 }}
              onPress={() => onChange('Nam')}
            >
              <View
                style={{
                  height: 24,
                  width: 24,
                  borderRadius: 12,
                  borderWidth: 2,
                  borderColor: value === 'Nam' ? '#007bff' : '#ccc',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 8,
                }}
              >
                {value === 'Nam' && (
                  <View
                    style={{
                      height: 12,
                      width: 12,
                      borderRadius: 6,
                      backgroundColor: '#007bff',
                    }}
                  />
                )}
              </View>
              <Text style={{ fontSize: 16, color: '#222' }}>Nam</Text>
            </TouchableOpacity>
            {/* Radio Nữ */}
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center' }}
              onPress={() => onChange('Nữ')}
            >
              <View
                style={{
                  height: 24,
                  width: 24,
                  borderRadius: 12,
                  borderWidth: 2,
                  borderColor: value === 'Nữ' ? '#007bff' : '#ccc',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 8,
                }}
              >
                {value === 'Nữ' && (
                  <View
                    style={{
                      height: 12,
                      width: 12,
                      borderRadius: 6,
                      backgroundColor: '#007bff',
                    }}
                  />
                )}
              </View>
              <Text style={{ fontSize: 16, color: '#222' }}>Nữ</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      {/* Nhóm máu */}
      <Controller
        control={control}
        name="bloodType"
        rules={{ required: 'Vui lòng nhập nhóm máu (ví dụ: O-, A+,...)' }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={{ height: 50, borderColor: 'gray', borderWidth: 1, marginBottom: 10, paddingHorizontal: 10, borderRadius: 5 }}
            placeholder="Nhóm máu (ví dụ: O-, A+,...)"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            autoCapitalize="none"
            importantForAutofill="no"
          />
        )}
      />
      {errors.bloodType && <Text style={{ color: 'red' }}>{errors.bloodType.message}</Text>}
      {/* Dị ứng */}
      <Controller
        control={control}
        name="allergiesNotes"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={{ height: 50, borderColor: 'gray', borderWidth: 1, marginBottom: 10, paddingHorizontal: 10, borderRadius: 5 }}
            placeholder="Ghi chú dị ứng (nếu có)"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            autoCapitalize="none"
            importantForAutofill="no"
          />
        )}
      />
      {/* Tiền sử bệnh */}
      <Controller
        control={control}
        name="medicalHistory"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={{ height: 50, borderColor: 'gray', borderWidth: 1, marginBottom: 10, paddingHorizontal: 10, borderRadius: 5 }}
            placeholder="Tiền sử bệnh (nếu có)"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            autoCapitalize="none"
            importantForAutofill="no"
          />
        )}
      />
      {/* Chỉ số tăng trưởng */}
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 10, marginBottom: 10 }}>Chỉ Số Tăng Trưởng</Text>
      <Controller
        control={control}
        name="weight"
        rules={{ required: 'Vui lòng nhập cân nặng' }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={{ height: 50, borderColor: 'gray', borderWidth: 1, marginBottom: 10, paddingHorizontal: 10, borderRadius: 5 }}
            placeholder="Cân nặng (kg)"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            keyboardType="numeric"
            importantForAutofill="no"
          />
        )}
      />
      {errors.weight && <Text style={{ color: 'red' }}>{errors.weight.message}</Text>}
      <Controller
        control={control}
        name="height"
        rules={{ required: 'Vui lòng nhập chiều cao' }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={{ height: 50, borderColor: 'gray', borderWidth: 1, marginBottom: 10, paddingHorizontal: 10, borderRadius: 5 }}
            placeholder="Chiều cao (cm)"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            keyboardType="numeric"
            importantForAutofill="no"
          />
        )}
      />
      {errors.height && <Text style={{ color: 'red' }}>{errors.height.message}</Text>}
      <Controller
        control={control}
        name="headCircumference"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={{ height: 50, borderColor: 'gray', borderWidth: 1, marginBottom: 10, paddingHorizontal: 10, borderRadius: 5 }}
            placeholder="Vòng đầu (cm, tuỳ chọn)"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            keyboardType="numeric"
            importantForAutofill="no"
          />
        )}
      />
      {/* Ghi chú tăng trưởng */}
      <Controller
        control={control}
        name="growthNote"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={{ height: 80, borderColor: 'gray', borderWidth: 1, marginBottom: 20, paddingHorizontal: 10, borderRadius: 5 }}
            placeholder="Ghi chú tăng trưởng (nếu có)"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            multiline
            autoCapitalize="none"
            importantForAutofill="no"
          />
        )}
      />
      {/* Lịch sử tiêm chủng - ĐÃ COMMENT */}
      {/*
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 20,  marginBottom: 10  }}>Lịch Sử Tiêm Chủng</Text>
      ...
      */}
      {/* Theo dõi sức khỏe - ĐÃ COMMENT */}
      {/*
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 20,  marginBottom: 10  }}>Theo Dõi Sức Khỏe</Text>
      ...
      */}
      <TouchableOpacity style={{ backgroundColor: 'blue', padding: 15, borderRadius: 5, alignItems: 'center', marginBottom: 40 }} onPress={handleSubmit(onSubmit)}>
        <Text style={{ color: 'white', fontSize: 18 }}>Lưu thông tin</Text>
      </TouchableOpacity>

    </ScrollView>
  );
};

export default Register; 