import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  StatusBar,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { useGetMyApplicationsQuery, useWithdrawApplicationMutation } from '../../services/applicationsApi';
import {
  EnhancedButton,
  EnhancedCard,
  EnhancedInput,
  BottomSheet,
  toastManager,
  SkeletonCard,
} from '../ui';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface EnhancedMyApplicationsScreenProps {
  navigation?: any;
}

interface Application {
  _id: string;
  job: {
    _id: string;
    title: string;
    company: {
      name: string;
      logo?: string;
    };
    location: string;
    salary?: {
      min?: number;
      max?: number;
      currency?: string;
    };
    type: string;
  };
  status: 'pending' | 'reviewing' | 'interview' | 'offer' | 'rejected' | 'withdrawn';
  appliedDate: string;
  lastUpdated: string;
  coverLetter?: string;
  resume?: string;
  notes?: string;
  interviewDate?: string;
  feedback?: string;
}

const statusConfig = {
  pending: { label: '待处理', color: '#FFA726', icon: 'time' },
  reviewing: { label: '审核中', color: '#42A5F5', icon: 'eye' },
  interview: { label: '面试邀请', color: '#66BB6A', icon: 'people' },
  offer: { label: '收到Offer', color: '#4CAF50', icon: 'checkmark-circle' },
  rejected: { label: '已拒绝', color: '#EF5350', icon: 'close-circle' },
  withdrawn: { label: '已撤回', color: '#9E9E9E', icon: 'remove-circle' },
};

