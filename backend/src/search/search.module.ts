import { Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

@Module({
  imports: [
    ElasticsearchModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const username = configService.get('ELASTICSEARCH_USERNAME');
        const password = configService.get('ELASTICSEARCH_PASSWORD');
        
        const config: any = {
          node: configService.get('ELASTICSEARCH_NODE') || 'http://localhost:9200',
        };
        
        if (username && password) {
          config.auth = {
            username,
            password,
          };
        }
        
        return config;
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}