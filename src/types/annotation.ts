// Định nghĩa nguồn tạo annotation
import { AnnotationSource } from './../database/entities/ai/image_annotations.entity';

// Cấu trúc BBox chuẩn
export interface BoundingBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  width: number;
  height: number;
  area?: number;
}

// Class label (VD: Meningioma)
export interface LabelClass {
  id: number; // ID bệnh/nhãn trong DB của bạn
  name: string;
  score?: number | null; // Optional: Human sẽ không có hoặc = 1
}

// Object Annotation hoàn chỉnh lưu vào JSONB
export interface AnnotationData {
  bbox: BoundingBox;
  confidence?: number | null; // Optional: AI có, Human = null
  class: LabelClass;
  source: AnnotationSource; // Mới thêm vào để phân biệt
  created_at?: Date;
}