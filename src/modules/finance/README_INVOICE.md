// Tự động tạo invoice từ encounter
POST /invoices/generate-from-encounter
{
  "encounter_id": "xxx",
  "cashier_id": "yyy",
  "include_consultation": true,  // Phí khám
  "include_services": true,      // CLS chưa đóng
  "include_drugs": true          // Thuốc chưa đóng
}

// Lấy danh sách chưa thanh toán
GET /invoices/unpaid-items/:encounterId
→ {
  "unpaid_items": [...],
  "total_amount": "500000"
}

// Check payment status
GET /invoices/payment-status/:encounterId
→ {
  "is_fully_paid": false,
  "unpaid_items_count": 3
}
```

**Workflow:**
```
1. Bác sĩ chỉ định CLS → service_request_items (status: PENDING)
2. Thu ngân gọi: POST /invoices/generate-from-encounter
   → Backend tự động:
     - Query unpaid services
     - Tạo invoice_items
     - Tính tổng tiền
3. Thanh toán → POST /payments
4. Dược sĩ cấp phát → Validate payment trước



===================================================
// ==================== GIẢI PHÁP PAYMENT WORKFLOW ====================

// src/modules/finance/invoices/dto/invoice.dto.ts - BỔ SUNG
export class GenerateInvoiceFromEncounterDto {
  @IsNotEmpty()
  @IsUUID()
  encounter_id: string;

  @IsNotEmpty()
  @IsUUID()
  cashier_id: string;

  @IsOptional()
  @IsBoolean()
  include_consultation?: boolean = true; // Phí khám

  @IsOptional()
  @IsBoolean()
  include_services?: boolean = true; // CLS chưa thanh toán

  @IsOptional()
  @IsBoolean()
  include_drugs?: boolean = true; // Thuốc chưa thanh toán
}

// ==================== SERVICE ====================

