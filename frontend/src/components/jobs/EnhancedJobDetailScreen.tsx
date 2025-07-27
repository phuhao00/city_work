import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Dimensions,
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { useGetJobByIdQuery } from '../../services/jobsApi';
import {
  EnhancedButton,
  EnhancedCard,
  BottomSheet,
  toastManager,
} from '../ui';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface EnhancedJobDetailScreenProps {
  route: {
    params: {
      jobId: string;
    };
  };
  navigation?: any;
}

interface Job {
  _id: string;
  title: string;
  company: {
    name: string;
    logo?: string;
    description?: string;
    size?: string;
    industry?: string;
    website?: string;
  };
  location: string;
  salary?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  type: string;
  description: string;
  requirements?: string[];
  benefits?: string[];
  responsibilities?: string[];
  postedDate: string;
  deadline?: string;
  urgent?: boolean;
  remote?: boolean;
  experience?: string;
  education?: string;
  skills?: string[];
  applicationCount?: number;
  viewCount?: number;
}

export const EnhancedJobDetailScreen: React.FC<EnhancedJobDetailScreenProps> = ({ 
  route, 
  navigation 
}) => {
  const { jobId } = route.params;
  const { theme } = useTheme();
  const [showApplicationSheet, setShowApplicationSheet] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  const {
    data: jobData,
    isLoading,
    error,
    refetch,
  } = useGetJobByIdQuery(jobId);

  const job: Job | undefined = jobData?.data;

  const handleBack = useCallback(() => {
    navigation?.goBack();
  }, [navigation]);

  const handleSaveJob = useCallback(async () => {
    try {
      // TODO: Implement save job API call
      setIsSaved(!isSaved);
      toastManager.show({
        message: isSaved ? '已取消收藏' : '已收藏职位',
        type: 'success',
        duration: 2000,
      });
    } catch (error) {
      toastManager.show({
        message: '操作失败，请重试',
        type: 'error',
        duration: 3000,
      });
    }
  }, [isSaved]);

  const handleShareJob = useCallback(async () => {
    if (!job) return;
    
    try {
      await Share.share({
        message: `${job.title} - ${job.company.name}\n${job.description}`,
        title: job.title,
      });
    } catch (error) {
      toastManager.show({
        message: '分享失败',
        type: 'error',
        duration: 2000,
      });
    }
  }, [job]);

  const handleApplyJob = useCallback(async () => {
    setIsApplying(true);
    try {
      // TODO: Implement apply job API call
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      toastManager.show({
        message: '申请已提交',
        type: 'success',
        duration: 3000,
      });
      setShowApplicationSheet(false);
      navigation?.navigate('MyApplications');
    } catch (error) {
      toastManager.show({
        message: '申请失败，请重试',
        type: 'error',
        duration: 3000,
      });
    } finally {
      setIsApplying(false);
    }
  }, [navigation]);

  const formatSalary = useCallback((salary: Job['salary']) => {
    if (!salary) return '薪资面议';
    const { min, max, currency = '¥' } = salary;
    
    if (min && max) {
      return `${currency}${(min / 1000).toFixed(0)}K-${(max / 1000).toFixed(0)}K`;
    }
    if (min) {
      return `${currency}${(min / 1000).toFixed(0)}K起`;
    }
    if (max) {
      return `最高${currency}${(max / 1000).toFixed(0)}K`;
    }
    return '薪资面议';
  }, []);

  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, []);

  const renderHeader = () => (
    <LinearGradient
      colors={[theme.colors.primary, theme.colors.secondary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.header}
    >
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      <View style={styles.headerContent}>
        <View style={styles.headerTop}>
          <EnhancedButton
            title=""
            onPress={handleBack}
            variant="ghost"
            size="medium"
            icon="arrow-back"
            style={styles.backButton}
          />
          <View style={styles.headerActions}>
            <EnhancedButton
              title=""
              onPress={handleShareJob}
              variant="ghost"
              size="medium"
              icon="share-outline"
              style={styles.actionButton}
            />
            <EnhancedButton
              title=""
              onPress={handleSaveJob}
              variant="ghost"
              size="medium"
              icon={isSaved ? "heart" : "heart-outline"}
              style={styles.actionButton}
            />
          </View>
        </View>
        
        {job && (
          <View style={styles.jobHeaderInfo}>
            <Text style={styles.jobTitle}>{job.title}</Text>
            <Text style={styles.companyName}>{job.company.name}</Text>
            <View style={styles.jobMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="location" size={16} color="rgba(255, 255, 255, 0.8)" />
                <Text style={styles.metaText}>{job.location}</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="time" size={16} color="rgba(255, 255, 255, 0.8)" />
                <Text style={styles.metaText}>{formatDate(job.postedDate)}</Text>
              </View>
              {job.remote && (
                <View style={styles.remoteBadge}>
                  <Text style={styles.remoteText}>远程工作</Text>
                </View>
              )}
              {job.urgent && (
                <View style={styles.urgentBadge}>
                  <Text style={styles.urgentText}>急聘</Text>
                </View>
              )}
            </View>
          </View>
        )}
      </View>
    </LinearGradient>
  );

  const renderJobInfo = () => {
    if (!job) return null;

    return (
      <EnhancedCard style={styles.infoCard} variant="elevated">
        <View style={styles.salarySection}>
          <Text style={[styles.salary, { color: theme.colors.primary }]}>
            {formatSalary(job.salary)}
          </Text>
          <Text style={[styles.jobType, { color: theme.colors.gray }]}>
            {job.type} · {job.experience || '经验不限'}
          </Text>
        </View>
        
        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: theme.colors.text }]}>
              {job.applicationCount || 0}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.gray }]}>
              申请人数
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: theme.colors.text }]}>
              {job.viewCount || 0}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.gray }]}>
              浏览次数
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: theme.colors.text }]}>
              {job.deadline ? Math.ceil((new Date(job.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : '∞'}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.gray }]}>
              剩余天数
            </Text>
          </View>
        </View>
      </EnhancedCard>
    );
  };

  const renderSection = (title: string, content: string | string[], icon: string) => (
    <EnhancedCard style={styles.sectionCard} variant="outlined">
      <View style={styles.sectionHeader}>
        <Ionicons name={icon as any} size={20} color={theme.colors.primary} />
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          {title}
        </Text>
      </View>
      <View style={styles.sectionContent}>
        {Array.isArray(content) ? (
          content.map((item, index) => (
            <View key={index} style={styles.listItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={[styles.listText, { color: theme.colors.text }]}>
                {item}
              </Text>
            </View>
          ))
        ) : (
          <Text style={[styles.sectionText, { color: theme.colors.text }]}>
            {content}
          </Text>
        )}
      </View>
    </EnhancedCard>
  );

  const renderSkills = () => {
    if (!job?.skills || job.skills.length === 0) return null;

    return (
      <EnhancedCard style={styles.sectionCard} variant="outlined">
        <View style={styles.sectionHeader}>
          <Ionicons name="code-slash" size={20} color={theme.colors.primary} />
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            技能要求
          </Text>
        </View>
        <View style={styles.skillsContainer}>
          {job.skills.map((skill, index) => (
            <View key={index} style={[styles.skillTag, { backgroundColor: theme.colors.primary + '20' }]}>
              <Text style={[styles.skillText, { color: theme.colors.primary }]}>
                {skill}
              </Text>
            </View>
          ))}
        </View>
      </EnhancedCard>
    );
  };

  const renderCompanyInfo = () => {
    if (!job?.company) return null;

    return (
      <EnhancedCard style={styles.sectionCard} variant="outlined">
        <View style={styles.sectionHeader}>
          <Ionicons name="business" size={20} color={theme.colors.primary} />
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            公司信息
          </Text>
        </View>
        <View style={styles.companyContent}>
          <Text style={[styles.companyName, { color: theme.colors.text }]}>
            {job.company.name}
          </Text>
          {job.company.industry && (
            <Text style={[styles.companyDetail, { color: theme.colors.gray }]}>
              行业：{job.company.industry}
            </Text>
          )}
          {job.company.size && (
            <Text style={[styles.companyDetail, { color: theme.colors.gray }]}>
              规模：{job.company.size}
            </Text>
          )}
          {job.company.description && (
            <Text style={[styles.companyDescription, { color: theme.colors.text }]}>
              {job.company.description}
            </Text>
          )}
        </View>
      </EnhancedCard>
    );
  };

  const renderApplicationSheet = () => (
    <BottomSheet
      visible={showApplicationSheet}
      onClose={() => setShowApplicationSheet(false)}
      title="确认申请"
      snapPoints={[0.4]}
    >
      <View style={styles.applicationContent}>
        <Text style={[styles.applicationTitle, { color: theme.colors.text }]}>
          申请职位：{job?.title}
        </Text>
        <Text style={[styles.applicationSubtitle, { color: theme.colors.gray }]}>
          公司：{job?.company.name}
        </Text>
        
        <View style={styles.applicationNote}>
          <Ionicons name="information-circle" size={20} color={theme.colors.primary} />
          <Text style={[styles.noteText, { color: theme.colors.gray }]}>
            申请后，您的简历将发送给招聘方，请确保简历信息完整准确。
          </Text>
        </View>
        
        <View style={styles.applicationActions}>
          <EnhancedButton
            title="取消"
            onPress={() => setShowApplicationSheet(false)}
            variant="outline"
            size="medium"
            style={styles.cancelButton}
          />
          <EnhancedButton
            title={isApplying ? "申请中..." : "确认申请"}
            onPress={handleApplyJob}
            variant="primary"
            size="medium"
            loading={isApplying}
            disabled={isApplying}
            style={styles.confirmButton}
          />
        </View>
      </View>
    </BottomSheet>
  );

  const renderFloatingActions = () => (
    <View style={styles.floatingActions}>
      <EnhancedButton
        title="立即申请"
        onPress={() => setShowApplicationSheet(true)}
        variant="gradient"
        size="large"
        icon="paper-plane"
        style={styles.applyButton}
      />
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.gray }]}>
            加载中...
          </Text>
        </View>
      </View>
    );
  }

  if (error || !job) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {renderHeader()}
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={theme.colors.gray} />
          <Text style={[styles.errorTitle, { color: theme.colors.text }]}>
            加载失败
          </Text>
          <Text style={[styles.errorSubtitle, { color: theme.colors.gray }]}>
            无法加载职位详情，请重试
          </Text>
          <EnhancedButton
            title="重试"
            onPress={() => refetch()}
            variant="outline"
            size="medium"
            icon="refresh"
            style={styles.retryButton}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {renderHeader()}
      
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderJobInfo()}
        {renderSection('职位描述', job.description, 'document-text')}
        {job.responsibilities && renderSection('工作职责', job.responsibilities, 'checkmark-circle')}
        {job.requirements && renderSection('任职要求', job.requirements, 'list')}
        {renderSkills()}
        {job.benefits && renderSection('福利待遇', job.benefits, 'gift')}
        {renderCompanyInfo()}
        
        <View style={styles.bottomPadding} />
      </ScrollView>
      
      {renderFloatingActions()}
      {renderApplicationSheet()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
  },
  headerContent: {
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  jobHeaderInfo: {
    alignItems: 'center',
  },
  jobTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  companyName: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 12,
  },
  jobMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  remoteBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  remoteText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  urgentBadge: {
    backgroundColor: '#FF5722',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  urgentText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  infoCard: {
    marginBottom: 20,
  },
  salarySection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  salary: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  jobType: {
    fontSize: 14,
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E0E0E0',
  },
  sectionCard: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  sectionContent: {
    gap: 8,
  },
  sectionText: {
    fontSize: 14,
    lineHeight: 22,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bullet: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  listText: {
    fontSize: 14,
    lineHeight: 22,
    flex: 1,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  skillText: {
    fontSize: 12,
    fontWeight: '500',
  },
  companyContent: {
    gap: 8,
  },
  companyDetail: {
    fontSize: 14,
  },
  companyDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  floatingActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 40,
  },
  applyButton: {
    borderRadius: 12,
  },
  applicationContent: {
    gap: 16,
  },
  applicationTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  applicationSubtitle: {
    fontSize: 14,
  },
  applicationNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    borderRadius: 8,
  },
  noteText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  applicationActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
  },
  confirmButton: {
    flex: 2,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 24,
  },
  bottomPadding: {
    height: 100,
  },
});