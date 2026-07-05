import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Lightbulb,
  CheckSquare,
  Search,
  Plus,
  Send,
  Paperclip,
  Smile,
  Reply,
  ArrowRight,
  MoreVertical,
  Link2,
  Trash2,
  CheckCircle2,
  X,
  FileText,
  Clock,
  Filter,
  AlertCircle
} from 'lucide-react';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import Modal from '../../components/Modal/Modal';
import { TeamHubService } from '../../services/teamhub/teamHubService';
import { useAuth } from '../../auth/hooks/useAuth';
import styles from './TeamHub.module.scss';

const TeamHub = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const messageEndRef = useRef(null);

  // Active Tab: 'discussion' | 'ideas' | 'plans'
  const [activeTab, setActiveTab] = useState('discussion');

  // Loaded Data
  const [messages, setMessages] = useState([]);
  const [ideas, setIdeas] = useState([]);
  const [plans, setPlans] = useState([]);
  const [activities, setActivities] = useState([]);

  // States
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filters
  const [ideaStatusFilter, setIdeaStatusFilter] = useState('all');
  const [planStatusFilter, setPlanStatusFilter] = useState('all');
  const [planPriorityFilter, setPlanPriorityFilter] = useState('all');

  // Composers & Forms
  const [composerText, setComposerText] = useState('');
  const [attachedFile, setAttachedFile] = useState(null);

  // Modals
  const [isIdeaModalOpen, setIsIdeaModalOpen] = useState(false);
  const [newIdeaTitle, setNewIdeaTitle] = useState('');
  const [newIdeaDesc, setNewIdeaDesc] = useState('');

  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [newPlanTitle, setNewPlanTitle] = useState('');
  const [newPlanDesc, setNewPlanDesc] = useState('');
  const [newPlanPriority, setNewPlanPriority] = useState('medium');
  const [newPlanLinkedIdea, setNewPlanLinkedIdea] = useState('');

  // Item Specific Chat Drawer
  const [drawerItem, setDrawerItem] = useState(null); // { type: 'idea'|'plan', item: Object }
  const [drawerMessages, setDrawerMessages] = useState([]);
  const [drawerComposerText, setDrawerComposerText] = useState('');

  // Floating Notification Toast
  const [toastMessage, setToastMessage] = useState(null);

  // Load Data
  const loadData = async () => {
    try {
      setLoading(true);
      const [msgs, ids, plns, acts] = await Promise.all([
        TeamHubService.getMessages(),
        TeamHubService.getIdeas(),
        TeamHubService.getPlans(),
        TeamHubService.getActivities()
      ]);
      setMessages(msgs);
      setIdeas(ids);
      setPlans(plns);
      setActivities(acts);
    } catch (err) {
      console.error('Failed to load Team Hub content', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (activeTab === 'discussion') {
      messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab]);

  // Load Drawer Messages
  useEffect(() => {
    if (drawerItem) {
      const fetchDrawerMessages = async () => {
        try {
          const msgs = await TeamHubService.getItemMessages(drawerItem.type, drawerItem.item.id);
          setDrawerMessages(msgs);
        } catch (err) {
          console.error('Failed to load item thread', err);
        }
      };
      fetchDrawerMessages();
    }
  }, [drawerItem]);

  // Show temp toast helper
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  // SEND DISCUSSION MESSAGE
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!composerText.trim() && !attachedFile) return;

    try {
      const attachments = attachedFile ? [attachedFile] : [];
      const savedMsg = await TeamHubService.sendMessage(composerText, attachments);
      setMessages((prev) => [...prev, savedMsg]);
      setComposerText('');
      setAttachedFile(null);
      
      // Refresh feed activity
      const acts = await TeamHubService.getActivities();
      setActivities(acts);
    } catch (err) {
      console.error('Message failed to post', err);
    }
  };

  // MOCK ATTACHMENT ACTION
  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAttachedFile({
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        url: '#'
      });
    }
  };

  // DISCUSSION MESSAGE ACTIONS
  const handleReplyMessage = (authorName) => {
    setComposerText((prev) => `@${authorName} ${prev}`);
  };

  const handleReactMessage = async (msgId, emoji) => {
    // Optimistic toggle reaction
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id !== msgId) return msg;
        const exists = msg.reactions.find((r) => r.emoji === emoji);
        let nextReactions = [];
        if (exists) {
          nextReactions = msg.reactions
            .map((r) => {
              if (r.emoji !== emoji) return r;
              return { ...r, count: r.count - 1 };
            })
            .filter((r) => r.count > 0);
        } else {
          nextReactions = [...msg.reactions, { emoji, count: 1, users: [user?.id || 'me'] }];
        }
        return { ...msg, reactions: nextReactions };
      })
    );
    triggerToast(`Added reaction ${emoji}`);
  };

  const handleCopyMsgLink = (msgId) => {
    navigator.clipboard.writeText(`${window.location.origin}/team-hub#message-${msgId}`);
    triggerToast('Message link copied to clipboard!');
  };

  // CONVERT ACTIONS
  const convertMsgToIdea = (content) => {
    setNewIdeaTitle('New Idea from Discussion');
    setNewIdeaDesc(content);
    setIsIdeaModalOpen(true);
  };

  const convertMsgToPlan = (content) => {
    setNewPlanTitle('New Plan from Discussion');
    setNewPlanDesc(content);
    setIsPlanModalOpen(true);
  };

  // CREATE IDEA ACTION
  const handleCreateIdea = async (e) => {
    if (e) e.preventDefault();
    if (!newIdeaTitle.trim()) return;

    try {
      const saved = await TeamHubService.createIdea(newIdeaTitle, newIdeaDesc);
      setIdeas((prev) => [saved, ...prev]);
      setIsIdeaModalOpen(false);
      setNewIdeaTitle('');
      setNewIdeaDesc('');
      
      const acts = await TeamHubService.getActivities();
      setActivities(acts);
      triggerToast('Idea posted successfully!');
    } catch (err) {
      console.error('Failed to create idea', err);
    }
  };

  // CREATE PLAN ACTION
  const handleCreatePlan = async (e) => {
    if (e) e.preventDefault();
    if (!newPlanTitle.trim()) return;

    try {
      const saved = await TeamHubService.createPlan(
        newPlanTitle,
        newPlanDesc,
        newPlanPriority,
        newPlanLinkedIdea || null
      );
      setPlans((prev) => [saved, ...prev]);
      setIsPlanModalOpen(false);
      setNewPlanTitle('');
      setNewPlanDesc('');
      setNewPlanPriority('medium');
      setNewPlanLinkedIdea('');

      const acts = await TeamHubService.getActivities();
      setActivities(acts);
      triggerToast('Plan created successfully!');
    } catch (err) {
      console.error('Failed to create plan', err);
    }
  };

  // PLAN STATUS TOGGLE CIRCLE
  const cyclePlanStatus = async (plan) => {
    const statusCycle = {
      'not_started': 'in_progress',
      'in_progress': 'completed',
      'completed': 'not_started'
    };
    const nextStatus = statusCycle[plan.status] || 'not_started';
    
    // Optimistic UI update
    setPlans((prev) =>
      prev.map((p) => (p.id === plan.id ? { ...p, status: nextStatus } : p))
    );

    try {
      await TeamHubService.updatePlanStatus(plan.id, nextStatus);
      const acts = await TeamHubService.getActivities();
      setActivities(acts);
    } catch (err) {
      console.error('Failed to update plan status', err);
    }
  };

  // CONVERT PLAN TO WORKFLOW TASK
  const convertPlanToTask = (plan) => {
    navigate('/tasks/create', {
      state: {
        prefillTitle: plan.title,
        prefillDescription: plan.description || '',
        linkedPlanId: plan.id
      }
    });
  };

  // DRAWER COMMENT DISCUSSIONS
  const handleSendDrawerMessage = async (e) => {
    if (e) e.preventDefault();
    if (!drawerComposerText.trim()) return;

    try {
      const savedMsg = await TeamHubService.sendItemMessage(
        drawerItem.type,
        drawerItem.item.id,
        drawerComposerText
      );
      setDrawerMessages((prev) => [...prev, savedMsg]);
      setDrawerComposerText('');
      
      // Update local count if fallback
      if (drawerItem.type === 'idea') {
        setIdeas((prev) =>
          prev.map((idea) =>
            idea.id === drawerItem.item.id
              ? { ...idea, discussion_count: (idea.discussion_count || 0) + 1 }
              : idea
          )
        );
      }
    } catch (err) {
      console.error('Thread post failed', err);
    }
  };

  // SEARCH AND FILTER COMPUTATION
  const filteredMessages = messages.filter((msg) =>
    msg.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredIdeas = ideas
    .filter((idea) => {
      if (ideaStatusFilter === 'all') return true;
      return idea.status === ideaStatusFilter;
    })
    .filter((idea) => {
      const q = searchQuery.toLowerCase();
      return (
        idea.title.toLowerCase().includes(q) ||
        (idea.description && idea.description.toLowerCase().includes(q))
      );
    });

  const filteredPlans = plans
    .filter((plan) => {
      if (planStatusFilter === 'all') return true;
      return plan.status === planStatusFilter;
    })
    .filter((plan) => {
      if (planPriorityFilter === 'all') return true;
      return plan.priority === planPriorityFilter;
    })
    .filter((plan) => {
      const q = searchQuery.toLowerCase();
      return (
        plan.title.toLowerCase().includes(q) ||
        (plan.description && plan.description.toLowerCase().includes(q))
      );
    });

  return (
    <div className={styles.pageContainer}>
      {/* Toast Alert popup */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -24, scale: 0.95 }}
            className="toast-alert"
            style={{
              position: 'fixed',
              top: '24px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: '#1E1B4B',
              color: '#F3E8FF',
              padding: '12px 24px',
              borderRadius: '12px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
              zIndex: 9999,
              fontSize: '13.5px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              border: '1px solid rgba(139, 92, 246, 0.3)'
            }}
          >
            <CheckCircle2 size={16} style={{ color: '#A78BFA' }} />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header and Global Search */}
      <div className={styles.headerActions}>
        <div className={styles.searchWrapper}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Dynamic creation triggers */}
        <div className={styles.metaGroup}>
          {activeTab === 'ideas' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsIdeaModalOpen(true)}
              className={styles.headerBtn}
            >
              <Plus size={16} /> New Idea
            </Button>
          )}
          {activeTab === 'plans' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsPlanModalOpen(true)}
              className={styles.headerBtn}
            >
              <Plus size={16} /> New Plan
            </Button>
          )}
        </div>
      </div>

      {/* Segmented Tab Navigation Bar */}
      <div className={styles.tabNav}>
        {['discussion', 'ideas', 'plans'].map((tab) => (
          <button
            key={tab}
            className={`${styles.tabButton} ${activeTab === tab ? styles.active : ''}`}
            onClick={() => {
              setActiveTab(tab);
              setSearchQuery('');
            }}
          >
            {activeTab === tab && (
              <motion.div
                layoutId="activeTabIndicator"
                className={styles.activeIndicator}
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <span>{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
          </button>
        ))}
      </div>

      {/* Double Column Hub Layout */}
      <div className={styles.workspaceGrid}>
        {/* Left Side: Central workspace */}
        <div className={styles.mainPanel}>
          {loading ? (
            <div className={styles.emptyState}>
              <Clock className="animate-spin" size={32} />
              <p>Loading Team Hub Workspace...</p>
            </div>
          ) : (
            <>
              {/* TAB 1: DISCUSSION */}
              {activeTab === 'discussion' && (
                <div className={styles.discussionContainer}>
                  {/* Messages list */}
                  <div className={styles.messageArea}>
                    {filteredMessages.length === 0 ? (
                      <div className={styles.emptyState}>
                        <MessageSquare size={36} />
                        <h4>No Messages Yet</h4>
                        <p>Start the conversation by typing your message below.</p>
                      </div>
                    ) : (
                      filteredMessages.map((msg) => (
                        <div key={msg.id} className={styles.messageCard}>
                          {/* Hover action bar */}
                          <div className={styles.messageActions}>
                            <button
                              title="Reply"
                              onClick={() => handleReplyMessage(msg.user?.name)}
                              className={styles.actionBtn}
                            >
                              <Reply size={13} />
                            </button>
                            <button
                              title="Like"
                              onClick={() => handleReactMessage(msg.id, '👍')}
                              className={styles.actionBtn}
                            >
                              👍
                            </button>
                            <button
                              title="Convert to Idea"
                              onClick={() => convertMsgToIdea(msg.content)}
                              className={styles.actionBtn}
                            >
                              <Lightbulb size={13} />
                            </button>
                            <button
                              title="Convert to Plan"
                              onClick={() => convertMsgToPlan(msg.content)}
                              className={styles.actionBtn}
                            >
                              <CheckSquare size={13} />
                            </button>
                            <button
                              title="Copy Link"
                              onClick={() => handleCopyMsgLink(msg.id)}
                              className={styles.actionBtn}
                            >
                              <Link2 size={13} />
                            </button>
                          </div>

                          <div className={styles.avatar}>
                            {msg.user?.name?.charAt(0).toUpperCase() || 'M'}
                          </div>
                          <div className={styles.msgBody}>
                            <div className={styles.msgHeader}>
                              <span className={styles.name}>{msg.user?.name || 'Muhammad Sinan'}</span>
                              <span className={styles.role}>{msg.user?.role || 'creator'}</span>
                              <span className={styles.time}>
                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <div className={styles.msgContent}>{msg.content}</div>

                            {/* Attachments */}
                            {msg.attachments && msg.attachments.length > 0 && (
                              <div className={styles.attachmentsGrid}>
                                {msg.attachments.map((file, fIdx) => (
                                  <a
                                    key={fIdx}
                                    href={file.url}
                                    className={styles.attachmentBadge}
                                    onClick={(e) => e.preventDefault()}
                                  >
                                    <FileText size={14} />
                                    <span>{file.name} ({file.size})</span>
                                  </a>
                                ))}
                              </div>
                            )}

                            {/* Reactions */}
                            {msg.reactions && msg.reactions.length > 0 && (
                              <div className={styles.reactionsWrapper}>
                                {msg.reactions.map((react, rIdx) => (
                                  <button
                                    key={rIdx}
                                    onClick={() => handleReactMessage(msg.id, react.emoji)}
                                    className={`${styles.reactionBtn} ${styles.active}`}
                                  >
                                    <span>{react.emoji}</span>
                                    <span>{react.count}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messageEndRef} />
                  </div>

                  {/* Message Composer */}
                  <div className={styles.composerArea}>
                    {attachedFile && (
                      <div className={styles.filePreviewRow}>
                        <FileText size={14} />
                        <span>{attachedFile.name} ({attachedFile.size})</span>
                        <button className={styles.removeFile} onClick={() => setAttachedFile(null)}>
                          <X size={12} />
                        </button>
                      </div>
                    )}
                    <form className={styles.composerForm} onSubmit={handleSendMessage}>
                      <div className={styles.composerInputWrapper}>
                        <textarea
                          placeholder="Send message to team..."
                          value={composerText}
                          onChange={(e) => setComposerText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                          rows={1}
                        />
                        <input
                          type="file"
                          ref={fileInputRef}
                          style={{ display: 'none' }}
                          onChange={handleFileChange}
                        />
                        <button type="button" className={styles.attachBtn} onClick={triggerFileSelect}>
                          <Paperclip size={16} />
                        </button>
                      </div>
                      <button type="submit" className={styles.sendBtn} disabled={!composerText.trim() && !attachedFile}>
                        <Send size={16} />
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* TAB 2: IDEAS */}
              {activeTab === 'ideas' && (
                <div className={styles.ideasContainer}>
                  {/* Status Filter */}
                  <div className="filter-bar" style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                    {['all', 'open', 'under_discussion', 'approved', 'archived'].map((status) => (
                      <button
                        key={status}
                        onClick={() => setIdeaStatusFilter(status)}
                        className={`filter-chip ${ideaStatusFilter === status ? 'active' : ''}`}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '20px',
                          border: '1px solid #E2E8F0',
                          backgroundColor: ideaStatusFilter === status ? '#8B5CF6' : '#FFFFFF',
                          color: ideaStatusFilter === status ? '#FFFFFF' : '#64748B',
                          fontSize: '12px',
                          fontWeight: 500,
                          cursor: 'pointer',
                          textTransform: 'capitalize'
                        }}
                      >
                        {status.replace('_', ' ')}
                      </button>
                    ))}
                  </div>

                  {filteredIdeas.length === 0 ? (
                    <div className={styles.emptyState}>
                      <Lightbulb size={36} />
                      <h4>No Ideas Found</h4>
                      <p>Try refining your filter or click "New Idea" to pitch a concept.</p>
                    </div>
                  ) : (
                    <div className={styles.ideaCardsGrid}>
                      {filteredIdeas.map((idea) => (
                        <div key={idea.id} className={styles.ideaCard}>
                          <div className={styles.msgBody}>
                            <div className={styles.ideaHeader}>
                              <h4 className={styles.ideaTitle}>{idea.title}</h4>
                              <span className={`${styles.statusTag} ${styles[idea.status]}`}>
                                {idea.status.replace('_', ' ')}
                              </span>
                            </div>
                            <p className={styles.ideaDesc}>{idea.description}</p>
                          </div>
                          
                          <div className={styles.ideaMeta}>
                            <span className={styles.author}>
                              By {idea.creator?.name || 'Muhammad Sinan'}
                            </span>
                            <div className={styles.metaGroup}>
                              <button
                                className={styles.planActionBtn}
                                style={{ padding: '4px 8px', fontSize: '11px', borderRadius: '6px' }}
                                onClick={() => setDrawerItem({ type: 'idea', item: idea })}
                              >
                                <MessageSquare size={12} /> {idea.discussion_count || 0}
                              </button>
                              
                              {idea.status === 'approved' && (
                                <button
                                  className={styles.planActionBtn}
                                  style={{ padding: '4px 8px', fontSize: '11px', borderRadius: '6px', backgroundColor: '#F3E8FF', borderColor: '#D8B4FE', color: '#7C3AED' }}
                                  onClick={() => {
                                    setNewPlanTitle(idea.title);
                                    setNewPlanDesc(idea.description || '');
                                    setNewPlanLinkedIdea(idea.id);
                                    setIsPlanModalOpen(true);
                                  }}
                                >
                                  Convert to Plan
                                </button>
                              )}

                              {idea.status !== 'approved' && idea.status !== 'archived' && (
                                <button
                                  className={styles.planActionBtn}
                                  style={{ padding: '4px 8px', fontSize: '11px', borderRadius: '6px' }}
                                  onClick={() => TeamHubService.updateIdeaStatus(idea.id, 'approved').then(loadData)}
                                >
                                  Approve
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: PLANS (Apple Reminders Design) */}
              {activeTab === 'plans' && (
                <div className={styles.plansContainer}>
                  {/* Status & Priority Filters */}
                  <div className="filter-bar" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', gap: '4px', borderRight: '1px solid #E2E8F0', paddingRight: '8px' }}>
                      {['all', 'not_started', 'in_progress', 'completed'].map((status) => (
                        <button
                          key={status}
                          onClick={() => setPlanStatusFilter(status)}
                          className={`filter-chip ${planStatusFilter === status ? 'active' : ''}`}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '20px',
                            border: '1px solid #E2E8F0',
                            backgroundColor: planStatusFilter === status ? '#8B5CF6' : '#FFFFFF',
                            color: planStatusFilter === status ? '#FFFFFF' : '#64748B',
                            fontSize: '11px',
                            fontWeight: 500,
                            cursor: 'pointer',
                            textTransform: 'capitalize'
                          }}
                        >
                          {status.replace('_', ' ')}
                        </button>
                      ))}
                    </div>

                    <div style={{ display: 'flex', gap: '4px' }}>
                      {['all', 'high', 'medium', 'low'].map((prio) => (
                        <button
                          key={prio}
                          onClick={() => setPlanPriorityFilter(prio)}
                          className={`filter-chip ${planPriorityFilter === prio ? 'active' : ''}`}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '20px',
                            border: '1px solid #E2E8F0',
                            backgroundColor: planPriorityFilter === prio ? '#1E1B4B' : '#FFFFFF',
                            color: planPriorityFilter === prio ? '#FFFFFF' : '#64748B',
                            fontSize: '11px',
                            fontWeight: 500,
                            cursor: 'pointer',
                            textTransform: 'capitalize'
                          }}
                        >
                          {prio} Priority
                        </button>
                      ))}
                    </div>
                  </div>

                  {filteredPlans.length === 0 ? (
                    <div className={styles.emptyState}>
                      <CheckSquare size={36} />
                      <h4>No Plans Found</h4>
                      <p>Create your first plan to start tracking collaboration items.</p>
                    </div>
                  ) : (
                    <div className={styles.plansList}>
                      {filteredPlans.map((plan) => (
                        <div key={plan.id} className={`${styles.planCard} ${plan.status === 'completed' ? styles.completed : ''}`}>
                          {/* Check Circle Button */}
                          <div
                            onClick={() => cyclePlanStatus(plan)}
                            className={`${styles.circleCheck} ${plan.status === 'completed' ? styles.checked : ''} ${plan.status === 'in_progress' ? styles.in_progress : ''}`}
                          >
                            {plan.status === 'completed' && <CheckCircle2 size={14} />}
                            {plan.status === 'in_progress' && <span style={{ fontSize: '10px', fontWeight: 'bold' }}>◔</span>}
                          </div>

                          <div className={styles.planContent}>
                            <div className={styles.planTitleGroup}>
                              <h5 className={styles.planTitle}>{plan.title}</h5>
                              <span className={`${styles.planPriorityBadge} ${styles[plan.priority]}`}>
                                {plan.priority}
                              </span>
                            </div>
                            {plan.description && <p className={styles.planDesc}>{plan.description}</p>}
                            <div className={styles.planMetaGroup}>
                              <span className="author" style={{ fontSize: '11px', color: '#64748B' }}>
                                Created by {plan.creator?.name || 'Muhammad Sinan'}
                              </span>
                              {plan.converted_task_id && (
                                <span className={styles.planLinkText} style={{ color: '#10B981', fontWeight: 600 }}>
                                  Created Task: {plan.title}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Action Group */}
                          <div className={styles.planActions}>
                            <button
                              className={styles.planActionBtn}
                              onClick={() => setDrawerItem({ type: 'plan', item: plan })}
                            >
                              <MessageSquare size={13} /> Thread
                            </button>
                            {!plan.converted_task_id ? (
                              <button
                                className={`${styles.planActionBtn} ${styles.primary}`}
                                onClick={() => convertPlanToTask(plan)}
                              >
                                Convert to Task <ArrowRight size={13} />
                              </button>
                            ) : (
                              <button
                                className={`${styles.planActionBtn} ${styles.primary}`}
                                style={{ backgroundColor: '#10B981', borderColor: '#10B981', color: '#FFFFFF' }}
                                onClick={() => navigate(`/tasks?id=${plan.converted_task_id}`)}
                              >
                                Open Task <ArrowRight size={13} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Right Side: Activity log timeline */}
        <div className={styles.activityPanel}>
          <h4 className={styles.panelTitle}>Team Hub Activity</h4>
          <div className={styles.activityFeed}>
            {activities.length === 0 ? (
              <p style={{ fontSize: '12px', color: '#64748B' }}>No activity logged yet.</p>
            ) : (
              activities.map((act) => (
                <div key={act.id} className={styles.activityItem}>
                  <span>{act.message}</span>
                  <span className={styles.activityTime}>
                    {new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* DRAWER: DISCUSSION THREAD PANEL FOR IDEAS/PLANS */}
      {drawerItem && (
        <div className={styles.drawerOverlay} onClick={() => setDrawerItem(null)}>
          <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <div>
                <span style={{ fontSize: '11px', color: '#8B5CF6', fontWeight: 600, textTransform: 'uppercase' }}>
                  {drawerItem.type} Discussion
                </span>
                <h4 className={styles.drawerTitle}>{drawerItem.item.title}</h4>
              </div>
              <button className={styles.closeBtn} onClick={() => setDrawerItem(null)}>
                <X size={18} />
              </button>
            </div>
            
            <div className={styles.drawerContent}>
              {drawerMessages.length === 0 ? (
                <div className={styles.emptyState} style={{ padding: '24px 0' }}>
                  <MessageSquare size={24} />
                  <p style={{ fontSize: '12.5px' }}>No thread messages yet. Start discussing this {drawerItem.type} below.</p>
                </div>
              ) : (
                drawerMessages.map((msg) => (
                  <div key={msg.id} className={styles.threadMsgCard}>
                    <div className={styles.header}>
                      <span className={styles.author}>{msg.user?.name || 'Team member'}</span>
                      <span className={styles.time}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className={styles.body}>{msg.content}</div>
                  </div>
                ))
              )}
            </div>

            <form className={styles.drawerComposer} onSubmit={handleSendDrawerMessage}>
              <input
                type="text"
                placeholder={`Comment on this ${drawerItem.type}...`}
                value={drawerComposerText}
                onChange={(e) => setDrawerComposerText(e.target.value)}
              />
              <button
                type="submit"
                className={styles.sendBtn}
                style={{ width: '32px', height: '32px' }}
                disabled={!drawerComposerText.trim()}
              >
                <Send size={13} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE IDEA */}
      <Modal
        isOpen={isIdeaModalOpen}
        onClose={() => setIsIdeaModalOpen(false)}
        title="Pitch New Idea"
      >
        <form onSubmit={handleCreateIdea} className={styles.modalBody}>
          <div className={styles.formGroup}>
            <label>Idea Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Weekly Video Podcast Format"
              value={newIdeaTitle}
              onChange={(e) => setNewIdeaTitle(e.target.value)}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Description / Pitch</label>
            <textarea
              required
              placeholder="Outline the concept, formats, assets, or references..."
              value={newIdeaDesc}
              onChange={(e) => setNewIdeaDesc(e.target.value)}
            />
          </div>
          <div className={styles.modalActions}>
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsIdeaModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Pitch Idea
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: CREATE PLAN */}
      <Modal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        title="Add Plan Reminder"
      >
        <form onSubmit={handleCreatePlan} className={styles.modalBody}>
          <div className={styles.formGroup}>
            <label>Plan / Checklist Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Design Friday Lecture Poster"
              value={newPlanTitle}
              onChange={(e) => setNewPlanTitle(e.target.value)}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Details</label>
            <textarea
              placeholder="Add details to prefill task description later..."
              value={newPlanDesc}
              onChange={(e) => setNewPlanDesc(e.target.value)}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Priority</label>
            <select value={newPlanPriority} onChange={(e) => setNewPlanPriority(e.target.value)}>
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
          </div>
          <div className={styles.modalActions}>
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsPlanModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Plan
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TeamHub;
