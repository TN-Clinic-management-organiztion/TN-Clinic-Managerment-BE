# Pharmacy Module

Module quản lý nhà thuốc toàn diện với đầy đủ chức năng từ nhập kho đến cấp phát thuốc.

## 📦 Cấu trúc Module

```
pharmacy/
├── drug-categories/         # Quản lý danh mục thuốc (phân cấp)
├── inventory-locations/     # Quản lý vị trí kho (ltree)
├── suppliers/              # Quản lý nhà cung cấp
├── drugs/                  # Quản lý thông tin thuốc
├── drug-imports/           # Quản lý phiếu nhập kho + chi tiết
├── drug-batches/           # Quản lý lô thuốc (FEFO)
├── prescriptions/          # Quản lý đơn thuốc + chi tiết
├── dispensing/             # Cấp phát thuốc
└── entities/               # TypeORM entities
```

## 🔄 Luồng nghiệp vụ

### 1. Nhập kho thuốc
```
POST /pharmacy/drug-imports
{
  "supplier_id": 1,
  "imported_by": "uuid-staff",
  "invoice_number": "INV-2024-001",
  "details": [
    {
      "drug_id": 10,
      "batch_number": "LOT-2024-001",
      "expiry_date": "2025-12-31",
      "quantity": 1000,
      "unit_price": "5000"
    }
  ]
}
```

**Transaction flow:**
1. Tạo `drug_imports` (header)
2. Tạo `drug_import_details` (items)
3. Tự động tạo `drug_batches` từ mỗi detail
4. Tính tổng tiền tự động

### 2. Kê đơn thuốc
```
POST /pharmacy/prescriptions
{
  "encounter_id": "uuid-encounter",
  "prescribing_doctor_id": "uuid-doctor",
  "details": [
    {
      "drug_id": 10,
      "quantity": 20,
      "usage_note": "1 viên x 2 lần/ngày sau ăn"
    },
    {
      "drug_id": 15,
      "quantity": 10,
      "usage_note": "1 viên trước khi ngủ"
    }
  ]
}
```

**Transaction flow:**
1. Kiểm tra tương tác thuốc (drug_interactions)
2. Yêu cầu lý do ghi đè nếu có tương tác
3. Tạo prescription (status: DRAFT)
4. Tạo prescription_details

### 3. Phê duyệt đơn thuốc
```
POST /pharmacy/prescriptions/:id/issue
{
  "prescribing_doctor_id": "uuid-doctor"
}
```

Chuyển status: `DRAFT` → `ISSUED`

### 4. Cấp phát thuốc (FEFO)
```
POST /pharmacy/dispensing/dispense
{
  "prescription_id": "uuid-prescription",
  "dispensing_pharmacist_id": "uuid-pharmacist"
}
```

**Transaction flow với FEFO:**
1. Kiểm tra prescription status = ISSUED
2. Với mỗi prescription_detail:
   - Tìm batches có sẵn (còn hàng, chưa hết hạn)
   - Sắp xếp theo `expiry_date ASC` (FEFO)
   - Phân bổ từ batch sắp hết hạn trước
   - Tạo `prescription_batch_dispenses`
   - Trừ `quantity_current` của batch
3. Cập nhật prescription status → DISPENSED

## 🔑 Tính năng chính

### Drug Categories
- ✅ Cấu trúc phân cấp (hierarchical tree)
- ✅ Hiển thị tree view đầy đủ
- ✅ Kiểm tra circular reference
- ✅ Phân trang và tìm kiếm

### Inventory Locations
- ✅ Sử dụng ltree cho cấu trúc cây
- ✅ Query hiệu quả với ltree operators
- ✅ Path validation (PHARMACY.ROOM1.SHELF3)
- ✅ Tree view

### Suppliers
- ✅ CRUD cơ bản
- ✅ Active/Inactive toggle
- ✅ Kiểm tra trước khi xóa

### Drugs
- ✅ Quản lý thông tin chi tiết thuốc
- ✅ Tính tổng tồn kho từ batches
- ✅ Cảnh báo thuốc sắp hết (low stock)
- ✅ Drug code unique
- ✅ Phân loại theo category

