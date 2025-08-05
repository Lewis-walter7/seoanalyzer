"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchemaValidatorController = void 0;
const common_1 = require("@nestjs/common");
const schema_validator_service_1 = require("./schema-validator.service");
const schema_validation_dto_1 = require("./dto/schema-validation.dto");
const auth_guard_1 = require("../../auth/auth.guard");
let SchemaValidatorController = class SchemaValidatorController {
    schemaValidatorService;
    constructor(schemaValidatorService) {
        this.schemaValidatorService = schemaValidatorService;
    }
    async validateSchema(validateSchemaDto) {
        return this.schemaValidatorService.validateSchemas(validateSchemaDto);
    }
};
exports.SchemaValidatorController = SchemaValidatorController;
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [schema_validation_dto_1.ValidateSchemaDto]),
    __metadata("design:returntype", Promise)
], SchemaValidatorController.prototype, "validateSchema", null);
exports.SchemaValidatorController = SchemaValidatorController = __decorate([
    (0, common_1.Controller)('api/tools/schema-validator'),
    __metadata("design:paramtypes", [schema_validator_service_1.SchemaValidatorService])
], SchemaValidatorController);
