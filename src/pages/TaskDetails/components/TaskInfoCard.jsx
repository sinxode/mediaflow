import React, { useState } from 'react';
import { Upload, HardDrive, FileWarning } from 'lucide-react';
import Card from '../../../components/Card/Card';
import Button from '../../../components/Button/Button';
import FilePreviewCard from './FilePreviewCard';
import FileUploadZone from './FileUploadZone';
import UploadProgress from './UploadProgress';
import ReplaceFileDialog from './ReplaceFileDialog';
import FileSkeleton from './FileSkeleton';
import { StorageService, getFileMetadata } from '../../../services/storage/storageService';
import { TaskService } from '../../../services/tasks/taskService';
import styles from './TaskInfoCard.module.scss';

const TaskInfoCard = ({ taskId, description, fileUrl, fileMeta, role = 'creator', isAssignee = false, onFileUpdated }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  
  // Workflow UI states
  const [isConfirmingReplace, setIsConfirmingReplace] = useState(false);
  const [showUploadZone, setShowUploadZone] = useState(false);

  const isCreator = role === 'creator';
  const canUploadOrReplace = isCreator && isAssignee;

  const handleFileSelected = async (file) => {
    if (!taskId) return;
    setUploading(true);
    setProgress(0);
    setError('');
    setIsConfirmingReplace(false);
    setShowUploadZone(false);

    try {
      // Begin storage upload
      const uploaded = await StorageService.uploadFile(taskId, file, (percent) => {
        setProgress(percent);
      });

      // Update database task entry
      await TaskService.updateTask(taskId, {
        file_url: uploaded.url,
        // Store meta helper parameters
        file_name: uploaded.name,
        file_size: uploaded.size,
        file_uploaded_at: uploaded.uploaded_at
      });

      if (onFileUpdated) {
        onFileUpdated(uploaded.url, uploaded);
      }
    } catch (err) {
      console.error('File upload failed', err);
      setError('Upload failed. Please verify network connectivity.');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = () => {
    if (!fileUrl) return;
    // Download asset via link
    window.open(fileUrl, '_blank');
  };

  const triggerReplacement = () => {
    setIsConfirmingReplace(true);
  };

  const confirmReplacement = () => {
    setIsConfirmingReplace(false);
    setShowUploadZone(true);
  };

  // Determine active visual layout state
  const renderFileArea = () => {
    if (uploading) {
      return <UploadProgress percent={progress} />;
    }

    if (error) {
      return (
        <div className={styles.errorContainer}>
          <div className={styles.errorMeta}>
            <FileWarning className={styles.errorIcon} />
            <span>{error}</span>
          </div>
          <Button variant="secondary" size="sm" onClick={() => setError('')}>
            Try Again
          </Button>
        </div>
      );
    }

    if (isConfirmingReplace) {
      return (
        <ReplaceFileDialog
          onConfirm={confirmReplacement}
          onCancel={() => setIsConfirmingReplace(false)}
        />
      );
    }

    if (fileUrl && !showUploadZone) {
      // Resolve name/meta tags
      const fileName = fileMeta?.name || fileUrl.split('/').pop() || 'DeliverableAsset.jpg';
      const fileSize = fileMeta?.size || '4.2 MB';
      const uploadedAt = fileMeta?.uploaded_at || new Date().toISOString();

      return (
        <div className={styles.fileDisplay}>
          <FilePreviewCard
            fileName={fileName}
            fileUrl={fileUrl}
            fileSize={fileSize}
            uploadedAt={uploadedAt}
            onDownload={handleDownload}
            canAction={true}
          />
          {canUploadOrReplace && (
            <div className={styles.replaceActionRow}>
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Upload />}
                onClick={triggerReplacement}
                className={styles.replaceBtn}
              >
                Replace Deliverable File
              </Button>
            </div>
          )}
        </div>
      );
    }

    if (showUploadZone || (!fileUrl && canUploadOrReplace)) {
      return (
        <FileUploadZone
          onFileSelected={handleFileSelected}
          onError={(msg) => setError(msg)}
        />
      );
    }

    // Reviewer or Guest empty placeholder
    return (
      <div className={styles.uploadPlaceholder}>
        <HardDrive className={styles.placeholderIcon} />
        <span>No deliverable files uploaded yet.</span>
      </div>
    );
  };

  return (
    <div className={styles.infoContainer}>
      {/* Description Panel */}
      <div className={styles.descriptionSection}>
        <h3 className={styles.sectionTitle}>Task Instructions</h3>
        <p className={styles.description}>{description || 'No instructions provided.'}</p>
      </div>

      {/* Latest File Section */}
      <div className={styles.fileSection}>
        <h3 className={styles.sectionTitle}>Latest Deliverable</h3>
        {renderFileArea()}
      </div>
    </div>
  );
};

export default TaskInfoCard;
