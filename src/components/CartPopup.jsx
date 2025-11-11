import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getCart, updateCartItem } from '@/utils/cart';

export const CartPopup = ({ isOpen, onClose, onCheckout }) => {
  const { i18n } = useTranslation();
  const [cart, setCart] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setCart(getCart());
    }
  }, [isOpen]);

  const updateQuantity = (productId, newQty) => {
    const updatedCart = updateCartItem(productId, newQty);
    setCart(updatedCart);
  };

  const getTotal = () => {
    return cart.reduce((total, item) => {
      const price = item.product.price;
      const discount = item.product.discount || 0;
      const finalPrice = price - (price * discount / 100);
      return total + (finalPrice * item.quantity);
    }, 0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto" data-testid="cart-popup">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-pink-500" />
            {i18n.t('cart')}
          </DialogTitle>
        </DialogHeader>
        
        {cart.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Your cart is empty
          </div>
        ) : (
          <div className="space-y-4">
            {cart.map((item) => {
              const name = i18n.language === 'gu' ? item.product.name_gu : item.product.name;
              const finalPrice = item.product.price - (item.product.price * item.product.discount / 100);
              
              return (
                <div key={item.product.id} className="flex gap-4 border-b pb-4" data-testid={`cart-item-${item.product.id}`}>
                  <img src={item.product.image_url} alt={name} className="w-20 h-20 object-cover rounded-lg" />
                  
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm mb-1">{name}</h4>
                    <p className="text-pink-600 font-bold">₹{finalPrice.toFixed(0)}/{item.product.unit}</p>
                    
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-7 w-7"
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        data-testid={`decrease-qty-${item.product.id}`}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.product.id, parseInt(e.target.value) || 0)}
                        className="w-16 h-7 text-center"
                        min="0"
                        data-testid={`qty-input-${item.product.id}`}
                      />
                      
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-7 w-7"
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        data-testid={`increase-qty-${item.product.id}`}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                      
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 ml-auto"
                        onClick={() => updateQuantity(item.product.id, 0)}
                        data-testid={`remove-item-${item.product.id}`}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
            
            <div className="border-t pt-4">
              <div className="flex justify-between items-center text-lg font-bold mb-4">
                <span>{i18n.t('total')}</span>
                <span className="text-pink-600" data-testid="cart-total">₹{getTotal().toFixed(2)}</span>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={onClose} className="flex-1" data-testid="continue-shopping-button">
                  {i18n.t('continueShop')}
                </Button>
                <Button
                  onClick={() => {
                    onClose();
                    onCheckout();
                  }}
                  className="flex-1 bg-pink-500 hover:bg-pink-600"
                  data-testid="checkout-button"
                >
                  {i18n.t('checkout')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};