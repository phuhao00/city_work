import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ApplicationDocument = Application & Document;

@Schema({ timestamps: true })
export class Application {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Job', required: true })
  jobId: Types.ObjectId;

  @Prop()
  coverLetter?: string;

  @Prop()
  resumeUrl?: string;

  @Prop({ default: 'PENDING' })
  status: string;
}

export const ApplicationSchema = SchemaFactory.createForClass(Application);

// Create compound index to ensure unique applications
ApplicationSchema.index({ userId: 1, jobId: 1 }, { unique: true });