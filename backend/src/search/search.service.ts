import { Injectable, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/database/prisma.service';

@Injectable()
export class SearchService {
  constructor(
    @Optional() private readonly prisma: PrismaService,
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
    try {
      const searchSize = this.configService.get<number>('SEARCH_RESULTS_SIZE', 20);
      
      const whereClause: any = {
        AND: [
          query ? {
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
              { category: { contains: query, mode: 'insensitive' } },
            ]
          } : {},
          ...this.buildJobFilters(filters)
        ]
      };

      const jobs = await this.prisma.job.findMany({
        where: whereClause,
        orderBy: { postedAt: 'desc' },
        take: searchSize,
        include: {
          company: {
            select: {
              id: true,
              name: true,
              logo: true,
            }
          }
        }
      });

      return jobs;
    } catch (error) {
      console.error('Database search error:', error);
      return [];
    }
  }

  async searchCompanies(query: string) {
    try {
      const searchSize = this.configService.get<number>('SEARCH_RESULTS_SIZE', 20);
      
      const companies = await this.prisma.company.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { industry: { contains: query, mode: 'insensitive' } },
          ]
        },
        orderBy: { name: 'asc' },
        take: searchSize,
      });

      return companies;
    } catch (error) {
      console.error('Database search error:', error);
      return [];
    }
  }

  async searchUsers(query: string) {
    try {
      const searchSize = this.configService.get<number>('SEARCH_RESULTS_SIZE', 20);
      
      const users = await this.prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { bio: { contains: query, mode: 'insensitive' } },
            { bio: { contains: query, mode: 'insensitive' } },
          ]
        },
        orderBy: { name: 'asc' },
        take: searchSize,
        select: {
          id: true,
          name: true,
          bio: true,
          location: true,
          avatar: true,
        }
      });

      return users;
    } catch (error) {
      console.error('Database search error:', error);
      return [];
    }
  }

  // These methods are now no-ops since we're using database directly
  async indexJob(job: any) {
    // No longer needed with database search
    console.log('Job indexing skipped - using database search');
  }

  async indexCompany(company: any) {
    // No longer needed with database search
    console.log('Company indexing skipped - using database search');
  }

  async indexUser(user: any) {
    // No longer needed with database search
    console.log('User indexing skipped - using database search');
  }

  private buildJobFilters(filters: any) {
    const filterClauses = [];

    if (filters?.location) {
      filterClauses.push({
        location: { contains: filters.location, mode: 'insensitive' }
      });
    }

    if (filters?.jobType) {
      filterClauses.push({
        type: filters.jobType
      });
    }

    if (filters?.salaryMin) {
      filterClauses.push({
        salaryMin: { gte: filters.salaryMin }
      });
    }

    if (filters?.salaryMax) {
      filterClauses.push({
        salaryMax: { lte: filters.salaryMax }
      });
    }

    if (filters?.skills && filters.skills.length > 0) {
      filterClauses.push({
        skills: { hasSome: filters.skills }
      });
    }

    return filterClauses;
  }
}