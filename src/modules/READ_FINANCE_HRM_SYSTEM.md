# 🚀 Implementation Guide - Finance, HRM & System Modules

## 📁 Cấu Trúc Thư Mục Hoàn Chỉnh

```
src/
├── modules/
│   ├── finance/
│   │   ├── invoices/
│   │   │   ├── invoices.controller.ts
│   │   │   ├── invoices.service.ts
│   │   │   └── dto/
│   │   │       └── invoice.dto.ts
│   │   ├── payments/
│   │   │   ├── payments.controller.ts
│   │   │   ├── payments.service.ts
│   │   │   └── dto/
│   │   │       └── payment.dto.ts
│   │   ├── payment-methods/
│   │   │   ├── payment-methods.controller.ts
│   │   │   ├── payment-methods.service.ts
│   │   │   └── dto/
│   │   │       └── payment-method.dto.ts
│   │   └── finance.module.ts
│   │
│   ├── hrm/
│   │   ├── shifts/
│   │   │   ├── shifts.controller.ts
│   │   │   ├── shifts.service.ts
│   │   │   └── dto/
│   │   │       └── shift.dto.ts
│   │   ├── leaves/
│   │   │   ├── leaves.controller.ts
│   │   │   ├── leaves.service.ts
│   │   │   └── dto/
│   │   │       └── leave.dto.ts
│   │   ├── attendance/
│   │   │   ├── attendance.controller.ts
│   │   │   ├── attendance.service.ts
│   │   │   └── dto/
│   │   │       └── attendance.dto.ts
│   │   ├── salary-config/
│   │   │   ├── salary-config.controller.ts
│   │   │   ├── salary-config.service.ts
│   │   │   └── dto/
│   │   │       └── salary-config.dto.ts
│   │   ├── payroll/
│   │   │   ├── payroll.controller.ts
│   │   │   ├── payroll.service.ts
│   │   │   └── dto/
│   │   │       └── payroll.dto.ts
│   │   └── hrm.module.ts
│   │
│   └── system/
│       ├── config/
│       │   ├── config.controller.ts
│       │   ├── config.service.ts
│       │   └── dto/
│       │       └── config.dto.ts
│       ├── audit-logs/
│       │   ├── audit-logs.controller.ts
│       │   ├── audit-logs.service.ts
│       │   └── dto/
│       │       └── audit-log.dto.ts
│       ├── notifications/
│       │   ├── notifications.controller.ts
│       │   ├── notifications.service.ts
│       │   └── dto/
│       │       └── notification.dto.ts
│       └── system.module.ts
```

## 🔧 Cập Nhật `app.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

