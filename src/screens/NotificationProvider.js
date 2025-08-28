// src/screens/NotificationProvider.js
import React, { useEffect, useRef } from 'react';
import * as Device from 'expo-device';
import useNotifications from '../store/hook/useNotifications'; // dùng hook đã đặt tại src/store/hook/useNotifications
import deviceTokenApi from '../store/api/deviceTokenApi';

export default function NotificationProvider({ isLoggedIn, children }) {
  const { token } = useNotifications(); // lắng nghe noti + lấy FCM token
  const didRegisterRef = useRef(false);

  useEffect(() => {
    // Chỉ đăng ký token với BE sau khi user đăng nhập
    // và chỉ 1 lần mỗi phiên đăng nhập
    if (isLoggedIn && token && !didRegisterRef.current) {
      console.log('[NotificationProvider] >>> Will register device token to backend');
      console.log('  - token:', token);
      const deviceInfo = `${Device.modelName || 'Unknown Device'}, ${Device.osName || 'Unknown OS'} ${Device.osVersion || ''}`.trim();
      deviceTokenApi
        .registerDeviceToken(token, undefined, deviceInfo)
        .then(() => {
          console.log('[NotificationProvider] >>> Registered token successfully');
          didRegisterRef.current = true;
        })
        .catch((e) => {
          console.log('[NotificationProvider] registerDeviceToken error:', e?.response?.data || e?.message || e);
        });
    }

    // Khi user logout → cho phép đăng ký lại token ở lần login sau
    if (!isLoggedIn) {
      didRegisterRef.current = false;
    }
  }, [isLoggedIn, token]);

  return children;
}