export const EnhancedMyApplicationsScreen: React.FC<EnhancedMyApplicationsScreenProps> = ({ 
  navigation 
}) => {
  const { theme } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [showApplicationDetail, setShowApplicationDetail] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'status' | 'company'>('date');

  const {
    data: applicationsData,
    isLoading,
    error,
    refetch,
  } = useGetMyApplicationsQuery({
    status: filterStatus === 'all' ? undefined : filterStatus,
    search: searchQuery,
    sortBy,
  });

  const [withdrawApplication, { isLoading: isWithdrawing }] = useWithdrawApplicationMutation();

  const applications = applicationsData?.data || [];

  const filteredApplications = useMemo(() => {
    let filtered = applications;

    if (searchQuery) {
      filtered = filtered.filter((app: Application) =>
        app.job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.job.company.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter((app: Application) => app.status === filterStatus);
    }

    // Sort applications
    filtered.sort((a: Application, b: Application) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime();
        case 'status':
          return a.status.localeCompare(b.status);
        case 'company':
          return a.job.company.name.localeCompare(b.job.company.name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [applications, searchQuery, filterStatus, sortBy]);

  const statusCounts = useMemo(() => {
    const counts = applications.reduce((acc: any, app: Application) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {});
    counts.all = applications.length;
    return counts;
  }, [applications]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
      toastManager.show({
        message: '刷新成功',
        type: 'success',
        duration: 2000,
      });
    } catch (error) {
      toastManager.show({
        message: '刷新失败，请重试',
        type: 'error',
        duration: 3000,
      });
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const handleApplicationPress = useCallback((application: Application) => {
    setSelectedApplication(application);
    setShowApplicationDetail(true);
  }, []);

  const handleJobPress = useCallback((jobId: string) => {
    navigation?.navigate('JobDetail', { jobId });
  }, [navigation]);

  const handleWithdrawApplication = useCallback(async (applicationId: string) => {
    try {
      await withdrawApplication(applicationId).unwrap();
      toastManager.show({
        message: '申请已撤回',
        type: 'success',
        duration: 2000,
      });
      setShowApplicationDetail(false);
      refetch();
    } catch (error) {
      toastManager.show({
        message: '撤回失败，请重试',
        type: 'error',
        duration: 3000,
      });
    }
  }, [withdrawApplication, refetch]);

  const formatSalary = useCallback((salary: Application['job']['salary']) => {
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
      month: 'short',
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
          <Text style={styles.headerTitle}>我的申请</Text>
          <EnhancedButton
            title=""
            onPress={() => setShowFilterSheet(true)}
            variant="ghost"
            size="medium"
            icon="filter"
            style={styles.filterButton}
          />
        </View>
        
        <Text style={styles.headerSubtitle}>
          共 {applications.length} 个申请
        </Text>
      </View>
    </LinearGradient>
  );

  const renderSearchAndStats = () => (
    <View style={styles.searchContainer}>
      <EnhancedInput
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="搜索职位或公司"
        icon="search"
        variant="filled"
        style={styles.searchInput}
      />
      
      <View style={styles.statsContainer}>
        <FlatList
          data={[
            { key: 'all', label: '全部', count: statusCounts.all || 0 },
            { key: 'pending', label: '待处理', count: statusCounts.pending || 0 },
            { key: 'reviewing', label: '审核中', count: statusCounts.reviewing || 0 },
            { key: 'interview', label: '面试', count: statusCounts.interview || 0 },
            { key: 'offer', label: 'Offer', count: statusCounts.offer || 0 },
          ]}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <EnhancedButton
              title={`${item.label} (${item.count})`}
              onPress={() => setFilterStatus(item.key)}
              variant={filterStatus === item.key ? 'primary' : 'outline'}
              size="small"
              style={styles.statButton}
            />
          )}
          contentContainerStyle={styles.statsList}
        />
      </View>
    </View>
  );

  const renderApplicationCard = useCallback(({ item: application }: { item: Application }) => {
    const status = statusConfig[application.status];
    
    return (
      <EnhancedCard
        onPress={() => handleApplicationPress(application)}
        style={styles.applicationCard}
        variant="elevated"
        animated
      >
        <View style={styles.cardHeader}>
          <View style={styles.jobInfo}>
            <Text style={[styles.jobTitle, { color: theme.colors.text }]} numberOfLines={2}>
              {application.job.title}
            </Text>
            <Text style={[styles.companyName, { color: theme.colors.gray }]}>
              {application.job.company.name}
            </Text>
            <Text style={[styles.jobLocation, { color: theme.colors.gray }]}>
              {application.job.location} · {application.job.type}
            </Text>
          </View>
          
          <View style={styles.statusContainer}>
            <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
              <Ionicons name={status.icon as any} size={12} color="#FFFFFF" />
              <Text style={styles.statusText}>{status.label}</Text>
            </View>
            <Text style={[styles.appliedDate, { color: theme.colors.gray }]}>
              {formatDate(application.appliedDate)}
            </Text>
          </View>
        </View>
        
        <View style={styles.cardBody}>
          <Text style={[styles.salary, { color: theme.colors.primary }]}>
            {formatSalary(application.job.salary)}
          </Text>
          
          {application.interviewDate && (
            <View style={styles.interviewInfo}>
              <Ionicons name="calendar" size={14} color={theme.colors.primary} />
              <Text style={[styles.interviewText, { color: theme.colors.primary }]}>
                面试时间：{formatDate(application.interviewDate)}
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.cardFooter}>
          <EnhancedButton
            title="查看职位"
            onPress={() => handleJobPress(application.job._id)}
            variant="ghost"
            size="small"
            icon="eye"
            style={styles.viewJobButton}
          />
          
          {application.status === 'pending' && (
            <EnhancedButton
              title="撤回申请"
              onPress={() => handleWithdrawApplication(application._id)}
              variant="outline"
              size="small"
              icon="close"
              style={styles.withdrawButton}
              loading={isWithdrawing}
            />
          )}
        </View>
      </EnhancedCard>
    );
  }, [theme, handleApplicationPress, handleJobPress, handleWithdrawApplication, formatSalary, formatDate, isWithdrawing]);

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-text-outline" size={64} color={theme.colors.gray} />
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
        暂无申请记录
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.colors.gray }]}>
        {searchQuery || filterStatus !== 'all' 
          ? '没有符合条件的申请记录' 
          : '开始申请您感兴趣的职位吧'}
      </Text>
      {!searchQuery && filterStatus === 'all' && (
        <EnhancedButton
          title="浏览职位"
          onPress={() => navigation?.navigate('JobList')}
          variant="primary"
          size="medium"
          icon="briefcase"
          style={styles.browseJobsButton}
        />
      )}
    </View>
  );

  const renderFilterSheet = () => (
    <BottomSheet
      visible={showFilterSheet}
      onClose={() => setShowFilterSheet(false)}
      title="筛选和排序"
      snapPoints={[0.5]}
    >
      <View style={styles.filterContent}>
        <View style={styles.filterSection}>
          <Text style={[styles.filterLabel, { color: theme.colors.text }]}>
            申请状态
          </Text>
          <View style={styles.filterOptions}>
            {[
              { key: 'all', label: '全部' },
              ...Object.entries(statusConfig).map(([key, config]) => ({
                key,
                label: config.label,
              }))
            ].map((option) => (
              <EnhancedButton
                key={option.key}
                title={option.label}
                onPress={() => setFilterStatus(option.key)}
                variant={filterStatus === option.key ? 'primary' : 'outline'}
                size="small"
                style={styles.filterOption}
              />
            ))}
          </View>
        </View>
        
        <View style={styles.filterSection}>
          <Text style={[styles.filterLabel, { color: theme.colors.text }]}>
            排序方式
          </Text>
          <View style={styles.filterOptions}>
            {[
              { key: 'date', label: '申请时间' },
              { key: 'status', label: '申请状态' },
              { key: 'company', label: '公司名称' },
            ].map((option) => (
              <EnhancedButton
                key={option.key}
                title={option.label}
                onPress={() => setSortBy(option.key as any)}
                variant={sortBy === option.key ? 'primary' : 'outline'}
                size="small"
                style={styles.filterOption}
              />
            ))}
          </View>
        </View>
        
        <EnhancedButton
          title="应用筛选"
          onPress={() => setShowFilterSheet(false)}
          variant="primary"
          size="medium"
          style={styles.applyFilterButton}
        />
      </View>
    </BottomSheet>
  );

  const renderApplicationDetailSheet = () => (
    <BottomSheet
      visible={showApplicationDetail}
      onClose={() => setShowApplicationDetail(false)}
      title="申请详情"
      snapPoints={[0.8]}
    >
      {selectedApplication && (
        <View style={styles.detailContent}>
          <View style={styles.detailHeader}>
            <Text style={[styles.detailJobTitle, { color: theme.colors.text }]}>
              {selectedApplication.job.title}
            </Text>
            <Text style={[styles.detailCompany, { color: theme.colors.gray }]}>
              {selectedApplication.job.company.name}
            </Text>
            
            <View style={styles.detailStatus}>
              <View style={[
                styles.statusBadge, 
                { backgroundColor: statusConfig[selectedApplication.status].color }
              ]}>
                <Ionicons 
                  name={statusConfig[selectedApplication.status].icon as any} 
                  size={14} 
                  color="#FFFFFF" 
                />
                <Text style={styles.statusText}>
                  {statusConfig[selectedApplication.status].label}
                </Text>
              </View>
            </View>
          </View>
          
          <View style={styles.detailInfo}>
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, { color: theme.colors.gray }]}>
                申请时间
              </Text>
              <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                {new Date(selectedApplication.appliedDate).toLocaleDateString('zh-CN')}
              </Text>
            </View>
            
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, { color: theme.colors.gray }]}>
                最后更新
              </Text>
              <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                {new Date(selectedApplication.lastUpdated).toLocaleDateString('zh-CN')}
              </Text>
            </View>
            
            {selectedApplication.interviewDate && (
              <View style={styles.detailItem}>
                <Text style={[styles.detailLabel, { color: theme.colors.gray }]}>
                  面试时间
                </Text>
                <Text style={[styles.detailValue, { color: theme.colors.primary }]}>
                  {new Date(selectedApplication.interviewDate).toLocaleDateString('zh-CN')}
                </Text>
              </View>
            )}
            
            {selectedApplication.feedback && (
              <View style={styles.detailItem}>
                <Text style={[styles.detailLabel, { color: theme.colors.gray }]}>
                  反馈信息
                </Text>
                <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                  {selectedApplication.feedback}
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.detailActions}>
            <EnhancedButton
              title="查看职位"
              onPress={() => {
                setShowApplicationDetail(false);
                handleJobPress(selectedApplication.job._id);
              }}
              variant="outline"
              size="medium"
              icon="eye"
              style={styles.detailActionButton}
            />
            
            {selectedApplication.status === 'pending' && (
              <EnhancedButton
                title="撤回申请"
                onPress={() => handleWithdrawApplication(selectedApplication._id)}
                variant="outline"
                size="medium"
                icon="close"
                style={[styles.detailActionButton, { borderColor: '#FF5722' }]}
                textStyle={{ color: '#FF5722' }}
                loading={isWithdrawing}
              />
            )}
          </View>
        </View>
      )}
    </BottomSheet>
  );

  if (isLoading && !refreshing) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {renderHeader()}
        {renderSearchAndStats()}
        <View style={styles.loadingContainer}>
          {Array.from({ length: 5 }).map((_, index) => (
            <SkeletonCard key={index} style={styles.skeletonCard} />
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {renderHeader()}
      {renderSearchAndStats()}
      
      <FlatList
        data={filteredApplications}
        renderItem={renderApplicationCard}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        ListEmptyComponent={renderEmptyState}
      />
      
      {renderFilterSheet()}
      {renderApplicationDetailSheet()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  searchContainer: {
    padding: 20,
    paddingBottom: 10,
  },
  searchInput: {
    marginBottom: 16,
  },
  statsContainer: {
    marginBottom: 10,
  },
  statsList: {
    gap: 8,
  },
  statButton: {
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  listContainer: {
    padding: 20,
    paddingTop: 10,
  },
  applicationCard: {
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  jobInfo: {
    flex: 1,
    marginRight: 12,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  companyName: {
    fontSize: 14,
    marginBottom: 2,
  },
  jobLocation: {
    fontSize: 12,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  appliedDate: {
    fontSize: 10,
  },
  cardBody: {
    marginBottom: 12,
  },
  salary: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  interviewInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  interviewText: {
    fontSize: 12,
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewJobButton: {
    paddingHorizontal: 16,
  },
  withdrawButton: {
    paddingHorizontal: 16,
    borderColor: '#FF5722',
  },
  loadingContainer: {
    padding: 20,
  },
  skeletonCard: {
    marginBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  browseJobsButton: {
    paddingHorizontal: 24,
  },
  filterContent: {
    gap: 20,
  },
  filterSection: {
    gap: 12,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterOption: {
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  applyFilterButton: {
    marginTop: 10,
  },
  detailContent: {
    gap: 20,
  },
  detailHeader: {
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  detailJobTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  detailCompany: {
    fontSize: 16,
    marginBottom: 12,
  },
  detailStatus: {
    alignItems: 'center',
  },
  detailInfo: {
    gap: 16,
  },
  detailItem: {
    gap: 4,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
  },
  detailActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  detailActionButton: {
    flex: 1,
  },
});