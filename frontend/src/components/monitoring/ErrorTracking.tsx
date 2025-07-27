import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ErrorLog {
  id: string;
  type: 'javascript' | 'network' | 'api' | 'crash' | 'performance';
  message: string;
  stack?: string;
  url?: string;
  lineNumber?: number;
  columnNumber?: number;
  userAgent?: string;
  timestamp: Date;
  userId?: string;
  sessionId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'new' | 'investigating' | 'resolved' | 'ignored';
  occurrences: number;
  lastOccurrence: Date;
  tags: string[];
  context?: Record<string, any>;
}

interface ErrorFilter {
  type?: string;
  severity?: string;
  status?: string;
  dateRange?: string;
  searchTerm?: string;
}

interface ErrorStats {
  total: number;
  new: number;
  resolved: number;
  critical: number;
  byType: Record<string, number>;
  bySeverity: Record<string, number>;
}

const ErrorTracking: React.FC = () => {
  const [errors, setErrors] = useState<ErrorLog[]>([]);
  const [filteredErrors, setFilteredErrors] = useState<ErrorLog[]>([]);
  const [stats, setStats] = useState<ErrorStats | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedError, setSelectedError] = useState<ErrorLog | null>(null);
  const [showErrorDetail, setShowErrorDetail] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ErrorFilter>({});

  useEffect(() => {
    loadErrorData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [errors, filters]);

  const loadErrorData = async () => {
    // 模拟错误数据
    const mockErrors: ErrorLog[] = [
      {
        id: '1',
        type: 'javascript',
        message: 'Cannot read property "name" of undefined',
        stack: 'TypeError: Cannot read property "name" of undefined\n    at UserProfile.render (UserProfile.tsx:45:12)\n    at ReactCompositeComponent._renderValidatedComponentWithoutOwnerOrContext',
        url: 'https://citywork.app/profile',
        lineNumber: 45,
        columnNumber: 12,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)',
        timestamp: new Date(Date.now() - 300000),
        userId: 'user123',
        sessionId: 'session456',
        severity: 'high',
        status: 'new',
        occurrences: 15,
        lastOccurrence: new Date(),
        tags: ['frontend', 'profile', 'undefined'],
        context: {
          component: 'UserProfile',
          props: { userId: 'user123' },
          state: { loading: false },
        },
      },
      {
        id: '2',
        type: 'api',
        message: 'API request failed: 500 Internal Server Error',
        url: 'https://api.citywork.app/jobs',
        timestamp: new Date(Date.now() - 600000),
        sessionId: 'session789',
        severity: 'critical',
        status: 'investigating',
        occurrences: 8,
        lastOccurrence: new Date(Date.now() - 60000),
        tags: ['api', 'jobs', '500'],
        context: {
          endpoint: '/api/jobs',
          method: 'GET',
          statusCode: 500,
          responseTime: 5000,
        },
      },
      {
        id: '3',
        type: 'network',
        message: 'Network request timeout',
        url: 'https://api.citywork.app/companies',
        timestamp: new Date(Date.now() - 900000),
        sessionId: 'session101',
        severity: 'medium',
        status: 'resolved',
        occurrences: 3,
        lastOccurrence: new Date(Date.now() - 300000),
        tags: ['network', 'timeout', 'companies'],
        context: {
          timeout: 30000,
          retryCount: 3,
        },
      },
      {
        id: '4',
        type: 'crash',
        message: 'Application crashed due to memory overflow',
        timestamp: new Date(Date.now() - 1200000),
        userId: 'user456',
        sessionId: 'session202',
        severity: 'critical',
        status: 'new',
        occurrences: 1,
        lastOccurrence: new Date(Date.now() - 1200000),
        tags: ['crash', 'memory', 'overflow'],
        context: {
          memoryUsage: '512MB',
          deviceModel: 'iPhone 12',
          osVersion: 'iOS 14.7.1',
        },
      },
      {
        id: '5',
        type: 'performance',
        message: 'Slow component render detected',
        url: 'https://citywork.app/jobs',
        timestamp: new Date(Date.now() - 1800000),
        sessionId: 'session303',
        severity: 'low',
        status: 'ignored',
        occurrences: 25,
        lastOccurrence: new Date(Date.now() - 120000),
        tags: ['performance', 'render', 'slow'],
        context: {
          renderTime: 2500,
          component: 'JobList',
          itemCount: 100,
        },
      },
    ];

    const mockStats: ErrorStats = {
      total: mockErrors.length,
      new: mockErrors.filter(e => e.status === 'new').length,
      resolved: mockErrors.filter(e => e.status === 'resolved').length,
      critical: mockErrors.filter(e => e.severity === 'critical').length,
      byType: mockErrors.reduce((acc, error) => {
        acc[error.type] = (acc[error.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      bySeverity: mockErrors.reduce((acc, error) => {
        acc[error.severity] = (acc[error.severity] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    setErrors(mockErrors);
    setStats(mockStats);
  };

  const applyFilters = () => {
    let filtered = [...errors];

    if (filters.type) {
      filtered = filtered.filter(error => error.type === filters.type);
    }

    if (filters.severity) {
      filtered = filtered.filter(error => error.severity === filters.severity);
    }

    if (filters.status) {
      filtered = filtered.filter(error => error.status === filters.status);
    }

    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(error =>
        error.message.toLowerCase().includes(searchTerm) ||
        error.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    if (filters.dateRange) {
      const now = new Date();
      const ranges = {
        '1h': 60 * 60 * 1000,
        '24h': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000,
      };
      const range = ranges[filters.dateRange as keyof typeof ranges];
      if (range) {
        filtered = filtered.filter(error =>
          now.getTime() - error.timestamp.getTime() <= range
        );
      }
    }

    setFilteredErrors(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadErrorData();
    setRefreshing(false);
  };

  const updateErrorStatus = (errorId: string, status: ErrorLog['status']) => {
    setErrors(prev => prev.map(error =>
      error.id === errorId ? { ...error, status } : error
    ));
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'high': return '#FF5722';
      case 'critical': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return '#2196F3';
      case 'investigating': return '#FF9800';
      case 'resolved': return '#4CAF50';
      case 'ignored': return '#9E9E9E';
      default: return '#9E9E9E';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'javascript': return 'code-slash';
      case 'network': return 'wifi';
      case 'api': return 'server';
      case 'crash': return 'warning';
      case 'performance': return 'speedometer';
      default: return 'bug';
    }
  };

  const exportErrorReport = () => {
    Alert.alert(
      '导出报告',
      '错误报告已生成并保存到下载文件夹',
      [{ text: '确定' }]
    );
  };

  const renderErrorCard = (error: ErrorLog) => (
    <TouchableOpacity
      key={error.id}
      style={styles.errorCard}
      onPress={() => {
        setSelectedError(error);
        setShowErrorDetail(true);
      }}
    >
      <View style={styles.errorHeader}>
        <View style={styles.errorInfo}>
          <Ionicons
            name={getTypeIcon(error.type)}
            size={20}
            color={getSeverityColor(error.severity)}
          />
          <Text style={styles.errorType}>{error.type.toUpperCase()}</Text>
          <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(error.severity) }]}>
            <Text style={styles.severityText}>{error.severity}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(error.status) }]}>
            <Text style={styles.statusText}>{error.status}</Text>
          </View>
        </View>
        <Text style={styles.occurrences}>{error.occurrences}x</Text>
      </View>
      
      <Text style={styles.errorMessage} numberOfLines={2}>
        {error.message}
      </Text>
      
      <View style={styles.errorMeta}>
        <Text style={styles.errorTime}>
          {error.timestamp.toLocaleString()}
        </Text>
        {error.url && (
          <Text style={styles.errorUrl} numberOfLines={1}>
            {error.url}
          </Text>
        )}
      </View>
      
      <View style={styles.errorTags}>
        {error.tags.slice(0, 3).map((tag, index) => (
          <View key={index} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
        {error.tags.length > 3 && (
          <Text style={styles.moreTagsText}>+{error.tags.length - 3}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderErrorDetail = () => (
    <Modal
      visible={showErrorDetail}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>错误详情</Text>
          <TouchableOpacity
            onPress={() => setShowErrorDetail(false)}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>
        
        {selectedError && (
          <ScrollView style={styles.modalContent}>
            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>错误信息</Text>
              <Text style={styles.detailValue}>{selectedError.message}</Text>
            </View>
            
            {selectedError.stack && (
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>堆栈跟踪</Text>
                <ScrollView horizontal style={styles.stackContainer}>
                  <Text style={styles.stackText}>{selectedError.stack}</Text>
                </ScrollView>
              </View>
            )}
            
            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>基本信息</Text>
              <View style={styles.detailGrid}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailItemLabel}>类型</Text>
                  <Text style={styles.detailItemValue}>{selectedError.type}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailItemLabel}>严重程度</Text>
                  <Text style={styles.detailItemValue}>{selectedError.severity}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailItemLabel}>状态</Text>
                  <Text style={styles.detailItemValue}>{selectedError.status}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailItemLabel}>发生次数</Text>
                  <Text style={styles.detailItemValue}>{selectedError.occurrences}</Text>
                </View>
              </View>
            </View>
            
            {selectedError.context && (
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>上下文信息</Text>
                <Text style={styles.contextText}>
                  {JSON.stringify(selectedError.context, null, 2)}
                </Text>
              </View>
            )}
            
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#FF9800' }]}
                onPress={() => updateErrorStatus(selectedError.id, 'investigating')}
              >
                <Text style={styles.actionButtonText}>标记为调查中</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
                onPress={() => updateErrorStatus(selectedError.id, 'resolved')}
              >
                <Text style={styles.actionButtonText}>标记为已解决</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#9E9E9E' }]}
                onPress={() => updateErrorStatus(selectedError.id, 'ignored')}
              >
                <Text style={styles.actionButtonText}>忽略</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
      </View>
    </Modal>
  );

  const renderFilters = () => (
    <Modal
      visible={showFilters}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>筛选条件</Text>
          <TouchableOpacity
            onPress={() => setShowFilters(false)}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.modalContent}>
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>搜索</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="搜索错误信息或标签..."
              value={filters.searchTerm || ''}
              onChangeText={(text) => setFilters(prev => ({ ...prev, searchTerm: text }))}
            />
          </View>
          
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>错误类型</Text>
            <View style={styles.filterOptions}>
              {['javascript', 'network', 'api', 'crash', 'performance'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.filterOption,
                    filters.type === type && styles.activeFilterOption,
                  ]}
                  onPress={() => setFilters(prev => ({
                    ...prev,
                    type: prev.type === type ? undefined : type,
                  }))}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      filters.type === type && styles.activeFilterOptionText,
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>严重程度</Text>
            <View style={styles.filterOptions}>
              {['low', 'medium', 'high', 'critical'].map((severity) => (
                <TouchableOpacity
                  key={severity}
                  style={[
                    styles.filterOption,
                    filters.severity === severity && styles.activeFilterOption,
                  ]}
                  onPress={() => setFilters(prev => ({
                    ...prev,
                    severity: prev.severity === severity ? undefined : severity,
                  }))}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      filters.severity === severity && styles.activeFilterOptionText,
                    ]}
                  >
                    {severity}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>状态</Text>
            <View style={styles.filterOptions}>
              {['new', 'investigating', 'resolved', 'ignored'].map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.filterOption,
                    filters.status === status && styles.activeFilterOption,
                  ]}
                  onPress={() => setFilters(prev => ({
                    ...prev,
                    status: prev.status === status ? undefined : status,
                  }))}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      filters.status === status && styles.activeFilterOptionText,
                    ]}
                  >
                    {status}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>时间范围</Text>
            <View style={styles.filterOptions}>
              {['1h', '24h', '7d', '30d'].map((range) => (
                <TouchableOpacity
                  key={range}
                  style={[
                    styles.filterOption,
                    filters.dateRange === range && styles.activeFilterOption,
                  ]}
                  onPress={() => setFilters(prev => ({
                    ...prev,
                    dateRange: prev.dateRange === range ? undefined : range,
                  }))}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      filters.dateRange === range && styles.activeFilterOptionText,
                    ]}
                  >
                    {range}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <TouchableOpacity
            style={styles.clearFiltersButton}
            onPress={() => setFilters({})}
          >
            <Text style={styles.clearFiltersText}>清除所有筛选</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>错误追踪</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowFilters(true)}
          >
            <Ionicons name="filter" size={20} color="#2196F3" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={exportErrorReport}
          >
            <Ionicons name="download" size={20} color="#2196F3" />
          </TouchableOpacity>
        </View>
      </View>

      {stats && (
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>总错误数</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#2196F3' }]}>{stats.new}</Text>
            <Text style={styles.statLabel}>新错误</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#F44336' }]}>{stats.critical}</Text>
            <Text style={styles.statLabel}>严重错误</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#4CAF50' }]}>{stats.resolved}</Text>
            <Text style={styles.statLabel}>已解决</Text>
          </View>
        </View>
      )}

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredErrors.map(renderErrorCard)}
      </ScrollView>

      {renderErrorDetail()}
      {renderFilters()}
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
  },
  headerButton: {
    padding: 8,
    marginLeft: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  errorCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  errorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  errorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  errorType: {
    marginLeft: 8,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
  },
  severityBadge: {
    marginLeft: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  severityText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  statusBadge: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  occurrences: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
  },
  errorMessage: {
    fontSize: 14,
    color: '#333',
    marginBottom: 10,
    lineHeight: 20,
  },
  errorMeta: {
    marginBottom: 10,
  },
  errorTime: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  errorUrl: {
    fontSize: 12,
    color: '#2196F3',
  },
  errorTags: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 5,
  },
  tagText: {
    fontSize: 10,
    color: '#666',
  },
  moreTagsText: {
    fontSize: 10,
    color: '#999',
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
  closeButton: {
    padding: 5,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  detailSection: {
    marginBottom: 20,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  detailValue: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  stackContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
    padding: 10,
    maxHeight: 200,
  },
  stackText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#333',
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  detailItem: {
    width: '50%',
    marginBottom: 10,
  },
  detailItemLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  detailItemValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  contextText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#666',
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 5,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  actionButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    minWidth: 100,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  filterSection: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
    marginBottom: 10,
  },
  activeFilterOption: {
    backgroundColor: '#2196F3',
  },
  filterOptionText: {
    fontSize: 12,
    color: '#666',
  },
  activeFilterOptionText: {
    color: '#fff',
  },
  clearFiltersButton: {
    backgroundColor: '#FF5722',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  clearFiltersText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default ErrorTracking;