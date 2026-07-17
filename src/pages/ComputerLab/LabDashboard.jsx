import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Monitor, Inbox, Play, History, Users, Sliders, ExternalLink,
  Plus, Search, Clock, PlayCircle, AlertTriangle, CheckCircle2,
  Trash2, Edit2, Save, Cpu, Key, FileText, Send, UserCheck, CheckSquare, Layers,
  ChevronRight, Calendar, XCircle, RotateCcw
} from 'lucide-react';
import PageHeader from '../../components/PageHeader/PageHeader';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import LoadingSkeleton from '../../components/LoadingSkeleton/LoadingSkeleton';
import { LabService } from '../../services/lab/labService';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../auth/hooks/useAuth';
import { calculateRemainingTime, simulateQueueTimeline, formatTimerString } from '../../utils/labCalculations';
import styles from './ComputerLab.module.scss';

// Timer Component to tick every second in the UI (with battery progress bar!)
const ActiveTimerBar = ({ session }) => {
  const [pct, setPct] = useState(100);
  const [status, setStatus] = useState('normal');
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    const tick = () => {
      const calc = calculateRemainingTime(
        session.session_start_time,
        session.requested_duration,
        session.extension_requested_duration
      );
      const totalSecs = ((session.requested_duration || 0) + (session.extension_requested_duration || 0)) * 60;
      const spentSecs = totalSecs - calc.secondsRemaining;
      const ratio = Math.max(0, Math.min(100, ((totalSecs - spentSecs) / totalSecs) * 100));
      
      setPct(ratio);
      setStatus(calc.statusClass);
      setRemaining(calc.secondsRemaining);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [session]);

  return (
    <div className={styles.timerProgressionWrapper}>
      <div className={styles.batteryTrack}>
        <div className={`${styles.batteryFill} ${styles[status]}`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`${styles.countdownTimer} ${styles[status]}`}>
        {formatTimerString(remaining)}
      </span>
    </div>
  );
};

