import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CompanyDocument = Company & Document;

@Schema({ timestamps: true })
export class Company {
  @Prop({ required: true })
  name: string;

  @Prop()
  logo?: string;

  @Prop()
  description?: string;

  @Prop()
  industry?: string;

  @Prop()
  website?: string;

  @Prop()
  location?: string;

  @Prop()
  size?: string;

  @Prop()
  foundedYear?: string;
}

export const CompanySchema = SchemaFactory.createForClass(Company);