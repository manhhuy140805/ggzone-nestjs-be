import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { Prisma } from '@prisma/client';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter implements ExceptionFilter<Prisma.PrismaClientKnownRequestError> {
  catch(
    exception: Prisma.PrismaClientKnownRequestError,
    host: ArgumentsHost,
  ): void {
    const response = host.switchToHttp().getResponse<Response>();
    const statusCode = this.resolveStatusCode(exception.code);

    response.status(statusCode).json({
      error: this.resolveError(statusCode),
      message: this.resolveMessage(exception),
      prismaCode: exception.code,
      statusCode,
    });
  }

  private resolveStatusCode(code: string): HttpStatus {
    switch (code) {
      case 'P2002':
      case 'P2003':
        return HttpStatus.CONFLICT;
      case 'P2025':
        return HttpStatus.NOT_FOUND;
      default:
        return HttpStatus.BAD_REQUEST;
    }
  }

  private resolveError(statusCode: HttpStatus): string {
    switch (statusCode) {
      case HttpStatus.CONFLICT:
        return 'Conflict';
      case HttpStatus.NOT_FOUND:
        return 'Not Found';
      default:
        return 'Bad Request';
    }
  }

  private resolveMessage(
    exception: Prisma.PrismaClientKnownRequestError,
  ): string {
    if (exception.code === 'P2002') {
      return 'A record with the same unique value already exists';
    }

    if (exception.code === 'P2003') {
      return 'The requested relation is invalid';
    }

    if (exception.code === 'P2025') {
      return 'The requested record was not found';
    }

    return exception.message;
  }
}
