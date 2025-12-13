import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateNullableRefreshTokenHash1765559630793 implements MigrationInterface {
    name = 'UpdateNullableRefreshTokenHash1765559630793'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sys_users" ADD "refresh_token_hash" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "sys_users" ALTER COLUMN "username" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sys_users" ALTER COLUMN "password" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sys_users" ADD CONSTRAINT "UQ_71f921cdd2a2d68e7825152c684" UNIQUE ("cccd")`);
        await queryRunner.query(`CREATE INDEX "IDX_466c22a61fbc6141d7b064cbed" ON "sys_users" ("username") `);
        await queryRunner.query(`CREATE INDEX "IDX_71f921cdd2a2d68e7825152c68" ON "sys_users" ("cccd") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_71f921cdd2a2d68e7825152c68"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_466c22a61fbc6141d7b064cbed"`);
        await queryRunner.query(`ALTER TABLE "sys_users" DROP CONSTRAINT "UQ_71f921cdd2a2d68e7825152c684"`);
        await queryRunner.query(`ALTER TABLE "sys_users" ALTER COLUMN "password" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sys_users" ALTER COLUMN "username" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sys_users" DROP COLUMN "refresh_token_hash"`);
    }

}
