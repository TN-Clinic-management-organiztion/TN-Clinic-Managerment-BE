import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateEnumTypeRoom1766067679309 implements MigrationInterface {
    name = 'UpdateEnumTypeRoom1766067679309'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."org_rooms_room_type_enum" RENAME TO "org_rooms_room_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."org_rooms_room_type_enum" AS ENUM('CLINIC', 'PARACLINICAL', 'PHARMACY', 'CASHIER', 'ADMIN')`);
        await queryRunner.query(`ALTER TABLE "org_rooms" ALTER COLUMN "room_type" TYPE "public"."org_rooms_room_type_enum" USING "room_type"::"text"::"public"."org_rooms_room_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."org_rooms_room_type_enum_old"`);
        await queryRunner.query(`ALTER TYPE "public"."ref_services_result_input_type_enum" RENAME TO "ref_services_result_input_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."ref_services_result_input_type_enum" AS ENUM('NUMERIC', 'TEXT')`);
        await queryRunner.query(`ALTER TABLE "ref_services" ALTER COLUMN "result_input_type" TYPE "public"."ref_services_result_input_type_enum" USING "result_input_type"::"text"::"public"."ref_services_result_input_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."ref_services_result_input_type_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."ref_services_result_input_type_enum_old" AS ENUM('NUMERIC', 'TEXT', 'NUMERIC_AND_TEXT', 'IMAGE_AND_TEXT')`);
        await queryRunner.query(`ALTER TABLE "ref_services" ALTER COLUMN "result_input_type" TYPE "public"."ref_services_result_input_type_enum_old" USING "result_input_type"::"text"::"public"."ref_services_result_input_type_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."ref_services_result_input_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."ref_services_result_input_type_enum_old" RENAME TO "ref_services_result_input_type_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."org_rooms_room_type_enum_old" AS ENUM('CLINIC', 'IMAGING', 'LAB', 'PHARMACY', 'CASHIER', 'ADMIN')`);
        await queryRunner.query(`ALTER TABLE "org_rooms" ALTER COLUMN "room_type" TYPE "public"."org_rooms_room_type_enum_old" USING "room_type"::"text"::"public"."org_rooms_room_type_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."org_rooms_room_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."org_rooms_room_type_enum_old" RENAME TO "org_rooms_room_type_enum"`);
    }

}
