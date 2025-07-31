import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { Job, JobSchema } from './schemas/job.schema';
import { Application, ApplicationSchema } from './schemas/application.schema';
import { SavedJob, SavedJobSchema } from './schemas/saved-job.schema';

const imports = [];
if (process.env.MONGODB_URI) {
  imports.push(MongooseModule.forFeature([
    { name: Job.name, schema: JobSchema },
    { name: Application.name, schema: ApplicationSchema },
    { name: SavedJob.name, schema: SavedJobSchema },
  ]));
}

@Module({
  imports,
  controllers: [JobsController],
  providers: [JobsService],
  exports: [JobsService],
})
export class JobsModule {}