### Drug Imports (với Transaction)
- ✅ Tạo phiếu nhập với nhiều chi tiết
- ✅ Tự động tạo batches
- ✅ Tính tổng tiền tự động
- ✅ Rollback nếu lỗi
- ✅ Thống kê nhập kho
- ✅ Không cho xóa nếu đã xuất

### Drug Batches (FEFO)
- ✅ Quản lý lô thuốc chi tiết
- ✅ Cảnh báo hết hạn/sắp hết hạn
- ✅ FEFO (First Expired First Out)
- ✅ Lịch sử xuất kho theo batch
- ✅ Cập nhật vị trí kho

### Prescriptions (với Transaction)
- ✅ Kê đơn với nhiều thuốc
- ✅ Kiểm tra tương tác thuốc
- ✅ Workflow: DRAFT → ISSUED → DISPENSED
- ✅ Cho phép ghi đè cảnh báo có lý do
- ✅ Rollback nếu lỗi

### Dispensing (FEFO + Transaction)
- ✅ Cấp phát tự động theo FEFO
- ✅ Kiểm tra tồn kho
- ✅ Kiểm tra hạn sử dụng
- ✅ Phân bổ từ nhiều batches
- ✅ Cấp phát thủ công (manual)
- ✅ Lịch sử cấp phát chi tiết

## 🛡️ Bảo vệ dữ liệu

### Validation Rules
- Không xóa category/drug đang được sử dụng
- Không xóa supplier có phiếu nhập
- Không xóa location có batch
- Không xóa import đã xuất
- Không xóa prescription đã cấp phát
- Không cấp phát prescription chưa phê duyệt
- Không cấp phát batch hết hạn

### Transaction Rollback
- Tất cả operations quan trọng đều dùng transaction
- Auto rollback nếu có lỗi
- Đảm bảo tính toàn vẹn dữ liệu

## 📊 API Endpoints Summary

### Drug Categories
- `GET /pharmacy/drug-categories` - Danh sách (phân trang)
- `GET /pharmacy/drug-categories/tree` - Cấu trúc cây
- `GET /pharmacy/drug-categories/:id` - Chi tiết
- `GET /pharmacy/drug-categories/:id/children` - Danh mục con
- `POST /pharmacy/drug-categories` - Tạo mới
- `PATCH /pharmacy/drug-categories/:id` - Cập nhật
- `DELETE /pharmacy/drug-categories/:id` - Xóa

### Inventory Locations
- `GET /pharmacy/inventory-locations` - Danh sách
- `GET /pharmacy/inventory-locations/tree` - Cấu trúc cây
- `GET /pharmacy/inventory-locations/:id` - Chi tiết
- `GET /pharmacy/inventory-locations/:id/children` - Vị trí con
- `POST /pharmacy/inventory-locations` - Tạo mới
- `PATCH /pharmacy/inventory-locations/:id` - Cập nhật
- `DELETE /pharmacy/inventory-locations/:id` - Xóa

### Suppliers
- `GET /pharmacy/suppliers` - Danh sách
- `GET /pharmacy/suppliers/:id` - Chi tiết
- `POST /pharmacy/suppliers` - Tạo mới
- `PATCH /pharmacy/suppliers/:id` - Cập nhật
- `PATCH /pharmacy/suppliers/:id/toggle-active` - Bật/tắt
- `DELETE /pharmacy/suppliers/:id` - Xóa

### Drugs
- `GET /pharmacy/drugs` - Danh sách
- `GET /pharmacy/drugs/low-stock` - Thuốc sắp hết
- `GET /pharmacy/drugs/:id` - Chi tiết
- `GET /pharmacy/drugs/:id/stock` - Tổng tồn kho
- `POST /pharmacy/drugs` - Tạo mới
- `PATCH /pharmacy/drugs/:id` - Cập nhật
- `PATCH /pharmacy/drugs/:id/toggle-active` - Bật/tắt
- `DELETE /pharmacy/drugs/:id` - Xóa

