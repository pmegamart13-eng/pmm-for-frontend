import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Package,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  Users,
  LogOut,
  Box,
  Grid3x3,
  Settings as SettingsIcon,
  FileText,
  Plus,
  BarChart3,
  Image as ImageIcon,
  UserCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import api from '@/utils/api';
import { toast } from 'sonner';

// Import new admin components
import SalesReports from '@/components/admin/SalesReports';
import BannerManagement from '@/components/admin/BannerManagement';
import UserTracking from '@/components/admin/UserTracking';
import ProductActions from '@/components/admin/ProductActions';
import EnhancedProductForm from '@/components/admin/EnhancedProductForm';
import DeliverySettings from '@/components/admin/DeliverySettings';

export const AdminDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [deliveryPartners, setDeliveryPartners] = useState([]);
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [showDeliveryDialog, setShowDeliveryDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const [newProduct, setNewProduct] = useState({
    name: '',
    name_gu: '',
    category_id: '',
    price: 0,
    unit: 'Kg',
    discount: 0,
    image_url: '',
    stock: 0
  });

  const [newCategory, setNewCategory] = useState({
    name: '',
    name_gu: '',
    image_urls: ['', '', '', '']
  });

  const [newDelivery, setNewDelivery] = useState({
    username: '',
    password: '',
    full_name: '',
    mobile: ''
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role !== 'admin') {
      navigate('/admin/login');
      return;
    }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, ordersRes, productsRes, categoriesRes, deliveryRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/orders'),
        api.get('/products'),
        api.get('/categories'),
        api.get('/delivery-partners')
      ]);
      setStats(statsRes.data);
      setOrders(ordersRes.data);
      setProducts(productsRes.data);
      setCategories(categoriesRes.data);
      setDeliveryPartners(deliveryRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
      if (error.response?.status === 401) {
        navigate('/admin/login');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    navigate('/admin/login');
    toast.success('Logged out successfully');
  };

  const handleCreateProduct = async (productData) => {
    try {
      await api.post('/products', productData);
      toast.success('Product created successfully!');
      setShowProductDialog(false);
      loadData();
    } catch (error) {
      console.error('Create product error:', error);
      toast.error('Failed to create product');
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      await api.delete(`/products/${productId}`);
      toast.success('Product deleted permanently!');
      loadData();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const handleCreateCategory = async () => {
    try {
      await api.post('/categories', { ...newCategory, order: categories.length + 1 });
      toast.success('Category created!');
      setShowCategoryDialog(false);
      loadData();
      setNewCategory({ name: '', name_gu: '', image_urls: ['', '', '', ''] });
    } catch (error) {
      toast.error('Failed to create category');
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      await api.delete(`/categories/${categoryId}`);
      toast.success('Category deleted!');
      loadData();
    } catch (error) {
      toast.error('Failed to delete category');
    }
  };

  const handleRegisterDelivery = async () => {
    try {
      await api.post('/auth/register', { ...newDelivery, role: 'delivery' });
      toast.success('Delivery partner registered!');
      setShowDeliveryDialog(false);
      loadData();
      setNewDelivery({ username: '', password: '', full_name: '', mobile: '' });
    } catch (error) {
      toast.error('Failed to register delivery partner');
    }
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      toast.success('Order status updated!');
      loadData();
    } catch (error) {
      toast.error('Failed to update order');
    }
  };

  const handleAssignDelivery = async (orderId, partnerId, partnerName) => {
    try {
      await api.put(`/orders/${orderId}/assign`, {
        delivery_partner_id: partnerId,
        delivery_partner_name: partnerName
      });
      toast.success('Delivery partner assigned!');
      setSelectedOrder(null);
      loadData();
    } catch (error) {
      toast.error('Failed to assign delivery');
    }
  };

  const filteredOrders = filterStatus === 'all' ? orders : orders.filter(o => o.status === filterStatus);

  const renderDashboard = () => (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">Dashboard Overview</h2>
      
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <h3 className="text-3xl font-bold text-gray-800">{stats.total_orders}</h3>
              </div>
              <ShoppingCart className="w-10 h-10 text-pink-500" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Orders</p>
                <h3 className="text-3xl font-bold text-orange-600">{stats.pending_orders}</h3>
              </div>
              <Package className="w-10 h-10 text-orange-500" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Sales</p>
                <h3 className="text-3xl font-bold text-green-600">₹{stats.total_sales.toFixed(0)}</h3>
              </div>
              <TrendingUp className="w-10 h-10 text-green-500" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Low Stock Items</p>
                <h3 className="text-3xl font-bold text-red-600">{stats.low_stock_products}</h3>
              </div>
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
          </Card>
        </div>
      )}
      
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Recent Orders</h3>
        <div className="space-y-3">
          {orders.slice(0, 5).map(order => (
            <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-semibold">{order.customer_info.shop_name}</p>
                <p className="text-sm text-gray-600">₹{order.total_amount.toFixed(2)} - {order.items.length} items</p>
              </div>
              <Badge className={order.status === 'delivered' ? 'bg-green-500' : 'bg-orange-500'}>
                {order.status}
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderOrders = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-800">Orders Management</h2>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="packed">Packed</SelectItem>
            <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid gap-4">
        {filteredOrders.map(order => (
          <Card key={order.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="font-bold text-lg">#{order.id.slice(0, 8).toUpperCase()}</h3>
                  <Badge className={order.status === 'delivered' ? 'bg-green-500' : order.status === 'pending' ? 'bg-orange-500' : 'bg-blue-500'}>
                    {order.status}
                  </Badge>
                </div>
                <p className="text-sm font-semibold text-gray-700">{order.customer_info.shop_name}</p>
                <p className="text-sm text-gray-600">{order.customer_info.address}, {order.customer_info.pincode}</p>
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-sm font-semibold mb-2">Items:</p>
              {order.items.map((item, idx) => (
                <p key={idx} className="text-sm text-gray-600">
                  {item.product_name} x {item.quantity} {item.unit}
                </p>
              ))}
            </div>
            
            <div className="flex items-center justify-between border-t pt-4">
              <div>
                <p className="font-bold text-pink-600">₹{order.total_amount.toFixed(2)}</p>
                <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
              </div>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(`${process.env.REACT_APP_BACKEND_URL}/api/invoice/${order.id}?lang=en`, '_blank')}
                  className="text-xs"
                >
                  📄 Invoice (EN)
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(`${process.env.REACT_APP_BACKEND_URL}/api/invoice/${order.id}?lang=gu`, '_blank')}
                  className="text-xs"
                >
                  📄 Invoice (GU)
                </Button>
                
                {order.status === 'pending' && (
                  <Button
                    size="sm"
                    onClick={() => handleUpdateOrderStatus(order.id, 'packed')}
                    data-testid={`mark-packed-${order.id}`}
                  >
                    Mark as Packed
                  </Button>
                )}
                
                {order.status === 'packed' && (
                  <Button
                    size="sm"
                    onClick={() => setSelectedOrder(order)}
                    data-testid={`assign-delivery-${order.id}`}
                  >
                    Assign Delivery
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
      
      {selectedOrder && (
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Delivery Partner</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              {deliveryPartners.map(partner => (
                <Button
                  key={partner.id}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleAssignDelivery(selectedOrder.id, partner.id, partner.full_name)}
                  data-testid={`select-partner-${partner.id}`}
                >
                  {partner.full_name} - {partner.mobile}
                </Button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );

  const renderProducts = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-800">Products Management</h2>
        <Button onClick={() => setShowProductDialog(true)} data-testid="add-product-button">
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map(product => (
          <Card key={product.id} className="p-4">
            <img 
              src={product.image_url} 
              alt={product.name} 
              className="w-full h-40 object-cover rounded-lg mb-3"
              onError={(e) => e.target.src = 'https://via.placeholder.com/300x200?text=No+Image'}
            />
            <h3 className="font-semibold mb-1">{product.name}</h3>
            {product.mrp && product.mrp > product.price && (
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-lg font-bold text-gray-900">₹{product.price}</span>
                <span className="text-sm text-gray-400 line-through">₹{product.mrp}</span>
                <span className="text-xs bg-lime-100 text-lime-800 px-2 py-0.5 rounded">
                  {product.discount}% OFF
                </span>
              </div>
            )}
            {(!product.mrp || product.mrp === product.price) && (
              <p className="text-lg font-bold text-gray-900 mb-1">₹{product.price}/{product.unit}</p>
            )}
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-gray-500">
                Stock: {product.stock} {product.stock < 10 && <span className="text-red-500 font-semibold">(Low)</span>}
              </p>
              {product.is_on_hold && <Badge className="bg-yellow-500">On Hold</Badge>}
              {product.is_out_of_stock && <Badge className="bg-orange-500">Out of Stock</Badge>}
            </div>
            <ProductActions product={product} onUpdate={loadData} />
          </Card>
        ))}
      </div>
      
      {showProductDialog && (
        <EnhancedProductForm
          product={null}
          categories={categories}
          onSave={handleCreateProduct}
          onCancel={() => setShowProductDialog(false)}
        />
      )}
    </div>
  );

  const renderCategories = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-800">Categories Management</h2>
        <Button onClick={() => setShowCategoryDialog(true)} data-testid="add-category-button">
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {categories.map(category => (
          <Card key={category.id} className="p-4">
            <div className="grid grid-cols-2 gap-1 mb-3">
              {category.image_urls.slice(0, 4).map((url, idx) => (
                <div key={idx} className="aspect-square rounded overflow-hidden">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <h3 className="font-semibold mb-2">{category.name}</h3>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDeleteCategory(category.id)}
              className="w-full"
              data-testid={`delete-category-${category.id}`}
            >
              Delete
            </Button>
          </Card>
        ))}
      </div>
      
      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name (English)</Label>
              <Input value={newCategory.name} onChange={(e) => setNewCategory({...newCategory, name: e.target.value})} />
            </div>
            <div>
              <Label>Name (Gujarati)</Label>
              <Input value={newCategory.name_gu} onChange={(e) => setNewCategory({...newCategory, name_gu: e.target.value})} />
            </div>
            <div>
              <Label>Product Images (4)</Label>
              {newCategory.image_urls.map((url, idx) => (
                <Input
                  key={idx}
                  value={url}
                  onChange={(e) => {
                    const urls = [...newCategory.image_urls];
                    urls[idx] = e.target.value;
                    setNewCategory({...newCategory, image_urls: urls});
                  }}
                  placeholder={`Image ${idx + 1} URL`}
                  className="mt-2"
                />
              ))}
            </div>
            <Button onClick={handleCreateCategory} className="w-full bg-pink-500 hover:bg-pink-600" data-testid="create-category-button">
              Create Category
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );

  const renderDelivery = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-800">Delivery Partners</h2>
        <Button onClick={() => setShowDeliveryDialog(true)} data-testid="add-delivery-button">
          <Plus className="w-4 h-4 mr-2" />
          Add Partner
        </Button>
      </div>
      
      <div className="grid gap-4">
        {deliveryPartners.map(partner => (
          <Card key={partner.id} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">{partner.full_name}</h3>
                <p className="text-sm text-gray-600">{partner.mobile}</p>
              </div>
              <Users className="w-8 h-8 text-pink-500" />
            </div>
          </Card>
        ))}
      </div>
      
      <Dialog open={showDeliveryDialog} onOpenChange={setShowDeliveryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Register Delivery Partner</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Full Name</Label>
              <Input value={newDelivery.full_name} onChange={(e) => setNewDelivery({...newDelivery, full_name: e.target.value})} />
            </div>
            <div>
              <Label>Mobile</Label>
              <Input value={newDelivery.mobile} onChange={(e) => setNewDelivery({...newDelivery, mobile: e.target.value})} />
            </div>
            <div>
              <Label>Username</Label>
              <Input value={newDelivery.username} onChange={(e) => setNewDelivery({...newDelivery, username: e.target.value})} />
            </div>
            <div>
              <Label>Password</Label>
              <Input type="password" value={newDelivery.password} onChange={(e) => setNewDelivery({...newDelivery, password: e.target.value})} />
            </div>
            <Button onClick={handleRegisterDelivery} className="w-full bg-pink-500 hover:bg-pink-600" data-testid="register-delivery-button">
              Register Partner
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-pink-600 mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>
          Admin Panel
        </h1>
        
        <nav className="space-y-2">
          <Button
            variant={activeTab === 'dashboard' ? 'default' : 'ghost'}
            className={`w-full justify-start ${activeTab === 'dashboard' ? 'bg-pink-500' : ''}`}
            onClick={() => setActiveTab('dashboard')}
            data-testid="nav-dashboard"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Dashboard
          </Button>
          
          <Button
            variant={activeTab === 'orders' ? 'default' : 'ghost'}
            className={`w-full justify-start ${activeTab === 'orders' ? 'bg-pink-500' : ''}`}
            onClick={() => setActiveTab('orders')}
            data-testid="nav-orders"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Orders
          </Button>
          
          <Button
            variant={activeTab === 'products' ? 'default' : 'ghost'}
            className={`w-full justify-start ${activeTab === 'products' ? 'bg-pink-500' : ''}`}
            onClick={() => setActiveTab('products')}
            data-testid="nav-products"
          >
            <Box className="w-4 h-4 mr-2" />
            Products
          </Button>
          
          <Button
            variant={activeTab === 'categories' ? 'default' : 'ghost'}
            className={`w-full justify-start ${activeTab === 'categories' ? 'bg-pink-500' : ''}`}
            onClick={() => setActiveTab('categories')}
            data-testid="nav-categories"
          >
            <Grid3x3 className="w-4 h-4 mr-2" />
            Categories
          </Button>
          
          <Button
            variant={activeTab === 'delivery' ? 'default' : 'ghost'}
            className={`w-full justify-start ${activeTab === 'delivery' ? 'bg-pink-500' : ''}`}
            onClick={() => setActiveTab('delivery')}
            data-testid="nav-delivery"
          >
            <Users className="w-4 h-4 mr-2" />
            Delivery
          </Button>
          
          <Button
            variant={activeTab === 'sales' ? 'default' : 'ghost'}
            className={`w-full justify-start ${activeTab === 'sales' ? 'bg-pink-500' : ''}`}
            onClick={() => setActiveTab('sales')}
            data-testid="nav-sales"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Sales Reports
          </Button>
          
          <Button
            variant={activeTab === 'banners' ? 'default' : 'ghost'}
            className={`w-full justify-start ${activeTab === 'banners' ? 'bg-pink-500' : ''}`}
            onClick={() => setActiveTab('banners')}
            data-testid="nav-banners"
          >
            <ImageIcon className="w-4 h-4 mr-2" />
            Banners
          </Button>
          
          <Button
            variant={activeTab === 'users' ? 'default' : 'ghost'}
            className={`w-full justify-start ${activeTab === 'users' ? 'bg-pink-500' : ''}`}
            onClick={() => setActiveTab('users')}
            data-testid="nav-users"
          >
            <UserCheck className="w-4 h-4 mr-2" />
            User Tracking
          </Button>

          <Button
            variant={activeTab === 'settings' ? 'default' : 'ghost'}
            className={`w-full justify-start ${activeTab === 'settings' ? 'bg-pink-500' : ''}`}
            onClick={() => setActiveTab('settings')}
            data-testid="nav-settings"
          >
            <SettingsIcon className="w-4 h-4 mr-2" />
            Delivery Settings
          </Button>
        </nav>
        
        <div className="absolute bottom-6 left-6 right-6">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600"
            onClick={handleLogout}
            data-testid="logout-button"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="ml-64 p-8">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'orders' && renderOrders()}
        {activeTab === 'products' && renderProducts()}
        {activeTab === 'categories' && renderCategories()}
        {activeTab === 'delivery' && renderDelivery()}
        {activeTab === 'sales' && <SalesReports />}
        {activeTab === 'banners' && <BannerManagement />}
        {activeTab === 'users' && <UserTracking />}
        {activeTab === 'settings' && <DeliverySettings />}
      </div>
    </div>
  );
};