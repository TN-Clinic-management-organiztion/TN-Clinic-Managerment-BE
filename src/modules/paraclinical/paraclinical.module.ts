import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { RefService } from 'src/database/entities/service/ref_services.entity';
import { RefServiceCategory } from 'src/database/entities/service/ref_service_categories.entity';
import { RefLabIndicator } from 'src/database/entities/service/ref_lab_indicators.entity';
import { ServiceRequest } from 'src/database/entities/service/service_requests.entity';
import { ServiceRequestItem } from 'src/database/entities/service/service_request_items.entity';
import { ServiceResult } from 'src/database/entities/service/service_results.entity';
import { ResultImage } from 'src/database/entities/service/result_images.entity';

// Services Module
import { ServicesController } from './services/services.controller';
import { ServicesService } from './services/services.service';

// Service Orders Module
import { ServiceOrdersController } from './service-orders/service-orders.controller';
import { ServiceOrdersService } from './service-orders/service-orders.service';

// Results Module
import { ResultsController } from './results/results.controller';
import { ResultsService } from './results/results.service';

// Shared Services
import { CloudinaryModule } from 'src/shared/cloudinary/cloudinary.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      // Service entities
      RefService,
      RefServiceCategory,
      RefLabIndicator,
      
      // Order entities
      ServiceRequest,
      ServiceRequestItem,
      
      // Result entities
      ServiceResult,
      ResultImage,
    ]),
    CloudinaryModule,
  ],
  controllers: [
    ServicesController,
    ServiceOrdersController,
    ResultsController,
  ],
  providers: [
    ServicesService,
    ServiceOrdersService,
    ResultsService,
  ],
  exports: [
    ServicesService,
    ServiceOrdersService,
    ResultsService,
  ],
})
export class ParaclinicalModule {}