import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';

export default function LoginScreen({ onLoginSuccess }) {
  const [input, setInput] = useState('');

  const handleContinue = () => {
    onLoginSuccess();
  };

  const handleGoogleLogin = () => {
    onLoginSuccess();
  };

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/icon.png')} style={styles.avatar} />
      <Text style={styles.title}>KidCare</Text>
      <Text style={styles.welcome}>Chào mừng bạn đến với KidCare</Text>
      <Text style={styles.subtitle}>Theo dõi tiêm chủng và phát triển của bé</Text>
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Số điện thoại hoặc email</Text>
        <View style={styles.inputBox}>
          <Text style={styles.inputIcon}>📱</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập số điện thoại hoặc email"
            value={input}
            onChangeText={setInput}
            keyboardType="default"
            autoCapitalize="none"
          />
        </View>
      </View>
      <TouchableOpacity style={styles.button} onPress={handleContinue}>
        <Text style={styles.buttonText}>Tiếp tục</Text>
      </TouchableOpacity>
      <View style={styles.orContainer}>
        <View style={styles.line} />
        <Text style={styles.orText}>Hoặc</Text>
        <View style={styles.line} />
      </View>
      <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
        <Text style={styles.googleIcon}>G</Text>
        <Text style={styles.googleText}>Đăng nhập với Google</Text>
      </TouchableOpacity>
      <Text style={styles.registerText}>
        Chưa có tài khoản? <Text style={styles.registerLink}>Đăng ký ngay</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
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
  },
  inputIcon: {
    fontSize: 18,
    marginRight: 8,
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
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 18,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#eee',
  },
  orText: {
    marginHorizontal: 8,
    color: '#888',
    fontSize: 14,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginBottom: 18,
  },
  googleIcon: {
    fontSize: 20,
    color: '#EA4335',
    marginRight: 8,
    fontWeight: 'bold',
  },
  googleText: {
    fontSize: 16,
    color: '#333',
  },
  registerText: {
    fontSize: 14,
    color: '#888',
  },
  registerLink: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
}); 