-- ROLES
INSERT INTO sys_roles (role_id, role_code, role_name, description) VALUES
(1, 'ADMIN',        'Quản trị viên',      'Quản trị hệ thống'),
(2, 'DOCTOR',       'Bác sĩ',             'Khám chữa bệnh'),
(3, 'RECEPTIONIST', 'Lễ tân/Thu ngân',    'Tiếp đón, thanh toán'),
(4, 'TECHNICIAN',   'Kỹ thuật viên',      'Thực hiện CLS'),
(5, 'PHARMACIST',   'Dược sĩ',            'Cấp phát thuốc'),
(6, 'PATIENT',      'Bệnh nhân',          'Người dùng hệ thống');

SELECT setval(pg_get_serial_sequence('sys_roles','role_id'), (SELECT MAX(role_id) FROM sys_roles));

-- SPECIALTIES
INSERT INTO ref_specialties (specialty_id, specialty_code, specialty_name, description, is_active) VALUES
(1, 'NK',   'Nội khoa',        NULL, TRUE),
(2, 'NGOAI','Ngoại khoa',      NULL, TRUE),
(3, 'SAN',  'Sản phụ khoa',    NULL, TRUE),
(4, 'NHI',  'Nhi khoa',        NULL, TRUE),
(5, 'TMH',  'Tai mũi họng',    NULL, TRUE),
(6, 'MAT',  'Mắt',             NULL, TRUE),
(7, 'RHM',  'Răng hàm mặt',    NULL, TRUE);

SELECT setval(pg_get_serial_sequence('ref_specialties','specialty_id'), (SELECT MAX(specialty_id) FROM ref_specialties));

-- ROOMS (IMAGING/LAB -> PARACLINICAL)
INSERT INTO org_rooms (room_id, room_name, room_type, is_active) VALUES
(1,  'PK Nội khoa',       'CLINIC',        TRUE),
(2,  'PK Ngoại khoa',     'CLINIC',        TRUE),
(3,  'PK Sản phụ khoa',   'CLINIC',        TRUE),
(4,  'PK Nhi khoa',       'CLINIC',        TRUE),
(5,  'PK Tai mũi họng',   'CLINIC',        TRUE),
(6,  'PK Mắt',            'CLINIC',        TRUE),
(7,  'PK Răng hàm mặt',   'CLINIC',        TRUE),

(8,  'Phòng Siêu âm',     'PARACLINICAL',  TRUE),
(9,  'Phòng X-Quang',     'PARACLINICAL',  TRUE),
(10, 'Phòng Xét nghiệm',  'PARACLINICAL',  TRUE),

(11, 'Nhà thuốc',         'PHARMACY',      TRUE),
(12, 'Quầy Thu Ngân',     'CASHIER',       TRUE),
(13, 'Phòng Hành Chính',  'ADMIN',         TRUE);

SELECT setval(pg_get_serial_sequence('org_rooms','room_id'), (SELECT MAX(room_id) FROM org_rooms));

-- PAYMENT METHODS
INSERT INTO ref_payment_methods (payment_method_code, method_name, is_active) VALUES
('CASH', 'Tiền mặt', TRUE),
('CARD', 'Thẻ', TRUE),
('BANK', 'Chuyển khoản', TRUE);

-- ICD10 (sample)
INSERT INTO ref_icd10 (icd_code, name_vi, name_en, parent_code, level, is_leaf, active) VALUES
('I10', 'Tăng huyết áp nguyên phát', 'Essential (primary) hypertension', NULL, 1, TRUE, TRUE),
('J00', 'Viêm mũi họng cấp', 'Acute nasopharyngitis', NULL, 3, TRUE, TRUE),
('M54', 'Đau thắt lưng', 'Dorsalgia', NULL, 1, TRUE, TRUE);

-- SERVICE CATEGORIES
INSERT INTO ref_service_categories (category_id, category_name, parent_id, is_system_root) VALUES
(1,  'Xét nghiệm',               NULL, TRUE),
(2,  'Huyết học',                1,    FALSE),
(3,  'Hóa sinh',                 1,    FALSE),
(13, 'Xét nghiệm nước tiểu',     1,    FALSE),

(4,  'Chẩn đoán hình ảnh',       NULL, TRUE),
(5,  'Siêu âm',                  4,    FALSE),
(6,  'X-Quang',                  4,    FALSE),

