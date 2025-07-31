'use client';

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { setJobs, setFilters, toggleBookmark, setLoading } from '../../features/jobs/jobsSlice';
import { Search, MapPin, Clock, DollarSign, Bookmark, Filter, ChevronDown } from 'lucide-react';
import Link from 'next/link';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  postedAt: string;
  description: string;
  requirements: string[];
  isBookmarked: boolean;
  companyLogo?: string;
}

const mockJobs: Job[] = [
  {
    id: '1',
    title: '前端开发工程师',
    company: '阿里巴巴',
    location: '杭州',
    salary: '20K-35K',
    type: '全职',
    postedAt: '2天前',
    description: '负责前端产品的开发和维护，参与产品需求分析和技术方案设计。',
    requirements: ['React', 'TypeScript', 'Node.js'],
    isBookmarked: false,
    companyLogo: '/api/placeholder/40/40'
  },
  {
    id: '2',
    title: 'UI/UX 设计师',
    company: '腾讯',
    location: '深圳',
    salary: '18K-30K',
    type: '全职',
    postedAt: '1天前',
    description: '负责产品界面设计，用户体验优化，与产品经理和开发团队协作。',
    requirements: ['Figma', 'Sketch', 'Prototyping'],
    isBookmarked: true,
    companyLogo: '/api/placeholder/40/40'
  },
  {
    id: '3',
    title: '产品经理',
    company: '字节跳动',
    location: '北京',
    salary: '25K-45K',
    type: '全职',
    postedAt: '3天前',
    description: '负责产品规划和需求分析，协调各部门资源推进产品开发。',
    requirements: ['产品规划', '数据分析', '项目管理'],
    isBookmarked: false,
    companyLogo: '/api/placeholder/40/40'
  },
  {
    id: '4',
    title: 'Java 后端开发',
    company: '美团',
    location: '北京',
    salary: '22K-40K',
    type: '全职',
    postedAt: '1周前',
    description: '负责后端服务开发，数据库设计，API接口开发和维护。',
    requirements: ['Java', 'Spring Boot', 'MySQL'],
    isBookmarked: false,
    companyLogo: '/api/placeholder/40/40'
  },
  {
    id: '5',
    title: '数据分析师',
    company: '滴滴出行',
    location: '上海',
    salary: '15K-25K',
    type: '全职',
    postedAt: '5天前',
    description: '负责业务数据分析，制作数据报表，为业务决策提供数据支持。',
    requirements: ['SQL', 'Python', 'Tableau'],
    isBookmarked: true,
    companyLogo: '/api/placeholder/40/40'
  }
];

