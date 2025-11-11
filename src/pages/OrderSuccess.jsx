import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle, Download, Home, Package } from 'lucide-react';
import api, { getOrder } from '../utils/api';

const OrderSuccess = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const data = await getOrder(orderId);
      setOrder(data);
    } catch (error) {
      console.error('Failed to fetch order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async (lang = 'en') => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/invoice/${orderId}?lang=${lang}`
      );
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice_${orderId.substring(0, 8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to download invoice:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Success Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="bg-green-100 rounded-full p-4">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {t('order_placed_successfully') || 'Order Placed Successfully!'}
          </h1>
          <p className="text-gray-600 mb-8">
            {t('order_confirmation_message') || 'Thank you for your order. We will process it shortly.'}
          </p>

          {/* Order Details */}
          {order && (
            <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  {t('order_details') || 'Order Details'}
                </h2>
                <span className="text-sm bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-medium">
                  {t(order.status) || order.status}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('order_id') || 'Order ID'}:</span>
                  <span className="font-medium text-gray-800">{order.id.substring(0, 8)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('order_date') || 'Date'}:</span>
                  <span className="font-medium text-gray-800">
                    {new Date(order.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('items') || 'Items'}:</span>
                  <span className="font-medium text-gray-800">{order.items?.length || 0}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-gray-200">
                  <span className="text-lg font-semibold text-gray-800">
                    {t('total_amount') || 'Total Amount'}:
                  </span>
                  <span className="text-lg font-bold text-green-600">₹{order.total_amount?.toFixed(2)}</span>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-start space-x-3">
                  <Package className="w-5 h-5 text-green-600 mt-1" />
                  <div>
                    <p className="font-medium text-gray-800 mb-1">
                      {t('delivery_address') || 'Delivery Address'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.customer_info?.shop_name}<br />
                      {order.customer_info?.address}, {order.customer_info?.pincode}<br />
                      {order.customer_info?.mobile}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Download Invoice Buttons */}
          <div className="space-y-3 mb-8">
            <button
              onClick={() => handleDownloadInvoice('en')}
              className="w-full flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              <Download className="w-5 h-5" />
              <span>{t('download_invoice_english') || 'Download Invoice (English)'}</span>
            </button>
            <button
              onClick={() => handleDownloadInvoice('gu')}
              className="w-full flex items-center justify-center space-x-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              <Download className="w-5 h-5" />
              <span>{t('download_invoice_gujarati') || 'Download Invoice (Gujarati)'}</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={() => navigate('/')}
              className="flex-1 flex items-center justify-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              <Home className="w-5 h-5" />
              <span>{t('back_to_home') || 'Back to Home'}</span>
            </button>
            <button
              onClick={() => navigate('/orders')}
              className="flex-1 flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              <Package className="w-5 h-5" />
              <span>{t('view_orders') || 'View Orders'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