(9,  'Thăm dò chức năng',        NULL, TRUE),
(10, 'Điện tim',                 9,    FALSE),

(15, 'Khám bệnh',                NULL, TRUE);

SELECT setval(pg_get_serial_sequence('ref_service_categories','category_id'), (SELECT MAX(category_id) FROM ref_service_categories));

-- SERVICES (NO result_input_type)
INSERT INTO ref_services (service_id, category_id, service_name, unit_price) VALUES
(1,  2,  'Công thức máu',                      100000.00),
(2,  3,  'Đường huyết',                         50000.00),
(8,  3,  'Chức năng thận (Ure, Creatinine)',    90000.00),
(9,  3,  'Chức năng gan (AST, ALT, GGT)',      120000.00),
(13, 13, 'Tổng phân tích nước tiểu',            80000.00),

(3,  5,  'Siêu âm bụng',                       200000.00),
(4,  6,  'X-Quang ngực',                       150000.00),

(6,  10, 'Điện tim 12 chuyển đạo',             120000.00),

(20, 15, 'Khám nội khoa',                       80000.00),
(21, 15, 'Khám ngoại khoa',                     90000.00),
(22, 15, 'Khám sản phụ khoa',                  100000.00),
(23, 15, 'Khám nhi khoa',                       90000.00),
(24, 15, 'Khám tai mũi họng',                   90000.00),
(25, 15, 'Khám mắt',                            90000.00),
(26, 15, 'Khám răng hàm mặt',                  100000.00);

SELECT setval(pg_get_serial_sequence('ref_services','service_id'), (SELECT MAX(service_id) FROM ref_services));

-- ROOM_SERVICES
INSERT INTO room_services (room_id, service_id) VALUES
(10,1),(10,2),(10,8),(10,9),(10,13), -- xét nghiệm
(8,3),                               -- siêu âm
(9,4),                               -- x-quang
(8,6);                               -- điện tim (ví dụ làm ở phòng siêu âm)

-- USERS
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

-- STAFF PROFILES
INSERT INTO staff_profiles (staff_id, full_name, role_id, assigned_room_id, signature_url, specialty_id) VALUES
('eda39824-113f-426f-991b-58d3dda1f8b7', 'Nguyễn Văn Quản Trị', 1, 13, NULL, NULL),
('11111111-1111-4111-8111-111111111110', 'Thu ngân',            3, 12, NULL, NULL),

('b1c1d1e1-1111-4111-8111-111111111112', 'Bác sĩ Nội khoa',      2, 1,  '/signatures/dr_noi.png', 1),
('c1d1e1f1-1111-4111-8111-111111111113', 'Bác sĩ Nhi khoa',      2, 4,  '/signatures/dr_nhi.png', 4),

('d1e1f1a1-1111-4111-8111-111111111114', 'KTV Xét nghiệm',       4, 10, NULL, NULL),
('d2e2f2a2-2222-4222-8222-222222222224', 'KTV Chẩn đoán HA',     4, 9,  NULL, NULL),

('e1f1a1b1-1111-4111-8111-111111111115', 'Dược sĩ',              5, 11, NULL, NULL);

-- PATIENT PROFILES
INSERT INTO patient_profiles (patient_id, full_name, dob, gender, address, medical_history, allergy_history) VALUES
('a1b1c1d1-1111-4111-8111-111111111111', 'Nguyễn Văn A', '1975-05-15', 'NAM', 'TP.HCM', 'Tăng huyết áp', 'Penicillin'),
('a2b2c2d2-2222-4222-8222-222222222222', 'Trần Thị B',   '1982-08-22', 'NU',  'TP.HCM', 'Hen',          'Không');

-- QUEUE COUNTERS (seed để không bị NotFound)
INSERT INTO queue_counters (room_id, ticket_type)
SELECT room_id, 'CONSULTATION' FROM org_rooms WHERE room_type = 'CLINIC';

INSERT INTO queue_counters (room_id, ticket_type)
SELECT room_id, 'SERVICE' FROM org_rooms WHERE room_type = 'PARACLINICAL';

INSERT INTO queue_counters (room_id, ticket_type)
SELECT room_id, 'REGISTRATION' FROM org_rooms WHERE room_type = 'CASHIER';