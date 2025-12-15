import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateQueueTicketsWithIndexUnique1765797289736 implements MigrationInterface {
    name = 'UpdateQueueTicketsWithIndexUnique1765797289736'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE UNIQUE INDEX "uq_queue_ticket_appointment" ON "queue_tickets" ("appointment_id") WHERE "appointment_id" IS NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX "uq_counter_room_type_day" ON "queue_counters" ("room_id", "ticket_type", "reset_date") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."uq_counter_room_type_day"`);
        await queryRunner.query(`DROP INDEX "public"."uq_queue_ticket_appointment"`);
    }

}
