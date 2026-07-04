// Mock data specific to the Review Queue operations workspace

export const queueStats = {
  readyReview: 8,
  changesRequested: 3,
  approved: 5,
  readyPublish: 2
};

export const productivityMetrics = {
  reviewedToday: 14,
  approvedToday: 8,
  changesRequestedToday: 4,
  publishedToday: 2
};

export const queueTasks = [
  // 1. Ready For Review
  {
    id: 'rq-1',
    title: 'Friday Program Poster',
    category: 'Poster Design',
    creatorName: 'Muhammad',
    submittedTime: '1 hour ago',
    status: 'ready for review',
    priority: 'high',
    deadline: 'Jul 5',
    commentsCount: 5,
    lastActivity: '15 minutes ago',
    description: 'Provide Malayalam and English versions for banner prints. Focus on typography hierarchy and logo placements.'
  },
  {
    id: 'rq-2',
    title: 'Staff Corporate Portraits Session',
    category: 'Photography',
    creatorName: 'Sinan',
    submittedTime: '3 hours ago',
    status: 'ready for review',
    priority: 'low',
    deadline: 'Jul 8',
    commentsCount: 1,
    lastActivity: '2 hours ago',
    description: 'Corporate style portraits with soft backgrounds for the company website team section.'
  },
  {
    id: 'rq-3',
    title: 'Ramadan Reel Video Cut',
    category: 'Video Editing',
    creatorName: 'Alex',
    submittedTime: '4 hours ago',
    status: 'ready for review',
    priority: 'high',
    deadline: 'Jul 6',
    commentsCount: 8,
    lastActivity: '30 minutes ago',
    description: '9:16 reels teaser edit with background scores, lower thirds, and English subtitle overlay.'
  },
  // 2. Changes Requested
  {
    id: 'rq-4',
    title: 'Instagram Feature Carousel',
    category: 'Social Media Post',
    creatorName: 'Bob',
    submittedTime: '1 day ago',
    status: 'changes requested',
    priority: 'medium',
    deadline: 'Jul 10',
    commentsCount: 12,
    lastActivity: '4 hours ago',
    description: '5 slides explaining the new Supabase integration features. Reviewers requested adjustments to slide 3 layout.'
  },
  {
    id: 'rq-5',
    title: 'Podcast Ep 48 Audio Master',
    category: 'Video Editing',
    creatorName: 'Sarah',
    submittedTime: '2 days ago',
    status: 'changes requested',
    priority: 'high',
    deadline: 'Jul 7',
    commentsCount: 6,
    lastActivity: 'Yesterday',
    description: 'Final audio mixing and master file for Episode 48. Needs voiceover noise gate adjustments.'
  },
  // 3. Approved
  {
    id: 'rq-6',
    title: 'Summer Campaign Promo v2',
    category: 'Video Editing',
    creatorName: 'Alex',
    submittedTime: '5 hours ago',
    status: 'approved',
    priority: 'high',
    deadline: 'Jul 5',
    commentsCount: 4,
    lastActivity: '1 hour ago',
    description: 'Final cut for the summer teaser promo campaign. Approved by lead editor Ameen.'
  },
  {
    id: 'rq-7',
    title: 'Tech Future Newsletter Copy',
    category: 'Documentation',
    creatorName: 'Jane',
    submittedTime: '6 hours ago',
    status: 'approved',
    priority: 'low',
    deadline: 'Jul 9',
    commentsCount: 2,
    lastActivity: '5 hours ago',
    description: 'Email newsletter layout writing detailing upcoming cohort calendar intake.'
  },
  // 4. Ready To Publish
  {
    id: 'rq-8',
    title: 'Banner Website Graphics Pack',
    category: 'Thumbnail Design',
    creatorName: 'Muhammad',
    submittedTime: '12 hours ago',
    status: 'ready to publish',
    priority: 'medium',
    deadline: 'Jul 11',
    commentsCount: 3,
    lastActivity: '3 hours ago',
    description: 'Website headers banner graphics assets matching vector guidelines.'
  },
  // 5. Completed Today
  {
    id: 'rq-9',
    title: 'Friday Program Poster Final Sync',
    category: 'Poster Design',
    creatorName: 'Muhammad',
    submittedTime: '2 hours ago',
    status: 'completed',
    priority: 'high',
    deadline: 'Jul 5',
    commentsCount: 10,
    lastActivity: '10 mins ago',
    description: 'Final export synced with local storage and shared successfully with social handles.'
  }
];

export const reviewActivities = [
  {
    id: 'r-act-1',
    user: 'Ameen',
    action: 'approved task',
    target: '"Friday Program Poster"',
    time: '15 mins ago'
  },
  {
    id: 'r-act-2',
    user: 'Sinan',
    action: 'requested changes on',
    target: '"Ramadan Reel Video Cut"',
    time: '30 mins ago'
  },
  {
    id: 'r-act-3',
    user: 'Muhammad',
    action: 'resubmitted draft for',
    target: '"Product Launch Poster"',
    time: '1 hour ago'
  },
  {
    id: 'r-act-4',
    user: 'Ameen',
    action: 'marked as published',
    target: '"Summer Campaign Promo v2"',
    time: '2 hours ago'
  }
];
