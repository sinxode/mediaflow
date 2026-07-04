import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Button from '../../../components/Button/Button';
import styles from './ReplaceFileDialog.module.scss';

const ReplaceFileDialog = ({ onConfirm, onCancel }) => {
  return (
    <div className={styles.warningContainer}>
      <div className={styles.header}>
        <AlertTriangle className={styles.warningIcon} />
        <h4 className={styles.title}>Replace Current File?</h4>
      </div>
      <p className={styles.description}>
        Uploading a new deliverable will permanently replace the existing file attached to this task. Reviewers will only see the latest version.
      </p>
      <div className={styles.actionsRow}>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="danger" size="sm" onClick={onConfirm}>
          Replace File
        </Button>
      </div>
    </div>
  );
};

export default ReplaceFileDialog;
