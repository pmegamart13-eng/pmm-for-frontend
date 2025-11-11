import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Languages, MapPin, Home as HomeIcon, Package, Grid3x3, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { VoiceSearch } from '@/components/VoiceSearch';
import { ProductCard } from '@/components/ProductCard';
import { CartPopup } from '@/components/CartPopup';
import { ProductDetailModal } from '@/components/ProductDetailModal';
import { BannerCarousel } from '@/components/BannerCarousel';
import { StickyCartBar } from '@/components/StickyCartBar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import api from '@/utils/api';
import { addToCart, getCart, getCartTotal } from '@/utils/cart';
import { toast } from 'sonner';

export const CustomerHome = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showCart, setShowCart] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [settings, setSettings] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductDetail, setShowProductDetail] = useState(false);

  useEffect(() => {
    loadData();
    updateCartCount();
  }, []);

  const loadData = async () => {
    try {
      const [categoriesRes, productsRes, settingsRes] = await Promise.all([
        api.get('/categories'),
        api.get('/products'),
        api.get('/settings')
      ]);
      
      // Filter visible categories
      const visibleCategories = categoriesRes.data.filter(cat => cat.is_visible !== false);
      setCategories(visibleCategories);
      setProducts(productsRes.data);
      setFilteredProducts(productsRes.data);
      setSettings(settingsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    }
  };

  const updateCartCount = () => {
    const cart = getCart();
    setCartCount(cart.reduce((sum, item) => sum + item.quantity, 0));
    setCartTotal(getCartTotal(cart));
  };

  const handleAddToCart = (product, quantity = 1) => {
    addToCart(product, quantity);
    updateCartCount();
    toast.success(`${product.name} added to cart!`, {
      duration: 2000,
      position: 'bottom-center'
    });
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setShowProductDetail(true);
  };

  const handleSearch = (query) => {
    if (!query.trim()) {
      setFilteredProducts(products);
      return;
    }
    const filtered = products.filter(p => 
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.name_gu.includes(query) ||
      (p.description && p.description.toLowerCase().includes(query.toLowerCase()))
    );
    setFilteredProducts(filtered);
  };

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
    if (categoryId) {
      const filtered = products.filter(p => p.category_id === categoryId);
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  };

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'gu' : 'en');
  };

  const renderHome = () => (
    <>
      {/* Banner Carousel */}
      <BannerCarousel banners={settings?.banners} />

      {/* Search Bar */}
      <div className="mb-6">
        <VoiceSearch onSearch={handleSearch} />
      </div>

      {/* Location */}
      <div className="flex items-center gap-2 mb-6 text-sm text-gray-600">
        <MapPin className="w-4 h-4 text-lime-600" />
        <span className="font-medium">Delivery in 10 minutes</span>
        <span className="text-gray-400">•</span>
        <span>Gujarat, India</span>
      </div>

      {/* Categories */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4 text-gray-900">{t('categories')}</h2>
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {categories.map((category) => (
            <motion.div
              key={category.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                handleCategoryClick(category.id);
                setActiveTab('categories');
              }}
              className="cursor-pointer"
              data-testid={`category-${category.id}`}
            >
              <div className="bg-gradient-to-br from-lime-50 to-amber-50 rounded-2xl p-3 border border-gray-200 hover:border-lime-400 hover:shadow-md transition-all">
                <div className="grid grid-cols-2 gap-1 mb-2">
                  {category.image_urls.slice(0, 4).map((url, idx) => (
                    <div key={idx} className="aspect-square rounded-lg overflow-hidden bg-white">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                <p className="text-center font-semibold text-xs text-gray-800 leading-tight">
                  {i18n.language === 'gu' ? category.name_gu : category.name}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Featured Products */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">All Products</h2>
          <span className="text-sm text-gray-500">{filteredProducts.length} products</span>
        </div>
        <motion.div 
          layout
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3"
        >
          {filteredProducts.map((product) => (
            <motion.div
              key={product.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <ProductCard 
                product={product} 
                onProductClick={handleProductClick}
                onAddToCart={handleAddToCart}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </>
  );

  const renderCategories = () => (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{t('categories')}</h2>
        {selectedCategory && (
          <Button variant="outline" onClick={() => handleCategoryClick(null)} data-testid="clear-category-filter">
            Show All
          </Button>
        )}
      </div>
      
      {!selectedCategory ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((category) => (
            <motion.div
              key={category.id}
              whileHover={{ scale: 1.03 }}
              onClick={() => handleCategoryClick(category.id)}
              className="cursor-pointer bg-white rounded-2xl p-4 border-2 border-gray-200 hover:border-lime-400 hover:shadow-lg transition-all"
              data-testid={`category-card-${category.id}`}
            >
              <div className="grid grid-cols-2 gap-2 mb-3">
                {category.image_urls.slice(0, 4).map((url, idx) => (
                  <div key={idx} className="aspect-square rounded-lg overflow-hidden">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <h3 className="text-center font-bold text-sm text-gray-900">
                {i18n.language === 'gu' ? category.name_gu : category.name}
              </h3>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {filteredProducts.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onProductClick={handleProductClick}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      )}
    </div>
  );

  const renderOrders = () => (
    <div className="text-center py-12">
      <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
      <h2 className="text-2xl font-bold text-gray-800 mb-2">No Orders Yet</h2>
      <p className="text-gray-600 mb-6">Start shopping to see your orders here</p>
      <Button onClick={() => setActiveTab('home')} className="bg-lime-600 hover:bg-lime-700" data-testid="start-shopping-button">
        Start Shopping
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              {settings?.logo_url && (
                <img src={settings.logo_url} alt="Logo" className="h-10 w-10 object-contain" />
              )}
              <div>
                <h1 className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Okra, sans-serif' }}>
                  {t('brandName')}
                </h1>
                <p className="text-xs text-lime-600 font-medium">{t('tagline')}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleLanguage} 
                className="rounded-full"
                data-testid="language-toggle"
              >
                <Languages className="w-5 h-5" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full"
                data-testid="account-button"
              >
                <User className="w-5 h-5" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative rounded-full" 
                onClick={() => setShowCart(true)} 
                data-testid="cart-button"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <Badge 
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-lime-600 hover:bg-lime-600" 
                    data-testid="cart-count"
                  >
                    {cartCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'home' && renderHome()}
        {activeTab === 'categories' && renderCategories()}
        {activeTab === 'orders' && renderOrders()}
      </div>

      {/* Sticky Cart Bar */}
      <StickyCartBar
        itemCount={cartCount}
        totalAmount={cartTotal}
        onViewCart={() => setShowCart(true)}
      />

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 flex justify-around items-center z-50 shadow-lg">
        <Button
          variant={activeTab === 'home' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1 h-auto py-2 ${activeTab === 'home' ? 'bg-lime-600 hover:bg-lime-700' : ''}`}
          data-testid="nav-home"
        >
          <HomeIcon className="w-5 h-5" />
          <span className="text-xs">{t('home')}</span>
        </Button>
        
        <Button
          variant={activeTab === 'orders' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('orders')}
          className={`flex flex-col items-center gap-1 h-auto py-2 ${activeTab === 'orders' ? 'bg-lime-600 hover:bg-lime-700' : ''}`}
          data-testid="nav-orders"
        >
          <Package className="w-5 h-5" />
          <span className="text-xs">{t('orders')}</span>
        </Button>
        
        <Button
          variant={activeTab === 'categories' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('categories')}
          className={`flex flex-col items-center gap-1 h-auto py-2 ${activeTab === 'categories' ? 'bg-lime-600 hover:bg-lime-700' : ''}`}
          data-testid="nav-categories"
        >
          <Grid3x3 className="w-5 h-5" />
          <span className="text-xs">{t('categories')}</span>
        </Button>
      </div>

      {/* Cart Popup */}
      <CartPopup
        isOpen={showCart}
        onClose={() => {
          setShowCart(false);
          updateCartCount();
        }}
        onCheckout={() => navigate('/checkout')}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={showProductDetail}
        onClose={() => {
          setShowProductDetail(false);
          setSelectedProduct(null);
        }}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
};
