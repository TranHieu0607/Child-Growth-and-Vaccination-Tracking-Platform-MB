import React from 'react';
import { Modal, View, ActivityIndicator, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';

const PaymentWebView = ({ visible, paymentUrl, onClose, onSuccess, onCancel }) => {
  const handleNavigationChange = (navState) => {
    const { url } = navState;

    // Kiểm tra thanh toán thành công
    if (url.includes('/payment/success')) {
      // Lấy orderId từ URL nếu có
      const orderIdMatch = url.match(/orderId=([^&]+)/);
      const orderId = orderIdMatch ? orderIdMatch[1] : null;
      
      // Kiểm tra status=PAID và cancel=false
      const statusMatch = url.match(/status=([^&]+)/);
      const cancelMatch = url.match(/cancel=([^&]+)/);
      const status = statusMatch ? statusMatch[1] : null;
      const isCancel = cancelMatch ? cancelMatch[1] === 'true' : false;
      
      onClose();
      
      if (status === 'PAID' && !isCancel && onSuccess) {
        onSuccess(orderId);
      } else if (isCancel && onCancel) {
        onCancel();
      }
      return;
    }

    // Kiểm tra thanh toán bị hủy
    if (url.includes('/payment/cancel')) {
      onClose();
      if (onCancel) {
        onCancel();
      }
      return;
    }
  };

  const handleMessage = (event) => {
    const { data } = event.nativeEvent;
    
    // Kiểm tra message từ WebView
    if (data && (data.includes('payment-success') || data.includes('success'))) {
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        {/* Header với nút đóng */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thanh toán</Text>
          <View style={{ width: 40 }} />
        </View>
        
        {/* WebView */}
        <WebView
          source={{ uri: paymentUrl }}
          onNavigationStateChange={handleNavigationChange}
          onMessage={handleMessage}
          startInLoadingState
          renderLoading={() => (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#1565C0" />
              <Text style={styles.loadingText}>Đang tải trang thanh toán...</Text>
            </View>
          )}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          allowsBackForwardNavigationGestures={true}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
});

export default PaymentWebView; 