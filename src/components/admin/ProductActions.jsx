import React, { useState } from 'react';
import { Trash2, Pause, PackageX, Play, AlertCircle } from 'lucide-react';
import api from '../../utils/api';
import { toast } from 'sonner';

const ProductActions = ({ product, onUpdate }) => {
  const [showConfirm, setShowConfirm] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAction = async (action) => {
    setLoading(true);
    try {
      let endpoint = '';
      let message = '';

      switch (action) {
        case 'delete':
          endpoint = `/products/${product.id}`;
          message = 'Product deleted successfully';
          await api.delete(endpoint);
          break;
        case 'hold':
          endpoint = `/products/${product.id}/hold`;
          message = 'Product put on hold';
          await api.put(endpoint);
          break;
        case 'out-of-stock':
          endpoint = `/products/${product.id}/out-of-stock`;
          message = 'Product marked as out of stock';
          await api.put(endpoint);
          break;
        case 'activate':
          endpoint = `/products/${product.id}/activate`;
          message = 'Product activated';
          await api.put(endpoint);
          break;
        default:
          break;
      }

      toast.success(message);
      setShowConfirm(null);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Action error:', error);
      toast.error('Action failed');
    } finally {
      setLoading(false);
    }
  };

  const ConfirmDialog = ({ action, title, message, onConfirm, onCancel }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-yellow-100 p-2 rounded-full">
            <AlertCircle className="w-6 h-6 text-yellow-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
        </div>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="flex space-x-2">
        {product.is_active && !product.is_on_hold && !product.is_out_of_stock ? (
          <>
            <button
              onClick={() => setShowConfirm('hold')}
              className="flex items-center space-x-1 px-3 py-1.5 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-lg text-sm font-medium transition-colors"
              title="Put on Hold"
            >
              <Pause className="w-4 h-4" />
              <span>Hold</span>
            </button>
            <button
              onClick={() => setShowConfirm('out-of-stock')}
              className="flex items-center space-x-1 px-3 py-1.5 bg-orange-100 hover:bg-orange-200 text-orange-800 rounded-lg text-sm font-medium transition-colors"
              title="Mark Out of Stock"
            >
              <PackageX className="w-4 h-4" />
              <span>Out of Stock</span>
            </button>
            <button
              onClick={() => setShowConfirm('delete')}
              className="flex items-center space-x-1 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg text-sm font-medium transition-colors"
              title="Delete Product"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </>
        ) : (
          <button
            onClick={() => handleAction('activate')}
            className="flex items-center space-x-1 px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-800 rounded-lg text-sm font-medium transition-colors"
            title="Activate Product"
          >
            <Play className="w-4 h-4" />
            <span>Activate</span>
          </button>
        )}
      </div>

      {showConfirm === 'delete' && (
        <ConfirmDialog
          action="delete"
          title="Delete Product"
          message="Are you sure you want to permanently delete this product? This action cannot be undone."
          onConfirm={() => handleAction('delete')}
          onCancel={() => setShowConfirm(null)}
        />
      )}

      {showConfirm === 'hold' && (
        <ConfirmDialog
          action="hold"
          title="Put Product on Hold"
          message="This will temporarily hide the product from customers. You can activate it again later."
          onConfirm={() => handleAction('hold')}
          onCancel={() => setShowConfirm(null)}
        />
      )}

      {showConfirm === 'out-of-stock' && (
        <ConfirmDialog
          action="out-of-stock"
          title="Mark Out of Stock"
          message="This will mark the product as out of stock and set inventory to 0."
          onConfirm={() => handleAction('out-of-stock')}
          onCancel={() => setShowConfirm(null)}
        />
      )}
    </>
  );
};

export default ProductActions;
