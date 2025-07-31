import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';
import { Company, CompanySchema } from './schemas/company.schema';

const imports = [];
if (process.env.MONGODB_URI) {
  imports.push(MongooseModule.forFeature([{ name: Company.name, schema: CompanySchema }]));
}

@Module({
  imports,
  controllers: [CompaniesController],
  providers: [CompaniesService],
  exports: [CompaniesService],
})
export class CompaniesModule {}