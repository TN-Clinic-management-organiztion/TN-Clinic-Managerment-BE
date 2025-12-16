import { MigrationInterface, QueryRunner } from "typeorm";

export class ResultImagesUpdatePublicId1765345770095 implements MigrationInterface {
    name = 'ResultImagesUpdatePublicId1765345770095'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "result_images" ADD "public_id" character varying(255) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "result_images" DROP COLUMN "public_id"`);
    }

}
