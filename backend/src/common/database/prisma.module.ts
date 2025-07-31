import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Module({
  providers: [...(process.env.DATABASE_URL ? [PrismaService] : [])],
  exports: [...(process.env.DATABASE_URL ? [PrismaService] : [])],
})
export class PrismaModule {}