// src/modules/finance/invoices/invoices.service.ts - BỔ SUNG METHODS

  /**
   * TỰ ĐỘNG TẠO INVOICE TỪ ENCOUNTER
   * Lấy tất cả services + thuốc chưa thanh toán
   */
  async generateInvoiceFromEncounter(dto: GenerateInvoiceFromEncounterDto) {
    return await this.dataSource.transaction(async (manager) => {
      // 1. Validate encounter exists
      const encounter = await manager
        .createQueryBuilder()
        .select('*')
        .from('medical_encounters', 'e')
        .where('e.encounter_id = :id', { id: dto.encounter_id })
        .andWhere('e.deleted_at IS NULL')
        .getRawOne();

      if (!encounter) {
        throw new NotFoundException('Encounter not found');
      }

      // 2. Create invoice
      const invoice = manager.create(Invoice, {
        encounter_id: dto.encounter_id,
        cashier_id: dto.cashier_id,
        status: InvoiceStatus.DRAFT,
        total_amount: '0',
      });

      const savedInvoice = await manager.save(invoice);

      // 3. Add consultation fee (if requested)
      if (dto.include_consultation) {
        await this.addConsultationFee(manager, savedInvoice.invoice_id);
      }

      // 4. Add unpaid services (if requested)
      if (dto.include_services) {
        await this.addUnpaidServices(manager, savedInvoice.invoice_id, dto.encounter_id);
      }

      // 5. Add unpaid drugs (if requested)
      if (dto.include_drugs) {
        await this.addUnpaidDrugs(manager, savedInvoice.invoice_id, dto.encounter_id);
      }

      // 6. Recalculate total
      await this.recalculateTotal(manager, savedInvoice.invoice_id);

      // 7. Return invoice with items
      return await this.findOne(savedInvoice.invoice_id);
    });
  }

  /**
   * Thêm phí khám vào invoice
   */
  private async addConsultationFee(manager: any, invoiceId: string) {
    // Lấy giá khám từ system config hoặc hardcode
    const consultationFee = '200000'; // 200k VND

    const item = manager.create(InvoiceItem, {
      invoice_id: invoiceId,
      item_type: InvoiceItemType.CONSULTATION,
      description: 'Phí khám bệnh',
      quantity: 1,
      unit_price: consultationFee,
      line_amount: consultationFee,
    });

    await manager.save(item);
  }

  /**
   * Thêm các dịch vụ CLS chưa thanh toán
   */
  private async addUnpaidServices(
    manager: any,
    invoiceId: string,
    encounterId: string,
  ) {
    // Query: Lấy các service_request_items chưa có trong invoice
    const unpaidServices = await manager.query(
      `
      SELECT 
        sri.item_id,
        s.service_name,
        s.base_price
      FROM service_request_items sri
      INNER JOIN service_requests sr ON sri.request_id = sr.request_id
      INNER JOIN ref_services s ON sri.service_id = s.service_id
      WHERE sr.encounter_id = $1
        AND sr.deleted_at IS NULL
        AND sri.status != 'CANCELLED'
        AND NOT EXISTS (
          SELECT 1 FROM invoice_items ii
          WHERE ii.service_item_id = sri.item_id
        )
      `,
      [encounterId],
    );

    // Tạo invoice items cho từng service
    for (const service of unpaidServices) {
      const item = manager.create(InvoiceItem, {
        invoice_id: invoiceId,
        item_type: InvoiceItemType.SERVICE,
        service_item_id: service.item_id,
        description: service.service_name,
        quantity: 1,
        unit_price: service.base_price || '0',
        line_amount: service.base_price || '0',
      });

      await manager.save(item);
    }

    return unpaidServices.length;
  }

  /**
   * Thêm các thuốc chưa thanh toán
   */
  private async addUnpaidDrugs(
    manager: any,
    invoiceId: string,
    encounterId: string,
  ) {
    // Query: Lấy các prescription_details chưa có trong invoice
    const unpaidDrugs = await manager.query(
      `
      SELECT 
        pd.detail_id,
        d.drug_name,
        pd.quantity,
        db.unit_price
      FROM prescription_details pd
      INNER JOIN prescriptions p ON pd.prescription_id = p.prescription_id
      INNER JOIN ref_drugs d ON pd.drug_id = d.drug_id
      LEFT JOIN LATERAL (
        SELECT unit_price 
        FROM drug_batches 
        WHERE drug_id = pd.drug_id 
          AND quantity_current > 0
        ORDER BY expiry_date ASC 
        LIMIT 1
      ) db ON true
      WHERE p.encounter_id = $1
        AND p.deleted_at IS NULL
        AND p.status != 'CANCELLED'
        AND NOT EXISTS (
          SELECT 1 FROM invoice_items ii
          WHERE ii.prescription_detail_id = pd.detail_id
        )
      `,
      [encounterId],
    );

    // Tạo invoice items cho từng thuốc
    for (const drug of unpaidDrugs) {
      const unitPrice = drug.unit_price || '0';
      const quantity = drug.quantity;
      const lineAmount = (parseFloat(unitPrice) * quantity).toFixed(2);

      const item = manager.create(InvoiceItem, {
        invoice_id: invoiceId,
        item_type: InvoiceItemType.DRUG,
        prescription_detail_id: drug.detail_id,
        description: drug.drug_name,
        quantity: quantity,
        unit_price: unitPrice,
        line_amount: lineAmount,
      });

      await manager.save(item);
    }

    return unpaidDrugs.length;
  }

  /**
   * Lấy danh sách items chưa thanh toán của encounter
   */
  async getUnpaidItemsByEncounter(encounterId: string) {
    // Services chưa thanh toán
    const unpaidServices = await this.dataSource.query(
      `
      SELECT 
        'SERVICE' as item_type,
        sri.item_id,
        s.service_name as description,
        1 as quantity,
        s.base_price as unit_price,
        sri.status
      FROM service_request_items sri
      INNER JOIN service_requests sr ON sri.request_id = sr.request_id
      INNER JOIN ref_services s ON sri.service_id = s.service_id
      WHERE sr.encounter_id = $1
        AND sr.deleted_at IS NULL
        AND sri.status != 'CANCELLED'
        AND NOT EXISTS (
          SELECT 1 FROM invoice_items ii
          WHERE ii.service_item_id = sri.item_id
        )
      `,
      [encounterId],
    );

    // Thuốc chưa thanh toán
    const unpaidDrugs = await this.dataSource.query(
      `
      SELECT 
        'DRUG' as item_type,
        pd.detail_id as item_id,
        d.drug_name as description,
        pd.quantity,
        COALESCE(db.unit_price, '0') as unit_price,
        p.status
      FROM prescription_details pd
      INNER JOIN prescriptions p ON pd.prescription_id = p.prescription_id
      INNER JOIN ref_drugs d ON pd.drug_id = d.drug_id
      LEFT JOIN LATERAL (
        SELECT unit_price 
        FROM drug_batches 
        WHERE drug_id = pd.drug_id 
          AND quantity_current > 0
        ORDER BY expiry_date ASC 
        LIMIT 1
      ) db ON true
      WHERE p.encounter_id = $1
        AND p.deleted_at IS NULL
        AND p.status != 'CANCELLED'
        AND NOT EXISTS (
          SELECT 1 FROM invoice_items ii
          WHERE ii.prescription_detail_id = pd.detail_id
        )
      `,
      [encounterId],
    );

    const allUnpaidItems = [...unpaidServices, ...unpaidDrugs];

    // Calculate totals
    const totalAmount = allUnpaidItems.reduce((sum, item) => {
      const price = parseFloat(item.unit_price || 0);
      const qty = parseInt(item.quantity || 1);
      return sum + price * qty;
    }, 0);

    return {
      encounter_id: encounterId,
      unpaid_items: allUnpaidItems,
      total_items: allUnpaidItems.length,
      total_amount: totalAmount.toFixed(2),
    };
  }

  /**
   * Check xem encounter đã thanh toán đầy đủ chưa
   */
  async checkEncounterPaymentStatus(encounterId: string) {
    const unpaidItems = await this.getUnpaidItemsByEncounter(encounterId);
    
    return {
      encounter_id: encounterId,
      is_fully_paid: unpaidItems.total_items === 0,
      unpaid_items_count: unpaidItems.total_items,
      unpaid_amount: unpaidItems.total_amount,
    };
  }

