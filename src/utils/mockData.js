// MediaFlow Mock Data for Prototyping

export const mockStats = [
  {
    id: 'active-tasks',
    title: 'Active Tasks',
    value: '12',
    trend: { type: 'up', value: '+18%' },
    description: 'Tasks in progress or review'
  },
  {
    id: 'review-queue',
    title: 'Review Queue',
    value: '5',
    trend: { type: 'down', value: '-8%' },
    description: 'Requires editor approval'
  },
  {
    id: 'published-today',
    title: 'Published Today',
    value: '3',
    trend: { type: 'up', value: '+50%' },
    description: 'Published to website & feeds'
  },
  {
    id: 'completed-month',
    title: 'Completed This Month',
    value: '48',
    trend: { type: 'up', value: '+12%' },
    description: 'Target: 50 items'
  }
];

export const mockTasks = [
  {
    id: 'task-1',
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
    id: 'task-2',
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
    id: 'task-3',
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
    id: 'task-4',
    title: 'Write technical documentation for Supabase API sync',
    category: 'Article',
    status: 'published',
    priority: 'low',
    deadline: 'June 30, 2026',
    assignedUser: {
      name: 'Jane Doe',
      avatar: ''
    }
  }
];

export const mockActivities = [
  {
    id: 'act-1',
    type: 'publish',
    user: 'Jane Doe',
    action: 'published the article',
    target: 'Supabase API Integration Guide',
    time: '2 hours ago'
  },
  {
    id: 'act-2',
    type: 'review',
    user: 'Alex Rivera',
    action: 'submitted video draft for review',
    target: 'Summer Campaign Promo v2',
    time: '4 hours ago'
  },
  {
    id: 'act-3',
    type: 'create',
    user: 'Sarah Connor',
    action: 'created draft outline for',
    target: 'Podcast Ep 48: Tech Future',
    time: 'Yesterday'
  },
  {
    id: 'act-4',
    type: 'publish',
    user: 'System Bot',
    action: 'auto-scheduled release for',
    target: 'Banner Design Assets Pack',
    time: '2 days ago'
  }
];

export const categoryOptions = [
  { value: 'video', label: 'Video Export' },
  { value: 'podcast', label: 'Podcast Episode' },
  { value: 'design', label: 'Graphic Assets' },
  { value: 'article', label: 'Article / Blog' }
];

export const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' }
];
