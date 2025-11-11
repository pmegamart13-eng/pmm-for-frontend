import React, { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import { uploadImage } from '../../utils/api';
import { toast } from 'sonner';

const EnhancedProductForm = ({ product, categories, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    name_gu: '',
    category_id: '',
    mrp: 0,
    price: 0,
    discount: 0,
    unit: 'Kg',
    image_url: '',
    description: '',
    description_gu: '',
    stock: 0,
    small_package_size: 0,
    small_package_unit: '',
    small_packages_per_bulk: 0,
    bulk_package_size: 0,
    bulk_package_unit: '',
    ...product
  });

  const [uploading, setUploading] = useState(false);
  const customUnits = ['Kg', 'Gram', 'Piece', 'Box', 'Liter', 'Dozen'];

  useEffect(() => {
    // Auto-calculate discount
    if (formData.mrp > 0 && formData.price > 0 && formData.price < formData.mrp) {
      const discount = ((formData.mrp - formData.price) / formData.mrp) * 100;
      setFormData(prev => ({ ...prev, discount: Math.round(discount) })); // Round to nearest whole number
    } else {
      setFormData(prev => ({ ...prev, discount: 0 }));
    }
  }, [formData.mrp, formData.price]);

  useEffect(() => {
    // Auto-calculate bulk package size and unit
    if (formData.small_package_size > 0 && formData.small_packages_per_bulk > 0 && formData.small_package_unit) {
      const totalSize = formData.small_package_size * formData.small_packages_per_bulk;
      setFormData(prev => ({
        ...prev,
        bulk_package_size: totalSize,
        bulk_package_unit: formData.small_package_unit // Use same unit as small package
      }));
    }
  }, [formData.small_package_size, formData.small_packages_per_bulk, formData.small_package_unit]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const result = await uploadImage(file);
      setFormData(prev => ({ ...prev, image_url: result.url }));
      toast.success('Image uploaded');
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.category_id || !formData.price || !formData.mrp) {
      toast.error('Please fill all required fields');
      return;
    }
    if (formData.price > formData.mrp) {
      toast.error('Sell price cannot be greater than MRP');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-4xl w-full p-6 my-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">{product ? 'Edit Product' : 'Add New Product'}</h2>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700"><X className="w-6 h-6" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-2">Product Name (English) *</label><input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-2">Product Name (Gujarati) *</label><input type="text" value={formData.name_gu} onChange={(e) => setFormData({...formData, name_gu: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-2">Category *</label><select value={formData.category_id} onChange={(e) => setFormData({...formData, category_id: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required><option value="">Select Category</option>{categories.map(cat => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}</select></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-2">Unit *</label><select value={formData.unit} onChange={(e) => setFormData({...formData, unit: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg">{customUnits.map(unit => (<option key={unit} value={unit}>{unit}</option>))}</select></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-2">MRP *</label><input type="number" step="0.01" value={formData.mrp} onChange={(e) => setFormData({...formData, mrp: parseFloat(e.target.value)})} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-2">Sell Price *</label><input type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-2">Discount (Auto)</label><div className="px-4 py-2 bg-lime-50 border border-lime-200 rounded-lg text-lime-700 font-semibold">{Math.round(formData.discount)}% OFF</div></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-2">Stock</label><input type="number" value={formData.stock} onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value)})} className="w-full px-4 py-2 border border-gray-300 rounded-lg" /></div>
          </div>
          <div className="border-t pt-4"><h3 className="font-semibold text-gray-700 mb-3">Bulk Packaging (Optional)</h3><div className="grid grid-cols-4 gap-4"><div><label className="block text-sm text-gray-600 mb-1">Small Pack Size</label><input type="number" step="0.01" value={formData.small_package_size} onChange={(e) => setFormData({...formData, small_package_size: parseFloat(e.target.value)})} className="w-full px-3 py-2 border rounded-lg" placeholder="500" /></div><div><label className="block text-sm text-gray-600 mb-1">Small Pack Unit</label><input type="text" value={formData.small_package_unit} onChange={(e) => setFormData({...formData, small_package_unit: e.target.value})} className="w-full px-3 py-2 border rounded-lg" placeholder="gm" /></div><div><label className="block text-sm text-gray-600 mb-1">Packs per Bulk</label><input type="number" value={formData.small_packages_per_bulk} onChange={(e) => setFormData({...formData, small_packages_per_bulk: parseInt(e.target.value)})} className="w-full px-3 py-2 border rounded-lg" placeholder="40" /></div><div><label className="block text-sm text-gray-600 mb-1">Total Bulk</label><div className="px-3 py-2 bg-gray-100 rounded-lg font-medium">{formData.bulk_package_size || 0} {formData.bulk_package_unit || formData.unit}</div></div></div></div>
          <div className="border-t pt-4"><h3 className="font-semibold text-gray-700 mb-3">Product Image</h3><div className="space-y-4"><label className="block"><div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-lime-500 cursor-pointer"><div className="flex flex-col items-center space-y-2">{uploading ? (<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lime-600"></div>) : (<><Upload className="w-8 h-8 text-gray-400" /><span className="text-sm font-medium text-gray-700">Upload from Device</span></>)}</div></div><input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" /></label>{formData.image_url && (<img src={formData.image_url} alt="Preview" className="w-32 h-32 object-cover rounded-lg border-2" />)}</div></div>
          <div className="flex space-x-3 pt-4 border-t"><button type="button" onClick={onCancel} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button><button type="submit" className="flex-1 px-4 py-2 bg-lime-600 hover:bg-lime-700 text-white rounded-lg font-medium">{product ? 'Update' : 'Add'} Product</button></div>
        </form>
      </div>
    </div>
  );
};

export default EnhancedProductForm;