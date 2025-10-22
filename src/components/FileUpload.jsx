// src/components/FileUpload.jsx
import React, { useState } from 'react';
import { Upload, Button, message, Spin } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import supabaseClient from '../api/supabaseClient';

const FileUpload = ({ onUploadComplete }) => {
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

  const uploadProps = {
    name: 'file',
    multiple: false,
    fileList: fileList,
    customRequest: handleUpload,
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
      <Spin spinning={loading}>
        <Upload {...uploadProps} accept="image/*,.pdf">
          <Button icon={<UploadOutlined />}>Chọn file</Button>
        </Upload>
        {fileList.length > 0 && fileList[0].status === 'done' && (
          <div className="mt-2 text-green-600">
            File đã được upload thành công
          </div>
        )}
      </Spin>
    </div>
  );
};

export default FileUpload;