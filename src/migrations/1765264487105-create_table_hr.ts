import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTableHr1765264487105 implements MigrationInterface {
    name = 'CreateTableHr1765264487105'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "hr_shifts" ("shift_id" SERIAL NOT NULL, "shift_name" character varying(50), "start_time" TIME NOT NULL, "end_time" TIME NOT NULL, "break_start" TIME, "break_end" TIME, "work_day_credit" numeric(3,2) NOT NULL DEFAULT '1', CONSTRAINT "PK_1268cd80fb5172772b657dc7b4a" PRIMARY KEY ("shift_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."hr_leave_requests_leave_type_enum" AS ENUM('ANNUAL', 'SICK', 'EMERGENCY')`);
        await queryRunner.query(`CREATE TYPE "public"."hr_leave_requests_status_enum" AS ENUM('PENDING', 'APPROVED', 'REJECTED')`);
        await queryRunner.query(`CREATE TABLE "hr_leave_requests" ("request_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "leave_type" "public"."hr_leave_requests_leave_type_enum" NOT NULL, "start_date" date NOT NULL, "end_date" date NOT NULL, "total_days" numeric(4,1) NOT NULL, "status" "public"."hr_leave_requests_status_enum" NOT NULL DEFAULT 'PENDING', "decision_at" TIMESTAMP WITH TIME ZONE, "reason" text NOT NULL, "contact_info" character varying(100), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "staff_id" uuid NOT NULL, "decision_by" uuid, CONSTRAINT "PK_c0d988682d091686802dc68464c" PRIMARY KEY ("request_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."hr_time_attendance_status_enum" AS ENUM('PRESENT', 'ABSENT', 'LEAVE', 'HOLIDAY')`);
        await queryRunner.query(`CREATE TABLE "hr_time_attendance" ("attendance_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "work_date" date NOT NULL DEFAULT ('now'::text)::date, "check_in_time" TIMESTAMP WITH TIME ZONE, "check_in_ip" inet, "check_out_time" TIMESTAMP WITH TIME ZONE, "check_out_ip" inet, "actual_hours" numeric(4,2), "is_late" boolean NOT NULL DEFAULT false, "late_minutes" integer NOT NULL DEFAULT '0', "is_early_leave" boolean NOT NULL DEFAULT false, "early_leave_minutes" integer NOT NULL DEFAULT '0', "overtime_minutes" integer NOT NULL DEFAULT '0', "status" "public"."hr_time_attendance_status_enum" NOT NULL DEFAULT 'PRESENT', "admin_notes" text, "staff_id" uuid NOT NULL, "shift_id" integer, "leave_request_id" uuid, CONSTRAINT "uk_staff_work_date" UNIQUE ("staff_id", "work_date"), CONSTRAINT "PK_6bcbf2797c60653c02d988979e0" PRIMARY KEY ("attendance_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."hr_payroll_status_enum" AS ENUM('DRAFT', 'CALCULATED', 'APPROVED', 'PAID')`);
        await queryRunner.query(`CREATE TABLE "hr_payroll" ("payroll_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "payroll_month" date NOT NULL, "work_days" numeric(4,2) NOT NULL DEFAULT '0', "leave_days" numeric(4,2) NOT NULL DEFAULT '0', "total_paid_days" numeric(4,2) NOT NULL, "overtime_hours" numeric(5,2) NOT NULL DEFAULT '0', "base_salary" numeric(10,2) NOT NULL, "actual_salary" numeric(10,2) NOT NULL, "overtime_salary" numeric(10,2) NOT NULL DEFAULT '0', "total_allowances" numeric(10,2) NOT NULL DEFAULT '0', "total_bonus" numeric(10,2) NOT NULL DEFAULT '0', "total_penalty" numeric(10,2) NOT NULL DEFAULT '0', "net_salary" numeric(10,2) NOT NULL, "status" "public"."hr_payroll_status_enum" NOT NULL DEFAULT 'DRAFT', "paid_at" TIMESTAMP WITH TIME ZONE, "calculated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "notes" text, "staff_id" uuid NOT NULL, "approved_by" uuid, CONSTRAINT "uk_staff_payroll_month" UNIQUE ("staff_id", "payroll_month"), CONSTRAINT "PK_8ccf8d3398620c6d3588788a0e9" PRIMARY KEY ("payroll_id"))`);
        await queryRunner.query(`CREATE TABLE "hr_salary_config" ("config_id" SERIAL NOT NULL, "base_salary" numeric(10,2) NOT NULL, "standard_days_per_month" smallint NOT NULL DEFAULT '26', "effective_date" date NOT NULL DEFAULT ('now'::text)::date, "end_date" date, "staff_id" uuid NOT NULL, CONSTRAINT "uk_staff_effective_date" UNIQUE ("staff_id", "effective_date"), CONSTRAINT "PK_39293a8e30fca373dcc112cec0d" PRIMARY KEY ("config_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."hr_allowances_target_type_enum" AS ENUM('INDIVIDUAL', 'GROUP')`);
        await queryRunner.query(`CREATE TABLE "hr_allowances" ("allowance_id" SERIAL NOT NULL, "allowance_type" character varying(50) NOT NULL, "amount" numeric(10,2) NOT NULL, "target_type" "public"."hr_allowances_target_type_enum" NOT NULL, "start_date" date NOT NULL, "end_date" date, "description" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "staff_id" uuid, "role_id" integer, "created_by" uuid NOT NULL, CONSTRAINT "PK_7b9269664bd4da4a3876daf4c81" PRIMARY KEY ("allowance_id"))`);
        await queryRunner.query(`ALTER TABLE "hr_leave_requests" ADD CONSTRAINT "FK_bc611bb2fbaf8b7acf641e211f2" FOREIGN KEY ("staff_id") REFERENCES "staff_profiles"("staff_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "hr_leave_requests" ADD CONSTRAINT "FK_e2471f314278e7cb66abf2e85b9" FOREIGN KEY ("decision_by") REFERENCES "staff_profiles"("staff_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "hr_time_attendance" ADD CONSTRAINT "FK_389f846f36f7d6c75050f7144f6" FOREIGN KEY ("staff_id") REFERENCES "staff_profiles"("staff_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "hr_time_attendance" ADD CONSTRAINT "FK_3e7aa305037a80125dbf4ad4819" FOREIGN KEY ("shift_id") REFERENCES "hr_shifts"("shift_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "hr_time_attendance" ADD CONSTRAINT "FK_0468df44cd84def3d1a7532fa1d" FOREIGN KEY ("leave_request_id") REFERENCES "hr_leave_requests"("request_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "hr_payroll" ADD CONSTRAINT "FK_f5217ea63e142d33f897082631e" FOREIGN KEY ("staff_id") REFERENCES "staff_profiles"("staff_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "hr_payroll" ADD CONSTRAINT "FK_3843a6390101b91e80baef32568" FOREIGN KEY ("approved_by") REFERENCES "staff_profiles"("staff_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "hr_salary_config" ADD CONSTRAINT "FK_4f6170fe2a3a409fc5e9c986975" FOREIGN KEY ("staff_id") REFERENCES "staff_profiles"("staff_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "hr_allowances" ADD CONSTRAINT "FK_68c4a0e24354798ebce476dac3b" FOREIGN KEY ("staff_id") REFERENCES "staff_profiles"("staff_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "hr_allowances" ADD CONSTRAINT "FK_c550fb0852b4358b32ea3375667" FOREIGN KEY ("role_id") REFERENCES "sys_roles"("role_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "hr_allowances" ADD CONSTRAINT "FK_13c464d9153520d0d69fa0232a2" FOREIGN KEY ("created_by") REFERENCES "staff_profiles"("staff_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "hr_allowances" DROP CONSTRAINT "FK_13c464d9153520d0d69fa0232a2"`);
        await queryRunner.query(`ALTER TABLE "hr_allowances" DROP CONSTRAINT "FK_c550fb0852b4358b32ea3375667"`);
        await queryRunner.query(`ALTER TABLE "hr_allowances" DROP CONSTRAINT "FK_68c4a0e24354798ebce476dac3b"`);
        await queryRunner.query(`ALTER TABLE "hr_salary_config" DROP CONSTRAINT "FK_4f6170fe2a3a409fc5e9c986975"`);
        await queryRunner.query(`ALTER TABLE "hr_payroll" DROP CONSTRAINT "FK_3843a6390101b91e80baef32568"`);
        await queryRunner.query(`ALTER TABLE "hr_payroll" DROP CONSTRAINT "FK_f5217ea63e142d33f897082631e"`);
        await queryRunner.query(`ALTER TABLE "hr_time_attendance" DROP CONSTRAINT "FK_0468df44cd84def3d1a7532fa1d"`);
        await queryRunner.query(`ALTER TABLE "hr_time_attendance" DROP CONSTRAINT "FK_3e7aa305037a80125dbf4ad4819"`);
        await queryRunner.query(`ALTER TABLE "hr_time_attendance" DROP CONSTRAINT "FK_389f846f36f7d6c75050f7144f6"`);
        await queryRunner.query(`ALTER TABLE "hr_leave_requests" DROP CONSTRAINT "FK_e2471f314278e7cb66abf2e85b9"`);
        await queryRunner.query(`ALTER TABLE "hr_leave_requests" DROP CONSTRAINT "FK_bc611bb2fbaf8b7acf641e211f2"`);
        await queryRunner.query(`DROP TABLE "hr_allowances"`);
        await queryRunner.query(`DROP TYPE "public"."hr_allowances_target_type_enum"`);
        await queryRunner.query(`DROP TABLE "hr_salary_config"`);
        await queryRunner.query(`DROP TABLE "hr_payroll"`);
        await queryRunner.query(`DROP TYPE "public"."hr_payroll_status_enum"`);
        await queryRunner.query(`DROP TABLE "hr_time_attendance"`);
        await queryRunner.query(`DROP TYPE "public"."hr_time_attendance_status_enum"`);
        await queryRunner.query(`DROP TABLE "hr_leave_requests"`);
        await queryRunner.query(`DROP TYPE "public"."hr_leave_requests_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."hr_leave_requests_leave_type_enum"`);
        await queryRunner.query(`DROP TABLE "hr_shifts"`);
    }

}
