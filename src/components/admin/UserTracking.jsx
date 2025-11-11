import React, { useState, useEffect } from 'react';
import { Users, Package, Phone, MapPin } from 'lucide-react';
import api from '../../utils/api';

const UserTracking = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users/all');
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const search = searchTerm.toLowerCase();
    return (
      user.shop_name?.toLowerCase().includes(search) ||
      user.owner_name?.toLowerCase().includes(search) ||
      user.mobile?.includes(search)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lime-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">User Tracking</h2>
          <div className="flex items-center space-x-2 text-gray-600">
            <Users className="w-5 h-5" />
            <span className="font-semibold">{users.length} Total Users</span>
          </div>
        </div>
        <input
          type="text"
          placeholder="Search by name, mobile..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent"
        />
      </div>

      {/* Users List */}
      {filteredUsers.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredUsers.map((user) => (
            <div key={user.id} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">{user.shop_name}</h3>
                    <span className="bg-lime-100 text-lime-800 text-xs px-2 py-1 rounded-full">
                      {user.order_count || 0} Orders
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{user.owner_name}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Phone className="w-4 h-4" />
                      <span>{user.mobile}</span>
                    </div>
                    {user.address && (
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span className="truncate max-w-xs">{user.address}</span>
                      </div>
                    )}
                  </div>
                  {user.pincode && (
                    <p className="text-sm text-gray-500 mt-1">Pincode: {user.pincode}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-xl shadow-md text-center">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No users found</p>
        </div>
      )}
    </div>
  );
};

export default UserTracking;