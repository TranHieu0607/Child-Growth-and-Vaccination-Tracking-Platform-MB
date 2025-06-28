import { useState, useEffect, useCallback } from 'react';
import childVaccineProfileApi from '../api/childVaccineProfileApi';

export default function useChildVaccineProfile(childId) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async () => {
    if (!childId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await childVaccineProfileApi.getByChildId(childId);
      setProfile(res.data || null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [childId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { profile, loading, error, refetch: fetchProfile };
} 