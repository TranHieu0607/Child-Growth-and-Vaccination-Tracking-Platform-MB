import { useState, useEffect, useCallback } from 'react';
import childrenApi from '../api/childrenApi';

export default function useChildren() {
  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchChildren = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await childrenApi.getMyChildren();
      setChildren(res.data || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChildren();
  }, [fetchChildren]);

  useEffect(() => {
    if (children.length > 0 && !selectedChildId) {
      setSelectedChildId(children[0].childId);
    }
  }, [children, selectedChildId]);

  return { children, selectedChildId, setSelectedChildId, loading, error, refetch: fetchChildren };
} 