import { useState, useEffect, useCallback } from 'react';
import vaccinesApi from '../api/vaccinesApi';

export default function useVaccines() {
  const [vaccines, setVaccines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchVaccines = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await vaccinesApi.getAllVaccines();
      setVaccines(res.data || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVaccines();
  }, [fetchVaccines]);

  return { vaccines, loading, error, refetch: fetchVaccines };
} 