import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchemaAuth1765212986237 implements MigrationInterface {
    name = 'InitSchemaAuth1765212986237'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "sys_users" ("user_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "username" character varying(100) NOT NULL, "password" character varying(255) NOT NULL, "email" character varying(150), "phone" character varying(20), "cccd" character varying(12), "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_466c22a61fbc6141d7b064cbed4" UNIQUE ("username"), CONSTRAINT "PK_360c27699169a865b1c7aa6f8d7" PRIMARY KEY ("user_id"))`);
        await queryRunner.query(`CREATE TABLE "sys_roles" ("role_id" SERIAL NOT NULL, "role_code" character varying(50) NOT NULL, "role_name" character varying(100), "description" text, CONSTRAINT "UQ_d50f63eff3ee563a92cdca56bf6" UNIQUE ("role_code"), CONSTRAINT "PK_b94678bcefe1a557ed67613bbfa" PRIMARY KEY ("role_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."org_rooms_room_type_enum" AS ENUM('CLINIC', 'IMAGING', 'LAB', 'PHARMACY', 'CASHIER', 'ADMIN')`);
        await queryRunner.query(`CREATE TABLE "org_rooms" ("room_id" SERIAL NOT NULL, "room_name" character varying(100) NOT NULL, "room_type" "public"."org_rooms_room_type_enum", "is_active" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_f76b9aae085d880b9b27ce208c8" PRIMARY KEY ("room_id"))`);
        await queryRunner.query(`CREATE TABLE "ref_specialties" ("specialty_id" SERIAL NOT NULL, "specialty_code" character varying(50) NOT NULL, "specialty_name" character varying(255) NOT NULL, "description" text, "is_active" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_957c6df5382e1b12df47b51157f" UNIQUE ("specialty_code"), CONSTRAINT "PK_3efcc291a06a2f0e2ca2204e9c8" PRIMARY KEY ("specialty_id"))`);
        await queryRunner.query(`CREATE TABLE "staff_profiles" ("staff_id" uuid NOT NULL, "full_name" character varying(255) NOT NULL, "signature_url" character varying(500), "deleted_at" TIMESTAMP WITH TIME ZONE, "role_id" integer NOT NULL, "assigned_room_id" integer, "specialty_id" integer, CONSTRAINT "PK_4f32f1a897f75bafed4199fb0bf" PRIMARY KEY ("staff_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."patient_profiles_gender_enum" AS ENUM('NAM', 'NU', 'KHAC')`);
        await queryRunner.query(`CREATE TABLE "patient_profiles" ("patient_id" uuid NOT NULL, "full_name" character varying(255) NOT NULL, "dob" date NOT NULL, "gender" "public"."patient_profiles_gender_enum" NOT NULL, "address" text, "medical_history" text, "allergy_history" text, "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_93e9bd4212c9d779fb8b4398bd7" PRIMARY KEY ("patient_id"))`);
        await queryRunner.query(`ALTER TABLE "staff_profiles" ADD CONSTRAINT "FK_4f32f1a897f75bafed4199fb0bf" FOREIGN KEY ("staff_id") REFERENCES "sys_users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "staff_profiles" ADD CONSTRAINT "FK_202fa10b67fa2a55f4c53b704ed" FOREIGN KEY ("role_id") REFERENCES "sys_roles"("role_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "staff_profiles" ADD CONSTRAINT "FK_cb1a0b04899905a2d423ed4b2ee" FOREIGN KEY ("assigned_room_id") REFERENCES "org_rooms"("room_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "staff_profiles" ADD CONSTRAINT "FK_3f82683aa41853a895289b18d0d" FOREIGN KEY ("specialty_id") REFERENCES "ref_specialties"("specialty_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "patient_profiles" ADD CONSTRAINT "FK_93e9bd4212c9d779fb8b4398bd7" FOREIGN KEY ("patient_id") REFERENCES "sys_users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patient_profiles" DROP CONSTRAINT "FK_93e9bd4212c9d779fb8b4398bd7"`);
        await queryRunner.query(`ALTER TABLE "staff_profiles" DROP CONSTRAINT "FK_3f82683aa41853a895289b18d0d"`);
        await queryRunner.query(`ALTER TABLE "staff_profiles" DROP CONSTRAINT "FK_cb1a0b04899905a2d423ed4b2ee"`);
        await queryRunner.query(`ALTER TABLE "staff_profiles" DROP CONSTRAINT "FK_202fa10b67fa2a55f4c53b704ed"`);
        await queryRunner.query(`ALTER TABLE "staff_profiles" DROP CONSTRAINT "FK_4f32f1a897f75bafed4199fb0bf"`);
        await queryRunner.query(`DROP TABLE "patient_profiles"`);
        await queryRunner.query(`DROP TYPE "public"."patient_profiles_gender_enum"`);
        await queryRunner.query(`DROP TABLE "staff_profiles"`);
        await queryRunner.query(`DROP TABLE "ref_specialties"`);
        await queryRunner.query(`DROP TABLE "org_rooms"`);
        await queryRunner.query(`DROP TYPE "public"."org_rooms_room_type_enum"`);
        await queryRunner.query(`DROP TABLE "sys_roles"`);
        await queryRunner.query(`DROP TABLE "sys_users"`);
    }

}
