/**
 * Deliverables Serialization & Parsing Helpers
 * Encodes multiple deliverables as a JSON array inside the standard file_url column
 * for backward compatibility and serverless deployment without DB changes.
 */

export const parseDeliverables = (task) => {
  if (!task || !task.file_url) return [];

  const rawUrl = task.file_url.trim();
  if (rawUrl.startsWith('[')) {
    try {
      return JSON.parse(rawUrl);
    } catch (e) {
      console.error('[MediaFlow] Failed to parse multiple deliverables JSON:', e);
    }
  }

  // Fallback to legacy single deliverable structure
  return [{
    id: 'legacy-1',
    url: task.file_url,
    name: task.file_name || 'Uploaded Asset',
    size: task.file_size || 0,
    uploadedAt: task.updated_at || task.created_at || new Date().toISOString()
  }];
};

export const serializeDeliverables = (deliverablesList) => {
  if (!deliverablesList || deliverablesList.length === 0) {
    return { file_url: null, file_name: null, file_size: null };
  }

  if (deliverablesList.length === 1) {
    return {
      file_url: deliverablesList[0].url,
      file_name: deliverablesList[0].name,
      file_size: deliverablesList[0].size
    };
  }

  return {
    file_url: JSON.stringify(deliverablesList),
    file_name: `${deliverablesList.length} files uploaded`,
    file_size: deliverablesList.reduce((acc, curr) => acc + (curr.size || 0), 0)
  };
};
