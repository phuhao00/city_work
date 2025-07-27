import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { useGetJobsQuery } from '../../services/jobsApi';
import {
  EnhancedButton,
  EnhancedCard,
  EnhancedInput,
  SkeletonJobCard,
  BottomSheet,
  toastManager,
} from '../ui';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface EnhancedJobListScreenProps {
  navigation?: any;
}

interface Job {
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
  description: string;
  requirements?: string[];
  benefits?: string[];
  postedDate: string;
  urgent?: boolean;
  remote?: boolean;
  experience?: string;
}

interface FilterOptions {
  location: string;
  salaryRange: [number, number];
  jobType: string;
  experience: string;
  remote: boolean;
}

export const EnhancedJobListScreen: React.FC<EnhancedJobListScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [sortBy, setSortBy] = useState<'date' | 'salary' | 'relevance'>('date');
  const [filters, setFilters] = useState<FilterOptions>({
    location: '',
    salaryRange: [0, 100000],
    jobType: '',
    experience: '',
    remote: false,
  });

  const {
    data: jobsData,
    isLoading,
    error,
    refetch,
  } = useGetJobsQuery({
    page: 1,
    limit: 20,
    search: searchQuery,
    ...filters,
  });

  const jobs = jobsData?.data || [];

  const filteredAndSortedJobs = useMemo(() => {
    let filtered = jobs.filter((job: Job) => {
      if (searchQuery && !job.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      return true;
    });

    // Sort jobs
    filtered.sort((a: Job, b: Job) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime();
        case 'salary':
          const aSalary = a.salary?.max || a.salary?.min || 0;
          const bSalary = b.salary?.max || b.salary?.min || 0;
          return bSalary - aSalary;
        case 'relevance':
          // Simple relevance based on search query match
          if (!searchQuery) return 0;
          const aRelevance = a.title.toLowerCase().includes(searchQuery.toLowerCase()) ? 1 : 0;
          const bRelevance = b.title.toLowerCase().includes(searchQuery.toLowerCase()) ? 1 : 0;
          return bRelevance - aRelevance;
        default:
          return 0;
      }
    });

    return filtered;
  }, [jobs, searchQuery, sortBy]);

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

  const handleJobPress = useCallback((job: Job) => {
    navigation?.navigate('JobDetail', { jobId: job._id });
  }, [navigation]);

  const handleSaveJob = useCallback((jobId: string) => {
    // TODO: Implement save job functionality
    toastManager.show({
      message: '职位已保存',
      type: 'success',
      duration: 2000,
    });
  }, []);

  const handleApplyJob = useCallback((jobId: string) => {
    navigation?.navigate('JobApplication', { jobId });
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
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '今天';
    if (diffDays === 2) return '昨天';
    if (diffDays <= 7) return `${diffDays}天前`;
    return date.toLocaleDateString('zh-CN');
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
        <Text style={styles.headerTitle}>职位搜索</Text>
        <Text style={styles.headerSubtitle}>
          找到 {filteredAndSortedJobs.length} 个职位
        </Text>
      </View>
    </LinearGradient>
  );

  const renderSearchAndFilters = () => (
    <View style={styles.searchContainer}>
      <View style={styles.searchRow}>
        <EnhancedInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="搜索职位、公司或技能"
          icon="search"
          variant="filled"
          style={styles.searchInput}
          containerStyle={styles.searchInputContainer}
        />
        <EnhancedButton
          title=""
          onPress={() => setShowFilters(true)}
          variant="outline"
          size="medium"
          icon="options"
          style={styles.filterButton}
        />
      </View>
      
      <View style={styles.controlsRow}>
        <View style={styles.sortContainer}>
          <Text style={[styles.sortLabel, { color: theme.colors.gray }]}>排序:</Text>
          <EnhancedButton
            title={sortBy === 'date' ? '最新' : sortBy === 'salary' ? '薪资' : '相关性'}
            onPress={() => {
              const nextSort = sortBy === 'date' ? 'salary' : sortBy === 'salary' ? 'relevance' : 'date';
              setSortBy(nextSort);
            }}
            variant="ghost"
            size="small"
            icon="swap-vertical"
            style={styles.sortButton}
          />
        </View>
        
        <View style={styles.viewModeContainer}>
          <EnhancedButton
            title=""
            onPress={() => setViewMode('list')}
            variant={viewMode === 'list' ? 'primary' : 'ghost'}
            size="small"
            icon="list"
            style={styles.viewModeButton}
          />
          <EnhancedButton
            title=""
            onPress={() => setViewMode('grid')}
            variant={viewMode === 'grid' ? 'primary' : 'ghost'}
            size="small"
            icon="grid"
            style={styles.viewModeButton}
          />
        </View>
      </View>
    </View>
  );

  const renderJobCard = useCallback(({ item: job }: { item: Job }) => (
    <EnhancedCard
      onPress={() => handleJobPress(job)}
      style={[
        styles.jobCard,
        viewMode === 'grid' && styles.jobCardGrid,
      ]}
      variant="elevated"
      animated
    >
      <View style={styles.jobCardHeader}>
        <View style={styles.jobInfo}>
          <View style={styles.jobTitleRow}>
            <Text style={[styles.jobTitle, { color: theme.colors.text }]} numberOfLines={2}>
              {job.title}
            </Text>
            {job.urgent && (
              <View style={[styles.urgentBadge, { backgroundColor: '#FF5722' }]}>
                <Text style={styles.urgentText}>急聘</Text>
              </View>
            )}
          </View>
          
          <Text style={[styles.companyName, { color: theme.colors.gray }]}>
            {job.company?.name || '未知公司'}
          </Text>
          
          <View style={styles.jobMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="location" size={14} color={theme.colors.gray} />
              <Text style={[styles.metaText, { color: theme.colors.gray }]}>
                {job.location}
              </Text>
            </View>
            
            <View style={styles.metaItem}>
              <Ionicons name="time" size={14} color={theme.colors.gray} />
              <Text style={[styles.metaText, { color: theme.colors.gray }]}>
                {formatDate(job.postedDate)}
              </Text>
            </View>
            
            {job.remote && (
              <View style={[styles.remoteBadge, { backgroundColor: theme.colors.primary }]}>
                <Text style={styles.remoteText}>远程</Text>
              </View>
            )}
          </View>
        </View>
      </View>
      
      <View style={styles.jobCardBody}>
        <Text style={[styles.jobDescription, { color: theme.colors.gray }]} numberOfLines={2}>
          {job.description}
        </Text>
      </View>
      
      <View style={styles.jobCardFooter}>
        <View style={styles.salaryContainer}>
          <Text style={[styles.salary, { color: theme.colors.primary }]}>
            {formatSalary(job.salary)}
          </Text>
          <Text style={[styles.jobType, { color: theme.colors.gray }]}>
            {job.type}
          </Text>
        </View>
        
        <View style={styles.actionButtons}>
          <EnhancedButton
            title=""
            onPress={() => handleSaveJob(job._id)}
            variant="ghost"
            size="small"
            icon="heart-outline"
            style={styles.actionButton}
          />
          <EnhancedButton
            title="申请"
            onPress={() => handleApplyJob(job._id)}
            variant="primary"
            size="small"
            style={styles.applyButton}
          />
        </View>
      </View>
    </EnhancedCard>
  ), [viewMode, theme, handleJobPress, handleSaveJob, handleApplyJob, formatSalary, formatDate]);

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="briefcase-outline" size={64} color={theme.colors.gray} />
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
        暂无职位
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.colors.gray }]}>
        {searchQuery ? '尝试调整搜索条件' : '暂时没有符合条件的职位'}
      </Text>
      <EnhancedButton
        title="刷新"
        onPress={onRefresh}
        variant="outline"
        size="medium"
        icon="refresh"
        style={styles.refreshButton}
      />
    </View>
  );

  const renderFilterBottomSheet = () => (
    <BottomSheet
      visible={showFilters}
      onClose={() => setShowFilters(false)}
      title="筛选条件"
      snapPoints={[0.7]}
    >
      <View style={styles.filterContent}>
        <EnhancedInput
          label="工作地点"
          value={filters.location}
          onChangeText={(value) => setFilters(prev => ({ ...prev, location: value }))}
          placeholder="输入城市名称"
          icon="location"
          variant="outlined"
        />
        
        <View style={styles.filterSection}>
          <Text style={[styles.filterLabel, { color: theme.colors.text }]}>
            职位类型
          </Text>
          <View style={styles.filterOptions}>
            {['全职', '兼职', '实习', '合同工'].map((type) => (
              <EnhancedButton
                key={type}
                title={type}
                onPress={() => setFilters(prev => ({ 
                  ...prev, 
                  jobType: prev.jobType === type ? '' : type 
                }))}
                variant={filters.jobType === type ? 'primary' : 'outline'}
                size="small"
                style={styles.filterOption}
              />
            ))}
          </View>
        </View>
        
        <View style={styles.filterActions}>
          <EnhancedButton
            title="重置"
            onPress={() => setFilters({
              location: '',
              salaryRange: [0, 100000],
              jobType: '',
              experience: '',
              remote: false,
            })}
            variant="outline"
            size="medium"
            style={styles.resetButton}
          />
          <EnhancedButton
            title="应用筛选"
            onPress={() => setShowFilters(false)}
            variant="primary"
            size="medium"
            style={styles.applyFilterButton}
          />
        </View>
      </View>
    </BottomSheet>
  );

  if (isLoading && !refreshing) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {renderHeader()}
        {renderSearchAndFilters()}
        <View style={styles.loadingContainer}>
          {Array.from({ length: 5 }).map((_, index) => (
            <SkeletonJobCard key={index} style={styles.skeletonCard} />
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {renderHeader()}
      {renderSearchAndFilters()}
      
      <FlatList
        data={filteredAndSortedJobs}
        renderItem={renderJobCard}
        keyExtractor={(item) => item._id}
        contentContainerStyle={[
          styles.listContainer,
          viewMode === 'grid' && styles.gridContainer,
        ]}
        numColumns={viewMode === 'grid' ? 2 : 1}
        key={viewMode} // Force re-render when view mode changes
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
      
      {renderFilterBottomSheet()}
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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  searchContainer: {
    padding: 20,
    paddingBottom: 10,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  searchInputContainer: {
    flex: 1,
    marginBottom: 0,
  },
  searchInput: {
    flex: 1,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sortLabel: {
    fontSize: 14,
  },
  sortButton: {
    paddingHorizontal: 12,
  },
  viewModeContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  viewModeButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
  },
  listContainer: {
    padding: 20,
    paddingTop: 10,
  },
  gridContainer: {
    paddingHorizontal: 16,
  },
  jobCard: {
    marginBottom: 16,
  },
  jobCardGrid: {
    width: (SCREEN_WIDTH - 48) / 2,
    marginHorizontal: 4,
  },
  jobCardHeader: {
    marginBottom: 12,
  },
  jobInfo: {
    flex: 1,
  },
  jobTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  urgentBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  urgentText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  companyName: {
    fontSize: 14,
    marginBottom: 8,
  },
  jobMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
  },
  remoteBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  remoteText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  jobCardBody: {
    marginBottom: 12,
  },
  jobDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  jobCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  salaryContainer: {
    flex: 1,
  },
  salary: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  jobType: {
    fontSize: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
  },
  applyButton: {
    paddingHorizontal: 16,
    borderRadius: 8,
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
  refreshButton: {
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
  filterActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  resetButton: {
    flex: 1,
  },
  applyFilterButton: {
    flex: 2,
  },
});