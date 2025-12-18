import { MigrationInterface, QueryRunner } from "typeorm";

export class DeleteTemplateDiscussionApprovingDoctorIdTempalateId1766065433309 implements MigrationInterface {
    name = 'DeleteTemplateDiscussionApprovingDoctorIdTempalateId1766065433309'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "service_results" DROP CONSTRAINT "FK_e767cd88327e09d203792ec09e5"`);
        await queryRunner.query(`ALTER TABLE "service_results" DROP CONSTRAINT "FK_86688ee1acf6be226b2cd1bf4bb"`);
        await queryRunner.query(`ALTER TABLE "service_results" DROP COLUMN "used_template_id"`);
        await queryRunner.query(`ALTER TABLE "service_results" DROP COLUMN "approving_doctor_id"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "service_results" ADD "approving_doctor_id" uuid`);
        await queryRunner.query(`ALTER TABLE "service_results" ADD "used_template_id" integer`);
        await queryRunner.query(`ALTER TABLE "service_results" ADD CONSTRAINT "FK_86688ee1acf6be226b2cd1bf4bb" FOREIGN KEY ("approving_doctor_id") REFERENCES "staff_profiles"("staff_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "service_results" ADD CONSTRAINT "FK_e767cd88327e09d203792ec09e5" FOREIGN KEY ("used_template_id") REFERENCES "service_report_templates"("template_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
