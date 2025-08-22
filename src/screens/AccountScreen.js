import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, Alert, TextInput } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { logout, updateProfile } from '../store/authSlice';
import childrenApi from '../store/api/childrenApi';
import { useFocusEffect } from '@react-navigation/native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faTrash, faPen } from '@fortawesome/free-solid-svg-icons';

export default function AccountScreen({ navigation, onLogout }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [profileDraft, setProfileDraft] = useState({
    fullName: '',
    phoneNumber: '',
    address: '',
  });
  const handleLogout = async () => {
    await dispatch(logout());
    if (onLogout) onLogout();
  };

  const fetchChildren = async () => {
    try {
      setLoading(true);
      const response = await childrenApi.getMyChildren();
      setChildren(response.data);
    } catch (err) {
      setError('Không thể tải danh sách các bé');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setProfileDraft({
      fullName: user?.fullName || '',
      phoneNumber: user?.phone || user?.phoneNumber || '',
      address: user?.address || '',
    });
  }, [user]);

  const handleDeleteChild = (childId) => {
    Alert.alert(
      'Xác nhận xoá',
      'Bạn có chắc chắn muốn xoá bé này không?',
      [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'Xoá',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await childrenApi.deleteChild(childId);
              await fetchChildren();
            } catch (err) {
              Alert.alert('Lỗi', 'Không thể xoá bé.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleChildPress = (childId) => {
    navigation.navigate('ChildDetail', { childId });
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchChildren();
    }, [])
  );

  return (
    <View style={styles.container}>
      {!editing && (
        <View style={styles.editFabContainer}>
          <TouchableOpacity onPress={() => setEditing(true)} style={styles.editFab}>
            <FontAwesomeIcon icon={faPen} size={16} color="#2196F3" />
          </TouchableOpacity>
        </View>
      )}
      <View style={styles.profileSection}>
        <Image source={require('../../assets/icon.png')} style={styles.avatar} />
        {!editing ? (
          <Text style={styles.name}>{user?.fullName || 'Chưa cập nhật'}</Text>
        ) : (
          <TextInput
            style={[styles.name, { borderBottomWidth: 1, borderColor: '#ddd', paddingBottom: 4 }]}
            value={profileDraft.fullName}
            onChangeText={(v) => setProfileDraft((p) => ({ ...p, fullName: v }))}
            placeholder="Họ và tên"
          />
        )}
      </View>
      <View style={styles.infoSection}>
        <Text style={styles.label}>Email: <Text style={styles.value}>{user?.email || 'Chưa cập nhật'}</Text></Text>
        {!editing ? (
          <Text style={styles.label}>Số điện thoại: <Text style={styles.value}>{user?.phone || user?.phoneNumber || 'Chưa cập nhật'}</Text></Text>
        ) : (
          <View style={{ marginBottom: 8 }}>
            <Text style={[styles.label, { marginBottom: 4 }]}>Số điện thoại</Text>
            <TextInput
              style={styles.input}
              value={profileDraft.phoneNumber}
              onChangeText={(v) => setProfileDraft((p) => ({ ...p, phoneNumber: v }))}
              placeholder="Số điện thoại"
              keyboardType="phone-pad"
            />
          </View>
        )}
        {!editing ? (
          <Text style={styles.label}>Địa chỉ: <Text style={styles.value}>{user?.address || 'Chưa cập nhật'}</Text></Text>
        ) : (
          <View style={{ marginBottom: 8 }}>
            <Text style={[styles.label, { marginBottom: 4 }]}>Địa chỉ</Text>
            <TextInput
              style={styles.input}
              value={profileDraft.address}
              onChangeText={(v) => setProfileDraft((p) => ({ ...p, address: v }))}
              placeholder="Địa chỉ"
            />
          </View>
        )}
      </View>
      {editing && (
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 12 }}>
          <>
            <TouchableOpacity onPress={() => setEditing(false)} style={[styles.editBtn, { backgroundColor: '#9e9e9e', marginRight: 8 }]}>
              <Text style={styles.editBtnText}>Huỷ</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={async () => {
                try {
                  setLoading(true);
                  const payload = {
                    fullName: profileDraft.fullName?.trim(),
                    phoneNumber: profileDraft.phoneNumber?.trim(),
                    address: profileDraft.address?.trim(),
                  };
                  const result = await dispatch(updateProfile(payload)).unwrap();
                  Alert.alert('Thành công', 'Cập nhật hồ sơ thành công');
                  setEditing(false);
                } catch (e) {
                  const msg = e?.message || e || 'Cập nhật hồ sơ thất bại';
                  Alert.alert('Lỗi', msg.toString());
                } finally {
                  setLoading(false);
                }
              }}
              style={[styles.editBtn, { backgroundColor: '#2196F3' }]}
            >
              <Text style={styles.editBtnText}>Lưu</Text>
            </TouchableOpacity>
          </>
        </View>
      )}
      <View style={styles.childrenSection}>
        <Text style={styles.sectionTitle}>Các bé đang theo dõi</Text>
        {loading ? (
          <Text>Đang tải...</Text>
        ) : error ? (
          <Text style={{ color: 'red' }}>{error}</Text>
        ) : (
          <FlatList
            data={children}
            keyExtractor={item => item.childId.toString()}
            renderItem={({ item }) => (
              <View style={styles.childItem}>
                <TouchableOpacity 
                  style={styles.childInfoContainer}
                  onPress={() => handleChildPress(item.childId)}
                >
                  <Image source={require('../../assets/icon.png')} style={styles.childAvatar} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.childName}>{item.fullName}</Text>
                    <Text style={styles.childAge}>
                      Ngày sinh: {item.birthDate ? item.birthDate.split('T')[0] : ''}
                    </Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteChild(item.childId)} style={styles.deleteButton}>
                  <FontAwesomeIcon icon={faTrash} size={20} color="#EA4335" />
                </TouchableOpacity>
              </View>
            )}
          />
        )}
      </View>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
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
  editFabContainer: {
    position: 'absolute',
    top: 12,
    right: 16,
    zIndex: 10,
  },
  editFab: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#2196F3',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
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
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
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
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
  },
  childInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
  deleteButton: {
    marginLeft: 10,
    padding: 8,
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
  editBtn: {
    backgroundColor: '#1976d2',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  editBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});