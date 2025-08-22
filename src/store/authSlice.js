import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from './api/axiosClient';
import * as SecureStore from 'expo-secure-store';
import { updateMemberProfile as updateMemberProfileApi } from './api/authApi';

export const login = createAsyncThunk(
  'auth/login',
  async ({ accountName, password }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/auth/login', {
        accountName,
        password,
      });
      const data = response.data;
      // Lưu token vào SecureStore
      await SecureStore.setItemAsync('token', data.token);
      return data;
    } catch (error) {
      // Đảm bảo trả về string
      const err = error.response?.data;
      return rejectWithValue(
        typeof err === 'string'
          ? err
          : err?.message || err?.title || 'Đăng nhập thất bại'
      );
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (form, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/auth/register', form);
      const data = response.data;
      await SecureStore.setItemAsync('token', data.token);
      return data;
    } catch (error) {
      // Đảm bảo trả về string
      const err = error.response?.data;
      return rejectWithValue(
        typeof err === 'string'
          ? err
          : err?.message || err?.title || 'Đăng ký thất bại'
      );
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  await SecureStore.deleteItemAsync('token');
});

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (payload, { rejectWithValue }) => {
    try {
      const data = await updateMemberProfileApi(payload);
      return data;
    } catch (error) {
      const err = error.response?.data;
      return rejectWithValue(
        typeof err === 'string' ? err : err?.message || err?.title || 'Cập nhật hồ sơ thất bại'
      );
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.token = action.payload.token;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
      })
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        // API trả về thông tin member/account; hợp nhất vào user hiện có
        state.user = { ...(state.user || {}), ...(action.payload || {}) };
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default authSlice.reducer; 