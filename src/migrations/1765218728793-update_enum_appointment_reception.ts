import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateEnumAppointmentReception1765218728793 implements MigrationInterface {
    name = 'UpdateEnumAppointmentReception1765218728793'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "online_appointments" DROP COLUMN "status"`);
        await queryRunner.query(`CREATE TYPE "public"."online_appointments_status_enum" AS ENUM('PENDING', 'CONFIRMED', 'RESCHEDULED', 'CANCELLED', 'NO_SHOW', 'COMPLETED')`);
        await queryRunner.query(`ALTER TABLE "online_appointments" ADD "status" "public"."online_appointments_status_enum" NOT NULL DEFAULT 'CONFIRMED'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "online_appointments" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."online_appointments_status_enum"`);
        await queryRunner.query(`ALTER TABLE "online_appointments" ADD "status" character varying(50) NOT NULL DEFAULT 'CONFIRMED'`);
    }

}
