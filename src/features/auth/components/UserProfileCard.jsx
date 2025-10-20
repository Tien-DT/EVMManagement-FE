import React from 'react';
import useUserProfile from '../../../hooks/useUserProfile';

const UserProfileCard = ({ accountId }) => {
  const { userProfile, loading, error } = useUserProfile(accountId);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
        <span className="ml-3 text-gray-600">Loading user profile...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="text-red-700">Error loading user profile: {error.message}</div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="text-gray-600">No user profile found</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-start space-x-4">
        <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-xl">
            {userProfile.fullName?.[0] || 'U'}
          </span>
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900">{userProfile.fullName}</h3>
          <p className="text-gray-600">{userProfile.account?.email}</p>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Phone</dt>
              <dd className="text-sm text-gray-900">{userProfile.phone || 'N/A'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Card ID</dt>
              <dd className="text-sm text-gray-900">{userProfile.cardId || 'N/A'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Role</dt>
              <dd className="text-sm">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  userProfile.account?.role === 'EVM_ADMIN' 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {userProfile.account?.role || 'N/A'}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="text-sm">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  userProfile.account?.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {userProfile.account?.isActive ? 'Active' : 'Inactive'}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Dealer ID</dt>
              <dd className="text-sm text-gray-900">{userProfile.dealerId || 'N/A'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Created</dt>
              <dd className="text-sm text-gray-900">
                {userProfile.createdDate ? new Date(userProfile.createdDate).toLocaleDateString() : 'N/A'}
              </dd>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileCard;
