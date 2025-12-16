import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateEnumReception1765217984531 implements MigrationInterface {
    name = 'UpdateEnumReception1765217984531'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "medical_encounters" DROP COLUMN "current_status"`);
        await queryRunner.query(`CREATE TYPE "public"."medical_encounters_current_status_enum" AS ENUM('REGISTERED', 'AWAITING_PAYMENT', 'IN_CONSULTATION', 'AWAITING_CLS', 'IN_CLS', 'CLS_COMPLETED', 'RESULTS_READY', 'COMPLETED')`);
        await queryRunner.query(`ALTER TABLE "medical_encounters" ADD "current_status" "public"."medical_encounters_current_status_enum" NOT NULL DEFAULT 'REGISTERED'`);
        await queryRunner.query(`ALTER TABLE "queue_tickets" DROP COLUMN "ticket_type"`);
        await queryRunner.query(`CREATE TYPE "public"."queue_tickets_ticket_type_enum" AS ENUM('REGISTRATION', 'CONSULTATION', 'SERVICE')`);
        await queryRunner.query(`ALTER TABLE "queue_tickets" ADD "ticket_type" "public"."queue_tickets_ticket_type_enum" NOT NULL`);
        await queryRunner.query(`ALTER TABLE "queue_tickets" DROP COLUMN "source"`);
        await queryRunner.query(`CREATE TYPE "public"."queue_tickets_source_enum" AS ENUM('ONLINE', 'WALKIN')`);
        await queryRunner.query(`ALTER TABLE "queue_tickets" ADD "source" "public"."queue_tickets_source_enum" NOT NULL DEFAULT 'WALKIN'`);
        await queryRunner.query(`ALTER TABLE "queue_tickets" DROP COLUMN "status"`);
        await queryRunner.query(`CREATE TYPE "public"."queue_tickets_status_enum" AS ENUM('WAITING', 'CALLED', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED')`);
        await queryRunner.query(`ALTER TABLE "queue_tickets" ADD "status" "public"."queue_tickets_status_enum" NOT NULL DEFAULT 'WAITING'`);
        await queryRunner.query(`ALTER TABLE "queue_counters" DROP COLUMN "ticket_type"`);
        await queryRunner.query(`CREATE TYPE "public"."queue_counters_ticket_type_enum" AS ENUM('REGISTRATION', 'CONSULTATION', 'SERVICE')`);
        await queryRunner.query(`ALTER TABLE "queue_counters" ADD "ticket_type" "public"."queue_counters_ticket_type_enum" NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "queue_counters" DROP COLUMN "ticket_type"`);
        await queryRunner.query(`DROP TYPE "public"."queue_counters_ticket_type_enum"`);
        await queryRunner.query(`ALTER TABLE "queue_counters" ADD "ticket_type" character varying(20) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "queue_tickets" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."queue_tickets_status_enum"`);
        await queryRunner.query(`ALTER TABLE "queue_tickets" ADD "status" character varying(20) NOT NULL DEFAULT 'WAITING'`);
        await queryRunner.query(`ALTER TABLE "queue_tickets" DROP COLUMN "source"`);
        await queryRunner.query(`DROP TYPE "public"."queue_tickets_source_enum"`);
        await queryRunner.query(`ALTER TABLE "queue_tickets" ADD "source" character varying(20) NOT NULL DEFAULT 'WALKIN'`);
        await queryRunner.query(`ALTER TABLE "queue_tickets" DROP COLUMN "ticket_type"`);
        await queryRunner.query(`DROP TYPE "public"."queue_tickets_ticket_type_enum"`);
        await queryRunner.query(`ALTER TABLE "queue_tickets" ADD "ticket_type" character varying(20) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "medical_encounters" DROP COLUMN "current_status"`);
        await queryRunner.query(`DROP TYPE "public"."medical_encounters_current_status_enum"`);
        await queryRunner.query(`ALTER TABLE "medical_encounters" ADD "current_status" character varying(50) NOT NULL DEFAULT 'REGISTERED'`);
    }

}
