import React from 'react';
import { motion } from 'framer-motion';
import styles from './Card.module.scss';
import { cardEntranceVariants } from '../../utils/animations';

const Card = ({
  children,
  className = '',
  onClick,
  hoverable = false,
  padding = true,
  variant = 'default', // 'default' | 'surface' | 'borderless'
  animate = false,
  overflowVisible = false,
  ...props
}) => {
  const Component = onClick || hoverable ? motion.div : 'div';
  
  const animationProps = animate
    ? {
        variants: cardEntranceVariants,
        initial: 'initial',
        animate: 'animate',
      }
    : {};

  const interactiveProps = onClick
    ? {
        whileHover: { y: -2, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)' },
        whileTap: { scale: 0.99 },
        onClick,
        style: { cursor: 'pointer' },
      }
    : hoverable
    ? {
        whileHover: { y: -2, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)' },
      }
    : {};

  return (
    <Component
      className={`${styles.card} ${styles[variant]} ${padding ? styles.padding : ''} ${overflowVisible ? styles.overflowVisible : ''} ${className}`}
      {...animationProps}
      {...interactiveProps}
      {...props}
    >
      {children}
    </Component>
  );
};

export default Card;
