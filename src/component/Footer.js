import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faClipboardList } from '@fortawesome/free-solid-svg-icons';

const tabs = [
  { key: 'home', label: 'Trang chủ', icon: <Ionicons name="home-outline" size={24} color="#1565C0" /> },
  { key: 'input', label: 'Nhập chỉ số', icon: <MaterialIcons name="edit" size={24} color="#1565C0" /> },
  { key: 'schedule', label: 'Đặt lịch', icon: <Ionicons name="calendar-outline" size={24} color="#1565C0" /> },
  { key: 'contact', label: 'Hàng ngày', icon: <FontAwesomeIcon icon={faClipboardList} size={24} color="#1565C0" /> },
  { key: 'account', label: 'Tài khoản', icon: <Ionicons name="person-outline" size={24} color="#1565C0" /> },
];

export default function Footer({ currentTab, onTabPress, navigation }) {
  const handleTabPress = (tabKey) => {
    if (onTabPress) onTabPress(tabKey);
    if (navigation) {
      if (tabKey === 'home') navigation.navigate('Home');
      else if (tabKey === 'account') navigation.navigate('Account');
      else if (tabKey === 'contact') navigation.navigate('DailyRecord');
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
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingVertical: 8,
    height: 64,
  },
  tab: {
    alignItems: 'center',
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: '#1565C0',
    marginTop: 2,
  },
  activeLabel: {
    fontWeight: 'bold',
    color: '#003c8f',
  },
}); 