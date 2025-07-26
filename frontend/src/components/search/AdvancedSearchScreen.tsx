import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Modal,
  Alert,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { debounce } from 'lodash';

interface SearchFilter {
  id: string;
  name: string;
  type: 'select' | 'range' | 'multiselect' | 'boolean';
  options?: Array<{ value: string; label: string }>;
  min?: number;
  max?: number;
  value?: any;
  icon: string;
}

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  experience: string;
  skills: string[];
  description: string;
  postedDate: Date;
  remote: boolean;
  urgent: boolean;
  featured: boolean;
  matchScore: number;
  reasons: string[];
}

interface Company {
  id: string;
  name: string;
  logo: string;
  industry: string;
  size: string;
  location: string;
  rating: number;
  description: string;
  benefits: string[];
  culture: string[];
  openPositions: number;
  matchScore: number;
}

interface SearchHistory {
  id: string;
  query: string;
  filters: any;
  timestamp: Date;
  resultCount: number;
}

interface Recommendation {
  id: string;
  type: 'job' | 'company' | 'skill' | 'course';
  title: string;
  description: string;
  reason: string;
  confidence: number;
  data: any;
}

const AdvancedSearchScreen: React.FC = () => {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Job[]>([]);
  const [companyResults, setCompanyResults] = useState<Company[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [filters, setFilters] = useState<SearchFilter[]>([]);
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [selectedTab, setSelectedTab] = useState<'jobs' | 'companies' | 'recommendations'>('jobs');
  const [showFilters, setShowFilters] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchMode, setSearchMode] = useState<'simple' | 'advanced'>('simple');

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    try {
      // 初始化搜索过滤器
      setFilters([
        {
          id: 'location',
          name: '工作地点',
          type: 'multiselect',
          options: [
            { value: 'beijing', label: '北京' },
            { value: 'shanghai', label: '上海' },
            { value: 'shenzhen', label: '深圳' },
            { value: 'guangzhou', label: '广州' },
            { value: 'hangzhou', label: '杭州' },
            { value: 'remote', label: '远程工作' },
          ],
          icon: 'location',
        },
        {
          id: 'salary',
          name: '薪资范围',
          type: 'range',
          min: 0,
          max: 100000,
          icon: 'cash',
        },
        {
          id: 'experience',
          name: '工作经验',
          type: 'select',
          options: [
            { value: 'entry', label: '应届生' },
            { value: '1-3', label: '1-3年' },
            { value: '3-5', label: '3-5年' },
            { value: '5-10', label: '5-10年' },
            { value: '10+', label: '10年以上' },
          ],
          icon: 'time',
        },
        {
          id: 'jobType',
          name: '工作类型',
          type: 'multiselect',
          options: [
            { value: 'full-time', label: '全职' },
            { value: 'part-time', label: '兼职' },
            { value: 'contract', label: '合同工' },
            { value: 'internship', label: '实习' },
          ],
          icon: 'briefcase',
        },
        {
          id: 'industry',
          name: '行业领域',
          type: 'multiselect',
          options: [
            { value: 'tech', label: '互联网/科技' },
            { value: 'finance', label: '金融' },
            { value: 'education', label: '教育' },
            { value: 'healthcare', label: '医疗健康' },
            { value: 'retail', label: '零售电商' },
            { value: 'manufacturing', label: '制造业' },
          ],
          icon: 'business',
        },
        {
          id: 'companySize',
          name: '公司规模',
          type: 'select',
          options: [
            { value: 'startup', label: '创业公司 (1-50人)' },
            { value: 'small', label: '小型公司 (51-200人)' },
            { value: 'medium', label: '中型公司 (201-1000人)' },
            { value: 'large', label: '大型公司 (1000+人)' },
          ],
          icon: 'people',
        },
        {
          id: 'remote',
          name: '远程工作',
          type: 'boolean',
          icon: 'home',
        },
        {
          id: 'urgent',
          name: '紧急招聘',
          type: 'boolean',
          icon: 'flash',
        },
      ]);

      // 加载推荐数据
      loadRecommendations();
      loadSearchHistory();
    } catch (error) {
      console.error('初始化数据失败:', error);
    }
  };

  const loadRecommendations = async () => {
    try {
      const mockRecommendations: Recommendation[] = [
        {
          id: '1',
          type: 'job',
          title: '高级前端工程师 - 字节跳动',
          description: '负责抖音前端架构设计和开发',
          reason: '基于您的React和TypeScript技能匹配',
          confidence: 95,
          data: {
            company: '字节跳动',
            salary: '30-50K',
            location: '北京',
          },
        },
        {
          id: '2',
          type: 'company',
          title: '腾讯科技',
          description: '中国领先的互联网科技公司',
          reason: '公司文化和发展机会与您的偏好匹配',
          confidence: 88,
          data: {
            industry: '互联网科技',
            rating: 4.5,
            openPositions: 156,
          },
        },
        {
          id: '3',
          type: 'skill',
          title: 'Vue.js 3.0',
          description: '现代前端框架技能提升',
          reason: '市场需求高，与您现有技能互补',
          confidence: 82,
          data: {
            demand: 'high',
            difficulty: 'medium',
            timeToLearn: '2-3个月',
          },
        },
        {
          id: '4',
          type: 'course',
          title: '微服务架构实战课程',
          description: '从零到一掌握微服务架构设计',
          reason: '提升后端架构能力，拓展职业发展',
          confidence: 76,
          data: {
            duration: '8周',
            level: '中高级',
            provider: '极客时间',
          },
        },
      ];

      setRecommendations(mockRecommendations);
    } catch (error) {
      console.error('加载推荐失败:', error);
    }
  };

  const loadSearchHistory = async () => {
    try {
      const mockHistory: SearchHistory[] = [
        {
          id: '1',
          query: 'React 前端工程师',
          filters: { location: ['beijing'], experience: '3-5' },
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
          resultCount: 45,
        },
        {
          id: '2',
          query: 'Node.js 后端开发',
          filters: { salary: { min: 20000, max: 40000 } },
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
          resultCount: 32,
        },
        {
          id: '3',
          query: '产品经理',
          filters: { location: ['shanghai'], industry: ['tech'] },
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
          resultCount: 28,
        },
      ];

      setSearchHistory(mockHistory);
    } catch (error) {
      console.error('加载搜索历史失败:', error);
    }
  };

  const debouncedSearch = useCallback(
    debounce(async (query: string, filters: Record<string, any>) => {
      if (!query.trim() && Object.keys(filters).length === 0) {
        setSearchResults([]);
        setCompanyResults([]);
        return;
      }

      setLoading(true);
      try {
        // 模拟搜索API调用
        await new Promise(resolve => setTimeout(resolve, 800));

        const mockJobs: Job[] = [
          {
            id: '1',
            title: 'React 前端工程师',
            company: '阿里巴巴',
            location: '杭州',
            salary: { min: 25000, max: 40000, currency: 'CNY' },
            type: 'full-time',
            experience: '3-5年',
            skills: ['React', 'TypeScript', 'Redux', 'Webpack'],
            description: '负责淘宝前端业务开发，参与大型项目架构设计',
            postedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
            remote: false,
            urgent: true,
            featured: true,
            matchScore: 95,
            reasons: ['技能匹配度高', '薪资符合期望', '公司知名度高'],
          },
          {
            id: '2',
            title: 'Vue.js 前端开发工程师',
            company: '美团',
            location: '北京',
            salary: { min: 22000, max: 35000, currency: 'CNY' },
            type: 'full-time',
            experience: '2-4年',
            skills: ['Vue.js', 'JavaScript', 'Element UI', 'Node.js'],
            description: '参与美团外卖前端系统开发和维护',
            postedDate: new Date(Date.now() - 1000 * 60 * 60 * 24),
            remote: true,
            urgent: false,
            featured: false,
            matchScore: 88,
            reasons: ['地理位置匹配', '技能相关性强', '远程工作机会'],
          },
          {
            id: '3',
            title: '全栈工程师',
            company: '字节跳动',
            location: '深圳',
            salary: { min: 30000, max: 50000, currency: 'CNY' },
            type: 'full-time',
            experience: '3-6年',
            skills: ['React', 'Node.js', 'MongoDB', 'Docker'],
            description: '负责抖音相关产品的全栈开发',
            postedDate: new Date(Date.now() - 1000 * 60 * 60 * 12),
            remote: false,
            urgent: true,
            featured: true,
            matchScore: 92,
            reasons: ['薪资优势明显', '技术栈匹配', '成长空间大'],
          },
        ].filter(job => {
          // 应用搜索过滤器
          if (query && !job.title.toLowerCase().includes(query.toLowerCase()) &&
              !job.company.toLowerCase().includes(query.toLowerCase())) {
            return false;
          }
          
          if (filters.location && filters.location.length > 0) {
            const locationMatch = filters.location.some((loc: string) => 
              job.location.toLowerCase().includes(loc) || 
              (loc === 'remote' && job.remote)
            );
            if (!locationMatch) return false;
          }

          if (filters.experience && job.experience !== filters.experience) {
            return false;
          }

          if (filters.jobType && filters.jobType.length > 0 && 
              !filters.jobType.includes(job.type)) {
            return false;
          }

          if (filters.salary) {
            if (filters.salary.min && job.salary.max < filters.salary.min) return false;
            if (filters.salary.max && job.salary.min > filters.salary.max) return false;
          }

          if (filters.remote && !job.remote) return false;
          if (filters.urgent && !job.urgent) return false;

          return true;
        });

        const mockCompanies: Company[] = [
          {
            id: '1',
            name: '阿里巴巴集团',
            logo: 'https://via.placeholder.com/50',
            industry: '互联网科技',
            size: '10000+人',
            location: '杭州',
            rating: 4.5,
            description: '全球领先的数字经济体',
            benefits: ['五险一金', '年终奖', '股票期权', '免费班车'],
            culture: ['创新', '客户第一', '团队合作', '拥抱变化'],
            openPositions: 234,
            matchScore: 90,
          },
          {
            id: '2',
            name: '腾讯科技',
            logo: 'https://via.placeholder.com/50',
            industry: '互联网科技',
            size: '5000-10000人',
            location: '深圳',
            rating: 4.3,
            description: '连接一切的科技公司',
            benefits: ['弹性工作', '健身房', '员工食堂', '培训机会'],
            culture: ['用户为本', '科技向善', '开放协作', '进取创新'],
            openPositions: 189,
            matchScore: 85,
          },
        ];

        setSearchResults(mockJobs);
        setCompanyResults(mockCompanies);

        // 保存搜索历史
        const newHistory: SearchHistory = {
          id: Date.now().toString(),
          query,
          filters,
          timestamp: new Date(),
          resultCount: mockJobs.length,
        };
        setSearchHistory(prev => [newHistory, ...prev.slice(0, 9)]);

      } catch (error) {
        console.error('搜索失败:', error);
        Alert.alert('错误', '搜索失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    }, 500),
    []
  );

  useEffect(() => {
    debouncedSearch(searchQuery, activeFilters);
  }, [searchQuery, activeFilters, debouncedSearch]);

  const handleFilterChange = (filterId: string, value: any) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterId]: value,
    }));
  };

  const clearFilters = () => {
    setActiveFilters({});
  };

  const handleHistorySelect = (history: SearchHistory) => {
    setSearchQuery(history.query);
    setActiveFilters(history.filters);
    setShowHistory(false);
  };

  const formatSalary = (salary: Job['salary']) => {
    return `${salary.min / 1000}K-${salary.max / 1000}K`;
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (hours < 1) return '刚刚';
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    
    return timestamp.toLocaleDateString('zh-CN');
  };

  const renderJob = ({ item: job }: { item: Job }) => (
    <TouchableOpacity style={[styles.jobCard, { backgroundColor: theme.surface }]}>
      <View style={styles.jobHeader}>
        <View style={styles.jobTitleRow}>
          <Text style={[styles.jobTitle, { color: theme.text }]}>
            {job.title}
          </Text>
          <View style={styles.jobBadges}>
            {job.featured && (
              <View style={[styles.badge, { backgroundColor: theme.warning }]}>
                <Text style={[styles.badgeText, { color: theme.background }]}>
                  推荐
                </Text>
              </View>
            )}
            {job.urgent && (
              <View style={[styles.badge, { backgroundColor: theme.error }]}>
                <Text style={[styles.badgeText, { color: theme.background }]}>
                  急聘
                </Text>
              </View>
            )}
            {job.remote && (
              <View style={[styles.badge, { backgroundColor: theme.success }]}>
                <Text style={[styles.badgeText, { color: theme.background }]}>
                  远程
                </Text>
              </View>
            )}
          </View>
        </View>
        <Text style={[styles.jobCompany, { color: theme.primary }]}>
          {job.company}
        </Text>
        <View style={styles.jobMeta}>
          <Text style={[styles.jobMetaText, { color: theme.textSecondary }]}>
            {job.location} • {formatSalary(job.salary)} • {job.experience}
          </Text>
          <Text style={[styles.jobPosted, { color: theme.textSecondary }]}>
            {formatTimestamp(job.postedDate)}
          </Text>
        </View>
      </View>

      <Text style={[styles.jobDescription, { color: theme.textSecondary }]}>
        {job.description}
      </Text>

      <View style={styles.jobSkills}>
        {job.skills.slice(0, 4).map((skill, index) => (
          <View key={index} style={[styles.skillTag, { backgroundColor: theme.primary + '20' }]}>
            <Text style={[styles.skillText, { color: theme.primary }]}>
              {skill}
            </Text>
          </View>
        ))}
        {job.skills.length > 4 && (
          <Text style={[styles.moreSkills, { color: theme.textSecondary }]}>
            +{job.skills.length - 4}
          </Text>
        )}
      </View>

      <View style={styles.jobFooter}>
        <View style={styles.matchScore}>
          <Ionicons name="analytics" size={16} color={theme.success} />
          <Text style={[styles.matchScoreText, { color: theme.success }]}>
            匹配度 {job.matchScore}%
          </Text>
        </View>
        <View style={styles.jobActions}>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.primary + '20' }]}>
            <Ionicons name="heart-outline" size={16} color={theme.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.primary }]}>
            <Text style={[styles.actionButtonText, { color: theme.background }]}>
              立即申请
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {job.reasons.length > 0 && (
        <View style={[styles.matchReasons, { backgroundColor: theme.success + '10' }]}>
          <Text style={[styles.matchReasonsTitle, { color: theme.success }]}>
            推荐理由：
          </Text>
          {job.reasons.map((reason, index) => (
            <Text key={index} style={[styles.matchReason, { color: theme.success }]}>
              • {reason}
            </Text>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );

  const renderCompany = ({ item: company }: { item: Company }) => (
    <TouchableOpacity style={[styles.companyCard, { backgroundColor: theme.surface }]}>
      <View style={styles.companyHeader}>
        <View style={styles.companyLogo}>
          <Text style={[styles.companyLogoText, { color: theme.primary }]}>
            {company.name.charAt(0)}
          </Text>
        </View>
        <View style={styles.companyInfo}>
          <Text style={[styles.companyName, { color: theme.text }]}>
            {company.name}
          </Text>
          <Text style={[styles.companyIndustry, { color: theme.textSecondary }]}>
            {company.industry} • {company.size}
          </Text>
          <View style={styles.companyRating}>
            <Ionicons name="star" size={14} color={theme.warning} />
            <Text style={[styles.ratingText, { color: theme.textSecondary }]}>
              {company.rating} • {company.openPositions} 个职位
            </Text>
          </View>
        </View>
        <View style={styles.matchScore}>
          <Text style={[styles.matchScoreText, { color: theme.success }]}>
            {company.matchScore}%
          </Text>
        </View>
      </View>

      <Text style={[styles.companyDescription, { color: theme.textSecondary }]}>
        {company.description}
      </Text>

      <View style={styles.companyBenefits}>
        {company.benefits.slice(0, 3).map((benefit, index) => (
          <View key={index} style={[styles.benefitTag, { backgroundColor: theme.primary + '20' }]}>
            <Text style={[styles.benefitText, { color: theme.primary }]}>
              {benefit}
            </Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );

  const renderRecommendation = ({ item: rec }: { item: Recommendation }) => (
    <TouchableOpacity style={[styles.recommendationCard, { backgroundColor: theme.surface }]}>
      <View style={styles.recommendationHeader}>
        <View style={[styles.recommendationType, { backgroundColor: theme.primary + '20' }]}>
          <Ionicons
            name={
              rec.type === 'job' ? 'briefcase' :
              rec.type === 'company' ? 'business' :
              rec.type === 'skill' ? 'school' : 'book'
            }
            size={16}
            color={theme.primary}
          />
          <Text style={[styles.recommendationTypeText, { color: theme.primary }]}>
            {rec.type === 'job' ? '职位' :
             rec.type === 'company' ? '公司' :
             rec.type === 'skill' ? '技能' : '课程'}
          </Text>
        </View>
        <View style={styles.confidenceScore}>
          <Text style={[styles.confidenceText, { color: theme.success }]}>
            {rec.confidence}%
          </Text>
        </View>
      </View>

      <Text style={[styles.recommendationTitle, { color: theme.text }]}>
        {rec.title}
      </Text>
      <Text style={[styles.recommendationDescription, { color: theme.textSecondary }]}>
        {rec.description}
      </Text>
      <Text style={[styles.recommendationReason, { color: theme.primary }]}>
        {rec.reason}
      </Text>
    </TouchableOpacity>
  );

  const renderFilter = (filter: SearchFilter) => {
    const value = activeFilters[filter.id];

    return (
      <View key={filter.id} style={[styles.filterItem, { backgroundColor: theme.surface }]}>
        <View style={styles.filterHeader}>
          <Ionicons name={filter.icon as any} size={20} color={theme.primary} />
          <Text style={[styles.filterName, { color: theme.text }]}>
            {filter.name}
          </Text>
        </View>

        {filter.type === 'select' && (
          <View style={styles.filterOptions}>
            {filter.options?.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.filterOption,
                  {
                    backgroundColor: value === option.value ? theme.primary + '20' : 'transparent',
                    borderColor: value === option.value ? theme.primary : theme.border,
                  }
                ]}
                onPress={() => handleFilterChange(filter.id, option.value)}
              >
                <Text style={[
                  styles.filterOptionText,
                  { color: value === option.value ? theme.primary : theme.text }
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {filter.type === 'multiselect' && (
          <View style={styles.filterOptions}>
            {filter.options?.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.filterOption,
                  {
                    backgroundColor: value?.includes(option.value) ? theme.primary + '20' : 'transparent',
                    borderColor: value?.includes(option.value) ? theme.primary : theme.border,
                  }
                ]}
                onPress={() => {
                  const currentValue = value || [];
                  const newValue = currentValue.includes(option.value)
                    ? currentValue.filter((v: string) => v !== option.value)
                    : [...currentValue, option.value];
                  handleFilterChange(filter.id, newValue);
                }}
              >
                <Text style={[
                  styles.filterOptionText,
                  { color: value?.includes(option.value) ? theme.primary : theme.text }
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {filter.type === 'boolean' && (
          <TouchableOpacity
            style={[
              styles.booleanFilter,
              { backgroundColor: value ? theme.primary + '20' : theme.border + '20' }
            ]}
            onPress={() => handleFilterChange(filter.id, !value)}
          >
            <Text style={[
              styles.booleanFilterText,
              { color: value ? theme.primary : theme.textSecondary }
            ]}>
              {value ? '已启用' : '未启用'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <LinearGradient
        colors={[theme.primary, theme.primary + '80']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.headerTitle}>智能搜索</Text>
        <Text style={styles.headerSubtitle}>AI 驱动的职位推荐引擎</Text>
      </LinearGradient>

      <View style={[styles.searchContainer, { backgroundColor: theme.surface }]}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={theme.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="搜索职位、公司或技能..."
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity onPress={() => setShowHistory(true)}>
            <Ionicons name="time" size={20} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchActions}>
          <TouchableOpacity
            style={[
              styles.searchModeButton,
              { backgroundColor: searchMode === 'simple' ? theme.primary : 'transparent' }
            ]}
            onPress={() => setSearchMode('simple')}
          >
            <Text style={[
              styles.searchModeText,
              { color: searchMode === 'simple' ? theme.background : theme.textSecondary }
            ]}>
              简单搜索
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.searchModeButton,
              { backgroundColor: searchMode === 'advanced' ? theme.primary : 'transparent' }
            ]}
            onPress={() => setSearchMode('advanced')}
          >
            <Text style={[
              styles.searchModeText,
              { color: searchMode === 'advanced' ? theme.background : theme.textSecondary }
            ]}>
              高级搜索
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, { backgroundColor: theme.primary }]}
            onPress={() => setShowFilters(true)}
          >
            <Ionicons name="options" size={16} color={theme.background} />
            <Text style={[styles.filterButtonText, { color: theme.background }]}>
              筛选
            </Text>
            {Object.keys(activeFilters).length > 0 && (
              <View style={[styles.filterCount, { backgroundColor: theme.error }]}>
                <Text style={[styles.filterCountText, { color: theme.background }]}>
                  {Object.keys(activeFilters).length}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.tabBar, { backgroundColor: theme.surface }]}>
        {[
          { key: 'jobs', label: '职位', icon: 'briefcase' },
          { key: 'companies', label: '公司', icon: 'business' },
          { key: 'recommendations', label: '推荐', icon: 'bulb' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tabButton,
              selectedTab === tab.key && { backgroundColor: theme.primary }
            ]}
            onPress={() => setSelectedTab(tab.key as any)}
          >
            <Ionicons
              name={tab.icon as any}
              size={18}
              color={selectedTab === tab.key ? theme.background : theme.textSecondary}
            />
            <Text style={[
              styles.tabButtonText,
              { color: selectedTab === tab.key ? theme.background : theme.textSecondary }
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.content}>
        {loading && (
          <View style={[styles.loadingContainer, { backgroundColor: theme.surface }]}>
            <Text style={[styles.loadingText, { color: theme.text }]}>
              搜索中...
            </Text>
          </View>
        )}

        {selectedTab === 'jobs' && (
          <FlatList
            data={searchResults}
            renderItem={renderJob}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.resultsList}
          />
        )}

        {selectedTab === 'companies' && (
          <FlatList
            data={companyResults}
            renderItem={renderCompany}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.resultsList}
          />
        )}

        {selectedTab === 'recommendations' && (
          <FlatList
            data={recommendations}
            renderItem={renderRecommendation}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.resultsList}
          />
        )}
      </View>

      {/* 筛选器模态框 */}
      <Modal
        visible={showFilters}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: theme.surface }]}>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Text style={[styles.modalCancel, { color: theme.textSecondary }]}>
                取消
              </Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              搜索筛选
            </Text>
            <TouchableOpacity onPress={clearFilters}>
              <Text style={[styles.modalClear, { color: theme.primary }]}>
                清除
              </Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {filters.map(renderFilter)}
          </ScrollView>
        </View>
      </Modal>

      {/* 搜索历史模态框 */}
      <Modal
        visible={showHistory}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: theme.surface }]}>
            <TouchableOpacity onPress={() => setShowHistory(false)}>
              <Text style={[styles.modalCancel, { color: theme.textSecondary }]}>
                关闭
              </Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              搜索历史
            </Text>
            <TouchableOpacity onPress={() => setSearchHistory([])}>
              <Text style={[styles.modalClear, { color: theme.primary }]}>
                清除
              </Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={searchHistory}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.historyItem, { backgroundColor: theme.surface }]}
                onPress={() => handleHistorySelect(item)}
              >
                <View style={styles.historyContent}>
                  <Text style={[styles.historyQuery, { color: theme.text }]}>
                    {item.query}
                  </Text>
                  <Text style={[styles.historyMeta, { color: theme.textSecondary }]}>
                    {formatTimestamp(item.timestamp)} • {item.resultCount} 个结果
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.historyList}
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
  },
  searchContainer: {
    padding: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 10,
    marginRight: 10,
  },
  searchActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  searchModeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 10,
  },
  searchModeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    position: 'relative',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
  filterCount: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterCountText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 2,
    borderRadius: 16,
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  resultsList: {
    paddingBottom: 20,
  },
  jobCard: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  jobHeader: {
    marginBottom: 12,
  },
  jobTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 5,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 10,
  },
  jobBadges: {
    flexDirection: 'row',
    gap: 5,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  jobCompany: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  jobMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  jobMetaText: {
    fontSize: 14,
  },
  jobPosted: {
    fontSize: 12,
  },
  jobDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  jobSkills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 12,
  },
  skillTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 5,
  },
  skillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  moreSkills: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  matchScore: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  matchScoreText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
  jobActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  matchReasons: {
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  matchReasonsTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 5,
  },
  matchReason: {
    fontSize: 12,
    marginBottom: 2,
  },
  companyCard: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  companyHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  companyLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  companyLogoText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  companyIndustry: {
    fontSize: 14,
    marginBottom: 5,
  },
  companyRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    marginLeft: 3,
  },
  companyDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  companyBenefits: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  benefitTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  benefitText: {
    fontSize: 12,
    fontWeight: '600',
  },
  recommendationCard: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  recommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  recommendationType: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recommendationTypeText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 5,
  },
  confidenceScore: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  recommendationDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  recommendationReason: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
  },
  modalCancel: {
    fontSize: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalClear: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  filterItem: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  filterName: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterOption: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  filterOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  booleanFilter: {
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  booleanFilterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  historyList: {
    padding: 20,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  historyContent: {
    flex: 1,
  },
  historyQuery: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 3,
  },
  historyMeta: {
    fontSize: 12,
  },
});

export default AdvancedSearchScreen;