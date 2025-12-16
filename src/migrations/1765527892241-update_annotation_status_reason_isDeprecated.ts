import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateAnnotationStatusReasonIsDeprecated1765527892241 implements MigrationInterface {
    name = 'UpdateAnnotationStatusReasonIsDeprecated1765527892241'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Thêm các cột mới (Giữ nguyên)
        await queryRunner.query(`ALTER TABLE "image_annotations" ADD "rejection_reason" text`);
        await queryRunner.query(`ALTER TABLE "image_annotations" ADD "is_deprecated" boolean NOT NULL DEFAULT false`);
        
        // 2. Đổi tên Enum cũ (Giữ nguyên)
        await queryRunner.query(`ALTER TYPE "public"."image_annotations_annotation_status_enum" RENAME TO "image_annotations_annotation_status_enum_old"`);
        
        // 3. Tạo Enum mới (Giữ nguyên)
        await queryRunner.query(`CREATE TYPE "public"."image_annotations_annotation_status_enum" AS ENUM('IN_PROGRESS', 'SUBMITTED', 'APPROVED', 'REJECTED')`);
        
        // 4. Xóa Default cũ (Giữ nguyên)
        await queryRunner.query(`ALTER TABLE "image_annotations" ALTER COLUMN "annotation_status" DROP DEFAULT`);

        // --- 5. SỬA ĐOẠN NÀY (QUAN TRỌNG) ---
        // Thay vì ép kiểu trực tiếp, ta dùng CASE WHEN để map dữ liệu cũ sang mới
        await queryRunner.query(`
            ALTER TABLE "image_annotations" 
            ALTER COLUMN "annotation_status" 
            TYPE "public"."image_annotations_annotation_status_enum" 
            USING (
                CASE "annotation_status"::text
                    WHEN 'DRAFT' THEN 'IN_PROGRESS'::text::"public"."image_annotations_annotation_status_enum"
                    WHEN 'REVIEWED' THEN 'SUBMITTED'::text::"public"."image_annotations_annotation_status_enum"
                    ELSE "annotation_status"::text::"public"."image_annotations_annotation_status_enum"
                END
            )
        `);
        // ------------------------------------

        // 6. Set lại Default mới (Nếu cần, tùy logic entity của bạn)
        await queryRunner.query(`ALTER TABLE "image_annotations" ALTER COLUMN "annotation_status" SET DEFAULT 'IN_PROGRESS'`);

        // 7. Xóa Enum cũ (Giữ nguyên)
        await queryRunner.query(`DROP TYPE "public"."image_annotations_annotation_status_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Logic revert (Nếu cần rollback)
        // ... (Giữ nguyên code revert TypeORM sinh ra, nhưng lưu ý nó có thể lỗi data nếu rollback những cái REJECTED)
        
        // Ví dụ đoạn revert cơ bản:
        await queryRunner.query(`CREATE TYPE "public"."image_annotations_annotation_status_enum_old" AS ENUM('DRAFT', 'REVIEWED', 'APPROVED')`);
        
        await queryRunner.query(`
            ALTER TABLE "image_annotations" 
            ALTER COLUMN "annotation_status" 
            TYPE "public"."image_annotations_annotation_status_enum_old" 
            USING (
                CASE "annotation_status"::text
                    WHEN 'IN_PROGRESS' THEN 'DRAFT'::text::"public"."image_annotations_annotation_status_enum_old"
                    WHEN 'SUBMITTED' THEN 'REVIEWED'::text::"public"."image_annotations_annotation_status_enum_old"
                    ELSE 'DRAFT'::text::"public"."image_annotations_annotation_status_enum_old" -- Fallback cho REJECTED
                END
            )
        `);
        
        await queryRunner.query(`DROP TYPE "public"."image_annotations_annotation_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."image_annotations_annotation_status_enum_old" RENAME TO "image_annotations_annotation_status_enum"`);
        await queryRunner.query(`ALTER TABLE "image_annotations" DROP COLUMN "is_deprecated"`);
        await queryRunner.query(`ALTER TABLE "image_annotations" DROP COLUMN "rejection_reason"`);
    }
}