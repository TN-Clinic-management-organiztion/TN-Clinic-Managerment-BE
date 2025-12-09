import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTableAi1765253205622 implements MigrationInterface {
    name = 'CreateTableAi1765253205622'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."image_annotations_annotation_source_enum" AS ENUM('AI', 'HUMAN')`);
        await queryRunner.query(`CREATE TYPE "public"."image_annotations_annotation_status_enum" AS ENUM('DRAFT', 'REVIEWED', 'APPROVED')`);
        await queryRunner.query(`CREATE TABLE "image_annotations" ("annotation_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "annotation_source" "public"."image_annotations_annotation_source_enum" NOT NULL, "annotation_data" jsonb NOT NULL, "ai_model_name" character varying(100), "ai_model_version" character varying(50), "labeled_at" TIMESTAMP WITH TIME ZONE, "reviewed_at" TIMESTAMP WITH TIME ZONE, "approved_at" TIMESTAMP WITH TIME ZONE, "annotation_status" "public"."image_annotations_annotation_status_enum" NOT NULL DEFAULT 'DRAFT', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "image_id" uuid NOT NULL, "labeled_by" uuid, "reviewed_by" uuid, "approved_by" uuid, CONSTRAINT "PK_fb3df6efc4e13e2e9d35e97afbc" PRIMARY KEY ("annotation_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."annotation_projects_task_type_enum" AS ENUM('CLASSIFICATION', 'BOUNDING_BOX', 'SEGMENTATION', 'KEYPOINT', 'OCR', 'OTHER')`);
        await queryRunner.query(`CREATE TABLE "annotation_projects" ("project_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "description" text, "task_type" "public"."annotation_projects_task_type_enum" NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_by" uuid, CONSTRAINT "PK_1bfcf1c8bb3fd31f0a23c7fe6ec" PRIMARY KEY ("project_id"))`);
        await queryRunner.query(`CREATE TABLE "annotation_project_images" ("project_id" uuid NOT NULL, "image_id" uuid NOT NULL, "added_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "added_by" uuid, CONSTRAINT "PK_d68f68a6f34f807a5e694943d84" PRIMARY KEY ("project_id", "image_id"))`);
        await queryRunner.query(`ALTER TABLE "image_annotations" ADD CONSTRAINT "FK_8b565f0ccae41bb2f0dbbd75c0c" FOREIGN KEY ("image_id") REFERENCES "result_images"("image_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "image_annotations" ADD CONSTRAINT "FK_85ccc13722395a81571042d9156" FOREIGN KEY ("labeled_by") REFERENCES "staff_profiles"("staff_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "image_annotations" ADD CONSTRAINT "FK_1ce61e3181369a003b92ad6b9a1" FOREIGN KEY ("reviewed_by") REFERENCES "staff_profiles"("staff_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "image_annotations" ADD CONSTRAINT "FK_c25a542133e48d8021a8c09c59f" FOREIGN KEY ("approved_by") REFERENCES "staff_profiles"("staff_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "annotation_projects" ADD CONSTRAINT "FK_578673b9bb1c2c290ea2592741b" FOREIGN KEY ("created_by") REFERENCES "staff_profiles"("staff_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "annotation_project_images" ADD CONSTRAINT "FK_d1a63f47f3dacd794f5046df2a6" FOREIGN KEY ("project_id") REFERENCES "annotation_projects"("project_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "annotation_project_images" ADD CONSTRAINT "FK_df13cb07873e18e14e4f6124abc" FOREIGN KEY ("image_id") REFERENCES "result_images"("image_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "annotation_project_images" ADD CONSTRAINT "FK_6f5210a1cb02261c4de8d70b8c0" FOREIGN KEY ("added_by") REFERENCES "staff_profiles"("staff_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "annotation_project_images" DROP CONSTRAINT "FK_6f5210a1cb02261c4de8d70b8c0"`);
        await queryRunner.query(`ALTER TABLE "annotation_project_images" DROP CONSTRAINT "FK_df13cb07873e18e14e4f6124abc"`);
        await queryRunner.query(`ALTER TABLE "annotation_project_images" DROP CONSTRAINT "FK_d1a63f47f3dacd794f5046df2a6"`);
        await queryRunner.query(`ALTER TABLE "annotation_projects" DROP CONSTRAINT "FK_578673b9bb1c2c290ea2592741b"`);
        await queryRunner.query(`ALTER TABLE "image_annotations" DROP CONSTRAINT "FK_c25a542133e48d8021a8c09c59f"`);
        await queryRunner.query(`ALTER TABLE "image_annotations" DROP CONSTRAINT "FK_1ce61e3181369a003b92ad6b9a1"`);
        await queryRunner.query(`ALTER TABLE "image_annotations" DROP CONSTRAINT "FK_85ccc13722395a81571042d9156"`);
        await queryRunner.query(`ALTER TABLE "image_annotations" DROP CONSTRAINT "FK_8b565f0ccae41bb2f0dbbd75c0c"`);
        await queryRunner.query(`DROP TABLE "annotation_project_images"`);
        await queryRunner.query(`DROP TABLE "annotation_projects"`);
        await queryRunner.query(`DROP TYPE "public"."annotation_projects_task_type_enum"`);
        await queryRunner.query(`DROP TABLE "image_annotations"`);
        await queryRunner.query(`DROP TYPE "public"."image_annotations_annotation_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."image_annotations_annotation_source_enum"`);
    }

}
