import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    ...(process.env.MONGODB_URI ? [
      MongooseModule.forRootAsync({
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => {
          const uri = configService.get<string>('MONGODB_URI');
          return {
            uri,
            useNewUrlParser: true,
            useUnifiedTopology: true,
          };
        },
        inject: [ConfigService],
      })
    ] : []),
  ],
  exports: [...(process.env.MONGODB_URI ? [MongooseModule] : [])],
})
export class DatabaseModule {}