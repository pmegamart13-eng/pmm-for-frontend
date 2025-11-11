import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import api from '@/utils/api';
import { toast } from 'sonner';

export const AdminLogin = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await api.post('/auth/login', credentials);
      
      if (res.data.user.role !== 'admin') {
        toast.error('Access denied. Admin only.');
        return;
      }
      
      localStorage.setItem('auth_token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      toast.success('Login successful!');
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-white p-4">
      <Card className="w-full max-w-md p-8 shadow-xl border-pink-200">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            Admin Login
          </h1>
          <p className="text-gray-600">Pavanputra Mega Mart</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="username">{t('username')}</Label>
            <Input
              id="username"
              type="text"
              value={credentials.username}
              onChange={(e) => setCredentials({...credentials, username: e.target.value})}
              required
              data-testid="admin-username-input"
            />
          </div>
          
          <div>
            <Label htmlFor="password">{t('password')}</Label>
            <Input
              id="password"
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({...credentials, password: e.target.value})}
              required
              data-testid="admin-password-input"
            />
          </div>
          
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-pink-500 hover:bg-pink-600"
            data-testid="admin-login-button"
          >
            {loading ? 'Logging in...' : t('login')}
          </Button>
        </form>
        
        <p className="text-center mt-6 text-sm text-gray-600">
          Default: admin / admin123
        </p>
      </Card>
    </div>
  );
};