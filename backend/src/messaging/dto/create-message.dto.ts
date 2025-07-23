import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateMessageDto {
  @ApiProperty({
    example: 'Hello, I am interested in your job posting.',
    description: 'The content of the message',
  })
  @IsString()
  @IsNotEmpty({ message: 'Message content is required' })
  content: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The ID of the recipient user',
  })
  @IsString()
  @IsNotEmpty({ message: 'Recipient ID is required' })
  recipientId: string;
}