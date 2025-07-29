import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

export enum UserRole {
  JOBSEEKER = 'JOBSEEKER',
  EMPLOYER = 'EMPLOYER',
  ADMIN = 'ADMIN',
}

@Schema({ timestamps: true })
export class User {
  _id?: string;
  id?: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: String, enum: UserRole, default: UserRole.JOBSEEKER })
  role: UserRole;

  @Prop()
  avatar?: string;

  @Prop()
  bio?: string;

  @Prop()
  location?: string;

  @Prop()
  phone?: string;

  @Prop()
  website?: string;

  @Prop({ type: Types.ObjectId, ref: 'Company' })
  companyId?: Types.ObjectId;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Virtual for id
UserSchema.virtual('id').get(function() {
  return this._id.toString();
});

// Ensure virtual fields are serialised
UserSchema.set('toJSON', {
  virtuals: true
});