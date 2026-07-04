// MediaFlow Reusable Framer Motion Variants

export const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.35, 
      ease: [0.16, 1, 0.3, 1] 
    } 
  },
  exit: { 
    opacity: 0, 
    y: -10, 
    transition: { 
      duration: 0.25, 
      ease: [0.16, 1, 0.3, 1] 
    } 
  }
};

export const containerVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04
    }
  }
};

export const fadeUpVariants = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

export const cardEntranceVariants = {
  initial: { opacity: 0, scale: 0.98, y: 8 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

export const sidebarVariants = {
  closed: { 
    x: '-100%', 
    transition: { 
      duration: 0.2, 
      ease: [0.16, 1, 0.3, 1] 
    } 
  },
  open: { 
    x: 0, 
    transition: { 
      duration: 0.3, 
      ease: [0.16, 1, 0.3, 1] 
    } 
  }
};

export const modalVariants = {
  backdrop: {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.15 } }
  },
  content: {
    initial: { opacity: 0, scale: 0.95, y: 16 },
    animate: { 
      opacity: 1, 
      scale: 1, 
      y: 0, 
      transition: { 
        type: 'spring',
        damping: 25,
        stiffness: 350
      } 
    },
    exit: { 
      opacity: 0, 
      scale: 0.95, 
      y: 16, 
      transition: { 
        duration: 0.15,
        ease: 'easeOut'
      } 
    }
  }
};

export const hoverScale = {
  hover: { scale: 1.015, y: -2 },
  tap: { scale: 0.985, y: 0 }
};

export const buttonScale = {
  hover: { scale: 1.02 },
  tap: { scale: 0.98 }
};
