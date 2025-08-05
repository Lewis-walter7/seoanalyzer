import { HttpException } from '@nestjs/common';
/**
 * Custom exception for service unavailable errors (HTTP 503)
 * Used when external services like IntaSend are temporarily unavailable
 */
export declare class ServiceUnavailableException extends HttpException {
    constructor(message?: string);
}
