
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useNavigation } from '@react-navigation/native';

// Khi app đang foreground, vẫn hiển thị alert và có thể phát âm thanh
Notifications.setNotificationHandler({
  shouldShowAlert: async () => true,
  shouldPlaySound: async () => true,
  shouldSetBadge: async () => false,
});

// Xin quyền và lấy token đẩy (Android dùng FCM)
export async function registerForPushNotificationsAsync() {
  // Khuyến nghị chạy trên thiết bị thật
  if (!Device.isDevice) {
    return null;
  }

  // Quyền thông báo
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    return null;
  }

  // Android: tạo channel có mức độ ưu tiên cao + âm thanh
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      sound: 'default',
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
    // Lấy FCM token (yêu cầu cấu hình FCM hợp lệ trong Android)
    const devicePushToken = await Notifications.getDevicePushTokenAsync();
    // devicePushToken = { type: 'fcm', data: 'FCM_TOKEN' }
    return devicePushToken?.data ?? null;
  }

  // Trường hợp khác (iOS/web): không dùng trong dự án này, trả null cho gọn
  return null;
}

// Hook chính: đăng ký listeners và xử lý điều hướng
export default function useNotifications() {
  const navigation = useNavigation();
  const receivedSubRef = useRef(null);
  const responseSubRef = useRef(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    let isMounted = true;

    // Khi có notification đến lúc app đang mở (foreground)
    receivedSubRef.current = Notifications.addNotificationReceivedListener((notification) => {
      try {
        const content = notification?.request?.content || {};
        const title = content.title;
        const body = content.body;
        const data = content.data || {};
        console.log('[Notifications] >>> Received (foreground)');
        console.log('  - title:', title);
        console.log('  - body :', body);
        console.log('  - data :', JSON.stringify(data));
      } catch (e) {
        console.log('[Notifications] Received (foreground) raw:', JSON.stringify(notification));
      }
      // Tại đây có thể cập nhật state/UI tùy nhu cầu
    });

    // Khi user bấm vào notification (mọi trạng thái app)
    responseSubRef.current = Notifications.addNotificationResponseReceivedListener((response) => {
      try {
        const content = response?.notification?.request?.content || {};
        const data = content?.data ?? {};
        const title = content?.title;
        const body = content?.body;
        const actionId = response?.actionIdentifier;
        console.log('[Notifications] >>> Notification tapped');
        console.log('  - action:', actionId);
        console.log('  - title :', title);
        console.log('  - body  :', body);
        console.log('  - data  :', JSON.stringify(data));
        const childId = data?.childId;
        if (childId) {
          navigation.navigate('ChildDetail', { childId });
        }
      } catch (error) {
        console.warn('[Notifications] Error handling response:', error);
      }
    });

    // Xin quyền + lấy token ngay khi mount
    registerForPushNotificationsAsync()
      .then((t) => {
        if (isMounted) setToken(t);
        console.log('[Notifications] >>> Push token (Android/FCM):', t);
      })
      .catch((err) => console.warn('[Notifications] Token error:', err));

    // Cleanup listeners khi unmount
    return () => {
      isMounted = false;
      try {
        if (receivedSubRef.current) {
          receivedSubRef.current.remove();
          receivedSubRef.current = null;
        }
        if (responseSubRef.current) {
          responseSubRef.current.remove();
          responseSubRef.current = null;
        }
      } catch (e) {
        console.warn('[Notifications] Cleanup error:', e);
      }
    };
  }, [navigation]);

  return { token, registerForPushNotificationsAsync };
}




