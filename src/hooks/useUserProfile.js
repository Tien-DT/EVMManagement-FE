import { useState, useEffect } from 'react';
import { authService } from '../features/auth/services/authService';

export const useUserProfile = (accountId) => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUserProfile = async () => {
    if (!accountId) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await authService.getUserProfileByAccount(accountId);
      setUserProfile(response.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, [accountId]);

  return { userProfile, loading, error, refetch: fetchUserProfile };
};

export default useUserProfile;
