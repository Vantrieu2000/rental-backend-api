import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user } = request;
    const startTime = Date.now();

    const userId = user?.sub || 'anonymous';
    const userEmail = user?.email || 'N/A';

    this.logger.log(
      `→ ${method} ${url} | User: ${userId} (${userEmail}) | ${new Date().toISOString()}`,
    );

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse();
          const { statusCode } = response;
          const duration = Date.now() - startTime;

          this.logger.log(
            `← ${method} ${url} | Status: ${statusCode} | Duration: ${duration}ms | User: ${userId}`,
          );
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          const statusCode = error.status || 500;

          this.logger.error(
            `← ${method} ${url} | Status: ${statusCode} | Duration: ${duration}ms | User: ${userId} | Error: ${error.message}`,
          );
        },
      }),
    );
  }
}
