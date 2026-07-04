// Central constant values and adapter configurations for MediaFlow

// Check if app is set to run with local mockup adapters
export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'; // defaults to true if not explicitly 'false'

export const ROLES = {
  CREATOR: 'creator',
  REVIEWER: 'reviewer'
};

export const ROLE_LABELS = {
  [ROLES.CREATOR]: 'Creator',
  [ROLES.REVIEWER]: 'Reviewer'
};

export const PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
};

export const PRIORITY_LABELS = {
  [PRIORITIES.LOW]: 'Low',
  [PRIORITIES.MEDIUM]: 'Medium',
  [PRIORITIES.HIGH]: 'High'
};

export const STATUSES = {
  CREATED: 'created',
  ASSIGNED: 'assigned',
  WORKING: 'working',
  READY_FOR_REVIEW: 'ready_for_review',
  REVIEWING: 'reviewing',
  APPROVED: 'approved',
  PUBLISHED: 'published',
  COMPLETED: 'completed'
};

export const STATUS_LABELS = {
  [STATUSES.CREATED]: 'Created',
  [STATUSES.ASSIGNED]: 'Assigned',
  [STATUSES.WORKING]: 'Working',
  [STATUSES.READY_FOR_REVIEW]: 'Ready for Review',
  [STATUSES.REVIEWING]: 'Reviewing',
  [STATUSES.APPROVED]: 'Approved',
  [STATUSES.PUBLISHED]: 'Published',
  [STATUSES.COMPLETED]: 'Completed'
};

// CSS theme class/color mappings matching status states
export const STATUS_COLORS = {
  [STATUSES.CREATED]: { bg: '#F1F5F9', text: '#475569' },
  [STATUSES.ASSIGNED]: { bg: '#EEF2FF', text: '#4F46E5' },
  [STATUSES.WORKING]: { bg: '#E0F2FE', text: '#0284C7' },
  [STATUSES.READY_FOR_REVIEW]: { bg: '#F5F3FF', text: '#7C3AED' },
  [STATUSES.REVIEWING]: { bg: '#FDF2F8', text: '#DB2777' },
  [STATUSES.APPROVED]: { bg: '#ECFDF5', text: '#047857' },
  [STATUSES.PUBLISHED]: { bg: '#DCFCE7', text: '#16A34A' },
  [STATUSES.COMPLETED]: { bg: '#F0FDF4', text: '#15803D' }
};

export const CATEGORIES = {
  POSTER: 'Poster Design',
  VIDEO: 'Video Editing',
  THUMBNAIL: 'Thumbnail Design',
  PHOTO: 'Photography',
  DOCS: 'Documentation',
  SOCIAL: 'Social Media Post',
  OTHER: 'Other'
};
