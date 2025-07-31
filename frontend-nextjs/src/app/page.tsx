'use client';

import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Link from 'next/link';
import { RootState } from '../store';
import { setJobs } from '../features/jobs/jobsSlice';
import Navbar from '../components/navigation/Navbar';
import { Search, MapPin, Clock, DollarSign, TrendingUp, Users, Building } from 'lucide-react';

// Mock data for demonstration
const mockJobs = [
  {
    id: '1',
    title: '前端开发工程师',
    company: '阿里巴巴',
    location: '杭州',
    salary: '20K-35K',
    experience: '3-5年',
    type: 'full-time',
    tags: ['React', 'TypeScript', 'Next.js'],
    postedAt: '2天前',
    isBookmarked: false
  },
  {
    id: '2',
    title: 'Node.js后端开发',
    company: '腾讯',
    location: '深圳',
    salary: '25K-40K',
    experience: '3-5年',
    type: 'full-time',
    tags: ['Node.js', 'MongoDB', 'Docker'],
    postedAt: '1天前',
    isBookmarked: false
  },
  {
    id: '3',
    title: 'UI/UX设计师',
    company: '字节跳动',
    location: '北京',
    salary: '18K-30K',
    experience: '2-4年',
    type: 'full-time',
    tags: ['Figma', 'Sketch', '用户体验'],
    postedAt: '3天前',
    isBookmarked: false
  }
];

const stats = [
  { label: '活跃职位', value: '50,000+', icon: Briefcase },
  { label: '注册企业', value: '10,000+', icon: Building },
  { label: '求职者', value: '500,000+', icon: Users },
  { label: '成功匹配', value: '100,000+', icon: TrendingUp }
];

function Briefcase({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
      <path d="m16 21-4-4-4 4"></path>
      <path d="M9 7V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v3"></path>
    </svg>
  );
}

export default function Home() {
  const dispatch = useDispatch();
  const { jobs } = useSelector((state: RootState) => state.jobs);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Load mock jobs data
    dispatch(setJobs(mockJobs));
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 to-secondary/10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-text mb-6">
              找到你的
              <span className="text-primary"> 理想工作</span>
            </h1>
            <p className="text-xl text-gray mb-8 max-w-2xl mx-auto">
              连接优秀人才与顶级企业，开启职业新篇章
            </p>
            
            {/* Search Bar */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-background rounded-large shadow-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray h-5 w-5" />
                      <input
                        type="text"
                        placeholder="搜索职位、公司或技能"
                        className="input pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray h-5 w-5" />
                      <input
                        type="text"
                        placeholder="城市"
                        className="input pl-10"
                      />
                    </div>
                  </div>
                  <button className="btn btn-primary w-full">
                    搜索职位
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-large mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-2xl font-bold text-text mb-1">{stat.value}</div>
                  <div className="text-gray">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-text">热门职位</h2>
            <Link href="/jobs" className="btn btn-outline">
              查看全部
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.slice(0, 6).map((job) => (
              <div key={job.id} className="card hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-text mb-1">{job.title}</h3>
                    <p className="text-gray">{job.company}</p>
                  </div>
                  <button className="text-gray hover:text-primary transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray">
                    <MapPin className="w-4 h-4 mr-1" />
                    {job.location}
                  </div>
                  <div className="flex items-center text-sm text-gray">
                    <DollarSign className="w-4 h-4 mr-1" />
                    {job.salary}
                  </div>
                  <div className="flex items-center text-sm text-gray">
                    <Clock className="w-4 h-4 mr-1" />
                    {job.postedAt}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {job.tags.map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-small">
                      {tag}
                    </span>
                  ))}
                </div>
                
                <Link href={`/jobs/${job.id}`} className="btn btn-outline w-full">
                  查看详情
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            准备好开始你的职业之旅了吗？
          </h2>
          <p className="text-xl text-white/90 mb-8">
            加入我们，发现更多机会
          </p>
          <div className="space-x-4">
            {!user && (
              <>
                <Link href="/register" className="btn bg-white text-primary hover:bg-white/90">
                  立即注册
                </Link>
                <Link href="/login" className="btn btn-outline border-white text-white hover:bg-white/10">
                  登录
                </Link>
              </>
            )}
            {user && (
              <Link href="/jobs" className="btn bg-white text-primary hover:bg-white/90">
                浏览职位
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
