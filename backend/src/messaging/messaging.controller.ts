import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Request,
  Patch,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MessagingService } from './messaging.service';
import { CreateMessageDto } from './dto/create-message.dto';

@ApiTags('messaging')
@Controller('messaging')
@ApiBearerAuth()
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  @Post()
  @ApiOperation({ summary: 'Send a message' })
  @ApiResponse({ status: 201, description: 'Message sent successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Recipient not found' })
  create(@Body() createMessageDto: CreateMessageDto, @Request() req: any) {
    return this.messagingService.create(req.user.id, createMessageDto);
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Get all conversations for the current user' })
  @ApiResponse({ status: 200, description: 'Conversations retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findUserConversations(@Request() req: any) {
    return this.messagingService.findUserConversations(req.user.id);
  }

  @Get('conversations/:userId')
  @ApiOperation({ summary: 'Get conversation with a specific user' })
  @ApiResponse({ status: 200, description: 'Conversation retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  findConversation(@Param('userId') userId: string, @Request() req: any) {
    return this.messagingService.findConversation(req.user.id, userId);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a message as read' })
  @ApiResponse({ status: 200, description: 'Message marked as read successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Message not found or not authorized' })
  markAsRead(@Param('id') id: string, @Request() req: any) {
    return this.messagingService.markAsRead(id, req.user.id);
  }
}