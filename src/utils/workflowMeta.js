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
      approvals: [],
      cleanDescription: ''
    };
  }

  // Matches tag like: [workflow:review=true;publishing=false;deliverable=true;approvals=id1,id2]
  const regex = /\[workflow:review=(true|false);publishing=(true|false);deliverable=(true|false)(?:;approvals=([^\]]*))?\]/;
  const match = description.match(regex);
  
  if (match) {
    const approvalsStr = match[4] || '';
    return {
      requiresReview: match[1] === 'true',
      requiresPublishing: match[2] === 'true',
      requiresDeliverable: match[3] === 'true',
      approvals: approvalsStr ? approvalsStr.split(',') : [],
      cleanDescription: description.replace(regex, '').trim()
    };
  }

  return {
    requiresReview: true,
    requiresPublishing: true,
    requiresDeliverable: true,
    approvals: [],
    cleanDescription: description.trim()
  };
};

export const serializeTaskMetadata = (description, requiresReview, requiresPublishing, requiresDeliverable, approvals = []) => {
  const cleanDesc = (description || '').trim();
  const approvalsStr = approvals && approvals.length > 0 ? approvals.join(',') : '';
  const metaString = `\n\n[workflow:review=${requiresReview};publishing=${requiresPublishing};deliverable=${requiresDeliverable};approvals=${approvalsStr}]`;
  return `${cleanDesc}${metaString}`;
};
