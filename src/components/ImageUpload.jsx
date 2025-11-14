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
            className="w-full rounded-lg object-cover border border-slate-200"
            style={{ height: "clamp(150px, 12rem, 250px)" }}
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

      {/* Upload Area - Click to select file */}
      {!preview && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            rounded-lg border-2 border-dashed transition-all text-center p-8
            ${isDragging 
              ? 'border-blue-500 bg-blue-50 scale-105' 
              : 'border-slate-300 bg-slate-50 hover:border-blue-500 hover:bg-blue-50 hover:shadow-md'
            }
            ${(disabled || loading) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
          onClick={() => !disabled && !loading && fileInputRef.current?.click()}
          title="Click để chọn ảnh"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            disabled={disabled || loading}
            className="hidden"
            style={{ display: 'none' }}
            id="image-upload-input"
          />
          
          {loading ? (
            <div className="flex flex-col items-center">
              <svg className="animate-spin h-10 w-10 text-blue-500 mb-3" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-sm font-semibold text-slate-900">Đang tải lên...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="mb-3 p-3 bg-blue-100 rounded-full">
                <Upload className="h-8 w-8 text-blue-600" />
              </div>
              <p className="text-base font-semibold text-slate-900 mb-2">
                Click vào đây để chọn ảnh
              </p>
              <p className="text-sm text-slate-600 mb-1">
                hoặc kéo thả ảnh vào đây
              </p>
              <p className="text-xs text-slate-500">
                JPG, PNG, GIF, WebP - Tối đa 5MB
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;

