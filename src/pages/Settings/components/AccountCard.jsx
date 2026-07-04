import React, { useState, useRef } from 'react';
import Card from '../../../components/Card/Card';
import Avatar from '../../../components/Avatar/Avatar';
import Button from '../../../components/Button/Button';
import { UserService } from '../../../services/users/userService';
import { useAuth } from '../../../auth/hooks/useAuth';
import { supabase } from '../../../lib/supabaseClient';
import styles from './AccountCard.module.scss';

const AccountCard = ({ user }) => {
  const { profileRefresh } = useAuth();
  const fileInputRef = useRef(null);
  const [name, setName] = useState(user.name);
  const [email] = useState(user.email);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Cropping and editing states
  const [selectedImage, setSelectedImage] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [cropShape, setCropShape] = useState('circle'); // 'circle' | 'square'
  const [uploadFileName, setUploadFileName] = useState('');

  const getCroppedImg = (imageSrc, zoom, rotation, cropShape) => {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.src = imageSrc;
      image.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const targetSize = 400;
        canvas.width = targetSize;
        canvas.height = targetSize;

        ctx.clearRect(0, 0, targetSize, targetSize);

        if (cropShape === 'circle') {
          ctx.beginPath();
          ctx.arc(targetSize / 2, targetSize / 2, targetSize / 2, 0, 2 * Math.PI);
          ctx.clip();
        }

        ctx.save();
        ctx.translate(targetSize / 2, targetSize / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(zoom, zoom);

        const imgWidth = image.width;
        const imgHeight = image.height;
        const minDimension = Math.min(imgWidth, imgHeight);
        
        const scale = targetSize / minDimension;
        const drawWidth = imgWidth * scale;
        const drawHeight = imgHeight * scale;

        ctx.drawImage(
          image,
          -drawWidth / 2,
          -drawHeight / 2,
          drawWidth,
          drawHeight
        );

        ctx.restore();

        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Canvas is empty'));
            return;
          }
          resolve(blob);
        }, 'image/jpeg', 0.9);
      };
      image.onerror = (err) => reject(err);
    });
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Name cannot be empty.');
      return;
    }
    try {
      setSaving(true);
      setError('');
      setSuccess(false);
      await UserService.updateUserProfile(user.id, { name });
      await profileRefresh();
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError('Failed to update profile settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
      setError('File size must be under 2MB.');
      return;
    }

    setUploadFileName(file.name);
    
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result);
      setZoom(1);
      setRotation(0);
      setShowCropModal(true);
    };
    reader.readAsDataURL(file);
  };

  const handleApplyCrop = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess(false);
      setShowCropModal(false);

      const croppedBlob = await getCroppedImg(selectedImage, zoom, rotation, cropShape);
      
      const bucketName = 'mediaflow-assets';
      const filePath = `avatars/${user.id}/${Date.now()}_${uploadFileName || 'cropped_avatar.jpg'}`;

      const { data, error: uploadErr } = await supabase.storage
        .from(bucketName)
        .upload(filePath, croppedBlob, {
          contentType: 'image/jpeg',
          cacheControl: '3600',
          upsert: true
        });
      if (uploadErr) throw uploadErr;

      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      await UserService.updateUserProfile(user.id, { avatar_url: publicUrl });
      await profileRefresh();
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError('Failed to crop or upload image.');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarRemove = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess(false);

      await UserService.updateUserProfile(user.id, { avatar_url: null });
      await profileRefresh();
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError('Failed to remove profile picture.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card padding={true} className={styles.accountCard}>
      <h3 className={styles.sectionTitle}>Account Settings</h3>
      
      {success && <div style={{ color: 'var(--color-success)', fontSize: '12px', marginBottom: '12px', fontWeight: 'bold' }}>Profile updated successfully!</div>}
      {error && <div style={{ color: 'var(--color-danger)', fontSize: '12px', marginBottom: '12px', fontWeight: 'bold' }}>{error}</div>}
      
      <div className={styles.avatarSection}>
        <Avatar src={user.avatar_url} name={name} size="lg" className={styles.uploadAvatar} />
        <div className={styles.avatarMeta}>
          <span className={styles.label}>Profile Picture</span>
          <p className={styles.desc}>Upload a custom square thumbnail image (max 2MB).</p>
          <div className={styles.actions}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarUpload}
              accept="image/*"
              style={{ display: 'none' }}
            />
            <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
              Upload Image
            </Button>
            <Button variant="ghost" size="sm" className={styles.removeBtn} onClick={handleAvatarRemove}>
              Remove
            </Button>
          </div>
        </div>
      </div>

      <div className={styles.formGrid}>
        <div className={styles.fieldBlock}>
          <label className={styles.inputLabel}>Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={styles.textInput}
          />
        </div>
        <div className={styles.fieldBlock}>
          <label className={styles.inputLabel}>Email Address</label>
          <input
            type="email"
            value={email}
            disabled
            readOnly
            className={styles.textInput}
            style={{ opacity: 0.65, cursor: 'not-allowed' }}
          />
        </div>
      </div>

      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="primary" size="md" onClick={handleSave} loading={saving}>
          Save Changes
        </Button>
      </div>

      {/* Cropping and Editing Modal */}
      {showCropModal && (
        <div className={styles.cropModalOverlay}>
          <div className={styles.cropModalContent}>
            <div className={styles.modalHeader}>
              <h3>Crop & Edit Avatar</h3>
              <button 
                type="button" 
                className={styles.closeBtn} 
                onClick={() => setShowCropModal(false)}
              >
                &times;
              </button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.previewContainer}>
                <div className={`${styles.imageWrapper} ${styles[cropShape]}`}>
                  <img 
                    src={selectedImage} 
                    style={{ transform: `scale(${zoom}) rotate(${rotation}deg)` }} 
                    alt="Preview" 
                  />
                </div>
              </div>

              {/* Zoom Control */}
              <div className={styles.controlGroup}>
                <span className={styles.controlLabel}>Zoom ({zoom.toFixed(1)}x)</span>
                <div className={styles.sliderWrapper}>
                  <input 
                    type="range" 
                    min="1" 
                    max="3" 
                    step="0.1" 
                    value={zoom} 
                    onChange={(e) => setZoom(parseFloat(e.target.value))} 
                  />
                </div>
              </div>

              {/* Rotation Control */}
              <div className={styles.controlGroup}>
                <span className={styles.controlLabel}>Rotation ({rotation}°)</span>
                <div className={styles.sliderWrapper}>
                  <input 
                    type="range" 
                    min="0" 
                    max="360" 
                    step="1" 
                    value={rotation} 
                    onChange={(e) => setRotation(parseInt(e.target.value))} 
                  />
                </div>
              </div>

              {/* Crop Shape Selection */}
              <div className={styles.controlGroup}>
                <span className={styles.controlLabel}>Crop Shape</span>
                <div className={styles.shapeSelectors}>
                  <button 
                    type="button" 
                    className={`${styles.shapeBtn} ${cropShape === 'circle' ? styles.active : ''}`}
                    onClick={() => setCropShape('circle')}
                  >
                    Circle
                  </button>
                  <button 
                    type="button" 
                    className={`${styles.shapeBtn} ${cropShape === 'square' ? styles.active : ''}`}
                    onClick={() => setCropShape('square')}
                  >
                    Square
                  </button>
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowCropModal(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                size="sm" 
                onClick={handleApplyCrop}
              >
                Apply Crop & Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default AccountCard;
