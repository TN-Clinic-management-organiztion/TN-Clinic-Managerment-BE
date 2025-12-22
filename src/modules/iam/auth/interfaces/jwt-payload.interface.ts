// Tại sao cần interface?
// 1. Định nghĩa kiểu dữ liệu cho TypeScript
// 2. IDE hỗ trợ auto-complete
// 3. Dễ dàng maintain khi thay đổi

export interface JwtPayload {
  sub: string;          // user_id
  username?: string;
  role?: string;        // role_code từ sys_roles
  user_type: 'STAFF' | 'PATIENT' | 'ADMIN';
  staff_id?: string;    // chỉ có nếu là staff
  patient_id?: string;  // chỉ có nếu là patient
  assigned_room_id?: number; // Phòng dành cho staff
}

export interface Tokens {
  access_token: string;
  refresh_token: string;
}