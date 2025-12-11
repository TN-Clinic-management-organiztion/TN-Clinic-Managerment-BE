export interface CloudinaryResponse {
  asset_id: string;
  public_id: string;
  version: number;
  version_id: string;
  signature: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  tags: string[];
  bytes: number;
  type: string;
  etag: string;
  placeholder: boolean;
  url: string;
  secure_url: string;
  folder: string;
  original_filename: string;
}

export interface UploadResult {
  id: string;
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  size: number;
  folder: string;
  originalFilename: string;
  uploadedAt: Date;
}