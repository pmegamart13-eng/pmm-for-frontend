import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { MapPin, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/utils/api';
import { getCart, clearCart, getCartTotal } from '@/utils/cart';
import { toast } from 'sonner';
import { Loader } from '@googlemaps/js-api-loader';

export const Checkout = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [customer, setCustomer] = useState({
    shop_name: '',
    owner_name: '',
    mobile: '',
    address: '',
    pincode: '',
    location: { lat: 0, lng: 0 },
    delivery_option: 'next_day' // Only next-day delivery
  });

  useEffect(() => {
    const cartData = getCart();
    if (cartData.length === 0) {
      navigate('/');
      return;
    }
    setCart(cartData);
    
    // Check if customer exists
    const savedMobile = localStorage.getItem('customer_mobile');
    if (savedMobile) {
      loadCustomer(savedMobile);
    }
    
    // Initialize location detection immediately
    initLocationDetection();
  }, []);

  const initLocationDetection = () => {
    console.log('Initializing location detection...');
    
    if (!navigator.geolocation) {
      console.log('Geolocation is not supported by this browser.');
      toast.error('Location access not supported by your browser');
      setCustomer(prev => ({
        ...prev,
        location: { lat: 23.0225, lng: 72.5714 }
      }));
      return;
    }

    // Request location immediately on page load
    getCurrentLocation();
  };

  const loadCustomer = async (mobile) => {
    try {
      const res = await api.get(`/customers/${mobile}`);
      if (res.data) {
        setCustomer(res.data);
      }
    } catch (error) {
      console.error('Error loading customer:', error);
    }
  };
  
  const getCurrentLocation = () => {
    console.log('Requesting current location...');
    toast.info('Detecting your location...');
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('✅ Location detected:', {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
        
        setCustomer(prev => ({
          ...prev,
          location: {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
        }));
        
        toast.success(`Location detected: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
        
        // Auto-close success message after 1 second
        setTimeout(() => {
          toast.dismiss();
        }, 1000);
      },
      (error) => {
        console.error('❌ Location error:', error);
        let errorMessage = 'Unable to detect location. ';
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Please enable location access in your browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage += 'Location request timed out.';
            break;
          default:
            errorMessage += 'Unknown error occurred.';
        }
        
        toast.warning(errorMessage);
        
        // Set default location (Gujarat)
        setCustomer(prev => ({
          ...prev,
          location: { lat: 23.0225, lng: 72.5714 }
        }));
        
        toast.info('Using default location: Gujarat, India');
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!customer.shop_name || !customer.owner_name || !customer.mobile || !customer.address) {
      toast.error('Please fill all required fields');
      return;
    }
    
    // Validate mobile number
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(customer.mobile)) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }
    
    // Validate pincode
    if (customer.pincode && !/^\d{6}$/.test(customer.pincode)) {
      toast.error('Please enter a valid 6-digit pincode');
      return;
    }
    
    // Check if cart is empty
    if (!cart || cart.length === 0) {
      toast.error('Your cart is empty');
      navigate('/');
      return;
    }
    
    setLoading(true);
    
    try {
      // Step 1: Create/update customer
      let customerId;
      try {
        const customerRes = await api.get(`/customers/${customer.mobile}`);
        
        if (!customerRes.data) {
          console.log('Creating new customer...');
          const newCustomer = await api.post('/customers', customer);
          customerId = newCustomer.data.id;
          localStorage.setItem('customer_mobile', customer.mobile);
          console.log('✅ Customer created:', customerId);
        } else {
          customerId = customerRes.data.id;
          console.log('✅ Customer found:', customerId);
        }
      } catch (customerError) {
        console.error('Customer creation/fetch error:', customerError);
        throw new Error('Failed to save customer information. Please try again.');
      }
      
      // Step 2: Prepare order items
      const orderItems = cart.map(item => ({
        product_id: item.product.id,
        product_name: item.product.name,
        quantity: item.quantity,
        unit: item.product.unit,
        price: item.product.price,
        discount: item.product.discount || 0
      }));
      
      // Validate order items
      if (orderItems.some(item => !item.product_id || !item.product_name || item.quantity <= 0)) {
        throw new Error('Invalid items in cart. Please refresh and try again.');
      }
      
      const orderTotal = getCartTotal(cart);
      if (orderTotal <= 0) {
        throw new Error('Invalid order total. Please check your cart.');
      }
      
      // Step 3: Create order with retry logic
      const order = {
        customer_id: customerId,
        customer_info: customer,
        items: orderItems,
        total_amount: orderTotal,
        status: 'pending'
      };
      
      console.log('Creating order:', order);
      
      let orderRes;
      let retryCount = 0;
      const maxRetries = 2;
      
      while (retryCount <= maxRetries) {
        try {
          orderRes = await api.post('/orders', order);
          console.log('✅ Order created successfully:', orderRes.data);
          break; // Success, exit retry loop
        } catch (orderError) {
          retryCount++;
          console.error(`Order creation attempt ${retryCount} failed:`, orderError);
          
          if (retryCount > maxRetries) {
            // Extract error message from backend response
            const errorMsg = orderError.response?.data?.detail || 
                           orderError.response?.data?.message || 
                           'Failed to place order. Please try again.';
            throw new Error(errorMsg);
          }
          
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          toast.info(`Retrying order placement... (${retryCount}/${maxRetries})`);
        }
      }
      
      // Step 4: Clear cart and navigate to success page
      clearCart();
      setCart([]);
      
      toast.success('Order placed successfully!');
      
      // Get order ID from response
      const orderId = orderRes.data.order?.id || orderRes.data.id;
      navigate(`/order-success?orderId=${orderId}`);
      
    } catch (error) {
      console.error('Error placing order:', error);
      
      // Display user-friendly error message
      const errorMessage = error.message || 
                          error.response?.data?.detail || 
                          error.response?.data?.message || 
                          'Failed to place order. Please check your connection and try again.';
      
      toast.error(errorMessage, {
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white p-4">
      <div className="max-w-2xl mx-auto">
        <Button variant="ghost" onClick={() => navigate('/')} className="mb-4" data-testid="back-button">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-pink-100">
          <h1 className="text-3xl font-bold mb-6 text-gray-800">{t('checkout')}</h1>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-700 mb-3">{t('shopDetails')}</h2>
            
            <div>
              <Label htmlFor="shop_name">{t('shopName')} *</Label>
              <Input
                id="shop_name"
                value={customer.shop_name}
                onChange={(e) => setCustomer({...customer, shop_name: e.target.value})}
                required
                data-testid="shop-name-input"
              />
            </div>
            
            <div>
              <Label htmlFor="owner_name">{t('ownerName')} *</Label>
              <Input
                id="owner_name"
                value={customer.owner_name}
                onChange={(e) => setCustomer({...customer, owner_name: e.target.value})}
                required
                data-testid="owner-name-input"
              />
            </div>
            
            <div>
              <Label htmlFor="mobile">{t('mobile')} *</Label>
              <Input
                id="mobile"
                type="tel"
                value={customer.mobile}
                onChange={(e) => setCustomer({...customer, mobile: e.target.value})}
                required
                data-testid="mobile-input"
              />
            </div>
            
            <div>
              <Label htmlFor="address">{t('address')} *</Label>
              <Input
                id="address"
                value={customer.address}
                onChange={(e) => setCustomer({...customer, address: e.target.value})}
                required
                data-testid="address-input"
              />
            </div>
            
            <div>
              <Label htmlFor="pincode">{t('pincode')}</Label>
              <Input
                id="pincode"
                value={customer.pincode}
                onChange={(e) => setCustomer({...customer, pincode: e.target.value})}
                data-testid="pincode-input"
              />
            </div>
            
            {/* Current Location Button */}
            <div>
              <Label>{t('currentLocation') || 'Current Location'}</Label>
              <Button
                type="button"
                onClick={getCurrentLocation}
                variant="outline"
                className="w-full mt-2 flex items-center justify-center gap-2"
              >
                <MapPin className="w-4 h-4" />
                {customer.location.lat !== 0 ? 'Update Location' : 'Get Current Location'}
              </Button>
              {customer.location.lat !== 0 && (
                <p className="text-xs text-green-600 mt-1">
                  ✓ Location: {customer.location.lat.toFixed(4)}, {customer.location.lng.toFixed(4)}
                </p>
              )}
            </div>
            
            {/* Delivery Option - Next Day Only */}
            <div>
              <Label>{t('deliveryOption')}</Label>
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg mt-2">
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="delivery_option"
                    value="next_day"
                    checked={true}
                    readOnly
                    className="w-4 h-4 text-green-600"
                  />
                  <span className="font-medium text-green-700">{t('nextDayDelivery')}</span>
                </div>
                <p className="text-xs text-gray-600 mt-1 ml-6">Your order will be delivered tomorrow</p>
              </div>
            </div>
            
            {/* Live Location Button */}
            <div>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      (position) => {
                        setCustomer(prev => ({
                          ...prev,
                          location: {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                          }
                        }));
                        toast.success('Location captured successfully!');
                      },
                      (error) => {
                        toast.error('Unable to get location. Please enable location services.');
                      }
                    );
                  } else {
                    toast.error('Geolocation is not supported by this browser.');
                  }
                }}
                data-testid="capture-location-button"
              >
                <MapPin className="w-4 h-4 mr-2" />
                {customer.location.lat !== 0 ? 'Location Captured ✓' : 'Capture Current Location'}
              </Button>
              {customer.location.lat !== 0 && (
                <p className="text-xs text-green-600 mt-1">
                  Lat: {customer.location.lat.toFixed(6)}, Lng: {customer.location.lng.toFixed(6)}
                </p>
              )}
            </div>
            
            <div className="border-t pt-4 mt-4">
              <h3 className="font-semibold mb-3">Order Summary</h3>
              {cart.map(item => {
                const finalPrice = item.product.price - (item.product.price * item.product.discount / 100);
                return (
                  <div key={item.product.id} className="flex justify-between text-sm mb-2">
                    <span>{item.product.name} x {item.quantity}</span>
                    <span>₹{(finalPrice * item.quantity).toFixed(2)}</span>
                  </div>
                );
              })}
              <div className="border-t mt-3 pt-3 flex justify-between font-bold text-lg">
                <span>{t('total')}</span>
                <span className="text-pink-600" data-testid="order-total">₹{getCartTotal(cart).toFixed(2)}</span>
              </div>
            </div>
            
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-pink-500 hover:bg-pink-600 text-lg py-6"
              data-testid="place-order-button"
            >
              {loading ? 'Processing...' : t('placeOrder')}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};