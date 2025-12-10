-- 1. LÀM SẠCH DỮ LIỆU & RESET ID (SERIAL) VỀ 1
TRUNCATE TABLE 
    patient_profiles, 
    staff_profiles, 
    ref_specialties, 
    sys_users, 
    sys_roles, 
    org_rooms 
RESTART IDENTITY CASCADE;

-- 2. ORG_ROOMS (Phòng ban)
INSERT INTO org_rooms (room_name, room_type, is_active) VALUES 
('Phòng Giám Đốc', 'ADMIN', TRUE),              -- ID: 1
('Quầy Tiếp Đón & Thu Ngân', 'CASHIER', TRUE),  -- ID: 2
('Phòng Khám Nội Tổng Quát', 'CLINIC', TRUE),   -- ID: 3
('Phòng Khám Nhi', 'CLINIC', TRUE),             -- ID: 4
('Khoa Chẩn Đoán Hình Ảnh', 'IMAGING', TRUE),   -- ID: 5
('Khoa Xét Nghiệm', 'LAB', TRUE),               -- ID: 6
('Nhà Thuốc Bệnh Viện', 'PHARMACY', TRUE);      -- ID: 7

-- 3. SYS_ROLES (Vai trò)
INSERT INTO sys_roles (role_code, role_name, description) VALUES 
('ADMIN', 'Quản trị viên', 'Quản trị hệ thống'),
('DOCTOR', 'Bác sĩ', 'Khám chữa bệnh'),
('RECEPTIONIST', 'Lễ tân/Thu ngân', 'Tiếp đón, thanh toán'),
('TECHNICIAN', 'Kỹ thuật viên', 'Thực hiện CLS'),
('PHARMACIST', 'Dược sĩ', 'Cấp phát thuốc'),
('PATIENT', 'Bệnh nhân', 'Người dùng hệ thống');

-- 4. REF_SPECIALTIES (Chuyên khoa)
INSERT INTO ref_specialties (specialty_code, specialty_name, description) VALUES 
('NOI_KHOA', 'Nội Khoa', 'Khám nội tổng quát'),
('NGOAI_KHOA', 'Ngoại Khoa', 'Tiểu phẫu, ngoại khoa'),
('NHI_KHOA', 'Nhi Khoa', 'Khám bệnh trẻ em'),
('CDHA', 'Chẩn Đoán Hình Ảnh', 'X-Quang, Siêu âm'),
('XET_NGHIEM', 'Xét Nghiệm', 'Huyết học, Sinh hóa'),
('DUOC', 'Dược', 'Cấp phát thuốc');

-- 5. SYS_USERS (Tài khoản)
INSERT INTO sys_users (user_id, username, password, email, phone, cccd, is_active) VALUES 
('a0000000-0000-0000-0000-000000000001', 'admin', '$2a$12$R9h/cIPz0gi.URNNXRkhWOPST9kC9MGfKM8XVFin.1e0yqFk1Jcuy', 'admin@sys.com', '0901000001', '001090000001', TRUE),
('a0000000-0000-0000-0000-000000000002', 'bs_hung', '$2a$12$R9h/cIPz0gi.URNNXRkhWOPST9kC9MGfKM8XVFin.1e0yqFk1Jcuy', 'hung.bs@sys.com', '0901000002', '001090000002', TRUE),
('a0000000-0000-0000-0000-000000000003', 'bs_lan', '$2a$12$R9h/cIPz0gi.URNNXRkhWOPST9kC9MGfKM8XVFin.1e0yqFk1Jcuy', 'lan.bs@sys.com', '0901000003', '001090000003', TRUE),
('a0000000-0000-0000-0000-000000000004', 'letan_hoa', '$2a$12$R9h/cIPz0gi.URNNXRkhWOPST9kC9MGfKM8XVFin.1e0yqFk1Jcuy', 'hoa.letan@sys.com', '0901000004', '001090000004', TRUE),
('a0000000-0000-0000-0000-000000000005', 'ktv_minh', '$2a$12$R9h/cIPz0gi.URNNXRkhWOPST9kC9MGfKM8XVFin.1e0yqFk1Jcuy', 'minh.ktv@sys.com', '0901000005', '001090000005', TRUE),
('a0000000-0000-0000-0000-000000000006', 'ds_tuan', '$2a$12$R9h/cIPz0gi.URNNXRkhWOPST9kC9MGfKM8XVFin.1e0yqFk1Jcuy', 'tuan.ds@sys.com', '0901000006', '001090000006', TRUE),
('b0000000-0000-0000-0000-000000000001', 'bn_an', '$2a$12$R9h/cIPz0gi.URNNXRkhWOPST9kC9MGfKM8XVFin.1e0yqFk1Jcuy', 'an.nguyen@gmail.com', '0912345678', '079090000001', TRUE),
('b0000000-0000-0000-0000-000000000002', 'bn_bich', '$2a$12$R9h/cIPz0gi.URNNXRkhWOPST9kC9MGfKM8XVFin.1e0yqFk1Jcuy', 'bich.tran@gmail.com', '0987654321', '079090000002', TRUE);

