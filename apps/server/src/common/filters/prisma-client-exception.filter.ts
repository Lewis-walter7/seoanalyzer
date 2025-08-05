import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    switch (exception.code) {
      case 'P2002':
        status = HttpStatus.CONFLICT;
        message = 'A record with this value already exists.';
        break;
      case 'P2014':
        status = HttpStatus.BAD_REQUEST;
        message = `Invalid ID: ${exception.meta?.modelName}`;
        break;
      case 'P2025':
        status = HttpStatus.NOT_FOUND;
        message = `Record to update not found.`;
        break;
      // Add more specific Prisma error codes as needed
      default:
        status = HttpStatus.BAD_REQUEST;
        message = `Database request failed: ${exception.message}`;
        break;
    }

    response.status(status).json({
      statusCode: status,
      message,
      error: exception.code,
    });
  }
}
