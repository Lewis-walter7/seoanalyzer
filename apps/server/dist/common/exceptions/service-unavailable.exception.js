"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceUnavailableException = void 0;
const common_1 = require("@nestjs/common");
/**
 * Custom exception for service unavailable errors (HTTP 503)
 * Used when external services like IntaSend are temporarily unavailable
 */
class ServiceUnavailableException extends common_1.HttpException {
    constructor(message) {
        super(message || 'Service temporarily unavailable', common_1.HttpStatus.SERVICE_UNAVAILABLE);
    }
}
exports.ServiceUnavailableException = ServiceUnavailableException;
