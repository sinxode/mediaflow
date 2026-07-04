// Comment Service Layer Adapter
// Connects directly to the live Supabase database.

import { supabase } from '../../lib/supabaseClient';

export const CommentService = {
  getComments: async (taskId) => {
    const { data, error } = await supabase
      .from('comments')
      .select('*, author:users(name, role, avatar_url)')
      .eq('task_id', taskId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data;
  },

  createComment: async (commentData) => {
    const { data, error } = await supabase
      .from('comments')
      .insert([commentData])
      .select('*, author:users(name, role, avatar_url)')
      .single();
    if (error) throw error;

    return data;
  },

  updateComment: async (id, message) => {
    const { data, error } = await supabase
      .from('comments')
      .update({ message, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*, author:users(name, role, avatar_url)')
      .single();
    if (error) throw error;

    return data;
  },

  deleteComment: async (commentId) => {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);
    if (error) throw error;

    return true;
  },

  getCommentsCounts: async () => {
    const { data, error } = await supabase
      .from('comments')
      .select('task_id');
    if (error) throw error;

    const counts = {};
    if (data) {
      data.forEach((c) => {
        if (c.task_id) {
          counts[c.task_id] = (counts[c.task_id] || 0) + 1;
        }
      });
    }
    return counts;
  }
};

export default CommentService;
