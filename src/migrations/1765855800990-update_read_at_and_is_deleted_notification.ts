import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateReadAtAndIsDeletedNotification1765855800990 implements MigrationInterface {
    name = 'UpdateReadAtAndIsDeletedNotification1765855800990'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "system_notifications" ADD "read_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "system_notifications" ADD "is_deleted" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "system_notifications" DROP COLUMN "is_deleted"`);
        await queryRunner.query(`ALTER TABLE "system_notifications" DROP COLUMN "read_at"`);
    }

}
