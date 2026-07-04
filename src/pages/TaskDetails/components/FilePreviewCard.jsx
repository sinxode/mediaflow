import React from 'react';
import {
  FileText,
  Film,
  Image as ImageIcon,
  Compass,
  FileArchive,
  Download,
  ExternalLink
} from 'lucide-react';
import styles from './FilePreviewCard.module.scss';

const getFileIcon = (fileName) => {
  if (!fileName) return <FileText />;
  const ext = fileName.split('.').pop().toLowerCase();
  
  switch (ext) {
    case 'pdf':
      return <FileText className={styles.iconPdf} />;
    case 'mp4':
    case 'mov':
      return <Film className={styles.iconVideo} />;
    case 'zip':
    case 'rar':
      return <FileArchive className={styles.iconZip} />;
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
      return <ImageIcon className={styles.iconImage} />;
    default:
      return <Compass className={styles.iconDefault} />;
  }
};

const FilePreviewCard = ({ fileName, fileUrl, fileSize, uploadedAt, onDownload, canAction = true }) => {
  const isImg = fileName && ['png', 'jpg', 'jpeg', 'gif'].includes(fileName.split('.').pop().toLowerCase());

  const formatUploadDate = (dateString) => {
    if (!dateString) return 'Just now';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Just now';
    }
  };

  return (
    <div className={styles.previewCard}>
      {/* Visual Thumbnail or Icon Column */}
      <div className={styles.mediaFrame}>
        {isImg && fileUrl && !fileUrl.startsWith('mock-url') ? (
          <img src={fileUrl} alt={fileName} className={styles.imageThumbnail} />
        ) : (
          <div className={styles.iconPlaceholder}>{getFileIcon(fileName)}</div>
        )}
        <span className={styles.extBadge}>{fileName?.split('.').pop().toUpperCase() || 'FILE'}</span>
      </div>

      {/* Metadata Info Column */}
      <div className={styles.metadataCol}>
        <h4 className={styles.fileName}>{fileName}</h4>
        <span className={styles.fileDetails}>
          {fileSize} • Uploaded {formatUploadDate(uploadedAt)}
        </span>
      </div>

      {/* Action Row */}
      {canAction && (
        <div className={styles.actionsGroup}>
          <button
            type="button"
            onClick={onDownload}
            className={styles.actionBtn}
            title="Download Deliverable"
            aria-label="Download Deliverable"
          >
            <Download />
          </button>
        </div>
      )}
    </div>
  );
};

export default FilePreviewCard;
export { getFileIcon };
