# REVIEW & ĐỀ XUẤT CẤU TRÚC

## 1. REVIEW ICD10 MODULE ✅

**Đánh giá:** Code ICD10 hiện tại **RẤT TỐT**! 

### Ưu điểm:
- ✅ Đã dùng Transaction đúng cách
- ✅ Logic tree structure (parent-child) hoàn chỉnh
- ✅ Kiểm tra circular reference
- ✅ Auto update parent is_leaf
- ✅ Cascade update khi đổi mã cha
- ✅ Phân trang đầy đủ

### Cần sửa nhỏ:
**Không cần sửa gì!** Code đã tốt, chỉ cần thêm endpoint `GET /icd10/search` nếu muốn tìm kiếm riêng.

---

## 2. REVIEW ORG_ROOM MODULE ⚠️

**Đánh giá:** Code cơ bản, **CẦN BỔ SUNG**

### Thiếu:
- ❌ Chưa có phân trang
- ❌ Chưa có tìm kiếm
- ❌ Chưa có filter theo room_type
- ❌ Chưa có logic liên kết services (room_services)
- ❌ Chưa validate room_type

### Cần bổ sung:
1. Pagination cho findAll
2. QueryDto với filters
3. Logic quản lý services của phòng
4. Validation enum room_type

---

## 3. ĐỀ XUẤT CẤU TRÚC CHO 3 MODULES MỚI

### 📋 A. CLINICAL MODULE (Khám lâm sàng)

```
modules/
  clinical/
    ├── encounters/                 # Quản lý lượt khám
    │   ├── dto/
    │   │   ├── create-encounter.dto.ts
    │   │   ├── update-encounter.dto.ts
    │   │   └── query-encounter.dto.ts
    │   ├── encounters.service.ts
    │   ├── encounters.controller.ts
    │   └── encounters.module.ts
    │
    ├── icd10/                      # Quản lý ICD-10 (đã có)
    │   └── ... (giữ nguyên)
    │
    └── clinical.module.ts
```

**Lý do:**
- `encounters` quản lý toàn bộ lượt khám
- `icd10` là reference data (đã có)
- `encounter_cls_tracking` sẽ nằm ở **paraclinical** module vì liên quan đến CLS

**Logic nghiệp vụ:**
- Workflow: REGISTERED → IN_CONSULTATION → AWAITING_CLS → CLS_COMPLETED → COMPLETED
- Bác sĩ ghi triệu chứng, chẩn đoán sơ bộ, ICD-10
- Tạo service_requests (chỉ định CLS) → Chuyển sang paraclinical
- Update encounter status theo tiến trình

---

### 📋 B. RECEPTION MODULE (Tiếp đón)

```
modules/
  reception/
    ├── appointments/               # Lịch hẹn online
    │   ├── dto/
    │   │   ├── create-appointment.dto.ts
    │   │   ├── update-appointment.dto.ts
    │   │   └── query-appointment.dto.ts
    │   ├── appointments.service.ts
    │   ├── appointments.controller.ts
    │   └── appointments.module.ts
    │
    ├── queue/                      # Quản lý hàng đợi
    │   ├── dto/
    │   │   ├── create-ticket.dto.ts
    │   │   ├── update-ticket.dto.ts
    │   │   ├── query-ticket.dto.ts
    │   │   └── call-ticket.dto.ts
    │   ├── queue.service.ts       # Gộp logic counter + ticket
    │   ├── queue.controller.ts
    │   └── queue.module.ts
    │
    └── reception.module.ts
```

**Lý do gộp counter + ticket:**
- `queue_counters` chỉ là bộ đếm (internal logic)
- `queue_tickets` là entity chính để quản lý
- Service xử lý cả 2: auto tăng counter, tạo ticket, reset counter theo ngày

**Logic nghiệp vụ:**
1. **Online Appointment:**
   - Đặt lịch trước → Tự động tạo ticket với số ưu tiên (1, 2, 3...)
   - Status: CONFIRMED → Khi đến sẽ check-in

2. **Queue Management:**
   - Counter tự động reset mỗi ngày (CRON job hoặc check khi tạo ticket)
   - Ticket có: room_id, ticket_type (REGISTRATION/CONSULTATION/SERVICE)
   - Status: WAITING → CALLED → IN_PROGRESS → COMPLETED → SKIPPED
   - Actions: callNext(), callSpecific(ticketId), skip(ticketId)
   - service_ids[] cho CLS cùng phòng

3. **Workflow:**
```
Online Appointment → Ticket (REGISTRATION) → Thu ngân xử lý → Chỉ định phòng khám
→ Ticket (CONSULTATION) → Bác sĩ khám → Chỉ định CLS
→ Ticket (SERVICE) với service_ids[] → Kỹ thuật viên thực hiện
```

---

### 📋 C. PARACLINICAL MODULE (Cận lâm sàng)

