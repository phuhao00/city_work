import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User, UserSchema } from './schemas/user.schema';

const imports = [];
if (process.env.MONGODB_URI) {
  imports.push(MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]));
}

@Module({
  imports,
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}