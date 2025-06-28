import { useState, useEffect, useCallback } from 'react';
import diseasesApi from '../api/diseasesApi';

export default function useDiseases() {
  const [diseases, setDiseases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDiseases = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await diseasesApi.getAllDiseases();
      setDiseases(res.data || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDiseases();
  }, [fetchDiseases]);

  return { diseases, loading, error, refetch: fetchDiseases };
} 