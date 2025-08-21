import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { requestPasswordReset } from '../store/api/authApi';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const res = await requestPasswordReset({ email });
      const msg = res?.message || 'Vui lòng kiểm tra email để đặt lại mật khẩu';
      setMessage(msg);
      // chuyển tới màn hình nhập OTP để đổi mật khẩu
      setTimeout(() => navigation.navigate('ResetPassword', { email }), 500);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Gửi yêu cầu thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quên mật khẩu</Text>
      <Text style={styles.subtitle}>Nhập email đã đăng ký để nhận hướng dẫn đặt lại mật khẩu</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {message ? <Text style={styles.success}>{message}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading || !email}>
        <Text style={styles.buttonText}>{loading ? 'Đang gửi...' : 'Gửi yêu cầu'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.back}>Quay lại đăng nhập</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#2196F3', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#555', textAlign: 'center', marginBottom: 16 },
  input: { height: 48, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, marginBottom: 12 },
  button: { backgroundColor: '#2196F3', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  success: { color: 'green', marginBottom: 8, textAlign: 'center' },
  error: { color: 'red', marginBottom: 8, textAlign: 'center' },
  back: { color: '#2196F3', textAlign: 'center' },
});


