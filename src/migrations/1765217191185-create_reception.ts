import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateReception1765217191185 implements MigrationInterface {
    name = 'CreateReception1765217191185'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "ref_icd10" ("icd_code" character varying(10) NOT NULL, "name_vi" character varying(500) NOT NULL, "name_en" character varying(500), "level" integer, "is_leaf" boolean NOT NULL DEFAULT false, "active" boolean NOT NULL DEFAULT true, "parent_code" character varying(10), CONSTRAINT "PK_ab183b9cc9e377cb84f114e7449" PRIMARY KEY ("icd_code"))`);
        await queryRunner.query(`CREATE TABLE "medical_encounters" ("encounter_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "visit_date" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), "current_status" character varying(50) NOT NULL DEFAULT 'REGISTERED', "initial_symptoms" text, "doctor_conclusion" text, "deleted_at" TIMESTAMP WITH TIME ZONE, "patient_id" uuid, "doctor_id" uuid, "assigned_room_id" integer, "final_icd_code" character varying(10), CONSTRAINT "PK_2a840667ef58abb1f90226ab28b" PRIMARY KEY ("encounter_id"))`);
        await queryRunner.query(`CREATE TABLE "queue_tickets" ("ticket_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "ticket_type" character varying(20) NOT NULL, "display_number" integer NOT NULL, "source" character varying(20) NOT NULL DEFAULT 'WALKIN', "status" character varying(20) NOT NULL DEFAULT 'WAITING', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "called_at" TIMESTAMP WITH TIME ZONE, "started_at" TIMESTAMP WITH TIME ZONE, "service_ids" integer array, "completed_at" TIMESTAMP WITH TIME ZONE, "encounter_id" uuid, "room_id" integer NOT NULL, CONSTRAINT "PK_e573582e059b4043f3275aecead" PRIMARY KEY ("ticket_id"))`);
        await queryRunner.query(`CREATE TABLE "queue_counters" ("counter_id" SERIAL NOT NULL, "ticket_type" character varying(20) NOT NULL, "last_number" integer NOT NULL DEFAULT '0', "reset_date" date NOT NULL DEFAULT ('now'::text)::date, "room_id" integer NOT NULL, CONSTRAINT "PK_d55dbbc8a94c8f6b4ecf704e4e7" PRIMARY KEY ("counter_id"))`);
        await queryRunner.query(`CREATE TABLE "online_appointments" ("appointment_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "appointment_date" date NOT NULL, "appointment_time" TIME NOT NULL, "symptoms" text, "status" character varying(50) NOT NULL DEFAULT 'CONFIRMED', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "patient_id" uuid NOT NULL, "desired_room_id" integer, "desired_doctor_id" uuid, CONSTRAINT "PK_5c17937c46ca4e74eaaa020eb46" PRIMARY KEY ("appointment_id"))`);
        await queryRunner.query(`ALTER TABLE "ref_icd10" ADD CONSTRAINT "FK_1f8549d688a778e335445c7f43c" FOREIGN KEY ("parent_code") REFERENCES "ref_icd10"("icd_code") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "medical_encounters" ADD CONSTRAINT "FK_fb21b35bbed6cead5e8b96a6f80" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("patient_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "medical_encounters" ADD CONSTRAINT "FK_e85aa4d3098343e6ba571b7059c" FOREIGN KEY ("doctor_id") REFERENCES "staff_profiles"("staff_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "medical_encounters" ADD CONSTRAINT "FK_f11b9babce0f2fef0d5ec9bef57" FOREIGN KEY ("assigned_room_id") REFERENCES "org_rooms"("room_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "medical_encounters" ADD CONSTRAINT "FK_ead60871a4855f25e1c3c9b0261" FOREIGN KEY ("final_icd_code") REFERENCES "ref_icd10"("icd_code") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "queue_tickets" ADD CONSTRAINT "FK_ff46ce7ef2e6fed3ba4322395a9" FOREIGN KEY ("encounter_id") REFERENCES "medical_encounters"("encounter_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "queue_tickets" ADD CONSTRAINT "FK_70bcec25fe6985aceabb77152e7" FOREIGN KEY ("room_id") REFERENCES "org_rooms"("room_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "queue_counters" ADD CONSTRAINT "FK_1af2fa53b6a7968b8cde9fb7ecf" FOREIGN KEY ("room_id") REFERENCES "org_rooms"("room_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "online_appointments" ADD CONSTRAINT "FK_c1ff24f12ab94d1531f4ebe912a" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("patient_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "online_appointments" ADD CONSTRAINT "FK_23ad2657ded762e62e2b6016303" FOREIGN KEY ("desired_room_id") REFERENCES "org_rooms"("room_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "online_appointments" ADD CONSTRAINT "FK_cce428e38ebc1cd15e0b75128ab" FOREIGN KEY ("desired_doctor_id") REFERENCES "staff_profiles"("staff_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "online_appointments" DROP CONSTRAINT "FK_cce428e38ebc1cd15e0b75128ab"`);
        await queryRunner.query(`ALTER TABLE "online_appointments" DROP CONSTRAINT "FK_23ad2657ded762e62e2b6016303"`);
        await queryRunner.query(`ALTER TABLE "online_appointments" DROP CONSTRAINT "FK_c1ff24f12ab94d1531f4ebe912a"`);
        await queryRunner.query(`ALTER TABLE "queue_counters" DROP CONSTRAINT "FK_1af2fa53b6a7968b8cde9fb7ecf"`);
        await queryRunner.query(`ALTER TABLE "queue_tickets" DROP CONSTRAINT "FK_70bcec25fe6985aceabb77152e7"`);
        await queryRunner.query(`ALTER TABLE "queue_tickets" DROP CONSTRAINT "FK_ff46ce7ef2e6fed3ba4322395a9"`);
        await queryRunner.query(`ALTER TABLE "medical_encounters" DROP CONSTRAINT "FK_ead60871a4855f25e1c3c9b0261"`);
        await queryRunner.query(`ALTER TABLE "medical_encounters" DROP CONSTRAINT "FK_f11b9babce0f2fef0d5ec9bef57"`);
        await queryRunner.query(`ALTER TABLE "medical_encounters" DROP CONSTRAINT "FK_e85aa4d3098343e6ba571b7059c"`);
        await queryRunner.query(`ALTER TABLE "medical_encounters" DROP CONSTRAINT "FK_fb21b35bbed6cead5e8b96a6f80"`);
        await queryRunner.query(`ALTER TABLE "ref_icd10" DROP CONSTRAINT "FK_1f8549d688a778e335445c7f43c"`);
        await queryRunner.query(`DROP TABLE "online_appointments"`);
        await queryRunner.query(`DROP TABLE "queue_counters"`);
        await queryRunner.query(`DROP TABLE "queue_tickets"`);
        await queryRunner.query(`DROP TABLE "medical_encounters"`);
        await queryRunner.query(`DROP TABLE "ref_icd10"`);
    }

}
