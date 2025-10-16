import { useCallback, useEffect, useMemo, useState } from "react";
import dealerService from "../services/dealerService";

export function useDealers(initialQuery = {}) {
  const [dealers, setDealers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState(initialQuery);

  const fetchDealers = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await dealerService.list({ ...query, ...params });
      // Support both array or paginated { items, total }
      if (Array.isArray(res)) {
        setDealers(res);
        setTotal(res.length);
      } else if (res?.data) {
        setDealers(res.data?.items || res.data || []);
        setTotal(res.data?.total || 0);
      } else {
        setDealers(res.items || []);
        setTotal(res.total || 0);
      }
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchDealers();
  }, [fetchDealers]);

  const reload = useCallback(() => fetchDealers(), [fetchDealers]);

  return useMemo(() => ({ dealers, total, loading, error, setQuery, fetchDealers, reload }), [dealers, total, loading, error, setQuery, fetchDealers, reload]);
}

export function useDealerMutations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createDealer = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    try {
      return await dealerService.create(payload);
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateDealer = useCallback(async (id, payload) => {
    setLoading(true);
    setError(null);
    try {
      return await dealerService.update(id, payload);
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteDealer = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      return await dealerService.remove(id);
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createDealer, updateDealer, deleteDealer, loading, error };
}


