import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { JobType } from '@prisma/client';

export class CreateJobDto {
  @ApiProperty({
    example: 'Senior Software Engineer',
    description: 'The title of the job',
  })
  @IsString()
  @IsNotEmpty({ message: 'Job title is required' })
  title: string;

  @ApiProperty({
    example: 'We are looking for a senior software engineer...',
    description: 'The description of the job',
  })
  @IsString()
  @IsNotEmpty({ message: 'Job description is required' })
  description: string;

  @ApiProperty({
    example: 'FULL_TIME',
    description: 'The type of the job',
    enum: JobType,
  })
  @IsEnum(JobType, {
    message: 'Job type must be one of: FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP',
  })
  @IsNotEmpty({ message: 'Job type is required' })
  type: JobType;

  @ApiProperty({
    example: 'New York, USA',
    description: 'The location of the job',
  })
  @IsString()
  @IsNotEmpty({ message: 'Job location is required' })
  location: string;

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
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The ID of the company posting the job',
  })
  @IsString()
  @IsNotEmpty({ message: 'Company ID is required' })
  companyId: string;
}