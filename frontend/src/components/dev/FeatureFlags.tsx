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

interface FeatureFlagProps {
  navigation?: any;
}

interface FeatureFlag {
  id: string;
  name: string;
  key: string;
  description: string;
  enabled: boolean;
  category: 'ui' | 'feature' | 'experiment' | 'performance';
  rolloutPercentage: number;
  targetAudience: string[];
  startDate?: Date;
  endDate?: Date;
  dependencies?: string[];
  metadata?: { [key: string]: any };
}

interface FlagGroup {
  id: string;
  name: string;
  description: string;
  flags: string[];
  enabled: boolean;
}

interface FlagHistory {
  id: string;
  flagId: string;
  action: 'enabled' | 'disabled' | 'created' | 'updated';
  timestamp: Date;
  user: string;
  reason?: string;
}

const FeatureFlags: React.FC<FeatureFlagProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [flagGroups, setFlagGroups] = useState<FlagGroup[]>([]);
  const [flagHistory, setFlagHistory] = useState<FlagHistory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'ui' | 'feature' | 'experiment' | 'performance'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedFlag, setSelectedFlag] = useState<FeatureFlag | null>(null);
  const [newFlag, setNewFlag] = useState<Partial<FeatureFlag>>({
    name: '',
    key: '',
    description: '',
    enabled: false,
    category: 'feature',
    rolloutPercentage: 100,
    targetAudience: [],
  });

  useEffect(() => {
    loadFeatureFlags();
    loadFlagGroups();
    loadFlagHistory();
  }, []);

  const loadFeatureFlags = async () => {
    try {
      const storedFlags = await AsyncStorage.getItem('feature_flags');
      if (storedFlags) {
        setFlags(JSON.parse(storedFlags));
      } else {
        // 初始化默认功能标志
        const defaultFlags: FeatureFlag[] = [
          {
            id: '1',
            name: '新版UI设计',
            key: 'new_ui_design',
            description: '启用全新的用户界面设计',
            enabled: false,
            category: 'ui',
            rolloutPercentage: 50,
            targetAudience: ['beta_users'],
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            metadata: { version: '2.0', designer: 'UI Team' },
          },
          {
            id: '2',
            name: '智能推荐系统',
            key: 'smart_recommendations',
            description: '基于AI的职位推荐功能',
            enabled: true,
            category: 'feature',
            rolloutPercentage: 100,
            targetAudience: ['all_users'],
            dependencies: ['user_analytics'],
            metadata: { algorithm: 'ml_v2', accuracy: 0.85 },
          },
          {
            id: '3',
            name: '实时聊天功能',
            key: 'real_time_chat',
            description: '启用实时消息传递功能',
            enabled: true,
            category: 'feature',
            rolloutPercentage: 80,
            targetAudience: ['premium_users', 'enterprise_users'],
            metadata: { protocol: 'websocket', encryption: true },
          },
          {
            id: '4',
            name: 'A/B测试实验',
            key: 'ab_test_experiment',
            description: '测试不同的用户体验流程',
            enabled: false,
            category: 'experiment',
            rolloutPercentage: 25,
            targetAudience: ['test_group_a'],
            startDate: new Date(),
            endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            metadata: { variant: 'A', hypothesis: 'Improved conversion rate' },
          },
          {
            id: '5',
            name: '性能优化模式',
            key: 'performance_mode',
            description: '启用高性能渲染模式',
            enabled: true,
            category: 'performance',
            rolloutPercentage: 100,
            targetAudience: ['all_users'],
            metadata: { optimization_level: 'high', memory_usage: 'reduced' },
          },
          {
            id: '6',
            name: '暗色主题',
            key: 'dark_theme',
            description: '启用暗色主题支持',
            enabled: true,
            category: 'ui',
            rolloutPercentage: 100,
            targetAudience: ['all_users'],
            metadata: { theme_version: '1.2', accessibility: true },
          },
        ];
        setFlags(defaultFlags);
        await AsyncStorage.setItem('feature_flags', JSON.stringify(defaultFlags));
      }
    } catch (error) {
      console.error('加载功能标志失败:', error);
    }
  };

  const loadFlagGroups = async () => {
    try {
      const storedGroups = await AsyncStorage.getItem('flag_groups');
      if (storedGroups) {
        setFlagGroups(JSON.parse(storedGroups));
      } else {
        const defaultGroups: FlagGroup[] = [
          {
            id: '1',
            name: 'UI改进',
            description: '用户界面相关的功能标志',
            flags: ['1', '6'],
            enabled: true,
          },
          {
            id: '2',
            name: '核心功能',
            description: '应用核心功能的标志',
            flags: ['2', '3'],
            enabled: true,
          },
          {
            id: '3',
            name: '实验性功能',
            description: '正在测试的实验性功能',
            flags: ['4'],
            enabled: false,
          },
        ];
        setFlagGroups(defaultGroups);
        await AsyncStorage.setItem('flag_groups', JSON.stringify(defaultGroups));
      }
    } catch (error) {
      console.error('加载标志组失败:', error);
    }
  };

  const loadFlagHistory = async () => {
    try {
      const storedHistory = await AsyncStorage.getItem('flag_history');
      if (storedHistory) {
        setFlagHistory(JSON.parse(storedHistory).map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        })));
      } else {
        const defaultHistory: FlagHistory[] = [
          {
            id: '1',
            flagId: '2',
            action: 'enabled',
            timestamp: new Date(Date.now() - 60000),
            user: 'admin',
            reason: '功能测试完成',
          },
          {
            id: '2',
            flagId: '1',
            action: 'created',
            timestamp: new Date(Date.now() - 120000),
            user: 'developer',
            reason: '新UI设计准备就绪',
          },
        ];
        setFlagHistory(defaultHistory);
        await AsyncStorage.setItem('flag_history', JSON.stringify(defaultHistory));
      }
    } catch (error) {
      console.error('加载标志历史失败:', error);
    }
  };

  const saveFeatureFlags = async (updatedFlags: FeatureFlag[]) => {
    try {
      await AsyncStorage.setItem('feature_flags', JSON.stringify(updatedFlags));
      setFlags(updatedFlags);
    } catch (error) {
      console.error('保存功能标志失败:', error);
    }
  };

  const toggleFlag = async (flagId: string) => {
    const updatedFlags = flags.map(flag => {
      if (flag.id === flagId) {
        const newFlag = { ...flag, enabled: !flag.enabled };
        
        // 添加历史记录
        const historyEntry: FlagHistory = {
          id: Date.now().toString(),
          flagId: flagId,
          action: newFlag.enabled ? 'enabled' : 'disabled',
          timestamp: new Date(),
          user: 'current_user',
          reason: `手动${newFlag.enabled ? '启用' : '禁用'}`,
        };
        
        setFlagHistory(prev => [historyEntry, ...prev]);
        
        return newFlag;
      }
      return flag;
    });
    
    await saveFeatureFlags(updatedFlags);
  };

  const createFlag = async () => {
    if (!newFlag.name || !newFlag.key) {
      Alert.alert('错误', '请填写标志名称和键值');
      return;
    }

    const flag: FeatureFlag = {
      id: Date.now().toString(),
      name: newFlag.name!,
      key: newFlag.key!,
      description: newFlag.description || '',
      enabled: newFlag.enabled || false,
      category: newFlag.category || 'feature',
      rolloutPercentage: newFlag.rolloutPercentage || 100,
      targetAudience: newFlag.targetAudience || [],
      metadata: newFlag.metadata,
    };

    const updatedFlags = [...flags, flag];
    await saveFeatureFlags(updatedFlags);

    // 添加历史记录
    const historyEntry: FlagHistory = {
      id: Date.now().toString(),
      flagId: flag.id,
      action: 'created',
      timestamp: new Date(),
      user: 'current_user',
      reason: '新建功能标志',
    };
    
    setFlagHistory(prev => [historyEntry, ...prev]);

    setNewFlag({
      name: '',
      key: '',
      description: '',
      enabled: false,
      category: 'feature',
      rolloutPercentage: 100,
      targetAudience: [],
    });
    setShowCreateModal(false);
  };

  const deleteFlag = async (flagId: string) => {
    Alert.alert(
      '删除确认',
      '确定要删除这个功能标志吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            const updatedFlags = flags.filter(flag => flag.id !== flagId);
            await saveFeatureFlags(updatedFlags);
          },
        },
      ]
    );
  };

  const exportFlags = () => {
    const flagsData = JSON.stringify(flags, null, 2);
    Alert.alert('导出功能标志', '功能标志数据已准备导出');
    // 这里可以实现实际的导出功能
  };

  const importFlags = () => {
    Alert.alert('导入功能标志', '请选择要导入的功能标志文件');
    // 这里可以实现实际的导入功能
  };

  const resetAllFlags = () => {
    Alert.alert(
      '重置确认',
      '确定要重置所有功能标志吗？这将禁用所有标志。',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '重置',
          style: 'destructive',
          onPress: async () => {
            const resetFlags = flags.map(flag => ({ ...flag, enabled: false }));
            await saveFeatureFlags(resetFlags);
          },
        },
      ]
    );
  };

  const filteredFlags = flags.filter(flag => {
    const matchesCategory = selectedCategory === 'all' || flag.category === selectedCategory;
    const matchesSearch = flag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         flag.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         flag.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'ui':
        return '#9C27B0';
      case 'feature':
        return '#2196F3';
      case 'experiment':
        return '#FF9800';
      case 'performance':
        return '#4CAF50';
      default:
        return theme.colors.textSecondary;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'ui':
        return 'color-palette';
      case 'feature':
        return 'star';
      case 'experiment':
        return 'flask';
      case 'performance':
        return 'speedometer';
      default:
        return 'flag';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* 头部 */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          功能标志管理
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.headerButton, { borderColor: theme.colors.primary }]}
            onPress={() => setShowHistoryModal(true)}
          >
            <Ionicons name="time" size={16} color={theme.colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerButton, { borderColor: theme.colors.primary }]}
            onPress={exportFlags}
          >
            <Ionicons name="download" size={16} color={theme.colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerButton, { borderColor: theme.colors.primary }]}
            onPress={() => setShowCreateModal(true)}
          >
            <Ionicons name="add" size={16} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* 搜索和过滤 */}
      <View style={styles.searchSection}>
        <View style={[styles.searchInput, { backgroundColor: theme.colors.surface }]}>
          <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
          <TextInput
            style={[styles.searchText, { color: theme.colors.text }]}
            placeholder="搜索功能标志..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* 分类过滤 */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryFilters}
        contentContainerStyle={styles.categoryFiltersContent}
      >
        {(['all', 'ui', 'feature', 'experiment', 'performance'] as const).map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              {
                backgroundColor: selectedCategory === category
                  ? theme.colors.primary
                  : theme.colors.surface,
              },
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Ionicons
              name={category === 'all' ? 'apps' : getCategoryIcon(category) as any}
              size={16}
              color={selectedCategory === category ? '#FFFFFF' : theme.colors.text}
            />
            <Text
              style={[
                styles.categoryButtonText,
                {
                  color: selectedCategory === category ? '#FFFFFF' : theme.colors.text,
                },
              ]}
            >
              {category === 'all' ? '全部' : category.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 功能标志列表 */}
      <ScrollView style={styles.flagsList}>
        {filteredFlags.map((flag) => (
          <View
            key={flag.id}
            style={[styles.flagItem, { backgroundColor: theme.colors.surface }]}
          >
            <View style={styles.flagHeader}>
              <View style={styles.flagInfo}>
                <View style={styles.flagTitleRow}>
                  <Text style={[styles.flagName, { color: theme.colors.text }]}>
                    {flag.name}
                  </Text>
                  <View
                    style={[
                      styles.categoryBadge,
                      { backgroundColor: getCategoryColor(flag.category) },
                    ]}
                  >
                    <Ionicons
                      name={getCategoryIcon(flag.category) as any}
                      size={12}
                      color="#FFFFFF"
                    />
                    <Text style={styles.categoryBadgeText}>
                      {flag.category.toUpperCase()}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.flagKey, { color: theme.colors.textSecondary }]}>
                  {flag.key}
                </Text>
                <Text style={[styles.flagDescription, { color: theme.colors.textSecondary }]}>
                  {flag.description}
                </Text>
              </View>
              <Switch
                value={flag.enabled}
                onValueChange={() => toggleFlag(flag.id)}
                trackColor={{ false: '#E0E0E0', true: theme.colors.primary }}
                thumbColor={flag.enabled ? '#FFFFFF' : '#F4F3F4'}
              />
            </View>

            <View style={styles.flagDetails}>
              <View style={styles.flagMetrics}>
                <View style={styles.metric}>
                  <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>
                    推出比例
                  </Text>
                  <Text style={[styles.metricValue, { color: theme.colors.text }]}>
                    {flag.rolloutPercentage}%
                  </Text>
                </View>
                <View style={styles.metric}>
                  <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>
                    目标用户
                  </Text>
                  <Text style={[styles.metricValue, { color: theme.colors.text }]}>
                    {flag.targetAudience.length}
                  </Text>
                </View>
                {flag.dependencies && (
                  <View style={styles.metric}>
                    <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>
                      依赖项
                    </Text>
                    <Text style={[styles.metricValue, { color: theme.colors.text }]}>
                      {flag.dependencies.length}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.flagActions}>
                <TouchableOpacity
                  style={[styles.flagActionButton, { borderColor: theme.colors.primary }]}
                  onPress={() => {
                    setSelectedFlag(flag);
                    // 这里可以打开编辑模态框
                  }}
                >
                  <Ionicons name="create" size={16} color={theme.colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.flagActionButton, { borderColor: '#F44336' }]}
                  onPress={() => deleteFlag(flag.id)}
                >
                  <Ionicons name="trash" size={16} color="#F44336" />
                </TouchableOpacity>
              </View>
            </View>

            {flag.startDate && flag.endDate && (
              <View style={styles.flagSchedule}>
                <Text style={[styles.scheduleText, { color: theme.colors.textSecondary }]}>
                  计划时间: {flag.startDate.toLocaleDateString()} - {flag.endDate.toLocaleDateString()}
                </Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      {/* 底部操作 */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={[styles.bottomButton, { backgroundColor: theme.colors.surface }]}
          onPress={importFlags}
        >
          <Ionicons name="cloud-upload" size={20} color={theme.colors.primary} />
          <Text style={[styles.bottomButtonText, { color: theme.colors.primary }]}>
            导入
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.bottomButton, { backgroundColor: theme.colors.surface }]}
          onPress={resetAllFlags}
        >
          <Ionicons name="refresh" size={20} color="#F44336" />
          <Text style={[styles.bottomButtonText, { color: '#F44336' }]}>
            重置全部
          </Text>
        </TouchableOpacity>
      </View>

      {/* 创建功能标志模态框 */}
      <Modal
        visible={showCreateModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              创建功能标志
            </Text>
            
            <ScrollView style={styles.createForm}>
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: theme.colors.text }]}>
                  标志名称 *
                </Text>
                <TextInput
                  style={[styles.formInput, { 
                    backgroundColor: theme.colors.background,
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                  }]}
                  value={newFlag.name}
                  onChangeText={(text) => setNewFlag(prev => ({ ...prev, name: text }))}
                  placeholder="输入标志名称"
                  placeholderTextColor={theme.colors.textSecondary}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: theme.colors.text }]}>
                  标志键值 *
                </Text>
                <TextInput
                  style={[styles.formInput, { 
                    backgroundColor: theme.colors.background,
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                  }]}
                  value={newFlag.key}
                  onChangeText={(text) => setNewFlag(prev => ({ ...prev, key: text }))}
                  placeholder="输入标志键值"
                  placeholderTextColor={theme.colors.textSecondary}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: theme.colors.text }]}>
                  描述
                </Text>
                <TextInput
                  style={[styles.formInput, styles.formTextArea, { 
                    backgroundColor: theme.colors.background,
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                  }]}
                  value={newFlag.description}
                  onChangeText={(text) => setNewFlag(prev => ({ ...prev, description: text }))}
                  placeholder="输入标志描述"
                  placeholderTextColor={theme.colors.textSecondary}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: theme.colors.text }]}>
                  分类
                </Text>
                <View style={styles.categorySelector}>
                  {(['ui', 'feature', 'experiment', 'performance'] as const).map((category) => (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.categorySelectorButton,
                        {
                          backgroundColor: newFlag.category === category
                            ? getCategoryColor(category)
                            : theme.colors.background,
                          borderColor: getCategoryColor(category),
                        },
                      ]}
                      onPress={() => setNewFlag(prev => ({ ...prev, category }))}
                    >
                      <Text
                        style={[
                          styles.categorySelectorText,
                          {
                            color: newFlag.category === category
                              ? '#FFFFFF'
                              : getCategoryColor(category),
                          },
                        ]}
                      >
                        {category.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <View style={styles.switchRow}>
                  <Text style={[styles.formLabel, { color: theme.colors.text }]}>
                    默认启用
                  </Text>
                  <Switch
                    value={newFlag.enabled}
                    onValueChange={(enabled) => setNewFlag(prev => ({ ...prev, enabled }))}
                    trackColor={{ false: '#E0E0E0', true: theme.colors.primary }}
                    thumbColor={newFlag.enabled ? '#FFFFFF' : '#F4F3F4'}
                  />
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.colors.background }]}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={[styles.modalButtonText, { color: theme.colors.text }]}>
                  取消
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.colors.primary }]}
                onPress={createFlag}
              >
                <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>
                  创建
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 历史记录模态框 */}
      <Modal
        visible={showHistoryModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowHistoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              操作历史
            </Text>
            
            <ScrollView style={styles.historyList}>
              {flagHistory.map((entry) => {
                const flag = flags.find(f => f.id === entry.flagId);
                return (
                  <View
                    key={entry.id}
                    style={[styles.historyItem, { backgroundColor: theme.colors.background }]}
                  >
                    <View style={styles.historyHeader}>
                      <Text style={[styles.historyAction, { color: theme.colors.text }]}>
                        {entry.action === 'enabled' ? '启用' :
                         entry.action === 'disabled' ? '禁用' :
                         entry.action === 'created' ? '创建' : '更新'}
                      </Text>
                      <Text style={[styles.historyTimestamp, { color: theme.colors.textSecondary }]}>
                        {entry.timestamp.toLocaleString()}
                      </Text>
                    </View>
                    <Text style={[styles.historyFlag, { color: theme.colors.text }]}>
                      {flag?.name || '未知标志'}
                    </Text>
                    <Text style={[styles.historyUser, { color: theme.colors.textSecondary }]}>
                      操作者: {entry.user}
                    </Text>
                    {entry.reason && (
                      <Text style={[styles.historyReason, { color: theme.colors.textSecondary }]}>
                        原因: {entry.reason}
                      </Text>
                    )}
                  </View>
                );
              })}
            </ScrollView>

            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => setShowHistoryModal(false)}
            >
              <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>
                关闭
              </Text>
            </TouchableOpacity>
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
    borderWidth: 1,
    borderRadius: 6,
  },
  searchSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  searchText: {
    flex: 1,
    fontSize: 16,
  },
  categoryFilters: {
    marginBottom: 16,
  },
  categoryFiltersContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  categoryButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  flagsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  flagItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  flagHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  flagInfo: {
    flex: 1,
  },
  flagTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  flagName: {
    fontSize: 16,
    fontWeight: '600',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    gap: 2,
  },
  categoryBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  flagKey: {
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  flagDescription: {
    fontSize: 14,
  },
  flagDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  flagMetrics: {
    flexDirection: 'row',
    gap: 16,
  },
  metric: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 10,
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  flagActions: {
    flexDirection: 'row',
    gap: 8,
  },
  flagActionButton: {
    padding: 6,
    borderWidth: 1,
    borderRadius: 4,
  },
  flagSchedule: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  scheduleText: {
    fontSize: 12,
  },
  bottomActions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  bottomButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  bottomButtonText: {
    fontSize: 14,
    fontWeight: '500',
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
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  createForm: {
    maxHeight: 400,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  formInput: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 16,
  },
  formTextArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  categorySelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categorySelectorButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 16,
  },
  categorySelectorText: {
    fontSize: 12,
    fontWeight: '500',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
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
  historyList: {
    maxHeight: 400,
  },
  historyItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  historyAction: {
    fontSize: 14,
    fontWeight: '600',
  },
  historyTimestamp: {
    fontSize: 12,
  },
  historyFlag: {
    fontSize: 14,
    marginBottom: 2,
  },
  historyUser: {
    fontSize: 12,
    marginBottom: 2,
  },
  historyReason: {
    fontSize: 12,
  },
});

export default FeatureFlags;