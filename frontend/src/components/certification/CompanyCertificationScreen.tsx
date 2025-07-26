import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface CompanyCertification {
  id: string;
  type: 'verified' | 'premium' | 'startup' | 'fortune500' | 'unicorn';
  name: string;
  description: string;
  icon: string;
  color: string;
  requirements: string[];
  benefits: string[];
}

interface CompanyRating {
  overall: number;
  workLifeBalance: number;
  compensation: number;
  culture: number;
  careerGrowth: number;
  management: number;
  totalReviews: number;
  wouldRecommend: number;
}

interface CompanyProfile {
  id: string;
  name: string;
  logo: string;
  industry: string;
  size: string;
  location: string;
  founded: number;
  website: string;
  description: string;
  certifications: string[];
  rating: CompanyRating;
  verified: boolean;
  premium: boolean;
}

interface Review {
  id: string;
  companyId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  position: string;
  department: string;
  employmentType: 'current' | 'former';
  rating: {
    overall: number;
    workLifeBalance: number;
    compensation: number;
    culture: number;
    careerGrowth: number;
    management: number;
  };
  title: string;
  pros: string;
  cons: string;
  advice: string;
  wouldRecommend: boolean;
  timestamp: Date;
  helpful: number;
  verified: boolean;
}

const CompanyCertificationScreen: React.FC = () => {
  const { theme } = useTheme();
  const [companies, setCompanies] = useState<CompanyProfile[]>([]);
  const [certifications, setCertifications] = useState<CompanyCertification[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<CompanyProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'companies' | 'certifications' | 'reviews'>('companies');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCertification, setFilterCertification] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // 模拟 API 调用
      setTimeout(() => {
        setCertifications([
          {
            id: 'verified',
            type: 'verified',
            name: '企业认证',
            description: '经过官方验证的真实企业',
            icon: 'checkmark-circle',
            color: '#4CAF50',
            requirements: ['营业执照验证', '企业信息核实', '联系方式确认'],
            benefits: ['增加求职者信任', '提升企业形象', '优先展示'],
          },
          {
            id: 'premium',
            type: 'premium',
            name: '高级认证',
            description: '提供优质服务的企业',
            icon: 'star',
            color: '#FF9800',
            requirements: ['企业认证', '服务质量评估', '用户满意度调查'],
            benefits: ['专属客服', '数据分析', '品牌推广'],
          },
          {
            id: 'startup',
            type: 'startup',
            name: '创业公司',
            description: '具有创新潜力的初创企业',
            icon: 'rocket',
            color: '#E91E63',
            requirements: ['成立时间少于5年', '获得投资或孵化', '创新业务模式'],
            benefits: ['创业标识', '投资者关注', '人才吸引'],
          },
          {
            id: 'fortune500',
            type: 'fortune500',
            name: '世界500强',
            description: '全球知名大型企业',
            icon: 'trophy',
            color: '#9C27B0',
            requirements: ['财富500强榜单', '全球业务', '行业领导地位'],
            benefits: ['权威认证', '全球影响力', '顶级人才'],
          },
          {
            id: 'unicorn',
            type: 'unicorn',
            name: '独角兽企业',
            description: '估值超过10亿美元的未上市公司',
            icon: 'diamond',
            color: '#3F51B5',
            requirements: ['估值10亿美元+', '未上市', '高成长性'],
            benefits: ['独角兽标识', '投资价值', '行业影响'],
          },
        ]);

        setCompanies([
          {
            id: '1',
            name: 'TechCorp',
            logo: 'https://via.placeholder.com/100',
            industry: '互联网科技',
            size: '1000-5000人',
            location: '北京',
            founded: 2015,
            website: 'https://techcorp.com',
            description: '专注于人工智能和大数据的科技公司',
            certifications: ['verified', 'premium', 'unicorn'],
            rating: {
              overall: 4.5,
              workLifeBalance: 4.2,
              compensation: 4.8,
              culture: 4.3,
              careerGrowth: 4.6,
              management: 4.1,
              totalReviews: 1250,
              wouldRecommend: 85,
            },
            verified: true,
            premium: true,
          },
          {
            id: '2',
            name: 'StartupXYZ',
            logo: 'https://via.placeholder.com/100',
            industry: '金融科技',
            size: '50-200人',
            location: '上海',
            founded: 2020,
            website: 'https://startupxyz.com',
            description: '创新的金融科技解决方案提供商',
            certifications: ['verified', 'startup'],
            rating: {
              overall: 4.2,
              workLifeBalance: 4.0,
              compensation: 4.3,
              culture: 4.5,
              careerGrowth: 4.4,
              management: 3.9,
              totalReviews: 89,
              wouldRecommend: 78,
            },
            verified: true,
            premium: false,
          },
          {
            id: '3',
            name: 'GlobalTech Inc.',
            logo: 'https://via.placeholder.com/100',
            industry: '软件开发',
            size: '10000+人',
            location: '深圳',
            founded: 1995,
            website: 'https://globaltech.com',
            description: '全球领先的企业软件解决方案提供商',
            certifications: ['verified', 'premium', 'fortune500'],
            rating: {
              overall: 4.3,
              workLifeBalance: 3.8,
              compensation: 4.6,
              culture: 4.1,
              careerGrowth: 4.2,
              management: 4.0,
              totalReviews: 3420,
              wouldRecommend: 82,
            },
            verified: true,
            premium: true,
          },
        ]);

        setReviews([
          {
            id: '1',
            companyId: '1',
            userId: 'user1',
            userName: '张三',
            userAvatar: 'https://via.placeholder.com/50',
            position: '前端工程师',
            department: '技术部',
            employmentType: 'current',
            rating: {
              overall: 4.5,
              workLifeBalance: 4.0,
              compensation: 5.0,
              culture: 4.5,
              careerGrowth: 4.5,
              management: 4.0,
            },
            title: '很棒的工作环境和成长机会',
            pros: '技术氛围浓厚，同事都很专业，学习机会多，薪资待遇不错',
            cons: '有时候项目压力比较大，加班较多',
            advice: '适合想要快速成长的技术人员',
            wouldRecommend: true,
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
            helpful: 23,
            verified: true,
          },
          {
            id: '2',
            companyId: '1',
            userId: 'user2',
            userName: '李四',
            userAvatar: 'https://via.placeholder.com/50',
            position: '产品经理',
            department: '产品部',
            employmentType: 'former',
            rating: {
              overall: 4.0,
              workLifeBalance: 3.5,
              compensation: 4.5,
              culture: 4.0,
              careerGrowth: 4.5,
              management: 3.5,
            },
            title: '产品导向的公司文化',
            pros: '注重产品质量，用户体验，有很好的产品思维培养',
            cons: '管理层决策有时候变化较快，工作节奏紧张',
            advice: '适合有产品热情的同学',
            wouldRecommend: true,
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14),
            helpful: 18,
            verified: true,
          },
        ]);

        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('加载数据失败:', error);
      Alert.alert('错误', '加载数据失败，请稍后重试');
      setLoading(false);
    }
  };

  const getCertificationBadge = (certificationId: string) => {
    const cert = certifications.find(c => c.id === certificationId);
    if (!cert) return null;

    return (
      <View style={[styles.certificationBadge, { backgroundColor: cert.color }]}>
        <Ionicons name={cert.icon as any} size={12} color="white" />
        <Text style={styles.certificationBadgeText}>{cert.name}</Text>
      </View>
    );
  };

  const renderStarRating = (rating: number, size: number = 16) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Ionicons key={i} name="star" size={size} color="#FFD700" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Ionicons key="half" name="star-half" size={size} color="#FFD700" />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Ionicons key={`empty-${i}`} name="star-outline" size={size} color="#FFD700" />
      );
    }

    return <View style={styles.starRating}>{stars}</View>;
  };

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         company.industry.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCertification = filterCertification === 'all' || 
                                company.certifications.includes(filterCertification);
    return matchesSearch && matchesCertification;
  });

  const renderCompaniesTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.searchContainer}>
        <View style={[styles.searchBox, { backgroundColor: theme.surface }]}>
          <Ionicons name="search" size={20} color={theme.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="搜索企业..."
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterChip,
            { backgroundColor: filterCertification === 'all' ? theme.primary : theme.surface }
          ]}
          onPress={() => setFilterCertification('all')}
        >
          <Text style={[
            styles.filterChipText,
            { color: filterCertification === 'all' ? theme.background : theme.text }
          ]}>
            全部
          </Text>
        </TouchableOpacity>
        {certifications.map((cert) => (
          <TouchableOpacity
            key={cert.id}
            style={[
              styles.filterChip,
              { backgroundColor: filterCertification === cert.id ? theme.primary : theme.surface }
            ]}
            onPress={() => setFilterCertification(cert.id)}
          >
            <Ionicons 
              name={cert.icon as any} 
              size={16} 
              color={filterCertification === cert.id ? theme.background : cert.color} 
            />
            <Text style={[
              styles.filterChipText,
              { color: filterCertification === cert.id ? theme.background : theme.text }
            ]}>
              {cert.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.companiesList} showsVerticalScrollIndicator={false}>
        {filteredCompanies.map((company) => (
          <TouchableOpacity
            key={company.id}
            style={[styles.companyCard, { backgroundColor: theme.surface }]}
            onPress={() => setSelectedCompany(company)}
          >
            <View style={styles.companyHeader}>
              <Image source={{ uri: company.logo }} style={styles.companyLogo} />
              <View style={styles.companyInfo}>
                <View style={styles.companyNameRow}>
                  <Text style={[styles.companyName, { color: theme.text }]}>
                    {company.name}
                  </Text>
                  {company.verified && (
                    <Ionicons name="checkmark-circle" size={16} color={theme.success} />
                  )}
                </View>
                <Text style={[styles.companyIndustry, { color: theme.textSecondary }]}>
                  {company.industry} • {company.size}
                </Text>
                <Text style={[styles.companyLocation, { color: theme.textSecondary }]}>
                  {company.location} • 成立于 {company.founded}
                </Text>
              </View>
            </View>

            <View style={styles.companyCertifications}>
              {company.certifications.map((certId) => getCertificationBadge(certId))}
            </View>

            <View style={styles.companyRating}>
              <View style={styles.ratingLeft}>
                {renderStarRating(company.rating.overall)}
                <Text style={[styles.ratingScore, { color: theme.text }]}>
                  {company.rating.overall.toFixed(1)}
                </Text>
              </View>
              <Text style={[styles.ratingReviews, { color: theme.textSecondary }]}>
                {company.rating.totalReviews} 条评价
              </Text>
            </View>

            <Text style={[styles.companyDescription, { color: theme.textSecondary }]}>
              {company.description}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderCertificationsTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {certifications.map((cert) => (
        <View key={cert.id} style={[styles.certificationCard, { backgroundColor: theme.surface }]}>
          <LinearGradient
            colors={[cert.color, `${cert.color}20`]}
            style={styles.certificationHeader}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.certificationIcon}>
              <Ionicons name={cert.icon as any} size={32} color="white" />
            </View>
            <View style={styles.certificationInfo}>
              <Text style={styles.certificationName}>{cert.name}</Text>
              <Text style={styles.certificationDescription}>{cert.description}</Text>
            </View>
          </LinearGradient>

          <View style={styles.certificationContent}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>认证要求</Text>
            {cert.requirements.map((req, index) => (
              <View key={index} style={styles.requirementItem}>
                <Ionicons name="checkmark-circle" size={16} color={cert.color} />
                <Text style={[styles.requirementText, { color: theme.textSecondary }]}>
                  {req}
                </Text>
              </View>
            ))}

            <Text style={[styles.sectionTitle, { color: theme.text }]}>认证收益</Text>
            {cert.benefits.map((benefit, index) => (
              <View key={index} style={styles.benefitItem}>
                <Ionicons name="star" size={16} color={cert.color} />
                <Text style={[styles.benefitText, { color: theme.textSecondary }]}>
                  {benefit}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const renderReviewsTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {reviews.map((review) => (
        <View key={review.id} style={[styles.reviewCard, { backgroundColor: theme.surface }]}>
          <View style={styles.reviewHeader}>
            <Image source={{ uri: review.userAvatar }} style={styles.reviewerAvatar} />
            <View style={styles.reviewerInfo}>
              <View style={styles.reviewerNameRow}>
                <Text style={[styles.reviewerName, { color: theme.text }]}>
                  {review.userName}
                </Text>
                {review.verified && (
                  <Ionicons name="checkmark-circle" size={14} color={theme.success} />
                )}
              </View>
              <Text style={[styles.reviewerPosition, { color: theme.textSecondary }]}>
                {review.position} • {review.department}
              </Text>
              <Text style={[styles.reviewerType, { color: theme.textSecondary }]}>
                {review.employmentType === 'current' ? '在职员工' : '前员工'}
              </Text>
            </View>
            <View style={styles.reviewRating}>
              {renderStarRating(review.rating.overall, 14)}
              <Text style={[styles.reviewScore, { color: theme.text }]}>
                {review.rating.overall.toFixed(1)}
              </Text>
            </View>
          </View>

          <Text style={[styles.reviewTitle, { color: theme.text }]}>
            {review.title}
          </Text>

          <View style={styles.reviewContent}>
            <View style={styles.reviewSection}>
              <Text style={[styles.reviewSectionTitle, { color: theme.success }]}>
                优点
              </Text>
              <Text style={[styles.reviewSectionText, { color: theme.textSecondary }]}>
                {review.pros}
              </Text>
            </View>

            <View style={styles.reviewSection}>
              <Text style={[styles.reviewSectionTitle, { color: theme.error }]}>
                缺点
              </Text>
              <Text style={[styles.reviewSectionText, { color: theme.textSecondary }]}>
                {review.cons}
              </Text>
            </View>

            <View style={styles.reviewSection}>
              <Text style={[styles.reviewSectionTitle, { color: theme.primary }]}>
                建议
              </Text>
              <Text style={[styles.reviewSectionText, { color: theme.textSecondary }]}>
                {review.advice}
              </Text>
            </View>
          </View>

          <View style={styles.reviewFooter}>
            <View style={styles.reviewRecommend}>
              <Ionicons 
                name={review.wouldRecommend ? "thumbs-up" : "thumbs-down"} 
                size={16} 
                color={review.wouldRecommend ? theme.success : theme.error} 
              />
              <Text style={[
                styles.reviewRecommendText,
                { color: review.wouldRecommend ? theme.success : theme.error }
              ]}>
                {review.wouldRecommend ? '推荐' : '不推荐'}
              </Text>
            </View>
            <View style={styles.reviewActions}>
              <TouchableOpacity style={styles.reviewAction}>
                <Ionicons name="thumbs-up-outline" size={16} color={theme.textSecondary} />
                <Text style={[styles.reviewActionText, { color: theme.textSecondary }]}>
                  有用 ({review.helpful})
                </Text>
              </TouchableOpacity>
              <Text style={[styles.reviewTime, { color: theme.textSecondary }]}>
                {review.timestamp.toLocaleDateString('zh-CN')}
              </Text>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.background }]}>
        <Text style={[styles.loadingText, { color: theme.text }]}>加载企业信息中...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>企业认证</Text>
        <TouchableOpacity onPress={() => setShowReviewModal(true)}>
          <Ionicons name="add-circle" size={24} color={theme.primary} />
        </TouchableOpacity>
      </View>

      <View style={[styles.tabBar, { backgroundColor: theme.surface }]}>
        {[
          { key: 'companies', label: '企业', icon: 'business' },
          { key: 'certifications', label: '认证', icon: 'medal' },
          { key: 'reviews', label: '评价', icon: 'star' },
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
              size={20}
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

      {selectedTab === 'companies' && renderCompaniesTab()}
      {selectedTab === 'certifications' && renderCertificationsTab()}
      {selectedTab === 'reviews' && renderReviewsTab()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  loadingText: {
    fontSize: 16,
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
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginHorizontal: 5,
    borderRadius: 20,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
  tabContent: {
    flex: 1,
    padding: 20,
  },
  searchContainer: {
    marginBottom: 15,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 25,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  filterContainer: {
    marginBottom: 20,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
  companiesList: {
    flex: 1,
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
    marginBottom: 10,
  },
  companyLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  companyInfo: {
    flex: 1,
  },
  companyNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  companyIndustry: {
    fontSize: 14,
    marginBottom: 2,
  },
  companyLocation: {
    fontSize: 14,
  },
  companyCertifications: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  certificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 5,
  },
  certificationBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  companyRating: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  ratingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starRating: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingScore: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  ratingReviews: {
    fontSize: 14,
  },
  companyDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  certificationCard: {
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  certificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  certificationIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  certificationInfo: {
    flex: 1,
  },
  certificationName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  certificationDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  certificationContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 10,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 14,
    marginLeft: 10,
    flex: 1,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  benefitText: {
    fontSize: 14,
    marginLeft: 10,
    flex: 1,
  },
  reviewCard: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  reviewHeader: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 5,
  },
  reviewerPosition: {
    fontSize: 14,
    marginBottom: 2,
  },
  reviewerType: {
    fontSize: 12,
  },
  reviewRating: {
    alignItems: 'flex-end',
  },
  reviewScore: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 2,
  },
  reviewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  reviewContent: {
    marginBottom: 15,
  },
  reviewSection: {
    marginBottom: 10,
  },
  reviewSectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  reviewSectionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  reviewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewRecommend: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewRecommendText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
  reviewActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewAction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  reviewActionText: {
    fontSize: 12,
    marginLeft: 5,
  },
  reviewTime: {
    fontSize: 12,
  },
});

export default CompanyCertificationScreen;