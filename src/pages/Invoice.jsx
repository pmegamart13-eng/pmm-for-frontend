import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import QRCode from 'react-qr-code';
import { Button } from '@/components/ui/button';
import { Printer, Download, Home } from 'lucide-react';
import api from '@/utils/api';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from 'sonner';

export const Invoice = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [order, setOrder] = useState(null);
  const [settings, setSettings] = useState(null);
  const invoiceRef = useRef();

  useEffect(() => {
    loadOrder();
    loadSettings();
  }, [orderId]);

  const loadOrder = async () => {
    try {
      const res = await api.get(`/orders/${orderId}`);
      setOrder(res.data);
    } catch (error) {
      console.error('Error loading order:', error);
      toast.error('Failed to load invoice');
    }
  };

  const loadSettings = async () => {
    try {
      const res = await api.get('/settings');
      setSettings(res.data);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    if (!invoiceRef.current) return;
    
    try {
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`invoice-${orderId}.pdf`);
      toast.success('Invoice downloaded!');
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast.error('Failed to download invoice');
    }
  };

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p>Loading invoice...</p>
        </div>
      </div>
    );
  }

  const InvoiceContent = ({ copy }) => (
    <div className="bg-white p-8 rounded-lg border-2 border-gray-300 mb-8">
      <div className="text-right text-xs text-gray-500 mb-2">{copy} Copy</div>
      
      <div className="flex items-start justify-between mb-6 border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold text-pink-600 mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
            {t('brandName')}
          </h1>
          <p className="text-sm text-gray-600">{settings?.tagline || t('tagline')}</p>
        </div>
        {settings?.logo_url && (
          <img src={settings.logo_url} alt="Logo" className="h-16 w-16 object-contain" />
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <h3 className="font-semibold text-gray-700 mb-2">Bill To:</h3>
          <p className="text-sm"><strong>{order.customer_info.shop_name}</strong></p>
          <p className="text-sm">{order.customer_info.owner_name}</p>
          <p className="text-sm">{order.customer_info.mobile}</p>
          <p className="text-sm">{order.customer_info.address}</p>
          {order.customer_info.pincode && <p className="text-sm">PIN: {order.customer_info.pincode}</p>}
        </div>
        
        <div className="text-right">
          <p className="text-sm mb-1"><strong>Invoice #:</strong> {order.id.slice(0, 8).toUpperCase()}</p>
          <p className="text-sm mb-1"><strong>Date:</strong> {new Date(order.created_at).toLocaleDateString()}</p>
          <p className="text-sm"><strong>Status:</strong> <span className="text-pink-600 uppercase">{order.status}</span></p>
        </div>
      </div>
      
      <table className="w-full mb-6">
        <thead>
          <tr className="border-b-2 border-gray-300">
            <th className="text-left py-2">Item</th>
            <th className="text-center py-2">Qty</th>
            <th className="text-right py-2">Price</th>
            <th className="text-right py-2">Discount</th>
            <th className="text-right py-2">Total</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, idx) => {
            const itemTotal = item.price * item.quantity;
            const discountAmount = (itemTotal * item.discount) / 100;
            const finalTotal = itemTotal - discountAmount;
            
            return (
              <tr key={idx} className="border-b">
                <td className="py-2">{item.product_name}</td>
                <td className="text-center">{item.quantity} {item.unit}</td>
                <td className="text-right">₹{item.price.toFixed(2)}</td>
                <td className="text-right">{item.discount}%</td>
                <td className="text-right font-semibold">₹{finalTotal.toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      
      <div className="flex justify-between items-start">
        <div>
          <QRCode
            value={`ORDER:${order.id}`}
            size={100}
            level="H"
          />
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold text-pink-600 mb-2">
            {t('total')}: ₹{order.total_amount.toFixed(2)}
          </div>
          <p className="text-xs text-gray-500">Thank you for your business!</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex gap-2 mb-6 print:hidden">
          <Button onClick={() => navigate('/')} variant="outline" data-testid="home-button">
            <Home className="w-4 h-4 mr-2" />
            {t('home')}
          </Button>
          <Button onClick={handlePrint} variant="outline" data-testid="print-button">
            <Printer className="w-4 h-4 mr-2" />
            {t('print')}
          </Button>
          <Button onClick={handleDownload} className="bg-pink-500 hover:bg-pink-600" data-testid="download-button">
            <Download className="w-4 h-4 mr-2" />
            {t('download')}
          </Button>
        </div>
        
        <div ref={invoiceRef}>
          <InvoiceContent copy="Customer" />
          <InvoiceContent copy="Admin" />
        </div>
      </div>
    </div>
  );
};