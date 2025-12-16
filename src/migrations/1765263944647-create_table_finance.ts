import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTableFinance1765263944647 implements MigrationInterface {
    name = 'CreateTableFinance1765263944647'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "ref_payment_methods" ("payment_method_code" character varying(20) NOT NULL, "method_name" character varying(100) NOT NULL, "is_active" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_eef84b05a2d9090242e964bc35d" PRIMARY KEY ("payment_method_code"))`);
        await queryRunner.query(`CREATE TYPE "public"."invoices_status_enum" AS ENUM('DRAFT', 'UNPAID', 'PARTIAL', 'PAID', 'CANCELLED')`);
        await queryRunner.query(`CREATE TABLE "invoices" ("invoice_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "total_amount" numeric(15,2), "status" "public"."invoices_status_enum" NOT NULL DEFAULT 'UNPAID', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "payment_time" TIMESTAMP WITH TIME ZONE, "deleted_at" TIMESTAMP WITH TIME ZONE, "encounter_id" uuid, "cashier_id" uuid, CONSTRAINT "PK_a62eb88a23934fb83945c3e58af" PRIMARY KEY ("invoice_id"))`);
        await queryRunner.query(`CREATE TABLE "invoice_payments" ("payment_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "amount" numeric(15,2) NOT NULL, "paid_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "transaction_ref" character varying(100), "notes" text, "invoice_id" uuid NOT NULL, "payment_method_code" character varying(20) NOT NULL, CONSTRAINT "PK_6cb266b357064c1de47fe2a1643" PRIMARY KEY ("payment_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."invoice_items_item_type_enum" AS ENUM('CONSULTATION', 'SERVICE', 'DRUG', 'OTHER')`);
        await queryRunner.query(`CREATE TABLE "invoice_items" ("invoice_item_id" BIGSERIAL NOT NULL, "item_type" "public"."invoice_items_item_type_enum" NOT NULL, "description" text NOT NULL, "quantity" integer NOT NULL, "unit_price" numeric(15,2) NOT NULL, "line_amount" numeric(15,2) NOT NULL, "invoice_id" uuid NOT NULL, "service_item_id" uuid, "prescription_detail_id" uuid, CONSTRAINT "PK_6ba01450ea6248cbd6f10de84bb" PRIMARY KEY ("invoice_item_id"))`);
        await queryRunner.query(`ALTER TABLE "invoices" ADD CONSTRAINT "FK_d4d2daa5eafb9c88a55ed1c654f" FOREIGN KEY ("encounter_id") REFERENCES "medical_encounters"("encounter_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "invoices" ADD CONSTRAINT "FK_c07224a78c1fd5dcd38e91284c5" FOREIGN KEY ("cashier_id") REFERENCES "staff_profiles"("staff_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "invoice_payments" ADD CONSTRAINT "FK_e94fa427d3da279450dba6f4aa6" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("invoice_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "invoice_payments" ADD CONSTRAINT "FK_71e86e2443a2e4997e177da8e0f" FOREIGN KEY ("payment_method_code") REFERENCES "ref_payment_methods"("payment_method_code") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "invoice_items" ADD CONSTRAINT "FK_dc991d555664682cfe892eea2c1" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("invoice_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "invoice_items" ADD CONSTRAINT "FK_5e25c028d8232871f9ca5e5fc57" FOREIGN KEY ("service_item_id") REFERENCES "service_request_items"("item_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "invoice_items" ADD CONSTRAINT "FK_d62af2868369cf2439ffb3454d1" FOREIGN KEY ("prescription_detail_id") REFERENCES "prescription_details"("detail_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invoice_items" DROP CONSTRAINT "FK_d62af2868369cf2439ffb3454d1"`);
        await queryRunner.query(`ALTER TABLE "invoice_items" DROP CONSTRAINT "FK_5e25c028d8232871f9ca5e5fc57"`);
        await queryRunner.query(`ALTER TABLE "invoice_items" DROP CONSTRAINT "FK_dc991d555664682cfe892eea2c1"`);
        await queryRunner.query(`ALTER TABLE "invoice_payments" DROP CONSTRAINT "FK_71e86e2443a2e4997e177da8e0f"`);
        await queryRunner.query(`ALTER TABLE "invoice_payments" DROP CONSTRAINT "FK_e94fa427d3da279450dba6f4aa6"`);
        await queryRunner.query(`ALTER TABLE "invoices" DROP CONSTRAINT "FK_c07224a78c1fd5dcd38e91284c5"`);
        await queryRunner.query(`ALTER TABLE "invoices" DROP CONSTRAINT "FK_d4d2daa5eafb9c88a55ed1c654f"`);
        await queryRunner.query(`DROP TABLE "invoice_items"`);
        await queryRunner.query(`DROP TYPE "public"."invoice_items_item_type_enum"`);
        await queryRunner.query(`DROP TABLE "invoice_payments"`);
        await queryRunner.query(`DROP TABLE "invoices"`);
        await queryRunner.query(`DROP TYPE "public"."invoices_status_enum"`);
        await queryRunner.query(`DROP TABLE "ref_payment_methods"`);
    }

}
