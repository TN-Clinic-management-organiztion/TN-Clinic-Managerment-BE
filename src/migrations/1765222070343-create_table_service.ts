import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTableService1765222070343 implements MigrationInterface {
    name = 'CreateTableService1765222070343'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."service_requests_payment_status_enum" AS ENUM('UNPAID', 'PARTIALLY_PAID', 'PAID', 'CANCELLED')`);
        await queryRunner.query(`CREATE TABLE "service_requests" ("request_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "payment_status" "public"."service_requests_payment_status_enum" NOT NULL DEFAULT 'UNPAID', "notes" text, "deleted_at" TIMESTAMP WITH TIME ZONE, "encounter_id" uuid, "requesting_doctor_id" uuid, CONSTRAINT "PK_f01ec4a8e6bb19cc88f80aa835d" PRIMARY KEY ("request_id"))`);
        await queryRunner.query(`CREATE TABLE "ref_service_categories" ("category_id" SERIAL NOT NULL, "category_name" character varying(255) NOT NULL, "is_system_root" boolean NOT NULL DEFAULT false, "parent_id" integer, CONSTRAINT "PK_9ff47e4cede15f0e081fc94265d" PRIMARY KEY ("category_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."ref_services_result_input_type_enum" AS ENUM('NUMERIC', 'TEXT', 'NUMERIC_AND_TEXT', 'IMAGE_AND_TEXT')`);
        await queryRunner.query(`CREATE TABLE "ref_services" ("service_id" SERIAL NOT NULL, "service_name" character varying(255) NOT NULL, "base_price" numeric(15,2), "result_input_type" "public"."ref_services_result_input_type_enum", "category_id" integer, CONSTRAINT "PK_ebbef22eb39f6d8ea2eb9cbbcc8" PRIMARY KEY ("service_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."service_request_items_status_enum" AS ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')`);
        await queryRunner.query(`CREATE TABLE "service_request_items" ("item_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" "public"."service_request_items_status_enum" NOT NULL DEFAULT 'PENDING', "request_id" uuid, "service_id" integer, CONSTRAINT "PK_8e7b53337e0bf4c0484e81dcd13" PRIMARY KEY ("item_id"))`);
        await queryRunner.query(`CREATE TABLE "service_report_templates" ("template_id" SERIAL NOT NULL, "template_name" character varying(150) NOT NULL, "body_html" text NOT NULL, "is_default" boolean NOT NULL DEFAULT false, "is_public" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "service_id" integer, "created_by" uuid, CONSTRAINT "PK_40f54b74a458ed2c7b98efb1501" PRIMARY KEY ("template_id"))`);
        await queryRunner.query(`CREATE TABLE "service_results" ("result_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "main_conclusion" text, "report_body_html" text, "is_abnormal" boolean NOT NULL DEFAULT false, "result_time" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), "deleted_at" TIMESTAMP WITH TIME ZONE, "request_item_id" uuid, "technician_id" uuid, "approving_doctor_id" uuid, "used_template_id" integer, CONSTRAINT "PK_db0e4c29e1fd7b7a3b7a9ac7562" PRIMARY KEY ("result_id"))`);
        await queryRunner.query(`CREATE TABLE "room_services" ("room_id" integer NOT NULL, "service_id" integer NOT NULL, CONSTRAINT "PK_dac4ce50107d88ad7bce51fe61b" PRIMARY KEY ("room_id", "service_id"))`);
        await queryRunner.query(`CREATE TABLE "result_discussions" ("discussion_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "message_content" text NOT NULL, "lft" integer NOT NULL, "rgt" integer NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "result_id" uuid NOT NULL, "sender_id" uuid NOT NULL, "parent_id" uuid, CONSTRAINT "PK_c113c0ff1e094d7ca8c3f39c162" PRIMARY KEY ("discussion_id"))`);
        await queryRunner.query(`CREATE TABLE "ref_lab_indicators" ("indicator_id" SERIAL NOT NULL, "indicator_code" character varying(50), "indicator_name" character varying(200) NOT NULL, "unit" character varying(50), "ref_min_male" numeric(10,4), "ref_max_male" numeric(10,4), "ref_min_female" numeric(10,4), "ref_max_female" numeric(10,4), CONSTRAINT "PK_1ca78f20538b4c413f5e0cd6f95" PRIMARY KEY ("indicator_id"))`);
        await queryRunner.query(`CREATE TABLE "result_details_numeric" ("detail_id" BIGSERIAL NOT NULL, "value_measured" numeric(10,4), "is_critical" boolean NOT NULL DEFAULT false, "result_id" uuid, "indicator_id" integer, CONSTRAINT "PK_aec71f5c5ae8ce37d520c4bcbab" PRIMARY KEY ("detail_id"))`);
        await queryRunner.query(`CREATE TABLE "result_images" ("image_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "original_image_url" character varying(500) NOT NULL, "file_name" character varying(255), "file_size" bigint, "mime_type" character varying(100), "uploaded_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "result_id" uuid, "uploaded_by" uuid, CONSTRAINT "PK_a746d6b44498251b6e9ca3fcc1a" PRIMARY KEY ("image_id"))`);
        await queryRunner.query(`CREATE TABLE "rel_service_indicators" ("service_id" integer NOT NULL, "indicator_id" integer NOT NULL, "sort_order" integer, CONSTRAINT "PK_2fa81120f96d33d6561ccf6a4bf" PRIMARY KEY ("service_id", "indicator_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."encounter_cls_tracking_status_enum" AS ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED')`);
        await queryRunner.query(`CREATE TABLE "encounter_cls_tracking" ("track_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" "public"."encounter_cls_tracking_status_enum" NOT NULL DEFAULT 'PENDING', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "completed_at" TIMESTAMP WITH TIME ZONE, "encounter_id" uuid, "service_id" integer, CONSTRAINT "PK_e0d687edc95cfe16f953ec46b7a" PRIMARY KEY ("track_id"))`);
        await queryRunner.query(`ALTER TABLE "service_requests" ADD CONSTRAINT "FK_8a5d00fa172b47fd14338a30786" FOREIGN KEY ("encounter_id") REFERENCES "medical_encounters"("encounter_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "service_requests" ADD CONSTRAINT "FK_c86fb83cd9facc40fab94e90fcd" FOREIGN KEY ("requesting_doctor_id") REFERENCES "staff_profiles"("staff_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ref_service_categories" ADD CONSTRAINT "FK_3a47a94cf6c9ef7ff408cb5da81" FOREIGN KEY ("parent_id") REFERENCES "ref_service_categories"("category_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ref_services" ADD CONSTRAINT "FK_d997a85ccf9bd123a13d792983e" FOREIGN KEY ("category_id") REFERENCES "ref_service_categories"("category_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "service_request_items" ADD CONSTRAINT "FK_d89483fba694bc0b0f8e3b98330" FOREIGN KEY ("request_id") REFERENCES "service_requests"("request_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "service_request_items" ADD CONSTRAINT "FK_d008e7783ea85967e620232d981" FOREIGN KEY ("service_id") REFERENCES "ref_services"("service_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "service_report_templates" ADD CONSTRAINT "FK_bd6f065a6a0e1f8d57c6489fe83" FOREIGN KEY ("service_id") REFERENCES "ref_services"("service_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "service_report_templates" ADD CONSTRAINT "FK_48f7c1205ccbf7b3f1d3ad17fc9" FOREIGN KEY ("created_by") REFERENCES "staff_profiles"("staff_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "service_results" ADD CONSTRAINT "FK_cded0fbfa63d3cdf9e7d4b9c0a1" FOREIGN KEY ("request_item_id") REFERENCES "service_request_items"("item_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "service_results" ADD CONSTRAINT "FK_240c8a2358ff6730d0860300c79" FOREIGN KEY ("technician_id") REFERENCES "staff_profiles"("staff_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "service_results" ADD CONSTRAINT "FK_86688ee1acf6be226b2cd1bf4bb" FOREIGN KEY ("approving_doctor_id") REFERENCES "staff_profiles"("staff_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "service_results" ADD CONSTRAINT "FK_e767cd88327e09d203792ec09e5" FOREIGN KEY ("used_template_id") REFERENCES "service_report_templates"("template_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "room_services" ADD CONSTRAINT "FK_4ddbbcc854aa78ba7b2b1f7942d" FOREIGN KEY ("room_id") REFERENCES "org_rooms"("room_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "room_services" ADD CONSTRAINT "FK_168cd7db85d0335cd8b659fa4b7" FOREIGN KEY ("service_id") REFERENCES "ref_services"("service_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "result_discussions" ADD CONSTRAINT "FK_f089c61da3f49c5520a76baa183" FOREIGN KEY ("result_id") REFERENCES "service_results"("result_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "result_discussions" ADD CONSTRAINT "FK_4f5ce1e66b3dc1dade5d6534962" FOREIGN KEY ("sender_id") REFERENCES "staff_profiles"("staff_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "result_discussions" ADD CONSTRAINT "FK_fc64c65eb2bbfb038acb3e48589" FOREIGN KEY ("parent_id") REFERENCES "result_discussions"("discussion_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "result_details_numeric" ADD CONSTRAINT "FK_a19153b52ac97ced7a30f8acd38" FOREIGN KEY ("result_id") REFERENCES "service_results"("result_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "result_details_numeric" ADD CONSTRAINT "FK_ba716d62b548fcd6bfdcd75fe95" FOREIGN KEY ("indicator_id") REFERENCES "ref_lab_indicators"("indicator_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "result_images" ADD CONSTRAINT "FK_9fab27efd124cc82fe07c0ea774" FOREIGN KEY ("result_id") REFERENCES "service_results"("result_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "result_images" ADD CONSTRAINT "FK_0b1cde11a25c2c481b7416da53d" FOREIGN KEY ("uploaded_by") REFERENCES "staff_profiles"("staff_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "rel_service_indicators" ADD CONSTRAINT "FK_366bad4369e453ab6e1ecf4d4af" FOREIGN KEY ("service_id") REFERENCES "ref_services"("service_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "rel_service_indicators" ADD CONSTRAINT "FK_673a8142cf2c88d18c7ec37b9be" FOREIGN KEY ("indicator_id") REFERENCES "ref_lab_indicators"("indicator_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "encounter_cls_tracking" ADD CONSTRAINT "FK_f6e9dc21a56c6b316873f57217f" FOREIGN KEY ("encounter_id") REFERENCES "medical_encounters"("encounter_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "encounter_cls_tracking" ADD CONSTRAINT "FK_05f3f3a23ebf6393220b3053cc7" FOREIGN KEY ("service_id") REFERENCES "ref_services"("service_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "encounter_cls_tracking" DROP CONSTRAINT "FK_05f3f3a23ebf6393220b3053cc7"`);
        await queryRunner.query(`ALTER TABLE "encounter_cls_tracking" DROP CONSTRAINT "FK_f6e9dc21a56c6b316873f57217f"`);
        await queryRunner.query(`ALTER TABLE "rel_service_indicators" DROP CONSTRAINT "FK_673a8142cf2c88d18c7ec37b9be"`);
        await queryRunner.query(`ALTER TABLE "rel_service_indicators" DROP CONSTRAINT "FK_366bad4369e453ab6e1ecf4d4af"`);
        await queryRunner.query(`ALTER TABLE "result_images" DROP CONSTRAINT "FK_0b1cde11a25c2c481b7416da53d"`);
        await queryRunner.query(`ALTER TABLE "result_images" DROP CONSTRAINT "FK_9fab27efd124cc82fe07c0ea774"`);
        await queryRunner.query(`ALTER TABLE "result_details_numeric" DROP CONSTRAINT "FK_ba716d62b548fcd6bfdcd75fe95"`);
        await queryRunner.query(`ALTER TABLE "result_details_numeric" DROP CONSTRAINT "FK_a19153b52ac97ced7a30f8acd38"`);
        await queryRunner.query(`ALTER TABLE "result_discussions" DROP CONSTRAINT "FK_fc64c65eb2bbfb038acb3e48589"`);
        await queryRunner.query(`ALTER TABLE "result_discussions" DROP CONSTRAINT "FK_4f5ce1e66b3dc1dade5d6534962"`);
        await queryRunner.query(`ALTER TABLE "result_discussions" DROP CONSTRAINT "FK_f089c61da3f49c5520a76baa183"`);
        await queryRunner.query(`ALTER TABLE "room_services" DROP CONSTRAINT "FK_168cd7db85d0335cd8b659fa4b7"`);
        await queryRunner.query(`ALTER TABLE "room_services" DROP CONSTRAINT "FK_4ddbbcc854aa78ba7b2b1f7942d"`);
        await queryRunner.query(`ALTER TABLE "service_results" DROP CONSTRAINT "FK_e767cd88327e09d203792ec09e5"`);
        await queryRunner.query(`ALTER TABLE "service_results" DROP CONSTRAINT "FK_86688ee1acf6be226b2cd1bf4bb"`);
        await queryRunner.query(`ALTER TABLE "service_results" DROP CONSTRAINT "FK_240c8a2358ff6730d0860300c79"`);
        await queryRunner.query(`ALTER TABLE "service_results" DROP CONSTRAINT "FK_cded0fbfa63d3cdf9e7d4b9c0a1"`);
        await queryRunner.query(`ALTER TABLE "service_report_templates" DROP CONSTRAINT "FK_48f7c1205ccbf7b3f1d3ad17fc9"`);
        await queryRunner.query(`ALTER TABLE "service_report_templates" DROP CONSTRAINT "FK_bd6f065a6a0e1f8d57c6489fe83"`);
        await queryRunner.query(`ALTER TABLE "service_request_items" DROP CONSTRAINT "FK_d008e7783ea85967e620232d981"`);
        await queryRunner.query(`ALTER TABLE "service_request_items" DROP CONSTRAINT "FK_d89483fba694bc0b0f8e3b98330"`);
        await queryRunner.query(`ALTER TABLE "ref_services" DROP CONSTRAINT "FK_d997a85ccf9bd123a13d792983e"`);
        await queryRunner.query(`ALTER TABLE "ref_service_categories" DROP CONSTRAINT "FK_3a47a94cf6c9ef7ff408cb5da81"`);
        await queryRunner.query(`ALTER TABLE "service_requests" DROP CONSTRAINT "FK_c86fb83cd9facc40fab94e90fcd"`);
        await queryRunner.query(`ALTER TABLE "service_requests" DROP CONSTRAINT "FK_8a5d00fa172b47fd14338a30786"`);
        await queryRunner.query(`DROP TABLE "encounter_cls_tracking"`);
        await queryRunner.query(`DROP TYPE "public"."encounter_cls_tracking_status_enum"`);
        await queryRunner.query(`DROP TABLE "rel_service_indicators"`);
        await queryRunner.query(`DROP TABLE "result_images"`);
        await queryRunner.query(`DROP TABLE "result_details_numeric"`);
        await queryRunner.query(`DROP TABLE "ref_lab_indicators"`);
        await queryRunner.query(`DROP TABLE "result_discussions"`);
        await queryRunner.query(`DROP TABLE "room_services"`);
        await queryRunner.query(`DROP TABLE "service_results"`);
        await queryRunner.query(`DROP TABLE "service_report_templates"`);
        await queryRunner.query(`DROP TABLE "service_request_items"`);
        await queryRunner.query(`DROP TYPE "public"."service_request_items_status_enum"`);
        await queryRunner.query(`DROP TABLE "ref_services"`);
        await queryRunner.query(`DROP TYPE "public"."ref_services_result_input_type_enum"`);
        await queryRunner.query(`DROP TABLE "ref_service_categories"`);
        await queryRunner.query(`DROP TABLE "service_requests"`);
        await queryRunner.query(`DROP TYPE "public"."service_requests_payment_status_enum"`);
    }

}
