import React, { useState } from 'react';
import { Upload, HardDrive, FileWarning, RefreshCw } from 'lucide-react';
import Card from '../../../components/Card/Card';
import Button from '../../../components/Button/Button';
import { getFileIcon } from './FilePreviewCard';
import DeliverableModal from './DeliverableModal';
import { StorageService } from '../../../services/storage/storageService';
import { TaskService } from '../../../services/tasks/taskService';
import { parseDeliverables, serializeDeliverables } from '../../../utils/deliverableHelper';
import styles from './TaskInfoCard.module.scss';

const TaskInfoCard = ({ task, description, role = 'creator', isAssignee = false, onFileUpdated }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  
  // Lightbox selection state
  const [selectedFile, setSelectedFile] = useState(null);

  const isCreator = role === 'creator';
  const canEdit = isCreator || isAssignee;

  // Parse list of deliverables
  const deliverables = parseDeliverables(task);

  const handleFileUpload = async (file) => {
    if (!task?.id) return;
    setUploading(true);
    setProgress(0);
    setError('');

    try {
      // Begin storage upload
      const uploaded = await StorageService.uploadFile(task.id, file, (percent) => {
        setProgress(percent);
      });

      const newFileObj = {
        id: `file-${Date.now()}`,
        url: uploaded.url,
        name: uploaded.name,
        size: uploaded.size,
        uploadedAt: uploaded.uploaded_at || new Date().toISOString()
      };

      const updatedList = [...deliverables, newFileObj];
      const serializedPayload = serializeDeliverables(updatedList);
      
      // Update database task entry
      await TaskService.updateTask(task.id, serializedPayload);

      if (onFileUpdated) {
        onFileUpdated(serializedPayload);
      }
    } catch (err) {
      console.error('File upload failed', err);
      setError('Upload failed. Check your network connection.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileDelete = async (fileToDelete) => {
    if (!task?.id) return;
    if (!window.confirm(`Are you sure you want to delete "${fileToDelete.name}"?`)) return;

    try {
      const updatedList = deliverables.filter(f => f.url !== fileToDelete.url);
      const serializedPayload = serializeDeliverables(updatedList);
      
      await TaskService.updateTask(task.id, serializedPayload);
      
      if (onFileUpdated) {
        onFileUpdated(serializedPayload);
      }
      setSelectedFile(null); // Close lightbox modal
    } catch (err) {
      console.error('Failed to delete deliverable file', err);
      setError('Failed to delete file.');
    }
  };

  const handleFileReplace = async (fileToReplace, newRawFile) => {
    if (!task?.id) return;
    setUploading(true);
    setProgress(0);
    setError('');

    try {
      const uploaded = await StorageService.uploadFile(task.id, newRawFile, (percent) => {
        setProgress(percent);
      });

      const updatedList = deliverables.map(f => {
        if (f.url === fileToReplace.url) {
          return {
            ...f,
            url: uploaded.url,
            name: uploaded.name,
            size: uploaded.size,
            uploadedAt: uploaded.uploaded_at || new Date().toISOString()
          };
        }
        return f;
      });

      const serializedPayload = serializeDeliverables(updatedList);
      await TaskService.updateTask(task.id, serializedPayload);
      
      if (onFileUpdated) {
        onFileUpdated(serializedPayload);
      }

      // Auto update modal focus to view the newly replaced item
      const replacedItem = updatedList.find(f => f.name === uploaded.name);
      setSelectedFile(replacedItem || null);
    } catch (err) {
      console.error('File replacement failed', err);
      setError('Failed to replace file.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileDownload = async (fileToDownload) => {
    if (!fileToDownload.url) return;
    try {
      const res = await fetch(fileToDownload.url);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileToDownload.name || 'download');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (e) {
      // Fallback in case of CORS or browser limits
      window.open(fileToDownload.url, '_blank');
    }
  };

  return (
    <div className={styles.infoContainer}>
      {/* Description Panel */}
      <div className={styles.descriptionSection}>
        <h3 className={styles.sectionTitle}>Task Instructions</h3>
        <p className={styles.description}>{description || 'No instructions provided.'}</p>
      </div>

      {/* Multiple Deliverables Section */}
      <div className={styles.fileSection}>
        <h3 className={styles.sectionTitle}>Deliverables ({deliverables.length})</h3>
        
        {error && (
          <div className={styles.errorContainer}>
            <div className={styles.errorMeta}>
              <FileWarning className={styles.errorIcon} />
              <span>{error}</span>
            </div>
            <Button variant="secondary" size="sm" onClick={() => setError('')}>
              Dismiss
            </Button>
          </div>
        )}

        <div className={styles.deliverablesGrid}>
          {/* Grid Cards */}
          {deliverables.map((file, idx) => {
            const ext = file.name.split('.').pop().toLowerCase();
            const isImg = ['png', 'jpg', 'jpeg', 'gif'].includes(ext);
            
            return (
              <div
                key={file.id || idx}
                className={styles.deliverableCard}
                onClick={() => setSelectedFile(file)}
              >
                <div className={styles.cardPreviewFrame}>
                  {isImg ? (
                    <img src={file.url} alt={file.name} className={styles.cardThumb} />
                  ) : (
                    <div className={styles.cardIconPlaceholder}>
                      {getFileIcon(file.name)}
                    </div>
                  )}
                  <span className={styles.extBadge}>{ext.toUpperCase()}</span>
                </div>
                <div className={styles.cardMetadata}>
                  <span className={styles.cardFileName} title={file.name}>
                    {file.name}
                  </span>
                  <span className={styles.cardFileSize}>{file.size}</span>
                </div>
              </div>
            );
          })}

          {/* Add file zone (only for assignee/creator) */}
          {canEdit && (
            <div className={styles.uploadTriggerCard}>
              {uploading ? (
                <div className={styles.uploadingSpinner}>
                  <RefreshCw className={styles.spinIcon} />
                  <span className={styles.progressPercent}>{progress}%</span>
                </div>
              ) : (
                <label className={styles.uploadLabel}>
                  <Upload size={20} className={styles.uploadIcon} />
                  <span className={styles.uploadLabelText}>Add Deliverable</span>
                  <input
                    type="file"
                    className={styles.hiddenFileInput}
                    onChange={(e) => {
                      const selected = e.target.files?.[0];
                      if (selected) handleFileUpload(selected);
                    }}
                  />
                </label>
              )}
            </div>
          )}

          {/* Empty Placeholder for Reviewers/Guests if no deliverables */}
          {deliverables.length === 0 && !canEdit && (
            <div className={styles.emptyGridPlaceholder}>
              <HardDrive className={styles.emptyIcon} />
              <span>No deliverables uploaded yet.</span>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox File Modal View */}
      {selectedFile && (
        <DeliverableModal
          file={selectedFile}
          onClose={() => setSelectedFile(null)}
          onDownload={handleFileDownload}
          onDelete={handleFileDelete}
          onReplace={handleFileReplace}
          canEdit={canEdit}
          replacing={uploading}
        />
      )}
    </div>
  );
};

export default TaskInfoCard;
