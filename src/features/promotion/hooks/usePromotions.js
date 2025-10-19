import { useState, useEffect } from 'react';
import promotionService from '../services/promotionService';

// Hook for fetching promotions
export const usePromotions = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPromotions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await promotionService.getAll();
      // Handle paginated response structure from API
      const promotions = response?.data?.items || response?.items || response;
      setPromotions(Array.isArray(promotions) ? promotions : []);
    } catch (err) {
      setError(err);
      console.error('Error fetching promotions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  return {
    promotions,
    loading,
    error,
    reload: fetchPromotions
  };
};

// Hook for promotion mutations (create, update, delete)
export const usePromotionMutations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createPromotion = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await promotionService.create(data);
      return response;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updatePromotion = async (id, data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await promotionService.update(id, data);
      return response;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deletePromotion = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await promotionService.delete(id);
      return response;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createPromotion,
    updatePromotion,
    deletePromotion,
    loading,
    error
  };
};

// Hook for fetching single promotion
export const usePromotion = (id) => {
  const [promotion, setPromotion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPromotion = async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await promotionService.getById(id);
      const data = response?.data || response;
      setPromotion(data);
    } catch (err) {
      setError(err);
      console.error('Error fetching promotion:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotion();
  }, [id]);

  return {
    promotion,
    loading,
    error,
    reload: fetchPromotion
  };
};
