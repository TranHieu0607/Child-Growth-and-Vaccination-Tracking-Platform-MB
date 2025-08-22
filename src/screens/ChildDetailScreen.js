import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, ScrollView, Alert, TouchableOpacity, TextInput } from 'react-native';
import childrenApi from '../store/api/childrenApi';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

export default function ChildDetailScreen({ route, navigation }) {
  const { childId } = route.params;
  const [child, setChild] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFields, setEditFields] = useState({
    fullName: '',
    birthDate: '',
    gender: '',
    bloodType: '',
    allergiesNotes: '',
    medicalHistory: '',
  });

  const fetchChildDetail = async () => {
    try {
      setLoading(true);
      const response = await childrenApi.getChildById(childId);
      setChild(response.data);
      setEditFields({
        fullName: response.data.fullName || '',
        birthDate: response.data.birthDate ? response.data.birthDate.slice(0, 10) : '',
        gender: response.data.gender || '',
        bloodType: response.data.bloodType || '',
        allergiesNotes: response.data.allergiesNotes || '',
        medicalHistory: response.data.medicalHistory || '',
      });
    } catch (err) {
      setError('Không thể tải thông tin chi tiết của bé');
      Alert.alert('Lỗi', 'Không thể tải thông tin chi tiết của bé');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChildDetail();
  }, [childId]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa cập nhật';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatGender = (gender) => {
    if (!gender) return 'Chưa cập nhật';
    return gender.trim() === 'Male' ? 'Nam' : gender.trim() === 'Female' ? 'Nữ' : gender.trim();
  };

  const handleEditPress = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditFields({
      fullName: child.fullName || '',
      birthDate: child.birthDate ? child.birthDate.slice(0, 10) : '',
      gender: child.gender || '',
      bloodType: child.bloodType || '',
      allergiesNotes: child.allergiesNotes || '',
      medicalHistory: child.medicalHistory || '',
    });
  };

  const handleSaveEdit = async () => {
    try {
      setLoading(true);
      await childrenApi.updateChild(childId, { ...editFields, status: true });
      await fetchChildDetail();
      setIsEditing(false);
      Alert.alert('Thành công', 'Cập nhật thông tin thành công');
    } catch (err) {
      Alert.alert('Lỗi', 'Cập nhật thông tin thất bại');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Đang tải thông tin...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!child) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Không tìm thấy thông tin bé</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerIcons}>
        <TouchableOpacity
          style={styles.backIcon}
          onPress={() => navigation.navigate('Home')}
          hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
        >
          <FontAwesome name="arrow-left" size={28} color="#2196F3" />
        </TouchableOpacity>
        {!isEditing && (
          <TouchableOpacity
            style={styles.editIcon}
            onPress={handleEditPress}
            hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
          >
            <FontAwesome name="pencil" size={26} color="#2196F3" />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.profileSection}>
        <Image source={require('../../assets/icon.png')} style={styles.avatar} />
        {isEditing ? (
          <TextInput
            style={[styles.name, { borderBottomWidth: 1, borderColor: '#2196F3' }]}
            value={editFields.fullName}
            onChangeText={text => setEditFields({ ...editFields, fullName: text })}
          />
        ) : (
          <Text style={styles.name}>{child.fullName}</Text>
        )}
        <Text style={styles.status}>
          {child.status ? 'Đang theo dõi' : 'Ngừng theo dõi'}
        </Text>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>
        <View style={styles.infoItem}>
          <Text style={styles.label}>Ngày sinh:</Text>
          {isEditing ? (
            <TextInput
              style={styles.value}
              value={editFields.birthDate}
              onChangeText={text => setEditFields({ ...editFields, birthDate: text })}
              placeholder="YYYY-MM-DD"
            />
          ) : (
            <Text style={styles.value}>{formatDate(child.birthDate)}</Text>
          )}
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.label}>Giới tính:</Text>
          {isEditing ? (
            <View style={styles.genderRow}>
              <TouchableOpacity
                style={styles.radioContainer}
                onPress={() => setEditFields({ ...editFields, gender: 'Male' })}
              >
                <View style={[
                  styles.radioCircle,
                  editFields.gender === 'Male' && styles.radioCircleSelected
                ]} />
                <Text style={styles.radioLabel}>Nam</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.radioContainer}
                onPress={() => setEditFields({ ...editFields, gender: 'Female' })}
              >
                <View style={[
                  styles.radioCircle,
                  editFields.gender === 'Female' && styles.radioCircleSelected
                ]} />
                <Text style={styles.radioLabel}>Nữ</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.value}>{formatGender(child.gender)}</Text>
          )}
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.label}>Nhóm máu:</Text>
          {isEditing ? (
            <View style={styles.bloodTypeRow}>
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(type => (
                <TouchableOpacity
                  key={type}
                  style={styles.bloodTypeOption}
                  onPress={() => setEditFields({ ...editFields, bloodType: type })}
                >
                  <View style={[
                    styles.radioCircle,
                    editFields.bloodType === type && styles.radioCircleSelected
                  ]} />
                  <Text style={styles.radioLabel}>{type}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <Text style={styles.value}>{child.bloodType || 'Chưa cập nhật'}</Text>
          )}
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.label}>Ngày tạo:</Text>
          <Text style={styles.value}>{formatDate(child.createdAt)}</Text>
        </View>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Thông tin sức khỏe</Text>
        <View style={styles.infoItem}>
          <Text style={styles.label}>Ghi chú dị ứng:</Text>
          {isEditing ? (
            <TextInput
              style={styles.value}
              value={editFields.allergiesNotes}
              onChangeText={text => setEditFields({ ...editFields, allergiesNotes: text })}
              placeholder="Ghi chú dị ứng"
            />
          ) : (
            <Text style={styles.value}>
              {child.allergiesNotes || 'Không có ghi chú dị ứng'}
            </Text>
          )}
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.label}>Tiền sử bệnh:</Text>
          {isEditing ? (
            <TextInput
              style={styles.value}
              value={editFields.medicalHistory}
              onChangeText={text => setEditFields({ ...editFields, medicalHistory: text })}
              placeholder="Tiền sử bệnh"
            />
          ) : (
            <Text style={styles.value}>
              {child.medicalHistory || 'Không có tiền sử bệnh'}
            </Text>
          )}
        </View>
      </View>
      {isEditing && (
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 24 }}>
          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: '#2196F3' }]}
            onPress={handleSaveEdit}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold', paddingHorizontal: 16, paddingVertical: 8 }}>Lưu</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: '#aaa', marginLeft: 16 }]}
            onPress={handleCancelEdit}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold', paddingHorizontal: 16, paddingVertical: 8 }}>Hủy</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerIcons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'absolute',
    top: 16,
    left: 0,
    right: 0,
    zIndex: 20,
    paddingHorizontal: 16,
  },
  backIcon: {
    backgroundColor: 'transparent',
    padding: 4,
  },
  editIcon: {
    backgroundColor: 'transparent',
    padding: 4,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#EA4335',
    textAlign: 'center',
  },
  profileSection: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 8,
  },
  status: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
  },
  infoSection: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 16,
  },
  infoItem: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  saveBtn: {
    borderRadius: 8,
    marginTop: 8,
  },
  genderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#2196F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
    backgroundColor: '#fff',
  },
  radioCircleSelected: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  radioLabel: {
    fontSize: 16,
    color: '#333',
    marginRight: 8,
  },
  bloodTypeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: 4,
  },
  bloodTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
});
