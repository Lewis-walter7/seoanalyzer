import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Custom exception for service unavailable errors (HTTP 503)
 * Used when external services like IntaSend are temporarily unavailable
 */
export class ServiceUnavailableException extends HttpException {
  constructor(message?: string) {
    super(message || 'Service temporarily unavailable', HttpStatus.SERVICE_UNAVAILABLE);
  }
}
