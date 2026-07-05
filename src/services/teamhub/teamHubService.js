// Team Hub Service Layer
// Connects to live Supabase tables with a transparent localStorage fallback for quick testing.

import { supabase } from '../../lib/supabaseClient';

const STORAGE_KEYS = {
  MESSAGES: 'mediaflow_th_messages',
  IDEAS: 'mediaflow_th_ideas',
  PLANS: 'mediaflow_th_plans',
  ITEM_MESSAGES: 'mediaflow_th_item_messages',
  ACTIVITIES: 'mediaflow_th_activities'
};

// Initial Rich Mock/Seed Data
const INITIAL_MESSAGES = [
  {
    id: 'msg-1',
    user_id: 'user-muhammad',
    content: 'We should create a Friday Program Poster this week. Needs to look very clean.',
    attachments: [],
    reactions: [],
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
    user: { name: 'Muhammad Sinan', role: 'creator', avatar_url: '' }
  },
  {
    id: 'msg-2',
    user_id: 'user-ameen',
    content: 'Agreed! Make sure the background is dark and aligned with our premium layouts.',
    attachments: [],
    reactions: [],
    created_at: new Date(Date.now() - 3600000 * 1.5).toISOString(), // 1.5 hours ago
    user: { name: 'Ameen', role: 'creator', avatar_url: '' }
  },
  {
    id: 'msg-3',
    user_id: 'user-sinan',
    content: 'I can start working on the typography grid. Here is a PDF guide for references.',
    attachments: [
      { name: 'TypographyGuidelines.pdf', size: '1.2 MB', url: '#' }
    ],
    reactions: [{ emoji: '👍', count: 3, users: ['user-muhammad', 'user-ameen'] }],
    created_at: new Date(Date.now() - 3600000 * 0.5).toISOString(), // 30 mins ago
    user: { name: 'Sinan', role: 'creator', avatar_url: '' }
  }
];

const INITIAL_IDEAS = [
  {
    id: 'idea-1',
    title: 'Podcast Series Branding',
    description: 'A complete branding identity package for the upcoming student podcast series.',
    status: 'under_discussion',
    created_by: 'user-muhammad',
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(), // 2 days ago
    discussion_count: 12,
    creator: { name: 'Muhammad Sinan', role: 'creator' }
  },
  {
    id: 'idea-2',
    title: 'Academy Event Reel Highlights',
    description: 'Short dynamic video compilation of highlights from our graduation ceremony.',
    status: 'open',
    created_by: 'user-sinan',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(), // 1 day ago
    discussion_count: 4,
    creator: { name: 'Sinan', role: 'creator' }
  },
  {
    id: 'idea-3',
    title: 'Short Reels Campaign',
    description: 'Weekly educational reels for social handles focusing on technical tools.',
    status: 'approved',
    created_by: 'user-ameen',
    created_at: new Date(Date.now() - 3600000 * 72).toISOString(), // 3 days ago
    discussion_count: 8,
    creator: { name: 'Ameen', role: 'creator' }
  }
];

const INITIAL_PLANS = [
  {
    id: 'plan-1',
    title: 'Friday Program Poster Design',
    description: 'Design a clean typography poster. Must prefill to task and assign for review.',
    status: 'in_progress',
    priority: 'high',
    created_by: 'user-muhammad',
    linked_idea_id: null,
    converted_task_id: null,
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    creator: { name: 'Muhammad Sinan', role: 'creator' }
  },
  {
    id: 'plan-2',
    title: 'Event Photography Setup',
    description: 'Arrange DSLRs, backup batteries, and flash units in the main seminar hall.',
    status: 'not_started',
    priority: 'medium',
    created_by: 'user-sinan',
    linked_idea_id: null,
    converted_task_id: null,
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
    creator: { name: 'Sinan', role: 'creator' }
  },
  {
    id: 'plan-3',
    title: 'Podcast Recording Session',
    description: 'Record Episode 1 with our chief guest focusing on workspace optimizations.',
    status: 'completed',
    priority: 'low',
    created_by: 'user-ameen',
    linked_idea_id: 'idea-1',
    converted_task_id: 'task-mock-123',
    created_at: new Date(Date.now() - 3600000 * 36).toISOString(),
    creator: { name: 'Ameen', role: 'creator' }
  }
];

const INITIAL_ITEM_MESSAGES = [
  {
    id: 'im-1',
    item_type: 'idea',
    item_id: 'idea-1',
    user_id: 'user-muhammad',
    content: 'We should feature standard neon colors.',
    created_at: new Date(Date.now() - 3600000 * 10).toISOString(),
    user: { name: 'Muhammad Sinan', role: 'creator' }
  },
  {
    id: 'im-2',
    item_type: 'plan',
    item_id: 'plan-1',
    user_id: 'user-ameen',
    content: 'Ready to convert to task after we get the core copy outline.',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    user: { name: 'Ameen', role: 'creator' }
  }
];

