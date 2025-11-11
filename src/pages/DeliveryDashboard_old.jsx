import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, MapPin, Phone, LogOut, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import api from '@/utils/api';
import { toast } from 'sonner';

export const DeliveryDashboard = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    if (userData.role !== 'delivery') {
      navigate('/delivery/login');
      return;
    }
    setUser(userData);
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const res = await api.get('/orders?status=out_for_delivery');
      setOrders(res.data);
    } catch (error) {
      console.error('Error loading orders:', error);
      if (error.response?.status === 401) {
        navigate('/delivery/login');
      }
    }
  };

  const handleUpdateStatus = async (orderId, status) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      toast.success('Status updated!');
      loadOrders();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    navigate('/delivery/login');
    toast.success('Logged out successfully');
  };

  const openMaps = (location) => {
    if (location.lat && location.lng) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Delivery Dashboard</h1>
            {user && <p className="text-sm text-gray-600">Welcome, {user.full_name}</p>}
          </div>
          <Button variant="ghost" onClick={handleLogout} data-testid="delivery-logout-button">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <h2 className="text-xl font-semibold mb-4">Assigned Deliveries</h2>
        
        {orders.length === 0 ? (
          <Card className="p-12 text-center">
            <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg">No deliveries assigned</p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {orders.map(order => (
              <Card key={order.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-lg">Order #{order.id.slice(0, 8).toUpperCase()}</h3>
                    <Badge className="mt-2">{order.status}</Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openMaps(order.customer_info.location)}
                    data-testid={`open-maps-${order.id}`}
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Open in Maps
                  </Button>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Package className="w-4 h-4 text-gray-400" />
                    <span className="font-semibold">{order.customer_info.shop_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{order.customer_info.mobile}</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                    <span>{order.customer_info.address}, {order.customer_info.pincode}</span>
                  </div>
                </div>
                
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-semibold mb-2">Items:</p>
                  {order.items.map((item, idx) => (
                    <p key={idx} className="text-sm text-gray-600">
                      {item.product_name} x {item.quantity} {item.unit}
                    </p>
                  ))}
                  <p className="text-sm font-bold text-pink-600 mt-2">
                    Total: ₹{order.total_amount.toFixed(2)}
                  </p>
                </div>
                
                <Button
                  onClick={() => handleUpdateStatus(order.id, 'delivered')}
                  className="w-full bg-green-500 hover:bg-green-600"
                  data-testid={`mark-delivered-${order.id}`}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark as Delivered
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};