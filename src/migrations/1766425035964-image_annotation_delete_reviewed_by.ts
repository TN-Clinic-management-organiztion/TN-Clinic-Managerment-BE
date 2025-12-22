import { MigrationInterface, QueryRunner } from "typeorm";

export class ImageAnnotationDeleteReviewedBy1766425035964 implements MigrationInterface {
    name = 'ImageAnnotationDeleteReviewedBy1766425035964'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "image_annotations" DROP CONSTRAINT "FK_1ce61e3181369a003b92ad6b9a1"`);
        await queryRunner.query(`ALTER TABLE "service_requests" DROP COLUMN "payment_status"`);
        await queryRunner.query(`DROP TYPE "public"."service_requests_payment_status_enum"`);
        await queryRunner.query(`ALTER TABLE "image_annotations" DROP COLUMN "reviewed_by"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "image_annotations" ADD "reviewed_by" uuid`);
        await queryRunner.query(`CREATE TYPE "public"."service_requests_payment_status_enum" AS ENUM('UNPAID', 'PARTIALLY_PAID', 'PAID', 'CANCELLED')`);
        await queryRunner.query(`ALTER TABLE "service_requests" ADD "payment_status" "public"."service_requests_payment_status_enum" NOT NULL DEFAULT 'UNPAID'`);
        await queryRunner.query(`ALTER TABLE "image_annotations" ADD CONSTRAINT "FK_1ce61e3181369a003b92ad6b9a1" FOREIGN KEY ("reviewed_by") REFERENCES "staff_profiles"("staff_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
