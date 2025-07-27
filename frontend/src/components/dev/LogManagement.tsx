import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Switch,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LogManagementProps {
  navigation?: any;
}

interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  category: string;
  message: string;
  source: string;
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
  stackTrace?: string;
  tags: string[];
}

interface LogFilter {
  levels: string[];
  categories: string[];
  sources: string[];
  dateRange: {
    start?: Date;
    end?: Date;
  };
  searchText: string;
  tags: string[];
}

interface LogExportOptions {
  format: 'json' | 'csv' | 'txt';
  includeMetadata: boolean;
  includeStackTrace: boolean;
  maxEntries: number;
}

const LogManagement: React.FC<LogManagementProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<LogFilter>({
    levels: [],
    categories: [],
    sources: [],
    dateRange: {},
    searchText: '',
    tags: [],
  });
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportOptions, setExportOptions] = useState<LogExportOptions>({
    format: 'json',
    includeMetadata: true,
    includeStackTrace: true,
    maxEntries: 1000,
  });
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(true);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState(5000);

  useEffect(() => {
    loadLogs();
    if (isRealTimeEnabled) {
      const interval = setInterval(generateMockLog, autoRefreshInterval);
      return () => clearInterval(interval);
    }
  }, [isRealTimeEnabled, autoRefreshInterval]);

  useEffect(() => {
    applyFilters();
  }, [logs, filter]);

  const loadLogs = async () => {
    try {
      const storedLogs = await AsyncStorage.getItem('app_logs');
      if (storedLogs) {
        const parsedLogs = JSON.parse(storedLogs).map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp),
        }));
        setLogs(parsedLogs);
      } else {
        // 生成初始日志数据
        const initialLogs = generateInitialLogs();
        setLogs(initialLogs);
        await AsyncStorage.setItem('app_logs', JSON.stringify(initialLogs));
      }
    } catch (error) {
      console.error('加载日志失败:', error);
    }
  };

  const generateInitialLogs = (): LogEntry[] => {
    const levels: LogEntry['level'][] = ['debug', 'info', 'warn', 'error', 'fatal'];
    const categories = ['Authentication', 'API', 'Database', 'UI', 'Network', 'Security', 'Performance'];
    const sources = ['Frontend', 'Backend', 'Mobile App', 'Web App', 'API Gateway', 'Database'];
    const messages = [
      '用户登录成功',
      'API请求超时',
      '数据库连接失败',
      '页面加载完成',
      '网络请求错误',
      '安全验证通过',
      '性能监控警告',
      '用户注销',
      '文件上传成功',
      '缓存更新',
      '配置加载失败',
      '推送通知发送',
      '数据同步完成',
      '错误恢复成功',
      '系统启动',
    ];

    return Array.from({ length: 100 }, (_, i) => {
      const level = levels[Math.floor(Math.random() * levels.length)];
      const category = categories[Math.floor(Math.random() * categories.length)];
      const source = sources[Math.floor(Math.random() * sources.length)];
      const message = messages[Math.floor(Math.random() * messages.length)];
      
      return {
        id: `log_${i + 1}`,
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        level,
        category,
        message,
        source,
        userId: Math.random() > 0.5 ? `user_${Math.floor(Math.random() * 100)}` : undefined,
        sessionId: `session_${Math.floor(Math.random() * 1000)}`,
        metadata: {
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
          requestId: `req_${Math.floor(Math.random() * 10000)}`,
        },
        stackTrace: level === 'error' || level === 'fatal' ? generateStackTrace() : undefined,
        tags: generateTags(category, level),
      };
    }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  };

  const generateStackTrace = (): string => {
    const stackLines = [
      'Error: Something went wrong',
      '    at handleRequest (/app/src/handlers/request.js:45:12)',
      '    at processRequest (/app/src/middleware/process.js:23:8)',
      '    at Router.handle (/app/node_modules/express/lib/router/index.js:281:3)',
      '    at next (/app/node_modules/express/lib/router/index.js:161:13)',
      '    at Function.handle (/app/node_modules/express/lib/application.js:174:3)',
      '    at Server.handle (/app/node_modules/express/lib/application.js:231:10)',
    ];
    return stackLines.join('\n');
  };

  const generateTags = (category: string, level: string): string[] => {
    const baseTags = [category.toLowerCase(), level];
    const additionalTags = ['production', 'critical', 'user-action', 'system', 'external'];
    const numAdditional = Math.floor(Math.random() * 3);
    
    for (let i = 0; i < numAdditional; i++) {
      const tag = additionalTags[Math.floor(Math.random() * additionalTags.length)];
      if (!baseTags.includes(tag)) {
        baseTags.push(tag);
      }
    }
    
    return baseTags;
  };

  const generateMockLog = () => {
    const newLog = generateInitialLogs()[0];
    newLog.id = `log_${Date.now()}`;
    newLog.timestamp = new Date();
    
    setLogs(prevLogs => {
      const updatedLogs = [newLog, ...prevLogs.slice(0, 999)]; // 保留最新1000条
      AsyncStorage.setItem('app_logs', JSON.stringify(updatedLogs));
      return updatedLogs;
    });
  };

  const applyFilters = () => {
    let filtered = [...logs];

    // 级别过滤
    if (filter.levels.length > 0) {
      filtered = filtered.filter(log => filter.levels.includes(log.level));
    }

    // 分类过滤
    if (filter.categories.length > 0) {
      filtered = filtered.filter(log => filter.categories.includes(log.category));
    }

    // 来源过滤
    if (filter.sources.length > 0) {
      filtered = filtered.filter(log => filter.sources.includes(log.source));
    }

    // 日期范围过滤
    if (filter.dateRange.start) {
      filtered = filtered.filter(log => log.timestamp >= filter.dateRange.start!);
    }
    if (filter.dateRange.end) {
      filtered = filtered.filter(log => log.timestamp <= filter.dateRange.end!);
    }

    // 文本搜索
    if (filter.searchText) {
      const searchLower = filter.searchText.toLowerCase();
      filtered = filtered.filter(log =>
        log.message.toLowerCase().includes(searchLower) ||
        log.category.toLowerCase().includes(searchLower) ||
        log.source.toLowerCase().includes(searchLower) ||
        log.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // 标签过滤
    if (filter.tags.length > 0) {
      filtered = filtered.filter(log =>
        filter.tags.some(tag => log.tags.includes(tag))
      );
    }

    setFilteredLogs(filtered);
  };

  const clearLogs = async () => {
    Alert.alert(
      '清除日志',
      '确定要清除所有日志吗？此操作不可撤销。',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '清除',
          style: 'destructive',
          onPress: async () => {
            setLogs([]);
            await AsyncStorage.removeItem('app_logs');
          },
        },
      ]
    );
  };

  const exportLogs = async () => {
    try {
      const logsToExport = filteredLogs.slice(0, exportOptions.maxEntries);
      let exportData: string;

      switch (exportOptions.format) {
        case 'json':
          exportData = JSON.stringify(logsToExport.map(log => ({
            ...log,
            metadata: exportOptions.includeMetadata ? log.metadata : undefined,
            stackTrace: exportOptions.includeStackTrace ? log.stackTrace : undefined,
          })), null, 2);
          break;
        case 'csv':
          const headers = ['timestamp', 'level', 'category', 'source', 'message', 'userId', 'sessionId', 'tags'];
          const csvRows = [headers.join(',')];
          logsToExport.forEach(log => {
            const row = [
              log.timestamp.toISOString(),
              log.level,
              log.category,
              log.source,
              `"${log.message.replace(/"/g, '""')}"`,
              log.userId || '',
              log.sessionId || '',
              `"${log.tags.join(', ')}"`,
            ];
            csvRows.push(row.join(','));
          });
          exportData = csvRows.join('\n');
          break;
        case 'txt':
          exportData = logsToExport.map(log => {
            let line = `[${log.timestamp.toISOString()}] ${log.level.toUpperCase()} [${log.category}] ${log.message}`;
            if (exportOptions.includeStackTrace && log.stackTrace) {
              line += `\n${log.stackTrace}`;
            }
            return line;
          }).join('\n\n');
          break;
        default:
          exportData = JSON.stringify(logsToExport);
      }

      // 在实际应用中，这里会触发文件下载或分享
      Alert.alert('导出成功', `已导出 ${logsToExport.length} 条日志记录`);
      setShowExportModal(false);
    } catch (error) {
      Alert.alert('导出失败', '日志导出过程中发生错误');
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'debug':
        return '#9E9E9E';
      case 'info':
        return '#2196F3';
      case 'warn':
        return '#FF9800';
      case 'error':
        return '#F44336';
      case 'fatal':
        return '#9C27B0';
      default:
        return '#9E9E9E';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'debug':
        return 'bug';
      case 'info':
        return 'information-circle';
      case 'warn':
        return 'warning';
      case 'error':
        return 'close-circle';
      case 'fatal':
        return 'skull';
      default:
        return 'ellipse';
    }
  };

  const getUniqueValues = (key: keyof LogEntry) => {
    const values = logs.map(log => log[key]).filter(Boolean);
    return [...new Set(values as string[])];
  };

  const renderLogCard = (log: LogEntry) => (
    <TouchableOpacity
      key={log.id}
      style={[styles.logCard, { backgroundColor: theme.colors.surface }]}
      onPress={() => {
        setSelectedLog(log);
        setShowLogModal(true);
      }}
    >
      <View style={styles.logHeader}>
        <View style={styles.logInfo}>
          <View style={styles.logTitleRow}>
            <Ionicons
              name={getLevelIcon(log.level) as any}
              size={16}
              color={getLevelColor(log.level)}
            />
            <Text style={[styles.logLevel, { color: getLevelColor(log.level) }]}>
              {log.level.toUpperCase()}
            </Text>
            <Text style={[styles.logCategory, { color: theme.colors.textSecondary }]}>
              [{log.category}]
            </Text>
            <Text style={[styles.logSource, { color: theme.colors.textSecondary }]}>
              {log.source}
            </Text>
          </View>
          <Text style={[styles.logMessage, { color: theme.colors.text }]} numberOfLines={2}>
            {log.message}
          </Text>
          <View style={styles.logMeta}>
            <Text style={[styles.logTimestamp, { color: theme.colors.textSecondary }]}>
              {log.timestamp.toLocaleString()}
            </Text>
            {log.userId && (
              <Text style={[styles.logUserId, { color: theme.colors.textSecondary }]}>
                用户: {log.userId}
              </Text>
            )}
          </View>
          {log.tags.length > 0 && (
            <View style={styles.logTags}>
              {log.tags.slice(0, 3).map((tag, index) => (
                <View
                  key={index}
                  style={[styles.logTag, { backgroundColor: theme.colors.primary + '20' }]}
                >
                  <Text style={[styles.logTagText, { color: theme.colors.primary }]}>
                    {tag}
                  </Text>
                </View>
              ))}
              {log.tags.length > 3 && (
                <Text style={[styles.logTagMore, { color: theme.colors.textSecondary }]}>
                  +{log.tags.length - 3}
                </Text>
              )}
            </View>
          )}
        </View>
        {log.stackTrace && (
          <Ionicons name="code" size={16} color={theme.colors.textSecondary} />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* 头部 */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          日志管理
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: theme.colors.surface }]}
            onPress={() => setShowFilterModal(true)}
          >
            <Ionicons name="filter" size={20} color={theme.colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: theme.colors.surface }]}
            onPress={() => setShowExportModal(true)}
          >
            <Ionicons name="download" size={20} color={theme.colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: '#F44336' }]}
            onPress={clearLogs}
          >
            <Ionicons name="trash" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 统计信息 */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.statValue, { color: theme.colors.text }]}>
            {filteredLogs.length}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            总日志数
          </Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.statValue, { color: '#F44336' }]}>
            {filteredLogs.filter(log => log.level === 'error' || log.level === 'fatal').length}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            错误日志
          </Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.statValue, { color: '#FF9800' }]}>
            {filteredLogs.filter(log => log.level === 'warn').length}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            警告日志
          </Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.realTimeIndicator}>
            <View
              style={[
                styles.realTimeStatus,
                { backgroundColor: isRealTimeEnabled ? '#4CAF50' : '#9E9E9E' },
              ]}
            />
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              实时监控
            </Text>
          </View>
        </View>
      </View>

      {/* 实时控制 */}
      <View style={[styles.realTimeControls, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.realTimeToggle}>
          <Text style={[styles.realTimeLabel, { color: theme.colors.text }]}>
            实时日志
          </Text>
          <Switch
            value={isRealTimeEnabled}
            onValueChange={setIsRealTimeEnabled}
            trackColor={{ false: '#E0E0E0', true: theme.colors.primary }}
            thumbColor={isRealTimeEnabled ? '#FFFFFF' : '#F4F3F4'}
          />
        </View>
        {isRealTimeEnabled && (
          <View style={styles.refreshInterval}>
            <Text style={[styles.intervalLabel, { color: theme.colors.textSecondary }]}>
              刷新间隔: {autoRefreshInterval / 1000}s
            </Text>
            <View style={styles.intervalButtons}>
              {[1000, 5000, 10000].map((interval) => (
                <TouchableOpacity
                  key={interval}
                  style={[
                    styles.intervalButton,
                    {
                      backgroundColor: autoRefreshInterval === interval
                        ? theme.colors.primary
                        : theme.colors.background,
                    },
                  ]}
                  onPress={() => setAutoRefreshInterval(interval)}
                >
                  <Text
                    style={[
                      styles.intervalButtonText,
                      {
                        color: autoRefreshInterval === interval
                          ? '#FFFFFF'
                          : theme.colors.text,
                      },
                    ]}
                  >
                    {interval / 1000}s
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* 日志列表 */}
      <ScrollView style={styles.logsList}>
        {filteredLogs.map(renderLogCard)}
        {filteredLogs.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="document-text" size={48} color={theme.colors.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              没有找到匹配的日志记录
            </Text>
          </View>
        )}
      </ScrollView>

      {/* 过滤器模态框 */}
      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              日志过滤器
            </Text>
            
            <ScrollView style={styles.filterForm}>
              {/* 搜索文本 */}
              <View style={styles.filterGroup}>
                <Text style={[styles.filterLabel, { color: theme.colors.text }]}>
                  搜索文本
                </Text>
                <TextInput
                  style={[styles.filterInput, { 
                    backgroundColor: theme.colors.background,
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                  }]}
                  value={filter.searchText}
                  onChangeText={(text) => setFilter(prev => ({ ...prev, searchText: text }))}
                  placeholder="搜索日志内容..."
                  placeholderTextColor={theme.colors.textSecondary}
                />
              </View>

              {/* 日志级别 */}
              <View style={styles.filterGroup}>
                <Text style={[styles.filterLabel, { color: theme.colors.text }]}>
                  日志级别
                </Text>
                <View style={styles.filterOptions}>
                  {['debug', 'info', 'warn', 'error', 'fatal'].map((level) => (
                    <TouchableOpacity
                      key={level}
                      style={[
                        styles.filterOption,
                        {
                          backgroundColor: filter.levels.includes(level)
                            ? getLevelColor(level)
                            : theme.colors.background,
                          borderColor: getLevelColor(level),
                        },
                      ]}
                      onPress={() => {
                        setFilter(prev => ({
                          ...prev,
                          levels: prev.levels.includes(level)
                            ? prev.levels.filter(l => l !== level)
                            : [...prev.levels, level],
                        }));
                      }}
                    >
                      <Text
                        style={[
                          styles.filterOptionText,
                          {
                            color: filter.levels.includes(level)
                              ? '#FFFFFF'
                              : getLevelColor(level),
                          },
                        ]}
                      >
                        {level.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* 分类 */}
              <View style={styles.filterGroup}>
                <Text style={[styles.filterLabel, { color: theme.colors.text }]}>
                  分类
                </Text>
                <View style={styles.filterOptions}>
                  {getUniqueValues('category').map((category) => (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.filterOption,
                        {
                          backgroundColor: filter.categories.includes(category)
                            ? theme.colors.primary
                            : theme.colors.background,
                          borderColor: theme.colors.primary,
                        },
                      ]}
                      onPress={() => {
                        setFilter(prev => ({
                          ...prev,
                          categories: prev.categories.includes(category)
                            ? prev.categories.filter(c => c !== category)
                            : [...prev.categories, category],
                        }));
                      }}
                    >
                      <Text
                        style={[
                          styles.filterOptionText,
                          {
                            color: filter.categories.includes(category)
                              ? '#FFFFFF'
                              : theme.colors.primary,
                          },
                        ]}
                      >
                        {category}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* 来源 */}
              <View style={styles.filterGroup}>
                <Text style={[styles.filterLabel, { color: theme.colors.text }]}>
                  来源
                </Text>
                <View style={styles.filterOptions}>
                  {getUniqueValues('source').map((source) => (
                    <TouchableOpacity
                      key={source}
                      style={[
                        styles.filterOption,
                        {
                          backgroundColor: filter.sources.includes(source)
                            ? theme.colors.primary
                            : theme.colors.background,
                          borderColor: theme.colors.primary,
                        },
                      ]}
                      onPress={() => {
                        setFilter(prev => ({
                          ...prev,
                          sources: prev.sources.includes(source)
                            ? prev.sources.filter(s => s !== source)
                            : [...prev.sources, source],
                        }));
                      }}
                    >
                      <Text
                        style={[
                          styles.filterOptionText,
                          {
                            color: filter.sources.includes(source)
                              ? '#FFFFFF'
                              : theme.colors.primary,
                          },
                        ]}
                      >
                        {source}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.colors.background }]}
                onPress={() => {
                  setFilter({
                    levels: [],
                    categories: [],
                    sources: [],
                    dateRange: {},
                    searchText: '',
                    tags: [],
                  });
                }}
              >
                <Text style={[styles.modalButtonText, { color: theme.colors.text }]}>
                  重置
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => setShowFilterModal(false)}
              >
                <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>
                  应用
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 日志详情模态框 */}
      <Modal
        visible={showLogModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowLogModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.logModalContent, { backgroundColor: theme.colors.surface }]}>
            {selectedLog && (
              <>
                <View style={styles.logDetailHeader}>
                  <View style={styles.logDetailTitle}>
                    <Ionicons
                      name={getLevelIcon(selectedLog.level) as any}
                      size={20}
                      color={getLevelColor(selectedLog.level)}
                    />
                    <Text style={[styles.logDetailLevel, { color: getLevelColor(selectedLog.level) }]}>
                      {selectedLog.level.toUpperCase()}
                    </Text>
                    <Text style={[styles.logDetailCategory, { color: theme.colors.text }]}>
                      [{selectedLog.category}]
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setShowLogModal(false)}
                  >
                    <Ionicons name="close" size={24} color={theme.colors.text} />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.logDetailContent}>
                  <View style={styles.logDetailSection}>
                    <Text style={[styles.logDetailSectionTitle, { color: theme.colors.text }]}>
                      消息
                    </Text>
                    <Text style={[styles.logDetailMessage, { color: theme.colors.text }]}>
                      {selectedLog.message}
                    </Text>
                  </View>

                  <View style={styles.logDetailSection}>
                    <Text style={[styles.logDetailSectionTitle, { color: theme.colors.text }]}>
                      基本信息
                    </Text>
                    <View style={styles.logDetailInfo}>
                      <Text style={[styles.logDetailInfoItem, { color: theme.colors.textSecondary }]}>
                        时间: {selectedLog.timestamp.toLocaleString()}
                      </Text>
                      <Text style={[styles.logDetailInfoItem, { color: theme.colors.textSecondary }]}>
                        来源: {selectedLog.source}
                      </Text>
                      {selectedLog.userId && (
                        <Text style={[styles.logDetailInfoItem, { color: theme.colors.textSecondary }]}>
                          用户ID: {selectedLog.userId}
                        </Text>
                      )}
                      {selectedLog.sessionId && (
                        <Text style={[styles.logDetailInfoItem, { color: theme.colors.textSecondary }]}>
                          会话ID: {selectedLog.sessionId}
                        </Text>
                      )}
                    </View>
                  </View>

                  {selectedLog.tags.length > 0 && (
                    <View style={styles.logDetailSection}>
                      <Text style={[styles.logDetailSectionTitle, { color: theme.colors.text }]}>
                        标签
                      </Text>
                      <View style={styles.logDetailTags}>
                        {selectedLog.tags.map((tag, index) => (
                          <View
                            key={index}
                            style={[styles.logDetailTag, { backgroundColor: theme.colors.primary + '20' }]}
                          >
                            <Text style={[styles.logDetailTagText, { color: theme.colors.primary }]}>
                              {tag}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  {selectedLog.metadata && (
                    <View style={styles.logDetailSection}>
                      <Text style={[styles.logDetailSectionTitle, { color: theme.colors.text }]}>
                        元数据
                      </Text>
                      <View style={[styles.logDetailMetadata, { backgroundColor: theme.colors.background }]}>
                        <Text style={[styles.logDetailMetadataText, { color: theme.colors.textSecondary }]}>
                          {JSON.stringify(selectedLog.metadata, null, 2)}
                        </Text>
                      </View>
                    </View>
                  )}

                  {selectedLog.stackTrace && (
                    <View style={styles.logDetailSection}>
                      <Text style={[styles.logDetailSectionTitle, { color: theme.colors.text }]}>
                        堆栈跟踪
                      </Text>
                      <View style={[styles.logDetailStackTrace, { backgroundColor: theme.colors.background }]}>
                        <Text style={[styles.logDetailStackTraceText, { color: '#F44336' }]}>
                          {selectedLog.stackTrace}
                        </Text>
                      </View>
                    </View>
                  )}
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* 导出模态框 */}
      <Modal
        visible={showExportModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowExportModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              导出日志
            </Text>
            
            <View style={styles.exportForm}>
              <View style={styles.exportGroup}>
                <Text style={[styles.exportLabel, { color: theme.colors.text }]}>
                  导出格式
                </Text>
                <View style={styles.exportOptions}>
                  {(['json', 'csv', 'txt'] as const).map((format) => (
                    <TouchableOpacity
                      key={format}
                      style={[
                        styles.exportOption,
                        {
                          backgroundColor: exportOptions.format === format
                            ? theme.colors.primary
                            : theme.colors.background,
                          borderColor: theme.colors.primary,
                        },
                      ]}
                      onPress={() => setExportOptions(prev => ({ ...prev, format }))}
                    >
                      <Text
                        style={[
                          styles.exportOptionText,
                          {
                            color: exportOptions.format === format
                              ? '#FFFFFF'
                              : theme.colors.primary,
                          },
                        ]}
                      >
                        {format.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.exportGroup}>
                <Text style={[styles.exportLabel, { color: theme.colors.text }]}>
                  最大记录数
                </Text>
                <TextInput
                  style={[styles.exportInput, { 
                    backgroundColor: theme.colors.background,
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                  }]}
                  value={exportOptions.maxEntries.toString()}
                  onChangeText={(text) => setExportOptions(prev => ({ 
                    ...prev, 
                    maxEntries: parseInt(text) || 1000 
                  }))}
                  placeholder="1000"
                  placeholderTextColor={theme.colors.textSecondary}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.exportGroup}>
                <View style={styles.exportSwitch}>
                  <Text style={[styles.exportLabel, { color: theme.colors.text }]}>
                    包含元数据
                  </Text>
                  <Switch
                    value={exportOptions.includeMetadata}
                    onValueChange={(includeMetadata) => setExportOptions(prev => ({ 
                      ...prev, 
                      includeMetadata 
                    }))}
                    trackColor={{ false: '#E0E0E0', true: theme.colors.primary }}
                    thumbColor={exportOptions.includeMetadata ? '#FFFFFF' : '#F4F3F4'}
                  />
                </View>
              </View>

              <View style={styles.exportGroup}>
                <View style={styles.exportSwitch}>
                  <Text style={[styles.exportLabel, { color: theme.colors.text }]}>
                    包含堆栈跟踪
                  </Text>
                  <Switch
                    value={exportOptions.includeStackTrace}
                    onValueChange={(includeStackTrace) => setExportOptions(prev => ({ 
                      ...prev, 
                      includeStackTrace 
                    }))}
                    trackColor={{ false: '#E0E0E0', true: theme.colors.primary }}
                    thumbColor={exportOptions.includeStackTrace ? '#FFFFFF' : '#F4F3F4'}
                  />
                </View>
              </View>

              <View style={styles.exportSummary}>
                <Text style={[styles.exportSummaryText, { color: theme.colors.textSecondary }]}>
                  将导出 {Math.min(filteredLogs.length, exportOptions.maxEntries)} 条日志记录
                </Text>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.colors.background }]}
                onPress={() => setShowExportModal(false)}
              >
                <Text style={[styles.modalButtonText, { color: theme.colors.text }]}>
                  取消
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.colors.primary }]}
                onPress={exportLogs}
              >
                <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>
                  导出
                </Text>
              </TouchableOpacity>
            </View>
          </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    padding: 8,
    borderRadius: 6,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  statCard: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  realTimeIndicator: {
    alignItems: 'center',
  },
  realTimeStatus: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  realTimeControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  realTimeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  realTimeLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  refreshInterval: {
    alignItems: 'flex-end',
  },
  intervalLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  intervalButtons: {
    flexDirection: 'row',
    gap: 4,
  },
  intervalButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  intervalButtonText: {
    fontSize: 10,
    fontWeight: '500',
  },
  logsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  logCard: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  logInfo: {
    flex: 1,
  },
  logTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  logLevel: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  logCategory: {
    fontSize: 12,
    fontWeight: '500',
  },
  logSource: {
    fontSize: 10,
    marginLeft: 'auto',
  },
  logMessage: {
    fontSize: 14,
    marginBottom: 6,
    lineHeight: 20,
  },
  logMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  logTimestamp: {
    fontSize: 10,
  },
  logUserId: {
    fontSize: 10,
  },
  logTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    alignItems: 'center',
  },
  logTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  logTagText: {
    fontSize: 10,
    fontWeight: '500',
  },
  logTagMore: {
    fontSize: 10,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 12,
    padding: 20,
  },
  logModalContent: {
    width: '95%',
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  filterForm: {
    maxHeight: 400,
  },
  filterGroup: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  filterInput: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 16,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 16,
  },
  filterOptionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  logDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  logDetailTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logDetailLevel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  logDetailCategory: {
    fontSize: 14,
    fontWeight: '500',
  },
  closeButton: {
    padding: 4,
  },
  logDetailContent: {
    flex: 1,
  },
  logDetailSection: {
    marginBottom: 16,
  },
  logDetailSectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  logDetailMessage: {
    fontSize: 16,
    lineHeight: 24,
  },
  logDetailInfo: {
    gap: 4,
  },
  logDetailInfoItem: {
    fontSize: 14,
  },
  logDetailTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  logDetailTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  logDetailTagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  logDetailMetadata: {
    padding: 12,
    borderRadius: 8,
  },
  logDetailMetadataText: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  logDetailStackTrace: {
    padding: 12,
    borderRadius: 8,
  },
  logDetailStackTraceText: {
    fontSize: 12,
    fontFamily: 'monospace',
    lineHeight: 16,
  },
  exportForm: {
    marginBottom: 16,
  },
  exportGroup: {
    marginBottom: 16,
  },
  exportLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  exportOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  exportOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 16,
  },
  exportOptionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  exportInput: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 16,
  },
  exportSwitch: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exportSummary: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  exportSummaryText: {
    fontSize: 12,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default LogManagement;