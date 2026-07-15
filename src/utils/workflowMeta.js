/**
 * Workflow Metadata Utilities
 * Encodes task workflow configurations in the description string to avoid DB schema alterations.
 */

export const parseTaskMetadata = (description) => {
  if (!description) {
    return {
      requiresReview: true,
      requiresPublishing: true,
      requiresDeliverable: true,
      cleanDescription: ''
    };
  }

  // Matches tag like: [workflow:review=true;publishing=false;deliverable=true]
  const regex = /\[workflow:review=(true|false);publishing=(true|false);deliverable=(true|false)\]/;
  const match = description.match(regex);
  
  if (match) {
    return {
      requiresReview: match[1] === 'true',
      requiresPublishing: match[2] === 'true',
      requiresDeliverable: match[3] === 'true',
      cleanDescription: description.replace(regex, '').trim()
    };
  }

  return {
    requiresReview: true,
    requiresPublishing: true,
    requiresDeliverable: true,
    cleanDescription: description.trim()
  };
};

export const serializeTaskMetadata = (description, requiresReview, requiresPublishing, requiresDeliverable) => {
  const cleanDesc = (description || '').trim();
  const metaString = `\n\n[workflow:review=${requiresReview};publishing=${requiresPublishing};deliverable=${requiresDeliverable}]`;
  return `${cleanDesc}${metaString}`;
};
