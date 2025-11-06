import { useCallback, useEffect, useMemo, useState } from "react";
import evmStaffService from "../services/evmStaffService";
import axiosInstance from "../../../api/axiosInstance";
import endpoints from "../../../api/endpoints";

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
      let staffData = [];
      
      // Use getByRole endpoint with EVM_STAFF role (API supports: EVM_ADMIN, EVM_STAFF, DEALER_MANAGER, DEALER_STAFF)
      try {
        const response = await axiosInstance.get(endpoints.userProfile.getByRole, {
          params: { 
            role: "EVM_STAFF",
            isActive: true,  // Only get active staff
            ...query, 
            ...params 
          }
        });
        const data = response?.data?.items || response?.data || [];
        if (Array.isArray(data)) {
          staffData = data;
          setTotal(data.length);
        } else {
          // Handle paginated response
          staffData = data?.items || [];
          setTotal(data?.total || data.length || 0);
        }
      } catch (roleError) {
        console.warn("getByRole with EVM_STAFF failed, trying fallback:", roleError);
        // Fallback: get all users and filter by role
        const res = await evmStaffService.list({ ...query, ...params });
        // Support both array or paginated { items, total }
        if (Array.isArray(res)) {
          staffData = res;
          setTotal(res.length);
        } else if (res?.data) {
          staffData = res.data?.items || res.data || [];
          setTotal(res.data?.total || 0);
        } else {
          staffData = res.items || [];
          setTotal(res.total || 0);
        }
        
        // Filter to only show EVM_STAFF, exclude dealer managers
        staffData = staffData.filter(staff => {
          const role = staff.role?.toUpperCase() || staff.account?.role?.toUpperCase() || "";
          return role === "EVM_STAFF";
        });
      }
      
      // Extract email from account object if available
      staffData = staffData.map(staff => ({
        ...staff,
        email: staff.email || staff.account?.email || staff.accountEmail || null
      }));
      
      setStaffList(staffData);
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

  const deleteStaff = useCallback(async (id, accountId = null) => {
    setLoading(true);
    setError(null);
    try {
      return await evmStaffService.remove(id, accountId);
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

