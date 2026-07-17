import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle2, AlertTriangle, XCircle, ArrowUpRight } from 'lucide-react';
import Modal from '../../components/Modal/Modal';
import Button from '../../components/Button/Button';
import LoadingSkeleton from '../../components/LoadingSkeleton/LoadingSkeleton';
import { supabase } from '../../lib/supabaseClient';
import styles from './RecurringWorkflows.module.scss';

const HistoryModal = ({ isOpen, onClose, workflow, onOpenTask }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !workflow?.id) return;

    const loadHistory = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('workflow_history')
          .select('*')
          .eq('workflow_id', workflow.id)
          .order('scheduled_event_date', { ascending: false });

        if (error) throw error;
        setHistory(data || []);
      } catch (err) {
        console.error('Failed to load workflow history', err);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [isOpen, workflow?.id]);

  const renderStatusDot = (status) => {
    switch (status) {
      case 'success':
        return <div className={`${styles.historyDot} ${styles.success}`}><CheckCircle2 size={16} /></div>;
      case 'skipped':
        return <div className={`${styles.historyDot} ${styles.skipped}`}><AlertTriangle size={16} /></div>;
      case 'failed':
      default:
        return <div className={`${styles.historyDot} ${styles.failed}`}><XCircle size={16} /></div>;
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${workflow?.name || 'Workflow'} — Execution History`}
      size="md"
      footer={
        <Button variant="ghost" size="sm" onClick={onClose}>
          Close
        </Button>
      }
    >
      {loading ? (
        <LoadingSkeleton count={3} height={60} />
      ) : history.length > 0 ? (
        <div className={styles.historyTimeline}>
          {history.map((log) => (
            <div key={log.id} className={styles.historyRow}>
              {renderStatusDot(log.status)}
              <div className={styles.historyContent}>
                <div className={styles.historyMetaRow}>
                  <span>Occurrence: {log.scheduled_event_date}</span>
                  <span>Generated: {formatDateTime(log.generation_date)}</span>
                </div>
                <h4 className={styles.historyTitle}>
                  {log.status === 'success' 
                    ? 'Task Successfully Generated' 
                    : log.status === 'skipped'
                    ? 'Generation Skipped (Duplicate)'
                    : 'Generation Failed'}
                </h4>
                
                {log.status === 'success' && log.generated_task_id && (
                  <button 
                    onClick={() => {
                      onClose();
                      onOpenTask(log.generated_task_id);
                    }}
                    className={styles.historyTaskLink}
                  >
                    Open Generated Task <ArrowUpRight size={12} style={{ marginLeft: 2, display: 'inline' }} />
                  </button>
                )}

                {log.status === 'failed' && log.error_message && (
                  <div className={styles.historyError}>
                    Error: {log.error_message}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '32px 16px', color: '#64748B' }}>
          <Calendar size={32} style={{ marginBottom: 8, opacity: 0.5 }} />
          <p style={{ margin: 0, fontSize: '13px' }}>No execution history logged for this workflow yet.</p>
        </div>
      )}
    </Modal>
  );
};

export default HistoryModal;
