TRUNCATE TABLE
    annotation_project_images,
    image_annotations,
    annotation_projects,

    result_discussions,
    result_images,
    result_details_numeric,
    service_results,
    service_report_templates,

    invoice_payments,
    invoice_items,
    invoices,

    prescription_details,
    prescriptions,

    drug_import_details,
    drug_imports,

    service_request_items,
    service_requests,
    queue_tickets,
    medical_encounters,
    queue_counters,

    rel_service_indicators,
    room_services,
    ref_lab_indicators,

    ref_drugs,
    ref_drug_categories,

    ref_services,
    ref_service_categories,

    ref_icd10,
    ref_payment_methods,

    system_notifications,
    system_config,
    system_audit_logs,

    patient_profiles,
    staff_profiles,
    sys_users,

    ref_specialties,
    org_rooms,
    sys_roles
RESTART IDENTITY CASCADE;

-- =========================================================
-- 2) ROLES
-- =========================================================
INSERT INTO sys_roles (role_id, role_code, role_name, description) VALUES
(1, 'ADMIN',        'Quản trị viên',      'Quản trị hệ thống'),
(2, 'DOCTOR',       'Bác sĩ',             'Khám chữa bệnh'),
(3, 'RECEPTIONIST', 'Lễ tân/Thu ngân',    'Tiếp đón, thanh toán'),
(4, 'TECHNICIAN',   'Kỹ thuật viên',      'Thực hiện CLS'),
(5, 'PHARMACIST',   'Dược sĩ',            'Cấp phát thuốc'),
(6, 'PATIENT',      'Bệnh nhân',          'Người dùng hệ thống');

-- =========================================================
-- 3) SPECIALTIES
-- =========================================================
INSERT INTO ref_specialties (specialty_id, specialty_code, specialty_name, description, is_active) VALUES
(1, 'NK',   'Nội khoa',        NULL, TRUE),
(2, 'NGOAI','Ngoại khoa',      NULL, TRUE),
(3, 'SAN',  'Sản phụ khoa',    NULL, TRUE),
(4, 'NHI',  'Nhi khoa',        NULL, TRUE),
(5, 'TMH',  'Tai mũi họng',    NULL, TRUE),
(6, 'MAT',  'Mắt',             NULL, TRUE),
(7, 'RHM',  'Răng hàm mặt',    NULL, TRUE);

-- =========================================================
-- 4) ROOMS (quy mô nhỏ)
-- =========================================================
INSERT INTO org_rooms (room_id, room_name, room_type, is_active) VALUES
(1,  'PK Nội khoa',       'CLINIC',   TRUE),
(2,  'PK Ngoại khoa',     'CLINIC',   TRUE),
(3,  'PK Sản phụ khoa',   'CLINIC',   TRUE),
(4,  'PK Nhi khoa',       'CLINIC',   TRUE),
(5,  'PK Tai mũi họng',   'CLINIC',   TRUE),
(6,  'PK Mắt',            'CLINIC',   TRUE),
(7,  'PK Răng hàm mặt',   'CLINIC',   TRUE),
(8,  'Phòng Siêu âm',     'IMAGING',  TRUE),
(9,  'Phòng X-Quang',     'IMAGING',  TRUE),
(10, 'Phòng Xét nghiệm',  'LAB',      TRUE),
(11, 'Nhà thuốc',         'PHARMACY', TRUE),
(12, 'Quầy Thu Ngân',     'CASHIER',  TRUE),
(13, 'Phòng Hành Chính',  'ADMIN',    TRUE);

-- =========================================================
-- 5) PAYMENT METHODS
-- =========================================================
INSERT INTO ref_payment_methods (payment_method_code, method_name, is_active) VALUES
('CASH', 'Tiền mặt', TRUE),
('CARD', 'Thẻ', TRUE),
('BANK', 'Chuyển khoản', TRUE);

-- =========================================================
-- 6) ICD10 (mẫu ít thôi)
-- =========================================================
INSERT INTO ref_icd10 (icd_code, name_vi, name_en, parent_code, level, is_leaf, active) VALUES
('I10', 'Tăng huyết áp nguyên phát', 'Essential (primary) hypertension', NULL, 1, TRUE, TRUE),
('J00', 'Viêm mũi họng cấp', 'Acute nasopharyngitis', NULL, 3, TRUE, TRUE),
('M54', 'Đau thắt lưng', 'Dorsalgia', NULL, 1, TRUE, TRUE);

-- =========================================================
-- 7) SERVICE CATEGORIES (rút gọn)
-- =========================================================
INSERT INTO ref_service_categories (category_id, category_name, parent_id, is_system_root) VALUES
(1, 'Xét nghiệm',               NULL, TRUE),
(2, 'Huyết học',                1,    FALSE),
(3, 'Hóa sinh',                 1,    FALSE),
(13,'Xét nghiệm nước tiểu',     1,    FALSE),

