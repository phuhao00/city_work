import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SearchService {
  constructor(
    private readonly elasticsearchService: ElasticsearchService,
    private readonly configService: ConfigService,
  ) {}

  async search(query: string) {
    const jobResults = await this.searchJobs(query);
    const companyResults = await this.searchCompanies(query);
    
    return {
      jobs: jobResults,
      companies: companyResults,
    };
  }

  async searchJobs(query: string, filters?: any) {
    const searchQuery = {
      index: 'jobs',
      body: {
        query: {
          bool: {
            must: query
              ? [
                  {
                    multi_match: {
                      query,
                      fields: ['title^2', 'description', 'skills'],
                      type: 'best_fields',
                      fuzziness: 'AUTO',
                    },
                  },
                ]
              : [{ match_all: {} }],
            filter: this.buildFilters(filters),
          },
        },
        sort: [{ createdAt: { order: 'desc' } }],
        size: this.configService.get<number>('SEARCH_RESULTS_SIZE', 20),
      },
    };

    try {
      const response = await this.elasticsearchService.search(searchQuery);
      return response.hits.hits.map((hit: any) => ({
        id: hit._id,
        ...hit._source,
        score: hit._score,
      }));
    } catch (error) {
      console.error('Elasticsearch search error:', error);
      return [];
    }
  }

  async searchCompanies(query: string) {
    const searchQuery = {
      index: 'companies',
      body: {
        query: {
          multi_match: {
            query,
            fields: ['name^2', 'description', 'industry'],
            type: 'best_fields',
            fuzziness: 'AUTO',
          },
        },
        sort: [{ name: { order: 'asc' } }],
        size: this.configService.get<number>('SEARCH_RESULTS_SIZE', 20),
      },
    };

    try {
      const response = await this.elasticsearchService.search(searchQuery);
      return response.hits.hits.map((hit: any) => ({
        id: hit._id,
        ...hit._source,
        score: hit._score,
      }));
    } catch (error) {
      console.error('Elasticsearch search error:', error);
      return [];
    }
  }

  async searchUsers(query: string) {
    const searchQuery = {
      index: 'users',
      body: {
        query: {
          multi_match: {
            query,
            fields: ['name^2', 'bio', 'skills'],
            type: 'best_fields',
            fuzziness: 'AUTO',
          },
        },
        sort: [{ name: { order: 'asc' } }],
        size: this.configService.get<number>('SEARCH_RESULTS_SIZE', 20),
      },
    };

    try {
      const response = await this.elasticsearchService.search(searchQuery);
      return response.hits.hits.map((hit: any) => ({
        id: hit._id,
        ...hit._source,
        score: hit._score,
      }));
    } catch (error) {
      console.error('Elasticsearch search error:', error);
      return [];
    }
  }

  async indexJob(job: any) {
    try {
      await this.elasticsearchService.index({
        index: 'jobs',
        id: job.id,
        body: job,
      });
    } catch (error) {
      console.error('Error indexing job:', error);
    }
  }

  async indexCompany(company: any) {
    try {
      await this.elasticsearchService.index({
        index: 'companies',
        id: company.id,
        body: company,
      });
    } catch (error) {
      console.error('Error indexing company:', error);
    }
  }

  async indexUser(user: any) {
    try {
      await this.elasticsearchService.index({
        index: 'users',
        id: user.id,
        body: {
          name: user.name,
          bio: user.bio,
          location: user.location,
          skills: user.skills || [],
        },
      });
    } catch (error) {
      console.error('Error indexing user:', error);
    }
  }

  private buildFilters(filters: any) {
    const filterClauses = [];

    if (filters?.location) {
      filterClauses.push({
        term: { 'location.keyword': filters.location },
      });
    }

    if (filters?.jobType) {
      filterClauses.push({
        term: { 'type.keyword': filters.jobType },
      });
    }

    if (filters?.salaryMin) {
      filterClauses.push({
        range: { salaryMin: { gte: filters.salaryMin } },
      });
    }

    if (filters?.salaryMax) {
      filterClauses.push({
        range: { salaryMax: { lte: filters.salaryMax } },
      });
    }

    if (filters?.skills && filters.skills.length > 0) {
      filterClauses.push({
        terms: { 'skills.keyword': filters.skills },
      });
    }

    return filterClauses;
  }
}