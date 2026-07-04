import React, { useState } from 'react';
import Card from '../../../components/Card/Card';
import Button from '../../../components/Button/Button';
import { supabase } from '../../../lib/supabaseClient';
import styles from './SecurityCard.module.scss';

const SecurityCard = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);

  const handlePasswordUpdate = async () => {
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    try {
      setUpdating(true);
      setError('');
      setSuccess(false);
      const { error: err } = await supabase.auth.updateUser({ password: newPassword });
      if (err) throw err;
      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to update password.');
    } finally {
      setUpdating(false);
    }
  };

  const sessions = [
    { device: 'macOS Chrome Browser', location: 'Dubai, UAE', status: 'Active Now', current: true },
    { device: 'iOS Safari Capacitor App', location: 'Dubai, UAE', status: '2 hours ago', current: false }
  ];

  return (
    <Card padding={true} className={styles.securityCard}>
      <h3 className={styles.sectionTitle}>Security Settings</h3>
      
      {success && <div style={{ color: 'var(--color-success)', fontSize: '12px', marginBottom: '12px', fontWeight: 'bold' }}>Password updated successfully!</div>}
      {error && <div style={{ color: 'var(--color-danger)', fontSize: '12px', marginBottom: '12px', fontWeight: 'bold' }}>{error}</div>}

      {/* Password Reset Section */}
      <div className={styles.passwordSection} style={{ marginTop: 0 }}>
        <h4 className={styles.subTitle}>Change Password</h4>
        <div className={styles.formGrid}>
          <div className={styles.fieldBlock}>
            <label className={styles.inputLabel}>Current Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={styles.textInput}
            />
          </div>
          <div className={styles.fieldBlock}>
            <label className={styles.inputLabel}>New Password</label>
            <input
              type="password"
              placeholder="Min 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={styles.textInput}
            />
          </div>
        </div>
        <div className={styles.btnRow}>
          <Button 
            variant="secondary" 
            size="sm" 
            disabled={!newPassword}
            onClick={handlePasswordUpdate}
            loading={updating}
          >
            Update Password
          </Button>
        </div>
      </div>

      {/* Active Sessions */}
      <div className={styles.sessionsSection}>
        <h4 className={styles.subTitle}>Active Sessions</h4>
        <p className={styles.desc}>Devices logged into your MediaFlow workspace account.</p>
        
        <div className={styles.sessionsList}>
          {sessions.map((session, index) => (
            <div key={index} className={styles.sessionRow}>
              <div className={styles.sessionInfo}>
                <span className={styles.device}>{session.device}</span>
                <span className={styles.location}>{session.location}</span>
              </div>
              <span className={`${styles.status} ${session.current ? styles.active : ''}`}>
                {session.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default SecurityCard;
