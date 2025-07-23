import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('search')
@Controller('search')
@ApiBearerAuth()
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Search for jobs, companies, and users' })
  @ApiQuery({
    name: 'query',
    required: true,
    description: 'Search query',
    type: String,
  })
  @ApiResponse({ status: 200, description: 'Search results retrieved successfully' })
  search(@Query('query') query: string) {
    return this.searchService.search(query);
  }
}