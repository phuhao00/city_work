import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  RefreshControl,
  FlatList,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface UserActivity {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  action: string;
  target: string;
  targetType: 'job' | 'application' | 'profile' | 'message' | 'system';
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  location?: string;
  duration?: number;
  status: 'success' | 'failed' | 'pending';
  details?: any;
}

interface ActivityFilter {
  userId?: string;
  action?: string;
  targetType?: string;
  dateRange: {
    start: string;
    end: string;
  };
  status?: string;
}

interface ActivityStats {
  totalActivities: number;
  uniqueUsers: number;
  topActions: Array<{ action: string; count: number }>;
  topUsers: Array<{ userId: string; userName: string; count: number }>;
  activityByHour: Array<{ hour: number; count: number }>;
  statusDistribution: Array<{ status: string; count: number }>;
}

const UserActivityTracker: React.FC = () => {
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<UserActivity[]>([]);
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Filter states
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filter, setFilter] = useState<ActivityFilter>({
    dateRange: {
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0],
    },
  });
  
  // Search and pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  
  // Detail modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<UserActivity | null>(null);
  
  // Real-time tracking
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);

  useEffect(() => {
    loadMockData();
    if (realTimeEnabled) {
      const interval = setInterval(addRandomActivity, 10000);
      return () => clearInterval(interval);
    }
  }, [realTimeEnabled]);

  useEffect(() => {
    applyFilters();
  }, [activities, filter, searchQuery]);

  const loadMockData = () => {
    const mockActivities: UserActivity[] = [];
    const actions = [
      '登录系统', '查看职位', '申请职位', '更新简历', '发送消息',
      '搜索职位', '保存职位', '查看公司', '上传文件', '修改设置',
      '查看通知', '删除申请', '分享职位', '评价公司', '退出登录'
    ];
    const targetTypes: Array<'job' | 'application' | 'profile' | 'message' | 'system'> = 
      ['job', 'application', 'profile', 'message', 'system'];
    const statuses: Array<'success' | 'failed' | 'pending'> = ['success', 'failed', 'pending'];
    const users = [
      { id: '1', name: '张三' },
      { id: '2', name: '李四' },
      { id: '3', name: '王五' },
      { id: '4', name: '赵六' },
      { id: '5', name: '钱七' },
    ];

    for (let i = 0; i < 100; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const action = actions[Math.floor(Math.random() * actions.length)];
      const targetType = targetTypes[Math.floor(Math.random() * targetTypes.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const timestamp = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);

      mockActivities.push({
        id: `activity_${i + 1}`,
        userId: user.id,
        userName: user.name,
        action,
        target: `${targetType}_${Math.floor(Math.random() * 1000)}`,
        targetType,
        timestamp: timestamp.toISOString(),
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        location: ['北京', '上海', '广州', '深圳', '杭州'][Math.floor(Math.random() * 5)],
        duration: Math.floor(Math.random() * 300) + 10,
        status,
        details: {
          sessionId: `session_${Math.random().toString(36).substr(2, 9)}`,
          referrer: Math.random() > 0.5 ? 'https://google.com' : 'direct',
        },
      });
    }

    mockActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setActivities(mockActivities);
    calculateStats(mockActivities);
  };

  const addRandomActivity = () => {
    const actions = ['查看职位', '申请职位', '搜索职位', '查看消息', '更新状态'];
    const targetTypes: Array<'job' | 'application' | 'profile' | 'message' | 'system'> = 
      ['job', 'application', 'profile', 'message', 'system'];
    const users = [
      { id: '1', name: '张三' },
      { id: '2', name: '李四' },
      { id: '3', name: '王五' },
    ];

    const user = users[Math.floor(Math.random() * users.length)];
    const action = actions[Math.floor(Math.random() * actions.length)];
    const targetType = targetTypes[Math.floor(Math.random() * targetTypes.length)];

    const newActivity: UserActivity = {
      id: `activity_${Date.now()}`,
      userId: user.id,
      userName: user.name,
      action,
      target: `${targetType}_${Math.floor(Math.random() * 1000)}`,
      targetType,
      timestamp: new Date().toISOString(),
      ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      location: ['北京', '上海', '广州'][Math.floor(Math.random() * 3)],
      duration: Math.floor(Math.random() * 300) + 10,
      status: 'success',
      details: {
        sessionId: `session_${Math.random().toString(36).substr(2, 9)}`,
        referrer: 'real-time',
      },
    };

    setActivities(prev => [newActivity, ...prev.slice(0, 99)]);
  };

  const calculateStats = (activitiesData: UserActivity[]) => {
    const totalActivities = activitiesData.length;
    const uniqueUsers = new Set(activitiesData.map(a => a.userId)).size;

    // Top actions
    const actionCounts: { [key: string]: number } = {};
    activitiesData.forEach(activity => {
      actionCounts[activity.action] = (actionCounts[activity.action] || 0) + 1;
    });
    const topActions = Object.entries(actionCounts)
      .map(([action, count]) => ({ action, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Top users
    const userCounts: { [key: string]: { userName: string; count: number } } = {};
    activitiesData.forEach(activity => {
      if (!userCounts[activity.userId]) {
        userCounts[activity.userId] = { userName: activity.userName, count: 0 };
      }
      userCounts[activity.userId].count++;
    });
    const topUsers = Object.entries(userCounts)
      .map(([userId, data]) => ({ userId, userName: data.userName, count: data.count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Activity by hour
    const hourCounts: { [key: number]: number } = {};
    activitiesData.forEach(activity => {
      const hour = new Date(activity.timestamp).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    const activityByHour = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      count: hourCounts[hour] || 0,
    }));

    // Status distribution
    const statusCounts: { [key: string]: number } = {};
    activitiesData.forEach(activity => {
      statusCounts[activity.status] = (statusCounts[activity.status] || 0) + 1;
    });
    const statusDistribution = Object.entries(statusCounts)
      .map(([status, count]) => ({ status, count }));

    setStats({
      totalActivities,
      uniqueUsers,
      topActions,
      topUsers,
      activityByHour,
      statusDistribution,
    });
  };

  const applyFilters = () => {
    let filtered = activities;

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(activity =>
        activity.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.target.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply filters
    if (filter.userId) {
      filtered = filtered.filter(activity => activity.userId === filter.userId);
    }
    if (filter.action) {
      filtered = filtered.filter(activity => activity.action === filter.action);
    }
    if (filter.targetType) {
      filtered = filtered.filter(activity => activity.targetType === filter.targetType);
    }
    if (filter.status) {
      filtered = filtered.filter(activity => activity.status === filter.status);
    }

    // Apply date range
    const startDate = new Date(filter.dateRange.start);
    const endDate = new Date(filter.dateRange.end);
    endDate.setHours(23, 59, 59, 999);
    
    filtered = filtered.filter(activity => {
      const activityDate = new Date(activity.timestamp);
      return activityDate >= startDate && activityDate <= endDate;
    });

    setFilteredActivities(filtered);
    calculateStats(filtered);
    setCurrentPage(1);
  };

  const exportActivities = () => {
    Alert.alert(
      '导出数据',
      '选择导出格式',
      [
        { text: '取消', style: 'cancel' },
        { text: 'CSV', onPress: () => exportToCSV() },
        { text: 'JSON', onPress: () => exportToJSON() },
      ]
    );
  };

  const exportToCSV = () => {
    // Mock CSV export
    Alert.alert('成功', 'CSV文件已导出到下载目录');
  };

  const exportToJSON = () => {
    // Mock JSON export
    Alert.alert('成功', 'JSON文件已导出到下载目录');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return '#4CAF50';
      case 'failed': return '#F44336';
      case 'pending': return '#FF9800';
      default: return '#9E9E9E';
    }
  };

  const getTargetTypeIcon = (type: string) => {
    switch (type) {
      case 'job': return 'briefcase-outline';
      case 'application': return 'document-text-outline';
      case 'profile': return 'person-outline';
      case 'message': return 'chatbubble-outline';
      case 'system': return 'settings-outline';
      default: return 'help-circle-outline';
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}秒`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}分钟`;
    return `${Math.floor(seconds / 3600)}小时`;
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadMockData();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const paginatedActivities = filteredActivities.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);

  const renderActivityItem = ({ item }: { item: UserActivity }) => (
    <TouchableOpacity
      style={styles.activityCard}
      onPress={() => {
        setSelectedActivity(item);
        setShowDetailModal(true);
      }}
    >
      <View style={styles.activityHeader}>
        <View style={styles.activityInfo}>
          <Ionicons
            name={getTargetTypeIcon(item.targetType)}
            size={20}
            color="#2196F3"
          />
          <View style={styles.activityDetails}>
            <Text style={styles.activityAction}>{item.action}</Text>
            <Text style={styles.activityUser}>{item.userName}</Text>
          </View>
        </View>
        <View style={styles.activityMeta}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
          <Text style={styles.activityTime}>
            {new Date(item.timestamp).toLocaleString('zh-CN')}
          </Text>
        </View>
      </View>
      
      <View style={styles.activityFooter}>
        <Text style={styles.activityTarget}>目标: {item.target}</Text>
        <Text style={styles.activityLocation}>
          {item.location} • {item.duration ? formatDuration(item.duration) : '未知'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>用户活动追踪</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowFilterModal(true)}
          >
            <Ionicons name="filter" size={20} color="#2196F3" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={exportActivities}
          >
            <Ionicons name="download" size={20} color="#2196F3" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search and Real-time Toggle */}
      <View style={styles.controlsContainer}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="搜索用户、操作或目标..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <View style={styles.realTimeToggle}>
          <Text style={styles.toggleLabel}>实时</Text>
          <Switch
            value={realTimeEnabled}
            onValueChange={setRealTimeEnabled}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={realTimeEnabled ? '#f5dd4b' : '#f4f3f4'}
          />
        </View>
      </View>

      {/* Stats Overview */}
      {stats && (
        <View style={styles.statsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.totalActivities}</Text>
              <Text style={styles.statLabel}>总活动数</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.uniqueUsers}</Text>
              <Text style={styles.statLabel}>活跃用户</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {stats.statusDistribution.find(s => s.status === 'success')?.count || 0}
              </Text>
              <Text style={styles.statLabel}>成功操作</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {stats.topActions[0]?.count || 0}
              </Text>
              <Text style={styles.statLabel}>最高频操作</Text>
            </View>
          </ScrollView>
        </View>
      )}

      {/* Activities List */}
      <FlatList
        data={paginatedActivities}
        renderItem={renderActivityItem}
        keyExtractor={(item) => item.id}
        style={styles.activitiesList}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>暂无活动记录</Text>
          </View>
        }
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <View style={styles.paginationContainer}>
          <TouchableOpacity
            style={[styles.paginationButton, currentPage === 1 && styles.disabledButton]}
            onPress={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            <Ionicons name="chevron-back" size={20} color={currentPage === 1 ? '#ccc' : '#2196F3'} />
          </TouchableOpacity>
          
          <Text style={styles.paginationText}>
            {currentPage} / {totalPages}
          </Text>
          
          <TouchableOpacity
            style={[styles.paginationButton, currentPage === totalPages && styles.disabledButton]}
            onPress={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            <Ionicons name="chevron-forward" size={20} color={currentPage === totalPages ? '#ccc' : '#2196F3'} />
          </TouchableOpacity>
        </View>
      )}

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>筛选条件</Text>
            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>日期范围</Text>
              <View style={styles.dateRange}>
                <TextInput
                  style={styles.dateInput}
                  value={filter.dateRange.start}
                  onChangeText={(text) => setFilter(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, start: text }
                  }))}
                  placeholder="开始日期"
                />
                <Text style={styles.dateSeparator}>至</Text>
                <TextInput
                  style={styles.dateInput}
                  value={filter.dateRange.end}
                  onChangeText={(text) => setFilter(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, end: text }
                  }))}
                  placeholder="结束日期"
                />
              </View>
            </View>

            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>操作类型</Text>
              <TextInput
                style={styles.filterInput}
                value={filter.action || ''}
                onChangeText={(text) => setFilter(prev => ({ ...prev, action: text || undefined }))}
                placeholder="输入操作类型"
              />
            </View>

            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>目标类型</Text>
              <View style={styles.typeSelector}>
                {['job', 'application', 'profile', 'message', 'system'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeOption,
                      filter.targetType === type && styles.selectedType,
                    ]}
                    onPress={() => setFilter(prev => ({
                      ...prev,
                      targetType: prev.targetType === type ? undefined : type
                    }))}
                  >
                    <Text
                      style={[
                        styles.typeText,
                        filter.targetType === type && styles.selectedTypeText,
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>状态</Text>
              <View style={styles.typeSelector}>
                {['success', 'failed', 'pending'].map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.typeOption,
                      filter.status === status && styles.selectedType,
                    ]}
                    onPress={() => setFilter(prev => ({
                      ...prev,
                      status: prev.status === status ? undefined : status
                    }))}
                  >
                    <Text
                      style={[
                        styles.typeText,
                        filter.status === status && styles.selectedTypeText,
                      ]}
                    >
                      {status}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.resetButton]}
              onPress={() => setFilter({
                dateRange: {
                  start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                  end: new Date().toISOString().split('T')[0],
                },
              })}
            >
              <Text style={styles.resetButtonText}>重置</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.applyButton]}
              onPress={() => {
                applyFilters();
                setShowFilterModal(false);
              }}
            >
              <Text style={styles.applyButtonText}>应用</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Activity Detail Modal */}
      <Modal
        visible={showDetailModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>活动详情</Text>
            <TouchableOpacity onPress={() => setShowDetailModal(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          {selectedActivity && (
            <ScrollView style={styles.modalContent}>
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>用户信息</Text>
                <Text style={styles.detailValue}>{selectedActivity.userName} (ID: {selectedActivity.userId})</Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>操作</Text>
                <Text style={styles.detailValue}>{selectedActivity.action}</Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>目标</Text>
                <Text style={styles.detailValue}>{selectedActivity.target}</Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>时间</Text>
                <Text style={styles.detailValue}>
                  {new Date(selectedActivity.timestamp).toLocaleString('zh-CN')}
                </Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>IP地址</Text>
                <Text style={styles.detailValue}>{selectedActivity.ipAddress}</Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>位置</Text>
                <Text style={styles.detailValue}>{selectedActivity.location || '未知'}</Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>持续时间</Text>
                <Text style={styles.detailValue}>
                  {selectedActivity.duration ? formatDuration(selectedActivity.duration) : '未知'}
                </Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>状态</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedActivity.status) }]}>
                  <Text style={styles.statusText}>{selectedActivity.status}</Text>
                </View>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>用户代理</Text>
                <Text style={styles.detailValue}>{selectedActivity.userAgent}</Text>
              </View>

              {selectedActivity.details && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>详细信息</Text>
                  <Text style={styles.detailValue}>
                    {JSON.stringify(selectedActivity.details, null, 2)}
                  </Text>
                </View>
              )}
            </ScrollView>
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  headerButton: {
    padding: 8,
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    gap: 15,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  realTimeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toggleLabel: {
    fontSize: 14,
    color: '#666',
  },
  statsContainer: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  statCard: {
    alignItems: 'center',
    paddingHorizontal: 20,
    minWidth: 80,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  activitiesList: {
    flex: 1,
    padding: 15,
  },
  activityCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  activityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  activityDetails: {
    flex: 1,
  },
  activityAction: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  activityUser: {
    fontSize: 12,
    color: '#666',
  },
  activityMeta: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  activityTime: {
    fontSize: 10,
    color: '#999',
  },
  activityFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityTarget: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  activityLocation: {
    fontSize: 12,
    color: '#999',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 20,
  },
  paginationButton: {
    padding: 8,
  },
  disabledButton: {
    opacity: 0.3,
  },
  paginationText: {
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 10,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  filterGroup: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  filterInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#f9f9f9',
  },
  dateRange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dateInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#f9f9f9',
  },
  dateSeparator: {
    fontSize: 14,
    color: '#666',
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    backgroundColor: '#f9f9f9',
  },
  selectedType: {
    borderColor: '#2196F3',
    backgroundColor: '#e3f2fd',
  },
  typeText: {
    fontSize: 12,
    color: '#666',
  },
  selectedTypeText: {
    color: '#2196F3',
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: '#f5f5f5',
  },
  applyButton: {
    backgroundColor: '#2196F3',
  },
  resetButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  detailSection: {
    marginBottom: 15,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default UserActivityTracker;