// ==================== CONTROLLER ====================

// src/modules/finance/invoices/invoices.controller.ts - BỔ SUNG

  /**
   * TỰ ĐỘNG TẠO INVOICE TỪ ENCOUNTER
   * POST /invoices/generate-from-encounter
   */
  @Post('generate-from-encounter')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Auto generate invoice from encounter (services + drugs)' })
  generateFromEncounter(@Body() dto: GenerateInvoiceFromEncounterDto) {
    return this.invoicesService.generateInvoiceFromEncounter(dto);
  }

  /**
   * LẤY DANH SÁCH ITEMS CHƯA THANH TOÁN
   * GET /invoices/unpaid-items/:encounterId
   */
  @Get('unpaid-items/:encounterId')
  @ApiOperation({ summary: 'Get unpaid items for encounter' })
  getUnpaidItems(@Param('encounterId') encounterId: string) {
    return this.invoicesService.getUnpaidItemsByEncounter(encounterId);
  }

  /**
   * CHECK PAYMENT STATUS
   * GET /invoices/payment-status/:encounterId
   */
  @Get('payment-status/:encounterId')
  @ApiOperation({ summary: 'Check if encounter is fully paid' })
  checkPaymentStatus(@Param('encounterId') encounterId: string) {
    return this.invoicesService.checkEncounterPaymentStatus(encounterId);
  }

// ==================== WORKFLOW EXAMPLE ====================

