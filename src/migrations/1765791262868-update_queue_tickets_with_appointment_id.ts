import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateQueueTicketsWithAppointmentId1765791262868 implements MigrationInterface {
    name = 'UpdateQueueTicketsWithAppointmentId1765791262868'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "queue_tickets" ADD "appointment_id" uuid`);
        await queryRunner.query(`ALTER TABLE "online_appointments" ALTER COLUMN "status" SET DEFAULT 'PENDING'`);
        await queryRunner.query(`ALTER TABLE "queue_tickets" ADD CONSTRAINT "FK_0c3d5c1296959eb6a1c000c847b" FOREIGN KEY ("appointment_id") REFERENCES "online_appointments"("appointment_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "queue_tickets" DROP CONSTRAINT "FK_0c3d5c1296959eb6a1c000c847b"`);
        await queryRunner.query(`ALTER TABLE "online_appointments" ALTER COLUMN "status" SET DEFAULT 'CONFIRMED'`);
        await queryRunner.query(`ALTER TABLE "queue_tickets" DROP COLUMN "appointment_id"`);
    }

}
