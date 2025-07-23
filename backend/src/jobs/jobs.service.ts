import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Job, JobDocument } from './schemas/job.schema';
import { Application, ApplicationDocument } from './schemas/application.schema';
import { SavedJob, SavedJobDocument } from './schemas/saved-job.schema';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { ApplyJobDto } from './dto/apply-job.dto';

@Injectable()
export class JobsService {
  constructor(
    @InjectModel(Job.name) private jobModel: Model<JobDocument>,
    @InjectModel(Application.name) private applicationModel: Model<ApplicationDocument>,
    @InjectModel(SavedJob.name) private savedJobModel: Model<SavedJobDocument>,
  ) {}

  async create(createJobDto: CreateJobDto): Promise<Job> {
    const createdJob = new this.jobModel(createJobDto);
    return createdJob.save();
  }

  async findAll(filters?: any): Promise<Job[]> {
    const query = this.jobModel.find({ isActive: true });
    
    if (filters?.location) {
      query.where('location').regex(new RegExp(filters.location, 'i'));
    }
    
    if (filters?.type) {
      query.where('type', filters.type);
    }
    
    if (filters?.salaryMin) {
      query.where('salaryMin').gte(filters.salaryMin);
    }
    
    if (filters?.salaryMax) {
      query.where('salaryMax').lte(filters.salaryMax);
    }
    
    return query.populate('companyId').exec();
  }

  async findOne(id: string): Promise<Job> {
    const job = await this.jobModel.findById(id).populate('companyId').exec();
    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }
    return job;
  }

  async update(id: string, updateJobDto: UpdateJobDto): Promise<Job> {
    const updatedJob = await this.jobModel
      .findByIdAndUpdate(id, updateJobDto, { new: true })
      .exec();
    if (!updatedJob) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }
    return updatedJob;
  }

  async remove(id: string): Promise<void> {
    const result = await this.jobModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }
  }

  async applyForJob(jobId: string, userId: string, applyJobDto: ApplyJobDto): Promise<Application> {
    const application = new this.applicationModel({
      jobId,
      userId,
      ...applyJobDto,
    });
    return application.save();
  }

  async getApplications(jobId: string): Promise<Application[]> {
    return this.applicationModel
      .find({ jobId })
      .populate('userId', 'name email avatar')
      .exec();
  }

  async getUserApplications(userId: string): Promise<Application[]> {
    return this.applicationModel
      .find({ userId })
      .populate('jobId')
      .exec();
  }

  async saveJob(jobId: string, userId: string): Promise<SavedJob> {
    const savedJob = new this.savedJobModel({ jobId, userId });
    return savedJob.save();
  }

  async unsaveJob(jobId: string, userId: string): Promise<void> {
    await this.savedJobModel.findOneAndDelete({ jobId, userId }).exec();
  }

  async getSavedJobs(userId: string): Promise<SavedJob[]> {
    return this.savedJobModel
      .find({ userId })
      .populate('jobId')
      .exec();
  }
}