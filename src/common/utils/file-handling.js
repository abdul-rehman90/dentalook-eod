import { FileOutlined } from '@ant-design/icons';

export const getMimeTypeFromFileName = (fileName = '') => {
  const ext = fileName.split('.').pop()?.toLowerCase();

  switch (ext) {
    case 'png':
      return 'image/png';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'gif':
      return 'image/gif';
    case 'pdf':
      return 'application/pdf';
    case 'doc':
      return 'application/msword';
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'xls':
      return 'application/vnd.ms-excel';
    case 'xlsx':
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    default:
      return 'application/octet-stream';
  }
};

export const isValidFileType = (file) => {
  return [
    'image/png',
    'image/jpg',
    'image/jpeg',
    'application/pdf',
    'application/msword',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ].includes(file.type);
};

export const isPreviewableFileType = (file) => {
  return (
    file.type.startsWith('image/') ||
    file.type === 'application/pdf' ||
    file.url?.includes('pdf')
  );
};

export const getFileIcon = (fileType) => {
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
