import { SchemaValidatorService } from './schema-validator.service';
import { ValidateSchemaDto } from './dto/schema-validation.dto';
export declare class SchemaValidatorController {
    private readonly schemaValidatorService;
    constructor(schemaValidatorService: SchemaValidatorService);
    validateSchema(validateSchemaDto: ValidateSchemaDto): Promise<import("./dto/schema-validation.dto").SchemaValidationResult>;
}