/**
 * QUY TRÌNH SỬ DỤNG:
 * 
 * 1. BỆNH NHÂN ĐẾN KHÁM
 *    - Tạo encounter
 *    - Đóng phí khám (consultation fee)
 * 
 * 2. BÁC SĨ CHỈ ĐỊNH CLS
 *    POST /service-orders
 *    {
 *      "encounter_id": "xxx",
 *      "items": [{ "service_id": 1 }, { "service_id": 2 }]
 *    }
 *    → Tự động tạo service_request_items
 * 
 * 3. THU NGÂN TẠO HOÁ ĐƠN CHO CLS
 *    POST /invoices/generate-from-encounter
 *    {
 *      "encounter_id": "xxx",
 *      "cashier_id": "yyy",
 *      "include_consultation": false,  // Đã đóng rồi
 *      "include_services": true,       // Lấy CLS chưa đóng
 *      "include_drugs": false          // Chưa kê đơn
 *    }
 *    → Backend tự động:
 *      - Query services chưa có trong invoice
 *      - Tạo invoice items
 *      - Tính tổng tiền
 * 
 * 4. BỆNH NHÂN THANH TOÁN
 *    POST /payments
 *    {
 *      "invoice_id": "xxx",
 *      "payment_method_code": "CASH",
 *      "amount": "500000"
 *    }
 *    → Invoice status: UNPAID → PAID
 * 
 * 5. BÁC SĨ KÊ ĐƠN THUỐC
 *    POST /pharmacy/prescriptions
 *    {
 *      "encounter_id": "xxx",
 *      "details": [{ "drug_id": 1, "quantity": 10 }]
 *    }
 *    → Tự động tạo prescription_details
 * 
 * 6. THU NGÂN TẠO HOÁ ĐƠN CHO THUỐC
 *    POST /invoices/generate-from-encounter
 *    {
 *      "encounter_id": "xxx",
 *      "cashier_id": "yyy",
 *      "include_consultation": false,
 *      "include_services": false,
 *      "include_drugs": true           // Lấy thuốc chưa đóng
 *    }
 *    → Backend tự động:
 *      - Query thuốc chưa có trong invoice
 *      - Tạo invoice items
 *      - Tính tổng tiền
 * 
 * 7. BỆNH NHÂN THANH TOÁN THUỐC
 *    POST /payments
 *    ...
 * 
 * 8. DƯỢC SĨ CẤP PHÁT THUỐC
 *    POST /pharmacy/dispensing
 *    {
 *      "prescription_id": "xxx",
 *      "dispensing_pharmacist_id": "yyy"
 *    }
 *    → Chỉ cho phép nếu đã thanh toán
 * 
 * 9. CHECK HOÀN THÀNH
 *    GET /invoices/payment-status/:encounterId
 *    → {
 *      "is_fully_paid": true,
 *      "unpaid_items_count": 0
 *    }
 */

// ==================== FRONTEND IMPLEMENTATION ====================

/**
 * PHÍA FRONTEND:
 * 
 * 1. Khi vào màn hình thanh toán:
 *    - Gọi GET /invoices/unpaid-items/:encounterId
 *    - Hiển thị danh sách services + thuốc chưa đóng
 *    - User chọn items nào muốn đóng
 * 
 * 2. Tạo hoá đơn:
 *    - Gọi POST /invoices/generate-from-encounter
 *    - Backend tự động tạo invoice với items đã chọn
 * 
 * 3. Thanh toán:
 *    - Gọi POST /payments
 *    - Update invoice status
 * 
 * KHÔNG CẦN FE tự tổng hợp và gửi từng item!
 * Backend làm hết logic lấy unpaid items.
 */

// ==================== PHARMACY GUARD ====================

// src/modules/pharmacy/dispensing/dispensing.service.ts - BỔ SUNG

  /**
   * Kiểm tra đơn thuốc đã thanh toán chưa trước khi cấp phát
   */
  async validatePrescriptionPaid(prescriptionId: string): Promise<boolean> {
    const unpaidDrugs = await this.dataSource.query(
      `
      SELECT COUNT(*) as count
      FROM prescription_details pd
      WHERE pd.prescription_id = $1
        AND NOT EXISTS (
          SELECT 1 FROM invoice_items ii
          INNER JOIN invoices inv ON ii.invoice_id = inv.invoice_id
          WHERE ii.prescription_detail_id = pd.detail_id
            AND inv.status = 'PAID'
        )
      `,
      [prescriptionId],
    );

    return parseInt(unpaidDrugs[0].count) === 0;
  }

  async dispensePrescription(dto: DispensePrescriptionDto) {
    // CHECK PAYMENT TRƯỚC KHI DISPENSE
    const isPaid = await this.validatePrescriptionPaid(dto.prescription_id);
    
    if (!isPaid) {
      throw new BadRequestException(
        'Không thể cấp phát thuốc chưa thanh toán. Vui lòng thanh toán trước.',
      );
    }

    // Proceed with dispensing...
    return await this.dataSource.transaction(async (manager) => {
      // ... existing dispensing logic
    });
  }