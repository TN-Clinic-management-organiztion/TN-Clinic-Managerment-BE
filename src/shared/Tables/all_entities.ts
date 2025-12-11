import { AnnotationProjectImage } from 'src/database/entities/ai/annotation_project_images.entity';
import { AnnotationProject } from 'src/database/entities/ai/annotation_projects.entity';
import { ImageAnnotation } from 'src/database/entities/ai/image_annotations.entity';
import { OrgRoom } from 'src/database/entities/auth/org_rooms.entity';
import { PatientProfile } from 'src/database/entities/auth/patient_profiles.entity';
import { RefSpecialty } from 'src/database/entities/auth/ref_specialties.entity';
import { StaffProfile } from 'src/database/entities/auth/staff_profiles.entity';
import { SysRole } from 'src/database/entities/auth/sys_roles.entity';
import { SysUser } from 'src/database/entities/auth/sys_users.entity';
import { EncounterClsTracking } from 'src/database/entities/clinical/encounter_cls_tracking.entity';
import { MedicalEncounter } from 'src/database/entities/clinical/medical_encounters.entity';
import { RefIcd10 } from 'src/database/entities/clinical/ref_icd10.entity';
import { InvoiceItem } from 'src/database/entities/finance/invoice_items.entity';
import { InvoicePayment } from 'src/database/entities/finance/invoice_payments.entity';
import { Invoice } from 'src/database/entities/finance/invoices.entity';
import { RefPaymentMethod } from 'src/database/entities/finance/ref_payment_methods.entity';
import { HrAllowance } from 'src/database/entities/hr/hr_allowances.entity';
import { HrLeaveRequest } from 'src/database/entities/hr/hr_leave_requests.entity';
import { HrPayroll } from 'src/database/entities/hr/hr_payroll.entity';
import { HrSalaryConfig } from 'src/database/entities/hr/hr_salary_config.entity';
import { HrShift } from 'src/database/entities/hr/hr_shifts.entity';
import { HrTimeAttendance } from 'src/database/entities/hr/hr_time_attendance.entity';
import { DrugBatch } from 'src/database/entities/pharmacy/drug_batches.entity';
import { DrugImportDetail } from 'src/database/entities/pharmacy/drug_import_details.entity';
import { DrugImport } from 'src/database/entities/pharmacy/drug_imports.entity';
import { DrugInteraction } from 'src/database/entities/pharmacy/drug_interactions.entity';
import { DrugSupplier } from 'src/database/entities/pharmacy/drug_suppliers.entity';
import { InventoryLocation } from 'src/database/entities/pharmacy/inventory_locations.entity';
import { PrescriptionBatchDispense } from 'src/database/entities/pharmacy/prescription_batch_dispenses.entity';
import { PrescriptionDetail } from 'src/database/entities/pharmacy/prescription_details.entity';
import { Prescription } from 'src/database/entities/pharmacy/prescriptions.entity';
import { RefDrugCategory } from 'src/database/entities/pharmacy/ref_drug_categories.entity';
import { RefDrug } from 'src/database/entities/pharmacy/ref_drugs.entity';
import { OnlineAppointment } from 'src/database/entities/reception/online_appointments.entity';
import { QueueCounter } from 'src/database/entities/reception/queue_counters.entity';
import { QueueTicket } from 'src/database/entities/reception/queue_tickets.entity';
import { RefLabIndicator } from 'src/database/entities/service/ref_lab_indicators.entity';
import { RefServiceCategory } from 'src/database/entities/service/ref_service_categories.entity';
import { RefService } from 'src/database/entities/service/ref_services.entity';
import { RelServiceIndicator } from 'src/database/entities/service/rel_service_indicators.entity';
import { ResultDetailNumeric } from 'src/database/entities/service/result_details_numeric.entity';
import { ResultDiscussion } from 'src/database/entities/service/result_discussions.entity';
import { ResultImage } from 'src/database/entities/service/result_images.entity';
import { RoomService } from 'src/database/entities/service/room_services.entity';
import { ServiceReportTemplate } from 'src/database/entities/service/service_report_templates.entity';
import { ServiceRequestItem } from 'src/database/entities/service/service_request_items.entity';
import { ServiceRequest } from 'src/database/entities/service/service_requests.entity';
import { ServiceResult } from 'src/database/entities/service/service_results.entity';
import { SystemAuditLog } from 'src/database/entities/system/system_audit_logs.entity';
import { SystemConfig } from 'src/database/entities/system/system_config.entity';
import { SystemNotification } from 'src/database/entities/system/system_notifications.entity';

const ALL_ENTITIES = [
  // Auth & Core
  SysUser,
  SysRole,
  StaffProfile,
  PatientProfile,
  OrgRoom,
  RefSpecialty,

  // Clinical & Queue
  MedicalEncounter,
  OnlineAppointment,
  QueueCounter,
  QueueTicket,
  EncounterClsTracking,
  RefIcd10,

  // Service (CLS)
  RefServiceCategory,
  RefService,
  RefLabIndicator,
  RelServiceIndicator,
  RoomService,
  ServiceReportTemplate,
  ServiceRequest,
  ServiceRequestItem,
  ServiceResult,
  ResultDetailNumeric,
  ResultImage,
  ResultDiscussion,

  // Pharmacy
  RefDrugCategory,
  RefDrug,
  DrugSupplier,
  InventoryLocation,
  DrugInteraction,
  DrugImport,
  DrugImportDetail,
  DrugBatch,
  Prescription,
  PrescriptionDetail,
  PrescriptionBatchDispense,

  // Finance
  RefPaymentMethod,
  Invoice,
  InvoiceItem,
  InvoicePayment,

  // HR
  HrShift,
  HrAllowance,
  HrLeaveRequest,
  HrSalaryConfig,
  HrTimeAttendance,
  HrPayroll,

  // Annotation
  AnnotationProject,
  AnnotationProjectImage,
  ImageAnnotation,

  // System
  SystemConfig,
  SystemAuditLog,
  SystemNotification,
];

export { ALL_ENTITIES };
