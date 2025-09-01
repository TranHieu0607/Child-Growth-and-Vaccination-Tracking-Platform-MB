import { useState, useEffect, useCallback } from 'react';
import { getDailyRecordsByChildId, updateDailyRecord as updateDailyRecordApi } from '../api/dailyApi';

export default function useDailyRecords(childId) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDailyRecords = useCallback(async (childIdParam) => {
    const targetChildId = childIdParam || childId;
    if (!targetChildId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getDailyRecordsByChildId(targetChildId);
      setRecords(res || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [childId]);

  const updateDailyRecord = useCallback(async (recordId, payload) => {
    try {
      const updated = await updateDailyRecordApi(recordId, payload);
      setRecords(prev => prev.map(r => r.dailyRecordId === recordId ? updated : r));
      return updated;
    } catch (err) {
      setError(err);
      throw err;
    }
  }, []);

  useEffect(() => {
    if (childId) {
      fetchDailyRecords();
    }
  }, [childId, fetchDailyRecords]);

  return { records, loading, error, fetchDailyRecords, updateDailyRecord };
} 