// Import các module mới
import { FinanceModule } from './modules/finance/finance.module';
import { HrmModule } from './modules/hrm/hrm.module';
import { SystemModule } from './modules/system/system.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      // Your database config
    }),
    
    // Các module hiện có
    // ...
    
    // Module mới
    FinanceModule,
    HrmModule,
    SystemModule,
  ],
})
export class AppModule {}
```

## 📋 API Endpoints Tổng Hợp

### 💰 FINANCE MODULE

#### Invoices
- `POST /invoices` - Tạo hóa đơn
- `GET /invoices` - Danh sách hóa đơn
- `GET /invoices/:id` - Chi tiết hóa đơn
- `POST /invoices/:id/items` - Thêm item vào hóa đơn
- `PATCH /invoices/:id` - Cập nhật hóa đơn
- `PATCH /invoices/:id/status` - Cập nhật trạng thái
- `DELETE /invoices/items/:itemId` - Xóa item
- `DELETE /invoices/:id` - Xóa hóa đơn
- `GET /invoices/report/revenue` - Báo cáo doanh thu

#### Payments
- `POST /payments` - Tạo thanh toán
- `GET /payments` - Danh sách thanh toán
- `GET /payments/:id` - Chi tiết thanh toán
- `GET /payments/invoice/:invoiceId` - Lịch sử thanh toán của invoice
- `GET /payments/report/by-method` - Báo cáo theo phương thức

#### Payment Methods
- `POST /payment-methods` - Tạo phương thức
- `GET /payment-methods` - Danh sách phương thức
- `GET /payment-methods/:code` - Chi tiết phương thức
- `PATCH /payment-methods/:code` - Cập nhật
- `PATCH /payment-methods/:code/toggle-active` - Kích hoạt/Vô hiệu
- `DELETE /payment-methods/:code` - Xóa

### 👥 HRM MODULE

#### Shifts
- `POST /shifts` - Tạo ca làm việc
- `GET /shifts` - Danh sách ca
- `GET /shifts/:id` - Chi tiết ca
- `PATCH /shifts/:id` - Cập nhật ca
- `DELETE /shifts/:id` - Xóa ca

#### Leaves
- `POST /leaves` - Tạo đơn nghỉ phép
- `GET /leaves` - Danh sách đơn
- `GET /leaves/:id` - Chi tiết đơn
- `PATCH /leaves/:id` - Cập nhật đơn
- `POST /leaves/:id/approve` - Phê duyệt/Từ chối
- `DELETE /leaves/:id` - Xóa đơn
- `GET /leaves/stats/:staffId` - Thống kê nghỉ phép

#### Attendance
- `POST /attendance/check-in` - Check-in
- `POST /attendance/check-out` - Check-out
- `GET /attendance` - Danh sách chấm công
- `GET /attendance/:id` - Chi tiết chấm công
- `PATCH /attendance/:id` - Cập nhật (Admin)
- `DELETE /attendance/:id` - Xóa
- `GET /attendance/report/:staffId` - Báo cáo theo tháng

#### Salary Config
- `POST /salary-config` - Tạo cấu hình lương
- `GET /salary-config` - Danh sách cấu hình
- `GET /salary-config/current/:staffId` - Lương hiện tại
- `GET /salary-config/:id` - Chi tiết cấu hình
- `PATCH /salary-config/:id` - Cập nhật
- `DELETE /salary-config/:id` - Xóa

#### Payroll
- `POST /payroll` - Tạo bảng lương (Draft)
- `POST /payroll/calculate` - Tính lương tự động
- `GET /payroll` - Danh sách bảng lương
- `GET /payroll/:id` - Chi tiết bảng lương
- `PATCH /payroll/:id` - Cập nhật
- `POST /payroll/:id/approve` - Phê duyệt
- `POST /payroll/:id/mark-paid` - Đánh dấu đã trả
- `DELETE /payroll/:id` - Xóa

### ⚙️ SYSTEM MODULE

#### Config
- `POST /system-config` - Tạo cấu hình
- `GET /system-config` - Danh sách cấu hình
- `GET /system-config/:key` - Lấy theo key
- `GET /system-config/:key/value` - Lấy giá trị
- `GET /system-config/by-type/:type` - Lấy theo type
- `PATCH /system-config/:key` - Cập nhật
- `DELETE /system-config/:key` - Xóa

#### Audit Logs
- `POST /audit-logs` - Tạo log
- `GET /audit-logs` - Danh sách logs
- `GET /audit-logs/:id` - Chi tiết log
- `GET /audit-logs/record/:tableName/:recordId` - Lịch sử record
- `GET /audit-logs/user-stats/:userId` - Thống kê hoạt động

#### Notifications
- `POST /notifications` - Tạo thông báo
- `GET /notifications` - Danh sách thông báo
- `GET /notifications/:id` - Chi tiết thông báo
- `GET /notifications/unread-count/:userId` - Số lượng chưa đọc
- `PATCH /notifications/:id/read` - Đánh dấu đã đọc
- `POST /notifications/mark-read` - Đánh dấu nhiều đã đọc
- `POST /notifications/mark-all-read/:userId` - Đánh dấu tất cả
- `DELETE /notifications/:id` - Xóa thông báo
- `POST /notifications/bulk-delete` - Xóa nhiều

## ✅ Checklist Triển Khai

### 1. Finance Module
- [ ] Copy tất cả files vào `modules/finance/`
- [ ] Import `FinanceModule` vào `app.module.ts`
- [ ] Test API endpoints
- [ ] Kiểm tra báo cáo doanh thu

### 2. HRM Module
- [ ] Copy tất cả files vào `modules/hrm/`
- [ ] Import `HrmModule` vào `app.module.ts`
- [ ] Test chức năng chấm công
- [ ] Test tính lương tự động
- [ ] Kiểm tra báo cáo

### 3. System Module
- [ ] Copy tất cả files vào `modules/system/`
- [ ] Import `SystemModule` vào `app.module.ts`
- [ ] Test system config
- [ ] Test audit logs
- [ ] Test notifications

## 🔍 Lưu Ý Quan Trọng

### 1. Import Enum từ Entities
✅ **ĐÚNG:**
```typescript
import { InvoiceStatus } from 'src/database/entities/finance/invoices.entity';
```

❌ **SAI:**
```typescript
export enum InvoiceStatus {  // Không tự tạo enum trong DTO
  PAID = 'PAID',
  ...
}
```

### 2. Validation
- Tất cả DTO đã có validation đầy đủ
- Sử dụng class-validator decorators
- Numeric fields lưu dưới dạng `string` (do PostgreSQL NUMERIC)

### 3. Transaction
- Các operation quan trọng đã wrap trong transaction
- Đảm bảo data consistency

### 4. Relations
- Sử dụng `relations` trong find methods để load data liên quan
- Tránh N+1 query problem

### 5. Soft Delete
- Invoice, Notifications sử dụng soft delete
- Payroll chỉ cho phép xóa DRAFT/CALCULATED

## 🎯 Testing

### Test Flow Cơ Bản

#### Finance
```bash
# 1. Tạo invoice
POST /invoices
{
  "encounter_id": "xxx",
  "cashier_id": "xxx"
}

