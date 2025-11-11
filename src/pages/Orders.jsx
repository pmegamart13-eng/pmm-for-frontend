import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Package, Clock, CheckCircle, Truck, ArrowLeft, Download } from 'lucide-react';
import api from '../utils/api';

export const Orders = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      // Get customer mobile from localStorage
      const mobile = localStorage.getItem('customer_mobile');
      if (!mobile) {
        navigate('/');
        return;
      }

      // Get all orders
      const response = await api.get('/orders');
      // Filter orders for this customer
      const customerOrders = response.data.filter(
        order => order.customer_info?.mobile === mobile
      );
      
      // Sort by date (newest first)
      customerOrders.sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );
      
      setOrders(customerOrders);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'packed':
        return <Package className="w-5 h-5 text-blue-600" />;
      case 'out_for_delivery':
        return <Truck className="w-5 h-5 text-purple-600" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'packed':
        return 'bg-blue-100 text-blue-800';
      case 'out_for_delivery':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDownloadInvoice = (orderId, lang = 'en') => {
    const url = `${process.env.REACT_APP_BACKEND_URL}/api/invoice/${orderId}?lang=${lang}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lime-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-50 to-yellow-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {t('my_orders') || 'My Orders'}
              </h1>
              <p className="text-sm text-gray-600">{orders.length} orders found</p>
            </div>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {orders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-md">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No orders yet</p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 bg-lime-600 hover:bg-lime-700 text-white px-6 py-2 rounded-lg"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow p-6"
              >
                {/* Order Header */}
                <div className="flex items-start justify-between mb-4 pb-4 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(order.status)}
                    <div>
                      <p className="font-mono font-semibold text-gray-800">
                        #{order.id.substring(0, 8)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                    {t(order.status) || order.status}
                  </span>
                </div>

                {/* Order Items */}
                <div className="space-y-2 mb-4">
                  {order.items?.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-700">
                        {item.product_name} × {item.quantity}
                      </span>
                      <span className="font-medium text-gray-800">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Order Total */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-200 mb-4">
                  <span className="text-lg font-semibold text-gray-800">Total</span>
                  <span className="text-lg font-bold text-lime-600">
                    ₹{order.total_amount?.toFixed(2)}
                  </span>
                </div>

                {/* Delivery Info */}
                {order.delivery_partner_name && (
                  <div className="bg-blue-50 rounded-lg p-3 mb-4">
                    <p className="text-sm text-blue-900">
                      <span className="font-semibold">Delivery Partner:</span> {order.delivery_partner_name}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleDownloadInvoice(order.id, 'en')}
                    className="flex-1 flex items-center justify-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Invoice (EN)</span>
                  </button>
                  <button
                    onClick={() => handleDownloadInvoice(order.id, 'gu')}
                    className="flex-1 flex items-center justify-center space-x-2 bg-lime-600 hover:bg-lime-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Invoice (ગુજરાતી)</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
