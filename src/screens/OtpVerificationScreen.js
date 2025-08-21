import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { completeRegistration } from '../store/api/authApi';

export default function OtpVerificationScreen({ route, navigation }) {
  const { email } = route.params || {};
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleVerify = async () => {
    setLoading(true);
    setError(null);
    try {
      await completeRegistration({ email, otpCode });
      navigation.replace('Login');
    } catch (e) {
      const err = e?.response?.data?.message || e?.message || 'Xác thực OTP thất bại';
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Xác minh email</Text>
      <Text style={styles.subtitle}>Mã xác minh đã được gửi tới: {email}</Text>
      <TextInput
        style={styles.input}
        placeholder="Nhập mã OTP"
        value={otpCode}
        onChangeText={setOtpCode}
        keyboardType="number-pad"
        autoCapitalize="none"
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity style={styles.button} onPress={handleVerify} disabled={loading || !otpCode}>
        <Text style={styles.buttonText}>{loading ? 'Đang xác minh...' : 'Xác minh'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.back}>Quay lại</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2196F3',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#2196F3',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    marginBottom: 8,
    textAlign: 'center',
  },
  back: {
    color: '#2196F3',
    textAlign: 'center',
  },
});


