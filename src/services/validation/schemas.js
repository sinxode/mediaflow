// Validation Schemas for MediaFlow Forms and Fields
// Reusable placeholders and visual verification helpers

/**
 * Validates task creation parameters
 * @param {Object} data
 * @returns {{ success: boolean, errors: Object }}
 */
export const validateTaskCreate = (data) => {
  const errors = {};
  if (!data.title || !data.title.trim()) {
    errors.title = 'Task title is required.';
  }
  if (!data.category) {
    errors.category = 'Task category is required.';
  }
  if (!data.priority) {
    errors.priority = 'Priority is required.';
  }
  return {
    success: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validates task update parameters
 * @param {Object} data
 * @returns {{ success: boolean, errors: Object }}
 */
export const validateTaskUpdate = (data) => {
  const errors = {};
  if (data.title !== undefined && !data.title.trim()) {
    errors.title = 'Task title cannot be empty.';
  }
  return {
    success: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validates discussion comments
 * @param {Object} data
 * @returns {{ success: boolean, errors: Object }}
 */
export const validateComment = (data) => {
  const errors = {};
  if (!data.message || !data.message.trim()) {
    errors.message = 'Comment message cannot be empty.';
  }
  return {
    success: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validates account profile settings updates
 * @param {Object} data
 * @returns {{ success: boolean, errors: Object }}
 */
export const validateProfileUpdate = (data) => {
  const errors = {};
  if (data.name !== undefined && !data.name.trim()) {
    errors.name = 'Profile name is required.';
  }
  if (data.email !== undefined) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      errors.email = 'Invalid email address format.';
    }
  }
  return {
    success: Object.keys(errors).length === 0,
    errors
  };
};
