import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';

export default function RegisterScreen({ onRegister, navigation }) {
  const [form, setForm] = useState({
    accountName: '',
    password: '',
    email: '',
    fullName: '',
    phone: '',
    address: '',
  });

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  const handleRegister = () => {
    if (onRegister) onRegister(form);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={require('../../assets/icon.png')} style={styles.avatar} />
      <Text style={styles.title}>KidCare</Text>
      <Text style={styles.welcome}>Tạo tài khoản mới</Text>
      <Text style={styles.subtitle}>Đăng ký để theo dõi tiêm chủng và phát triển của bé</Text>
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Tên tài khoản</Text>
        <View style={styles.inputBox}>
          <TextInput
            style={styles.input}
            placeholder="Nhập tên tài khoản"
            value={form.accountName}
            onChangeText={v => handleChange('accountName', v)}
            autoCapitalize="none"
          />
        </View>
        <Text style={styles.inputLabel}>Mật khẩu</Text>
        <View style={styles.inputBox}>
          <TextInput
            style={styles.input}
            placeholder="Nhập mật khẩu"
            value={form.password}
            onChangeText={v => handleChange('password', v)}
            secureTextEntry
          />
        </View>
        <Text style={styles.inputLabel}>Email</Text>
        <View style={styles.inputBox}>
          <TextInput
            style={styles.input}
            placeholder="Nhập email"
            value={form.email}
            onChangeText={v => handleChange('email', v)}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        <Text style={styles.inputLabel}>Họ và tên</Text>
        <View style={styles.inputBox}>
          <TextInput
            style={styles.input}
            placeholder="Nhập họ và tên"
            value={form.fullName}
            onChangeText={v => handleChange('fullName', v)}
          />
        </View>
        <Text style={styles.inputLabel}>Số điện thoại</Text>
        <View style={styles.inputBox}>
          <TextInput
            style={styles.input}
            placeholder="Nhập số điện thoại"
            value={form.phone}
            onChangeText={v => handleChange('phone', v)}
            keyboardType="phone-pad"
          />
        </View>
        <Text style={styles.inputLabel}>Địa chỉ</Text>
        <View style={styles.inputBox}>
          <TextInput
            style={styles.input}
            placeholder="Nhập địa chỉ"
            value={form.address}
            onChangeText={v => handleChange('address', v)}
          />
        </View>
      </View>
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Đăng ký</Text>
      </TouchableOpacity>
      <Text style={styles.loginText}>
        Đã có tài khoản?{' '}
        <Text style={styles.loginLink} onPress={() => navigation.navigate('Login')}>Đăng nhập</Text>
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
    alignSelf: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 4,
  },
  welcome: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 6,
    color: '#333',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fafafa',
    marginBottom: 10,
  },
  input: {
    flex: 1,
    height: 44,
    fontSize: 16,
  },
  button: {
    width: '100%',
    backgroundColor: '#2196F3',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 18,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  loginLink: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
}); 