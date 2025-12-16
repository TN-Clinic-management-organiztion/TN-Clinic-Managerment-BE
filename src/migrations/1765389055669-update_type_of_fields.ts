import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateTypeOfFields1765389055669 implements MigrationInterface {
    name = 'UpdateTypeOfFields1765389055669'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "system_notifications" DROP COLUMN "is_deleted"`);
        await queryRunner.query(`ALTER TABLE "system_notifications" DROP COLUMN "is_important"`);
        await queryRunner.query(`ALTER TABLE "system_notifications" DROP COLUMN "sender_name"`);
        await queryRunner.query(`ALTER TABLE "system_notifications" DROP COLUMN "read_at"`);
        await queryRunner.query(`ALTER TABLE "result_images" ALTER COLUMN "public_id" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "result_images" ALTER COLUMN "public_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "system_notifications" ADD "read_at" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "system_notifications" ADD "sender_name" character varying(100) NOT NULL DEFAULT 'Hệ thống'`);
        await queryRunner.query(`ALTER TABLE "system_notifications" ADD "is_important" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "system_notifications" ADD "is_deleted" boolean NOT NULL DEFAULT false`);
    }

}
