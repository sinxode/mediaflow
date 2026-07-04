/**
 * JSDoc Type Definitions for MediaFlow Database Models
 */

/**
 * @typedef {Object} User
 * @property {string} id - UUID primary key
 * @property {string} name - User's full display name
 * @property {string} email - Unique email address
 * @property {string} [avatar_url] - Profile picture URL
 * @property {'creator'|'reviewer'} role - Role permission level
 * @property {string} created_at - ISO timestamp
 * @property {string} updated_at - ISO timestamp
 */

/**
 * @typedef {Object} Task
 * @property {string} id - UUID primary key
 * @property {string} title - Task name header
 * @property {string} [description] - Detailed instruction requirements
 * @property {string} category - Category type e.g., 'Poster Design'
 * @property {'low'|'medium'|'high'} priority - Priority scale
 * @property {'created'|'assigned'|'working'|'ready_for_review'|'reviewing'|'approved'|'published'|'completed'} status - Status state
 * @property {string} [assigned_to] - User UUID of task assignee
 * @property {string} [created_by] - User UUID of task author
 * @property {string} [deadline] - ISO timestamp deadline
 * @property {string} [file_url] - Latest uploaded asset deliverable URL
 * @property {string} created_at - ISO timestamp
 * @property {string} updated_at - ISO timestamp
 */

/**
 * @typedef {Object} Comment
 * @property {string} id - UUID primary key
 * @property {string} task_id - Task UUID relationship
 * @property {string} user_id - Author User UUID relationship
 * @property {string} message - Message text
 * @property {string} created_at - ISO timestamp
 * @property {string} updated_at - ISO timestamp
 */

/**
 * @typedef {Object} ActivityLog
 * @property {string} id - UUID primary key
 * @property {string} [task_id] - Related Task UUID
 * @property {string} [user_id] - Acting User UUID
 * @property {string} action - Action tag text e.g., 'Comment Added'
 * @property {Object} [metadata] - JSON custom log metadata parameters
 * @property {string} created_at - ISO timestamp
 */

// Export default placeholder representing type models configuration
export const TypesPlaceholder = {};
