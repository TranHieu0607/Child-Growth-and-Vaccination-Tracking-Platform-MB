import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft, faTrash, faPlus, faMinus, faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import { useDispatch, useSelector } from 'react-redux';
import { removeFromCart, updateCartItemQuantity, clearCart, selectCartItems, selectCartItemCount, selectCartTotal } from '../store/cartSlice';
import vaccinesApi from '../store/api/vaccinesApi';
import { Picker } from '@react-native-picker/picker';
import { orderPackage } from '../store/cartSlice';

const CartScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);
  const cartItemCount = useSelector(selectCartItemCount);
  const cartTotal = useSelector(selectCartTotal);
  const token = useSelector(state => state.auth.token);

  // State to store facility vaccines for each facilityId
  const [facilityVaccinesMap, setFacilityVaccinesMap] = useState({});
  // Xóa biến isOrdering vì không còn dùng nữa
  const [isOrdering, setIsOrdering] = useState(false);

  // Fetch facility vaccines for each package's facilityId
  useEffect(() => {
    const fetchAllFacilityVaccines = async () => {
      const facilityIds = [
        ...new Set(
          cartItems
            .filter(item => item.packageId && item.packageVaccines)
            .map(pkg => pkg.facilityId)
        ),
      ];
      const newMap = {};
      for (const facilityId of facilityIds) {
        try {
          const res = await vaccinesApi.getFacilityVaccines(facilityId, token);
          newMap[facilityId] = res.data?.data || [];
        } catch (e) {
          newMap[facilityId] = [];
        }
      }
      setFacilityVaccinesMap(newMap);
    };
    fetchAllFacilityVaccines();
  }, [cartItems, token]);

  // Handler for updating vaccine or dose in a package disease
  const handleUpdatePackageVaccine = (packageId, packageVaccineId, newFacilityVaccineId, newQuantity) => {
    dispatch({
      type: 'cart/updatePackageVaccine',
      payload: { packageId, packageVaccineId, facilityVaccineId: newFacilityVaccineId, quantity: newQuantity },
    });
  };

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

  // Lọc chỉ hiển thị package (ẩn vaccine lẻ)
  const packageCartItems = cartItems.filter(item => item.packageId && item.packageVaccines);

  // Tính tổng cộng tất cả các package
  const totalAllPackages = packageCartItems.reduce((sum, pkg) => {
    const packageTotal = pkg.packageVaccines.reduce((pkgSum, pv) => {
      const allVaccines = (facilityVaccinesMap[pkg.facilityId] || []).filter(fv =>
        fv.vaccine?.diseases?.some(d => d.diseaseId === pv.diseaseId)
      );
      const selectedFacilityVaccine = allVaccines.find(fv => fv.facilityVaccineId === pv.facilityVaccineId);
      const price = selectedFacilityVaccine?.price || 0;
      return pkgSum + price * pv.quantity;
    }, 0);
    return sum + packageTotal;
  }, 0);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' , padding: 20, marginTop: 20 }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <FontAwesomeIcon icon={faArrowLeft} size={25} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Giỏ hàng</Text>
        <View style={styles.headerRight}>
          {packageCartItems.length > 0 && (
            <TouchableOpacity onPress={handleClearCart} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>Xóa tất cả</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Cart Content */}
      <ScrollView style={styles.cartContent}>
        {packageCartItems.length === 0 ? (
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
            {/* Cart Items - Vaccine Packages */}
            <View style={styles.cartItemsContainer}>
              {packageCartItems.map((pkg, idx) => (
                <View key={pkg.packageId} style={styles.cartItem}>
                  <Text style={styles.cartItemName}>{pkg.name}</Text>
                  <Text style={styles.cartItemDescription}>{pkg.description}</Text>
                  {pkg.packageVaccines.map((pv, pvIdx) => {
                    // Get all facility vaccines for this facilityId and diseaseId
                    const facilityVaccines = (facilityVaccinesMap[pkg.facilityId] || []).filter(fv =>
                      fv.vaccine?.diseases?.some(d => d.diseaseId === pv.diseaseId)
                    );
                    // Add the current package vaccine if not in facilityVaccines
                    const allVaccines = [
                      ...(facilityVaccines.find(fv => fv.facilityVaccineId === pv.facilityVaccineId)
                        ? facilityVaccines
                        : [pv.facilityVaccine, ...facilityVaccines]),
                    ];
                    const maxDoses = allVaccines.find(fv => fv.facilityVaccineId === pv.facilityVaccineId)?.vaccine?.numberOfDoses || 1;
                    const selectedFacilityVaccine = allVaccines.find(fv => fv.facilityVaccineId === pv.facilityVaccineId);
                    const price = selectedFacilityVaccine?.price || 0;
                    return (
                      <View key={pv.packageVaccineId} style={styles.packageDiseaseBlock}>
                        <Text style={styles.diseaseName}>{pv.disease?.name}</Text>
                        <View style={styles.vaccineRow}>
                          <Text style={styles.vaccineLabel}>Vaccine:</Text>
                          <Picker
                            selectedValue={pv.facilityVaccineId}
                            style={styles.vaccinePicker}
                            onValueChange={val => handleUpdatePackageVaccine(pkg.packageId, pv.packageVaccineId, val, pv.quantity)}
                          >
                            {allVaccines.map(fv => (
                              <Picker.Item
                                key={fv.facilityVaccineId}
                                label={fv.vaccine?.name || 'Không rõ tên vaccine'}
                                value={fv.facilityVaccineId}
                              />
                            ))}
                          </Picker>
                        </View>
                        <View style={styles.doseRow}>
                          <Text style={styles.doseLabel}>Số liều:</Text>
                          <TouchableOpacity
                            style={styles.doseButton}
                            onPress={() => handleUpdatePackageVaccine(pkg.packageId, pv.packageVaccineId, pv.facilityVaccineId, Math.max(1, pv.quantity - 1))}
                            disabled={pv.quantity <= 1}
                          >
                            <FontAwesomeIcon icon={faMinus} size={14} color="#007bff" />
                          </TouchableOpacity>
                          <Text style={styles.doseValue}>{pv.quantity}</Text>
                          <TouchableOpacity
                            style={styles.doseButton}
                            onPress={() => handleUpdatePackageVaccine(pkg.packageId, pv.packageVaccineId, pv.facilityVaccineId, Math.min(maxDoses, pv.quantity + 1))}
                            disabled={pv.quantity >= maxDoses}
                          >
                            <FontAwesomeIcon icon={faPlus} size={14} color="#007bff" />
                          </TouchableOpacity>
                          <Text style={{marginLeft: 10, color: '#888', fontSize: 13}}>Phác đồ: {maxDoses} liều</Text>
                        </View>
                        <Text style={styles.vaccinePrice}>
                          Đơn giá: {price.toLocaleString('vi-VN')}đ
                        </Text>
                      </View>
                    );
                  })}
                </View>
              ))}
            </View>

            {/* Cart Summary */}
            <View style={styles.cartSummary}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Số lượng gói:</Text>
                <Text style={styles.summaryValue}>{packageCartItems.length}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tổng số lượng:</Text>
                <Text style={styles.summaryValue}>{cartItemCount}</Text>
              </View>
              {packageCartItems.map((pkg, idx) => {
                const packageTotal = pkg.packageVaccines.reduce((sum, pv) => {
                  const allVaccines = (facilityVaccinesMap[pkg.facilityId] || []).filter(fv =>
                    fv.vaccine?.diseases?.some(d => d.diseaseId === pv.diseaseId)
                  );
                  const selectedFacilityVaccine = allVaccines.find(fv => fv.facilityVaccineId === pv.facilityVaccineId);
                  const price = selectedFacilityVaccine?.price || 0;
                  return sum + price * pv.quantity;
                }, 0);
                return (
                  <View key={pkg.packageId} style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Gói {idx + 1}:</Text>
                    <Text style={styles.summaryValue}>{packageTotal.toLocaleString('vi-VN')}đ</Text>
                  </View>
                );
              })}
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Tổng cộng:</Text>
                <Text style={styles.totalPrice}>{totalAllPackages.toLocaleString('vi-VN')}đ</Text>
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
              {/* Đã bỏ nút đặt hàng ở đây */}
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
    marginTop: 10,
  },
  checkoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  packageDiseaseBlock: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  vaccineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  vaccineLabel: {
    fontSize: 14,
    color: '#555',
    marginRight: 10,
  },
  vaccinePicker: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  doseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  doseLabel: {
    fontSize: 14,
    color: '#555',
    marginRight: 10,
  },
  doseButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 5,
  },
  doseValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    minWidth: 30,
    textAlign: 'center',
  },
  vaccinePrice: {
    fontSize: 14,
    color: '#007bff',
    fontWeight: 'bold',
    marginTop: 5,
  },
  diseaseName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
});

export default CartScreen; 