export default function JobsPage() {
  const dispatch = useDispatch();
  const { jobs, filters, loading } = useSelector((state: RootState) => state.jobs);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState({
    location: '',
    jobType: '',
    salaryRange: '',
    experience: ''
  });

  useEffect(() => {
    // Mock API call
    dispatch(setLoading(true));
    setTimeout(() => {
      dispatch(setJobs(mockJobs));
      dispatch(setLoading(false));
    }, 1000);
  }, [dispatch]);

  const handleSearch = () => {
    // Mock search functionality
    console.log('Searching for:', searchQuery);
  };

  const handleFilterChange = (key: string, value: string) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    dispatch(setFilters(localFilters));
    setShowFilters(false);
  };

  const handleBookmark = (jobId: string) => {
    dispatch(toggleBookmark(jobId));
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = !filters.location || job.location.includes(filters.location);
    const matchesType = !filters.jobType || job.type === filters.jobType;
    
    return matchesSearch && matchesLocation && matchesType;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-text mb-6">职位搜索</h1>
          
          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray h-5 w-5" />
              <input
                type="text"
                placeholder="搜索职位或公司..."
                className="input pl-10 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn btn-outline flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              筛选
              <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            <button
              onClick={handleSearch}
              className="btn btn-primary"
            >
              搜索
            </button>
          </div>
          
          {/* Filters */}
          {showFilters && (
            <div className="mt-6 p-4 bg-background border border-border rounded-large">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-2">地点</label>
                  <select
                    className="input w-full"
                    value={localFilters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                  >
                    <option value="">所有地点</option>
                    <option value="北京">北京</option>
                    <option value="上海">上海</option>
                    <option value="深圳">深圳</option>
                    <option value="杭州">杭州</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text mb-2">工作类型</label>
                  <select
                    className="input w-full"
                    value={localFilters.jobType}
                    onChange={(e) => handleFilterChange('jobType', e.target.value)}
                  >
                    <option value="">所有类型</option>
                    <option value="全职">全职</option>
                    <option value="兼职">兼职</option>
                    <option value="实习">实习</option>
                    <option value="远程">远程</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text mb-2">薪资范围</label>
                  <select
                    className="input w-full"
                    value={localFilters.salaryRange}
                    onChange={(e) => handleFilterChange('salaryRange', e.target.value)}
                  >
                    <option value="">所有薪资</option>
                    <option value="10K以下">10K以下</option>
                    <option value="10K-20K">10K-20K</option>
                    <option value="20K-30K">20K-30K</option>
                    <option value="30K以上">30K以上</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text mb-2">经验要求</label>
                  <select
                    className="input w-full"
                    value={localFilters.experience}
                    onChange={(e) => handleFilterChange('experience', e.target.value)}
                  >
                    <option value="">所有经验</option>
                    <option value="应届生">应届生</option>
                    <option value="1-3年">1-3年</option>
                    <option value="3-5年">3-5年</option>
                    <option value="5年以上">5年以上</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setLocalFilters({ location: '', jobType: '', salaryRange: '', experience: '' })}
                  className="btn btn-outline"
                >
                  重置
                </button>
                <button
                  onClick={applyFilters}
                  className="btn btn-primary"
                >
                  应用筛选
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Job List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex justify-between items-center">
          <p className="text-gray">找到 {filteredJobs.length} 个职位</p>
          <select className="input w-auto">
            <option>最新发布</option>
            <option>薪资最高</option>
            <option>相关度</option>
          </select>
        </div>
        
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <div key={job.id} className="card p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="w-12 h-12 bg-gray-200 rounded-medium flex items-center justify-center">
                    <div className="w-8 h-8 bg-primary rounded text-white text-sm font-bold flex items-center justify-center">
                      {job.company.charAt(0)}
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <Link href={`/jobs/${job.id}`} className="text-xl font-semibold text-text hover:text-primary">
                          {job.title}
                        </Link>
                        <p className="text-gray font-medium">{job.company}</p>
                      </div>
                      
                      <button
                        onClick={() => handleBookmark(job.id)}
                        className={`p-2 rounded-medium transition-colors ${
                          job.isBookmarked 
                            ? 'text-primary bg-primary/10' 
                            : 'text-gray hover:text-primary hover:bg-primary/10'
                        }`}
                      >
                        <Bookmark className={`h-5 w-5 ${job.isBookmarked ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {job.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        {job.salary}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {job.postedAt}
                      </div>
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded-small text-xs">
                        {job.type}
                      </span>
                    </div>
                    
                    <p className="text-gray mt-3 line-clamp-2">{job.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mt-3">
                      {job.requirements.map((req, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-background border border-border rounded-small text-xs text-text"
                        >
                          {req}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filteredJobs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray text-lg">没有找到匹配的职位</p>
            <p className="text-gray mt-2">尝试调整搜索条件或筛选器</p>
          </div>
        )}
        
        {/* Pagination */}
        {filteredJobs.length > 0 && (
          <div className="flex justify-center mt-8">
            <div className="flex items-center space-x-2">
              <button className="btn btn-outline">上一页</button>
              <button className="btn btn-primary">1</button>
              <button className="btn btn-outline">2</button>
              <button className="btn btn-outline">3</button>
              <button className="btn btn-outline">下一页</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}