### Drug Imports
- `GET /pharmacy/drug-imports` - Danh sách phiếu nhập
- `GET /pharmacy/drug-imports/statistics` - Thống kê
- `GET /pharmacy/drug-imports/:id` - Chi tiết phiếu nhập
- `POST /pharmacy/drug-imports` - Tạo phiếu nhập
- `PATCH /pharmacy/drug-imports/:id` - Cập nhật
- `DELETE /pharmacy/drug-imports/:id` - Xóa

### Drug Batches
- `GET /pharmacy/drug-batches` - Danh sách lô
- `GET /pharmacy/drug-batches/expired` - Lô hết hạn
- `GET /pharmacy/drug-batches/expiring?days=30` - Sắp hết hạn
- `GET /pharmacy/drug-batches/drug/:drugId/available` - Lô khả dụng
- `GET /pharmacy/drug-batches/drug/:drugId/total-stock` - Tổng tồn
- `GET /pharmacy/drug-batches/:id` - Chi tiết lô
- `GET /pharmacy/drug-batches/:id/history` - Lịch sử xuất
- `PATCH /pharmacy/drug-batches/:id` - Cập nhật

### Prescriptions
- `GET /pharmacy/prescriptions` - Danh sách đơn
- `GET /pharmacy/prescriptions/:id` - Chi tiết đơn
- `POST /pharmacy/prescriptions` - Kê đơn mới
- `POST /pharmacy/prescriptions/:id/issue` - Phê duyệt
- `POST /pharmacy/prescriptions/:id/cancel` - Hủy đơn
- `PATCH /pharmacy/prescriptions/:id` - Cập nhật
- `DELETE /pharmacy/prescriptions/:id` - Xóa

### Dispensing
- `POST /pharmacy/dispensing/dispense` - Cấp phát tự động (FEFO)
- `POST /pharmacy/dispensing/manual-dispense` - Cấp phát thủ công
- `GET /pharmacy/dispensing/prescription/:id/history` - Lịch sử cấp phát
- `GET /pharmacy/dispensing/detail/:id/dispenses` - Chi tiết cấp phát

## 🔄 Use Cases

### Use Case 1: Nhập thuốc mới
1. Tạo/chọn supplier
2. Tạo phiếu nhập với nhiều thuốc
3. Hệ thống tự động tạo batches
4. Đặt thuốc vào vị trí kho

### Use Case 2: Kê đơn và cấp phát
1. Bác sĩ kê đơn thuốc (DRAFT)
2. Hệ thống kiểm tra tương tác thuốc
3. Bác sĩ phê duyệt (ISSUED)
4. Dược sĩ cấp phát
5. Hệ thống tự động chọn batch theo FEFO
6. Trừ tồn kho

### Use Case 3: Quản lý hết hạn
1. Query batches sắp hết hạn (30 ngày)
2. Lên kế hoạch xử lý
3. Không cho cấp phát batch hết hạn

## 🎯 Best Practices

### Transaction Usage
- Luôn dùng transaction cho operations quan trọng
- Rollback toàn bộ nếu có lỗi
- Giữ transaction ngắn gọn

### FEFO Implementation
- Luôn sort batches theo expiry_date ASC
- Kiểm tra hết hạn trước khi cấp phát
- Ưu tiên batch sắp hết hạn

### Data Integrity
- Foreign key constraints
- Check constraints
- Unique constraints
- Validation ở service layer

### Performance
- Index trên columns thường query
- Pagination cho tất cả list APIs
- Lazy loading với relations

## 🧪 Testing Tips

```bash
# Tạo drug category
curl -X POST http://localhost:3000/pharmacy/drug-categories \
  -H "Content-Type: application/json" \
  -d '{"category_name": "Thuốc kháng sinh", "category_code": "AB"}'

# Tạo thuốc
curl -X POST http://localhost:3000/pharmacy/drugs \
  -H "Content-Type: application/json" \
  -d '{"drug_name": "Amoxicillin 500mg", "category_id": 1}'

# Nhập kho
curl -X POST http://localhost:3000/pharmacy/drug-imports \
  -H "Content-Type: application/json" \
  -d '{
    "supplier_id": 1,
    "details": [{
      "drug_id": 1,
      "batch_number": "LOT001",
      "expiry_date": "2025-12-31",
      "quantity": 1000,
      "unit_price": "5000"
    }]
  }'

# Kê đơn
curl -X POST http://localhost:3000/pharmacy/prescriptions \
  -H "Content-Type: application/json" \
  -d '{
    "prescribing_doctor_id": "doctor-uuid",
    "details": [{
      "drug_id": 1,
      "quantity": 20,
      "usage_note": "1 viên x 2 lần/ngày"
    }]
  }'

# Cấp phát
curl -X POST http://localhost:3000/pharmacy/dispensing/dispense \
  -H "Content-Type: application/json" \
  -d '{
    "prescription_id": "prescription-uuid",
    "dispensing_pharmacist_id": "pharmacist-uuid"
  }'
```

