import React from 'react';
import { Package, TrendingUp } from 'lucide-react';

export const SearchResults = ({ results, onSelect, loading }) => {
  if (loading) {
    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-200 p-4 z-50">
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-lime-600"></div>
          <span className="ml-2 text-gray-600">Searching...</span>
        </div>
      </div>
    );
  }

  if (!results || results.length === 0) {
    return null;
  }

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden z-50 max-h-96 overflow-y-auto">
      <div className="p-2">
        <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Search Results ({results.length})
        </div>
        {results.map((product) => (
          <button
            key={product.id}
            onClick={() => onSelect(product)}
            className="w-full flex items-center space-x-3 p-3 hover:bg-lime-50 rounded-xl transition-colors text-left"
          >
            <img
              src={product.image_url}
              alt={product.name}
              className="w-12 h-12 object-cover rounded-lg"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-800 truncate">{product.name}</p>
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-lime-600 font-semibold">₹{product.price}</span>
                <span className="text-gray-500">/ {product.unit}</span>
                {product.discount > 0 && (
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                    {product.discount}% OFF
                  </span>
                )}
              </div>
            </div>
            <Package className="w-5 h-5 text-gray-400" />
          </button>
        ))}
      </div>
    </div>
  );
};
