import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MessagingController } from './messaging.controller';
import { MessagingService } from './messaging.service';
import { Message, MessageSchema } from './schemas/message.schema';

const imports = [];
if (process.env.MONGODB_URI) {
  imports.push(MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]));
}

@Module({
  imports,
  controllers: [MessagingController],
  providers: [MessagingService],
  exports: [MessagingService],
})
export class MessagingModule {}