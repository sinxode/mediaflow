import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, CheckCircle2, Clock, AlertTriangle, UserCheck, 
  LogIn, LogOut, Search, PlusCircle, RefreshCw, Send
} from 'lucide-react';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import LoadingSkeleton from '../../components/LoadingSkeleton/LoadingSkeleton';
import { LabService } from '../../services/lab/labService';
import { AuthService } from '../../services/auth/authService';
import { calculateRemainingTime, simulateQueueTimeline, formatTimerString } from '../../utils/labCalculations';
import styles from './ComputerLab.module.scss';

const StudentPortal = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [requests, setRequests] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedSessionId, setSelectedSessionId] = useState('');

  // Active student selection on the terminal
  const [activeStudent, setActiveStudent] = useState(null);
  const [searchStudentTerm, setSearchStudentTerm] = useState('');
  
  // Request Form State
  const [purpose, setPurpose] = useState('');
  const [duration, setDuration] = useState(30);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Active student session countdown
  const [activeRequestDetails, setActiveRequestDetails] = useState(null);
  const [timeRemainingSecs, setTimeRemainingSecs] = useState(0);
  const [timerStatusClass, setTimerStatusClass] = useState('normal');

  // Load all operational data
  const loadPortalData = async () => {
    try {
      const [studentList, sessionList, requestList, settingsList] = await Promise.all([
        LabService.getStudents(),
        LabService.getSessions(),
        LabService.getRequests(),
        LabService.getSettings()
      ]);
      setStudents(studentList || []);
      const activeSessionsList = sessionList || [];
      setSessions(activeSessionsList);
      setRequests(requestList || []);
      setSettings(settingsList || {});
      
      // Auto-assign default selectedSessionId if empty
      setSelectedSessionId(prev => {
        if (prev) return prev;
        const now = new Date();
        const current = activeSessionsList.find(s => {
          if (!s.is_active) return false;
          const [sh, sm, ss] = s.start_time.split(':').map(Number);
          const [eh, em, es] = s.end_time.split(':').map(Number);
          const start = new Date(); start.setHours(sh, sm, ss || 0);
          const end = new Date(); end.setHours(eh, em, es || 0);
          return now >= start && now <= end;
        }) || activeSessionsList[0];
        return current ? current.id : '';
      });
    } catch (err) {
      console.error('Failed to load lab portal data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPortalData();
    // Fast polling fallback for real-time status board updates
    const interval = setInterval(loadPortalData, 3000);
    return () => clearInterval(interval);
  }, []);

  // Sync active student status details
  useEffect(() => {
    if (!activeStudent) {
      setActiveRequestDetails(null);
      return;
    }
    
    // Find active or pending request for selected student
    const activeReq = requests.find(r => 
      r.student_id === activeStudent.id && 
      ['pending', 'approved', 'active'].includes(r.status)
    );

    setActiveRequestDetails(activeReq || null);
  }, [activeStudent, requests]);

  // Tick countdown timer for active session
  useEffect(() => {
    if (!activeRequestDetails || activeRequestDetails.status !== 'active') return;

    const timer = setInterval(() => {
      const calc = calculateRemainingTime(
        activeRequestDetails.session_start_time,
        activeRequestDetails.requested_duration,
        activeRequestDetails.extension_requested_duration
      );
      setTimeRemainingSecs(calc.secondsRemaining);
      setTimerStatusClass(calc.statusClass);
    }, 1000);

    return () => clearInterval(timer);
  }, [activeRequestDetails]);

  // Get active session metrics
  const activeSessions = requests.filter(r => r.status === 'active');
  const pendingRequests = requests.filter(r => r.status === 'pending').sort((a,b) => (a.queue_position || 99) - (b.queue_position || 99));
  
  const pcCount = parseInt(settings.pc_count) || 4;
  const pcNames = settings.pc_names || ["PC-1", "PC-2", "PC-3", "PC-4"];
  const seatsOccupied = activeSessions.length;
  
  // Find current selected operating session (fallback to first session)
  const currentSession = sessions.find(s => s.id === selectedSessionId) || sessions[0];

  // Calculate daily capacity progress
  const totalBookedMinutes = requests
    .filter(r => ['approved', 'active', 'completed'].includes(r.status) && r.date === new Date().toISOString().split('T')[0])
    .reduce((acc, r) => acc + r.requested_duration + r.extension_requested_duration, 0);
  
  const dailyCapacityMinutes = (currentSession?.capacity_minutes || 300);
  const capacityPercent = Math.min(100, Math.round((totalBookedMinutes / dailyCapacityMinutes) * 100));

  // Run queue simulations
  const simulatedQueue = simulateQueueTimeline(pendingRequests, activeSessions, pcNames);

  // Submit Request
  const handleRequestSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!activeStudent) return;
    if (!purpose.trim()) return alert('Please enter the purpose of practice.');

    try {
      setSubmitting(true);
      await LabService.submitRequest({
        student_id: activeStudent.id,
        session_id: currentSession.id,
        purpose: purpose.trim(),
        requested_duration: parseInt(duration),
        notes: notes.trim(),
        status: 'pending'
      });

      setPurpose('');
      setNotes('');
      loadPortalData();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Start Session trigger
  const handleStartSession = async () => {
    if (!activeRequestDetails) return;
    try {
      setSubmitting(true);
      await LabService.startSession(activeRequestDetails.id);
      loadPortalData();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // End Session trigger
  const handleEndSession = async () => {
    if (!activeRequestDetails) return;
    if (!window.confirm('Are you sure you want to end your lab session now?')) return;
    try {
      setSubmitting(true);
      await LabService.endSession(activeRequestDetails.id);
      setActiveStudent(null);
      loadPortalData();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Request Extension (+10 mins)
  const handleRequestExtension = async () => {
    if (!activeRequestDetails) return;
    try {
      setSubmitting(true);
      await LabService.requestExtension(activeRequestDetails.id, 10);
      alert('Extension request sent to reviewers.');
      loadPortalData();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!activeRequestDetails) return;
    if (!window.confirm('Cancel your pending lab entry request?')) return;
    try {
      setSubmitting(true);
      await LabService.cancelRequest(activeRequestDetails.id);
      loadPortalData();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePlatformLogout = async () => {
    if (!window.confirm('Sign out of the computer lab terminal?')) return;
    try {
      await AuthService.signOut();
      navigate('/login', { replace: true });
    } catch (err) {
      alert('Logout failed: ' + err.message);
    }
  };

  // Filter student selection term
  const filteredStudents = students.filter(s => 
    (s.name || '').toLowerCase().includes(searchStudentTerm.toLowerCase()) ||
    (s.enrollment_number || '').toLowerCase().includes(searchStudentTerm.toLowerCase())
  );

  return (
    <div className={styles.portalWrapper}>
      <AnimatePresence mode="wait">
        
        {/* VIEW A: SELECT STUDENT TERMINAL */}
        {!activeStudent ? (
          <motion.div
            key="selection-screen"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={styles.portalContainer}
          >
            <div className={styles.portalLogo}>
              <img src="/logo.png" alt="Ignite Lab Logo" />
              <span>IGNITE COMPUTER LAB</span>
            </div>

            {/* Current Session Selector Banner */}
            {sessions.length > 0 && (
              <div className={styles.portalSessionBanner} style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span className={styles.timeTitle}>Select Operating Session</span>
                  <span style={{ fontSize: '12.5px', color: '#64748B', fontWeight: 'bold' }}>
                    {currentSession ? `${currentSession.start_time.slice(0,5)} – ${currentSession.end_time.slice(0,5)}` : ''}
                  </span>
                </div>
                <select
                  className={styles.portalSelect}
                  value={selectedSessionId}
                  onChange={(e) => setSelectedSessionId(e.target.value)}
                  style={{
                    width: '100%',
                    height: '40px',
                    borderRadius: '10px',
                    border: '1px solid #E2E8F0',
                    padding: '0 10px',
                    fontSize: '13.5px',
                    fontWeight: 'bold',
                    color: '#1E293B',
                    backgroundColor: '#FFFFFF',
                    outline: 'none',
                    cursor: 'pointer',
                    marginBottom: '12px'
                  }}
                >
                  {sessions.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                <div className={styles.capacityProgress} style={{ maxWidth: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '11px', color: '#64748B', marginBottom: '4px' }}>
                    <span>Daily Bookings Load</span>
                    <span>Seats: {seatsOccupied} / {pcCount} occupied</span>
                  </div>
                  <div className={styles.customProgressBar}>
                    <div className={styles.progressBarFill} style={{ width: `${Math.min(100, (seatsOccupied / pcCount) * 100)}%` }} />
                  </div>
                </div>
              </div>
            )}

            <div className={styles.portalDivider} />

            {/* Student Search & List */}
            <div className={styles.portalForm}>
              <div className={styles.inputGroup}>
                <label>Select Student Name to Check-in / Request Entry</label>
                <div style={{ position: 'relative' }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                  <input
                    type="text"
                    className={styles.searchInput}
                    style={{ paddingLeft: '36px', height: '44px', width: '100%', borderRadius: '12px', border: '1px solid #CBD5E1' }}
                    placeholder="Search by name or enrollment code..."
                    value={searchStudentTerm}
                    onChange={(e) => setSearchStudentTerm(e.target.value)}
                  />
                </div>
              </div>

              {loading ? (
                <LoadingSkeleton count={3} height={50} />
              ) : (
                <div style={{ maxHeight: '250px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', paddingRight: '4px' }}>
                  {filteredStudents.map(student => (
                    <button
                      key={student.id}
                      onClick={() => setActiveStudent(student)}
                      style={{
                        padding: '12px 16px',
                        borderRadius: '12px',
                        border: '1px solid #E2E8F0',
                        backgroundColor: '#FFFFFF',
                        color: '#1E293B',
                        fontWeight: '600',
                        textAlign: 'left',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#7C3AED'; e.currentTarget.style.backgroundColor = '#F5F3FF'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.backgroundColor = '#FFFFFF'; }}
                    >
                      <span>{student.name}</span>
                      <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 'normal' }}>
                        {student.enrollment_number} • Credit: {student.credit_balance} mins
                      </span>
                    </button>
                  ))}
                  {filteredStudents.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '16px', color: '#64748B', fontSize: '13px' }}>
                      No students found matching your search.
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '100%' }}>
              <span style={{ fontSize: '11px', color: '#64748B' }}>Ignite Computer LabOS terminal interface</span>
              <button 
                type="button" 
                onClick={handlePlatformLogout}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: '#EF4444', 
                  fontSize: '12px', 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '4px',
                  fontWeight: '600',
                  opacity: 0.8,
                  padding: '4px 8px',
                  borderRadius: '6px',
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                onMouseLeave={(e) => e.currentTarget.style.opacity = 0.8}
              >
                <LogOut size={12} /> Sign Out Terminal
              </button>
            </div>
          </motion.div>
        ) : (
          
          /* VIEW B: STUDENT WORKFLOW PORTAL (REQUEST/SESSION STATES) */
          <motion.div
            key="portal-screen"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={styles.portalContainer}
          >
            {/* Header with back button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '18px', fontWeight: '800', color: '#1E293B' }}>{activeStudent.name}</span>
                <span style={{ fontSize: '11px', color: '#64748B' }}>Enrolment: {activeStudent.enrollment_number}</span>
              </div>
              <Button 
                variant="secondary" 
                size="sm" 
                leftIcon={<LogOut size={14} />} 
                onClick={() => {
                  setActiveStudent(null);
                  setPurpose('');
                  setNotes('');
                }}
              >
                Log Out
              </Button>
            </div>

            <div className={styles.portalDivider} />

            {/* Conditional Flow based on Active Request */}
            {!activeRequestDetails ? (
              
              /* 1. Request form (If no active requests) */
              <form onSubmit={handleRequestSubmit} className={styles.portalForm}>
                <div style={{ backgroundColor: '#F5F3FF', padding: '12px 16px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#4F46E5', fontWeight: 'bold' }}>Credit Wallet Balance</span>
                  <span style={{ fontSize: '16px', color: '#4F46E5', fontWeight: '800' }}>{activeStudent.credit_balance || 0} mins available</span>
                </div>

                <div className={styles.inputGroup}>
                  <label>Practice Purpose</label>
                  <input
                    type="text"
                    required
                    className={styles.inputField}
                    placeholder="e.g. Photoshop assignment, Excel practice..."
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label>Requested Duration</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '4px' }}>
                    {[15, 30, 45, 60, 90, 120].map((mins) => {
                      const isSelected = duration === mins;
                      const exceedsCredit = mins > (activeStudent.credit_balance || 0);
                      return (
                        <button
                          key={mins}
                          type="button"
                          onClick={() => setDuration(mins)}
                          style={{
                            flex: '1 1 calc(33.33% - 8px)',
                            minWidth: '70px',
                            padding: '10px 8px',
                            borderRadius: '12px',
                            fontSize: '12.5px',
                            fontWeight: '700',
                            border: '1.5px solid',
                            borderColor: isSelected ? '#7C3AED' : '#E2E8F0',
                            backgroundColor: isSelected ? '#F5F3FF' : '#FFFFFF',
                            color: isSelected ? '#7C3AED' : exceedsCredit ? '#94A3B8' : '#1E293B',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '2px',
                            boxShadow: isSelected ? '0 4px 6px -1px rgba(124, 58, 237, 0.1)' : 'none'
                          }}
                        >
                          <span>{mins}m</span>
                          {exceedsCredit && (
                            <span style={{ fontSize: '8px', fontWeight: 'bold', color: '#EF4444', textTransform: 'uppercase' }}>Over limit</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px' }}>
                    <div style={{ position: 'relative', width: '110px' }}>
                      <input
                        type="number"
                        min="5"
                        max="180"
                        required
                        className={styles.inputField}
                        style={{ paddingRight: '40px', height: '38px', borderRadius: '12px', fontSize: '13px' }}
                        value={duration}
                        onChange={(e) => setDuration(parseInt(e.target.value) || 30)}
                      />
                      <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', color: '#64748B', fontWeight: 'bold' }}>min</span>
                    </div>
                    <span style={{ fontSize: '12px', color: '#64748B' }}>
                      Or specify custom minutes
                    </span>
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label>Supervisor Notes (Optional)</label>
                  <textarea
                    className={styles.textareaField}
                    placeholder="Any specific requests or requirements..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                  />
                </div>

                <Button 
                  type="submit" 
                  variant="primary" 
                  size="md" 
                  loading={submitting} 
                  style={{ width: '100%', height: '48px', borderRadius: '14px', fontSize: '15px' }}
                  leftIcon={<Send size={16} />}
                >
                  Request Lab Entry
                </Button>
              </form>
            ) : (
              
              /* 2. Status Board */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* STATE A: PENDING APPROVAL (WAITING QUEUE) */}
                {activeRequestDetails.status === 'pending' && (() => {
                  const simItem = simulatedQueue.find(item => item.id === activeRequestDetails.id);
                  const queuePos = activeRequestDetails.queue_position || simulatedQueue.findIndex(item => item.id === activeRequestDetails.id) + 1 || 1;
                  const entryTimeString = simItem?.estimated_entry_time 
                    ? new Date(simItem.estimated_entry_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                    : 'Calculating...';
                    
                  return (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={styles.queueItemCard}
                      style={{ borderLeft: '4px solid #F59E0B', padding: '24px', flexDirection: 'column', alignItems: 'stretch', gap: '16px' }}
                    >
                      <div style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#B45309', textTransform: 'uppercase', letterSpacing: '1px' }}>
                          Pending Instructor Approval
                        </span>
                        <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#1E293B', margin: '8px 0' }}>
                          Position #{queuePos}
                        </h2>
                        <p style={{ margin: 0, fontSize: '14px', color: '#64748B' }}>
                          Est. Computer Entry Time: <strong style={{ color: '#10B981' }}>{entryTimeString}</strong>
                        </p>
                      </div>

                      <div style={{ backgroundColor: '#FFFBEB', borderRadius: '12px', padding: '12px', fontSize: '12.5px', color: '#B45309', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Clock size={16} />
                        <span>Please wait. The instructor will assign a computer seat shortly.</span>
                      </div>

                      <Button 
                        variant="secondary" 
                        size="sm" 
                        onClick={handleCancelRequest}
                        style={{ color: '#EF4444', borderColor: '#EF4444' }}
                      >
                        Cancel Request
                      </Button>
                    </motion.div>
                  );
                })()}

                {/* STATE B: APPROVED (READY FOR START) */}
                {activeRequestDetails.status === 'approved' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      border: '1px solid #10B981',
                      borderRadius: '20px',
                      backgroundColor: 'rgba(16, 185, 129, 0.03)',
                      padding: '24px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '16px'
                    }}
                  >
                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#ECFDF5', color: '#10B981', display: 'flex', alignItems: 'center', justifyContents: 'center' }}>
                      <UserCheck size={32} style={{ margin: 'auto' }} />
                    </div>

                    <div style={{ textAlign: 'center' }}>
                      <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#10B981', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Lab Access Approved!
                      </span>
                      <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#1E293B', margin: '6px 0' }}>
                        Go to {activeRequestDetails.assigned_computer || 'assigned PC'}
                      </h2>
                      <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
                        Timer will start only when you click the button below.
                      </p>
                    </div>

                    <Button 
                      variant="primary" 
                      size="md" 
                      onClick={handleStartSession}
                      loading={submitting}
                      style={{ width: '100%', height: '48px', borderRadius: '12px', fontSize: '15px', backgroundColor: '#10B981', borderColor: '#10B981' }}
                      leftIcon={<Play size={16} />}
                    >
                      Start Session
                    </Button>
                  </motion.div>
                )}

                {/* STATE C: ACTIVE SESSION (COUNTDOWN TIMER RUNNING) */}
                {activeRequestDetails.status === 'active' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      border: '1px solid rgba(124, 58, 237, 0.3)',
                      borderRadius: '20px',
                      backgroundColor: '#FFFFFF',
                      padding: '24px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '16px'
                    }}
                  >
                    <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#7C3AED', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                      Active Lab Session on {activeRequestDetails.assigned_computer}
                    </span>

                    {/* Large Timer display */}
                    <div className={`${styles.countdownTimer} ${styles[timerStatusClass]}`} style={{ fontSize: '48px', padding: '12px 24px', borderRadius: '16px', fontFamily: 'monospace' }}>
                      {formatTimerString(timeRemainingSecs)}
                    </div>

                    {/* Purpose and details */}
                    <div style={{ textAlign: 'center' }}>
                      <span style={{ fontSize: '13.5px', fontWeight: 'bold', color: '#1E293B' }}>
                        Purpose: {activeRequestDetails.purpose}
                      </span>
                    </div>

                    {/* Extension alert / trigger */}
                    {activeRequestDetails.extension_status === 'pending' ? (
                      <div style={{ width: '100%', padding: '10px', borderRadius: '10px', backgroundColor: '#FFFBEB', color: '#B45309', fontSize: '12px', textAlign: 'center', fontWeight: '600' }}>
                        Waiting for extension approval (+10 mins)...
                      </div>
                    ) : activeRequestDetails.extension_status === 'rejected' ? (
                      <div style={{ width: '100%', padding: '10px', borderRadius: '10px', backgroundColor: '#FEF2F2', color: '#EF4444', fontSize: '12px', textAlign: 'center', fontWeight: '600' }}>
                        Extension request was declined by supervisor.
                      </div>
                    ) : (
                      <Button
                        variant="secondary"
                        size="sm"
                        leftIcon={<PlusCircle size={14} />}
                        onClick={handleRequestExtension}
                        disabled={submitting}
                        style={{ height: '36px', borderRadius: '10px', color: '#7C3AED', borderColor: '#7C3AED' }}
                      >
                        Request +10 mins Extension
                      </Button>
                    )}

                    <div className={styles.portalDivider} style={{ width: '100%' }} />

                    {/* End Session Button */}
                    <Button 
                      variant="primary" 
                      size="md" 
                      onClick={handleEndSession}
                      loading={submitting}
                      style={{ width: '100%', height: '44px', borderRadius: '12px', fontSize: '14px', backgroundColor: '#EF4444', borderColor: '#EF4444' }}
                    >
                      End Lab Session
                    </Button>
                  </motion.div>
                )}

              </div>
            )}
            
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentPortal;
