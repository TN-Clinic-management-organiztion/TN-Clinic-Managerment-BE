# Module PARACLINICAL - Quản lý Cận lâm sàng

## 📁 Cấu trúc Module

```
paraclinical/
├── services/                    # Quản lý dịch vụ, danh mục & chỉ số
│   ├── dto/
│   │   ├── services/           # DTOs cho ref_services
│   │   ├── categories/         # DTOs cho ref_service_categories
│   │   ├── indicators/         # DTOs cho ref_lab_indicators
│   │   └── service-indicators/ # DTOs cho liên kết
│   ├── services.controller.ts
│   └── services.service.ts
│
├── service-orders/              # Quản lý phiếu chỉ định dịch vụ
│   ├── dto/
│   ├── service-orders.controller.ts
│   └── service-orders.service.ts
│
├── results/                     # Quản lý kết quả toàn diện
│   ├── dto/
│   │   ├── results/            # DTOs cho service_results
│   │   ├── images/             # DTOs cho result_images
│   │   ├── templates/          # DTOs cho service_report_templates
│   │   └── discussions/        # DTOs cho result_discussions
│   ├── results.controller.ts
│   └── results.service.ts
│
└── paraclinical.module.ts       # Module chính
```

## 🔧 Các thành phần chính

### 1. Services Module
**Quản lý danh mục dịch vụ cận lâm sàng**

#### Bảng liên quan:
- `ref_services`: Danh mục dịch vụ
- `ref_service_categories`: Nhóm dịch vụ (có cấu trúc cây)
- `ref_lab_indicators`: Chỉ số xét nghiệm
- `rel_service_indicators`: Liên kết dịch vụ - chỉ số
- `room_services`: Liên kết phòng - dịch vụ

#### API Endpoints:

**Dịch vụ:**
- `POST /services` - Tạo dịch vụ mới
- `GET /services` - Lấy danh sách dịch vụ (có phân trang)
- `GET /services/:id` - Lấy chi tiết dịch vụ
- `PATCH /services/:id` - Cập nhật dịch vụ
- `DELETE /services/:id` - Xóa dịch vụ

**Danh mục:**
- `POST /services/categories` - Tạo danh mục
- `GET /services/categories` - Lấy danh sách danh mục
- `GET /services/categories/tree` - Lấy cây danh mục
- `GET /services/categories/:id` - Chi tiết danh mục
- `PATCH /services/categories/:id` - Cập nhật danh mục
- `DELETE /services/categories/:id` - Xóa danh mục

**Chỉ số xét nghiệm:**
- `POST /services/indicators` - Tạo chỉ số
- `GET /services/indicators` - Danh sách chỉ số
- `GET /services/indicators/:id` - Chi tiết chỉ số
- `PATCH /services/indicators/:id` - Cập nhật chỉ số
- `DELETE /services/indicators/:id` - Xóa chỉ số

**Liên kết:**
- `POST /services/link-indicator` - Liên kết dịch vụ với chỉ số
- `DELETE /services/:serviceId/indicators/:indicatorId` - Hủy liên kết
- `GET /services/:id/indicators` - Lấy các chỉ số của dịch vụ
- `POST /services/link-room` - Liên kết dịch vụ với phòng
- `DELETE /services/rooms/:roomId/services/:serviceId` - Hủy liên kết phòng
- `GET /services/rooms/:roomId` - Lấy dịch vụ của phòng
- `GET /services/:id/rooms` - Lấy phòng có dịch vụ

### 2. Service Orders Module
**Quản lý phiếu chỉ định dịch vụ**

#### Bảng liên quan:
- `service_requests`: Phiếu chỉ định
- `service_request_items`: Chi tiết dịch vụ trong phiếu

#### API Endpoints:
- `POST /service-orders` - Tạo phiếu chỉ định (có items)
- `GET /service-orders` - Danh sách phiếu chỉ định
- `GET /service-orders/pending` - Lấy items đang chờ (theo phòng)
- `GET /service-orders/:id` - Chi tiết phiếu
- `GET /service-orders/:id/with-items` - Chi tiết phiếu + items
- `GET /service-orders/encounter/:encounterId/items` - Items theo encounter
- `PATCH /service-orders/:id` - Cập nhật phiếu
- `DELETE /service-orders/:id` - Xóa phiếu (soft delete)
- `PATCH /service-orders/items/:itemId` - Cập nhật trạng thái item
- `DELETE /service-orders/items/:itemId` - Xóa item

#### Enum sử dụng (import từ entity):
```typescript
import { PaymentStatus } from 'src/database/entities/service/service_requests.entity';
// Đã bỏ ServiceItemStatus và cột status trên service_request_items
```

