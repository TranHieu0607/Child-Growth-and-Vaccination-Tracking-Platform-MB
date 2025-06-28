import { useState, useEffect, useCallback } from 'react';
import { getDailyRecordsByChildId } from '../api/dailyApi';

export default function useDailyRecords(childId) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRecords = useCallback(async () => {
    if (!childId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getDailyRecordsByChildId(childId);
      setRecords(res || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [childId]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  return { records, loading, error, refetch: fetchRecords };
} 