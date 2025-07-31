'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { setCurrentCompany, toggleFollow } from '@/features/companies/companiesSlice';
import Navbar from '@/components/navigation/Navbar';
import { 
  MapPin, 
  Users, 
  Building, 
  Globe, 
  Calendar,
  Star,
  Heart,
  Share2,
  ArrowLeft,
  Briefcase,
  DollarSign,
  Clock,
  ChevronRight
} from 'lucide-react';

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  salary: string;
  experience: string;
  postedDate: Date;
  description: string;
}

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
  culture: string[];
  benefits: string[];
  rating: number;
  reviewCount: number;
  followersCount: number;
  isFollowing: boolean;
  jobs: Job[];
}

export default function CompanyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const { currentCompany } = useSelector((state: RootState) => state.companies);
  const [activeTab, setActiveTab] = useState<'overview' | 'jobs' | 'reviews'>('overview');
  const [company, setCompany] = useState<Company | null>(null);

  // 模拟公司数据
  const mockCompany: Company = {
    id: params.id as string,
    name: '字节跳动',
    industry: '互联网/科技',
    size: '10000+人',
    location: '北京',
    website: 'https://www.bytedance.com',
    founded: 2012,
    description: '字节跳动是一家全球化的互联网科技公司，致力于用技术丰富人们的生活。公司旗下拥有抖音、今日头条、西瓜视频等多个知名产品，服务全球数十亿用户。我们相信技术的力量，通过持续创新为用户创造价值。',
    culture: ['创新驱动', '用户至上', '追求极致', '开放包容', '始终创业'],
    benefits: ['五险一金', '年终奖金', '股票期权', '带薪年假', '免费三餐', '健身房', '班车服务', '培训发展'],
    rating: 4.5,
    reviewCount: 1250,
    followersCount: 15600,
    isFollowing: false,
    jobs: [
      {
        id: '1',
        title: '前端开发工程师',
        department: '技术部',
        location: '北京',
        type: '全职',
        salary: '25-45K',
        experience: '3-5年',
        postedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
        description: '负责前端产品的开发和维护，参与产品需求分析和技术方案设计。'
      },
      {
        id: '2',
        title: '产品经理',
        department: '产品部',
        location: '北京',
        type: '全职',
        salary: '30-50K',
        experience: '3-5年',
        postedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
        description: '负责产品规划和设计，协调各部门推进产品开发。'
      },
      {
        id: '3',
        title: 'UI设计师',
        department: '设计部',
        location: '上海',
        type: '全职',
        salary: '20-35K',
        experience: '2-4年',
        postedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
        description: '负责产品界面设计，提升用户体验。'
      }
    ]
  };

  useEffect(() => {
    // 模拟获取公司数据
    setCompany(mockCompany);
    dispatch(setCurrentCompany(mockCompany.id));
  }, [params.id, dispatch]);

  const handleFollow = () => {
    if (company) {
      setCompany(prev => prev ? {
        ...prev,
        isFollowing: !prev.isFollowing,
        followersCount: prev.isFollowing ? prev.followersCount - 1 : prev.followersCount + 1
      } : null);
      dispatch(toggleFollow(company.id));
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: company?.name,
        text: `查看 ${company?.name} 的公司信息`,
        url: window.location.href,
      });
    } else {
      // 复制链接到剪贴板
      navigator.clipboard.writeText(window.location.href);
      alert('链接已复制到剪贴板');
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return '今天';
    if (days === 1) return '昨天';
    if (days < 7) return `${days}天前`;
    return date.toLocaleDateString();
  };

  if (!company) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 返回按钮 */}
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>返回</span>
        </button>
        
        {/* 公司头部信息 */}
        <div className="bg-card rounded-lg shadow-sm border border-border p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between">
            <div className="flex items-start space-x-6 mb-6 md:mb-0">
              <div className="w-20 h-20 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                <Building className="w-10 h-10 text-white" />
              </div>
              
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-text mb-2">{company.name}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
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
                    <Calendar className="w-4 h-4" />
                    <span>成立于 {company.founded}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="font-medium">{company.rating}</span>
                    <span className="text-gray-600">({company.reviewCount} 评价)</span>
                  </div>
                  <div className="text-gray-600">
                    {company.followersCount.toLocaleString()} 关注者
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handleFollow}
                className={`px-6 py-2 rounded-lg font-medium flex items-center space-x-2 ${
                  company.isFollowing
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'btn-primary'
                }`}
              >
                <Heart className={`w-4 h-4 ${
                  company.isFollowing ? 'fill-current' : ''
                }`} />
                <span>{company.isFollowing ? '已关注' : '关注'}</span>
              </button>
              
              <button
                onClick={handleShare}
                className="px-4 py-2 border border-border rounded-lg hover:bg-gray-50 flex items-center space-x-2"
              >
                <Share2 className="w-4 h-4" />
                <span>分享</span>
              </button>
              
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 border border-border rounded-lg hover:bg-gray-50 flex items-center space-x-2"
              >
                <Globe className="w-4 h-4" />
                <span>官网</span>
              </a>
            </div>
          </div>
        </div>
        
        {/* 标签页导航 */}
        <div className="border-b border-border mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              公司概况
            </button>
            <button
              onClick={() => setActiveTab('jobs')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'jobs'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              在招职位 ({company.jobs.length})
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'reviews'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              员工评价 ({company.reviewCount})
            </button>
          </nav>
        </div>
        
        {/* 内容区域 */}
        <div className="space-y-8">
          {/* 公司概况 */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                {/* 公司介绍 */}
                <div className="bg-card rounded-lg shadow-sm border border-border p-6">
                  <h2 className="text-xl font-semibold text-text mb-4">公司介绍</h2>
                  <p className="text-gray-600 leading-relaxed">{company.description}</p>
                </div>
                
                {/* 企业文化 */}
                <div className="bg-card rounded-lg shadow-sm border border-border p-6">
                  <h2 className="text-xl font-semibold text-text mb-4">企业文化</h2>
                  <div className="flex flex-wrap gap-2">
                    {company.culture.map((value, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                      >
                        {value}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                {/* 福利待遇 */}
                <div className="bg-card rounded-lg shadow-sm border border-border p-6">
                  <h2 className="text-xl font-semibold text-text mb-4">福利待遇</h2>
                  <div className="space-y-2">
                    {company.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span className="text-gray-600">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* 在招职位 */}
          {activeTab === 'jobs' && (
            <div className="space-y-6">
              {company.jobs.map((job) => (
                <div key={job.id} className="bg-card rounded-lg shadow-sm border border-border p-6 hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex-1 mb-4 md:mb-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-text hover:text-primary cursor-pointer">
                          {job.title}
                        </h3>
                        <span className="text-lg font-bold text-primary ml-4">{job.salary}</span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center space-x-1">
                          <Building className="w-4 h-4" />
                          <span>{job.department}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Briefcase className="w-4 h-4" />
                          <span>{job.type}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{job.experience}</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mb-3">{job.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          发布于 {formatDate(job.postedDate)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-3">
                      <button
                        onClick={() => router.push(`/jobs/${job.id}`)}
                        className="btn-outline px-4 py-2 flex items-center space-x-1"
                      >
                        <span>查看详情</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      <button className="btn-primary px-6 py-2">
                        立即申请
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {company.jobs.length === 0 && (
                <div className="text-center py-12">
                  <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">暂无在招职位</h3>
                  <p className="text-gray-600">该公司目前没有公开的招聘职位</p>
                </div>
              )}
            </div>
          )}
          
          {/* 员工评价 */}
          {activeTab === 'reviews' && (
            <div className="bg-card rounded-lg shadow-sm border border-border p-6">
              <div className="text-center py-12">
                <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">员工评价功能开发中</h3>
                <p className="text-gray-600">敬请期待员工评价和公司评分功能</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}