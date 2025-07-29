import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(private configService: ConfigService) {
    super({
      datasources: {
        db: {
          url: configService.get<string>('DATABASE_URL'),
        },
      },
      log: configService.get<string>('NODE_ENV') === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async cleanDatabase() {
    if (this.configService.get<string>('NODE_ENV') === 'production') {
      return;
    }
    
    // Add logic to clean database tables for testing purposes
    // This should only be used in development or testing environments
    const models = Reflect.ownKeys(this).filter((key) => {
      return (
        typeof key === 'string' &&
        !key.startsWith('_') &&
        !['$connect', '$disconnect', '$on', '$transaction', '$use'].includes(key as string)
      );
    });

    return await this.$transaction(
      models.map((model) => {
        if (typeof model === 'string' && (this as any)[model] && typeof (this as any)[model].deleteMany === 'function') {
          return (this as any)[model].deleteMany({});
        }
        return Promise.resolve();
      }),
    );
  }
}