const LabDashboard = () => {
  const { role } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Data State
  const [sessions, setSessions] = useState([]);
  const [students, setStudents] = useState([]);
  const [requests, setRequests] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState(null);

  // Sub-module Search/Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [historyStudentFilter, setHistoryStudentFilter] = useState('');
  const [historyPCFilter, setHistoryPCFilter] = useState('');
  const [historyDateFilter, setHistoryDateFilter] = useState('');

  // Modals state
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [studentName, setStudentName] = useState('');
  const [studentEnrollment, setStudentEnrollment] = useState('');
  const [studentBatch, setBatch] = useState('');
  const [studentCredits, setStudentCredits] = useState(0);

  const [editingRequest, setEditingRequest] = useState(null);
  const [overridePC, setOverridePC] = useState('');
  const [overrideDuration, setOverrideDuration] = useState(30);

  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  // Settings form states
  const [pcCount, setPcCount] = useState(4);
  const [pcNamesInput, setPcNamesInput] = useState('["PC-1", "PC-2", "PC-3", "PC-4"]');
  const [warningThreshold, setWarningThreshold] = useState(5);
  const [alertThreshold, setAlertThreshold] = useState(1);
  const [overtimePolicy, setOvertimePolicy] = useState('allow');
  const [defaultCredit, setDefaultCredit] = useState(45);

  // Session Editor states
  const [editingSessionItem, setEditingSessionItem] = useState(null);
  const [sessionName, setSessionName] = useState('');
  const [sessionStart, setSessionStart] = useState('');
  const [sessionEnd, setSessionEnd] = useState('');
  const [sessionCapacity, setSessionCapacity] = useState(480);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);

  // Load unified data
  const loadLabData = async () => {
    try {
      const [sessionList, studentList, requestList, settingsList] = await Promise.all([
        LabService.getSessions(),
        LabService.getStudents(),
        LabService.getRequests(),
        LabService.getSettings()
      ]);
      setSessions(sessionList || []);
      setStudents(studentList || []);
      setRequests(requestList || []);
      setSettings(settingsList || {});
    } catch (err) {
      console.error('Failed to load lab data', err);
    } finally {
      setLoading(false);
    }
  };

  const pollLabData = async () => {
    try {
      const [sessionList, studentList, requestList] = await Promise.all([
        LabService.getSessions(),
        LabService.getStudents(),
        LabService.getRequests()
      ]);
      setSessions(sessionList || []);
      setStudents(studentList || []);
      setRequests(requestList || []);
    } catch (err) {
      console.error('Failed to poll background data', err);
    }
  };

  // Fetch config settings once on initial mount
  useEffect(() => {
    const initSettings = async () => {
      try {
        const setts = await LabService.getSettings();
        if (setts) {
          setPcCount(parseInt(setts.pc_count) || 4);
          setPcNamesInput(JSON.stringify(setts.pc_names || ["PC-1", "PC-2", "PC-3", "PC-4"]));
          setWarningThreshold(parseInt(setts.warning_threshold) || 5);
          setAlertThreshold(parseInt(setts.alert_threshold) || 1);
          setOvertimePolicy(setts.overtime_policy || 'allow');
          setDefaultCredit(setts.default_credit_allocation !== undefined && setts.default_credit_allocation !== null ? parseInt(setts.default_credit_allocation) : 45);
        }
      } catch (err) {
        console.error('Failed to initialize settings configuration', err);
      }
    };
    initSettings();
  }, []);

  useEffect(() => {
    loadLabData();
    
    // Switch to settings: populate inputs once
    if (activeTab === 'settings') {
      const loadSettingsOnce = async () => {
        try {
          const setts = await LabService.getSettings();
          if (setts) {
            setPcCount(parseInt(setts.pc_count) || 4);
            setPcNamesInput(JSON.stringify(setts.pc_names || ["PC-1", "PC-2", "PC-3", "PC-4"]));
            setWarningThreshold(parseInt(setts.warning_threshold) || 5);
            setAlertThreshold(parseInt(setts.alert_threshold) || 1);
            setOvertimePolicy(setts.overtime_policy || 'allow');
            setDefaultCredit(setts.default_credit_allocation !== undefined && setts.default_credit_allocation !== null ? parseInt(setts.default_credit_allocation) : 45);
          }
        } catch (err) {
          console.error('Failed to populate settings tab', err);
        }
      };
      loadSettingsOnce();
    }

    let interval = null;
    // Pause background polling while supervisor is editing configurations
    if (activeTab !== 'settings') {
      interval = setInterval(pollLabData, 3000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTab]);

  // Redirect role check
  useEffect(() => {
    if (role === 'reviewer' && ['history', 'students', 'settings'].includes(activeTab)) {
      setActiveTab('dashboard');
    }
  }, [role, activeTab]);

  // Filter requests
  const activeSessions = requests.filter(r => r.status === 'active');
  const pendingRequests = requests.filter(r => r.status === 'pending').sort((a,b) => (a.queue_position || 99) - (b.queue_position || 99));
  const extensionRequests = requests.filter(r => r.status === 'active' && r.extension_status === 'pending');
  const completedToday = requests.filter(r => r.status === 'completed' && r.date === new Date().toISOString().split('T')[0]).length;

  const currentPCNames = settings.pc_names || ["PC-1", "PC-2", "PC-3", "PC-4"];
  const currentPCCount = parseInt(settings.pc_count) || 4;

  const seatsOccupied = activeSessions.length;

  // Find active session
  const currentSession = sessions.find(s => {
    if (!s.is_active) return false;
    const now = new Date();
    const [sh, sm, ss] = s.start_time.split(':').map(Number);
    const [eh, em, es] = s.end_time.split(':').map(Number);
    
    const start = new Date(); start.setHours(sh, sm, ss || 0);
    const end = new Date(); end.setHours(eh, em, es || 0);
    
    return now >= start && now <= end;
  }) || sessions[0];

  // Capacity math
  const totalBookedMinutes = requests
    .filter(r => ['approved', 'active', 'completed'].includes(r.status) && r.date === new Date().toISOString().split('T')[0])
    .reduce((acc, r) => acc + r.requested_duration + r.extension_requested_duration, 0);
  
  const dailyCapacityMinutes = (currentSession?.capacity_minutes || 300);
  const capacityPercent = Math.min(100, Math.round((totalBookedMinutes / dailyCapacityMinutes) * 100));

  // Sim queue
  const simulatedQueue = simulateQueueTimeline(pendingRequests, activeSessions, currentPCNames);

  // ----------------------------------------------------
  // Supervisor Queue Actions
  // ----------------------------------------------------
  const getFirstAvailablePC = () => {
    const occupied = activeSessions.map(s => s.assigned_computer);
    const available = currentPCNames.filter(pc => !occupied.includes(pc));
    return available.length > 0 ? available[0] : currentPCNames[0] || 'PC-1';
  };

  const handleAcceptRequest = async (requestId) => {
    const pcName = getFirstAvailablePC();
    try {
      setSubmittingId(requestId);
      await LabService.approveRequest(requestId, pcName, null);
      loadLabData();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmittingId(null);
    }
  };

  const handleRejectSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!rejectingId) return;
    try {
      setSubmittingId(rejectingId);
      await LabService.rejectRequest(rejectingId, rejectReason.trim() || 'Declined by instructor', null);
      setRejectingId(null);
      setRejectReason('');
      loadLabData();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmittingId(null);
    }
  };

  const handleAcceptExtension = async (requestId) => {
    try {
      setSubmittingId(requestId + '-ext');
      await LabService.approveExtension(requestId);
      loadLabData();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmittingId(null);
    }
  };

  const handleRejectExtension = async (requestId) => {
    try {
      setSubmittingId(requestId + '-ext');
      await LabService.rejectExtension(requestId);
      loadLabData();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmittingId(null);
    }
  };

  const handleEndSession = async (requestId) => {
    if (!window.confirm('Force end this student session? Unused credits will be returned.')) return;
    try {
      setSubmittingId(requestId);
      await LabService.endSession(requestId, true);
      loadLabData();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmittingId(null);
    }
  };

  const handleStartSession = async (requestId) => {
    try {
      setSubmittingId(requestId);
      await LabService.startSession(requestId);
      loadLabData();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmittingId(null);
    }
  };

  const handleCancelSession = async (requestId) => {
    if (!window.confirm('Cancel this approved request and release the PC?')) return;
    try {
      setSubmittingId(requestId);
      await LabService.cancelRequest(requestId);
      loadLabData();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmittingId(null);
    }
  };

  const handleOpenOverride = (req) => {
    setEditingRequest(req);
    setOverridePC(req.assigned_computer || '');
    setOverrideDuration(req.requested_duration || 30);
  };

  const handleSaveOverrides = async (e) => {
    if (e) e.preventDefault();
    if (!editingRequest) return;
    try {
      setSubmittingId(editingRequest.id);
      const { error } = await supabase
        .from('lab_requests')
        .update({
          assigned_computer: overridePC,
          requested_duration: parseInt(overrideDuration)
        })
        .eq('id', editingRequest.id);
      if (error) throw error;
      setEditingRequest(null);
      loadLabData();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmittingId(null);
    }
  };

  // ----------------------------------------------------
  // Student Profiles Manager
  // ----------------------------------------------------
  const handleOpenAddStudent = () => {
    setEditingStudent(null);
    setStudentName('');
    setStudentEnrollment(`IGN-2026-${String(students.length + 1).padStart(3, '0')}`);
    setBatch('Batch Alpha');
    setStudentCredits(0);
    setIsStudentModalOpen(true);
  };

  const handleOpenEditStudent = (student) => {
    setEditingStudent(student);
    setStudentName(student.name);
    setStudentEnrollment(student.enrollment_number);
    setBatch(student.batch);
    setStudentCredits(student.credit_balance);
    setIsStudentModalOpen(true);
  };

  const handleSaveStudent = async (e) => {
    if (e) e.preventDefault();
    try {
      setSubmittingId('student-save');
      const payload = {
        name: studentName.trim(),
        enrollment_number: studentEnrollment.trim(),
        batch: studentBatch.trim(),
        credit_balance: studentCredits === '' ? 0 : (parseInt(studentCredits) ?? 0)
      };

      if (editingStudent) {
        await LabService.updateStudent(editingStudent.id, payload);
      } else {
        await LabService.createStudent(payload);
      }
      setIsStudentModalOpen(false);
      loadLabData();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmittingId(null);
    }
  };

  const handleDeleteStudent = async (student) => {
    if (!window.confirm(`Delete profile for "${student.name}"? This deletes all their timeline logs.`)) return;
    try {
      setSubmittingId(student.id);
      await LabService.deleteStudent(student.id);
      loadLabData();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmittingId(null);
    }
  };

  // ----------------------------------------------------
  // Operating Session Scheduler Actions
  // ----------------------------------------------------
  const handleOpenAddSession = () => {
    setEditingSessionItem(null);
    setSessionName('');
    setSessionStart('09:00');
    setSessionEnd('17:00');
    setSessionCapacity(480);
    setIsSessionModalOpen(true);
  };

  const handleOpenEditSession = (session) => {
    setEditingSessionItem(session);
    setSessionName(session.name);
    setSessionStart((session.start_time || '09:00').slice(0, 5));
    setSessionEnd((session.end_time || '17:00').slice(0, 5));
    setSessionCapacity(session.capacity_minutes || 480);
    setIsSessionModalOpen(true);
  };

  const handleSaveSession = async (e) => {
    if (e) e.preventDefault();
    try {
      setSubmittingId('session-save');
      const payload = {
        name: sessionName.trim(),
        start_time: sessionStart.includes(':') && sessionStart.split(':').length === 2 ? `${sessionStart}:00` : sessionStart,
        end_time: sessionEnd.includes(':') && sessionEnd.split(':').length === 2 ? `${sessionEnd}:00` : sessionEnd,
        capacity_minutes: parseInt(sessionCapacity) || 480,
        is_active: true
      };

      if (editingSessionItem) {
        await LabService.updateSession(editingSessionItem.id, payload);
      } else {
        await LabService.createSession(payload);
      }
      setIsSessionModalOpen(false);
      loadLabData();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmittingId(null);
    }
  };

  const handleDeleteSession = async (session) => {
    if (sessions.length <= 1) {
      return alert('Must keep at least 1 operating session configured.');
    }
    if (!window.confirm(`Delete operating session "${session.name}"?`)) return;
    try {
      setSubmittingId(session.id);
      await LabService.deleteSession(session.id);
      loadLabData();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmittingId(null);
    }
  };

  // ----------------------------------------------------
  // Settings Panel Actions
  // ----------------------------------------------------
  const handleSaveSettings = async (e) => {
    if (e) e.preventDefault();
    try {
      setSubmittingId('settings-save');
      let parsedPCs = [];
      try {
        parsedPCs = JSON.parse(pcNamesInput);
        if (!Array.isArray(parsedPCs)) throw new Error();
      } catch (err) {
        return alert('PC names must be a valid JSON array format, e.g. ["PC-1", "PC-2"]');
      }

      const finalPcCount = pcCount === '' ? 4 : (parseInt(pcCount) ?? 4);
      const finalWarning = warningThreshold === '' ? 5 : (parseInt(warningThreshold) ?? 5);
      const finalAlert = alertThreshold === '' ? 1 : (parseInt(alertThreshold) ?? 1);
      const finalCredit = defaultCredit === '' ? 0 : (parseInt(defaultCredit) ?? 0);

      await Promise.all([
        LabService.updateSetting('pc_count', finalPcCount),
        LabService.updateSetting('pc_names', parsedPCs),
        LabService.updateSetting('warning_threshold', finalWarning),
        LabService.updateSetting('alert_threshold', finalAlert),
        LabService.updateSetting('overtime_policy', overtimePolicy),
        LabService.updateSetting('default_credit_allocation', finalCredit)
      ]);

      alert('Ignite LabOS configurations saved.');
      loadLabData();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmittingId(null);
    }
  };

  // ----------------------------------------------------
  // Filter Mappings
  // ----------------------------------------------------
  const filteredStudents = students.filter(s => 
    (s.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.enrollment_number || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.batch || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const historyLogs = requests.filter(r => ['completed', 'rejected', 'cancelled'].includes(r.status));
  
  const filteredHistory = historyLogs.filter(log => {
    const matchesStudent = !historyStudentFilter || log.student_id === historyStudentFilter;
    const matchesPC = !historyPCFilter || log.assigned_computer === historyPCFilter;
    const matchesDate = !historyDateFilter || log.date === historyDateFilter;
    const matchesSearch = !searchQuery || 
      (log.purpose || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.student?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
      
    return matchesStudent && matchesPC && matchesDate && matchesSearch;
  }).sort((a,b) => new Date(b.request_time).getTime() - new Date(a.request_time).getTime());

  // Render Stats Row
  const renderStatsRow = () => (
    <div className={styles.seatsOverview}>
      <div className={styles.overviewCard}>
        <div className={styles.overviewIcon} style={{ backgroundColor: '#ECFDF5', color: '#10B981' }}><Play size={20} /></div>
        <div className={styles.overviewMeta}>
          <span className={styles.overviewLabel}>Running Sessions</span>
          <span className={styles.overviewValue}>{seatsOccupied} / {currentPCCount}</span>
        </div>
      </div>
      <div className={styles.overviewCard}>
        <div className={styles.overviewIcon} style={{ backgroundColor: '#F5F3FF', color: '#7C3AED' }}><Inbox size={20} /></div>
        <div className={styles.overviewMeta}>
          <span className={styles.overviewLabel}>Waiting Queue</span>
          <span className={styles.overviewValue}>{pendingRequests.length}</span>
        </div>
      </div>
      <div className={styles.overviewCard}>
        <div className={styles.overviewIcon} style={{ backgroundColor: '#EFF6FF', color: '#3B82F6' }}><CheckSquare size={20} /></div>
        <div className={styles.overviewMeta}>
          <span className={styles.overviewLabel}>Completed Today</span>
          <span className={styles.overviewValue}>{completedToday}</span>
        </div>
      </div>
      <div className={styles.overviewCard}>
        <div className={styles.overviewIcon} style={{ backgroundColor: '#FFFBEB', color: '#F59E0B' }}><Users size={20} /></div>
        <div className={styles.overviewMeta}>
          <span className={styles.overviewLabel}>Daily Capacity</span>
          <span className={styles.overviewValue}>{capacityPercent}%</span>
          <span style={{ fontSize: '10px', color: '#64748B', marginTop: '2px' }}>{totalBookedMinutes} / {dailyCapacityMinutes} mins</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.labContainer}>
      <PageHeader
        title="Computer Lab Operations Center"
        description="Ignite LabOS supervisor console to manage seat allocations, review requests, and configure settings."
        actions={
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<ExternalLink size={14} />}
            onClick={() => window.open('/#/lab/portal', '_blank')}
          >
            Open Student Portal
          </Button>
        }
      />

      {loading ? (
        <LoadingSkeleton count={3} height={80} />
      ) : (
        <>
          {renderStatsRow()}

          {/* Pill-Style Navigation Tabs (similar to Settings in mobile view) */}
          <div className={styles.tabsWrapper}>
            <div className={styles.tabsList}>
              {[
                { id: 'dashboard', label: 'Live departures board', icon: <Monitor size={14} /> },
                { id: 'requests', label: `Pending Requests (${pendingRequests.length + extensionRequests.length})`, icon: <Inbox size={14} />, highlight: pendingRequests.length + extensionRequests.length > 0 },
                role === 'creator' && { id: 'history', label: 'Session logs timeline', icon: <History size={14} /> },
                role === 'creator' && { id: 'students', label: 'Students database', icon: <Users size={14} /> },
                role === 'creator' && { id: 'settings', label: 'System Settings', icon: <Sliders size={14} /> }
              ].filter(Boolean).map(tab => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => { setActiveTab(tab.id); setSearchQuery(''); }}
                    className={`${styles.tabItemBtn} ${isActive ? styles.tabActive : ''}`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeLabTabBg"
                        className={styles.tabActiveBg}
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    {tab.icon}
                    <span className={styles.tabText}>{tab.label}</span>
                    {tab.highlight && !isActive && (
                      <span style={{ position: 'absolute', top: '4px', right: '4px', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#EF4444', zIndex: 3 }} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <AnimatePresence mode="wait">
            
            {/* TAB 1: LIVE DEPARTURES BOARD & ACTIVE OVERRIDES */}
            {activeTab === 'dashboard' && (
              <motion.div
                key="tab-dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={styles.dashboardGridLayout}
              >
                {/* Modern Airport Departures Board */}
                <div className={styles.boardSection}>
                  <div className={styles.boardHeader}>
                    <h3 className={styles.boardTitle}>
                      <Monitor size={18} />
                      Ignite Live Departures Seat Board
                    </h3>
                    <div className={styles.seatsIndicators}>
                      {currentPCNames.map(pc => {
                        const occupied = activeSessions.some(s => s.assigned_computer === pc);
                        return (
                          <div 
                            key={pc} 
                            className={`${styles.indicatorDot} ${occupied ? styles.occupied : styles.available}`}
                          />
                        );
                      })}
                    </div>
                  </div>

                  <div className={styles.airportRowsList}>
                    {currentPCNames.map(pc => {
                      const session = requests.find(s => s.assigned_computer === pc && ['approved', 'active'].includes(s.status));
                      
                      return (
                        <div key={pc} className={styles.airportRowItem}>
                          <span className={styles.pcBadge}>{pc}</span>
                          {session ? (
                            session.status === 'approved' ? (
                              <>
                                <div className={styles.occupantInfo}>
                                  <span className={styles.occupantName}>{session.student?.name}</span>
                                  <span className={styles.occupantPurpose} style={{ color: '#F59E0B' }}>
                                    Assigned PC • Awaiting student start ({session.requested_duration} mins)
                                  </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                  <span className={styles.countdownTimer} style={{ color: '#F59E0B' }}>READY</span>
                                  {role === 'creator' && (
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleStartSession(session.id)}
                                        style={{ color: '#10B981', padding: '0 8px', height: '32px' }}
                                        title="Start Session Manually"
                                      >
                                        <PlayCircle size={15} />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleCancelSession(session.id)}
                                        style={{ color: '#EF4444', padding: '0 8px', height: '32px' }}
                                        title="Cancel & Release PC"
                                      >
                                        <Trash2 size={13} />
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </>
                            ) : (
                              <>
                                <div className={styles.occupantInfo}>
                                  <span className={styles.occupantName}>{session.student?.name}</span>
                                  <span className={styles.occupantPurpose}>{session.purpose} • Alloc: {session.requested_duration}m</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                  <ActiveTimerBar session={session} />
                                  {role === 'creator' && (
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleOpenOverride(session)}
                                        style={{ color: '#38BDF8', padding: '0 8px', height: '32px' }}
                                        title="Edit Duration or Seat"
                                      >
                                        <Edit2 size={13} />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleEndSession(session.id)}
                                        style={{ color: '#EF4444', padding: '0 8px', height: '32px' }}
                                        title="End Session"
                                      >
                                        <XCircle size={13} />
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </>
                            )
                          ) : (
                            <>
                              <div className={styles.occupantInfo}>
                                <span className={styles.pcStatusAvailable}>🟢 VACANT SEAT READY</span>
                              </div>
                              <span style={{ fontSize: '12px', color: '#64748B', fontFamily: 'monospace' }}>VACANT</span>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Queue Timeline Simulator */}
                <div className={styles.queueSimulatorSection}>
                  <h3 style={{ fontSize: '14.5px', fontWeight: 'bold', color: '#1E293B', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 12px 0' }}>
                    <Clock size={16} style={{ color: '#7C3AED' }} />
                    Waitlist Timeline Estimates
                  </h3>

                  {simulatedQueue.length > 0 ? (
                    <div className={styles.queueList}>
                      {simulatedQueue.map((req, idx) => {
                        const estTime = new Date(req.estimated_entry_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        return (
                          <div key={req.id} className={`${styles.queueItemCard} ${styles[req.status]}`}>
                            <span className={styles.queueIndex}>{idx + 1}</span>
                            <div className={styles.queueDetails}>
                              <span className={styles.queueName}>{req.student?.name}</span>
                              <span className={styles.queuePurpose}>
                                {req.purpose} • <span style={{ color: '#7C3AED', fontWeight: 'bold' }}>Simulated: {req.simulated_computer}</span>
                              </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                              <span className={styles.queueDuration}>{req.requested_duration} mins</span>
                              <div className={styles.queueTimeEstimation}>
                                <span className={styles.estTime}>≈ {estTime}</span>
                                <span className={styles.estLabel}>EST. ENTRY</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '16px', color: '#64748B', fontSize: '13px' }}>
                      No waiting requests. All queue paths nominal.
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* TAB 2: STUDENT REQUESTS & EXTENSIONS */}
            {activeTab === 'requests' && (
              <motion.div
                key="tab-requests"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}
              >
                {/* Extensions List */}
                {extensionRequests.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <h4 style={{ margin: 0, fontSize: '12px', fontWeight: 'bold', color: '#EF4444', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      ⚡ Extension Overtime Approvals
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
                      {extensionRequests.map(req => (
                        <div key={req.id} className={styles.taskCardRow} style={{ borderLeft: '4px solid #EF4444' }}>
                          <div className={styles.iconContainer} style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', color: '#EF4444' }}>
                            <AlertTriangle size={20} />
                          </div>
                          <div className={styles.mainInfo}>
                            <div className={styles.titleWrapper}>
                              <h4 className={styles.title}>{req.student?.name}</h4>
                            </div>
                            <span className={styles.descriptionPreview}>Active PC: <strong>{req.assigned_computer}</strong></span>
                            <div className={styles.metadata}>
                              <span className={styles.metaItem}>
                                <span className={styles.dot} style={{ backgroundColor: '#EF4444' }} />
                                Requested: +{req.extension_requested_duration} mins extra time
                              </span>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <Button variant="secondary" size="sm" style={{ color: '#EF4444', borderColor: '#EF4444', height: '32px' }} onClick={() => handleRejectExtension(req.id)}>Decline</Button>
                            <Button variant="primary" size="sm" style={{ backgroundColor: '#EF4444', borderColor: '#EF4444', height: '32px' }} onClick={() => handleAcceptExtension(req.id)}>Accept</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Entry Requests List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <h4 style={{ margin: 0, fontSize: '12px', fontWeight: 'bold', color: '#7C3AED', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    📥 Pending Check-in requests
                  </h4>

                  {pendingRequests.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                      {pendingRequests.map(req => {
                        const waitTime = Math.floor((new Date().getTime() - new Date(req.request_time).getTime()) / 60000);
                        
                        return (
                          <div key={req.id} className={styles.taskCardRow}>
                            <div className={styles.iconContainer}>
                              <Inbox size={20} />
                            </div>
                            <div className={styles.mainInfo}>
                              <div className={styles.titleWrapper}>
                                <h4 className={styles.title}>{req.student?.name}</h4>
                                <span style={{ fontSize: '10px', color: '#7C3AED', backgroundColor: 'rgba(124, 58, 237, 0.05)', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' }}>
                                  Position #{req.queue_position}
                                </span>
                              </div>
                              <p className={styles.descriptionPreview}>Purpose: <strong>{req.purpose}</strong></p>
                              <div className={styles.metadata}>
                                <span className={styles.metaItem}>
                                  <span className={styles.dot} />
                                  Duration: {req.requested_duration} mins
                                </span>
                                <span className={styles.metaDivider}>•</span>
                                <span className={styles.metaItem}>
                                  Wallet Consumed: {req.credits_used || 0} mins
                                </span>
                                <span className={styles.metaDivider}>•</span>
                                <span className={styles.metaItem}>
                                  Waiting: {waitTime} mins ago
                                </span>
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <Button variant="secondary" size="sm" style={{ color: '#EF4444', borderColor: '#EF4444', height: '36px' }} onClick={() => setRejectingId(req.id)}>Reject</Button>
                              <Button variant="primary" size="sm" style={{ height: '36px' }} onClick={() => handleAcceptRequest(req.id)} loading={submittingId === req.id}>Accept & Auto PC</Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '48px 24px', backgroundColor: '#FFFFFF', borderRadius: 20, border: '1px solid rgba(226, 232, 240, 0.8)' }}>
                      <CheckCircle2 size={36} style={{ color: '#10B981', marginBottom: 12 }} />
                      <h4 style={{ margin: 0, fontSize: '14.5px', color: '#1E293B' }}>Queue Clear!</h4>
                      <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748B' }}>No student entry requests waiting.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* TAB 3: AUDIT TIMELINE LOGS */}
            {activeTab === 'history' && (
              <motion.div
                key="tab-history"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}
              >
                {/* History Filter Toolbar */}
                <div className={styles.filterToolbar}>
                  <div className={styles.searchWrapper}>
                    <Search size={15} />
                    <input
                      type="text"
                      className={styles.searchInput}
                      placeholder="Search student or purpose..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className={styles.filtersGroup}>
                    <select
                      className={styles.filterSelect}
                      value={historyStudentFilter}
                      onChange={(e) => setHistoryStudentFilter(e.target.value)}
                    >
                      <option value="">All Students</option>
                      {students.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                    <select
                      className={styles.filterSelect}
                      value={historyPCFilter}
                      onChange={(e) => setHistoryPCFilter(e.target.value)}
                    >
                      <option value="">All PCs</option>
                      {currentPCNames.map(pc => (
                        <option key={pc} value={pc}>{pc}</option>
                      ))}
                    </select>
                    <input
                      type="date"
                      className={styles.filterDateInput}
                      value={historyDateFilter}
                      onChange={(e) => setHistoryDateFilter(e.target.value)}
                    />
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      style={{ height: '38px', borderRadius: '10px' }} 
                      leftIcon={<RotateCcw size={14} />}
                      onClick={() => { setHistoryStudentFilter(''); setHistoryPCFilter(''); setHistoryDateFilter(''); setSearchQuery(''); }}
                    >
                      Reset
                    </Button>
                  </div>
                </div>

                {/* History list */}
                {filteredHistory.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {filteredHistory.map(log => {
                      const isCompleted = log.status === 'completed';
                      const isRejected = log.status === 'rejected';
                      
                      let statusColor = '#64748B';
                      if (isCompleted) statusColor = '#10B981';
                      if (isRejected) statusColor = '#EF4444';

                      return (
                        <div key={log.id} className={styles.taskCardRow} style={{ borderLeft: `4px solid ${statusColor}` }}>
                          <div className={styles.iconContainer} style={{ backgroundColor: `${statusColor}0D`, color: statusColor }}>
                            <History size={20} />
                          </div>
                          <div className={styles.mainInfo}>
                            <div className={styles.titleWrapper}>
                              <span style={{ fontWeight: 'bold', color: '#1E293B', fontSize: '14.5px' }}>{log.student?.name}</span>
                              <span style={{ fontSize: '10px', color: statusColor, backgroundColor: `${statusColor}0D`, padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                                {log.status}
                              </span>
                            </div>
                            <span className={styles.descriptionPreview}>Purpose: {log.purpose}</span>
                            <div className={styles.metadata}>
                              <span className={styles.metaItem}>
                                <span className={styles.dot} style={{ backgroundColor: statusColor }} />
                                Seat: {log.assigned_computer || 'N/A'}
                              </span>
                              <span className={styles.metaDivider}>•</span>
                              <span className={styles.metaItem}>
                                Duration: {log.actual_duration || log.requested_duration} mins
                              </span>
                              <span className={styles.metaDivider}>•</span>
                              <span className={styles.metaItem}>
                                Date: {log.date}
                              </span>
                            </div>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'right', fontSize: '12px', color: '#64748B' }}>
                            {log.credits_used > 0 && <span style={{ color: '#4F46E5' }}>Used: -{log.credits_used}m</span>}
                            {log.credits_returned > 0 && <span style={{ color: '#10B981' }}>Refunded: +{log.credits_returned}m</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '32px', color: '#64748B', fontSize: '13px' }}>
                    No audit records found matching filters.
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB 4: STUDENTS DATABASE */}
            {activeTab === 'students' && (
              <motion.div
                key="tab-students"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}
              >
                {/* Search / Add toolbar */}
                <div style={{ display: 'flex', gap: '16px', width: '100%', alignItems: 'center' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                    <input
                      type="text"
                      className={styles.searchInput}
                      style={{ paddingLeft: '32px', height: '38px', width: '100%', fontSize: '13px' }}
                      placeholder="Search students database..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button variant="primary" size="sm" style={{ height: '38px' }} leftIcon={<Plus size={14} />} onClick={handleOpenAddStudent}>Add Student</Button>
                </div>

                {/* Students list */}
                {filteredStudents.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                    {filteredStudents.map(student => (
                      <Card key={student.id} padding={true}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <h4 style={{ margin: 0, fontSize: '15.5px', color: '#1E293B', fontWeight: 'bold' }}>{student.name}</h4>
                            <span style={{ fontSize: '11px', color: '#64748B' }}>Code: {student.enrollment_number} • {student.batch}</span>
                          </div>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button onClick={() => handleOpenEditStudent(student)} style={{ background: 'none', border: 'none', color: '#7C3AED', cursor: 'pointer', padding: '4px' }} title="Edit Credits"><Edit2 size={13} /></button>
                            <button onClick={() => handleDeleteStudent(student)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '4px' }} title="Delete Profile"><Trash2 size={13} /></button>
                          </div>
                        </div>
                        
                        <div style={{ marginTop: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748B' }}>
                            <span>Wallet Credits</span>
                            <span style={{ color: '#7C3AED', fontWeight: 'bold' }}>{student.credit_balance} / 45 mins</span>
                          </div>
                          <div className={styles.progressWalletTrack}>
                            <div className={styles.progressWalletFill} style={{ width: `${Math.min(100, (student.credit_balance / 45) * 100)}%` }} />
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '16px', borderTop: '1px solid #F1F5F9', marginTop: '10px', paddingTop: '10px', fontSize: '11px', color: '#64748B' }}>
                          <span>Total Lab Visits: <strong>{student.total_sessions || 0} visits</strong></span>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '32px', color: '#64748B', fontSize: '13px' }}>
                    No student profiles matched your query.
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB 5: LAB CONFIGURATION SETTINGS */}
            {activeTab === 'settings' && (
              <motion.div
                key="tab-settings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                style={{ width: '100%', maxWidth: '600px' }}
              >
                <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* Operating Sessions Scheduler Card */}
                  <Card padding={true} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ fontSize: '13px', fontWeight: 'bold', color: '#7C3AED', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                        <Clock size={15} /> Operating Sessions & Hours
                      </h3>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        leftIcon={<Plus size={12} />}
                        onClick={handleOpenAddSession}
                        style={{ height: '28px', padding: '0 10px', fontSize: '11px' }}
                      >
                        Add Session
                      </Button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {sessions.map(sess => (
                        <div 
                          key={sess.id} 
                          className={styles.taskCardRow}
                          style={{ padding: '10px 14px', borderLeft: sess.is_active ? '4px solid #10B981' : '4px solid #94A3B8' }}
                        >
                          <div className={styles.mainInfo}>
                            <h4 className={styles.title} style={{ fontSize: '13.5px' }}>{sess.name}</h4>
                            <span style={{ fontSize: '11.5px', color: '#64748B' }}>
                              Time: {sess.start_time.slice(0, 5)} - {sess.end_time.slice(0, 5)} • Daily Capacity: {sess.capacity_minutes || 0} mins
                            </span>
                          </div>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button 
                              type="button" 
                              onClick={() => handleOpenEditSession(sess)} 
                              style={{ background: 'none', border: 'none', color: '#7C3AED', cursor: 'pointer', padding: '4px' }}
                            >
                              <Edit2 size={13} />
                            </button>
                            <button 
                              type="button" 
                              onClick={() => handleDeleteSession(sess)} 
                              style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '4px' }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                  <Card padding={true} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h3 style={{ fontSize: '13px', fontWeight: 'bold', color: '#7C3AED', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                      <Cpu size={15} /> Seat Capacity Settings
                    </h3>
                    <div className={styles.row2}>
                      <div className={styles.inputGroup}>
                        <label>Active Seats Count</label>
                        <input type="number" min="1" max="24" className={styles.inputField} value={pcCount} onChange={(e) => setPcCount(e.target.value === '' ? '' : parseInt(e.target.value))} />
                      </div>
                      <div className={styles.inputGroup}>
                        <label>Computer Names JSON Array</label>
                        <input type="text" className={styles.inputField} value={pcNamesInput} onChange={(e) => setPcNamesInput(e.target.value)} />
                      </div>
                    </div>
                  </Card>

                  <Card padding={true} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h3 style={{ fontSize: '13px', fontWeight: 'bold', color: '#7C3AED', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                      <Clock size={15} /> Warning Alert Thresholds
                    </h3>
                    <div className={styles.row2}>
                      <div className={styles.inputGroup}>
                        <label>Yellow Status (Mins remaining)</label>
                        <input type="number" min="1" className={styles.inputField} value={warningThreshold} onChange={(e) => setWarningThreshold(e.target.value === '' ? '' : parseInt(e.target.value))} />
                      </div>
                      <div className={styles.inputGroup}>
                        <label>Orange Status (Mins remaining)</label>
                        <input type="number" min="1" className={styles.inputField} value={alertThreshold} onChange={(e) => setAlertThreshold(e.target.value === '' ? '' : parseInt(e.target.value))} />
                      </div>
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Overtime Policy</label>
                      <select className={styles.selectField} value={overtimePolicy} onChange={(e) => setOvertimePolicy(e.target.value)}>
                        <option value="allow">Allow overtime (keeps ticking upwards in Red)</option>
                        <option value="kick">Block overtime (closes session automatically, future-ready)</option>
                      </select>
                    </div>
                  </Card>

                  <Card padding={true} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h3 style={{ fontSize: '13px', fontWeight: 'bold', color: '#7C3AED', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                      <Key size={15} /> Wallet Allocation limits
                    </h3>
                    <div className={styles.inputGroup}>
                      <label>Default Starting Credit Wallet (Minutes)</label>
                      <input type="number" min="0" className={styles.inputField} value={defaultCredit} onChange={(e) => setDefaultCredit(e.target.value === '' ? '' : parseInt(e.target.value))} />
                    </div>
                  </Card>

                  <Button type="submit" variant="primary" size="md" loading={submittingId === 'settings-save'} style={{ height: '44px', borderRadius: '12px' }}>Save Lab Configuration</Button>
                </form>
              </motion.div>
            )}

          </AnimatePresence>
        </>
      )}

      {/* ----------------------------------------------------
          MODALS & DIALOGS
      ---------------------------------------------------- */}

      {/* Student Profile Modal */}
      {isStudentModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '20px', width: '95%', maxWidth: '380px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 'bold', color: '#1E293B' }}>{editingStudent ? 'Edit Student Balance' : 'Add Student Profile'}</h3>
            <form onSubmit={handleSaveStudent} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className={styles.inputGroup}>
                <label>Student Name</label>
                <input type="text" required className={styles.inputField} placeholder="Nihal..." value={studentName} onChange={(e) => setStudentName(e.target.value)} />
              </div>
              <div className={styles.inputGroup}>
                <label>Enrollment Code</label>
                <input type="text" required className={styles.inputField} placeholder="IGN-2026-..." value={studentEnrollment} onChange={(e) => setStudentEnrollment(e.target.value)} />
              </div>
              <div className={styles.inputGroup}>
                <label>Class Batch</label>
                <input type="text" required className={styles.inputField} placeholder="Batch Alpha..." value={studentBatch} onChange={(e) => setBatch(e.target.value)} />
              </div>
              <div className={styles.inputGroup}>
                <label>Wallet Credit Balance (mins)</label>
                <input type="number" min="0" required className={styles.inputField} value={studentCredits} onChange={(e) => setStudentCredits(e.target.value === '' ? '' : parseInt(e.target.value))} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
                <Button variant="ghost" size="sm" type="button" onClick={() => setIsStudentModalOpen(false)}>Cancel</Button>
                <Button variant="primary" size="sm" type="submit" loading={submittingId === 'student-save'}>Save Profile</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PC & Duration Override Modal */}
      {editingRequest && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '20px', width: '95%', maxWidth: '380px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 'bold', color: '#1E293B' }}>Override Seat Session</h3>
            <form onSubmit={handleSaveOverrides} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className={styles.inputGroup}>
                <label>Change Seat Allocation</label>
                <select className={styles.selectField} value={overridePC} onChange={(e) => setOverridePC(e.target.value)}>
                  {currentPCNames.map(pc => (
                    <option key={pc} value={pc}>{pc}</option>
                  ))}
                </select>
              </div>
              <div className={styles.inputGroup}>
                <label>Change Allocated Time (Mins)</label>
                <input type="number" min="5" required className={styles.inputField} value={overrideDuration} onChange={(e) => setOverrideDuration(parseInt(e.target.value) || 30)} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
                <Button variant="ghost" size="sm" type="button" onClick={() => setEditingRequest(null)}>Cancel</Button>
                <Button variant="primary" size="sm" type="submit" loading={submittingId === editingRequest.id}>Save Overrides</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Rejection reason modal */}
      {rejectingId && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '20px', width: '95%', maxWidth: '380px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 'bold', color: '#1E293B' }}>Decline Lab entry</h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#64748B' }}>Provide a feedback message for the student's request status card.</p>
            <form onSubmit={handleRejectSubmit}>
              <input type="text" required className={styles.inputField} style={{ width: '100%', marginBottom: '16px' }} placeholder="e.g. Lab at capacity, try again later..." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} autoFocus />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <Button variant="ghost" size="sm" type="button" onClick={() => setRejectingId(null)}>Cancel</Button>
                <Button variant="primary" size="sm" type="submit" style={{ backgroundColor: '#EF4444', borderColor: '#EF4444' }} loading={submittingId === rejectingId}>Decline Entry</Button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Session Configuration Modal */}
      {isSessionModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '20px', width: '95%', maxWidth: '380px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 'bold', color: '#1E293B' }}>
              {editingSessionItem ? 'Edit Operating Session' : 'Add Operating Session'}
            </h3>
            <form onSubmit={handleSaveSession} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className={styles.inputGroup}>
                <label>Session Name</label>
                <input 
                  type="text" 
                  required 
                  className={styles.inputField} 
                  placeholder="e.g. Regular Daily Session" 
                  value={sessionName} 
                  onChange={(e) => setSessionName(e.target.value)} 
                />
              </div>
              <div className={styles.row2}>
                <div className={styles.inputGroup}>
                  <label>Start Time</label>
                  <input 
                    type="time" 
                    required 
                    className={styles.inputField} 
                    value={sessionStart} 
                    onChange={(e) => setSessionStart(e.target.value)} 
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>End Time</label>
                  <input 
                    type="time" 
                    required 
                    className={styles.inputField} 
                    value={sessionEnd} 
                    onChange={(e) => setSessionEnd(e.target.value)} 
                  />
                </div>
              </div>
              <div className={styles.inputGroup}>
                <label>Capacity duration (Minutes)</label>
                <input 
                  type="number" 
                  min="30" 
                  max="1440" 
                  required 
                  className={styles.inputField} 
                  value={sessionCapacity} 
                  onChange={(e) => setSessionCapacity(parseInt(e.target.value) || 480)} 
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
                <Button variant="ghost" size="sm" type="button" onClick={() => setIsSessionModalOpen(false)}>Cancel</Button>
                <Button variant="primary" size="sm" type="submit" loading={submittingId === 'session-save'}>Save Session</Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default LabDashboard;
