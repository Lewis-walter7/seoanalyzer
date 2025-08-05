import {
  Controller,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { SchemaValidatorService } from './schema-validator.service';
import { ValidateSchemaDto } from './dto/schema-validation.dto';
import { AuthGuard } from '../../auth/auth.guard';

@Controller('api/tools/schema-validator')
export class SchemaValidatorController {
  constructor(private readonly schemaValidatorService: SchemaValidatorService) {}

  @UseGuards(AuthGuard)
  @Post()
  async validateSchema(@Body() validateSchemaDto: ValidateSchemaDto) {
    return this.schemaValidatorService.validateSchemas(validateSchemaDto);
  }
}