```
modules/
  paraclinical/
    ├── service-categories/         # Danh mục nhóm dịch vụ
    │   ├── dto/
    │   ├── service-categories.service.ts
    │   ├── service-categories.controller.ts
    │   └── service-categories.module.ts
    │
    ├── services/                   # Dịch vụ + Indicators + Room
    │   ├── dto/
    │   │   ├── create-service.dto.ts
    │   │   ├── update-service.dto.ts
    │   │   ├── query-service.dto.ts
    │   │   ├── lab-indicator.dto.ts
    │   │   └── room-service.dto.ts
    │   ├── services.service.ts    # Gộp services + indicators + room_services
    │   ├── services.controller.ts
    │   └── services.module.ts
    │
    ├── service-orders/             # Chỉ định dịch vụ (từ bác sĩ)
    │   ├── dto/
    │   │   ├── create-order.dto.ts
    │   │   ├── update-order.dto.ts
    │   │   └── query-order.dto.ts
    │   ├── service-orders.service.ts
    │   ├── service-orders.controller.ts
    │   └── service-orders.module.ts
    │
    ├── results/                    # Kết quả + Template + Discussion
    │   ├── dto/
    │   │   ├── create-result.dto.ts
    │   │   ├── update-result.dto.ts
    │   │   ├── query-result.dto.ts
    │   │   ├── template.dto.ts
    │   │   ├── discussion.dto.ts
    │   │   └── print-result.dto.ts
    │   ├── results.service.ts     # Gộp tất cả logic results
    │   ├── templates.service.ts   # Service riêng cho templates
    │   ├── discussions.service.ts # Service riêng cho discussions
    │   ├── results.controller.ts
    │   └── results.module.ts
    │
    ├── tracking/                   # Theo dõi CLS (encounter_cls_tracking)
    │   ├── dto/
    │   ├── cls-tracking.service.ts
    │   ├── cls-tracking.controller.ts
    │   └── cls-tracking.module.ts
    │
    └── paraclinical.module.ts
```

**Lý do:**
- **service-categories**: Tree structure (như drug-categories)
- **services**: Gộp services + lab_indicators + room_services vì liên quan chặt
- **service-orders**: Phiếu chỉ định (gộp requests + request_items)
- **results**: Gộp result + result_details + result_images + discussions
- **tracking**: Theo dõi status CLS của encounter

**Logic nghiệp vụ:**

1. **Services:**
   - Tree categories (CĐHA → X-quang → X-quang phổi)
   - Service có type: NUMERIC (xét nghiệm), TEXT, IMAGE (CĐHA)
   - Lab indicators chỉ áp dụng cho NUMERIC services
   - room_services: Cấu hình phòng nào làm dịch vụ gì

2. **Service Orders (Transaction):**
   - Bác sĩ tạo order với nhiều items
   - Tự động tạo `encounter_cls_tracking` records
   - Status: PENDING → IN_PROGRESS → COMPLETED
   - Payment tracking

3. **Results (Transaction):**
   - Kỹ thuật viên nhập kết quả
   - Bác sĩ duyệt kết quả
   - Template: NUMERIC (table), IMAGE, TEXT
   - Discussion: Nested comments (lft/rgt)
   - Status: DRAFT → SUBMITTED → APPROVED → REJECTED
   - Print function

4. **CLS Tracking:**
   - Link encounter ↔ service_request_items
   - Update status theo tiến độ
   - Trigger update encounter.current_status

---

## 4. TỔNG KẾT CẤC MODULE CẦN LÀM

### Module cần BỔ SUNG từ Pharmacy:
- ✅ **drug-interactions** (đã tạo ở artifact đầu)

### Module cần SỬA:
- ⚠️ **org_room** (bổ sung pagination, filter, room-services logic)

### Module MỚI cần TRIỂN KHAI:
1. **Clinical Module:**
   - encounters (chính)
   - icd10 (giữ nguyên)

2. **Reception Module:**
   - appointments
   - queue (gộp counter + tickets)

3. **Paraclinical Module:**
   - service-categories
   - services (gộp services + indicators + room_services)
   - service-orders (gộp requests + items)
   - results (gộp result + details + images + discussions)
   - tracking (encounter_cls_tracking)

---

## 5. THỨ TỰ TRIỂN KHAI ĐỀ XUẤT

```
1. Sửa org_room (cần cho reception + paraclinical)
2. Clinical: encounters
3. Reception: appointments → queue
4. Paraclinical: service-categories → services → service-orders → results → tracking
```

**Lý do thứ tự:**
- org_room cần trước vì nhiều module phụ thuộc
- Clinical → Reception → Paraclinical theo workflow thực tế
- Trong mỗi module: làm từ reference data → transactions

---

Bạn đồng ý với cấu trúc này không? Tôi sẽ bắt đầu triển khai ngay! 🚀