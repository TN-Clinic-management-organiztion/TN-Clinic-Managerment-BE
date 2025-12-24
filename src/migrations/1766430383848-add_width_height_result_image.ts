import { MigrationInterface, QueryRunner } from "typeorm";

export class AddWidthHeightResultImage1766430383848 implements MigrationInterface {
    name = 'AddWidthHeightResultImage1766430383848'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "result_images" ADD "image_width" integer`);
        await queryRunner.query(`ALTER TABLE "result_images" ADD "image_height" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "result_images" DROP COLUMN "image_height"`);
        await queryRunner.query(`ALTER TABLE "result_images" DROP COLUMN "image_width"`);
    }

}
