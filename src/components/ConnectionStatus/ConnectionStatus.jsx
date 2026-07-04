import React, { useState, useEffect } from 'react';
import { realtimeBus } from '../../services/realtime/realtimeService';
import styles from './ConnectionStatus.module.scss';

const ConnectionStatus = () => {
  const [status, setStatus] = useState('connected');

  useEffect(() => {
    const unsubscribe = realtimeBus.subscribeToConnectionStatus((curr) => {
      setStatus(curr);
    });
    return () => unsubscribe();
  }, []);

  const getStatusLabel = () => {
    switch (status) {
      case 'reconnecting':
        return 'Reconnecting';
      case 'offline':
        return 'Offline';
      case 'connected':
      default:
        return 'Syncing live';
    }
  };

  return (
    <div className={`${styles.statusPill} ${styles[status]}`}>
      <span className={styles.dot} />
      <span className={styles.label}>{getStatusLabel()}</span>
    </div>
  );
};

export default ConnectionStatus;
