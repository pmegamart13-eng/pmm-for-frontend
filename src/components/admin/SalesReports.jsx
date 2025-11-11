import React, { useState, useEffect } from 'react';
import { Download, Printer, Calendar } from 'lucide-react';
import api from '../../utils/api';
import { toast } from 'sonner';

const SalesReports = () => {
  const [reportType, setReportType] = useState('daily');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchReport();
  }, [reportType, selectedDate]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      let url = `/sales/${reportType}`;
      if (reportType === 'daily' && selectedDate) {
        url += `?date=${selectedDate}`;
      }
      const response = await api.get(url);
      setReportData(response.data);
    } catch (error) {
      console.error('Failed to fetch report:', error);
      toast.error('Failed to load sales report');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const csvContent = generateCSV();
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales_report_${reportType}_${new Date().toISOString()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const generateCSV = () => {
    if (!reportData || !reportData.orders) return '';
    
    let csv = 'Order ID,Date,Customer,Items,Total Amount\n';
    reportData.orders.forEach(order => {
      const date = new Date(order.created_at).toLocaleDateString();
      const customer = order.customer_info?.shop_name || 'N/A';
      const items = order.items?.length || 0;
      csv += `${order.id.substring(0, 8)},${date},${customer},${items},${order.total_amount}\n`;
    });
    return csv;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lime-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Report Type Selection */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          {['daily', 'weekly', 'monthly'].map((type) => (
            <button
              key={type}
              onClick={() => setReportType(type)}
              className={`px-4 py-2 rounded-lg font-medium capitalize ${
                reportType === type
                  ? 'bg-lime-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
        <div className="flex items-center space-x-2">
          {reportType === 'daily' && (
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            />
          )}
          <button
            onClick={handleDownload}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            <Download className="w-4 h-4" />
            <span>Download CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Report Summary */}
      {reportData && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <p className="text-sm text-gray-600">Total Orders</p>
            <p className="text-3xl font-bold text-gray-800">{reportData.total_orders || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <p className="text-sm text-gray-600">Total Sales</p>
            <p className="text-3xl font-bold text-lime-600">₹{reportData.total_sales?.toFixed(2) || '0.00'}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <p className="text-sm text-gray-600">Period</p>
            <p className="text-lg font-semibold text-gray-800">
              {reportType === 'daily' ? selectedDate : reportData.period || reportData.month}
            </p>
          </div>
        </div>
      )}

      {/* Orders Table */}
      {reportData && reportData.orders && reportData.orders.length > 0 ? (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reportData.orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-mono">{order.id.substring(0, 8)}</td>
                    <td className="px-6 py-4 text-sm">
                      {new Date(order.created_at).toLocaleDateString('en-GB')}
                    </td>
                    <td className="px-6 py-4 text-sm">{order.customer_info?.shop_name || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm">{order.items?.length || 0}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-lime-600">
                      ₹{order.total_amount?.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white p-12 rounded-xl shadow-md text-center">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No orders found for this period</p>
        </div>
      )}
    </div>
  );
};

export default SalesReports;