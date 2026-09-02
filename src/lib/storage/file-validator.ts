const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = [
 'application/pdf',
 'image/jpeg',
 'image/png',
 'image/webp',
 'application/msword',
 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export interface FileValidationResult {
 valid: boolean;
 error?: string;
}

export function validateFile(file: File): FileValidationResult {
 if (!file) {
 return { valid: false, error: 'No file provided' };
 }

 if (file.size > MAX_FILE_SIZE) {
 return { valid: false, error: `File size exceeds {MAX_FILE_SIZE / 1024 / 1024}MB limit` };
 }

 if (!ALLOWED_MIME_TYPES.includes(file.type)) {
 return { valid: false, error: 'File type not supported. Allowed: PDF, images, documents' };
 }

 return { valid: true };
}

export function generateStorageKey(fileName: string, studentId: string): string {
 const timestamp = Date.now();
 const random = Math.random().toString(36).substring(7);
 const ext = fileName.split('.').pop() || '';
 return `uploads/${studentId}/${timestamp}-${random}.${ext}`;
}
