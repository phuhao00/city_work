import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { JobType } from '@prisma/client';

export class QueryJobDto {
  @ApiProperty({
    example: 'software engineer',
    description: 'Search term for job title or description',
    required: false,
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({
    example: 'FULL_TIME',
    description: 'Filter by job type',
    enum: JobType,
    required: false,
  })
  @IsEnum(JobType, {
    message: 'Job type must be one of: FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP',
  })
  @IsOptional()
  type?: JobType;

  @ApiProperty({
    example: 'New York',
    description: 'Filter by job location',
    required: false,
  })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Filter by company ID',
    required: false,
  })
  @IsString()
  @IsOptional()
  companyId?: string;

  @ApiProperty({
    example: 'JavaScript',
    description: 'Filter by required skill',
    required: false,
  })
  @IsString()
  @IsOptional()
  skill?: string;
}