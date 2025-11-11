import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Star, ShoppingCart, ChevronLeft, ChevronRight, Package } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

export const ProductDetailModal = ({ product, isOpen, onClose, onAddToCart }) => {
  const { i18n } = useTranslation();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const name = i18n.language === 'gu' ? product.name_gu : product.name;
  const description = i18n.language === 'gu' ? product.description_gu : product.description;
  const finalPrice = product.price - (product.price * product.discount / 100);
  const images = product.images && product.images.length > 0 ? product.images : [product.image_url];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0" data-testid="product-detail-modal">
        <div className="grid md:grid-cols-2 gap-6 p-6">
          {/* Image Gallery */}
          <div className="relative">
            <div className="relative aspect-square bg-gray-50 rounded-2xl overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentImageIndex}
                  src={images[currentImageIndex]}
                  alt={name}
                  className="w-full h-full object-cover"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </AnimatePresence>
              
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg"
                    data-testid="prev-image-button"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg"
                    data-testid="next-image-button"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
              
              {product.discount > 0 && (
                <div className="absolute top-4 left-4">
                  <Badge className="bg-lime-500 text-white font-bold text-lg px-3 py-1">
                    {product.discount}% OFF
                  </Badge>
                </div>
              )}
            </div>
            
            {/* Image Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 mt-4 overflow-x-auto">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      idx === currentImageIndex ? 'border-lime-500' : 'border-gray-200'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-800 mb-2" data-testid="modal-product-name">{name}</h2>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-semibold">{product.rating}</span>
                  </div>
                  <span className="text-sm text-gray-500">• {product.delivery_time}</span>
                </div>
              </div>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700" data-testid="close-modal-button">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Price */}
            <div className="mb-4">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-lime-600" data-testid="modal-product-price">₹{finalPrice.toFixed(0)}</span>
                {product.discount > 0 && (
                  <span className="text-lg text-gray-400 line-through">₹{product.price}</span>
                )}
                <span className="text-gray-600">/ {product.unit}</span>
              </div>
            </div>

            {/* Description */}
            {description && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-2">Description</h3>
                <p className="text-gray-600 leading-relaxed">{description}</p>
              </div>
            )}

            {/* Bulk Packaging Info */}
            {product.small_packages_per_bulk > 0 && (
              <div className="mb-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-start gap-2">
                  <Package className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Bulk Package Details</h3>
                    <p className="text-sm text-gray-700">
                      1 {product.unit} ({product.bulk_package_size} {product.bulk_package_unit}) contains {product.small_packages_per_bulk} packets of {product.small_package_size} {product.small_package_unit} each
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Stock Status - Hidden from customers */}
            {/* Admin can see this in admin panel */}

            {/* Quantity Selector */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity</label>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="h-10 w-10"
                  data-testid="decrease-quantity-button"
                >
                  -
                </Button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 text-center border rounded-lg px-3 py-2 font-semibold"
                  min="1"
                  data-testid="quantity-input"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                  className="h-10 w-10"
                  data-testid="increase-quantity-button"
                >
                  +
                </Button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <Button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-lime-500 to-lime-600 hover:from-lime-600 hover:to-lime-700 text-white rounded-xl shadow-lg"
              data-testid="modal-add-to-cart-button"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Add to Cart - ₹{(finalPrice * quantity).toFixed(0)}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};