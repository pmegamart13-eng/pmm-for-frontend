import React from 'react';
import { ShoppingCart, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

export const StickyCartBar = ({ itemCount, totalAmount, onViewCart }) => {
  const { t } = useTranslation();

  if (itemCount === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-20 left-0 right-0 z-40 px-4"
        data-testid="sticky-cart-bar"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-gradient-to-r from-lime-500 to-lime-600 text-white rounded-2xl shadow-2xl p-4 cursor-pointer"
            onClick={onViewCart}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 rounded-full p-2">
                  <ShoppingCart className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium opacity-90">{itemCount} items in cart</p>
                  <p className="text-lg font-bold">₹{totalAmount.toFixed(0)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">View Cart</span>
                <ChevronRight className="w-5 h-5" />
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};