(4, 'Chẩn đoán hình ảnh',       NULL, TRUE),
(5, 'Siêu âm',                  4,    FALSE),
(6, 'X-Quang',                  4,    FALSE),

(9, 'Thăm dò chức năng',        NULL, TRUE),
(10,'Điện tim',                 9,    FALSE),

(15,'Khám bệnh',                NULL, TRUE);

-- =========================================================
-- 8) SERVICES (giữ id quen thuộc)
-- =========================================================
INSERT INTO ref_services (service_id, category_id, service_name, unit_price, result_input_type) VALUES
-- LAB
(1,  2,  'Công thức máu',                      100000.00, 'NUMERIC_AND_TEXT'),
(2,  3,  'Đường huyết',                         50000.00, 'NUMERIC'),
(8,  3,  'Chức năng thận (Ure, Creatinine)',    90000.00, 'NUMERIC'),
(9,  3,  'Chức năng gan (AST, ALT, GGT)',      120000.00, 'NUMERIC'),
(13, 13, 'Tổng phân tích nước tiểu',            80000.00, 'NUMERIC_AND_TEXT'),

-- IMAGING
(3,  5,  'Siêu âm bụng',                       200000.00, 'IMAGE_AND_TEXT'),
(4,  6,  'X-Quang ngực',                       150000.00, 'IMAGE_AND_TEXT'),

-- Thăm dò
(6,  10, 'Điện tim 12 chuyển đạo',             120000.00, 'IMAGE_AND_TEXT'),

-- Khám
(20, 15, 'Khám nội khoa',                       80000.00, 'TEXT'),
(21, 15, 'Khám ngoại khoa',                     90000.00, 'TEXT'),
(22, 15, 'Khám sản phụ khoa',                  100000.00, 'TEXT'),
(23, 15, 'Khám nhi khoa',                       90000.00, 'TEXT'),
(24, 15, 'Khám tai mũi họng',                   90000.00, 'TEXT'),
(25, 15, 'Khám mắt',                            90000.00, 'TEXT'),
(26, 15, 'Khám răng hàm mặt',                  100000.00, 'TEXT');

-- =========================================================
-- 9) ROOM_SERVICES mapping theo room nhỏ
-- =========================================================
INSERT INTO room_services (room_id, service_id) VALUES
-- LAB (10)
(10,1),(10,2),(10,8),(10,9),(10,13),
-- Siêu âm (8)
(8,3),
-- X-Quang (9)
(9,4),
-- Điện tim (làm chung tại phòng imaging, ví dụ phòng siêu âm)
(8,6);

-- =========================================================
-- 10) LAB INDICATORS + REL (tối giản)
-- =========================================================
INSERT INTO ref_lab_indicators (indicator_id, indicator_code, indicator_name, unit, ref_min_male, ref_max_male, ref_min_female, ref_max_female) VALUES
(1, 'WBC', 'Bạch cầu', '10^9/L', 4.0, 10.0, 4.0, 10.0),
(2, 'RBC', 'Hồng cầu', '10^12/L', 4.5, 5.5, 4.0, 5.0),
(3, 'GLU', 'Glucose', 'mmol/L', 3.9, 5.6, 3.9, 5.6),
(4, 'HGB', 'Hemoglobin', 'g/dL', 13.5, 17.5, 12.0, 15.5),
(7, 'PLT', 'Tiểu cầu', '10^9/L', 150, 400, 150, 400),
(13,'CRE', 'Creatinine', 'mg/dL', 0.7, 1.3, 0.6, 1.1),
(14,'URE', 'Urea', 'mg/dL', 15, 40, 15, 40),
(8, 'AST', 'AST (SGOT)', 'U/L', 5, 40, 5, 35),
(9, 'ALT', 'ALT (SGPT)', 'U/L', 7, 56, 7, 35),
(10,'GGT', 'Gamma GT', 'U/L', 12, 64, 9, 36);

INSERT INTO rel_service_indicators (service_id, indicator_id, sort_order) VALUES
(1,1,1),(1,2,2),(1,4,3),(1,7,4), -- CBC
(2,3,1),                         -- Glucose
(8,13,1),(8,14,2),                -- Kidney
(9,8,1),(9,9,2),(9,10,3);         -- Liver

-- =========================================================
-- 11) DRUG CATEGORIES + DRUGS (mẫu)
-- =========================================================
INSERT INTO ref_drug_categories (category_id, parent_id, category_code, category_name) VALUES
(1, NULL, 'KS', 'Kháng sinh'),
(2, NULL, 'GD', 'Giảm đau'),
(3, NULL, 'TM', 'Thuốc tim mạch'),
(4, 3,    'TM.HA', 'Thuốc hạ huyết áp'),
(7, NULL, 'ND.DT', 'Thuốc đái tháo đường');

