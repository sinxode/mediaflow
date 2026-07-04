import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import styles from './Modal.module.scss';
import { modalVariants } from '../../utils/animations';
import Button from '../Button/Button';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer = null,
  size = 'md', // 'sm' | 'md' | 'lg'
  className = '',
  ...props
}) => {
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className={styles.modalRoot}>
          {/* Backdrop Overlay */}
          <motion.div
            className={styles.backdrop}
            variants={modalVariants.backdrop}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={onClose}
          />

          {/* Modal Container */}
          <div className={styles.container}>
            <motion.div
              className={`${styles.modal} ${styles[size]} ${className}`}
              variants={modalVariants.content}
              initial="initial"
              animate="animate"
              exit="exit"
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
              {...props}
            >
              {/* Header */}
              <div className={styles.header}>
                <h2 id="modal-title" className={styles.title}>
                  {title}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className={styles.closeButton}
                  aria-label="Close modal"
                >
                  <X />
                </Button>
              </div>

              {/* Content */}
              <div className={styles.content}>{children}</div>

              {/* Footer */}
              {footer && <div className={styles.footer}>{footer}</div>}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
