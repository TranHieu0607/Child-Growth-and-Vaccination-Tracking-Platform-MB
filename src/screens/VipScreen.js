import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Platform } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCrown, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Ionicons } from '@expo/vector-icons';
import membershipApi from '../store/api/membershipApi';
import { useSelector } from 'react-redux';

const VipScreen = ({ navigation }) => {
  const [vip, setVip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = useSelector(state => state.auth.token);
  const [subscribing, setSubscribing] = useState(false);
  const [subscribeMsg, setSubscribeMsg] = useState(null);

  useEffect(() => {
    const fetchVip = async () => {
      try {
        const data = await membershipApi.getActiveMemberships();
        // Giả sử chỉ lấy gói VIP đầu tiên (hoặc lọc theo điều kiện nếu có nhiều gói)
        setVip(data[0]);
      } catch (err) {
        setError('Không thể tải dữ liệu gói VIP');
      } finally {
        setLoading(false);
      }
    };
    fetchVip();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={{...styles.header}}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color="#222" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nâng cấp VIP</Text>
          <View style={{ width: 28 }} />
        </View>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Banner */}
          <View style={styles.banner}>
            <Text style={styles.bannerText}>Nâng cấp tài khoản VIP để{"\n"}chăm sóc bé tốt hơn!</Text>
          </View>
          {/* So sánh quyền lợi */}
          <View style={styles.compareBox}>
            <Text style={styles.compareTitle}>So sánh quyền lợi</Text>
            <View style={styles.compareRow}>
              <View style={styles.compareCol}>
                <FontAwesomeIcon icon={faCrown} size={24} color="#aaa" />
                <Text style={styles.freeTitle}>Gói Miễn Phí</Text>
                <View style={styles.compareItem}><FontAwesomeIcon icon={faCheck} size={16} color="#4caf50" /><Text style={styles.compareText}>  Theo dõi 1 bé</Text></View>
                <View style={styles.compareItem}><FontAwesomeIcon icon={faTimes} size={16} color="#f44336" /><Text style={styles.compareText}>  Không có dự đoán sức khỏe</Text></View>
              </View>
              <View style={styles.compareCol}>
                <FontAwesomeIcon icon={faCrown} size={24} color="#1565C0" />
                <Text style={styles.vipTitle}>{vip ? vip.name : 'Gói VIP'}</Text>
                <View style={styles.compareItem}><FontAwesomeIcon icon={faCheck} size={16} color="#4caf50" /><Text style={styles.compareText}>  {vip ? vip.benefits : 'Có dự đoán sức khỏe'}</Text></View>
                <View style={styles.compareItem}><FontAwesomeIcon icon={faCheck} size={16} color="#4caf50" /><Text style={styles.compareText}>  Theo dõi 5 bé</Text></View>
              </View>
            </View>
          </View>
          {/* Giá và thời hạn */}
          <View style={styles.priceBox}>
            {loading ? (
              <Text>Đang tải...</Text>
            ) : error ? (
              <Text style={{ color: 'red' }}>{error}</Text>
            ) : vip ? (
              <>
                <Text style={styles.price}>{vip.price}<Text style={styles.currency}>đ</Text><Text style={styles.perYear}>/{vip.duration} ngày</Text></Text>
                <Text style={styles.duration}>{vip.description}</Text>
              </>
            ) : null}
          </View>
        </ScrollView>
        {/* Nút nâng cấp ngay cố định dưới cùng */}
        <View style={styles.upgradeBtnContainer}>
          <TouchableOpacity
            style={styles.upgradeBtn}
            disabled={subscribing || !vip}
            onPress={async () => {
              setSubscribing(true);
              setSubscribeMsg(null);
              try {
                const res = await membershipApi.subscribeVip(vip.membershipId, token);
                setSubscribeMsg(res.message || 'Đăng ký thành công!');
                setTimeout(() => {
                  navigation.navigate('Home');
                }, 1000);
              } catch (err) {
                setSubscribeMsg('Đăng ký thất bại!');
              } finally {
                setSubscribing(false);
              }
            }}
          >
            <Text style={styles.upgradeText}>{subscribing ? 'Đang xử lý...' : 'Nâng cấp ngay'}</Text>
          </TouchableOpacity>
          {subscribeMsg && (
            <Text style={{ color: subscribeMsg.includes('thành công') ? '#4caf50' : 'red', marginTop: 8, textAlign: 'center' }}>{subscribeMsg}</Text>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 20, paddingBottom: 16 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1565C0' },
  banner: { alignItems: 'center', marginBottom: 20 },
  bannerText: { fontSize: 18, fontWeight: 'bold', color: '#1565C0', textAlign: 'center', lineHeight: 28 },
  scrollContent: { paddingBottom: 32 },
  compareBox: { backgroundColor: '#f8fafd', borderRadius: 16, padding: 16, marginBottom: 20 },
  compareTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12, color: '#222' },
  compareRow: { flexDirection: 'row', justifyContent: 'space-between' },
  compareCol: { flex: 1, alignItems: 'center' },
  freeTitle: { fontWeight: 'bold', color: '#888', marginVertical: 8 },
  vipTitle: { fontWeight: 'bold', color: '#1565C0', marginVertical: 8 },
  compareItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  compareText: { fontSize: 14, color: '#222' },
  priceBox: { alignItems: 'center', marginBottom: 10 },
  price: { fontSize: 32, fontWeight: 'bold', color: '#1565C0' },
  currency: { fontSize: 18, color: '#1565C0' },
  perYear: { fontSize: 16, color: '#888' },
  duration: { fontSize: 14, color: '#888', marginTop: 2 },
  upgradeBtnContainer: {
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    paddingTop: 8,
    backgroundColor: '#fff',
  },
  upgradeBtn: {
    backgroundColor: '#1565C0',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 0,
    shadowColor: '#1565C0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
  },
  upgradeText: { color: '#fff', fontSize: 20, fontWeight: 'bold', letterSpacing: 1 },
});

export default VipScreen; 