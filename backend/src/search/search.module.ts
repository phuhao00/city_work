import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { PrismaModule } from '../common/database/prisma.module';

@Module({
  imports: [
    ConfigModule,
    ...(process.env.DATABASE_URL ? [PrismaModule] : []),
  ],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}