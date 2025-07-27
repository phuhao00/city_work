import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { 
  EnhancedButton, 
  EnhancedCard, 
  SkeletonCard,
  SkeletonJobCard 
} from '../ui';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface HomeScreenProps {
  navigation?: any;
}

interface QuickAction {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  route: string;
  description: string;
}

interface JobRecommendation {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  matchScore: number;
}

interface Statistic {
  id: string;
  title: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  trend: 'up' | 'down' | 'stable';
  trendValue: string;
}

export const EnhancedHomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userName] = useState('张三'); // 模拟用户名

  const quickActions: QuickAction[] = [
    {
      id: '1',
      title: '搜索职位',
      icon: 'search',
      color: '#4CAF50',
      route: 'Search',
      description: '发现理想工作',
    },
    {
      id: '2',
      title: '我的申请',
      icon: 'document-text',
      color: '#2196F3',
      route: 'Applications',
      description: '查看申请状态',
    },
    {
      id: '3',
      title: '消息中心',
      icon: 'chatbubbles',
      color: '#FF9800',
      route: 'Messages',
      description: '查看最新消息',
    },
    {
      id: '4',
      title: '个人档案',
      icon: 'person',
      color: '#9C27B0',
      route: 'Profile',
      description: '完善个人信息',
    },
  ];

  const statistics: Statistic[] = [
    {
      id: '1',
      title: '浏览次数',
      value: '1,234',
      icon: 'eye',
      color: '#4CAF50',
      trend: 'up',
      trendValue: '+12%',
    },
    {
      id: '2',
      title: '申请职位',
      value: '23',
      icon: 'send',
      color: '#2196F3',
      trend: 'up',
      trendValue: '+5',
    },
    {
      id: '3',
      title: '面试邀请',
      value: '8',
      icon: 'calendar',
      color: '#FF9800',
      trend: 'stable',
      trendValue: '0',
    },
    {
      id: '4',
      title: '收藏职位',
      value: '45',
      icon: 'heart',
      color: '#E91E63',
      trend: 'up',
      trendValue: '+3',
    },
  ];

  const jobRecommendations: JobRecommendation[] = [
    {
      id: '1',
      title: '高级前端开发工程师',
      company: '阿里巴巴',
      location: '杭州',
      salary: '25K-40K',
      type: '全职',
      matchScore: 95,
    },
    {
      id: '2',
      title: 'React Native开发工程师',
      company: '腾讯',
      location: '深圳',
      salary: '20K-35K',
      type: '全职',
      matchScore: 88,
    },
    {
      id: '3',
      title: 'UI/UX设计师',
      company: '字节跳动',
      location: '北京',
      salary: '18K-30K',
      type: '全职',
      matchScore: 82,
    },
  ];

  useEffect(() => {
    // 模拟数据加载
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    // 模拟刷新数据
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '早上好';
    if (hour < 18) return '下午好';
    return '晚上好';
  };

  const renderHeader = () => (
    <LinearGradient
      colors={[theme.colors.primary, theme.colors.secondary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.header}
    >
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      <View style={styles.headerContent}>
        <View style={styles.greetingContainer}>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.subtitle}>今天也要加油哦！</Text>
        </View>
        <View style={styles.headerActions}>
          <EnhancedButton
            title=""
            onPress={() => navigation?.navigate('Notifications')}
            variant="ghost"
            size="small"
            icon="notifications"
            style={styles.headerButton}
          />
          <EnhancedButton
            title=""
            onPress={() => navigation?.navigate('Settings')}
            variant="ghost"
            size="small"
            icon="settings"
            style={styles.headerButton}
          />
        </View>
      </View>
    </LinearGradient>
  );

  const renderQuickActions = () => (
    <EnhancedCard
      title="快速操作"
      icon="flash"
      style={styles.section}
      variant="elevated"
    >
      <View style={styles.quickActionsGrid}>
        {quickActions.map((action) => (
          <EnhancedButton
            key={action.id}
            title={action.title}
            onPress={() => navigation?.navigate(action.route)}
            variant="ghost"
            size="medium"
            icon={action.icon}
            style={[styles.quickActionButton, { borderColor: action.color }]}
            textStyle={{ color: action.color, fontSize: 12 }}
          />
        ))}
      </View>
    </EnhancedCard>
  );

  const renderStatistics = () => (
    <EnhancedCard
      title="数据概览"
      icon="analytics"
      style={styles.section}
      variant="elevated"
    >
      <View style={styles.statisticsGrid}>
        {statistics.map((stat) => (
          <View key={stat.id} style={styles.statisticItem}>
            <View style={[styles.statisticIcon, { backgroundColor: stat.color }]}>
              <Ionicons name={stat.icon} size={20} color="#FFFFFF" />
            </View>
            <Text style={[styles.statisticValue, { color: theme.colors.text }]}>
              {stat.value}
            </Text>
            <Text style={[styles.statisticTitle, { color: theme.colors.gray }]}>
              {stat.title}
            </Text>
            <View style={styles.trendContainer}>
              <Ionicons
                name={
                  stat.trend === 'up'
                    ? 'trending-up'
                    : stat.trend === 'down'
                    ? 'trending-down'
                    : 'remove'
                }
                size={12}
                color={
                  stat.trend === 'up'
                    ? '#4CAF50'
                    : stat.trend === 'down'
                    ? '#F44336'
                    : theme.colors.gray
                }
              />
              <Text
                style={[
                  styles.trendValue,
                  {
                    color:
                      stat.trend === 'up'
                        ? '#4CAF50'
                        : stat.trend === 'down'
                        ? '#F44336'
                        : theme.colors.gray,
                  },
                ]}
              >
                {stat.trendValue}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </EnhancedCard>
  );

  const renderJobRecommendations = () => (
    <EnhancedCard
      title="推荐职位"
      subtitle="基于您的技能和偏好"
      icon="briefcase"
      style={styles.section}
      variant="elevated"
    >
      {isLoading ? (
        <View>
          {Array.from({ length: 3 }).map((_, index) => (
            <SkeletonJobCard key={index} style={styles.skeletonJob} />
          ))}
        </View>
      ) : (
        <View>
          {jobRecommendations.map((job) => (
            <EnhancedCard
              key={job.id}
              onPress={() => navigation?.navigate('JobDetail', { jobId: job.id })}
              style={styles.jobCard}
              variant="outlined"
              padding="medium"
            >
              <View style={styles.jobHeader}>
                <View style={styles.jobInfo}>
                  <Text style={[styles.jobTitle, { color: theme.colors.text }]}>
                    {job.title}
                  </Text>
                  <Text style={[styles.jobCompany, { color: theme.colors.gray }]}>
                    {job.company} · {job.location}
                  </Text>
                </View>
                <View style={[styles.matchScore, { backgroundColor: theme.colors.primary }]}>
                  <Text style={styles.matchScoreText}>{job.matchScore}%</Text>
                </View>
              </View>
              <View style={styles.jobFooter}>
                <Text style={[styles.jobSalary, { color: theme.colors.primary }]}>
                  {job.salary}
                </Text>
                <Text style={[styles.jobType, { color: theme.colors.gray }]}>
                  {job.type}
                </Text>
              </View>
            </EnhancedCard>
          ))}
          <EnhancedButton
            title="查看更多职位"
            onPress={() => navigation?.navigate('Jobs')}
            variant="outline"
            size="medium"
            icon="arrow-forward"
            iconPosition="right"
            fullWidth
            style={styles.viewMoreButton}
          />
        </View>
      )}
    </EnhancedCard>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {renderHeader()}
        <View style={styles.content}>
          {renderQuickActions()}
          {renderStatistics()}
          {renderJobRecommendations()}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greetingContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    width: 40,
    height: 40,
  },
  content: {
    padding: 20,
    paddingTop: 0,
  },
  section: {
    marginBottom: 20,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  quickActionButton: {
    width: (SCREEN_WIDTH - 80) / 2,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 16,
  },
  statisticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  statisticItem: {
    width: (SCREEN_WIDTH - 80) / 2,
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderRadius: 12,
  },
  statisticIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statisticValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statisticTitle: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 4,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  trendValue: {
    fontSize: 10,
    fontWeight: '500',
  },
  skeletonJob: {
    marginBottom: 12,
  },
  jobCard: {
    marginBottom: 12,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  jobInfo: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  jobCompany: {
    fontSize: 14,
  },
  matchScore: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 12,
  },
  matchScoreText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  jobSalary: {
    fontSize: 16,
    fontWeight: '600',
  },
  jobType: {
    fontSize: 14,
  },
  viewMoreButton: {
    marginTop: 8,
  },
});