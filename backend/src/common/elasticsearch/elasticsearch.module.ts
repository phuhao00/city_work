import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ElasticsearchModule } from '@nestjs/elasticsearch';

@Module({
  imports: [
    ElasticsearchModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const config: any = {
          node: configService.get<string>('ELASTICSEARCH_NODE', 'http://localhost:9200'),
          requestTimeout: configService.get<number>('ELASTICSEARCH_REQUEST_TIMEOUT', 30000),
          pingTimeout: configService.get<number>('ELASTICSEARCH_PING_TIMEOUT', 3000),
          maxRetries: configService.get<number>('ELASTICSEARCH_MAX_RETRIES', 3),
        };

        // Add authentication if credentials are provided
        const username = configService.get<string>('ELASTICSEARCH_USERNAME');
        const password = configService.get<string>('ELASTICSEARCH_PASSWORD');
        
        if (username && password) {
          config.auth = {
            username,
            password,
          };
        }

        // Add SSL configuration if needed
        const sslEnabled = configService.get<boolean>('ELASTICSEARCH_SSL_ENABLED', false);
        if (sslEnabled) {
          config.ssl = {
            rejectUnauthorized: configService.get<boolean>('ELASTICSEARCH_SSL_VERIFY', true),
          };
        }

        return config;
      },
      inject: [ConfigService],
    }),
  ],
  exports: [ElasticsearchModule],
})
export class SearchModule {}