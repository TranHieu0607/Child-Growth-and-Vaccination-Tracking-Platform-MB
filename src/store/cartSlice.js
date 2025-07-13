import { createSlice } from '@reduxjs/toolkit';

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
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { addToCart, removeFromCart, updateCartItemQuantity, clearCart } = cartSlice.actions;

export const selectCartItems = (state) => state.cart.items;
export const selectCartItemCount = (state) => 
  state.cart.items.reduce((count, item) => count + item.quantity, 0);
export const selectCartTotal = (state) => 
  state.cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);

export default cartSlice.reducer; 