-- 6. STAFF_PROFILES (Hồ sơ nhân viên)
-- Lưu ý: Vì đã RESTART IDENTITY, ta có thể dùng ID cứng hoặc subquery. Dùng subquery cho an toàn.
INSERT INTO staff_profiles (staff_id, full_name, role_id, assigned_room_id, specialty_id, signature_url) VALUES 
-- Admin
('a0000000-0000-0000-0000-000000000001', 'Nguyễn Quản Trị', 
 (SELECT role_id FROM sys_roles WHERE role_code = 'ADMIN'), 
 (SELECT room_id FROM org_rooms WHERE room_type = 'ADMIN' LIMIT 1), 
 NULL, 'sig_admin.png'),

-- Bác sĩ Hùng
('a0000000-0000-0000-0000-000000000002', 'BS.CKI Nguyễn Văn Hùng', 
 (SELECT role_id FROM sys_roles WHERE role_code = 'DOCTOR'), 
 (SELECT room_id FROM org_rooms WHERE room_name = 'Phòng Khám Nội Tổng Quát'), 
 (SELECT specialty_id FROM ref_specialties WHERE specialty_code = 'NOI_KHOA'), 'sig_hung.png'),

-- Bác sĩ Lan
('a0000000-0000-0000-0000-000000000003', 'ThS.BS Trần Thị Lan', 
 (SELECT role_id FROM sys_roles WHERE role_code = 'DOCTOR'), 
 (SELECT room_id FROM org_rooms WHERE room_name = 'Phòng Khám Nhi'), 
 (SELECT specialty_id FROM ref_specialties WHERE specialty_code = 'NHI_KHOA'), 'sig_lan.png'),

-- Lễ tân Hoa
('a0000000-0000-0000-0000-000000000004', 'Phạm Thị Hoa', 
 (SELECT role_id FROM sys_roles WHERE role_code = 'RECEPTIONIST'), 
 (SELECT room_id FROM org_rooms WHERE room_type = 'CASHIER' LIMIT 1), 
 NULL, NULL),

-- KTV Minh
('a0000000-0000-0000-0000-000000000005', 'KTV Lê Văn Minh', 
 (SELECT role_id FROM sys_roles WHERE role_code = 'TECHNICIAN'), 
 (SELECT room_id FROM org_rooms WHERE room_type = 'IMAGING' LIMIT 1), 
 (SELECT specialty_id FROM ref_specialties WHERE specialty_code = 'CDHA'), 'sig_minh.png'),

-- Dược sĩ Tuấn
('a0000000-0000-0000-0000-000000000006', 'DS. Hoàng Văn Tuấn', 
 (SELECT role_id FROM sys_roles WHERE role_code = 'PHARMACIST'), 
 (SELECT room_id FROM org_rooms WHERE room_type = 'PHARMACY' LIMIT 1), 
 (SELECT specialty_id FROM ref_specialties WHERE specialty_code = 'DUOC'), 'sig_tuan.png');

-- 7. PATIENT_PROFILES (Hồ sơ bệnh nhân)
INSERT INTO patient_profiles (patient_id, full_name, dob, gender, address, medical_history, allergy_history) VALUES 
('b0000000-0000-0000-0000-000000000001', 'Nguyễn Văn An', '1990-05-15', 'NAM', '123 Đường Lê Lợi, TP.HCM', 'Đau dạ dày mạn tính', 'Dị ứng hải sản'),
('b0000000-0000-0000-0000-000000000002', 'Trần Thị Bích', '2015-10-20', 'NU', '456 Đường Nguyễn Trãi, TP.HCM', 'Viêm phế quản', 'Không có');

-- 8. KIỂM TRA LẠI DỮ LIỆU SAU KHI CHẠY
SELECT 'Users' as Table, count(*) FROM sys_users
UNION ALL
SELECT 'Staff', count(*) FROM staff_profiles
UNION ALL
SELECT 'Patients', count(*) FROM patient_profiles;