import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Platform, Alert } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCrown, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Ionicons } from '@expo/vector-icons';
import membershipApi from '../store/api/membershipApi';
import { useSelector } from 'react-redux';
import PaymentWebView from './PaymentWebView';

const VipScreen = ({ navigation }) => {
  const [vip, setVip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = useSelector(state => state.auth.token);
  const accountId = useSelector(state => state.auth.user?.accountId || state.auth.user?.id);
  const [payLoading, setPayLoading] = useState(false);
  const [payError, setPayError] = useState(null);
  const [showWebView, setShowWebView] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState('');

  useEffect(() => {
    const fetchVip = async () => {
      try {
        console.log('🔍 [VIP] Bắt đầu tải dữ liệu gói VIP...');
        const data = await membershipApi.getActiveMemberships();
        console.log('✅ [VIP] Dữ liệu gói VIP:', JSON.stringify(data, null, 2));
        setVip(data[0]);
      } catch (err) {
        console.error('❌ [VIP] Lỗi tải dữ liệu VIP:', err);
        setError('Không thể tải dữ liệu gói VIP');
      } finally {
        setLoading(false);
      }
    };
    fetchVip();
  }, []);

  const handlePaymentSuccess = async (orderId) => {
    console.log('🎉 [VIP] Thanh toán thành công, orderId:', orderId);
    
    if (!orderId) {
      console.error('❌ [VIP] Không có orderId từ thanh toán');
      Alert.alert(
        'Lỗi thanh toán',
        'Không thể xác thực giao dịch. Vui lòng thử lại.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      console.log('🔍 [VIP] Kiểm tra trạng thái thanh toán cho orderId:', orderId);
      // Gọi API kiểm tra trạng thái thanh toán
      const paymentStatus = await membershipApi.checkPaymentStatus(orderId, token);
      console.log('📊 [VIP] Trạng thái thanh toán:', JSON.stringify(paymentStatus, null, 2));
      
      if (paymentStatus.success && paymentStatus.data.status === 'PAID') {
        console.log('✅ [VIP] Xác nhận thanh toán thành công');
        Alert.alert(
          'Thanh toán thành công!',
          `Bạn đã đăng ký gói VIP thành công.\nMã đơn hàng: ${orderId}\nSố tiền: ${paymentStatus.data.amount}đ\nThời gian: ${new Date(paymentStatus.data.paidAt).toLocaleString('vi-VN')}`,
          [
            {
              text: 'OK',
              onPress: () => {
                // Refresh lại dữ liệu VIP hoặc navigate về màn hình khác
                navigation.goBack();
              },
            },
          ]
        );
      } else {
        console.warn('⚠️ [VIP] Trạng thái thanh toán không hợp lệ:', paymentStatus);
        Alert.alert(
          'Lỗi thanh toán',
          'Trạng thái thanh toán không hợp lệ. Vui lòng liên hệ hỗ trợ.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('❌ [VIP] Lỗi kiểm tra trạng thái thanh toán:', error);
      Alert.alert(
        'Lỗi kiểm tra thanh toán',
        'Không thể xác minh trạng thái thanh toán. Vui lòng liên hệ hỗ trợ.',
        [{ text: 'OK' }]
      );
    }
  };

  const handlePaymentCancel = () => {
    console.log('❌ [VIP] Người dùng hủy thanh toán');
    Alert.alert(
      'Thanh toán đã bị hủy',
      'Bạn đã hủy giao dịch thanh toán.',
      [
        {
          text: 'OK',
          style: 'default',
        },
      ]
    );
  };

  const handleRegister = async () => {
    console.log('🚀 [VIP] Bắt đầu đăng ký VIP...');
    console.log('📱 [VIP] AccountId:', accountId);
    console.log('🎯 [VIP] Gói VIP:', JSON.stringify(vip, null, 2));
    console.log('🔑 [VIP] Token:', token ? 'Có token' : 'Không có token');
    
    if (!vip || !accountId) {
      console.error('❌ [VIP] Thiếu thông tin cần thiết:', { vip: !!vip, accountId: !!accountId });
      return;
    }
    
    setPayLoading(true);
    setPayError(null);
    
    try {
      console.log('💳 [VIP] Tạo thanh toán...');
      const res = await membershipApi.createPayment(accountId, vip.membershipId, token);
      console.log('✅ [VIP] Tạo thanh toán thành công:', JSON.stringify(res, null, 2));
      
      // Hiển thị thông báo và hỏi người dùng có muốn thanh toán không
      Alert.alert(
        'Thanh toán VIP',
        `Bạn có muốn thanh toán gói ${vip.name} với giá ${vip.price}đ?`,
        [
          {
            text: 'Hủy',
            style: 'cancel',
            onPress: () => {
              console.log('❌ [VIP] Người dùng hủy thanh toán từ Alert');
            }
          },
          {
            text: 'Thanh toán',
            onPress: () => {
              console.log('🌐 [VIP] Mở WebView thanh toán với URL:', res.paymentUrl);
              // Mở WebView trong app
              setPaymentUrl(res.paymentUrl);
              setShowWebView(true);
            },
          },
        ]
      );
    } catch (err) {
      console.error('❌ [VIP] Lỗi tạo thanh toán:', err);
      setPayError('Không thể tạo thanh toán.');
    } finally {
      setPayLoading(false);
    }
  };

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
        {/* Nút đăng ký VIP */}
        <View style={styles.upgradeBtnContainer}>
          <TouchableOpacity
            style={styles.upgradeBtn}
            disabled={payLoading || !vip}
            onPress={handleRegister}
          >
            <Text style={styles.upgradeText}>{payLoading ? 'Đang xử lý...' : 'Đăng ký VIP'}</Text>
          </TouchableOpacity>
          {payError && (
            <Text style={{ color: 'red', marginTop: 8, textAlign: 'center' }}>{payError}</Text>
          )}
        </View>
        
        {/* Payment WebView */}
        <PaymentWebView
          visible={showWebView}
          paymentUrl={paymentUrl}
          onClose={() => setShowWebView(false)}
          onSuccess={handlePaymentSuccess}
          onCancel={handlePaymentCancel}
        />
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
  compareBox: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 20 },
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