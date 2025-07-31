'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { setCompanies, setFilters, setLoading } from '@/features/companies/companiesSlice';
import Navbar from '@/components/navigation/Navbar';
import { 
  Search, 
  Filter, 
  MapPin, 
  Users, 
  Building, 
  Star,
  Heart,
  ChevronRight,
  Briefcase,
  Globe
} from 'lucide-react';

interface Company {
  id: string;
  name: string;
  logo?: string;
  industry: string;
  size: string;
  location: string;
  website: string;
  founded: number;
  description: string;
  rating: number;
  reviewCount: number;
  followersCount: number;
  isFollowing: boolean;
  jobCount: number;
  tags: string[];
}

export default function CompaniesPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { companies, filters, loading } = useSelector((state: RootState) => state.companies);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);

  // 模拟公司数据
  const mockCompanies: Company[] = [
    {
      id: '1',
      name: '字节跳动',
      industry: '互联网/科技',
      size: '10000+人',
      location: '北京',
      website: 'https://www.bytedance.com',
      founded: 2012,
      description: '字节跳动是一家全球化的互联网科技公司，致力于用技术丰富人们的生活。',
      rating: 4.5,
      reviewCount: 1250,
      followersCount: 15600,
      isFollowing: false,
      jobCount: 156,
      tags: ['互联网', '人工智能', '短视频', '全球化']
    },
    {
      id: '2',
      name: '腾讯',
      industry: '互联网/科技',
      size: '10000+人',
      location: '深圳',
      website: 'https://www.tencent.com',
      founded: 1998,
      description: '腾讯是一家世界领先的互联网科技公司，用技术丰富互联网用户的生活。',
      rating: 4.3,
      reviewCount: 2100,
      followersCount: 28900,
      isFollowing: true,
      jobCount: 234,
      tags: ['社交', '游戏', '云计算', '金融科技']
    },
    {
      id: '3',
      name: '阿里巴巴',
      industry: '互联网/科技',
      size: '10000+人',
      location: '杭州',
      website: 'https://www.alibaba.com',
      founded: 1999,
      description: '阿里巴巴集团是以电子商务为核心的数字经济体。',
      rating: 4.2,
      reviewCount: 1890,
      followersCount: 32100,
      isFollowing: false,
      jobCount: 189,
      tags: ['电商', '云计算', '数字支付', '物流']
    },
    {
      id: '4',
      name: '百度',
      industry: '互联网/科技',
      size: '5000-10000人',
      location: '北京',
      website: 'https://www.baidu.com',
      founded: 2000,
      description: '百度是拥有强大互联网基础的领先AI公司。',
      rating: 4.0,
      reviewCount: 1456,
      followersCount: 18700,
      isFollowing: false,
      jobCount: 98,
      tags: ['搜索引擎', '人工智能', '自动驾驶', '云计算']
    },
    {
      id: '5',
      name: '美团',
      industry: '互联网/科技',
      size: '5000-10000人',
      location: '北京',
      website: 'https://www.meituan.com',
      founded: 2010,
      description: '美团是中国领先的生活服务电子商务平台。',
      rating: 4.1,
      reviewCount: 987,
      followersCount: 12300,
      isFollowing: false,
      jobCount: 145,
      tags: ['生活服务', '外卖', '到店', '出行']
    },
    {
      id: '6',
      name: '小米',
      industry: '硬件/制造',
      size: '1000-5000人',
      location: '北京',
      website: 'https://www.mi.com',
      founded: 2010,
      description: '小米是一家以手机、智能硬件和IoT平台为核心的互联网公司。',
      rating: 4.2,
      reviewCount: 756,
      followersCount: 9800,
      isFollowing: true,
      jobCount: 67,
      tags: ['智能手机', '智能硬件', 'IoT', '生态链']
    }
  ];

  const industries = ['互联网/科技', '硬件/制造', '金融', '教育', '医疗', '零售'];
  const companySizes = ['50人以下', '50-200人', '200-1000人', '1000-5000人', '5000-10000人', '10000+人'];
  const locations = ['北京', '上海', '深圳', '杭州', '广州', '成都', '南京', '武汉'];

  useEffect(() => {
    // 模拟加载公司数据
    dispatch(setLoading(true));
    setTimeout(() => {
      dispatch(setCompanies(mockCompanies));
      dispatch(setLoading(false));
    }, 1000);
  }, [dispatch]);

  useEffect(() => {
    // 过滤公司
    let filtered = mockCompanies;

    if (searchQuery) {
      filtered = filtered.filter(company => 
        company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (selectedIndustry) {
      filtered = filtered.filter(company => company.industry === selectedIndustry);
    }

    if (selectedSize) {
      filtered = filtered.filter(company => company.size === selectedSize);
    }

    if (selectedLocation) {
      filtered = filtered.filter(company => company.location === selectedLocation);
    }

    setFilteredCompanies(filtered);
  }, [searchQuery, selectedIndustry, selectedSize, selectedLocation]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // 搜索逻辑已在 useEffect 中处理
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedIndustry('');
    setSelectedSize('');
    setSelectedLocation('');
  };

  const handleFollow = (companyId: string) => {
    setFilteredCompanies(prev => 
      prev.map(company => 
        company.id === companyId 
          ? { 
              ...company, 
              isFollowing: !company.isFollowing,
              followersCount: company.isFollowing ? company.followersCount - 1 : company.followersCount + 1
            }
          : company
      )
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text mb-2">发现优秀公司</h1>
          <p className="text-gray-600">找到你心仪的公司，开启职业新篇章</p>
        </div>
        
        {/* 搜索和过滤器 */}
        <div className="bg-card rounded-lg shadow-sm border border-border p-6 mb-8">
          <form onSubmit={handleSearch} className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="搜索公司名称、行业或关键词..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </form>
          
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 border border-border rounded-lg hover:bg-gray-50"
            >
              <Filter className="w-4 h-4" />
              <span>筛选</span>
            </button>
            
            {showFilters && (
              <>
                <select
                  value={selectedIndustry}
                  onChange={(e) => setSelectedIndustry(e.target.value)}
                  className="px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">所有行业</option>
                  {industries.map(industry => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </select>
                
                <select
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                  className="px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">所有规模</option>
                  {companySizes.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
                
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">所有地区</option>
                  {locations.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
                
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900"
                >
                  清除筛选
                </button>
              </>
            )}
          </div>
        </div>
        
        {/* 结果统计 */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            找到 <span className="font-medium text-text">{filteredCompanies.length}</span> 家公司
          </p>
        </div>
        
        {/* 公司列表 */}
        <div className="space-y-6">
          {filteredCompanies.map((company) => (
            <div key={company.id} className="bg-card rounded-lg shadow-sm border border-border p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                <div className="flex items-start space-x-4 flex-1 mb-4 lg:mb-0">
                  <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building className="w-8 h-8 text-white" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h3 
                        className="text-xl font-semibold text-text hover:text-primary cursor-pointer"
                        onClick={() => router.push(`/companies/${company.id}`)}
                      >
                        {company.name}
                      </h3>
                      <button
                        onClick={() => handleFollow(company.id)}
                        className={`ml-4 p-2 rounded-lg ${
                          company.isFollowing
                            ? 'text-red-500 hover:bg-red-50'
                            : 'text-gray-400 hover:bg-gray-50 hover:text-red-500'
                        }`}
                      >
                        <Heart className={`w-5 h-5 ${
                          company.isFollowing ? 'fill-current' : ''
                        }`} />
                      </button>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center space-x-1">
                        <Building className="w-4 h-4" />
                        <span>{company.industry}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{company.size}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{company.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span>{company.rating}</span>
                        <span className="text-gray-500">({company.reviewCount})</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-3 line-clamp-2">{company.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {company.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <span>{company.followersCount.toLocaleString()} 关注者</span>
                        <span>{company.jobCount} 个在招职位</span>
                      </div>
                      <span>成立于 {company.founded}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-3 lg:ml-4">
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 border border-border rounded-lg hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <Globe className="w-4 h-4" />
                    <span>官网</span>
                  </a>
                  
                  <button
                    onClick={() => router.push(`/companies/${company.id}`)}
                    className="btn-outline px-4 py-2 flex items-center space-x-2"
                  >
                    <span>查看详情</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => router.push(`/companies/${company.id}?tab=jobs`)}
                    className="btn-primary px-4 py-2 flex items-center space-x-2"
                  >
                    <Briefcase className="w-4 h-4" />
                    <span>查看职位</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {filteredCompanies.length === 0 && (
            <div className="text-center py-12">
              <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">未找到相关公司</h3>
              <p className="text-gray-600">尝试调整搜索条件或筛选器</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}