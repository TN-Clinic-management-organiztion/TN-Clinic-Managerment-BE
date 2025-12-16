import { PartialType } from '@nestjs/mapped-types';
import { CreateDrugCategoryDto } from './create-drug-category.dto';

export class UpdateDrugCategoryDto extends PartialType(CreateDrugCategoryDto) {}