import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveIsDeprecatedAndUpdateEnum1765538282652 implements MigrationInterface {
    name = 'RemoveIsDeprecatedAndUpdateEnum1765538282652'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "image_annotations" DROP COLUMN "is_deprecated"`);
        await queryRunner.query(`ALTER TYPE "public"."image_annotations_annotation_status_enum" RENAME TO "image_annotations_annotation_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."image_annotations_annotation_status_enum" AS ENUM('IN_PROGRESS', 'SUBMITTED', 'APPROVED', 'REJECTED', 'DEPRECATED')`);
        await queryRunner.query(`ALTER TABLE "image_annotations" ALTER COLUMN "annotation_status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "image_annotations" ALTER COLUMN "annotation_status" TYPE "public"."image_annotations_annotation_status_enum" USING "annotation_status"::"text"::"public"."image_annotations_annotation_status_enum"`);
        await queryRunner.query(`ALTER TABLE "image_annotations" ALTER COLUMN "annotation_status" SET DEFAULT 'IN_PROGRESS'`);
        await queryRunner.query(`DROP TYPE "public"."image_annotations_annotation_status_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."image_annotations_annotation_status_enum_old" AS ENUM('IN_PROGRESS', 'SUBMITTED', 'APPROVED', 'REJECTED')`);
        await queryRunner.query(`ALTER TABLE "image_annotations" ALTER COLUMN "annotation_status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "image_annotations" ALTER COLUMN "annotation_status" TYPE "public"."image_annotations_annotation_status_enum_old" USING "annotation_status"::"text"::"public"."image_annotations_annotation_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "image_annotations" ALTER COLUMN "annotation_status" SET DEFAULT 'IN_PROGRESS'`);
        await queryRunner.query(`DROP TYPE "public"."image_annotations_annotation_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."image_annotations_annotation_status_enum_old" RENAME TO "image_annotations_annotation_status_enum"`);
        await queryRunner.query(`ALTER TABLE "image_annotations" ADD "is_deprecated" boolean NOT NULL DEFAULT false`);
    }

}
