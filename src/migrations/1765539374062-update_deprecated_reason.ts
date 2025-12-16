import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateDeprecatedReason1765539374062 implements MigrationInterface {
    name = 'UpdateDeprecatedReason1765539374062'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "image_annotations" ADD "deprecation_reason" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "image_annotations" DROP COLUMN "deprecation_reason"`);
    }

}
