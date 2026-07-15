// Storage Service Layer Adapter
// Manages asset uploads to Supabase Storage bucket ('mediaflow-assets').

import { supabase } from '../../lib/supabaseClient';

// Helper to extract clean metadata
export const getFileMetadata = (file) => {
  if (!file) return null;
  const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
  return {
    name: file.name,
    size: `${sizeInMB} MB`,
    type: file.type,
    uploaded_at: new Date().toISOString()
  };
};

// --------------------------------------------------
// SUPABASE STORAGE SERVICE IMPLEMENTATION
// --------------------------------------------------
export const StorageService = {
  uploadFile: async (taskId, file, onProgress) => {
    const bucketName = 'mediaflow-assets';
    
    // Sanitize the file name to avoid "Invalid key" errors from Supabase Storage
    // (caused by non-standard unicode characters, spaces, special brackets, emojis, etc.)
    const rawName = file.name || 'unnamed_file';
    const lastDotIndex = rawName.lastIndexOf('.');
    const baseName = lastDotIndex !== -1 ? rawName.slice(0, lastDotIndex) : rawName;
    const ext = lastDotIndex !== -1 ? rawName.slice(lastDotIndex) : '';
    
    const sanitizedBase = baseName
      .replace(/[^a-zA-Z0-9_.-]/g, '_') // replace any non-safe character with underscore
      .replace(/__+/g, '_'); // simplify multiple consecutive underscores
      
    const cleanFileName = `${sanitizedBase}${ext}`;
    const filePath = `tasks/${taskId}/${Date.now()}_${cleanFileName}`;

    // Upload asset with upsert option
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) throw error;

    // Retrieve public asset link
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return {
      url: publicUrl,
      name: cleanFileName,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      uploaded_at: new Date().toISOString()
    };
  },

  deleteFile: async (fileUrl) => {
    const bucketName = 'mediaflow-assets';
    try {
      const urlParts = fileUrl.split(`${bucketName}/`);
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        await supabase.storage.from(bucketName).remove([filePath]);
      }
      return true;
    } catch (err) {
      console.warn('Failed to delete file from storage', err);
      return false;
    }
  }
};

export default StorageService;
