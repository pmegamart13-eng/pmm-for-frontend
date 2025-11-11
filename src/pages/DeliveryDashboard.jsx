import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, MapPin, Phone, LogOut, CheckCircle, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import api from '@/utils/api';
import { toast } from 'sonner';

export const DeliveryDashboard = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [user, setUser] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [otp, setOtp] = useState('');
  const [showOtpDialog, setShowOtpDialog] = useState(false);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    if (userData.role !== 'delivery') {
      navigate('/delivery/login');
      return;
    }
    setUser(userData);
    loadOrders();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadOrders = async () => {
    try {
      const res = await api.get('/orders');
      // Filter orders assigned to this delivery partner
      const myOrders = res.data.filter(order => 
        order.delivery_partner_id === user?.id && 
        ['packed', 'out_for_delivery'].includes(order.status)
      );
      setOrders(myOrders);
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
      toast.success(`Status updated to ${status}!`);
      loadOrders();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDeliverWithOTP = (order) => {
    setSelectedOrder(order);
    setOtp('');
    setShowOtpDialog(true);
  };

  const verifyOTPAndDeliver = async () => {
    if (!otp || otp.length !== 4) {
      toast.error('Please enter 4-digit OTP');
      return;
    }

    try {
      await api.post(`/orders/${selectedOrder.id}/verify-delivery-otp`, { otp });
      toast.success('Order delivered successfully! ✅');
      setShowOtpDialog(false);
      setSelectedOrder(null);
      setOtp('');
      loadOrders();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Invalid OTP');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    navigate('/delivery/login');
    toast.success('Logged out successfully');
  };

  const openMaps = (location) => {
    if (location && location.lat && location.lng) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`, '_blank');
    } else {
      toast.error('Location not available for this order');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'packed': return 'bg-yellow-500';
      case 'out_for_delivery': return 'bg-blue-500';
      case 'delivered': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'packed': return 'Ready for Pickup';
      case 'out_for_delivery': return 'Out for Delivery';
      case 'delivered': return 'Delivered';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-blue-900">Delivery Dashboard</h1>
            {user && <p className="text-sm text-gray-600">Welcome, {user.full_name}</p>}
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-blue-700 border-blue-700">
              {orders.length} Active Orders
            </Badge>
            <Button variant="ghost" onClick={handleLogout} data-testid="delivery-logout-button">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">My Assigned Deliveries</h2>
        
        {orders.length === 0 ? (
          <Card className="p-8 text-center">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 text-lg">No deliveries assigned yet</p>
            <p className="text-sm text-gray-500 mt-2">New orders will appear here when assigned by admin</p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {orders.map(order => (
              <Card key={order.id} className="p-6 hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">Order #{order.id.substring(0, 8)}</h3>
                      <Badge className={`${getStatusColor(order.status)} text-white`}>
                        {getStatusLabel(order.status)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">Amount: ₹{order.total_amount}</p>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Customer Details</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Shop:</strong> {order.customer_info?.shop_name || 'N/A'}</p>
                    <p><strong>Owner:</strong> {order.customer_info?.owner_name || 'N/A'}</p>
                    <p className="flex items-center gap-2">
                      <Phone className="w-3 h-3" />
                      {order.customer_info?.mobile || 'N/A'}
                    </p>
                    <p><strong>Address:</strong> {order.customer_info?.address || 'N/A'}</p>
                    {order.customer_info?.pincode && <p><strong>Pincode:</strong> {order.customer_info.pincode}</p>}
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Order Items ({order.items?.length || 0})</h4>
                  <div className="space-y-1 text-sm">
                    {order.items?.slice(0, 3).map((item, idx) => (
                      <p key={idx} className="text-gray-700">
                        • {item.product_name} - {item.quantity} {item.unit}
                      </p>
                    ))}
                    {order.items?.length > 3 && (
                      <p className="text-blue-600">+{order.items.length - 3} more items</p>
                    )}
                  </div>
                </div>

                {/* Delivery OTP */}
                {order.delivery_otp && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-yellow-700" />
                      <p className="text-sm font-semibold text-yellow-800">
                        Delivery OTP: <span className="text-lg font-mono">{order.delivery_otp}</span>
                      </p>
                    </div>
                    <p className="text-xs text-yellow-700 mt-1">Collect this OTP from customer to complete delivery</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => openMaps(order.customer_info?.location)}
                    variant="outline"
                    className="flex-1"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Navigate
                  </Button>

                  {order.status === 'packed' && (
                    <Button
                      onClick={() => handleUpdateStatus(order.id, 'out_for_delivery')}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      Start Delivery
                    </Button>
                  )}

                  {order.status === 'out_for_delivery' && (
                    <Button
                      onClick={() => handleDeliverWithOTP(order)}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Complete Delivery
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* OTP Verification Dialog */}
      <Dialog open={showOtpDialog} onOpenChange={setShowOtpDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Delivery OTP</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <p className="text-sm text-gray-600">
              Ask the customer for the 4-digit delivery OTP to complete this delivery
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Delivery OTP</label>
              <Input
                type="text"
                placeholder="Enter 4-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                maxLength={4}
                className="text-center text-2xl font-mono tracking-widest"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowOtpDialog(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={verifyOTPAndDeliver} className="flex-1 bg-green-600 hover:bg-green-700">
                Verify & Deliver
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
