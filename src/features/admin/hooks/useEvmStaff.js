import { useCallback, useEffect, useMemo, useState } from "react";
import evmStaffService from "../services/evmStaffService";

export function useEvmStaff(initialQuery = {}) {
  const [staffList, setStaffList] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState(initialQuery);

  const fetchStaff = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await evmStaffService.list({ ...query, ...params });
      let staffArray = [];
      
      // Support both array or paginated { items, total }
      if (Array.isArray(res)) {
        staffArray = res;
        setTotal(res.length);
      } else if (res?.data) {
        staffArray = res.data?.items || res.data || [];
        setTotal(res.data?.total || 0);
      } else {
        staffArray = res.items || [];
        setTotal(res.total || 0);
      }
      
      // Map email từ account object vào mỗi staff item
      const mappedStaff = staffArray.map(staff => ({
        ...staff,
        // Email có thể ở trong account object hoặc trực tiếp trong staff
        email: staff.account?.email || staff.email || null
      }));
      
      setStaffList(mappedStaff);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const reload = useCallback(() => fetchStaff(), [fetchStaff]);

  return useMemo(() => ({ 
    staffList, 
    total, 
    loading, 
    error, 
    setQuery, 
    fetchStaff, 
    reload 
  }), [staffList, total, loading, error, setQuery, fetchStaff, reload]);
}

export function useEvmStaffMutations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createStaff = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    try {
      return await evmStaffService.create(payload);
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStaff = useCallback(async (id, payload) => {
    setLoading(true);
    setError(null);
    try {
      return await evmStaffService.update(id, payload);
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteStaff = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      return await evmStaffService.remove(id);
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { 
    createStaff, 
    updateStaff, 
    deleteStaff, 
    loading, 
    error 
  };
}