## 📝 Notes

- Tất cả dates được lưu dưới dạng ISO string trong DTO
- UUID được dùng cho staff, patients, prescriptions
- Numeric được lưu dưới dạng string trong database (precision)
- Transaction được dùng cho tất cả operations critical
- FEFO được implement trong dispensing service

===============================================

# Pharmacy Module - Complete Setup Guide

## 📁 Cấu trúc thư mục hoàn chỉnh

```
src/
└── modules/
    └── pharmacy/
        ├── drug-categories/
        │   ├── dto/
        │   │   ├── create-drug-category.dto.ts
        │   │   ├── update-drug-category.dto.ts
        │   │   └── query-drug-category.dto.ts
        │   ├── drug-categories.service.ts
        │   ├── drug-categories.controller.ts
        │   └── drug-categories.module.ts
        │
        ├── inventory-locations/
        │   ├── dto/
        │   │   └── inventory-location.dto.ts
        │   ├── inventory-locations.service.ts
        │   ├── inventory-locations.controller.ts
        │   └── inventory-locations.module.ts
        │
        ├── suppliers/
        │   ├── dto/
        │   │   └── supplier.dto.ts
        │   ├── suppliers.service.ts
        │   ├── suppliers.controller.ts
        │   └── suppliers.module.ts
        │
        ├── drugs/
        │   ├── dto/
        │   │   └── drug.dto.ts
        │   ├── drugs.service.ts
        │   ├── drugs.controller.ts
        │   └── drugs.module.ts
        │
        ├── drug-imports/
        │   ├── dto/
        │   │   └── drug-import.dto.ts
        │   ├── drug-imports.service.ts
        │   ├── drug-imports.controller.ts
        │   └── drug-imports.module.ts
        │
        ├── drug-batches/
        │   ├── dto/
        │   │   └── drug-batch.dto.ts
        │   ├── drug-batches.service.ts
        │   ├── drug-batches.controller.ts
        │   └── drug-batches.module.ts
        │
        ├── prescriptions/
        │   ├── dto/
        │   │   └── prescription.dto.ts
        │   ├── prescriptions.service.ts
        │   ├── prescriptions.controller.ts
        │   └── prescriptions.module.ts
        │
        ├── dispensing/
        │   ├── dto/
        │   │   └── dispensing.dto.ts
        │   ├── dispensing.service.ts
        │   ├── dispensing.controller.ts
        │   └── dispensing.module.ts
        │
        ├── entities/
        │   ├── ref_drug_categories.entity.ts
        │   ├── inventory_locations.entity.ts
        │   ├── drug_suppliers.entity.ts
        │   ├── ref_drugs.entity.ts
        │   ├── drug_imports.entity.ts
        │   ├── drug_import_details.entity.ts
        │   ├── drug_batches.entity.ts
        │   ├── prescriptions.entity.ts
        │   ├── prescription_details.entity.ts
        │   ├── prescription_batch_dispenses.entity.ts
        │   └── drug_interactions.entity.ts
        │
        └── pharmacy.module.ts
```

## 🚀 Cách sử dụng code đã tạo

### Bước 1: Copy code theo từng module

Tôi đã tạo 7 artifacts chứa code cho tất cả modules:

