# AI-Core Module Documentation

## 📋 Tổng quan

Module AI-Core quản lý toàn bộ quy trình Annotation y tế sử dụng AI:
- Chạy AI Detection trên ảnh X-quang/CT/MRI
- Quản lý Human Annotation với workflow hoàn chỉnh
- Version control cho annotations
- So sánh AI vs Human annotations
- Thống kê và báo cáo

## 🎯 Workflow Hoàn chỉnh

```
1. Upload Image → result_images
2. Run AI Detection → AI Annotation (APPROVED)
3. Labeler làm annotation → HUMAN (IN_PROGRESS)
4. Submit → Status: SUBMITTED
5. Manager Review:
   - Approve → Status: APPROVED
   - Reject → Status: REJECTED (phải làm lại)
6. Nếu có chỉnh sửa sau khi APPROVED → Deprecate version cũ, tạo version mới
```

## 📊 Annotation Status Flow

```
IN_PROGRESS → SUBMITTED → APPROVED
                    ↓
                REJECTED (có thể submit lại)
                    
APPROVED → (edit) → DEPRECATED → tạo mới SUBMITTED
```

## 🗂️ Cấu trúc Module

```
ai-core/
├── dto/
│   ├── run-ai-detection.dto.ts        # Chạy AI
│   ├── human-annotation.dto.ts        # Save/Approve/Reject
│   ├── toggle-deprecate.dto.ts        # Deprecate annotation
│   └── query-result-images.dto.ts     # Filter gallery
├── ai-core.controller.ts
├── ai-core.service.ts
└── ai-core.module.ts
```

## 🔧 API Endpoints

### 1. AI Detection

#### Run AI Detection
```http
POST /ai-core/detect
Content-Type: application/json

{
  "image_id": "uuid",
  "model_name": "yolov12n",  // optional
  "confidence": 0.25          // optional
}
```

**Response:**
```json
{
  "annotation_id": "uuid",
  "image_id": "uuid",
  "annotation_source": "AI",
  "annotation_data": [
    {
      "bbox": { "x1": 100, "y1": 200, "x2": 300, "y2": 400 },
      "confidence": 0.95,
      "class": { "id": 1, "name": "Meningioma", "score": 0.95 }
    }
  ],
  "ai_model_name": "yolov12n",
  "annotation_status": "APPROVED"
}
```

---

### 2. Gallery View (List Images)

#### Get Images với Filter
```http
GET /ai-core/result-images?page=1&limit=10&status=TODO&search=lung
```

**Query Parameters:**
- `page`: Trang hiện tại (default: 1)
- `limit`: Số items/page (default: 10)
- `status`: Filter status
  - `TODO`: Chưa có gì hoặc đang làm dở (IN_PROGRESS/REJECTED)
  - `REVIEW`: Đã nộp, chờ duyệt (SUBMITTED)
  - `DONE`: Đã duyệt (APPROVED)
- `search`: Tìm theo file_name hoặc uploader name

**Response:**
```json
{
  "items": [
    {
      "image_id": "uuid",
      "file_name": "xray_001.png",
      "original_image_url": "https://...",
      "uploaded_by_name": "Dr. John",
      "uploaded_at": "2024-01-15T10:00:00Z",
      "current_status": "SUBMITTED",  // UNLABELED | IN_PROGRESS | SUBMITTED | APPROVED | REJECTED
      "has_ai_reference": true,
      "labeled_by_name": "Dr. Jane",
      "approved_by_name": null
    }
  ],
  "meta": {
    "total_items": 150,
    "current_page": 1,
    "items_per_page": 10,
    "total_pages": 15
  }
}
```

---

### 3. Workspace View (Image Detail)

#### Get Image Detail
```http
GET /ai-core/result-images/:image_id
```

