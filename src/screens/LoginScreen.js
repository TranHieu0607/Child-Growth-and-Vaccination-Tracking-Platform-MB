import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, Platform } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../store/authSlice';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import deviceTokenApi from '../store/api/deviceTokenApi';
import * as SecureStore from 'expo-secure-store';

export default function LoginScreen({ onLoginSuccess, navigation }) {
  const [input, setInput] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const { loading, error, user, token } = useSelector((state) => state.auth);

  const handleContinue = async () => {
    if (!input || !password) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập đầy đủ số điện thoại/email và mật khẩu');
      return;
    }
    
    try {
      await dispatch(login({ accountName: input, password })).unwrap();

      // Đăng ký thiết bị để nhận push notification (không chặn UI)
      registerDeviceToken().catch((e) => {
        console.log(
          'Register device token failed:',
          e?.response?.data || e?.message || e
        );
      });
      
      Alert.alert(
        'Đăng nhập thành công!', 
        'Chào mừng bạn đến với KidTrack',
        [
          { 
            text: 'OK', 
            onPress: () => onLoginSuccess()
          }
        ]
      );
    } catch (error) {
      Alert.alert(
        'Đăng nhập thất bại', 
        error?.message || 'Vui lòng kiểm tra lại thông tin đăng nhập'
      );
    }
  };

  const handleGoogleLogin = () => {
    onLoginSuccess();
  };

  const registerDeviceToken = async () => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        throw new Error('Notification permission not granted');
      }

      // Get FCM token for Android instead of Expo push token
      let pushToken;
      if (Platform.OS === 'android') {
        // For Android, we need to get FCM token
        // This requires proper Firebase setup with google-services.json
        const projectId = Constants?.expoConfig?.extra?.eas?.projectId || Constants?.easConfig?.projectId;
        if (!projectId) {
          throw new Error('Project ID not found for FCM token');
        }
        
        // Try to get FCM token directly
        try {
          const fcmTokenResponse = await Notifications.getDevicePushTokenAsync();
          pushToken = fcmTokenResponse?.data || fcmTokenResponse;
          console.log('FCM Token obtained:', pushToken);
        } catch (fcmError) {
          console.log('FCM token error, falling back to Expo token:', fcmError?.message || fcmError);
          // Fallback to Expo token if FCM fails
          const pushTokenResponse = await Notifications.getExpoPushTokenAsync({ projectId });
          pushToken = pushTokenResponse?.data || pushTokenResponse;
        }
      } else {
        // For iOS, use Expo push token
        const projectId = Constants?.expoConfig?.extra?.eas?.projectId || Constants?.easConfig?.projectId;
        const pushTokenResponse = await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined);
        pushToken = pushTokenResponse?.data || pushTokenResponse;
      }

      const deviceInfo = `${Device.modelName || 'Unknown Device'}, ${Device.osName || 'Unknown OS'} ${Device.osVersion || ''}`.trim();

      // Sử dụng API mới với đầy đủ tính năng
      const result = await deviceTokenApi.registerDeviceToken(
        pushToken,      // string token
        undefined,      // để nó tự xác định Android/iOS
        deviceInfo      // info string
      );
      
      
      if (result.skipped) {
        console.log('Device token registration skipped:', result.reason);
      } else if (result.deduped) {
        console.log('Device token already registered (deduped)');
        // Lưu pushToken vào SecureStore để sử dụng khi logout
        await SecureStore.setItemAsync('pushToken', pushToken);
      } else {
        console.log('Device token registered successfully');
        // Lưu pushToken vào SecureStore để sử dụng khi logout
        await SecureStore.setItemAsync('pushToken', pushToken);
      }
    } catch (err) {
      console.log('Device token registration error:', err?.message || err);
      console.log('Push token to register:', pushToken, typeof pushToken);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/logo.png')} style={styles.avatar} />
      <Text style={styles.title}>KidTrack</Text>
      <Text style={styles.welcome}>Chào mừng bạn đến với KidTrack</Text>
      <Text style={styles.subtitle}>Theo dõi tăng trưởng và tiêm chủng của trẻ</Text>
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Tên tài khoản</Text>
        <View style={styles.inputBox}>
          <Text style={styles.inputIcon}></Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập tên tài khoản"
            value={input}
            onChangeText={setInput}
            keyboardType="default"
            autoCapitalize="none"
          />
        </View>
        <Text style={styles.inputLabel}>Mật khẩu</Text>
        <View style={styles.inputBox}>
          <Text style={styles.inputIcon}></Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập mật khẩu"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>
      </View>
      {error && <Text style={{ color: 'red', marginBottom: 8 }}>{error}</Text>}
      <TouchableOpacity style={styles.button} onPress={handleContinue} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Đang đăng nhập...' : 'Đăng nhập'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={{ marginBottom: 12 }}>
        <Text style={{ color: '#2196F3' }}>Quên mật khẩu?</Text>
      </TouchableOpacity>
      <View style={styles.registerContainer}>
        <Text style={styles.registerText}>Chưa có tài khoản? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('AccountRegister')}>
          <Text style={styles.registerLink}>Đăng ký ngay</Text>
        </TouchableOpacity>
      </View>
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
    backgroundColor: '#fff',
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
  registerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerText: {
    fontSize: 14,
    color: '#888',
  },
  registerLink: {
    color: '#2196F3',
    fontWeight: 'bold',
    fontSize: 14,
  },
}); 