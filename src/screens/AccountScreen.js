import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList } from 'react-native';

// Dữ liệu mẫu cho user và các bé
const user = {
  accountName: 'kidparent01',
  email: 'user@example.com',
  fullName: 'Nguyễn Văn A',
  phone: '0123456789',
  address: '123 Đường ABC, Quận 1, TP.HCM',
  avatar: require('../../assets/icon.png'),
};

const children = [
  { id: '1', name: 'Bé Bông', age: '2 tuổi', avatar: require('../../assets/icon.png') },
  { id: '2', name: 'Bé Bi', age: '5 tuổi', avatar: require('../../assets/icon.png') },
];

export default function AccountScreen({ navigation, onLogout }) {
  return (
    <View style={styles.container}>
      <View style={styles.profileSection}>
        <Image source={user.avatar} style={styles.avatar} />
        <Text style={styles.name}>{user.fullName}</Text>
        <Text style={styles.username}>@{user.accountName}</Text>
      </View>
      <View style={styles.infoSection}>
        <Text style={styles.label}>Email: <Text style={styles.value}>{user.email}</Text></Text>
        <Text style={styles.label}>Số điện thoại: <Text style={styles.value}>{user.phone}</Text></Text>
        <Text style={styles.label}>Địa chỉ: <Text style={styles.value}>{user.address}</Text></Text>
      </View>
      <View style={styles.childrenSection}>
        <Text style={styles.sectionTitle}>Các bé đang theo dõi</Text>
        <FlatList
          data={children}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.childItem}>
              <Image source={item.avatar} style={styles.childAvatar} />
              <View>
                <Text style={styles.childName}>{item.name}</Text>
                <Text style={styles.childAge}>{item.age}</Text>
              </View>
            </View>
          )}
        />
      </View>
      <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 10,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  username: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
  infoSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 15,
    color: '#333',
    marginBottom: 4,
  },
  value: {
    color: '#555',
    fontWeight: '600',
  },
  childrenSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2196F3',
  },
  childItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 10,
  },
  childAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  childName: {
    fontSize: 15,
    fontWeight: '600',
  },
  childAge: {
    fontSize: 13,
    color: '#888',
  },
  logoutButton: {
    backgroundColor: '#EA4335',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 