import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { OptimisticLockVersionMismatchError } from 'typeorm';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    // Handle TypeORM Optimistic Locking Error
    if (exception instanceof OptimisticLockVersionMismatchError) {
      status = HttpStatus.CONFLICT;
      message =
        'The resource has been modified by another process. Please reload and try again.';
    }

    const finalMessage =
      typeof message === 'object' && 'message' in message
        ? message['message']
        : message;

    response.status(status).json({
      error: {
        code: status,
        message: finalMessage,
      },
    });
  }
}
