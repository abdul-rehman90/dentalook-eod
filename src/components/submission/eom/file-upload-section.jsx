import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Upload, Button, List, Modal } from 'antd';
import { getUserAndToken } from '@/common/utils/auth-user';
import { EOMReportService } from '@/common/services/eom-report';
import { Card, CardHeader, CardTitle } from '@/common/components/card/card';
import {
  getFileIcon,
  isValidFileType,
  isPreviewableFileType,
  getMimeTypeFromFileName
} from '@/common/utils/file-handling';
import {
  FileOutlined,
  UploadOutlined,
  DeleteOutlined,
  CloudUploadOutlined
} from '@ant-design/icons';

const { Dragger } = Upload;

export default function FileUploadSection({ eomSubmissionId }) {
  const { token } = getUserAndToken();
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [previewModal, setPreviewModal] = useState({
    file: null,
    visible: false
  });
  const [deleteModal, setDeleteModal] = useState({
    file: null,
    visible: false
  });

  const handleUpload = (file) => {
    if (!isValidFileType(file)) {
      toast.error(
        'You can only upload JPG, PNG, PDF, DOC, DOCX, XLS, XLSX files!'
      );
      return false;
    }

    const isDuplicate = uploadedFiles.some(
      (existingFile) =>
        existingFile.name === file.name && existingFile.size === file.size
    );

    if (isDuplicate) {
      toast.error(`File is already uploaded!`);
      return false;
    }

    const fileObj = {
      file,
      id: null,
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'pending',
      url: URL.createObjectURL(file),
      uid: file.uid || `${Date.now()}-${Math.random()}`
    };

    setUploadedFiles((prev) => [...prev, fileObj]);
    toast.success(`File is added to upload queue`);

    return false;
  };

  const handleRemove = async (uid) => {
    const fileToRemove = uploadedFiles.find((f) => f.uid === uid);

    if (fileToRemove?.status === 'pending') {
      setUploadedFiles((prev) => prev.filter((f) => f.uid !== uid));
      setDeleteModal({ file: null, visible: false });
      toast.success('File removed from upload queue');
      return;
    }

    if (fileToRemove?.id) {
      try {
        await EOMReportService.deletePaymentDocById(fileToRemove.id);
        setUploadedFiles((prev) => prev.filter((f) => f.uid !== uid));
        toast.success('Document deleted successfully');
        setDeleteModal({ file: null, visible: false });
      } catch {
        toast.error('Failed to delete document');
      }
    }
  };

  const showDeleteConfirmation = (file) => {
    setDeleteModal({ file, visible: true });
  };

  const handleUploadToServer = async () => {
    const pendingFiles = uploadedFiles.filter(
      (file) => file.status === 'pending'
    );

    if (pendingFiles.length === 0) {
      toast.warning('No files to upload');
      return;
    }

    if (!eomSubmissionId) {
      toast.error('EOM Submission ID is required');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();

      pendingFiles.forEach((fileObj) => {
        formData.append('documents', fileObj.file);
      });

      formData.append('submission_id', eomSubmissionId);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/eom-payment-document/`,
        {
          method: 'POST',
          body: formData,
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const uploadedDocs = await response.json();

      setUploadedFiles((prev) =>
        prev.map((f) => {
          if (f.status !== 'pending') return f;
          const uploadedDoc = uploadedDocs.find(
            (d) => d.document_name === f.name.replace(/\s+/g, '_')
          );
          return {
            ...f,
            status: 'done',
            isExisting: true,
            id: uploadedDoc?.id || null
          };
        })
      );

      toast.success(`${pendingFiles.length} file(s) uploaded successfully`);
    } catch (error) {
      toast.error('Failed to upload files');
    } finally {
      setUploading(false);
    }
  };

  const handleFilePreview = (file) => {
    if (isPreviewableFileType(file)) {
      setPreviewModal({ visible: true, file });
    } else {
      const downloadUrl = file.downloadUrl || file.url;
      if (downloadUrl) {
        window.open(downloadUrl, '_blank');
      }
    }
  };

  const renderPreviewContent = (file) => {
    const previewUrl =
      file.url || (file.file ? URL.createObjectURL(file.file) : null);

    if (!previewUrl) {
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

    if (file.type.startsWith('image/') || file.url?.includes('image')) {
      return (
        <img
          alt={file.name}
          src={previewUrl}
          style={{ width: '100%', maxHeight: '70vh', objectFit: 'contain' }}
        />
      );
    } else if (file.type === 'application/pdf' || file.url?.includes('pdf')) {
      return (
        <iframe
          src={previewUrl}
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
          <a
            href={file.downloadUrl || previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            Download File
          </a>
        </div>
      );
    }
  };

  const fetchExistingDocuments = async () => {
    if (!eomSubmissionId) return;

    try {
      const response = await EOMReportService.getPaymentDocBySubmissionId(
        eomSubmissionId
      );
      const existingDocs = response.data.map((doc) => ({
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

      setUploadedFiles(existingDocs);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  useEffect(() => {
    if (eomSubmissionId) {
      fetchExistingDocuments();
    }
  }, [eomSubmissionId]);

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
              Files ({uploadedFiles.length})
            </h4>
            <div className="max-h-60 overflow-y-auto">
              <List
                size="small"
                dataSource={uploadedFiles}
                renderItem={(file, index) => (
                  <List.Item
                    key={index}
                    onClick={() => handleFilePreview(file)}
                    className="!p-2 rounded-lg mb-2 last:mb-0 cursor-pointer hover:bg-gray-50"
                    actions={[
                      <Button
                        danger
                        type="text"
                        size="small"
                        className="!p-1"
                        icon={<DeleteOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          showDeleteConfirmation(file);
                        }}
                      />
                    ]}
                  >
                    <List.Item.Meta
                      avatar={getFileIcon(file.type)}
                      title={
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-800">
                            {file.name}
                          </span>
                          {file.status === 'pending' && (
                            <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded">
                              Pending
                            </span>
                          )}
                          {file.status === 'done' && (
                            <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">
                              Uploaded
                            </span>
                          )}
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </div>
            {uploadedFiles.some((f) => f.status === 'pending') && (
              <div className="flex justify-end mt-3">
                <Button
                  type="primary"
                  loading={uploading}
                  icon={<CloudUploadOutlined />}
                  onClick={handleUploadToServer}
                >
                  Upload All Files
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
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
      <Modal
        centered
        width={400}
        open={deleteModal.visible}
        onCancel={() => setDeleteModal({ file: null, visible: false })}
        title={
          <div className="p-3">
            <h4 className="text-lg font-semibold text-gray-800">
              Confirm Delete
            </h4>
          </div>
        }
        footer={[
          <div className="flex justify-end gap-2 p-3">
            <Button
              key="cancel"
              onClick={() => setDeleteModal({ file: null, visible: false })}
            >
              Cancel
            </Button>
            <Button
              danger
              key="delete"
              onClick={() => handleRemove(deleteModal.file?.uid)}
            >
              Delete
            </Button>
          </div>
        ]}
      >
        <p>Are you sure you want to delete "{deleteModal.file?.name}"?</p>
      </Modal>
    </Card>
  );
}
