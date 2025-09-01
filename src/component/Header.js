import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCrown } from '@fortawesome/free-solid-svg-icons';
import { useSelector } from 'react-redux';
import membershipApi from '../store/api/membershipApi';

export default function Header({ username }) {
  const { user, token } = useSelector((state) => state.auth);
  const [isVip, setIsVip] = useState(false);
  const [checkingVip, setCheckingVip] = useState(true);
  
  // Kiểm tra trạng thái VIP của người dùng
  useEffect(() => {
    const checkVipStatus = async () => {
      if (user?.accountId && token) {
        try {
          const vipStatus = await membershipApi.getUserMembershipStatus(user.accountId, token);
          setIsVip(vipStatus && (vipStatus.isActive || vipStatus.status === true));
        } catch (error) {
          console.warn('Không thể kiểm tra trạng thái VIP:', error);
          setIsVip(false);
        } finally {
          setCheckingVip(false);
        }
      } else {
        setCheckingVip(false);
      }
    };
    
    checkVipStatus();
  }, [user?.accountId, token]);
  
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
      {!checkingVip && isVip && (
        <TouchableOpacity>
          <FontAwesomeIcon icon={faCrown} size={24} color="#FFD700" />
        </TouchableOpacity>
      )}
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