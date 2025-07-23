import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateCompanyDto {
  @ApiProperty({
    example: 'Acme Corporation',
    description: 'The name of the company',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    example: 'https://example.com/logo.png',
    description: 'The logo URL of the company',
    required: false,
  })
  @IsUrl({}, { message: 'Logo must be a valid URL' })
  @IsOptional()
  logo?: string;

  @ApiProperty({
    example: 'A leading technology company',
    description: 'The description of the company',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: 'Technology',
    description: 'The industry of the company',
    required: false,
  })
  @IsString()
  @IsOptional()
  industry?: string;

  @ApiProperty({
    example: 'https://example.com',
    description: 'The website of the company',
    required: false,
  })
  @IsUrl({}, { message: 'Website must be a valid URL' })
  @IsOptional()
  website?: string;

  @ApiProperty({
    example: 'New York, USA',
    description: 'The location of the company',
    required: false,
  })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({
    example: '1-100',
    description: 'The size of the company',
    required: false,
  })
  @IsString()
  @IsOptional()
  size?: string;

  @ApiProperty({
    example: '2010',
    description: 'The founding year of the company',
    required: false,
  })
  @IsString()
  @IsOptional()
  foundedYear?: string;
}