**Response:**
```json
{
  "image_info": {
    "image_id": "uuid",
    "original_image_url": "https://...",
    "file_name": "xray_001.png",
    "uploaded_by_name": "Dr. John",
    "uploaded_at": "2024-01-15T10:00:00Z"
  },
  "ai_reference": {
    "data": [...],  // AI bounding boxes
    "model": "yolov12n"
  },
  "annotation_history": [
    {
      "annotation_id": "uuid",
      "annotation_data": [...],
      "status": "APPROVED",
      "rejection_reason": null,
      "deprecation_reason": null,
      "labeled_by_name": "Dr. Jane",
      "created_at": "2024-01-15T11:00:00Z",
      "approved_by_name": "Dr. Smith"
    },
    {
      "annotation_id": "uuid",
      "annotation_data": [...],
      "status": "DEPRECATED",
      "deprecation_reason": "Đã chỉnh sửa và nộp phiên bản mới",
      "labeled_by_name": "Dr. Jane",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### Get Annotation History
```http
GET /ai-core/result-images/:image_id/history
```

---

### 4. Human Annotation Workflow

#### Save/Submit Annotation
```http
POST /ai-core/result-images/:image_id/human-annotations
Content-Type: application/json

{
  "annotation_data": [
    {
      "bbox": { "x1": 100, "y1": 200, "x2": 300, "y2": 400 },
      "class": { "id": 1, "name": "Meningioma" },
      "source": "HUMAN"
    }
  ],
  "labeled_by": "staff_uuid"
}
```

**Logic:**
- Nếu có annotation đang IN_PROGRESS/SUBMITTED → Update
- Nếu có APPROVED → Deprecate cũ, tạo mới
- Nếu không có gì → Tạo mới
- Status mới luôn là `SUBMITTED`

#### Approve Annotation
```http
PATCH /ai-core/result-images/:image_id/approve
Content-Type: application/json

{
  "approved_by": "manager_uuid"
}
```

**Điều kiện:** Chỉ approve annotation có status = `SUBMITTED`

#### Reject Annotation
```http
PATCH /ai-core/result-images/:image_id/reject
Content-Type: application/json

{
  "rejected_by": "manager_uuid",
  "reason": "Bounding box chưa chính xác"
}
```

**Điều kiện:** Chỉ reject annotation có status = `SUBMITTED`

---

### 5. Annotation Management

#### Toggle Deprecate
```http
PATCH /ai-core/annotations/:annotation_id/deprecate
Content-Type: application/json

{
  "is_deprecated": true,
  "reason": "Lỗi thời do thay đổi quy trình"
}
```

#### Get Annotation Detail
```http
GET /ai-core/annotations/:annotation_id
```

#### Compare Annotations
```http
GET /ai-core/result-images/:image_id/compare
```

**Response:**
```json
{
  "image_id": "uuid",
  "ai_annotation": {
    "annotation_id": "uuid",
    "model": "yolov12n",
    "data": [...],
    "created_at": "2024-01-15T10:00:00Z"
  },
  "human_annotation": {
    "annotation_id": "uuid",
    "labeled_by": "Dr. Jane",
    "data": [...],
    "created_at": "2024-01-15T11:00:00Z"
  },
  "comparison_metrics": {
    "ai_box_count": 3,
    "human_box_count": 2,
    "matched_boxes": 2,
    "precision": 0.67,
    "recall": 1.0,
    "avg_iou": 0.85
  }
}
```

---

### 6. Statistics

#### Overview Statistics
```http
GET /ai-core/statistics/overview
```

**Response:**
```json
{
  "images": {
    "total": 500,
    "without_annotation": 150,
    "with_annotation": 350
  },
  "annotations": {
    "total": 800,
    "ai": 450,
    "human": 350,
    "approved": 300,
    "pending": 50
  },
  "progress": {
    "completion_rate": "60.00",
    "approval_rate": "85.71"
  }
}
```

#### Labeler Statistics
```http
GET /ai-core/statistics/by-labeler/:staff_id
```

**Response:**
```json
{
  "staff_id": "uuid",
  "statistics": {
    "total_annotated": 150,
    "approved": 120,
    "rejected": 20,
    "in_progress": 5,
    "submitted": 5,
    "approval_rate": "80.00",
    "rejection_rate": "13.33"
  },
  "recent_activity": [
    {
      "annotation_id": "uuid",
      "image_id": "uuid",
      "status": "APPROVED",
      "created_at": "2024-01-15T10:00:00Z",
      "approved_at": "2024-01-15T11:00:00Z"
    }
  ]
}
```

---

## 🎨 Frontend Implementation Guide

### Gallery Component
```typescript
// Fetch images
const { data } = await fetch('/ai-core/result-images?status=TODO&page=1');

// Render với badges
<Badge color={getStatusColor(item.current_status)}>
  {item.current_status}
