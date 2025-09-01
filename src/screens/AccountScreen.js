import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  TextInput,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { logout, updateProfile } from '../store/authSlice';
import childrenApi from '../store/api/childrenApi';
import { useFocusEffect } from '@react-navigation/native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faUser,
  faUserEdit,
  faPhone,
  faMapMarkerAlt,
  faEnvelope,
  faBaby,
  faChevronRight,
  faSignOutAlt,
} from '@fortawesome/free-solid-svg-icons';

const COLOR_PRIMARY = '#2F80ED';
const COLOR_TEXT = '#1F2937';
const COLOR_MUTED = '#6B7280';
const COLOR_BG = '#F5F7FA';

export default function AccountScreen({ navigation, onLogout }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [imageErrors, setImageErrors] = useState({});

  const [profileDraft, setProfileDraft] = useState({
    fullName: '',
    phoneNumber: '',
    address: '',
  });

  useEffect(() => {
    setProfileDraft({
      fullName: user?.fullName || '',
      phoneNumber: user?.phone || user?.phoneNumber || '',
      address: user?.address || '',
    });
  }, [user]);

  const fetchChildren = async () => {
    try {
      setLoading(true);
      const response = await childrenApi.getMyChildren();
      // một số api trả mảng ở response hoặc response.data -> fallback
      const data = Array.isArray(response) ? response : response?.data || [];
      setChildren(data);
      setError(null);
    } catch (err) {
      setError('Không thể tải danh sách các bé');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchChildren();
    }, [])
  );

  const handleLogout = async () => {
    Alert.alert('Xác nhận', 'Bạn muốn đăng xuất?', [
      { text: 'Huỷ', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: async () => {
          await dispatch(logout());
          if (onLogout) onLogout();
        },
      },
    ]);
  };

  const handleDeleteChild = (childId) => {
    Alert.alert('Xác nhận', 'Bỏ theo dõi bé này?', [
      { text: 'Huỷ', style: 'cancel' },
      {
        text: 'Bỏ theo dõi',
        style: 'destructive',
        onPress: async () => {
          try {
            setLoading(true);
            await childrenApi.deleteChild(childId);
            await fetchChildren();
          } catch (err) {
            Alert.alert('Lỗi', 'Không thể bỏ theo dõi bé.');
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const handleChildPress = (childId) => {
    navigation.navigate('ChildDetail', { childId });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header đơn giản */}
        <View style={styles.header}>
        <View style={styles.row}>
          {user?.imageURL && !imageErrors[user.imageURL] ? (
            <Image
              source={{ uri: user.imageURL }}
              style={styles.avatarLg}
              onError={() => setImageErrors((p) => ({ ...p, [user.imageURL]: true }))}
            />
          ) : (
            <View style={[styles.avatarLg, styles.avatarPlaceholder]}>
              <FontAwesomeIcon icon={faUser} size={36} color={COLOR_PRIMARY} />
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{user?.fullName || 'Chưa cập nhật'}</Text>
            <View style={styles.inline}>
              <FontAwesomeIcon icon={faEnvelope} size={12} color={COLOR_MUTED} />
              <Text style={styles.subText}> {user?.email || '—'}</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => setEditing((v) => !v)}
            style={styles.editChip}
          >
            <FontAwesomeIcon icon={faUserEdit} size={14} color={COLOR_PRIMARY} />
            <Text style={styles.editChipText}> Sửa</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Thông tin tài khoản */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Thông tin tài khoản</Text>

        {!editing ? (
          <>
            <Cell
              icon={faPhone}
              label="Số điện thoại"
              value={user?.phone || user?.phoneNumber || '—'}
            />
            <Cell
              icon={faMapMarkerAlt}
              label="Địa chỉ"
              value={user?.address || '—'}
              last
            />
          </>
        ) : (
          <>
            <Field
              icon={faUser}
              label="Họ và tên"
              value={profileDraft.fullName}
              onChangeText={(v) => setProfileDraft((p) => ({ ...p, fullName: v }))}
              placeholder="Nhập họ và tên"
            />
            <Field
              icon={faPhone}
              label="Số điện thoại"
              value={profileDraft.phoneNumber}
              onChangeText={(v) => setProfileDraft((p) => ({ ...p, phoneNumber: v }))}
              keyboardType="phone-pad"
              placeholder="Nhập số điện thoại"
            />
            <Field
              icon={faMapMarkerAlt}
              label="Địa chỉ"
              value={profileDraft.address}
              onChangeText={(v) => setProfileDraft((p) => ({ ...p, address: v }))}
              placeholder="Nhập địa chỉ"
              multiline
              last
            />

            <View style={styles.actionsRow}>
              <TouchableOpacity
                onPress={() => setEditing(false)}
                style={[styles.btn, styles.btnGhost]}
              >
                <Text style={[styles.btnText, { color: COLOR_MUTED }]}>Huỷ</Text>
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
                    await dispatch(updateProfile(payload)).unwrap();
                    Alert.alert('Thành công', 'Cập nhật thông tin thành công');
                    setEditing(false);
                  } catch (e) {
                    Alert.alert('Lỗi', (e?.message || e || 'Cập nhật thất bại').toString());
                  } finally {
                    setLoading(false);
                  }
                }}
                style={[styles.btn, styles.btnPrimary]}
              >
                <Text style={[styles.btnText, { color: '#fff' }]}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      {/* Danh sách bé */}
      <View style={styles.card}>
        <View style={[styles.row, { marginBottom: 8 }]}>
          <View style={styles.inline}>
            <FontAwesomeIcon icon={faBaby} size={18} color={COLOR_PRIMARY} />
            <Text style={[styles.sectionTitle, { marginLeft: 8 }]}>
              Các bé đang theo dõi
            </Text>
          </View>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={COLOR_PRIMARY} />
            <Text style={styles.muted}> Đang tải…</Text>
          </View>
        ) : error ? (
          <View style={styles.center}>
            <Text style={[styles.muted, { color: '#E74C3C' }]}>{error}</Text>
          </View>
        ) : children.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.muted}>Chưa có bé nào được đăng ký</Text>
          </View>
        ) : (
          children.map((item, idx) => (
            <View key={item.childId}>
              <TouchableOpacity
                style={styles.childRow}
                onPress={() => handleChildPress(item.childId)}
                activeOpacity={0.7}
              >
                {item.imageURL && !imageErrors[item.childId] ? (
                  <Image
                    source={{ uri: item.imageURL }}
                    style={styles.childAvatar}
                    onError={() =>
                      setImageErrors((p) => ({ ...p, [item.childId]: true }))
                    }
                  />
                ) : (
                  <View style={[styles.childAvatar, styles.avatarPlaceholderSm]}>
                    <FontAwesomeIcon icon={faBaby} size={16} color={COLOR_PRIMARY} />
                  </View>
                )}

                                 <View style={{ flex: 1 }}>
                   <Text style={styles.childName}>{item.fullName}</Text>
                   <Text style={styles.childSub}>
                     Ngày sinh: {item.birthDate ? item.birthDate.split('T')[0] : '—'}
                   </Text>
                   <Text style={styles.childSub}>
                     {item.gender?.trim() || '—'} • {item.bloodType || 'Chưa cập nhật'}
                   </Text>
                 </View>

                 <TouchableOpacity
                   onPress={() => handleDeleteChild(item.childId)}
                   style={styles.smallDanger}
                 >
                   <Text style={styles.smallDangerText}>Bỏ theo dõi</Text>
                 </TouchableOpacity>
               </TouchableOpacity>

              {idx !== children.length - 1 && <View style={styles.divider} />}
            </View>
          ))
        )}
      </View>

             {/* Đăng xuất */}
       <View style={styles.card}>
         <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
           <FontAwesomeIcon icon={faSignOutAlt} size={16} color="#E11D48" />
           <Text style={styles.logoutText}>Đăng xuất</Text>
         </TouchableOpacity>
       </View>

       <View style={{ height: 24 }} />
       </ScrollView>
     </SafeAreaView>
   );
 }

