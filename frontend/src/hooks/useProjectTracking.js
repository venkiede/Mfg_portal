/**
 * Custom hook for ProjectTracking page - calls only projectTrackingApi.
 * Example of clean pattern: one page, one API, loading + error handling.
 */

import { useState, useEffect, useCallback } from 'react';
import { projectTrackingApi } from '../api';

export function useProjectTracking() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await projectTrackingApi.getAll();
      setData(res.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch project tracking data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