1. **DRUG-CATEGORIES - All Files** - Module quản lý danh mục thuốc
2. **INVENTORY-LOCATIONS - All Files** - Module quản lý vị trí kho
3. **SUPPLIERS + DRUGS - All Files** - Module nhà cung cấp và thuốc
4. **DRUG-IMPORTS + DRUG-BATCHES (Part 1)** - Module nhập kho
5. **DRUG-BATCHES - Complete Files** - Module lô thuốc
6. **PRESCRIPTIONS + DISPENSING - All Files** - Module đơn thuốc và cấp phát
7. **pharmacy.module.ts - Main Module** - Module tổng hợp

### Bước 2: Tạo thư mục và file

Với mỗi artifact, copy code và tạo file theo đúng đường dẫn trong comment.

Ví dụ với artifact **DRUG-CATEGORIES**:

```typescript
// ==================== dto/create-drug-category.dto.ts ====================
// Copy đoạn này vào: src/modules/pharmacy/drug-categories/dto/create-drug-category.dto.ts

// ==================== drug-categories.service.ts ====================
// Copy đoạn này vào: src/modules/pharmacy/drug-categories/drug-categories.service.ts
```

### Bước 3: Import PharmacyModule vào AppModule

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PharmacyModule } from './modules/pharmacy/pharmacy.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      // ... database config
    }),
    PharmacyModule,
  ],
})
export class AppModule {}
```

### Bước 4: Tạo file PageQueryDto (nếu chưa có)

```typescript
// src/common/dto/page-query.dto.ts
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class PageQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  search?: string;
}
```

## 📦 Dependencies cần cài đặt

```bash
npm install @nestjs/common @nestjs/core @nestjs/typeorm typeorm pg
npm install class-validator class-transformer
npm install @nestjs/mapped-types
```

## ✅ Checklist triển khai

- [ ] Copy tất cả code từ 7 artifacts
- [ ] Tạo đúng cấu trúc thư mục
- [ ] Tạo PageQueryDto trong common/dto
- [ ] Import PharmacyModule vào AppModule
- [ ] Kiểm tra entities đã có đầy đủ
- [ ] Run migration nếu cần
- [ ] Test từng endpoint

## 🧪 Test nhanh

```bash
# 1. Tạo drug category
curl -X POST http://localhost:3000/pharmacy/drug-categories \
  -H "Content-Type: application/json" \
  -d '{"category_name": "Thuốc kháng sinh", "category_code": "AB"}'

# 2. Tạo supplier
curl -X POST http://localhost:3000/pharmacy/suppliers \
  -H "Content-Type: application/json" \
  -d '{"supplier_name": "Công ty TNHH ABC", "phone": "0123456789"}'

# 3. Tạo inventory location
curl -X POST http://localhost:3000/pharmacy/inventory-locations \
  -H "Content-Type: application/json" \
  -d '{"path": "PHARMACY.ROOM1", "location_name": "Phòng 1"}'

# 4. Tạo drug
curl -X POST http://localhost:3000/pharmacy/drugs \
  -H "Content-Type: application/json" \
  -d '{"drug_name": "Amoxicillin 500mg", "category_id": 1, "unit_name": "viên"}'

# 5. Nhập kho
curl -X POST http://localhost:3000/pharmacy/drug-imports \
  -H "Content-Type: application/json" \
  -d '{
    "supplier_id": 1,
    "details": [{
      "drug_id": 1,
      "batch_number": "LOT001",
      "expiry_date": "2025-12-31",
      "quantity": 1000,
      "unit_price": "5000"
    }]
  }'
