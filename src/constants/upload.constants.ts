export const UPLOAD_CONSTANTS = {
  MEDICAL_IMAGE_FOLDER: 'medical-images',
  ALLOWED_MIME_TYPES: ['image/png', 'image/jpeg', 'image/jpg'],
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_FILES_PER_REQUEST: 5,
} as const;

export const CLOUDINARY_PROVIDER = 'CLOUDINARY';