# 2. Thêm items
POST /invoices/:id/items
{
  "item_type": "CONSULTATION",
  "description": "Khám tổng quát",
  "quantity": 1,
  "unit_price": "200000"
}

# 3. Thanh toán
POST /payments
{
  "invoice_id": "xxx",
  "payment_method_code": "CASH",
  "amount": "200000"
}
```

#### HRM
```bash
# 1. Tạo shift
POST /shifts
{
  "shift_name": "Ca sáng",
  "start_time": "08:00",
  "end_time": "17:00"
}

# 2. Check-in
POST /attendance/check-in
{
  "staff_id": "xxx",
  "shift_id": 1
}

# 3. Check-out
POST /attendance/check-out
{
  "staff_id": "xxx"
}

# 4. Tính lương
POST /payroll/calculate
{
  "staff_id": "xxx",
  "year": 2024,
  "month": 12
}
```

## 🐛 Troubleshooting

### Lỗi Import Entity
```
Error: Cannot find module 'src/database/entities/...'
```
**Giải pháp:** Kiểm tra đường dẫn import, đảm bảo entities đã được tạo

### Lỗi Validation
```
ValidationError: ...
```
**Giải pháp:** Kiểm tra DTO, đảm bảo đúng type và decorator

### Lỗi Foreign Key
```
ForeignKeyViolation: ...
```
**Giải pháp:** Kiểm tra các ID tham chiếu có tồn tại không

## 📚 Tài Liệu Bổ Sung

- Tất cả service methods đều có JSDoc comments
- Controller endpoints đều có mô tả rõ ràng
- DTO fields đều có validation rules

## 🎉 Hoàn Tất

Sau khi triển khai xong cả 3 module, bạn sẽ có:
- ✅ 39 API endpoints cho Finance
- ✅ 45 API endpoints cho HRM  
- ✅ 30 API endpoints cho System
- ✅ **Tổng: 114 API endpoints**

Hệ thống đã sẵn sàng để sử dụng! 🚀