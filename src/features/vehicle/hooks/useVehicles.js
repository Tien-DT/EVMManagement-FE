import { useCallback, useEffect, useMemo, useState } from "react";
import vehicleService from "../services/vehicleService";

export function useVehicles(initialQuery = {}) {
  const [vehicles, setVehicles] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState(initialQuery);

  const fetchVehicles = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await vehicleService.list({ ...query, ...params });
      if (Array.isArray(res)) {
        setVehicles(res);
        setTotal(res.length);
      } else if (res?.data) {
        setVehicles(res.data?.items || res.data || []);
        setTotal(res.data?.total || 0);
      } else {
        setVehicles(res.items || []);
        setTotal(res.total || 0);
      }
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const reload = useCallback(() => fetchVehicles(), [fetchVehicles]);

  return useMemo(() => ({ vehicles, total, loading, error, setQuery, fetchVehicles, reload }), [vehicles, total, loading, error, setQuery, fetchVehicles, reload]);
}

export function useVehicleMutations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createVehicle = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    try {
      return await vehicleService.create(payload);
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateVehicle = useCallback(async (id, payload) => {
    setLoading(true);
    setError(null);
    try {
      return await vehicleService.update(id, payload);
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteVehicle = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      return await vehicleService.remove(id);
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createVehicle, updateVehicle, deleteVehicle, loading, error };
}


