import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Lock, ArrowRight, Loader } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'sonner';

const MobileLogin = () => {
  const navigate = useNavigate();
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    
    if (mobile.length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/send-otp', { mobile });
      setOtpSent(true);
      toast.success(`OTP sent to ${mobile}`);
      // For demo, show the OTP
      if (response.data.otp) {
        toast.info(`Demo OTP: ${response.data.otp}`);
      }
    } catch (error) {
      toast.error('Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      toast.error('Please enter 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/verify-otp', { mobile, otp });
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('customer_mobile', mobile);
      if (response.data.customer) {
        localStorage.setItem('customer_data', JSON.stringify(response.data.customer));
      }
      toast.success('Login successful!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="bg-lime-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Phone className="w-10 h-10 text-lime-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Pavanputra Mega Mart</h1>
          <p className="text-gray-600 mt-2">Login with Mobile OTP</p>
        </div>

        {!otpSent ? (
          /* Mobile Number Form */
          <form onSubmit={handleSendOTP} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="Enter 10-digit mobile number"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent text-lg"
                  maxLength="10"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                We'll send you a 6-digit OTP for verification
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || mobile.length !== 10}
              className="w-full flex items-center justify-center space-x-2 bg-lime-600 hover:bg-lime-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Sending OTP...</span>
                </>
              ) : (
                <>
                  <span>Send OTP</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* OTP Verification Form */
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter OTP
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit OTP"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent text-lg tracking-widest text-center font-bold"
                  maxLength="6"
                  required
                  autoFocus
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                OTP sent to +91 {mobile}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full flex items-center justify-center space-x-2 bg-lime-600 hover:bg-lime-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <span>Verify & Login</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setOtpSent(false);
                setOtp('');
              }}
              className="w-full text-gray-600 hover:text-gray-800 py-2 text-sm"
            >
              Change mobile number
            </button>

            <button
              type="button"
              onClick={handleSendOTP}
              disabled={loading}
              className="w-full text-lime-600 hover:text-lime-700 py-2 text-sm font-medium"
            >
              Resend OTP
            </button>
          </form>
        )}

        <div className="mt-6 text-center text-xs text-gray-500">
          By continuing, you agree to our Terms & Privacy Policy
        </div>
      </div>
    </div>
  );
};

export default MobileLogin;
