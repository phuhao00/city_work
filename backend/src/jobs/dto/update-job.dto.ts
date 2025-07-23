import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { JobType } from '@prisma/client';

export class UpdateJobDto {
  @ApiProperty({
    example: 'Senior Software Engineer',
    description: 'The title of the job',
    required: false,
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({
    example: 'We are looking for a senior software engineer...',
    description: 'The description of the job',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: 'FULL_TIME',
    description: 'The type of the job',
    enum: JobType,
    required: false,
  })
  @IsEnum(JobType, {
    message: 'Job type must be one of: FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP',
  })
  @IsOptional()
  type?: JobType;

  @ApiProperty({
    example: 'New York, USA',
    description: 'The location of the job',
    required: false,
  })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({
    example: 100000,
    description: 'The minimum salary of the job',
    required: false,
  })
  @IsNumber()
  @Min(0, { message: 'Minimum salary must be a positive number' })
  @IsOptional()
  salaryMin?: number;

  @ApiProperty({
    example: 150000,
    description: 'The maximum salary of the job',
    required: false,
  })
  @IsNumber()
  @Min(0, { message: 'Maximum salary must be a positive number' })
  @IsOptional()
  salaryMax?: number;

  @ApiProperty({
    example: ['JavaScript', 'React', 'Node.js'],
    description: 'The required skills for the job',
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  skills?: string[];

  @ApiProperty({
    example: true,
    description: 'Whether the job is active',
    required: false,
  })
  @IsOptional()
  isActive?: boolean;
}