// Archive operational mock data

export const archiveStats = {
  publishedToday: 3,
  publishedThisWeek: 12,
  publishedThisMonth: 45,
  totalArchive: 154
};

export const archiveInsights = {
  activeCreator: 'Muhammad',
  activeReviewer: 'Ameen',
  topCategory: 'Poster Design',
  avgTime: '2.4 days'
};

export const archiveTimelineTasks = [
  {
    id: 'arc-1',
    group: 'Today',
    title: 'Friday Program Poster',
    category: 'Poster Design',
    publishedBy: 'Ameen',
    creator: 'Muhammad',
    completedDate: 'Jul 3',
    publishedDate: 'Jul 3',
    priority: 'High',
    status: 'Published',
    commentsCount: 4,
    description: 'Bilingual announcements banner prints for the upcoming Friday congregation session.'
  },
  {
    id: 'arc-2',
    group: 'Yesterday',
    title: 'Ramadan Reel Teaser',
    category: 'Video Editing',
    publishedBy: 'Ameen',
    creator: 'Alex',
    completedDate: 'Jul 2',
    publishedDate: 'Jul 2',
    priority: 'High',
    status: 'Completed',
    commentsCount: 10,
    description: 'Promotional video cuts and lower-third typography alignments.'
  },
  {
    id: 'arc-3',
    group: 'This Week',
    title: 'Corporate Portrait Banners',
    category: 'Photography',
    publishedBy: 'Sinan',
    creator: 'Jane',
    completedDate: 'Jun 30',
    publishedDate: 'Jun 30',
    priority: 'Low',
    status: 'Published',
    commentsCount: 1,
    description: 'Corporate staff imagery cropped and optimized for company headers.'
  },
  {
    id: 'arc-4',
    group: 'This Week',
    title: 'Facebook Event Feature Art',
    category: 'Thumbnail Design',
    publishedBy: 'Ameen',
    creator: 'Muhammad',
    completedDate: 'Jun 29',
    publishedDate: 'Jun 29',
    priority: 'Medium',
    status: 'Completed',
    commentsCount: 3,
    description: 'Community outreach social campaign banner files.'
  },
  {
    id: 'arc-5',
    group: 'This Month',
    title: 'Summer Campaign Booklet Copy',
    category: 'Documentation',
    publishedBy: 'Sinan',
    creator: 'Jane',
    completedDate: 'Jun 15',
    publishedDate: 'Jun 15',
    priority: 'Low',
    status: 'Completed',
    commentsCount: 8,
    description: 'Document outlining branding calendar and publication schedule.'
  },
  {
    id: 'arc-6',
    group: 'Older',
    title: 'Logo Redesign Guidelines Pack',
    category: 'Poster Design',
    publishedBy: 'Sinan',
    creator: 'Muhammad',
    completedDate: 'May 12',
    publishedDate: 'May 12',
    priority: 'High',
    status: 'Archived',
    commentsCount: 24,
    description: 'Final vectorized brand assets, palette references, and font listings.'
  }
];

export const archiveActivities = [
  {
    id: 'a-act-1',
    user: 'Ameen',
    action: 'published',
    target: '"Friday Program Poster"',
    time: '2 hours ago'
  },
  {
    id: 'a-act-2',
    user: 'Sinan',
    action: 'completed',
    target: '"Ramadan Reel Teaser"',
    time: 'Yesterday'
  },
  {
    id: 'a-act-3',
    user: 'Ameen',
    action: 'archived',
    target: '"Logo Redesign Guidelines Pack"',
    time: '2 weeks ago'
  }
];
export const allCreators = ['Muhammad', 'Jane', 'Alex', 'Sinan', 'Ameen'];
export const allPublishers = ['Ameen', 'Sinan'];
export const archiveCategories = ['Poster Design', 'Video Editing', 'Thumbnail Design', 'Photography', 'Documentation', 'Social Media Post'];
