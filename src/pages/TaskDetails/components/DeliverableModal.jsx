import React, { useRef, useState } from 'react';
import { X, Download, Trash2, RefreshCw, FileText, Film, Image as ImageIcon, Compass } from 'lucide-react';
import Button from '../../../components/Button/Button';
import { getFileIcon } from './FilePreviewCard';
import styles from './DeliverableModal.module.scss';

const DeliverableModal = ({
  file,
  onClose,
  onDownload,
  onDelete,
  onReplace,
  canEdit = false,
  replacing = false
}) => {
  const fileInputRef = useRef(null);
  const ext = file.name.split('.').pop().toLowerCase();
  const isImage = ['png', 'jpg', 'jpeg', 'gif'].includes(ext);
  const isVideo = ['mp4', 'mov', 'webm'].includes(ext);

  const handleReplaceClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && onReplace) {
      onReplace(file, selectedFile);
    }
  };

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.headerInfo}>
            <h4 className={styles.fileName}>{file.name}</h4>
            <span className={styles.fileSize}>{file.size}</span>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* Preview Body */}
        <div className={styles.modalBody}>
          {isImage ? (
            <img src={file.url} alt={file.name} className={styles.previewImage} />
          ) : isVideo ? (
            <video src={file.url} controls className={styles.previewVideo} />
          ) : (
            <div className={styles.genericFilePlaceholder}>
              <div className={styles.largeIconWrapper}>
                {getFileIcon(file.name)}
              </div>
              <p className={styles.genericText}>Preview not available for this file type</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className={styles.modalFooter}>
          <div className={styles.leftActions}>
            {canEdit && (
              <>
                <Button
                  variant="danger"
                  size="sm"
                  leftIcon={<Trash2 size={15} />}
                  onClick={() => onDelete(file)}
                  disabled={replacing}
                >
                  Delete
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<RefreshCw size={15} className={replacing ? styles.spin : ''} />}
                  onClick={handleReplaceClick}
                  disabled={replacing}
                >
                  {replacing ? 'Replacing...' : 'Replace'}
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
              </>
            )}
          </div>
          <div className={styles.rightActions}>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Download size={15} />}
              onClick={() => onDownload(file)}
            >
              Download
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliverableModal;
