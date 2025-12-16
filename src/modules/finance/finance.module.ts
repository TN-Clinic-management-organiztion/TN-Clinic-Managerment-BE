import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Invoices
import { InvoicesController } from './invoices/invoices.controller';
import { InvoicesService } from './invoices/invoices.service';
import { Invoice } from '../../database/entities/finance/invoices.entity';
import { InvoiceItem } from '../../database/entities/finance/invoice_items.entity';

// Payments
import { PaymentsController } from './payments/payments.controller';
import { PaymentsService } from './payments/payments.service';
import { InvoicePayment } from '../../database/entities/finance/invoice_payments.entity';

// Payment Methods
import { PaymentMethodsController } from './payment-methods/payment-methods.controller';
import { PaymentMethodsService } from './payment-methods/payment-methods.service';
import { RefPaymentMethod } from '../../database/entities/finance/ref_payment_methods.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      // Invoices
      Invoice,
      InvoiceItem,
      // Payments
      InvoicePayment,
      // Payment Methods
      RefPaymentMethod,
    ]),
  ],
  controllers: [
    InvoicesController,
    PaymentsController,
    PaymentMethodsController,
  ],
  providers: [
    InvoicesService,
    PaymentsService,
    PaymentMethodsService,
  ],
  exports: [
    InvoicesService,
    PaymentsService,
    PaymentMethodsService,
  ],
})
export class FinanceModule {}