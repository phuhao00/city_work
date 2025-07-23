import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SavedJobDocument = SavedJob & Document;

@Schema({ timestamps: true })
export class SavedJob {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Job', required: true })
  jobId: Types.ObjectId;
}

export const SavedJobSchema = SchemaFactory.createForClass(SavedJob);

// Create compound index to ensure unique saved jobs
SavedJobSchema.index({ userId: 1, jobId: 1 }, { unique: true });