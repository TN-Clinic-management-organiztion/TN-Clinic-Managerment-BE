import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateNullableUsernamePassword1765556894568 implements MigrationInterface {
    name = 'UpdateNullableUsernamePassword1765556894568'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sys_users" ALTER COLUMN "username" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sys_users" ALTER COLUMN "password" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sys_users" ALTER COLUMN "password" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sys_users" ALTER COLUMN "username" SET NOT NULL`);
    }

}