const INITIAL_ACTIVITIES = [
  { id: 'act-1', type: 'idea_created', message: 'Muhammad Sinan created a new idea: Podcast Series Branding', created_at: new Date(Date.now() - 3600000 * 2).toISOString() },
  { id: 'act-2', type: 'plan_completed', message: 'Ameen marked Podcast Recording Session as completed', created_at: new Date(Date.now() - 3600000 * 1.5).toISOString() },
  { id: 'act-3', type: 'task_created', message: 'Sinan created a task from Friday Program Poster Design', created_at: new Date(Date.now() - 3600000 * 0.5).toISOString() }
];

// Helper to seed localStorage
const seedLocalStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.MESSAGES)) {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(INITIAL_MESSAGES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.IDEAS)) {
    localStorage.setItem(STORAGE_KEYS.IDEAS, JSON.stringify(INITIAL_IDEAS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.PLANS)) {
    localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(INITIAL_PLANS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ITEM_MESSAGES)) {
    localStorage.setItem(STORAGE_KEYS.ITEM_MESSAGES, JSON.stringify(INITIAL_ITEM_MESSAGES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ACTIVITIES)) {
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(INITIAL_ACTIVITIES));
  }
};

// Check fallback state
let useFallback = false;
try {
  seedLocalStorage();
} catch (e) {
  console.warn('LocalStorage not available, running in-memory fallback', e);
}

