import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

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
        state.items.push({ ...action.payload, quantity: 1 });
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
      const selectedVaccines = pkg.packageVaccines.map(pv => ({
        diseaseId: pv.diseaseId,
        facilityVaccineId: pv.facilityVaccineId,
        quantity: pv.quantity,
      }));
      const payload = {
        packageId: pkg.packageId,
        selectedVaccines,
        orderDate: new Date().toISOString(),
        status: 'Pending',
      };
      console.log('selectedVaccines:', selectedVaccines);
      console.log('Payload gửi đi:', JSON.stringify(payload, null, 2));
      const res = await fetch('https://kidtrackingapi20250721100909-bmg3djfmg2exbqfd.eastasia-01.azurewebsites.net/api/Order/package', {
        method: 'POST',
        headers: {
          'accept': '*/*',
          'Authorization': token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Order failed');
      return await res.json();
    } catch (e) {
      return rejectWithValue(e.message);
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