import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTableSystem1765264831599 implements MigrationInterface {
    name = 'CreateTableSystem1765264831599'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."system_notifications_notification_type_enum" AS ENUM('SYSTEM', 'APPOINTMENT', 'URGENT', 'LEAVE', 'PAYROLL', 'TASK')`);
        await queryRunner.query(`CREATE TABLE "system_notifications" ("notification_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(200) NOT NULL, "message" text NOT NULL, "notification_type" "public"."system_notifications_notification_type_enum" NOT NULL DEFAULT 'SYSTEM', "is_read" boolean NOT NULL DEFAULT false, "is_important" boolean NOT NULL DEFAULT false, "sender_name" character varying(100) NOT NULL DEFAULT 'Hệ thống', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "read_at" TIMESTAMP WITH TIME ZONE, "is_deleted" boolean NOT NULL DEFAULT false, "user_id" uuid NOT NULL, "sender_id" uuid, CONSTRAINT "PK_e5f653c46aaa7f7c013de4e6949" PRIMARY KEY ("notification_id"))`);
        await queryRunner.query(`CREATE TABLE "system_audit_logs" ("log_id" BIGSERIAL NOT NULL, "user_id" uuid, "action_type" character varying(50), "table_name" character varying(50), "record_id" character varying(50), "old_value" jsonb, "new_value" jsonb, "ip_address" inet, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_857440f1a83e764ef8149847a8e" PRIMARY KEY ("log_id"))`);
        await queryRunner.query(`CREATE TABLE "system_config" ("config_id" SERIAL NOT NULL, "config_key" character varying(100) NOT NULL, "config_value" character varying(500) NOT NULL, "config_type" character varying(50) NOT NULL DEFAULT 'GENERAL', "description" text, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_by" uuid, CONSTRAINT "UQ_c54d4e3d5a246ef29601e48d751" UNIQUE ("config_key"), CONSTRAINT "PK_49ea995519ff033fdbed374cdfb" PRIMARY KEY ("config_id"))`);
        await queryRunner.query(`ALTER TABLE "system_notifications" ADD CONSTRAINT "FK_0d846fbfc20a6cb6fe06e61b41e" FOREIGN KEY ("user_id") REFERENCES "staff_profiles"("staff_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "system_notifications" ADD CONSTRAINT "FK_4729e2a2eda3f5d226c5174e66f" FOREIGN KEY ("sender_id") REFERENCES "staff_profiles"("staff_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "system_config" ADD CONSTRAINT "FK_674473bbaa9859ba7e7d9f7ea9e" FOREIGN KEY ("updated_by") REFERENCES "staff_profiles"("staff_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "system_config" DROP CONSTRAINT "FK_674473bbaa9859ba7e7d9f7ea9e"`);
        await queryRunner.query(`ALTER TABLE "system_notifications" DROP CONSTRAINT "FK_4729e2a2eda3f5d226c5174e66f"`);
        await queryRunner.query(`ALTER TABLE "system_notifications" DROP CONSTRAINT "FK_0d846fbfc20a6cb6fe06e61b41e"`);
        await queryRunner.query(`DROP TABLE "system_config"`);
        await queryRunner.query(`DROP TABLE "system_audit_logs"`);
        await queryRunner.query(`DROP TABLE "system_notifications"`);
        await queryRunner.query(`DROP TYPE "public"."system_notifications_notification_type_enum"`);
    }

}
