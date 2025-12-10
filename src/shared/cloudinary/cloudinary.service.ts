import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import * as streamifier from 'streamifier'; // Dùng cách import này để tránh lỗi
import { UPLOAD_CONSTANTS } from '../../constants/upload.constants'; // Import constants của bạn

export type CloudinaryResponse = UploadApiResponse | UploadApiErrorResponse;

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  async uploadMedicalImage(file: Express.Multer.File): Promise<CloudinaryResponse> {
    return new Promise<CloudinaryResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: UPLOAD_CONSTANTS.MEDICAL_IMAGE_FOLDER,
          resource_type: 'image',
          format: 'png',
          quality: 100,
          transformation: [], 
          flags: 'preserve_transparency',

          unique_filename: true,
          filename_override: file.originalname,
        },
        (error, result) => {
          if (error) {
            this.logger.error('Upload failed:', error);
            return reject(new InternalServerErrorException('Cloudinary upload failed'));
          }
          resolve(result!);
        },
      );

      if (file.buffer) {
        streamifier.createReadStream(file.buffer).pipe(uploadStream);
      } else {
        reject(new BadRequestException('File buffer is empty'));
      }
    });
  }

  async deleteImage(publicId: string): Promise<any> {
    try {
      return await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      throw new InternalServerErrorException('Delete failed');
    }
  }

  /**
   * Tạo URL xem trước (Thumbnail nhỏ nhẹ)
   */
  getThumbnailUrl(publicId: string): string {
    return cloudinary.url(publicId, {
      width: 300,
      quality: 'auto',
      fetch_format: 'auto'
    });
  }
}