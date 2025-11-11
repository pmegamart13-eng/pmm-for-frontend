import React, { useState, useEffect } from 'react';
import { Upload, X, Image as ImageIcon, Plus } from 'lucide-react';
import api, { uploadImage } from '../../utils/api';
import { toast } from 'sonner';

const BannerManagement = () => {
  const [banners, setBanners] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const MAX_BANNERS = 10;

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const response = await api.get('/settings');
      setBanners(response.data.banners || []);
    } catch (error) {
      console.error('Failed to fetch banners:', error);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (banners.length >= MAX_BANNERS) {
      toast.error(`Maximum ${MAX_BANNERS} banners allowed`);
      return;
    }

    setUploading(true);
    try {
      const result = await uploadImage(file);
      const newBanners = [...banners, result.url];
      await updateBanners(newBanners);
      toast.success('Banner uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload banner');
    } finally {
      setUploading(false);
    }
  };

  const handleUrlAdd = async () => {
    if (!urlInput.trim()) return;

    if (banners.length >= MAX_BANNERS) {
      toast.error(`Maximum ${MAX_BANNERS} banners allowed`);
      return;
    }

    const newBanners = [...banners, urlInput.trim()];
    await updateBanners(newBanners);
    setUrlInput('');
    toast.success('Banner added successfully');
  };

  const handleRemove = async (index) => {
    const newBanners = banners.filter((_, i) => i !== index);
    await updateBanners(newBanners);
    toast.success('Banner removed');
  };

  const updateBanners = async (newBanners) => {
    try {
      const response = await api.get('/settings');
      const settings = response.data;
      settings.banners = newBanners;
      await api.put('/settings', settings);
      setBanners(newBanners);
    } catch (error) {
      console.error('Failed to update banners:', error);
      toast.error('Failed to update banners');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Homepage Banners</h2>
        <p className="text-sm text-gray-600 mb-4">
          Manage up to {MAX_BANNERS} homepage banners. Current: {banners.length}/{MAX_BANNERS}
        </p>

        {/* Upload Section */}
        <div className="space-y-4">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload from Device</label>
            <label className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-lime-500 cursor-pointer transition-colors">
              <div className="flex flex-col items-center space-y-2">
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lime-600"></div>
                    <span className="text-sm text-gray-600">Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">Click to upload image</span>
                    <span className="text-xs text-gray-500">PNG, JPG up to 5MB</span>
                  </>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploading || banners.length >= MAX_BANNERS}
              />
            </label>
          </div>

          {/* URL Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Or Add Image URL</label>
            <div className="flex space-x-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/banner.jpg"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                disabled={banners.length >= MAX_BANNERS}
              />
              <button
                onClick={handleUrlAdd}
                disabled={!urlInput.trim() || banners.length >= MAX_BANNERS}
                className="px-4 py-2 bg-lime-600 hover:bg-lime-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Banners Grid */}
      {banners.length > 0 ? (
        <div className="grid grid-cols-2 gap-4">
          {banners.map((url, index) => (
            <div key={index} className="relative group bg-white p-4 rounded-xl shadow-md">
              <img
                src={url}
                alt={`Banner ${index + 1}`}
                className="w-full h-48 object-cover rounded-lg"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/800x400?text=Invalid+Image';
                }}
              />
              <button
                onClick={() => handleRemove(index)}
                className="absolute top-6 right-6 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
              <p className="text-xs text-gray-500 mt-2 truncate">{url}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-xl shadow-md text-center">
          <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No banners added yet</p>
          <p className="text-sm text-gray-500">Upload images or add URLs to display on homepage</p>
        </div>
      )}
    </div>
  );
};

export default BannerManagement;