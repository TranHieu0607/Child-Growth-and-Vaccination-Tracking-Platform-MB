import { useState } from 'react';
import { loginUser, registerUser } from '../api/authApi';

export default function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  const login = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const data = await loginUser(payload);
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
      const data = await registerUser(payload);
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