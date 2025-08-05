import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';

export default function Header({ username }) {
  const { user } = useSelector((state) => state.auth);
  
  // Hàm lấy lời chào theo giờ Việt Nam
  const getGreeting = () => {
    const now = new Date();
    // Tạo đối tượng Date với múi giờ Việt Nam (Asia/Ho_Chi_Minh)
    const vietnamTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Ho_Chi_Minh"}));
    const hour = vietnamTime.getHours();
    
    if (hour >= 5 && hour < 12) {
      return 'Chào buổi sáng,';
    } else if (hour >= 12 && hour < 18) {
      return 'Chào buổi chiều,';
    } else {
      return 'Chào buổi tối,';
    }
  };

  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.greeting}>{getGreeting()}</Text>
        <Text style={styles.username}>{user?.fullName?.toUpperCase() || username?.toUpperCase() || 'NGƯỜI DÙNG'}</Text>
      </View>
      <TouchableOpacity>
        <Ionicons name="notifications-outline" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1565C0',
    paddingTop: 40,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  greeting: {
    color: '#fff',
    fontSize: 14,
  },
  username: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 2,
  },
}); 