### 3. Results Module
**Quản lý kết quả cận lâm sàng toàn diện**

#### Bảng liên quan:
- `service_results`: Kết quả dịch vụ
- `result_images`: Hình ảnh kết quả (X-quang, CT, MRI,...)
- `service_report_templates`: Mẫu báo cáo
- `result_discussions`: Thảo luận/hội chẩn (nested set model)

#### API Endpoints:

**Kết quả dịch vụ:**
- `POST /results` - Tạo kết quả mới
- `GET /results` - Danh sách kết quả
- `GET /results/:id` - Chi tiết kết quả
- `PATCH /results/:id` - Cập nhật kết quả
- `DELETE /results/:id` - Xóa kết quả (soft delete)

**Hình ảnh:**
- `POST /results/images` - Tạo image với URL
- `POST /results/images/upload` - Upload ảnh lên Cloudinary
- `POST /results/images/bulk-upload` - Upload nhiều ảnh
- `GET /results/images` - Danh sách ảnh
- `GET /results/images/:id` - Chi tiết ảnh
- `PATCH /results/images/:id` - Cập nhật ảnh
- `DELETE /results/images/:id` - Xóa ảnh (kể cả trên Cloudinary)

**Templates:**
- `POST /results/templates` - Tạo template báo cáo
- `GET /results/templates` - Danh sách templates
- `GET /results/templates/:id` - Chi tiết template
- `PATCH /results/templates/:id` - Cập nhật template
- `DELETE /results/templates/:id` - Xóa template

**Thảo luận:**
- `POST /results/discussions` - Tạo comment mới
- `GET /results/discussions` - Danh sách discussions
- `GET /results/discussions/tree/:resultId` - Cây thảo luận của 1 kết quả
- `GET /results/discussions/:id` - Chi tiết discussion
- `PATCH /results/discussions/:id` - Cập nhật nội dung
- `DELETE /results/discussions/:id` - Xóa discussion (và các con)

#### Upload file với Cloudinary:
```typescript
// Single upload
POST /results/images/upload
Content-Type: multipart/form-data

{
  file: [File],
  result_id: "uuid",
  uploaded_by: "uuid"
}

// Bulk upload
POST /results/images/bulk-upload
Content-Type: multipart/form-data

{
  files: [File, File, ...],
  images: [
    { result_id: "uuid", uploaded_by: "uuid" },
    { result_id: "uuid", uploaded_by: "uuid" },
    ...
  ]
}
```

## ✅ Ưu điểm của cấu trúc này

1. **Tách biệt rõ ràng**: Mỗi module đảm nhiệm một nhóm chức năng cụ thể
2. **Dễ bảo trì**: Code được tổ chức theo từng domain logic
3. **Enum từ entity**: Tránh duplicate, đảm bảo type safety
4. **Phân trang nhất quán**: Sử dụng `PageQueryDto` chung
5. **Transaction support**: Service orders sử dụng transaction để đảm bảo tính nhất quán
6. **Nested Set Model**: Discussions sử dụng nested set để quản lý cây comment hiệu quả
7. **Cloudinary integration**: Upload và quản lý ảnh y tế dễ dàng

## 🚀 Cách sử dụng

### 1. Import module
```typescript
import { ParaclinicalModule } from './modules/paraclinical/paraclinical.module';

@Module({
  imports: [ParaclinicalModule],
})
export class AppModule {}
```

### 2. Sử dụng trong controller khác
```typescript
constructor(
  private readonly servicesService: ServicesService,
  private readonly resultsService: ResultsService,
) {}
```

### 3. Query với phân trang
```typescript
GET /services?page=1&limit=20&search=xét nghiệm&category_id=5
GET /results?page=2&limit=10&is_abnormal=true&result_time_from=2024-01-01
```

## 🔐 Lưu ý quan trọng

1. **Enum**: Luôn import enum từ entity, KHÔNG tạo lại
2. **Soft Delete**: Sử dụng `deleted_at` cho các bảng quan trọng
3. **Transaction**: Các thao tác phức tạp nên wrap trong transaction
4. **Cloudinary**: Nhớ delete ảnh trên Cloudinary khi xóa record
5. **Nested Set**: Cẩn thận khi update/delete discussions, cần cập nhật lft/rgt
6. **Numeric columns**: Convert number sang string khi lưu vào DB (base_price, ref_min_male,...)

## 📝 TODO

- [ ] Thêm validation cho numeric values
- [ ] Implement caching cho category tree
- [ ] Thêm API export report PDF
- [ ] Implement real-time notifications cho discussions
- [ ] Thêm permissions/roles cho các API
- [ ] Implement audit logs