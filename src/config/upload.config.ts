import { registerAs } from '@nestjs/config';
import { config } from 'dotenv';

config();

export default registerAs('upload', () => ({
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE ?? "0", 10) || 10485760, // 10MB default
  allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg'],
}));
