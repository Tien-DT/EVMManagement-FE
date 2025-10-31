import React, { useState, useRef } from 'react';
import { Upload } from 'lucide-react';
import supabaseClient from '../api/supabaseClient';

const ImageUpload = ({ value, onChange, disabled = false }) => {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(value || null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = async (file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file ảnh');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Kích thước file phải nhỏ hơn 5MB');
      return;
    }

    setLoading(true);

    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `vehicles/${fileName}`;

      // Upload file to Supabase Storage
      const { data, error } = await supabaseClient.storage
        .from('vehicles')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        alert(`Tải lên thất bại: ${error.message}`);
        return;
      }

      // Get public URL
      const { data: urlData } = supabaseClient.storage
        .from('vehicles')
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      // Update preview and form value
      setPreview(publicUrl);
      if (onChange) {
        onChange(publicUrl);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Đã xảy ra lỗi khi tải lên');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleFileChange(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await handleFileChange(file);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    if (onChange) {
      onChange('');
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      {/* Preview */}
      {preview && (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="h-48 w-full rounded-lg object-cover border border-slate-200"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/400x300?text=Image+Error';
            }}
          />
          <button
            type="button"
            onClick={handleRemove}
            disabled={disabled || loading}
            className="absolute top-2 right-2 rounded-full bg-red-500 p-2 text-white hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ✕
          </button>
        </div>
      )}

      {/* Drag & Drop Area */}
      {!preview && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            rounded-lg border-2 border-dashed transition-colors text-center p-6
            ${isDragging 
              ? 'border-blue-400 bg-blue-50' 
              : 'border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50'
            }
            ${(disabled || loading) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
          onClick={() => !disabled && !loading && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            disabled={disabled || loading}
            className="hidden"
            id="image-upload-input"
          />
          
          {loading ? (
            <div className="flex flex-col items-center">
              <svg className="animate-spin h-8 w-8 text-slate-400 mb-2" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-sm font-medium text-slate-900">Đang tải lên...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Upload className="mx-auto h-8 w-8 text-slate-400 mb-2" />
              <p className="text-sm font-medium text-slate-900 mb-1">Kéo thả ảnh vào đây hoặc</p>
              <label 
                htmlFor="image-upload-input"
                className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium"
                onClick={(e) => e.stopPropagation()}
              >
                duyệt file
              </label>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;

