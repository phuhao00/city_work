import { Injectable, Optional } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message, MessageDocument } from './schemas/message.schema';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessagingService {
  constructor(
    @Optional() @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
  ) {}

  async create(userId: string, createMessageDto: CreateMessageDto): Promise<Message> {
    const messageData = {
      ...createMessageDto,
      senderId: userId,
    };
    const message = new this.messageModel(messageData);
    return message.save();
  }

  async sendMessage(createMessageDto: CreateMessageDto): Promise<Message> {
    const message = new this.messageModel(createMessageDto);
    return message.save();
  }

  async getConversation(userId1: string, userId2: string): Promise<Message[]> {
    return this.messageModel
      .find({
        $or: [
          { senderId: userId1, recipientId: userId2 },
          { senderId: userId2, recipientId: userId1 },
        ],
      })
      .sort({ createdAt: 1 })
      .populate('senderId', 'name avatar')
      .populate('recipientId', 'name avatar')
      .exec();
  }

  async findUserConversations(userId: string): Promise<any[]> {
    return this.getConversations(userId);
  }

  async findConversation(userId1: string, userId2: string): Promise<Message[]> {
    return this.getConversation(userId1, userId2);
  }

  async getConversations(userId: string): Promise<any[]> {
    const conversations = await this.messageModel.aggregate([
      {
        $match: {
          $or: [{ senderId: userId }, { recipientId: userId }],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$senderId', userId] },
              '$recipientId',
              '$senderId',
            ],
          },
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$recipientId', userId] },
                    { $eq: ['$isRead', false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
      {
        $project: {
          user: {
            _id: '$user._id',
            name: '$user.name',
            avatar: '$user.avatar',
          },
          lastMessage: '$lastMessage',
          unreadCount: '$unreadCount',
        },
      },
    ]);

    return conversations;
  }

  async markAsRead(messageId: string, userId?: string): Promise<Message> {
    const result = await this.messageModel
      .findByIdAndUpdate(messageId, { isRead: true }, { new: true })
      .exec();
    return result!;
  }

  async markConversationAsRead(userId: string, otherUserId: string): Promise<void> {
    await this.messageModel
      .updateMany(
        {
          senderId: otherUserId,
          recipientId: userId,
          isRead: false,
        },
        { isRead: true }
      )
      .exec();
  }
}