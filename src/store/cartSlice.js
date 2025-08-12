import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import orderApi from './api/orderApi';

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
  },
  reducers: {
    addToCart: (state, action) => {
      if (action.payload.packageId) {
        // Nếu là package, xóa các package cũ, chỉ giữ lại vaccine lẻ và package mới
        state.items = state.items.filter(item => !item.packageId);
        
        // Sửa quantity của mỗi vaccine trong package theo phác đồ (numberOfDoses)
        const packageWithUpdatedQuantity = { ...action.payload, quantity: 1 };
        if (packageWithUpdatedQuantity.packageVaccines) {
          packageWithUpdatedQuantity.packageVaccines = packageWithUpdatedQuantity.packageVaccines.map(pv => ({
            ...pv,
            quantity: pv.facilityVaccine?.vaccine?.numberOfDoses || 1
          }));
        }
        
        state.items.push(packageWithUpdatedQuantity);
      } else {
        // Vaccine lẻ: cho phép nhiều loại
        const existingItem = state.items.find(item => item.facilityVaccineId === action.payload.facilityVaccineId);
        if (existingItem) {
          existingItem.quantity += 1;
        } else {
          state.items.push({ ...action.payload, quantity: 1 });
        }
      }
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter(item => item.packageId !== action.payload);
    },
    updateCartItemQuantity: (state, action) => {
      const { packageId, quantity } = action.payload;
      const item = state.items.find(item => item.packageId === packageId);
      if (item) {
        if (quantity <= 0) {
          state.items = state.items.filter(item => item.packageId !== packageId);
        } else {
          item.quantity = quantity;
        }
      }
    },
    updatePackageVaccine: (state, action) => {
      const { packageId, packageVaccineId, facilityVaccineId, quantity } = action.payload;
      const pkg = state.items.find(item => item.packageId === packageId);
      if (pkg && pkg.packageVaccines) {
        const pv = pkg.packageVaccines.find(v => v.packageVaccineId === packageVaccineId);
        if (pv) {
          pv.facilityVaccineId = facilityVaccineId;
          pv.quantity = quantity;
        }
      }
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { addToCart, removeFromCart, updateCartItemQuantity, clearCart } = cartSlice.actions;

export const orderPackage = createAsyncThunk(
  'cart/orderPackage',
  async ({ pkg, token }, { rejectWithValue }) => {
    try {
      const response = await orderApi.createOrder(pkg, token);
      return response.data;
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || e.message || 'Order failed');
    }
  }
);

export const selectCartItems = (state) => state.cart.items;
export const selectCartItemCount = (state) => 
  state.cart.items.reduce((count, item) => count + item.quantity, 0);
export const selectCartTotal = (state) =>
  state.cart.items.reduce((total, item) => {
    if (item.packageVaccines) {
      // Tính tổng từng vaccine trong package
      return total + item.packageVaccines.reduce((pkgSum, pv) => {
        // Ưu tiên lấy giá từ facilityVaccine, nếu không có thì lấy pv.price
        const price =
          (pv.facilityVaccine && pv.facilityVaccine.price) ||
          pv.price ||
          0;
        return pkgSum + (price * pv.quantity);
      }, 0);
    } else if (item.price && item.quantity) {
      // Vaccine lẻ
      return total + (item.price * item.quantity);
    }
    return total;
  }, 0);

export default cartSlice.reducer; 