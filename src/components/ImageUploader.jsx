import React, { useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { uploadImage } from '../utils/api';
import { toast } from 'sonner';

export const ImageUploader = ({ onUpload, multiple = false, currentImages = [] }) => {
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState(currentImages || []);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    
    try {
      const uploadPromises = files.map(file => uploadImage(file));
      const results = await Promise.all(uploadPromises);
      
      const imageUrls = results.map(r => r.url);
      const newImages = multiple ? [...images, ...imageUrls] : [imageUrls[0]];
      
      setImages(newImages);
      onUpload(newImages);
      toast.success(`${files.length} image(s) uploaded successfully`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    onUpload(newImages);
  };

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      <label className="block">
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-lime-500 transition-colors cursor-pointer">
          <div className="flex flex-col items-center space-y-2">
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-lime-600"></div>
                <span className="text-sm text-gray-600">Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="w-10 h-10 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">
                  Click to upload {multiple ? 'images' : 'image'}
                </span>
                <span className="text-xs text-gray-500">
                  PNG, JPG up to 5MB
                </span>
              </>
            )}
          </div>
        </div>
        <input
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />
      </label>

      {/* Uploaded Images Preview */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {images.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`Upload ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
              />
              <button
                onClick={() => handleRemove(index)}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && !uploading && (
        <div className="text-center py-8 text-gray-400">
          <ImageIcon className="w-12 h-12 mx-auto mb-2" />
          <p className="text-sm">No images uploaded yet</p>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
