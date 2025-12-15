import React, { useState } from 'react';
import { Upload, Button, List, message } from 'antd';
import { Card, CardHeader, CardTitle } from '@/common/components/card/card';
import {
  UploadOutlined,
  DeleteOutlined,
  FileOutlined
} from '@ant-design/icons';

const { Dragger } = Upload;

export default function FileUploadSection({
  setDirty,
  uploadedFiles,
  setUploadedFiles
}) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = (file) => {
    const isValidType = [
      'image/png',
      'image/jpg',
      'image/jpeg',
      'application/pdf',
      'application/msword',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ].includes(file.type);

    if (!isValidType) {
      message.error(
        'You can only upload JPG, PNG, PDF, DOC, DOCX, XLS, XLSX files!'
      );
      return false;
    }

    // const isLt10M = file.size / 1024 / 1024 < 10;
    // if (!isLt10M) {
    //   message.error('File must be smaller than 10MB!');
    //   return false;
    // }

    // Create file object with preview
    const fileObj = {
      file: file,
      status: 'done',
      name: file.name,
      size: file.size,
      type: file.type,
      uid: file.uid || `${Date.now()}-${Math.random()}`
    };

    setDirty(true);
    setUploadedFiles((prev) => [...prev, fileObj]);
    message.success(`${file.name} uploaded successfully`);

    return false; // Prevent default upload behavior
  };

  const handleRemove = (fileUid) => {
    setDirty(true);
    setUploadedFiles((prev) => prev.filter((file) => file.uid !== fileUid));
    message.success('File removed successfully');
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) {
      return <FileOutlined style={{ color: '#52c41a' }} />;
    } else if (fileType === 'application/pdf') {
      return <FileOutlined style={{ color: '#ff4d4f' }} />;
    } else if (fileType.includes('word')) {
      return <FileOutlined style={{ color: '#1890ff' }} />;
    } else if (fileType.includes('sheet') || fileType.includes('excel')) {
      return <FileOutlined style={{ color: '#52c41a' }} />;
    }
    return <FileOutlined />;
  };

  return (
    <Card className="!p-0 !gap-0 border border-secondary-50 mt-4">
      <CardHeader className="!gap-0 !px-4 !py-3 bg-gray-50 rounded-tl-xl rounded-tr-xl border-b border-secondary-50">
        <CardTitle className="text-[15px] font-medium text-black">
          File Attachments
        </CardTitle>
      </CardHeader>

      <div className="p-4">
        <Dragger
          multiple
          className="mb-4"
          showUploadList={false}
          beforeUpload={handleUpload}
          style={{
            borderRadius: '8px',
            background: '#fafafa',
            border: '1px dashed #d9d9d9'
          }}
        >
          <p className="ant-upload-drag-icon">
            <UploadOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
          </p>
          <p
            className="ant-upload-text"
            style={{ fontSize: '14px', margin: '8px 0' }}
          >
            Click or drag files to upload
          </p>
          <p
            className="ant-upload-hint"
            style={{ fontSize: '12px', color: '#999' }}
          >
            Support: JPG, PNG, PDF, DOC, DOCX, XLS, XLSX
          </p>
        </Dragger>

        {uploadedFiles.length > 0 && (
          <div className="payment-attachments mt-3">
            <h4 className="text-sm font-medium mb-2 text-gray-700">
              Uploaded Files ({uploadedFiles.length})
            </h4>
            <List
              size="small"
              dataSource={uploadedFiles}
              renderItem={(file) => (
                <List.Item
                  className="!p-2 rounded-lg mb-4 last:mb-0"
                  actions={[
                    <Button
                      danger
                      type="text"
                      size="small"
                      className="!p-1"
                      icon={<DeleteOutlined />}
                      onClick={() => handleRemove(file.uid)}
                    />
                  ]}
                >
                  <List.Item.Meta
                    avatar={getFileIcon(file.type)}
                    title={
                      <span className="text-sm font-medium text-gray-800">
                        {file.name}
                      </span>
                    }
                    description={
                      <span className="text-xs text-gray-500">
                        {formatFileSize(file.size)}
                      </span>
                    }
                  />
                </List.Item>
              )}
            />
          </div>
        )}
      </div>
    </Card>
  );
}
