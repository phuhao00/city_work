'use client';

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useRouter } from 'next/navigation';
import { RootState } from '@/store';
import { toggleBookmark } from '@/features/jobs/jobsSlice';
import Navbar from '@/components/navigation/Navbar';
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  Users, 
  Bookmark, 
  Share2, 
  ArrowLeft,
  Building,
  Calendar,
  CheckCircle
} from 'lucide-react';

interface JobDetail {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  description: string;
  requirements: string[];
  benefits: string[];
  companyInfo: {
    name: string;
    size: string;
    industry: string;
    description: string;
    website: string;
  };
  postedDate: string;
  deadline: string;
  isBookmarked: boolean;
}

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const { bookmarkedJobs } = useSelector((state: RootState) => state.jobs);
  const [job, setJob] = useState<JobDetail | null>(null);
  const [isApplied, setIsApplied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 模拟获取职位详情
    const fetchJobDetail = async () => {
      setLoading(true);
      // 模拟API调用
      setTimeout(() => {
        const mockJob: JobDetail = {
          id: params.id as string,
          title: '高级前端开发工程师',
          company: '阿里巴巴集团',
          location: '北京市朝阳区',
          salary: '25K-40K',
          type: '全职',
          description: `我们正在寻找一位经验丰富的高级前端开发工程师加入我们的团队。您将负责开发和维护我们的核心产品，与设计师和后端工程师密切合作，为用户提供优秀的产品体验。

职责包括：
• 开发高质量的前端应用程序
• 与UI/UX设计师合作实现设计稿
• 优化应用性能和用户体验
• 参与代码审查和技术分享
• 指导初级开发人员`,
          requirements: [
            '5年以上前端开发经验',
            '精通React、Vue.js或Angular框架',
            '熟悉TypeScript、ES6+语法',
            '了解前端工程化和构建工具',
            '有移动端开发经验优先',
            '良好的团队协作能力'
          ],
          benefits: [
            '五险一金 + 补充医疗保险',
            '年终奖金 + 股票期权',
            '弹性工作时间',
            '免费三餐和下午茶',
            '年度体检和健身房',
            '技术培训和会议支持'
          ],
          companyInfo: {
            name: '阿里巴巴集团',
            size: '10000+人',
            industry: '互联网/电商',
            description: '阿里巴巴集团是一家以电子商务为核心的科技公司，致力于让天下没有难做的生意。',
            website: 'https://www.alibaba.com'
          },
          postedDate: '2024-01-15',
          deadline: '2024-02-15',
          isBookmarked: bookmarkedJobs.includes(params.id as string)
        };
        setJob(mockJob);
        setLoading(false);
      }, 1000);
    };

    fetchJobDetail();
  }, [params.id, bookmarkedJobs]);

  const handleBookmark = () => {
    if (job) {
      dispatch(toggleBookmark(job.id));
      setJob(prev => prev ? { ...prev, isBookmarked: !prev.isBookmarked } : null);
    }
  };

  const handleApply = () => {
    setIsApplied(true);
    // 这里应该调用申请API
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: job?.title,
        text: `查看这个职位：${job?.title} - ${job?.company}`,
        url: window.location.href
      });
    } else {
      // 复制链接到剪贴板
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-text mb-4">职位未找到</h1>
            <button
              onClick={() => router.back()}
              className="btn-primary px-6 py-3"
            >
              返回
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 返回按钮 */}
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-gray-600 hover:text-primary mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>返回职位列表</span>
        </button>
        
        {/* 职位头部信息 */}
        <div className="bg-card rounded-lg shadow-sm border border-border p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-text mb-2">{job.title}</h1>
              <div className="flex items-center space-x-4 text-gray-600 mb-4">
                <div className="flex items-center space-x-1">
                  <Building className="w-4 h-4" />
                  <span>{job.company}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <DollarSign className="w-4 h-4" />
                  <span>{job.salary}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{job.type}</span>
                </div>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>发布时间：{job.postedDate}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>截止时间：{job.deadline}</span>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={handleBookmark}
                className={`p-2 rounded-lg border ${job.isBookmarked 
                  ? 'bg-primary text-white border-primary' 
                  : 'bg-white text-gray-600 border-border hover:bg-gray-50'
                }`}
              >
                <Bookmark className="w-5 h-5" />
              </button>
              <button
                onClick={handleShare}
                className="p-2 rounded-lg border bg-white text-gray-600 border-border hover:bg-gray-50"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* 申请按钮 */}
          <div className="flex space-x-4">
            {isApplied ? (
              <div className="flex items-center space-x-2 text-success">
                <CheckCircle className="w-5 h-5" />
                <span>已申请</span>
              </div>
            ) : (
              <button
                onClick={handleApply}
                className="btn-primary px-8 py-3"
              >
                立即申请
              </button>
            )}
            <button className="btn-outline px-8 py-3">
              投递简历
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 主要内容 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 职位描述 */}
            <div className="bg-card rounded-lg shadow-sm border border-border p-6">
              <h2 className="text-xl font-semibold mb-4">职位描述</h2>
              <div className="text-gray-600 whitespace-pre-line">
                {job.description}
              </div>
            </div>
            
            {/* 任职要求 */}
            <div className="bg-card rounded-lg shadow-sm border border-border p-6">
              <h2 className="text-xl font-semibold mb-4">任职要求</h2>
              <ul className="space-y-2">
                {job.requirements.map((req, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600">{req}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* 福利待遇 */}
            <div className="bg-card rounded-lg shadow-sm border border-border p-6">
              <h2 className="text-xl font-semibold mb-4">福利待遇</h2>
              <ul className="space-y-2">
                {job.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* 侧边栏 - 公司信息 */}
          <div className="space-y-6">
            <div className="bg-card rounded-lg shadow-sm border border-border p-6">
              <h2 className="text-xl font-semibold mb-4">公司信息</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-text">{job.companyInfo.name}</h3>
                  <p className="text-sm text-gray-600">{job.companyInfo.industry}</p>
                </div>
                
                <div className="flex items-center space-x-2 text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>{job.companyInfo.size}</span>
                </div>
                
                <p className="text-gray-600 text-sm">
                  {job.companyInfo.description}
                </p>
                
                <a
                  href={job.companyInfo.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline text-sm"
                >
                  访问公司官网
                </a>
              </div>
            </div>
            
            {/* 相似职位 */}
            <div className="bg-card rounded-lg shadow-sm border border-border p-6">
              <h2 className="text-xl font-semibold mb-4">相似职位</h2>
              <div className="space-y-3">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="border-b border-border pb-3 last:border-b-0">
                    <h4 className="font-medium text-sm hover:text-primary cursor-pointer">
                      前端开发工程师
                    </h4>
                    <p className="text-xs text-gray-600">腾讯科技 • 深圳</p>
                    <p className="text-xs text-primary">20K-35K</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}