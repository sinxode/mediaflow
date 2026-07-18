// Computer Lab Operations Center Service Adapter
// Connects to Supabase tables for Lab Sessions, Students, Requests, and Settings.

import { supabase } from '../../lib/supabaseClient';

export const LabService = {
  // ==========================================
  // 1. LAB SESSIONS
  // ==========================================
  getSessions: async () => {
    const { data, error } = await supabase
      .from('lab_sessions')
      .select('*')
      .order('start_time', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  createSession: async (sessionData) => {
    const { data, error } = await supabase
      .from('lab_sessions')
      .insert([sessionData])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  updateSession: async (id, sessionData) => {
    const { data, error } = await supabase
      .from('lab_sessions')
      .update(sessionData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  deleteSession: async (id) => {
    const { error } = await supabase
      .from('lab_sessions')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  },

  // ==========================================
  // 2. LAB STUDENTS
  // ==========================================
  getStudents: async () => {
    const { data, error } = await supabase
      .from('lab_students')
      .select('*')
      .order('name', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  getStudentById: async (id) => {
    const { data, error } = await supabase
      .from('lab_students')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  createStudent: async (studentData) => {
    const { data, error } = await supabase
      .from('lab_students')
      .insert([studentData])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  updateStudent: async (id, studentData) => {
    const { data, error } = await supabase
      .from('lab_students')
      .update(studentData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  deleteStudent: async (id) => {
    const { error } = await supabase
      .from('lab_students')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  },

  // ==========================================
  // 3. LAB SETTINGS
  // ==========================================
  getSettings: async () => {
    const { data, error } = await supabase
      .from('lab_settings')
      .select('*');
    if (error) throw error;
    
    // Map list to key/value dictionary
    return (data || []).reduce((acc, row) => {
      acc[row.key] = row.value;
      return acc;
    }, {});
  },

  updateSetting: async (key, value) => {
    const { data, error } = await supabase
      .from('lab_settings')
      .upsert({ key, value })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // ==========================================
  // 4. REQUESTS & QUEUE FLOW
  // ==========================================
  getRequests: async () => {
    const { data, error } = await supabase
      .from('lab_requests')
      .select('*, student:lab_students(*), session:lab_sessions(*)')
      .order('request_time', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  submitRequest: async (requestData) => {
    const { student_id, requested_duration } = requestData;

    // Check duplicate active request
    const { data: activeRequest } = await supabase
      .from('lab_requests')
      .select('id')
      .eq('student_id', student_id)
      .in('status', ['pending', 'approved', 'active'])
      .maybeSingle();

    if (activeRequest) {
      throw new Error('You already have an active session or pending request.');
    }

    // Load student to calculate credit allocation
    const student = await LabService.getStudentById(student_id);
    const available = student.credit_balance || 0;
    const requested = parseInt(requested_duration) || 0;

    let creditsUsed = 0;
    let newBalance = 0;

    if (available >= requested) {
      creditsUsed = requested;
      newBalance = available - requested;
    } else {
      creditsUsed = available;
      newBalance = 0;
    }

    // Deduct credits from wallet
    await LabService.updateStudent(student_id, { credit_balance: newBalance });

    // Calculate queue position (count active pending items)
    const { count } = await supabase
      .from('lab_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    const nextQueuePos = (count || 0) + 1;

    const payload = {
      ...requestData,
      status: 'pending',
      queue_position: nextQueuePos,
      credits_used: creditsUsed,
      request_time: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('lab_requests')
      .insert([payload])
      .select()
      .single();
    if (error) throw error;

    return data;
  },

  approveRequest: async (requestId, pcName, reviewerId) => {
    const { data, error } = await supabase
      .from('lab_requests')
      .update({
        status: 'approved',
        assigned_computer: pcName,
        approval_time: new Date().toISOString(),
        reviewer_id: reviewerId || null,
        queue_position: null
      })
      .eq('id', requestId)
      .select()
      .single();
      
    if (error) throw error;

    // Shift other waiting students queue position down
    const { data: waiting } = await supabase
      .from('lab_requests')
      .select('id, queue_position')
      .eq('status', 'pending')
      .order('queue_position', { ascending: true });

    if (waiting && waiting.length > 0) {
      const updates = waiting.map((req, idx) => 
        supabase.from('lab_requests').update({ queue_position: idx + 1 }).eq('id', req.id)
      );
      await Promise.all(updates);
    }

    return data;
  },

  rejectRequest: async (requestId, notes, reviewerId) => {
    // Return credits back to student wallet since rejected!
    const { data: request } = await supabase
      .from('lab_requests')
      .select('student_id, credits_used')
      .eq('id', requestId)
      .single();

    if (request && request.credits_used > 0) {
      const student = await LabService.getStudentById(request.student_id);
      const refunded = (student.credit_balance || 0) + request.credits_used;
      await LabService.updateStudent(request.student_id, { credit_balance: refunded });
    }

    const { data, error } = await supabase
      .from('lab_requests')
      .update({
        status: 'rejected',
        notes: notes || 'Rejected by reviewer',
        queue_position: null,
        reviewer_id: reviewerId || null
      })
      .eq('id', requestId)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },

  startSession: async (requestId) => {
    const { data, error } = await supabase
      .from('lab_requests')
      .update({
        status: 'active',
        session_start_time: new Date().toISOString()
      })
      .eq('id', requestId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  endSession: async (requestId, closedByAdmin = false) => {
    const now = new Date();
    
    // Fetch request to calculate actual duration vs allocated
    const { data: request } = await supabase
      .from('lab_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (!request) throw new Error('Lab request not found.');

    const startTime = request.session_start_time ? new Date(request.session_start_time) : new Date(request.request_time);
    const actualSecs = Math.floor((now.getTime() - startTime.getTime()) / 1000);
    const actualMins = Math.max(1, Math.ceil(actualSecs / 60));
    
    const allocatedMins = request.requested_duration + request.extension_requested_duration;
    
    // Calculate if there are credits to return
    let creditsReturned = 0;
    
    // If completed earlier than expected:
    if (actualMins < allocatedMins) {
      const savedMinutes = allocatedMins - actualMins;
      
      // If we used credits, we return them!
      if (request.credits_used > 0) {
        creditsReturned = Math.min(request.credits_used, savedMinutes);
      }
    }

    // Refund credits to student wallet
    if (creditsReturned > 0) {
      const student = await LabService.getStudentById(request.student_id);
      const refunded = (student.credit_balance || 0) + creditsReturned;
      await LabService.updateStudent(request.student_id, { credit_balance: refunded });
    }

    const { data, error } = await supabase
      .from('lab_requests')
      .update({
        status: 'completed',
        session_end_time: now.toISOString(),
        actual_duration: actualMins,
        credits_returned: creditsReturned,
        notes: closedByAdmin ? 'Closed by supervisor override' : (request.notes || '')
      })
      .eq('id', requestId)
      .select()
      .single();

    if (error) throw error;

    // Increment student total sessions count
    const student = await LabService.getStudentById(request.student_id);
    await LabService.updateStudent(request.student_id, {
      total_sessions: (student.total_sessions || 0) + 1
    });

    return data;
  },

  cancelRequest: async (requestId) => {
    // Return credits back to student wallet on cancel!
    const { data: request } = await supabase
      .from('lab_requests')
      .select('student_id, credits_used')
      .eq('id', requestId)
      .single();

    if (request && request.credits_used > 0) {
      const student = await LabService.getStudentById(request.student_id);
      const refunded = (student.credit_balance || 0) + request.credits_used;
      await LabService.updateStudent(request.student_id, { credit_balance: refunded });
    }

    const { data, error } = await supabase
      .from('lab_requests')
      .update({
        status: 'cancelled',
        queue_position: null
      })
      .eq('id', requestId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // ==========================================
  // 5. EXTENSIONS FLOW
  // ==========================================
  requestExtension: async (requestId, minutes) => {
    const { data, error } = await supabase
      .from('lab_requests')
      .update({
        extension_requested_duration: minutes,
        extension_status: 'pending'
      })
      .eq('id', requestId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  approveExtension: async (requestId) => {
    // Fetch request to get student details and requested extension duration
    const { data: request, error: fetchReqError } = await supabase
      .from('lab_requests')
      .select('student_id, extension_requested_duration, credits_used')
      .eq('id', requestId)
      .single();

    if (fetchReqError || !request) {
      throw new Error(fetchReqError?.message || 'Lab request not found.');
    }

    const minutes = request.extension_requested_duration || 0;

    // Load student to calculate credit allocation
    const student = await LabService.getStudentById(request.student_id);
    const available = student.credit_balance || 0;

    let creditsToDeduct = Math.min(available, minutes);
    let newBalance = available - creditsToDeduct;

    // Deduct credits from student wallet
    await LabService.updateStudent(request.student_id, { credit_balance: newBalance });

    // Update request extension status and increment credits_used
    const { data, error } = await supabase
      .from('lab_requests')
      .update({
        extension_status: 'approved',
        credits_used: (request.credits_used || 0) + creditsToDeduct
      })
      .eq('id', requestId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  rejectExtension: async (requestId) => {
    const { data, error } = await supabase
      .from('lab_requests')
      .update({
        extension_status: 'rejected'
      })
      .eq('id', requestId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};

export default LabService;