export const TeamHubService = {
  // DISCUSSION ACTIONS
  getMessages: async () => {
    if (useFallback) return TeamHubService.getLocal(STORAGE_KEYS.MESSAGES);
    try {
      const { data, error } = await supabase
        .from('team_hub_messages')
        .select('*, user:users(name, role, avatar_url)')
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data;
    } catch (err) {
      if (err.code === '42P01') {
        useFallback = true;
        return TeamHubService.getLocal(STORAGE_KEYS.MESSAGES);
      }
      throw err;
    }
  },

  sendMessage: async (content, attachments = [], parentId = null) => {
    const session = await supabase.auth.getSession();
    const currentUserId = session.data.session?.user?.id || 'user-muhammad';
    
    // Fetch profile name/role for UI consistency
    const { data: userProfile } = await supabase
      .from('users')
      .select('name, role, avatar_url')
      .eq('id', currentUserId)
      .single();

    const author = userProfile || { name: 'Muhammad Sinan', role: 'creator', avatar_url: '' };

    const newMsg = {
      user_id: currentUserId,
      content,
      attachments,
      parent_id: parentId,
      reactions: [],
      created_at: new Date().toISOString()
    };

    if (useFallback) {
      const list = TeamHubService.getLocal(STORAGE_KEYS.MESSAGES);
      const saved = { ...newMsg, id: `msg-${Date.now()}`, user: author };
      list.push(saved);
      TeamHubService.setLocal(STORAGE_KEYS.MESSAGES, list);
      TeamHubService.logActivity('message_sent', `Discussion message posted by ${author.name}`);
      return saved;
    }

    try {
      const { data, error } = await supabase
        .from('team_hub_messages')
        .insert([newMsg])
        .select('*, user:users(name, role, avatar_url)')
        .single();
      if (error) throw error;
      await TeamHubService.logActivity('message_sent', `Discussion message posted by ${author.name}`);
      return data;
    } catch (err) {
      if (err.code === '42P01') {
        useFallback = true;
        return TeamHubService.sendMessage(content, attachments, parentId);
      }
      throw err;
    }
  },

  // IDEAS ACTIONS
  getIdeas: async () => {
    if (useFallback) return TeamHubService.getLocal(STORAGE_KEYS.IDEAS);
    try {
      const { data, error } = await supabase
        .from('team_hub_ideas')
        .select('*, creator:users(name, role)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    } catch (err) {
      if (err.code === '42P01') {
        useFallback = true;
        return TeamHubService.getLocal(STORAGE_KEYS.IDEAS);
      }
      throw err;
    }
  },

  createIdea: async (title, description) => {
    const session = await supabase.auth.getSession();
    const currentUserId = session.data.session?.user?.id || 'user-muhammad';
    const { data: userProfile } = await supabase
      .from('users')
      .select('name, role')
      .eq('id', currentUserId)
      .single();

    const author = userProfile || { name: 'Muhammad Sinan', role: 'creator' };

    const newIdea = {
      title,
      description,
      status: 'open',
      created_by: currentUserId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (useFallback) {
      const list = TeamHubService.getLocal(STORAGE_KEYS.IDEAS);
      const saved = { ...newIdea, id: `idea-${Date.now()}`, discussion_count: 0, creator: author };
      list.unshift(saved);
      TeamHubService.setLocal(STORAGE_KEYS.IDEAS, list);
      TeamHubService.logActivity('idea_created', `New Idea created: ${title}`);
      return saved;
    }

    try {
      const { data, error } = await supabase
        .from('team_hub_ideas')
        .insert([newIdea])
        .select('*, creator:users(name, role)')
        .single();
      if (error) throw error;
      await TeamHubService.logActivity('idea_created', `New Idea created: ${title}`);
      return data;
    } catch (err) {
      if (err.code === '42P01') {
        useFallback = true;
        return TeamHubService.createIdea(title, description);
      }
      throw err;
    }
  },

  updateIdeaStatus: async (ideaId, status) => {
    if (useFallback) {
      const list = TeamHubService.getLocal(STORAGE_KEYS.IDEAS);
      const item = list.find(i => i.id === ideaId);
      if (item) {
        item.status = status;
        item.updated_at = new Date().toISOString();
        TeamHubService.setLocal(STORAGE_KEYS.IDEAS, list);
        TeamHubService.logActivity('idea_status_updated', `Idea status updated to ${status}: ${item.title}`);
      }
      return item;
    }
    try {
      const { data, error } = await supabase
        .from('team_hub_ideas')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', ideaId)
        .select('*, creator:users(name, role)')
        .single();
      if (error) throw error;
      await TeamHubService.logActivity('idea_status_updated', `Idea status updated to ${status}: ${data.title}`);
      return data;
    } catch (err) {
      if (err.code === '42P01') {
        useFallback = true;
        return TeamHubService.updateIdeaStatus(ideaId, status);
      }
      throw err;
    }
  },

  // PLANS ACTIONS
  getPlans: async () => {
    if (useFallback) return TeamHubService.getLocal(STORAGE_KEYS.PLANS);
    try {
      const { data, error } = await supabase
        .from('team_hub_plans')
        .select('*, creator:users(name, role)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    } catch (err) {
      if (err.code === '42P01') {
        useFallback = true;
        return TeamHubService.getLocal(STORAGE_KEYS.PLANS);
      }
      throw err;
    }
  },

  createPlan: async (title, description, priority = 'medium', linkedIdeaId = null) => {
    const session = await supabase.auth.getSession();
    const currentUserId = session.data.session?.user?.id || 'user-muhammad';
    const { data: userProfile } = await supabase
      .from('users')
      .select('name, role')
      .eq('id', currentUserId)
      .single();

    const author = userProfile || { name: 'Muhammad Sinan', role: 'creator' };

    const newPlan = {
      title,
      description,
      status: 'not_started',
      priority,
      created_by: currentUserId,
      linked_idea_id: linkedIdeaId,
      converted_task_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (useFallback) {
      const list = TeamHubService.getLocal(STORAGE_KEYS.PLANS);
      const saved = { ...newPlan, id: `plan-${Date.now()}`, creator: author };
      list.unshift(saved);
      TeamHubService.setLocal(STORAGE_KEYS.PLANS, list);
      TeamHubService.logActivity('plan_created', `New Plan created: ${title}`);
      return saved;
    }

    try {
      const { data, error } = await supabase
        .from('team_hub_plans')
        .insert([newPlan])
        .select('*, creator:users(name, role)')
        .single();
      if (error) throw error;
      await TeamHubService.logActivity('plan_created', `New Plan created: ${title}`);
      return data;
    } catch (err) {
      if (err.code === '42P01') {
        useFallback = true;
        return TeamHubService.createPlan(title, description, priority, linkedIdeaId);
      }
      throw err;
    }
  },

  updatePlanStatus: async (planId, status) => {
    if (useFallback) {
      const list = TeamHubService.getLocal(STORAGE_KEYS.PLANS);
      const item = list.find(i => i.id === planId);
      if (item) {
        item.status = status;
        item.updated_at = new Date().toISOString();
        TeamHubService.setLocal(STORAGE_KEYS.PLANS, list);
        TeamHubService.logActivity('plan_status_updated', `Plan marked as ${status}: ${item.title}`);
      }
      return item;
    }
    try {
      const { data, error } = await supabase
        .from('team_hub_plans')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', planId)
        .select('*, creator:users(name, role)')
        .single();
      if (error) throw error;
      await TeamHubService.logActivity('plan_status_updated', `Plan marked as ${status}: ${data.title}`);
      return data;
    } catch (err) {
      if (err.code === '42P01') {
        useFallback = true;
        return TeamHubService.updatePlanStatus(planId, status);
      }
      throw err;
    }
  },

  linkPlanToTask: async (planId, taskId) => {
    if (useFallback) {
      const list = TeamHubService.getLocal(STORAGE_KEYS.PLANS);
      const item = list.find(i => i.id === planId);
      if (item) {
        item.converted_task_id = taskId;
        item.updated_at = new Date().toISOString();
        TeamHubService.setLocal(STORAGE_KEYS.PLANS, list);
        TeamHubService.logActivity('plan_converted', `Plan converted to Task: ${item.title}`);
      }
      return item;
    }
    try {
      const { data, error } = await supabase
        .from('team_hub_plans')
        .update({ converted_task_id: taskId, updated_at: new Date().toISOString() })
        .eq('id', planId)
        .select('*, creator:users(name, role)')
        .single();
      if (error) throw error;
      await TeamHubService.logActivity('plan_converted', `Plan converted to Task: ${data.title}`);
      return data;
    } catch (err) {
      if (err.code === '42P01') {
        useFallback = true;
        return TeamHubService.linkPlanToTask(planId, taskId);
      }
      throw err;
    }
  },

  // ITEM SPECIFIC DISCUSSIONS (Ideas & Plans Lightweight Threads)
  getItemMessages: async (itemType, itemId) => {
    if (useFallback) {
      const list = TeamHubService.getLocal(STORAGE_KEYS.ITEM_MESSAGES);
      return list.filter(m => m.item_type === itemType && m.item_id === itemId);
    }
    try {
      const { data, error } = await supabase
        .from('team_hub_item_messages')
        .select('*, user:users(name, role)')
        .eq('item_type', itemType)
        .eq('item_id', itemId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data;
    } catch (err) {
      if (err.code === '42P01') {
        useFallback = true;
        return TeamHubService.getItemMessages(itemType, itemId);
      }
      throw err;
    }
  },

  sendItemMessage: async (itemType, itemId, content) => {
    const session = await supabase.auth.getSession();
    const currentUserId = session.data.session?.user?.id || 'user-muhammad';
    const { data: userProfile } = await supabase
      .from('users')
      .select('name, role')
      .eq('id', currentUserId)
      .single();

    const author = userProfile || { name: 'Muhammad Sinan', role: 'creator' };

    const newMsg = {
      item_type: itemType,
      item_id: itemId,
      user_id: currentUserId,
      content,
      created_at: new Date().toISOString()
    };

    if (useFallback) {
      const list = TeamHubService.getLocal(STORAGE_KEYS.ITEM_MESSAGES);
      const saved = { ...newMsg, id: `im-${Date.now()}`, user: author };
      list.push(saved);
      TeamHubService.setLocal(STORAGE_KEYS.ITEM_MESSAGES, list);
      return saved;
    }

    try {
      const { data, error } = await supabase
        .from('team_hub_item_messages')
        .insert([newMsg])
        .select('*, user:users(name, role)')
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      if (err.code === '42P01') {
        useFallback = true;
        return TeamHubService.sendItemMessage(itemType, itemId, content);
      }
      throw err;
    }
  },

  // ACTIVITY PANEL FEEDS
  getActivities: async () => {
    if (useFallback) return TeamHubService.getLocal(STORAGE_KEYS.ACTIVITIES);
    try {
      // Pull latest activity logs and map them to Team Hub visual layout
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*, user:users(name, role)')
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data.map(log => ({
        id: log.id,
        type: log.action,
        message: `${log.user?.name || 'System'} ${log.action.replace('_', ' ')}: ${log.metadata?.taskTitle || log.metadata?.title || ''}`,
        created_at: log.created_at
      }));
    } catch (err) {
      if (err.code === '42P01') {
        useFallback = true;
        return TeamHubService.getLocal(STORAGE_KEYS.ACTIVITIES);
      }
      throw err;
    }
  },

  logActivity: async (type, message) => {
    const list = TeamHubService.getLocal(STORAGE_KEYS.ACTIVITIES) || [];
    list.unshift({
      id: `act-${Date.now()}`,
      type,
      message,
      created_at: new Date().toISOString()
    });
    TeamHubService.setLocal(STORAGE_KEYS.ACTIVITIES, list.slice(0, 30));
  },

  // LOCAL STORAGE WRAPPERS
  getLocal: (key) => {
    try {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : [];
    } catch (e) {
      return [];
    }
  },

  setLocal: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      // In-memory or silent fail
    }
  }
};
