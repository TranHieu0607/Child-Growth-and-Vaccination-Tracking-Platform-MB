import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { login as loginThunk, register as registerThunk } from '../authSlice';

export default function useAuth() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  const login = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const data = await dispatch(loginThunk(payload)).unwrap();
      setUser(data);
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const data = await dispatch(registerThunk(payload)).unwrap();
      setUser(data);
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { user, loading, error, login, register };
} 