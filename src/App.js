import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';

import { CustomerHome } from './pages/CustomerHome';
import { Checkout } from './pages/Checkout';
import { Invoice } from './pages/Invoice';
import OrderSuccess from './pages/OrderSuccess';
import Orders from './pages/Orders';

import MobileLogin from './pages/MobileLogin'; // now bypasses OTP
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { DeliveryLogin } from './pages/DeliveryLogin';
import { DeliveryDashboard } from './pages/DeliveryDashboard';

import './i18n';
import '@/App.css';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="bottom-center" richColors />

      <Routes>

        {/* 🟢 HOME PAGE DEFAULT */}
        <Route path="/" element={<CustomerHome />} />

        {/* 🟢 Checkout, Orders etc */}
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/invoice/:orderId" element={<Invoice />} />

        {/* 🔵 Login page exists but NOT AUTO-OPENED */}
        <Route path="/login" element={<MobileLogin />} />

        {/* 🔴 Admin */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        {/* 🔴 Delivery */}
        <Route path="/delivery/login" element={<DeliveryLogin />} />
        <Route path="/delivery/dashboard" element={<DeliveryDashboard />} />

        {/* 🔥 All unknown routes → Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

    </BrowserRouter>
  );
}

export default App;
