import { useState, useEffect, useCallback } from 'react';
import { getFullGrowthData } from '../api/growthApi';

export default function useGrowthData(childId, gender) {
  const [growthData, setGrowthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGrowthData = useCallback(async () => {
    if (!childId || !gender) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getFullGrowthData(childId, gender);
      setGrowthData(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [childId, gender]);

  useEffect(() => {
    fetchGrowthData();
  }, [fetchGrowthData]);

  return { growthData, loading, error, refetch: fetchGrowthData };
} 