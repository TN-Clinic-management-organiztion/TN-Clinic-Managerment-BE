import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTablePharmacy1765260635430 implements MigrationInterface {
    name = 'CreateTablePharmacy1765260635430'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "ref_drug_categories" ("category_id" SERIAL NOT NULL, "category_code" character varying(20), "category_name" character varying(255) NOT NULL, "parent_id" integer, CONSTRAINT "PK_2c2b8454715d3767cbf832ace84" PRIMARY KEY ("category_id"))`);
        await queryRunner.query(`CREATE TABLE "ref_drugs" ("drug_id" SERIAL NOT NULL, "drug_name" character varying(255) NOT NULL, "active_ingredient" character varying(255), "drug_code" character varying(50), "dosage_form" character varying(50), "route" character varying(50), "strength" character varying(50), "unit_name" character varying(50), "reorder_level" integer, "is_active" boolean NOT NULL DEFAULT true, "category_id" integer, CONSTRAINT "UQ_f03a68ee2ba8619d9eee36042ff" UNIQUE ("drug_code"), CONSTRAINT "PK_f0c87ae5e3526d6527ab92b5ee0" PRIMARY KEY ("drug_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."prescriptions_status_enum" AS ENUM('DRAFT', 'ISSUED', 'DISPENSED', 'CANCELLED')`);
        await queryRunner.query(`CREATE TABLE "prescriptions" ("prescription_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "interaction_override_reason" text, "status" "public"."prescriptions_status_enum" NOT NULL DEFAULT 'DRAFT', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "encounter_id" uuid, "prescribing_doctor_id" uuid, "dispensing_pharmacist_id" uuid, CONSTRAINT "PK_88ae21471f1463e211b485dc205" PRIMARY KEY ("prescription_id"))`);
        await queryRunner.query(`CREATE TABLE "prescription_details" ("detail_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "quantity" integer NOT NULL, "usage_note" text, "prescription_id" uuid, "drug_id" integer, CONSTRAINT "PK_df490d21858a1d3fcfca8b69749" PRIMARY KEY ("detail_id"))`);
        await queryRunner.query(`CREATE TABLE "drug_suppliers" ("supplier_id" SERIAL NOT NULL, "supplier_name" character varying(255) NOT NULL, "contact_person" character varying(100), "phone" character varying(20), "email" character varying(150), "address" text, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_1ee2858350806c1c0c0e583afaf" PRIMARY KEY ("supplier_id"))`);
        await queryRunner.query(`CREATE TABLE "drug_imports" ("import_id" SERIAL NOT NULL, "import_date" date NOT NULL DEFAULT ('now'::text)::date, "total_amount" numeric(15,2), "invoice_number" character varying(100), "notes" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "supplier_id" integer, "imported_by" uuid, CONSTRAINT "PK_c341ad437524cc48e64f86f581b" PRIMARY KEY ("import_id"))`);
        await queryRunner.query(`CREATE TABLE "drug_import_details" ("import_detail_id" SERIAL NOT NULL, "batch_number" character varying(50), "expiry_date" date NOT NULL, "quantity" integer NOT NULL, "unit_price" numeric(10,2) NOT NULL, "import_id" integer NOT NULL, "drug_id" integer NOT NULL, CONSTRAINT "PK_5622482c9a0b57853e3f0c60906" PRIMARY KEY ("import_detail_id"))`);
        await queryRunner.query(`CREATE TABLE "inventory_locations" ("location_id" SERIAL NOT NULL, "path" ltree NOT NULL, "location_name" character varying(100), CONSTRAINT "UQ_f823c793032cc29aa6b63cfde65" UNIQUE ("path"), CONSTRAINT "PK_ce886639e02aa5f61525c886b2d" PRIMARY KEY ("location_id"))`);
        await queryRunner.query(`CREATE TABLE "drug_batches" ("batch_id" SERIAL NOT NULL, "batch_number" character varying(50), "expiry_date" date NOT NULL, "quantity_initial" integer NOT NULL, "quantity_current" integer NOT NULL, "is_opened_box" boolean NOT NULL DEFAULT false, "import_detail_id" integer NOT NULL, "drug_id" integer NOT NULL, "location_id" integer, CONSTRAINT "PK_a960feb21db1bb4aa46ae377fa9" PRIMARY KEY ("batch_id"))`);
        await queryRunner.query(`CREATE TABLE "prescription_batch_dispenses" ("id" BIGSERIAL NOT NULL, "quantity" integer NOT NULL, "dispensed_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "detail_id" uuid NOT NULL, "batch_id" integer NOT NULL, CONSTRAINT "PK_84662218c4982b46d91c20427a1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."drug_interactions_severity_enum" AS ENUM('MINOR', 'MODERATE', 'MAJOR')`);
        await queryRunner.query(`CREATE TABLE "drug_interactions" ("interaction_id" SERIAL NOT NULL, "severity" "public"."drug_interactions_severity_enum", "warning_message" text, "drug_a_id" integer NOT NULL, "drug_b_id" integer NOT NULL, CONSTRAINT "uq_interaction_pair" UNIQUE ("drug_a_id", "drug_b_id"), CONSTRAINT "PK_e51ccb2b6a68a91bd3240f59463" PRIMARY KEY ("interaction_id"))`);
        await queryRunner.query(`ALTER TABLE "ref_drug_categories" ADD CONSTRAINT "FK_9d9b49479e91093572afb25ecdf" FOREIGN KEY ("parent_id") REFERENCES "ref_drug_categories"("category_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ref_drugs" ADD CONSTRAINT "FK_1f64061c355ed1bff14ccf3548d" FOREIGN KEY ("category_id") REFERENCES "ref_drug_categories"("category_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "prescriptions" ADD CONSTRAINT "FK_f09b4189e7145df4fe7565246cc" FOREIGN KEY ("encounter_id") REFERENCES "medical_encounters"("encounter_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "prescriptions" ADD CONSTRAINT "FK_86a146a7fbf4c987c64f332e30d" FOREIGN KEY ("prescribing_doctor_id") REFERENCES "staff_profiles"("staff_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "prescriptions" ADD CONSTRAINT "FK_3119ecc3e3b63fabbbbc85f6720" FOREIGN KEY ("dispensing_pharmacist_id") REFERENCES "staff_profiles"("staff_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "prescription_details" ADD CONSTRAINT "FK_15ac2c0a760ba909742b38e2172" FOREIGN KEY ("prescription_id") REFERENCES "prescriptions"("prescription_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "prescription_details" ADD CONSTRAINT "FK_7fadbafc0f45378de76b45eee1b" FOREIGN KEY ("drug_id") REFERENCES "ref_drugs"("drug_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "drug_imports" ADD CONSTRAINT "FK_010149bfd9dcc1c18b70d95189e" FOREIGN KEY ("supplier_id") REFERENCES "drug_suppliers"("supplier_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "drug_imports" ADD CONSTRAINT "FK_f1f95c089351c58623a24a79cdf" FOREIGN KEY ("imported_by") REFERENCES "staff_profiles"("staff_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "drug_import_details" ADD CONSTRAINT "FK_95280e3615d627b2af56beff039" FOREIGN KEY ("import_id") REFERENCES "drug_imports"("import_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "drug_import_details" ADD CONSTRAINT "FK_de1040240c908468203b2b2e025" FOREIGN KEY ("drug_id") REFERENCES "ref_drugs"("drug_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "drug_batches" ADD CONSTRAINT "FK_17c1e33106334f12e9ee0ac472e" FOREIGN KEY ("import_detail_id") REFERENCES "drug_import_details"("import_detail_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "drug_batches" ADD CONSTRAINT "FK_dee856b5ad5bff105175b3ba5a5" FOREIGN KEY ("drug_id") REFERENCES "ref_drugs"("drug_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "drug_batches" ADD CONSTRAINT "FK_8d67042befa986536267e298291" FOREIGN KEY ("location_id") REFERENCES "inventory_locations"("location_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "prescription_batch_dispenses" ADD CONSTRAINT "FK_e1755ed90893a42c255e2acbcd1" FOREIGN KEY ("detail_id") REFERENCES "prescription_details"("detail_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "prescription_batch_dispenses" ADD CONSTRAINT "FK_815301e744e59d7c4395e57a7fb" FOREIGN KEY ("batch_id") REFERENCES "drug_batches"("batch_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "drug_interactions" ADD CONSTRAINT "FK_c1b159e75eccb1ae546c6227b76" FOREIGN KEY ("drug_a_id") REFERENCES "ref_drugs"("drug_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "drug_interactions" ADD CONSTRAINT "FK_674bbb859b1e10646718e6df9c6" FOREIGN KEY ("drug_b_id") REFERENCES "ref_drugs"("drug_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "drug_interactions" DROP CONSTRAINT "FK_674bbb859b1e10646718e6df9c6"`);
        await queryRunner.query(`ALTER TABLE "drug_interactions" DROP CONSTRAINT "FK_c1b159e75eccb1ae546c6227b76"`);
        await queryRunner.query(`ALTER TABLE "prescription_batch_dispenses" DROP CONSTRAINT "FK_815301e744e59d7c4395e57a7fb"`);
        await queryRunner.query(`ALTER TABLE "prescription_batch_dispenses" DROP CONSTRAINT "FK_e1755ed90893a42c255e2acbcd1"`);
        await queryRunner.query(`ALTER TABLE "drug_batches" DROP CONSTRAINT "FK_8d67042befa986536267e298291"`);
        await queryRunner.query(`ALTER TABLE "drug_batches" DROP CONSTRAINT "FK_dee856b5ad5bff105175b3ba5a5"`);
        await queryRunner.query(`ALTER TABLE "drug_batches" DROP CONSTRAINT "FK_17c1e33106334f12e9ee0ac472e"`);
        await queryRunner.query(`ALTER TABLE "drug_import_details" DROP CONSTRAINT "FK_de1040240c908468203b2b2e025"`);
        await queryRunner.query(`ALTER TABLE "drug_import_details" DROP CONSTRAINT "FK_95280e3615d627b2af56beff039"`);
        await queryRunner.query(`ALTER TABLE "drug_imports" DROP CONSTRAINT "FK_f1f95c089351c58623a24a79cdf"`);
        await queryRunner.query(`ALTER TABLE "drug_imports" DROP CONSTRAINT "FK_010149bfd9dcc1c18b70d95189e"`);
        await queryRunner.query(`ALTER TABLE "prescription_details" DROP CONSTRAINT "FK_7fadbafc0f45378de76b45eee1b"`);
        await queryRunner.query(`ALTER TABLE "prescription_details" DROP CONSTRAINT "FK_15ac2c0a760ba909742b38e2172"`);
        await queryRunner.query(`ALTER TABLE "prescriptions" DROP CONSTRAINT "FK_3119ecc3e3b63fabbbbc85f6720"`);
        await queryRunner.query(`ALTER TABLE "prescriptions" DROP CONSTRAINT "FK_86a146a7fbf4c987c64f332e30d"`);
        await queryRunner.query(`ALTER TABLE "prescriptions" DROP CONSTRAINT "FK_f09b4189e7145df4fe7565246cc"`);
        await queryRunner.query(`ALTER TABLE "ref_drugs" DROP CONSTRAINT "FK_1f64061c355ed1bff14ccf3548d"`);
        await queryRunner.query(`ALTER TABLE "ref_drug_categories" DROP CONSTRAINT "FK_9d9b49479e91093572afb25ecdf"`);
        await queryRunner.query(`DROP TABLE "drug_interactions"`);
        await queryRunner.query(`DROP TYPE "public"."drug_interactions_severity_enum"`);
        await queryRunner.query(`DROP TABLE "prescription_batch_dispenses"`);
        await queryRunner.query(`DROP TABLE "drug_batches"`);
        await queryRunner.query(`DROP TABLE "inventory_locations"`);
        await queryRunner.query(`DROP TABLE "drug_import_details"`);
        await queryRunner.query(`DROP TABLE "drug_imports"`);
        await queryRunner.query(`DROP TABLE "drug_suppliers"`);
        await queryRunner.query(`DROP TABLE "prescription_details"`);
        await queryRunner.query(`DROP TABLE "prescriptions"`);
        await queryRunner.query(`DROP TYPE "public"."prescriptions_status_enum"`);
        await queryRunner.query(`DROP TABLE "ref_drugs"`);
        await queryRunner.query(`DROP TABLE "ref_drug_categories"`);
    }

}