</Badge>
```

### Workspace Component
```typescript
// Load image detail
const { data } = await fetch(`/ai-core/result-images/${imageId}`);

// Display AI reference (gray boxes)
{data.ai_reference?.data.map(box => (
  <BoundingBox {...box} color="gray" />
))}

// Display current human annotation
const currentAnnotation = data.annotation_history.find(
  h => h.status === 'APPROVED' || h.status === 'SUBMITTED'
);

// Submit annotation
await fetch(`/ai-core/result-images/${imageId}/human-annotations`, {
  method: 'POST',
  body: JSON.stringify({
    annotation_data: boxes,
    labeled_by: currentUserId
  })
});
```

### Review Dashboard
```typescript
// Load images pending review
const { data } = await fetch('/ai-core/result-images?status=REVIEW');

// Approve
await fetch(`/ai-core/result-images/${imageId}/approve`, {
  method: 'PATCH',
  body: JSON.stringify({ approved_by: managerId })
});

// Reject
await fetch(`/ai-core/result-images/${imageId}/reject`, {
  method: 'PATCH',
  body: JSON.stringify({ 
    rejected_by: managerId,
    reason: rejectionText
  })
});
```

---

## 🔐 Phân quyền đề xuất

```typescript
// Labeler (Kỹ thuật viên)
- GET /ai-core/result-images (xem gallery)
- GET /ai-core/result-images/:id (xem workspace)
- POST /ai-core/result-images/:id/human-annotations (submit)

// Manager (Bác sĩ quản lý)
- All Labeler permissions +
- PATCH /ai-core/result-images/:id/approve
- PATCH /ai-core/result-images/:id/reject
- GET /ai-core/statistics/*

// Admin
- All permissions +
- PATCH /ai-core/annotations/:id/deprecate
```

---

## 🚀 Setup & Configuration

### 1. Environment Variables
```env
AI_SERVICE_URL=http://localhost:8000/api/v1
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 2. Import Module
```typescript
// app.module.ts
import { AiCoreModule } from './modules/ai-core/ai-core.module';

@Module({
  imports: [
    // ...
    AiCoreModule,
  ],
})
export class AppModule {}
```

### 3. Database Migration
```sql
-- Đã có trong file table-sql
-- Chỉ cần chạy migration
```

---

## 📝 Notes quan trọng

### Version Control Logic
- Mỗi lần chỉnh sửa annotation APPROVED → Deprecate version cũ, tạo version mới
- Deprecated annotations vẫn giữ trong history
- Chỉ annotation SUBMITTED mới có thể approve/reject

### Status Priority
1. **IN_PROGRESS**: Đang làm (Draft)
2. **SUBMITTED**: Đã nộp, chờ duyệt
3. **APPROVED**: Đã duyệt (final version)
4. **REJECTED**: Bị từ chối (cần làm lại)
5. **DEPRECATED**: Lỗi thời (do có version mới)

### Filter Logic Gallery
- **TODO**: Chưa có gì HOẶC status = IN_PROGRESS/REJECTED
- **REVIEW**: Status = SUBMITTED
- **DONE**: Status = APPROVED

---

## 🐛 Troubleshooting

### Lỗi: "Không tìm thấy bản ghi SUBMITTED để duyệt"
**Nguyên nhân:** Annotation chưa được submit hoặc đã approve/reject rồi
**Giải pháp:** Check status trước khi approve/reject

### Lỗi: AI Service không kết nối được
**Nguyên nhân:** AI_SERVICE_URL sai hoặc service chưa chạy
**Giải pháp:** 
```bash
# Test AI service
curl http://localhost:8000/api/v1/detect/url
```

### Lỗi: "Annotation already deprecated"
**Nguyên nhân:** Đang cố deprecate annotation đã deprecated
**Giải pháp:** Check status trước khi toggle deprecate

---

## ✅ Testing Checklist

- [ ] Chạy AI detection thành công
- [ ] Filter gallery theo status
- [ ] Save annotation (IN_PROGRESS → SUBMITTED)
- [ ] Approve annotation
- [ ] Reject annotation
- [ ] Edit sau khi approved (deprecate + create new)
- [ ] Compare AI vs Human
- [ ] Statistics đúng
- [ ] Phân quyền hoạt động

---

**🎉 Module hoàn chỉnh - Ready for production!**