import { useCallback, useEffect, useMemo, useState } from "react";
import variantService from "../services/variantService";

export function useVehicleVariants(initialQuery = {}) {
  const [variants, setVariants] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState(initialQuery);

  const fetchVariants = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await variantService.list({ ...query, ...params });
      if (Array.isArray(res)) {
        setVariants(res);
        setTotal(res.length);
      } else if (res?.data) {
        setVariants(res.data?.items || res.data || []);
        setTotal(
          res.data?.totalCount || res.data?.total || res.data?.items?.length || 0
        );
      } else {
        setVariants(res.items || []);
        setTotal(res.totalCount || res.total || 0);
      }
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchVariants();
  }, [fetchVariants]);

  const reload = useCallback(() => fetchVariants(), [fetchVariants]);

  return useMemo(
    () => ({ variants, total, loading, error, setQuery, fetchVariants, reload }),
    [variants, total, loading, error, setQuery, fetchVariants, reload]
  );
}

export function useVariantMutations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createVariant = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    try {
      return await variantService.create(payload);
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateVariant = useCallback(async (id, payload) => {
    setLoading(true);
    setError(null);
    try {
      return await variantService.update(id, payload);
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteVariant = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      return await variantService.remove(id);
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createVariant, updateVariant, deleteVariant, loading, error };
}

export default useVehicleVariants;


