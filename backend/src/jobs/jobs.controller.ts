import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { QueryJobDto } from './dto/query-job.dto';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('jobs')
@Controller('jobs')
@ApiBearerAuth()
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.EMPLOYER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Create a new job' })
  @ApiResponse({ status: 201, description: 'Job successfully created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Requires admin or employer role' })
  create(@Body() createJobDto: CreateJobDto) {
    return this.jobsService.create(createJobDto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all jobs with optional filtering' })
  @ApiResponse({ status: 200, description: 'Jobs retrieved successfully' })
  findAll(@Query() queryJobDto: QueryJobDto) {
    return this.jobsService.findAll(queryJobDto);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get a job by ID' })
  @ApiResponse({ status: 200, description: 'Job retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  findOne(@Param('id') id: string) {
    return this.jobsService.findById(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.EMPLOYER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Update a job' })
  @ApiResponse({ status: 200, description: 'Job updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Requires admin or employer role' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  update(@Param('id') id: string, @Body() updateJobDto: UpdateJobDto) {
    return this.jobsService.update(id, updateJobDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.EMPLOYER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Delete a job' })
  @ApiResponse({ status: 200, description: 'Job deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Requires admin or employer role' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  remove(@Param('id') id: string) {
    return this.jobsService.remove(id);
  }

  @Post(':id/apply')
  @Roles(UserRole.JOBSEEKER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Apply for a job' })
  @ApiResponse({ status: 200, description: 'Application submitted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Requires jobseeker role' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  apply(@Param('id') id: string, @Request() req) {
    return this.jobsService.applyForJob(id, req.user.id);
  }

  @Post(':id/save')
  @ApiOperation({ summary: 'Save a job' })
  @ApiResponse({ status: 200, description: 'Job saved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  save(@Param('id') id: string, @Request() req) {
    return this.jobsService.saveJob(id, req.user.id);
  }

  @Get('user/saved')
  @ApiOperation({ summary: 'Get saved jobs for the current user' })
  @ApiResponse({ status: 200, description: 'Saved jobs retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getSavedJobs(@Request() req) {
    return this.jobsService.getSavedJobs(req.user.id);
  }

  @Get('user/applied')
  @Roles(UserRole.JOBSEEKER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get applied jobs for the current user' })
  @ApiResponse({ status: 200, description: 'Applied jobs retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Requires jobseeker role' })
  getAppliedJobs(@Request() req) {
    return this.jobsService.getAppliedJobs(req.user.id);
  }
}