import React, { useState, useEffect } from 'react';
import { List, Modal } from 'antd';
import { FileOutlined } from '@ant-design/icons';
import { Card, CardHeader, CardTitle } from '@/common/components/card/card';
import { CollectionTrackerService } from '@/common/services/collection-tracker';
import {
  getFileIcon,
  isPreviewableFileType,
  getMimeTypeFromFileName
} from '@/common/utils/file-handling';

export default function FileListSection({ filters }) {
  const [files, setFiles] = useState([]);
  const [previewModal, setPreviewModal] = useState({
    file: null,
    visible: false
  });

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFilePreview = (file) => {
    if (isPreviewableFileType(file)) {
      setPreviewModal({ visible: true, file });
    } else {
      // Direct download for non-previewable files
      const downloadUrl = file.downloadUrl || file.url;
      if (downloadUrl) {
        window.open(downloadUrl, '_blank');
      }
    }
  };

  const renderPreviewContent = (file) => {
    if (!file.url) {
      return (
        <div className="text-center p-8">
          <FileOutlined
            style={{ fontSize: '48px', color: '#999', marginBottom: '16px' }}
          />
          <p>Preview not available</p>
          <p className="text-gray-500">{file.name}</p>
        </div>
      );
    }

    if (file.type.startsWith('image/')) {
      return (
        <img
          alt={file.name}
          src={file.url}
          style={{ width: '100%', maxHeight: '70vh', objectFit: 'contain' }}
        />
      );
    } else if (file.type === 'application/pdf') {
      return (
        <iframe
          src={file.url}
          style={{ width: '100%', height: '70vh', border: 'none' }}
        />
      );
    } else {
      return (
        <div className="text-center p-8">
          <FileOutlined
            style={{ fontSize: '48px', color: '#999', marginBottom: '16px' }}
          />
          <p>Preview not available for this file type</p>
          <p className="text-gray-500">{file.name}</p>
        </div>
      );
    }
  };

  const fetchAllPaymentDocuments = async () => {
    try {
      const { data } = await CollectionTrackerService.getAllPaymentsDocs(
        filters
      );
      const existingDocs = data.map((doc) => ({
        size: 0,
        file: null,
        id: doc.id,
        status: 'done',
        isExisting: true,
        uid: `existing-${doc.id}`,
        url: doc.document.inline_url,
        name: doc.document_name || 'Document',
        downloadUrl: doc.document.download_url,
        type: getMimeTypeFromFileName(doc.document_name)
      }));
      setFiles(existingDocs);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchAllPaymentDocuments();
  }, []);

  return (
    <React.Fragment>
      <Card className="!p-0 !gap-0 border border-secondary-50">
        <CardHeader className="!gap-0 !px-4 !py-3 bg-gray-50 rounded-tl-xl rounded-tr-xl border-b border-secondary-50">
          <CardTitle className="text-[15px] font-medium text-black">
            Uploaded Files ({files.length})
          </CardTitle>
        </CardHeader>
        <div className="p-4">
          {files.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No files uploaded
            </div>
          ) : (
            <div className="max-h-100 overflow-y-auto">
              <List
                size="small"
                dataSource={files}
                renderItem={(file) => (
                  <List.Item
                    onClick={() => handleFilePreview(file)}
                    className="!px-2 hover:bg-gray-50 cursor-pointer rounded-md transition-colors"
                  >
                    <List.Item.Meta
                      avatar={getFileIcon(file.type)}
                      title={
                        <span className="text-sm font-medium text-gray-800 truncate">
                          {file.name}
                        </span>
                      }
                      // description={
                      //   <span className="text-xs text-gray-500">
                      //     {formatFileSize(file.size)}
                      //   </span>
                      // }
                    />
                  </List.Item>
                )}
              />
            </div>
          )}
        </div>
      </Card>

      <Modal
        width="80%"
        footer={null}
        style={{ top: 20 }}
        open={previewModal.visible}
        onCancel={() => setPreviewModal({ visible: false, file: null })}
        title={
          <div className="p-3">
            <h4 className="font-semibold text-gray-800">
              {previewModal.file?.name.charAt(0).toUpperCase() +
                previewModal.file?.name.slice(1)}
            </h4>
          </div>
        }
      >
        <div className="p-3">
          {previewModal.file && renderPreviewContent(previewModal.file)}
        </div>
      </Modal>
    </React.Fragment>
  );
}