INSERT INTO ref_drugs
(drug_id, category_id, drug_name, active_ingredient, drug_code, dosage_form, route, strength, unit_name, reorder_level, unit_price, quantity, is_active)
VALUES
(1, 1, 'Amoxicillin 500mg', 'Amoxicillin', 'AMOX500', 'VIEN_NEN', 'ORAL', '500mg', 'viên', 50, 1500, 500, TRUE),
(2, 2, 'Paracetamol 500mg', 'Paracetamol', 'PARA500', 'VIEN_NEN', 'ORAL', '500mg', 'viên', 100, 500, 1000, TRUE),
(3, 4, 'Amlodipine 5mg', 'Amlodipine', 'AMLO5', 'VIEN_NEN', 'ORAL', '5mg', 'viên', 200, 5000, 800, TRUE),
(4, 7, 'Metformin 500mg', 'Metformin', 'MET500', 'VIEN_NEN', 'ORAL', '500mg', 'viên', 300, 2000, 1200, TRUE);

-- =========================================================
-- 12) USERS + STAFF + PATIENTS
-- =========================================================
INSERT INTO sys_users (user_id, username, password, email, phone, cccd, is_active) VALUES
-- staff
('eda39824-113f-426f-991b-58d3dda1f8b7', 'admin',      '$2b$10$hash', 'admin@clinic.com',     '0901234567', NULL, TRUE),
('11111111-1111-4111-8111-111111111110', 'cashier1',   '$2b$10$hash', 'cashier@clinic.com',   '0900000001', '010000000001', TRUE),

('b1c1d1e1-1111-4111-8111-111111111112', 'dr_noi',     '$2b$10$hash', 'dr.noi@clinic.com',    '0900000002', '010000000002', TRUE),
('c1d1e1f1-1111-4111-8111-111111111113', 'dr_nhi',     '$2b$10$hash', 'dr.nhi@clinic.com',    '0900000003', '010000000003', TRUE),

('d1e1f1a1-1111-4111-8111-111111111114', 'tech_lab',   '$2b$10$hash', 'tech.lab@clinic.com',  '0900000004', '010000000004', TRUE),
('d2e2f2a2-2222-4222-8222-222222222224', 'tech_img',   '$2b$10$hash', 'tech.img@clinic.com',  '0900000005', '010000000005', TRUE),

('e1f1a1b1-1111-4111-8111-111111111115', 'pharma1',    '$2b$10$hash', 'pharma@clinic.com',    '0900000006', '010000000006', TRUE),

-- patients
('a1b1c1d1-1111-4111-8111-111111111111', 'patient1',   '$2b$10$hash', 'p1@mail.com',          '0911111111', '001111111111', TRUE),
('a2b2c2d2-2222-4222-8222-222222222222', 'patient2',   '$2b$10$hash', 'p2@mail.com',          '0922222222', '002222222222', TRUE);

-- staff_profiles (đảm bảo DDL của bạn đã FIX dấu phẩy)
INSERT INTO staff_profiles (staff_id, full_name, role_id, assigned_room_id, signature_url, specialty_id) VALUES
('eda39824-113f-426f-991b-58d3dda1f8b7', 'Nguyễn Văn Quản Trị', 1, 13, NULL, NULL),
('11111111-1111-4111-8111-111111111110', 'Thu ngân',            3, 12, NULL, NULL),

('b1c1d1e1-1111-4111-8111-111111111112', 'Bác sĩ Nội khoa',      2, 1,  '/signatures/dr_noi.png', 1),
('c1d1e1f1-1111-4111-8111-111111111113', 'Bác sĩ Nhi khoa',      2, 4,  '/signatures/dr_nhi.png', 4),

('d1e1f1a1-1111-4111-8111-111111111114', 'KTV Xét nghiệm',       4, 10, NULL, NULL),
('d2e2f2a2-2222-4222-8222-222222222224', 'KTV Chẩn đoán HA',     4, 9,  NULL, NULL),

('e1f1a1b1-1111-4111-8111-111111111115', 'Dược sĩ',              5, 11, NULL, NULL);

INSERT INTO patient_profiles (patient_id, full_name, dob, gender, address, medical_history, allergy_history) VALUES
('a1b1c1d1-1111-4111-8111-111111111111', 'Nguyễn Văn A', '1975-05-15', 'NAM', 'TP.HCM', 'Tăng huyết áp', 'Penicillin'),
('a2b2c2d2-2222-4222-8222-222222222222', 'Trần Thị B',   '1982-08-22', 'NU',  'TP.HCM', 'Hen',          'Không');

-- =========================================================
-- 16) SYSTEM CONFIG (mẫu)
-- =========================================================
INSERT INTO system_config (config_key, config_value, config_type, description) VALUES
('clinic_name', 'Phòng khám tư (quy mô nhỏ)', 'GENERAL', 'Tên phòng khám'),
('queue_timeout', '10', 'QUEUE', 'Thời gian chờ tối đa (phút)');