```

## 🎯 Lưu ý quan trọng

### Transaction
- Tất cả operations quan trọng đã dùng transaction
- Auto rollback nếu có lỗi
- Drug imports: Tạo import + details + batches trong 1 transaction
- Prescriptions: Tạo prescription + details trong 1 transaction
- Dispensing: Cấp phát + update batches trong 1 transaction

### FEFO (First Expired First Out)
- Được implement trong dispensing service
- Luôn xuất thuốc sắp hết hạn trước
- Query: `ORDER BY expiry_date ASC`

### Validation
- Foreign key validation trước khi insert
- Không cho xóa dữ liệu đang được sử dụng
- Kiểm tra tồn kho trước khi cấp phát
- Kiểm tra hạn sử dụng
- Kiểm tra tương tác thuốc

### Performance
- Pagination cho tất cả list APIs
- Index trên các columns thường query
- Lazy loading với relations

## 📊 API Endpoints Summary

### Drug Categories
```
GET    /pharmacy/drug-categories
GET    /pharmacy/drug-categories/tree
GET    /pharmacy/drug-categories/:id
GET    /pharmacy/drug-categories/:id/children
POST   /pharmacy/drug-categories
PATCH  /pharmacy/drug-categories/:id
DELETE /pharmacy/drug-categories/:id
```

### Inventory Locations
```
GET    /pharmacy/inventory-locations
GET    /pharmacy/inventory-locations/tree
GET    /pharmacy/inventory-locations/:id
GET    /pharmacy/inventory-locations/:id/children
POST   /pharmacy/inventory-locations
PATCH  /pharmacy/inventory-locations/:id
DELETE /pharmacy/inventory-locations/:id
```

### Suppliers
```
GET    /pharmacy/suppliers
GET    /pharmacy/suppliers/:id
POST   /pharmacy/suppliers
PATCH  /pharmacy/suppliers/:id
PATCH  /pharmacy/suppliers/:id/toggle-active
DELETE /pharmacy/suppliers/:id
```

### Drugs
```
GET    /pharmacy/drugs
GET    /pharmacy/drugs/low-stock
GET    /pharmacy/drugs/:id
GET    /pharmacy/drugs/:id/stock
POST   /pharmacy/drugs
PATCH  /pharmacy/drugs/:id
PATCH  /pharmacy/drugs/:id/toggle-active
DELETE /pharmacy/drugs/:id
```

### Drug Imports
```
GET    /pharmacy/drug-imports
GET    /pharmacy/drug-imports/statistics
GET    /pharmacy/drug-imports/:id
POST   /pharmacy/drug-imports
PATCH  /pharmacy/drug-imports/:id
DELETE /pharmacy/drug-imports/:id
```

### Drug Batches
```
GET    /pharmacy/drug-batches
GET    /pharmacy/drug-batches/expired
GET    /pharmacy/drug-batches/expiring?days=30
GET    /pharmacy/drug-batches/drug/:drugId/available
GET    /pharmacy/drug-batches/drug/:drugId/total-stock
GET    /pharmacy/drug-batches/:id
GET    /pharmacy/drug-batches/:id/history
PATCH  /pharmacy/drug-batches/:id
```

### Prescriptions
```
GET    /pharmacy/prescriptions
GET    /pharmacy/prescriptions/:id
POST   /pharmacy/prescriptions
POST   /pharmacy/prescriptions/:id/issue
POST   /pharmacy/prescriptions/:id/cancel
PATCH  /pharmacy/prescriptions/:id
DELETE /pharmacy/prescriptions/:id
```

### Dispensing
```
POST   /pharmacy/dispensing/dispense
POST   /pharmacy/dispensing/manual-dispense
GET    /pharmacy/dispensing/prescription/:id/history
GET    /pharmacy/dispensing/detail/:id/dispenses
```

## 🔧 Troubleshooting

### Lỗi "Cannot find module PageQueryDto"
- Tạo file `src/common/dto/page-query.dto.ts`
- Hoặc sửa import path trong các DTO files

### Lỗi "Entity not found"
- Kiểm tra tất cả entities đã được tạo trong `entities/` folder
- Import đúng entities vào các modules

### Lỗi Transaction
- Kiểm tra PostgreSQL đã bật transaction support
- Kiểm tra connection pool settings

### Lỗi FEFO
- Kiểm tra expiry_date format (phải là Date)
- Kiểm tra timezone settings

## 🎓 Best Practices đã áp dụng

✅ **Clean Architecture**: Phân tách rõ ràng DTO, Service, Controller  
✅ **Transaction Management**: Đảm bảo data integrity  
✅ **FEFO Implementation**: Quản lý kho hiệu quả  
✅ **Validation**: Class-validator cho tất cả inputs  
✅ **Error Handling**: Proper HTTP status codes  
✅ **Pagination**: Tất cả list APIs  
✅ **Business Logic**: Drug interactions, stock checks, expiry checks  

---

**Chúc bạn triển khai thành công! 🚀**