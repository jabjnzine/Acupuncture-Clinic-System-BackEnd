// ประเภทเพศ
export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

// สถานะการนัดหมาย
export enum AppointmentStatus {
  SCHEDULED = 'scheduled',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
}

// สถานะการชำระเงิน
export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  PARTIAL = 'partial',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled',
}

// วิธีการชำระเงิน
export enum PaymentMethod {
  CASH = 'cash',
  BANK_TRANSFER = 'bank_transfer',
  CREDIT_CARD = 'credit_card',
  PROMPTPAY = 'promptpay',
}

// ประเภทรายจ่าย
export enum ExpenseCategory {
  NEEDLES = 'needles',
  HERBS = 'herbs',
  EQUIPMENT = 'equipment',
  SALARY = 'salary',
  RENT = 'rent',
  UTILITIES = 'utilities',
  OTHER = 'other',
}

// ประเภทบริการ
export enum ServiceType {
  ACUPUNCTURE = 'acupuncture',
  TUINA = 'tuina',
  CUPPING = 'cupping',
  MOXIBUSTION = 'moxibustion',
  GUA_SHA = 'gua_sha',
  HERBAL_MEDICINE = 'herbal_medicine',
  CONSULTATION = 'consultation',
}

// สถานะคอร์สการรักษา
export enum CourseStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  PAUSED = 'paused',
  CANCELLED = 'cancelled',
}

// บทบาทผู้ใช้
export enum UserRole {
  ADMIN = 'admin',
  DOCTOR = 'doctor',
  STAFF = 'staff',
  RECEPTIONIST = 'receptionist',
}
