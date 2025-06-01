import React, { useEffect, useLayoutEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native'; // Adjusted imports assuming React Native based on UI style
import { CheckBox } from 'react-native-elements';
import { useForm, Controller } from 'react-hook-form';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const Register = ({ navigation }) => {
  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      babyName: '',
      dateOfBirth: '',
      weight: '',
      height: '',
      headCircumference: '',
      lastVaccinationDate: '',
      selectedVaccine: '',
      healthNotes: '',
      fever: false,
      anorexia: false,
      allergy: false,
      commitAccurateInfo: false,
      agreeShareInfo: false,
    }
  });

  const onSubmit = data => console.log(data);



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
      {/* Placeholder for camera icon */}
      <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#ccc', alignSelf: 'center', marginVertical: 20 }} />
      <Controller
        control={control}
        name="babyName"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={{ height: 50, borderColor: 'gray', borderWidth: 1, marginBottom: 10, paddingHorizontal: 10, borderRadius: 5 }}
            placeholder="Nhập họ và tên bé"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
          />
        )}
      />
      <Controller
        control={control}
        name="dateOfBirth"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={{ height: 50, borderColor: 'gray', borderWidth: 1, marginBottom: 10, paddingHorizontal: 10, borderRadius: 5 }}
            placeholder="Ngày sinh"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
          />
        )}
      />
      <Text style={{ marginBottom: 20, color: 'gray' }}>12 tháng tuổi</Text>

      {/* Chỉ Số Tăng Trưởng */}
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 10, marginBottom: 10 }}>Chỉ Số Tăng Trưởng</Text>
      <Controller
        control={control}
        name="weight"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={{ height: 50, borderColor: 'gray', borderWidth: 1, marginBottom: 10, paddingHorizontal: 10, borderRadius: 5 }}
            placeholder="Cân nặng"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            keyboardType="numeric"
          />
        )}
      />
       <Controller
        control={control}
        name="height"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={{ height: 50, borderColor: 'gray', borderWidth: 1, marginBottom: 10, paddingHorizontal: 10, borderRadius: 5 }}
            placeholder="Chiều cao"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            keyboardType="numeric"
          />
        )}
      />
      {/* Assuming the middle input is also for growth metrics */}
       <Controller
        control={control}
        name="headCircumference"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={{ height: 50, borderColor: 'gray', borderWidth: 1, marginBottom: 10, paddingHorizontal: 10, borderRadius: 5 }}
            placeholder="Vòng đầu (tùy chọn)" // Placeholder based on common growth metrics
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            keyboardType="numeric"
          />
        )}
      />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
          <Text style={{fontSize: 16}}>BMI</Text>
          <Text style={{fontSize: 16, fontWeight: 'bold', color: 'blue'}}>16.5</Text>
      </View>
      <Text style={{marginBottom: 20, color: 'gray'}}>BMI được tính tự động khi nhập cân nặng và chiều cao</Text>

      {/* Lịch Sử Tiêm Chủng */}
       <Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 20,  marginBottom: 10  }}>Lịch Sử Tiêm Chủng</Text>
        <Controller
        control={control}
        name="lastVaccinationDate"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={{ height: 50, borderColor: 'gray', borderWidth: 1, marginBottom: 10, paddingHorizontal: 10, borderRadius: 5 }}
            placeholder="Ngày tiêm gần nhất"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
          />
        )}
      />
        <Controller // Using TextInput for dropdown placeholder
        control={control}
        name="selectedVaccine"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={{ height: 50, borderColor: 'gray', borderWidth: 1, marginBottom: 20, paddingHorizontal: 10, borderRadius: 5 }}
            placeholder="Chọn vaccine đã tiêm"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
          />
        )}
      />
      <TouchableOpacity style={{ backgroundColor: 'blue', padding: 15, borderRadius: 5, alignItems: 'center' }}>
        <Text style={{ color: 'white', fontSize: 18 }}>+ Thêm lịch sử tiêm</Text>
      </TouchableOpacity>

      {/* Theo Dõi Sức Khỏe */}
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 20,  marginBottom: 10  }}>Theo Dõi Sức Khỏe</Text>
       <Controller
        control={control}
        name="healthNotes"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={{ height: 100, borderColor: 'gray', borderWidth: 1, marginBottom: 20, paddingHorizontal: 10, paddingTop: 10, borderRadius: 5 }}
            placeholder="Ghi chú về tình trạng sức khỏe của bé (VD: ho, sốt, phát ban,...)"
            multiline
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
          />
        )}
      />
       <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            {/* Using CheckBox for placeholder, might need a different component in a real app */}
           <Controller
              control={control}
              name="fever"
              render={({ field: { onChange, value } }) => (
                <CheckBox checked={value} onPress={() => onChange(!value)} />
              )}
           />
           <Text style={{marginLeft: 5}}>Sốt kéo dài</Text>
       </View>
       <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <Controller
              control={control}
              name="anorexia"
              render={({ field: { onChange, value } }) => (
                <CheckBox checked={value} onPress={() => onChange(!value)} />
              )}
           />
           <Text style={{marginLeft: 5}}>Biếng ăn</Text>
       </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
            <Controller
              control={control}
              name="allergy"
              render={({ field: { onChange, value } }) => (
                <CheckBox checked={value} onPress={() => onChange(!value)} />
              )}
           />
           <Text style={{marginLeft: 5}}>Dị ứng</Text>
       </View>

       {/* Cam kết và Đồng ý */}
       <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <Controller
              control={control}
              name="commitAccurateInfo"
              render={({ field: { onChange, value } }) => (
                <CheckBox checked={value} onPress={() => onChange(!value)} />
              )}
           />
           <Text style={{marginLeft: 5}}>Tôi cam kết thông tin cung cấp là chính xác và sẽ cập nhật khi có thay đổi.</Text>
       </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
            <Controller
              control={control}
              name="agreeShareInfo"
              render={({ field: { onChange, value } }) => (
                <CheckBox checked={value} onPress={() => onChange(!value)} />
              )}
           />
           <Text style={{marginLeft: 5}}>Tôi đồng ý chia sẻ thông tin này với bác sĩ của bé qua hệ thống.</Text>
       </View>

      <TouchableOpacity style={{ backgroundColor: 'blue', padding: 15, borderRadius: 5, alignItems: 'center', marginBottom: 40 }} onPress={handleSubmit(onSubmit)}>
        <Text style={{ color: 'white', fontSize: 18 }}>Lưu thông tin</Text>
      </TouchableOpacity>

    </ScrollView>
  );
};

export default Register; 