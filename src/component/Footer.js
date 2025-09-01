import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const tabs = [
  { key: 'home', label: 'Trang chủ', icon: <Ionicons name="home-outline" size={24} color="#1565C0" /> },
  { key: 'add_vaccine', label: 'Nhập chỉ số', icon: <Ionicons name="analytics-outline" size={24} color="#1565C0" /> },
  { key: 'schedule', label: 'Đặt lịch', icon: <Ionicons name="calendar-outline" size={24} color="#1565C0" /> },
  { key: 'contact', label: 'Hàng ngày', icon: <Ionicons name="list-outline" size={24} color="#1565C0" /> },
  { key: 'account', label: 'Tài khoản', icon: <Ionicons name="person-outline" size={24} color="#1565C0" /> },
];

export default function Footer({ currentTab, onTabPress, navigation }) {
  const handleTabPress = (tabKey) => {
    if (onTabPress) onTabPress(tabKey);
    if (navigation) {
      if (tabKey === 'home') navigation.navigate('Home');
      else if (tabKey === 'account') navigation.navigate('Account');
      else if (tabKey === 'contact') navigation.navigate('DailyRecord');
      else if (tabKey === 'add_vaccine') navigation.navigate('UpdateGrowth');
      else if (tabKey === 'schedule') navigation.navigate('Booking');
      // Thêm các tab khác nếu muốn điều hướng
    }
  };
  return (
    <View style={styles.footer}>
      {tabs.map(tab => (
        <TouchableOpacity key={tab.key} style={styles.tab} onPress={() => handleTabPress(tab.key)}>
          {tab.icon}
          <Text style={[styles.label, currentTab === tab.key && styles.activeLabel]}>{tab.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingVertical: 8,
    height: 64,
    paddingHorizontal: 5,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0,
  },
  label: {
    fontSize: 10,
    color: '#1565C0',
    marginTop: 4,
    textAlign: 'center',
    lineHeight: 12,
    fontWeight: '400',
  },
  activeLabel: {
    fontWeight: 'bold',
    color: '#003c8f',
  },
}); 