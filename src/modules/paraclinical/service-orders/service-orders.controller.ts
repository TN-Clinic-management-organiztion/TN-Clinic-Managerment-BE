import { UpdateRequestItemDto } from './dto/update-request-item.dto';
import { QueryServiceRequestDto } from './dto/query-service-request.dto';
import { UpdateServiceRequestDto } from './dto/update-service-request.dto';
import { CreateServiceRequestDto } from './dto/create-service-request.dto';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ServiceOrdersService } from './service-orders.service';

@ApiTags('Service Orders')
@Controller('service-orders')
export class ServiceOrdersController {
  constructor(private readonly serviceOrdersService: ServiceOrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create service request with items' })
  createRequest(@Body() dto: CreateServiceRequestDto) {
    return this.serviceOrdersService.createRequest(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all service requests with pagination' })
  findAllRequests(@Query() query: QueryServiceRequestDto) {
    return this.serviceOrdersService.findAllRequests(query);
  }

  @Get('pending')
  @ApiOperation({ summary: 'Get pending items for room' })
  getPendingItems(@Query('roomId') roomId?: string) {
    return this.serviceOrdersService.getPendingItems(
      roomId ? +roomId : undefined,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get service request by ID' })
  findOneRequest(@Param('id') id: string) {
    return this.serviceOrdersService.findOneRequest(id);
  }

  @Get(':id/with-items')
  @ApiOperation({ summary: 'Get service request with all items' })
  getRequestWithItems(@Param('id') id: string) {
    return this.serviceOrdersService.getRequestWithItems(id);
  }

  @Get('encounter/:encounterId/items')
  @ApiOperation({ summary: 'Get all items for an encounter' })
  getRequestItemsByEncounter(@Param('encounterId') encounterId: string) {
    return this.serviceOrdersService.getRequestItemsByEncounter(encounterId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update service request' })
  updateRequest(@Param('id') id: string, @Body() dto: UpdateServiceRequestDto) {
    return this.serviceOrdersService.updateRequest(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete service request' })
  removeRequest(@Param('id') id: string) {
    return this.serviceOrdersService.removeRequest(id);
  }

  @Patch('items/:itemId')
  @ApiOperation({ summary: 'Update request item status' })
  updateRequestItem(
    @Param('itemId') itemId: string,
    @Body() dto: UpdateRequestItemDto,
  ) {
    return this.serviceOrdersService.updateRequestItem(itemId, dto);
  }

  @Delete('items/:itemId')
  @ApiOperation({ summary: 'Delete request item' })
  removeRequestItem(@Param('itemId') itemId: string) {
    return this.serviceOrdersService.removeRequestItem(itemId);
  }
}