/* ---------- Các component nhỏ cho “cell” & “field” ---------- */
function Cell({ icon, label, value, last }) {
  return (
    <View style={[styles.cell, last && { borderBottomWidth: 0 }]}>
      <View style={styles.inline}>
        <FontAwesomeIcon icon={icon} size={14} color={COLOR_PRIMARY} />
        <Text style={styles.cellLabel}> {label}</Text>
      </View>
      <Text style={styles.cellValue}>{value}</Text>
    </View>
  );
}

function Field({ icon, label, value, onChangeText, placeholder, keyboardType, multiline, last }) {
  return (
    <View style={[styles.fieldWrap, last && { marginBottom: 0 }]}>
      <View style={styles.inline}>
        <FontAwesomeIcon icon={icon} size={14} color={COLOR_PRIMARY} />
        <Text style={styles.fieldLabel}> {label}</Text>
      </View>
      <TextInput
        style={[styles.fieldInput, multiline && { height: 80, textAlignVertical: 'top' }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLOR_MUTED}
        keyboardType={keyboardType}
        multiline={!!multiline}
      />
    </View>
  );
}

/* --------------------------- Styles --------------------------- */
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLOR_BG,
    paddingTop: 30,
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  inline: { flexDirection: 'row', alignItems: 'center' },

  avatarLg: { width: 72, height: 72, borderRadius: 36, marginRight: 12 },
  avatarPlaceholder: { backgroundColor: '#E6F0FE', justifyContent: 'center', alignItems: 'center' },

  name: { fontSize: 20, fontWeight: '700', color: COLOR_TEXT },
  subText: { fontSize: 13, color: COLOR_MUTED },

  editChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#EEF2FF',
    borderWidth: 0,
  },
  editChipText: { color: COLOR_PRIMARY, fontSize: 13, fontWeight: '600' },

  card: {
    backgroundColor: '#fff',
    marginTop: 12,
    marginHorizontal: 12,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#EBEDF0',
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLOR_TEXT },

  /* Cells (xem thông tin) */
  cell: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cellLabel: { fontSize: 14, color: COLOR_TEXT, fontWeight: '600' },
  cellValue: { fontSize: 14, color: COLOR_MUTED, maxWidth: '60%', textAlign: 'right' },

  /* Fields (edit) */
  fieldWrap: { marginTop: 12, marginBottom: 12 },
  fieldLabel: { fontSize: 14, color: COLOR_TEXT, fontWeight: '600' },
  fieldInput: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    backgroundColor: '#fff',
    color: COLOR_TEXT,
    fontSize: 15,
  },

  actionsRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 4 },
  btn: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 10, marginLeft: 8 },
  btnGhost: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB' },
  btnPrimary: { backgroundColor: COLOR_PRIMARY },
  btnText: { fontSize: 15, fontWeight: '600' },

  /* Children list */
  center: { alignItems: 'center', paddingVertical: 16, flexDirection: 'row' },
  muted: { color: COLOR_MUTED, fontSize: 14 },
  childRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  childAvatar: { width: 44, height: 44, borderRadius: 22, marginRight: 12 },
  avatarPlaceholderSm: { backgroundColor: '#E6F0FE', justifyContent: 'center', alignItems: 'center' },
  childName: { fontSize: 15, fontWeight: '700', color: COLOR_TEXT },
  childSub: { fontSize: 13, color: COLOR_MUTED },
  childActions: { alignItems: 'flex-end', marginTop: 6 },
  smallDanger: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#FFE4E6',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  smallDangerText: { color: '#E11D48', fontSize: 12, fontWeight: '600' },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: '#E5E7EB' },

  /* Logout */
  logoutBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#FFF1F2',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#FECDD3',
  },
  logoutText: { color: '#E11D48', marginLeft: 8, fontSize: 15, fontWeight: '700' },
});
