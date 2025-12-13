import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateCascadeIcd101765631784747 implements MigrationInterface {
    name = 'UpdateCascadeIcd101765631784747'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ref_icd10" DROP CONSTRAINT "FK_1f8549d688a778e335445c7f43c"`);
        await queryRunner.query(`ALTER TABLE "ref_icd10" ADD CONSTRAINT "FK_1f8549d688a778e335445c7f43c" FOREIGN KEY ("parent_code") REFERENCES "ref_icd10"("icd_code") ON DELETE NO ACTION ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ref_icd10" DROP CONSTRAINT "FK_1f8549d688a778e335445c7f43c"`);
        await queryRunner.query(`ALTER TABLE "ref_icd10" ADD CONSTRAINT "FK_1f8549d688a778e335445c7f43c" FOREIGN KEY ("parent_code") REFERENCES "ref_icd10"("icd_code") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
