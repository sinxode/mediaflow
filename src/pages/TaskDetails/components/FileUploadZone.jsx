import React, { useRef, useState } from 'react';
import { UploadCloud, FileWarning } from 'lucide-react';
import styles from './FileUploadZone.module.scss';

const FileUploadZone = ({ onFileSelected, onError }) => {
  const fileInputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const maxBytes = 25 * 1024 * 1024; // 25MB size limit

  const validateAndSelectFile = (file) => {
    if (!file) return;

    // Verify file size limit
    if (file.size > maxBytes) {
      onError('File exceeds maximum size limits of 25MB.');
      return;
    }

    // Verify format types
    const allowedExtensions = ['png', 'jpg', 'jpeg', 'gif', 'pdf', 'mp4', 'mov', 'zip', 'doc', 'docx', 'mp3'];
    const ext = file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      onError('File type not supported. Use standard image, document, audio, or video files.');
      return;
    }

    onFileSelected(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSelectFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSelectFile(e.target.files[0]);
    }
  };

  const handleZoneClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div
      onClick={handleZoneClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`${styles.uploadZone} ${isDragOver ? styles.dragOver : ''}`}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className={styles.hiddenInput}
        accept=".png,.jpg,.jpeg,.gif,.pdf,.mp4,.mov,.zip,.doc,.docx,.mp3"
      />
      
      <div className={styles.zoneContent}>
        <UploadCloud className={styles.uploadIcon} />
        <span className={styles.mainPrompt}>Drag & drop deliverable file or click to browse</span>
        <p className={styles.subPrompt}>Supports Images, PDF, ZIP, audio, or Video formats (Max size 25MB)</p>
      </div>
    </div>
  );
};

export default FileUploadZone;
