import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Plus, Star, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const ProductCard = ({ product, onProductClick, onAddToCart, cartQuantity = 0, onUpdateQuantity }) => {
  const { i18n } = useTranslation();
  const name = i18n.language === 'gu' ? product.name_gu : product.name;
  const description = i18n.language === 'gu' ? product.description_gu : product.description;
  const finalPrice = product.price - (product.price * product.discount / 100);

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: "0 8px 24px rgba(132,204,22,0.15)" }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-lime-400 cursor-pointer relative"
      data-testid={`product-card-${product.id}`}
      onClick={() => onProductClick(product)}
    >
      {/* Discount Ribbon - 50% width yellow tag */}
      {product.discount > 0 && (
        <div className="absolute top-0 left-0 z-10 w-1/2">
          <div className="bg-gradient-to-r from-amber-400 to-amber-500 text-gray-900 font-bold text-xs px-3 py-1.5 shadow-md transform -skew-x-12">
            <span className="inline-block transform skew-x-12">{product.discount}% OFF</span>
          </div>
        </div>
      )}

      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <img
          src={product.image_url || 'https://placehold.co/300x300/84CC16/FFFFFF?text=Product'}
          alt={name}
          className="w-full h-full object-cover"
          loading="lazy"
          referrerPolicy="no-referrer"
          crossOrigin="anonymous"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://placehold.co/300x300/84CC16/FFFFFF?text=Product';
          }}
        />
      </div>
      
      {/* Product Info */}
      <div className="p-3">
        {/* Product Name */}
        <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-1" data-testid={`product-name-${product.id}`}>
          {name}
        </h3>

        {/* Unit/Weight */}
        <p className="text-xs text-gray-500 mb-1">{product.bulk_package_size || 1} {product.unit}</p>
        
        {/* Bulk Product Display (e.g., 500gm × 40pcs = 20kg) */}
        {product.small_package_size && product.small_packages_per_bulk && (
          <p className="text-xs text-lime-700 font-medium bg-lime-50 px-2 py-1 rounded mb-2">
            {product.small_package_size}{product.small_package_unit} × {product.small_packages_per_bulk}pcs = {product.bulk_package_size}{product.bulk_package_unit}
          </p>
        )}
        
        {/* Description */}
        {description && (
          <p className="text-xs text-gray-600 line-clamp-2 mb-2 leading-relaxed">{description}</p>
        )}
        
        {/* Price and Add Button / Quantity Controls */}
        <div className="flex items-center justify-between mt-2">
          <div>
            {product.mrp && product.mrp > product.price ? (
              <>
                {/* Selling Price */}
                <div className="flex items-baseline gap-1">
                  <span className="text-base font-bold text-gray-900" data-testid={`product-price-${product.id}`}>₹{product.price.toFixed(0)}</span>
                </div>
                {/* MRP (strikethrough) */}
                <div className="text-xs text-gray-400 line-through">MRP ₹{product.mrp.toFixed(0)}</div>
              </>
            ) : (
              <span className="text-base font-bold text-gray-900" data-testid={`product-price-${product.id}`}>₹{product.price}</span>
            )}
          </div>
          
          {cartQuantity === 0 ? (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(product, 1);
              }}
              size="sm"
              className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white border-0 rounded-lg px-3 h-9 font-bold shadow-md"
              data-testid={`add-to-cart-${product.id}`}
            >
              <Plus className="w-4 h-4 mr-1" />
              {i18n.t('add')}
            </Button>
          ) : (
            <div 
              className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-500 rounded-lg px-2 py-1 shadow-md"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateQuantity(product.id, cartQuantity - 1);
                }}
                className="w-6 h-6 flex items-center justify-center text-white hover:bg-white/20 rounded transition-colors"
                data-testid={`decrease-qty-${product.id}`}
              >
                <Minus className="w-4 h-4" />
              </button>
              
              <span className="text-white font-bold min-w-[24px] text-center" data-testid={`cart-qty-${product.id}`}>
                {cartQuantity}
              </span>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateQuantity(product.id, cartQuantity + 1);
                }}
                className="w-6 h-6 flex items-center justify-center text-white hover:bg-white/20 rounded transition-colors"
                data-testid={`increase-qty-${product.id}`}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1 mt-2 pt-2 border-t border-gray-100">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          <span className="text-xs font-semibold text-gray-700">{product.rating}</span>
        </div>
      </div>
    </motion.div>
  );
};