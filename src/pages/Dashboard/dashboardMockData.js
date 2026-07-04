// Mock data specific to the Sinan Dashboard prototype page

export const dashboardStats = [
  {
    id: 'active-tasks',
    title: 'Active Tasks',
    value: '12',
    trend: { type: 'up', value: '+18%' },
    description: 'Active items in pipeline'
  },
  {
    id: 'review-queue',
    title: 'Review Queue',
    value: '5',
    trend: { type: 'down', value: '-8%' },
    description: 'Awaiting editor reviews'
  },
  {
    id: 'published-today',
    title: 'Published Today',
    value: '3',
    trend: { type: 'up', value: '+50%' },
    description: 'Released to production channels'
  },
  {
    id: 'completed-month',
    title: 'Completed This Month',
    value: '38',
    trend: { type: 'up', value: '+12%' },
    description: 'Workflow items completed'
  }
];

export const recentTasks = [
  {
    id: 't-1',
    title: 'Review video export for "Summer Campaign 2026"',
    category: 'Video',
    status: 'review',
    priority: 'urgent',
    deadline: 'July 5, 2026',
    assignedUser: {
      name: 'Alex Rivera',
      avatar: ''
    }
  },
  {
    id: 't-2',
    title: 'Draft script for Podcast Episode 48: Tech Future',
    category: 'Podcast',
    status: 'draft',
    priority: 'high',
    deadline: 'July 7, 2026',
    assignedUser: {
      name: 'Sarah Connor',
      avatar: ''
    }
  },
  {
    id: 't-3',
    title: 'Edit high-res header images for social banner release',
    category: 'Design',
    status: 'scheduled',
    priority: 'medium',
    deadline: 'July 10, 2026',
    assignedUser: {
      name: 'Bob Ross',
      avatar: ''
    }
  },
  {
    id: 't-4',
    title: 'Design promotional cover for winter release campaign',
    category: 'Design',
    status: 'review',
    priority: 'high',
    deadline: 'July 12, 2026',
    assignedUser: {
      name: 'Muhammad Asif',
      avatar: ''
    }
  },
  {
    id: 't-5',
    title: 'Review transcription and audio levels for Podcast Ep 49',
    category: 'Podcast',
    status: 'draft',
    priority: 'low',
    deadline: 'July 15, 2026',
    assignedUser: {
      name: 'Ameen K.',
      avatar: ''
    }
  }
];

export const reviewItems = [
  {
    id: 'rev-1',
    taskName: 'Summer Campaign Promo v2 Export',
    creatorName: 'Alex Rivera',
    submittedTime: '2 hours ago',
    status: 'review'
  },
  {
    id: 'rev-2',
    taskName: 'Podcast Ep 48 Audio Master',
    creatorName: 'Sarah Connor',
    submittedTime: '5 hours ago',
    status: 'review'
  },
  {
    id: 'rev-3',
    taskName: 'New Product Launch Poster Graphic',
    creatorName: 'Muhammad Asif',
    submittedTime: '1 day ago',
    status: 'review'
  }
];

export const recentActivities = [
  {
    id: 'act-1',
    user: 'Muhammad',
    action: 'uploaded a new poster',
    target: '"Product Launch Poster"',
    time: '10 mins ago'
  },
  {
    id: 'act-2',
    user: 'Ameen',
    action: 'approved a task',
    target: '"Podcast Episode 48 Script"',
    time: '1 hour ago'
  },
  {
    id: 'act-3',
    user: 'Sinan',
    action: 'published a post',
    target: '"Supabase Integration Guide"',
    time: '3 hours ago'
  },
  {
    id: 'act-4',
    user: 'Alex Rivera',
    action: 'submitted draft for review',
    target: '"Summer Campaign Promo v2"',
    time: '5 hours ago'
  }
];
