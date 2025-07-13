import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft, faTrash, faPlus, faMinus, faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import { useDispatch, useSelector } from 'react-redux';
import { removeFromCart, updateCartItemQuantity, clearCart, selectCartItems, selectCartItemCount, selectCartTotal } from '../store/cartSlice';

const CartScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);
  const cartItemCount = useSelector(selectCartItemCount);
  const cartTotal = useSelector(selectCartTotal);

  const handleRemoveFromCart = (packageId) => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc muốn xóa gói tiêm này khỏi giỏ hàng?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xóa', 
          style: 'destructive',
          onPress: () => {
            dispatch(removeFromCart(packageId));
          }
        }
      ]
    );
  };

  const handleUpdateCartItemQuantity = (packageId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart(packageId);
      return;
    }
    dispatch(updateCartItemQuantity({ packageId, quantity: newQuantity }));
  };

  const handleClearCart = () => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc muốn xóa tất cả gói tiêm khỏi giỏ hàng?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xóa tất cả', 
          style: 'destructive',
          onPress: () => {
            dispatch(clearCart());
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <FontAwesomeIcon icon={faArrowLeft} size={25} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Giỏ hàng</Text>
        <View style={styles.headerRight}>
          {cartItems.length > 0 && (
            <TouchableOpacity onPress={handleClearCart} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>Xóa tất cả</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Cart Content */}
      <ScrollView style={styles.cartContent}>
        {cartItems.length === 0 ? (
          <View style={styles.emptyCartContainer}>
            <FontAwesomeIcon icon={faShoppingCart} size={60} color="#ccc" />
            <Text style={styles.emptyCartTitle}>Giỏ hàng trống</Text>
            <Text style={styles.emptyCartText}>
              Bạn chưa có gói tiêm nào trong giỏ hàng
            </Text>
            <TouchableOpacity 
              style={styles.backToBookingButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backToBookingButtonText}>Quay lại đặt lịch</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Cart Items */}
            <View style={styles.cartItemsContainer}>
              {cartItems.map((item, idx) => (
                <View key={item.packageId || item.facilityVaccineId || idx} style={styles.cartItem}>
                  <View style={styles.cartItemInfo}>
                    <Text style={styles.cartItemName}>
                      {item.name || item.vaccine?.name || 'Không rõ tên'}
                    </Text>
                    <Text style={styles.cartItemDescription}>
                      {item.description?.substring(0, 100) ||
                       item.vaccine?.description?.substring(0, 100) ||
                       ''}
                    </Text>
                    <Text style={styles.cartItemPrice}>
                      {(item.price || item.vaccine?.price)?.toLocaleString('vi-VN')}đ
                    </Text>
                  </View>
                  
                  <View style={styles.cartItemActions}>
                    <View style={styles.quantityContainer}>
                                             <TouchableOpacity 
                         style={styles.quantityButton}
                         onPress={() => handleUpdateCartItemQuantity(item.packageId, item.quantity - 1)}
                       >
                        <FontAwesomeIcon icon={faMinus} size={12} color="#007bff" />
                      </TouchableOpacity>
                      <Text style={styles.quantityText}>{item.quantity}</Text>
                                             <TouchableOpacity 
                         style={styles.quantityButton}
                         onPress={() => handleUpdateCartItemQuantity(item.packageId, item.quantity + 1)}
                       >
                        <FontAwesomeIcon icon={faPlus} size={12} color="#007bff" />
                      </TouchableOpacity>
                    </View>
                    
                    <View style={styles.itemTotal}>
                      <Text style={styles.itemTotalLabel}>Tổng:</Text>
                      <Text style={styles.itemTotalPrice}>
                        {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                      </Text>
                    </View>
                    
                                         <TouchableOpacity 
                       style={styles.removeButton}
                       onPress={() => handleRemoveFromCart(item.packageId)}
                     >
                      <FontAwesomeIcon icon={faTrash} size={16} color="#ff4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>

            {/* Cart Summary */}
            <View style={styles.cartSummary}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Số lượng gói:</Text>
                <Text style={styles.summaryValue}>{cartItems.length}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tổng số lượng:</Text>
                                 <Text style={styles.summaryValue}>{cartItemCount}</Text>
              </View>
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Tổng cộng:</Text>
                                 <Text style={styles.totalPrice}>{cartTotal.toLocaleString('vi-VN')}đ</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.continueShoppingButton}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.continueShoppingButtonText}>Tiếp tục đặt lịch</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f7f9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clearButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  clearButtonText: {
    color: '#ff4444',
    fontSize: 14,
    fontWeight: '500',
  },
  cartContent: {
    flex: 1,
    padding: 15,
  },
  emptyCartContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyCartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
    marginBottom: 8,
  },
  emptyCartText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 30,
  },
  backToBookingButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backToBookingButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cartItemsContainer: {
    marginBottom: 20,
  },
  cartItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 0.8,
    elevation: 1,
  },
  cartItemInfo: {
    marginBottom: 10,
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  cartItemDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 5,
  },
  cartItemPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#007bff',
  },
  cartItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  quantityText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginHorizontal: 12,
    minWidth: 25,
    textAlign: 'center',
  },
  itemTotal: {
    alignItems: 'flex-end',
  },
  itemTotalLabel: {
    fontSize: 12,
    color: '#666',
  },
  itemTotalPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007bff',
  },
  removeButton: {
    padding: 8,
  },
  cartSummary: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 0.8,
    elevation: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 8,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007bff',
  },
  actionButtons: {
    gap: 10,
  },
  continueShoppingButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#007bff',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  continueShoppingButtonText: {
    color: '#007bff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkoutButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CartScreen; 