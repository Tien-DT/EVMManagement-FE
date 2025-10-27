// src/components/FileUpload.jsx
import React, { useState } from 'react';
import { Upload, Button, message, Spin } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import supabaseClient from '../api/supabaseClient';

const FileUpload = ({ onUploadComplete, acceptedFileTypes = "image/*,.pdf,.doc,.docx", maxFileSize = 10 }) => {
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);

  const handleUpload = async (options) => {
    const { file, onSuccess, onError } = options;
    setLoading(true);

    try {
      // Tạo tên file duy nhất để tránh trùng lặp
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `contracts/${fileName}`;

      // Upload file lên Supabase Storage
      const { data, error } = await supabaseClient.storage
        .from('contracts')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        message.error(`Upload failed: ${error.message}`);
        onError(error);
        return;
      }

      // Lấy URL public của file
      const { data: urlData } = supabaseClient.storage
        .from('contracts')
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      message.success('Upload thành công!');
      onSuccess(publicUrl);
      
      // Gọi callback để truyền URL về component cha
      if (onUploadComplete) {
        onUploadComplete(publicUrl);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      message.error('Có lỗi xảy ra khi upload file');
      onError(error);
    } finally {
      setLoading(false);
    }
  };

  const beforeUpload = (file) => {
    const isValidSize = file.size / 1024 / 1024 < maxFileSize;
    if (!isValidSize) {
      message.error(`File phải nhỏ hơn ${maxFileSize}MB!`);
    }
    return isValidSize;
  };

  const uploadProps = {
    name: 'file',
    multiple: false,
    fileList: fileList,
    customRequest: handleUpload,
    beforeUpload: beforeUpload,
    onChange(info) {
      let newFileList = [...info.fileList];
      
      // Chỉ giữ file mới nhất
      newFileList = newFileList.slice(-1);
      
      // Cập nhật trạng thái
      setFileList(newFileList);
    },
    onRemove: () => {
      setFileList([]);
      if (onUploadComplete) {
        onUploadComplete('');
      }
    }
  };

  return (
    <div className="file-upload-container">
      <Spin spinning={loading} tip="Đang upload...">
        <Upload {...uploadProps} accept={acceptedFileTypes}>
          <Button icon={<UploadOutlined />} size="large">
            {loading ? "Đang upload..." : "Chọn file để upload"}
          </Button>
        </Upload>
        {fileList.length > 0 && fileList[0].status === 'done' && (
          <div style={{ marginTop: 8, color: "#52c41a" }}>
            ✅ File đã được upload thành công
          </div>
        )}
        {fileList.length > 0 && fileList[0].status === 'uploading' && (
          <div style={{ marginTop: 8, color: "#1890ff" }}>
            ⏳ Đang upload...
          </div>
        )}
      </Spin>
    </div>
  );
};

export default FileUpload;