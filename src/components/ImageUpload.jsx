import React, { useState, useRef } from 'react';
import supabaseClient from '../api/supabaseClient';

const ImageUpload = ({ value, onChange, disabled = false }) => {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(value || null);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
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
        alert(`Upload failed: ${error.message}`);
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
      alert('An error occurred while uploading');
    } finally {
      setLoading(false);
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
        <div className="relative inline-block">
          <img
            src={preview}
            alt="Preview"
            className="w-full max-w-sm h-48 object-cover rounded-lg border border-gray-300"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/400x300?text=Image+Error';
            }}
          />
          <button
            type="button"
            onClick={handleRemove}
            disabled={disabled || loading}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Upload Button */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={disabled || loading}
          className="hidden"
          id="image-upload-input"
        />
        <label
          htmlFor="image-upload-input"
          className={`
            inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg 
            font-medium text-gray-700 bg-white hover:bg-gray-50 
            transition-colors cursor-pointer
            ${(disabled || loading) ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Uploading...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {preview ? 'Change Image' : 'Upload Image'}
            </>
          )}
        </label>
      </div>

      {/* URL Input (Optional manual entry) */}
      {!preview && (
        <div>
          <input
            type="url"
            value={value || ''}
            onChange={(e) => {
              const url = e.target.value;
              setPreview(url);
              if (onChange) {
                onChange(url);
              }
            }}
            disabled={disabled || loading}
            placeholder="Or paste image URL here..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-600"
          />
        </div>
      )}

      <p className="text-xs text-gray-500">
        Supported: JPG, PNG, GIF, WebP (Max 5MB)
      </p>
    </div>
  );
};

export default ImageUpload;

