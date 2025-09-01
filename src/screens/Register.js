// screens/Register.js
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  Platform,
  ActionSheetIOS,
  Modal,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';

// Sử dụng client multipart riêng
import { registerChildWithGrowth } from '../store/api/childRegisterApi';

const Register = ({ navigation }) => {
  // ---- UI states
  const [showBloodTypePicker, setShowBloodTypePicker] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isCreatedAtPickerVisible, setCreatedAtPickerVisibility] = useState(false);
  const [avatar, setAvatar] = useState(null); // { uri, fileName, type }
  const [isHeadCircumferenceModalVisible, setIsHeadCircumferenceModalVisible] = useState(false);

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  // ---- Form
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
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
      createdAt: '',
    },
    mode: 'onChange',
  });

  // ====== IMAGE PICKER ======
  const pickFromLibrary = useCallback(async () => {
    const res = await launchImageLibrary({
      mediaType: 'photo',
      includeBase64: false,
      quality: 0.8,
      selectionLimit: 1,
      maxWidth: 1024,
      maxHeight: 1024,
    });

    if (res?.didCancel) return;
    if (res?.errorCode) {
      Alert.alert('Lỗi chọn ảnh', res.errorMessage || res.errorCode);
      return;
    }
    const a = res.assets?.[0];
    if (a?.uri) {
      setAvatar({
        uri: a.uri,
        fileName: a.fileName || `avatar_${Date.now()}.jpg`,
        type: a.type || 'image/jpeg',
      });
    }
  }, []);

  const takePhoto = useCallback(async () => {
    const res = await launchCamera({
      mediaType: 'photo',
      includeBase64: false,
      quality: 0.8,
      maxWidth: 1024,
      maxHeight: 1024,
      saveToPhotos: false,
    });

    if (res?.didCancel) return;
    if (res?.errorCode) {
      Alert.alert('Lỗi chụp ảnh', res.errorMessage || res.errorCode);
      return;
    }
    const a = res.assets?.[0];
    if (a?.uri) {
      setAvatar({
        uri: a.uri,
        fileName: a.fileName || `avatar_${Date.now()}.jpg`,
        type: a.type || 'image/jpeg',
      });
    }
  }, []);

  const openAvatarMenu = useCallback(() => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Hủy', 'Chọn từ thư viện', 'Chụp ảnh'],
          cancelButtonIndex: 0,
        },
        (idx) => {
          if (idx === 1) pickFromLibrary();
          if (idx === 2) takePhoto();
        }
      );
    } else {
      Alert.alert('Chọn ảnh', 'Bạn muốn lấy ảnh từ đâu?', [
        { text: 'Thư viện', onPress: pickFromLibrary },
        { text: 'Hủy', style: 'cancel' },
      ]);
    }
  }, [pickFromLibrary, takePhoto]);

  // ---- Helpers
  // "YYYY-MM-DD" -> "YYYY/MM/DD"
  const toApiDate = (yyyyDashMmDashDd) => {
    if (!yyyyDashMmDashDd) return '';
    return yyyyDashMmDashDd.split('-').join('/');
  };

  const closeHeadCircumferenceInstructions = () => {
    setIsHeadCircumferenceModalVisible(false);
  };

  // ====== SUBMIT ======
  const onSubmit = async (data) => {
    try {
      // Validate cơ bản
      if (!data.fullName || data.fullName.trim().length < 2) {
        Alert.alert('Lỗi', 'Vui lòng nhập họ tên bé (ít nhất 2 ký tự)');
        return;
      }
      if (!data.birthDate) {
        Alert.alert('Lỗi', 'Vui lòng chọn ngày sinh');
        return;
      }
      if (!data.gender) {
        Alert.alert('Lỗi', 'Vui lòng chọn giới tính');
        return;
      }
      if (!data.bloodType) {
        Alert.alert('Lỗi', 'Vui lòng chọn nhóm máu');
        return;
      }
      if (!data.weight || parseFloat(data.weight) < 0.5 || parseFloat(data.weight) > 200) {
        Alert.alert('Lỗi', 'Cân nặng phải từ 0.5 đến 200 kg');
        return;
      }
      if (!data.height || parseFloat(data.height) < 30 || parseFloat(data.height) > 250) {
        Alert.alert('Lỗi', 'Chiều cao phải từ 30 đến 250 cm');
        return;
      }
      if (!data.createdAt) {
        Alert.alert('Lỗi', 'Vui lòng chọn ngày ghi chỉ số');
        return;
      }
      if (data.headCircumference && (parseFloat(data.headCircumference) < 20 || parseFloat(data.headCircumference) > 100)) {
        Alert.alert('Lỗi', 'Vòng đầu phải từ 20 đến 100 cm');
        return;
      }

      const genderApi = data.gender === 'Nam' ? 'Male' : 'Female';

      // FormData multipart đúng chuẩn
      const form = new FormData();
      form.append('FullName', data.fullName.trim());
      form.append('BirthDate', toApiDate(data.birthDate));   // "YYYY/MM/DD"
      form.append('Gender', genderApi);
      form.append('BloodType', data.bloodType);
      form.append('AllergiesNotes', data.allergiesNotes?.trim() || '');
      form.append('MedicalHistory', data.medicalHistory?.trim() || '');
      form.append('Height', String(data.height));
      form.append('Weight', String(data.weight));
      form.append('HeadCircumference', String(data.headCircumference || '0'));
      form.append('CreatedAt', toApiDate(data.createdAt));   // "YYYY/MM/DD"
      form.append('GrowthNote', data.growthNote?.trim() || '');

      if (avatar?.uri) {
        const imageUri = Platform.OS === 'ios' ? avatar.uri.replace('file://', '') : avatar.uri;
        form.append('Image', {
          uri: imageUri,
          name: avatar.fileName || 'avatar.jpg',
          type: avatar.type || 'image/jpeg',
        });
      }
      // KHÔNG append 'Image' nếu không có ảnh

      // Debug
      console.log('=== PAYLOAD DEBUG ===');
      console.log('FullName:', data.fullName.trim());
      console.log('BirthDate:', toApiDate(data.birthDate));
      console.log('CreatedAt:', toApiDate(data.createdAt));
      console.log('Gender:', genderApi);
      console.log('BloodType:', data.bloodType);
      console.log('Weight:', data.weight);
      console.log('Height:', data.height);
      console.log('AllergiesNotes:', data.allergiesNotes?.trim() || '');
      console.log('MedicalHistory:', data.medicalHistory?.trim() || '');
      console.log('HeadCircumference:', data.headCircumference || '0');
      console.log('GrowthNote:', data.growthNote?.trim() || '');
      console.log('Avatar object:', avatar);
      console.log('Has image:', !!avatar?.uri);
      console.log('====================');

      // CALL API multipart
      const response = await registerChildWithGrowth(form);

      console.log('=== SUCCESS RESPONSE ===');
      console.log('Response:', response);
      console.log('====================');

      Alert.alert(
        'Đăng ký thành công!',
        response?.message || 'Thông tin bé đã được lưu thành công!',
        [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
      );
    } catch (error) {
      console.log('Register error:', error?.message);
      console.log('Error response:', error?.response?.data);
      console.log('Error status:', error?.response?.status);

      const msg =
        error?.response?.data?.message ||
        error?.response?.data ||
        error?.message ||
        'Có lỗi xảy ra khi lưu thông tin bé. Vui lòng thử lại!';
      Alert.alert('Đăng ký thất bại', String(msg));
    }
  };

  return (
    <ScrollView style={{ flex: 1, padding: 20, backgroundColor: '#fff' }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 20 }}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <FontAwesomeIcon icon={faArrowLeft} size={25} color="black" />
        </TouchableOpacity>
        <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', flex: 1 }}>Đăng Ký Thông Tin Bé</Text>
      </View>

      {/* Thông tin bé */}
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 20 }}>Thông Tin Bé</Text>

      {/* Avatar */}
      <View style={{ alignItems: 'center', marginVertical: 16 }}>
        <TouchableOpacity
          onPress={openAvatarMenu}
          style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: '#eee',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: '#ddd',
          }}
        >
          {avatar?.uri ? (
            <Image source={{ uri: avatar.uri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
          ) : (
            <Text>+ Ảnh</Text>
          )}
        </TouchableOpacity>
        <Text style={{ marginTop: 8, color: '#666' }}>Chạm để chọn/chụp ảnh (không bắt buộc)</Text>
      </View>

      {/* Họ tên */}
      <Text style={{ fontSize: 16, marginBottom: 5, fontWeight: '500' }}>Họ và tên bé</Text>
      <Controller
        control={control}
        name="fullName"
        rules={{
          required: 'Vui lòng nhập họ tên bé',
          minLength: { value: 2, message: 'Họ tên phải có ít nhất 2 ký tự' },
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={{
              height: 50,
              borderColor: errors.fullName ? 'red' : 'gray',
              borderWidth: 1,
              marginBottom: 10,
              paddingHorizontal: 10,
              borderRadius: 5,
            }}
            placeholder="Nhập họ và tên bé"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            autoCapitalize="words"
            importantForAutofill="no"
          />
        )}
      />
      {errors.fullName && <Text style={{ color: 'red', marginBottom: 10 }}>{errors.fullName.message}</Text>}

      {/* Ngày sinh */}
      <Text style={{ fontSize: 16, marginBottom: 5, fontWeight: '500' }}>Ngày sinh</Text>
      <Controller
        control={control}
        name="birthDate"
        rules={{ required: 'Vui lòng chọn ngày sinh' }}
        render={({ field: { onChange, value } }) => (
          <>
            <TouchableOpacity
              onPress={() => setDatePickerVisibility(true)}
              style={{
                height: 50,
                borderColor: errors.birthDate ? 'red' : 'gray',
                borderWidth: 1,
                marginBottom: 10,
                paddingHorizontal: 10,
                borderRadius: 5,
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: value ? 'black' : '#aaa' }}>{value ? value : 'Chọn ngày sinh'}</Text>
            </TouchableOpacity>
            <DateTimePickerModal
              isVisible={isDatePickerVisible}
              mode="date"
              onConfirm={(date) => {
                setDatePickerVisibility(false);
                const formatted = date.toISOString().split('T')[0]; // YYYY-MM-DD
                onChange(formatted);
              }}
              onCancel={() => setDatePickerVisibility(false)}
              maximumDate={new Date()}
            />
          </>
        )}
      />
      {errors.birthDate && <Text style={{ color: 'red', marginBottom: 10 }}>{errors.birthDate.message}</Text>}

      {/* Giới tính */}
      <Text style={{ fontSize: 16, marginBottom: 10, fontWeight: '500' }}>Giới tính</Text>
      <Controller
        control={control}
        name="gender"
        rules={{ required: 'Vui lòng chọn giới tính' }}
        render={({ field: { onChange, value } }) => (
          <View style={{ flexDirection: 'row', marginBottom: 10 }}>
            {/* Nam */}
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginRight: 20 }} onPress={() => onChange('Nam')}>
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
                {value === 'Nam' && <View style={{ height: 12, width: 12, borderRadius: 6, backgroundColor: '#007bff' }} />}
              </View>
              <Text style={{ fontSize: 16, color: '#222' }}>Nam</Text>
            </TouchableOpacity>

            {/* Nữ */}
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={() => onChange('Nữ')}>
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
                {value === 'Nữ' && <View style={{ height: 12, width: 12, borderRadius: 6, backgroundColor: '#007bff' }} />}
              </View>
              <Text style={{ fontSize: 16, color: '#222' }}>Nữ</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      {errors.gender && <Text style={{ color: 'red', marginBottom: 10 }}>{errors.gender.message}</Text>}

      {/* Nhóm máu */}
      <Text style={{ fontSize: 16, marginBottom: 5, fontWeight: '500' }}>Nhóm máu</Text>
      <Controller
        control={control}
        name="bloodType"
        rules={{ required: 'Vui lòng chọn nhóm máu' }}
        render={({ field: { onChange, value } }) => (
          <View style={{ position: 'relative', zIndex: 1000 }}>
            <TouchableOpacity
              onPress={() => setShowBloodTypePicker(!showBloodTypePicker)}
              style={{
                height: 50,
                borderColor: errors.bloodType ? 'red' : 'gray',
                borderWidth: 1,
                marginBottom: showBloodTypePicker ? 0 : 10,
                paddingHorizontal: 10,
                borderRadius: 5,
                borderBottomLeftRadius: showBloodTypePicker ? 0 : 5,
                borderBottomRightRadius: showBloodTypePicker ? 0 : 5,
                justifyContent: 'space-between',
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Text style={{ color: value ? 'black' : '#aaa' }}>{value ? value : 'Chọn nhóm máu'}</Text>
              <Text style={{ color: '#666', fontSize: 16 }}>{showBloodTypePicker ? '▲' : '▼'}</Text>
            </TouchableOpacity>

            {showBloodTypePicker && (
              <View
                style={{
                  borderWidth: 1,
                  borderColor: 'gray',
                  borderTopWidth: 0,
                  borderBottomLeftRadius: 5,
                  borderBottomRightRadius: 5,
                  backgroundColor: 'white',
                  marginBottom: 10,
                  height: 144,
                  elevation: 5,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84,
                }}
              >
                <ScrollView nestedScrollEnabled>
                  {bloodTypes.map((type, index) => (
                    <TouchableOpacity
                      key={type}
                      style={{
                        padding: 12,
                        height: 48,
                        justifyContent: 'center',
                        borderBottomWidth: index < bloodTypes.length - 1 ? 1 : 0,
                        borderBottomColor: '#eee',
                        backgroundColor: value === type ? '#f0f8ff' : 'white',
                      }}
                      onPress={() => {
                        onChange(type);
                        setShowBloodTypePicker(false);
                      }}
                    >
                      <Text style={{ fontSize: 16, color: value === type ? '#007bff' : '#333' }}>{type}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        )}
      />
      {errors.bloodType && <Text style={{ color: 'red', marginBottom: 10 }}>{errors.bloodType.message}</Text>}

      {/* Dị ứng */}
      <Text style={{ fontSize: 16, marginBottom: 5, fontWeight: '500' }}>Ghi chú dị ứng</Text>
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
            autoCapitalize="sentences"
            importantForAutofill="no"
          />
        )}
      />

      {/* Tiền sử bệnh */}
      <Text style={{ fontSize: 16, marginBottom: 5, fontWeight: '500' }}>Tiền sử bệnh</Text>
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
            autoCapitalize="sentences"
            importantForAutofill="no"
          />
        )}
      />

      {/* Chỉ số tăng trưởng */}
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 10, marginBottom: 10 }}>Chỉ Số Tăng Trưởng</Text>

      <Text style={{ fontSize: 16, marginBottom: 5, fontWeight: '500' }}>Cân nặng</Text>
      <Controller
        control={control}
        name="weight"
        rules={{
          required: 'Vui lòng nhập cân nặng',
          min: { value: 0.5, message: 'Cân nặng phải từ 0.5 kg trở lên' },
          max: { value: 200, message: 'Cân nặng không được vượt quá 200 kg' },
          pattern: { value: /^\d+(\.\d{1,2})?$/, message: 'Cân nặng phải là số hợp lệ' },
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={{
              height: 50,
              borderColor: errors.weight ? 'red' : 'gray',
              borderWidth: 1,
              marginBottom: 10,
              paddingHorizontal: 10,
              borderRadius: 5,
            }}
            placeholder="Cân nặng (kg)"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            keyboardType="numeric"
            importantForAutofill="no"
          />
        )}
      />
      {errors.weight && <Text style={{ color: 'red', marginBottom: 10 }}>{errors.weight.message}</Text>}

      <Text style={{ fontSize: 16, marginBottom: 5, fontWeight: '500' }}>Chiều cao</Text>
      <Controller
        control={control}
        name="height"
        rules={{
          required: 'Vui lòng nhập chiều cao',
          min: { value: 30, message: 'Chiều cao phải từ 30 cm trở lên' },
          max: { value: 250, message: 'Chiều cao không được vượt quá 250 cm' },
          pattern: { value: /^\d+(\.\d{1,2})?$/, message: 'Chiều cao phải là số hợp lệ' },
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={{
              height: 50,
              borderColor: errors.height ? 'red' : 'gray',
              borderWidth: 1,
              marginBottom: 10,
              paddingHorizontal: 10,
              borderRadius: 5,
            }}
            placeholder="Chiều cao (cm)"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            keyboardType="numeric"
            importantForAutofill="no"
          />
        )}
      />
      {errors.height && <Text style={{ color: 'red', marginBottom: 10 }}>{errors.height.message}</Text>}

      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
        <Text style={{ fontSize: 16, fontWeight: '500' }}>Vòng đầu</Text>
        <TouchableOpacity onPress={() => setIsHeadCircumferenceModalVisible(true)} style={{ marginLeft: 8 }}>
          <Text style={{ color: '#007bff', fontSize: 18, fontWeight: 'bold' }}>?</Text>
        </TouchableOpacity>
      </View>
      <Controller
        control={control}
        name="headCircumference"
        rules={{
          pattern: { value: /^\d+(\.\d{1,2})?$/, message: 'Vòng đầu phải là số hợp lệ' },
          min: { value: 20, message: 'Vòng đầu phải từ 20 cm trở lên' },
          max: { value: 100, message: 'Vòng đầu không được vượt quá 100 cm' },
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={{
              height: 50,
              borderColor: errors.headCircumference ? 'red' : 'gray',
              borderWidth: 1,
              marginBottom: 10,
              paddingHorizontal: 10,
              borderRadius: 5,
            }}
            placeholder="Vòng đầu (cm)"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            keyboardType="numeric"
            importantForAutofill="no"
          />
        )}
      />
      {errors.headCircumference && <Text style={{ color: 'red', marginBottom: 10 }}>{errors.headCircumference.message}</Text>}

      {/* Head Circumference Instructions Modal */}
      <Modal
        visible={isHeadCircumferenceModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeHeadCircumferenceInstructions}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        }}>
          <View style={{
            backgroundColor: '#fff',
            borderRadius: 12,
            width: '100%',
            maxWidth: 350,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 5,
          }}>
            {/* Modal Header */}
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: '#e0e0e0',
              backgroundColor: '#f8f9fa',
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
            }}>
              <Text style={{
                fontSize: 18,
                fontWeight: '600',
                color: '#333',
                flex: 1,
              }}>Hướng dẫn đo vòng đầu</Text>
              <TouchableOpacity 
                onPress={closeHeadCircumferenceInstructions} 
                style={{
                  padding: 4,
                  borderRadius: 16,
                  backgroundColor: '#e0e0e0',
                  width: 32,
                  height: 32,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 18, color: '#666', fontWeight: 'bold' }}>×</Text>
              </TouchableOpacity>
            </View>

            {/* Modal Content */}
            <View style={{
              padding: 16,
              maxHeight: 400,
            }}>
              <Text style={{
                fontSize: 15,
                color: '#333',
                lineHeight: 22,
                marginBottom: 16,
                fontWeight: '500',
              }}>
                Cách đo vòng đầu cho trẻ:
              </Text>
              
              <View style={{ marginBottom: 16 }}>
                <Text style={{
                  fontSize: 14,
                  color: '#555',
                  lineHeight: 20,
                  marginBottom: 8,
                }}>
                  1. Dùng thước dây mềm.
                </Text>
                
                <Text style={{
                  fontSize: 14,
                  color: '#555',
                  lineHeight: 20,
                  marginBottom: 8,
                }}>
                  2. Quấn thước quanh đầu bé, đi qua:
                </Text>
                
                <Text style={{
                  fontSize: 14,
                  color: '#555',
                  lineHeight: 20,
                  marginBottom: 8,
                  marginLeft: 16,
                }}>
                  3. Trán cao nhất (trên chân mày một chút).
                </Text>
                
                <Text style={{
                  fontSize: 14,
                  color: '#555',
                  lineHeight: 20,
                  marginBottom: 8,
                  marginLeft: 16,
                }}>
                  4. Phần sau đầu nhô nhất (xương chẩm).
                </Text>
                
                <Text style={{
                  fontSize: 14,
                  color: '#555',
                  lineHeight: 20,
                  marginBottom: 8,
                }}>
                  5. Giữ thước nằm ngang, không xoắn.
                </Text>
                
                <Text style={{
                  fontSize: 14,
                  color: '#555',
                  lineHeight: 20,
                  marginBottom: 8,
                }}>
                  6. Đọc số đo, chính xác đến 0,1 cm. (Nên đo 2–3 lần và lấy kết quả trung bình.)
                </Text>
              </View>
            </View>

            {/* Modal Footer */}
            <View style={{
              padding: 16,
              borderTopWidth: 1,
              borderTopColor: '#e0e0e0',
              backgroundColor: '#f8f9fa',
              borderBottomLeftRadius: 12,
              borderBottomRightRadius: 12,
            }}>
              <TouchableOpacity 
                style={{
                  backgroundColor: '#007bff',
                  paddingVertical: 12,
                  borderRadius: 8,
                  alignItems: 'center',
                  shadowColor: '#007bff',
                  shadowOffset: {
                    width: 0,
                    height: 2,
                  },
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                  elevation: 3,
                }}
                onPress={closeHeadCircumferenceInstructions}
              >
                <Text style={{
                  color: '#fff',
                  fontSize: 15,
                  fontWeight: '600',
                }}>Đã hiểu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Ngày ghi chỉ số tăng trưởng */}
      <Text style={{ fontSize: 16, marginBottom: 5, fontWeight: '500' }}>Ngày ghi chỉ số tăng trưởng</Text>
      <Controller
        control={control}
        name="createdAt"
        rules={{ required: 'Vui lòng chọn ngày ghi chỉ số' }}
        render={({ field: { onChange, value } }) => (
          <>
            <TouchableOpacity
              onPress={() => setCreatedAtPickerVisibility(true)}
              style={{
                height: 50,
                borderColor: errors.createdAt ? 'red' : 'gray',
                borderWidth: 1,
                marginBottom: 10,
                paddingHorizontal: 10,
                borderRadius: 5,
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: value ? 'black' : '#aaa' }}>{value ? value : 'Chọn ngày ghi chỉ số'}</Text>
            </TouchableOpacity>
            <DateTimePickerModal
              isVisible={isCreatedAtPickerVisible}
              mode="date"
              onConfirm={(date) => {
                setCreatedAtPickerVisibility(false);
                const formatted = date.toISOString().split('T')[0]; // YYYY-MM-DD
                onChange(formatted);
              }}
              onCancel={() => setCreatedAtPickerVisibility(false)}
              maximumDate={new Date()}
            />
          </>
        )}
      />
      {errors.createdAt && <Text style={{ color: 'red', marginBottom: 10 }}>{errors.createdAt.message}</Text>}

      {/* Ghi chú tăng trưởng */}
      <Text style={{ fontSize: 16, marginBottom: 5, fontWeight: '500' }}>Ghi chú tăng trưởng</Text>
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
            autoCapitalize="sentences"
            importantForAutofill="no"
          />
        )}
      />

      {/* Submit */}
      <TouchableOpacity
        style={{
          backgroundColor: Object.keys(errors).length > 0 ? '#ccc' : 'blue',
          padding: 15,
          borderRadius: 5,
          alignItems: 'center',
          marginBottom: 40,
        }}
        onPress={handleSubmit(onSubmit)}
        disabled={Object.keys(errors).length > 0}
      >
        <Text style={{ color: 'white', fontSize: 18 }}>
          {Object.keys(errors).length > 0 ? 'Vui lòng kiểm tra lại thông tin' : 'Lưu thông tin'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default Register;
