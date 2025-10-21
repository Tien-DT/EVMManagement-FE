import React, { useState } from 'react';
import UserProfileCard from '../components/UserProfileCard';

const UserProfileTestPage = () => {
  const [accountId, setAccountId] = useState('34fdd400-8a13-44ff-8361-e0e90939cc9a');

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">User Profile Test</h1>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Account ID
          </label>
          <input
            type="text"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            className="w-full max-w-md border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder="Enter account ID"
          />
        </div>

        <UserProfileCard accountId={accountId} />
      </div>
    </div>
  );
};

export default UserProfileTestPage;
