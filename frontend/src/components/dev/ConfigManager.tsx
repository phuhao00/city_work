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

interface ConfigManagerProps {
  navigation?: any;
}

interface ConfigItem {
  id: string;
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  category: 'app' | 'api' | 'ui' | 'performance' | 'security';
  description: string;
  required: boolean;
  sensitive: boolean;
  defaultValue: any;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    options?: string[];
  };
  lastModified: Date;
  modifiedBy: string;
}

interface ConfigGroup {
  id: string;
  name: string;
  description: string;
  items: string[];
  collapsed: boolean;
}

interface ConfigHistory {
  id: string;
  configId: string;
  oldValue: any;
  newValue: any;
  timestamp: Date;
  user: string;
  reason?: string;
}

const ConfigManager: React.FC<ConfigManagerProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const [configs, setConfigs] = useState<ConfigItem[]>([]);
  const [configGroups, setConfigGroups] = useState<ConfigGroup[]>([]);
  const [configHistory, setConfigHistory] = useState<ConfigHistory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'app' | 'api' | 'ui' | 'performance' | 'security'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<ConfigItem | null>(null);
  const [editingConfig, setEditingConfig] = useState<Partial<ConfigItem>>({});
  const [importData, setImportData] = useState('');

  useEffect(() => {
    loadConfigs();
    loadConfigGroups();
    loadConfigHistory();
  }, []);

  const loadConfigs = async () => {
    try {
      const storedConfigs = await AsyncStorage.getItem('app_configs');
      if (storedConfigs) {
        const parsedConfigs = JSON.parse(storedConfigs).map((config: any) => ({
          ...config,
          lastModified: new Date(config.lastModified),
        }));
        setConfigs(parsedConfigs);
      } else {
        // 初始化默认配置
        const defaultConfigs: ConfigItem[] = [
          {
            id: '1',
            key: 'app.name',
            value: 'City Work',
            type: 'string',
            category: 'app',
            description: '应用程序名称',
            required: true,
            sensitive: false,
            defaultValue: 'City Work',
            lastModified: new Date(),
            modifiedBy: 'system',
          },
          {
            id: '2',
            key: 'app.version',
            value: '1.0.0',
            type: 'string',
            category: 'app',
            description: '应用程序版本',
            required: true,
            sensitive: false,
            defaultValue: '1.0.0',
            lastModified: new Date(),
            modifiedBy: 'system',
          },
          {
            id: '3',
            key: 'api.baseUrl',
            value: 'https://api.citywork.com',
            type: 'string',
            category: 'api',
            description: 'API基础URL',
            required: true,
            sensitive: false,
            defaultValue: 'https://api.citywork.com',
            validation: {
              pattern: '^https?://.+',
            },
            lastModified: new Date(),
            modifiedBy: 'system',
          },
          {
            id: '4',
            key: 'api.timeout',
            value: 30000,
            type: 'number',
            category: 'api',
            description: 'API请求超时时间（毫秒）',
            required: true,
            sensitive: false,
            defaultValue: 30000,
            validation: {
              min: 1000,
              max: 60000,
            },
            lastModified: new Date(),
            modifiedBy: 'system',
          },
          {
            id: '5',
            key: 'api.retryAttempts',
            value: 3,
            type: 'number',
            category: 'api',
            description: 'API请求重试次数',
            required: true,
            sensitive: false,
            defaultValue: 3,
            validation: {
              min: 0,
              max: 10,
            },
            lastModified: new Date(),
            modifiedBy: 'system',
          },
          {
            id: '6',
            key: 'ui.theme',
            value: 'auto',
            type: 'string',
            category: 'ui',
            description: '应用主题',
            required: true,
            sensitive: false,
            defaultValue: 'auto',
            validation: {
              options: ['light', 'dark', 'auto'],
            },
            lastModified: new Date(),
            modifiedBy: 'system',
          },
          {
            id: '7',
            key: 'ui.language',
            value: 'zh-CN',
            type: 'string',
            category: 'ui',
            description: '应用语言',
            required: true,
            sensitive: false,
            defaultValue: 'zh-CN',
            validation: {
              options: ['zh-CN', 'en-US', 'ja-JP'],
            },
            lastModified: new Date(),
            modifiedBy: 'system',
          },
          {
            id: '8',
            key: 'performance.enableCache',
            value: true,
            type: 'boolean',
            category: 'performance',
            description: '启用缓存',
            required: true,
            sensitive: false,
            defaultValue: true,
            lastModified: new Date(),
            modifiedBy: 'system',
          },
          {
            id: '9',
            key: 'performance.cacheSize',
            value: 50,
            type: 'number',
            category: 'performance',
            description: '缓存大小（MB）',
            required: true,
            sensitive: false,
            defaultValue: 50,
            validation: {
              min: 10,
              max: 500,
            },
            lastModified: new Date(),
            modifiedBy: 'system',
          },
          {
            id: '10',
            key: 'security.enableEncryption',
            value: true,
            type: 'boolean',
            category: 'security',
            description: '启用数据加密',
            required: true,
            sensitive: false,
            defaultValue: true,
            lastModified: new Date(),
            modifiedBy: 'system',
          },
          {
            id: '11',
            key: 'security.apiKey',
            value: 'sk-1234567890abcdef',
            type: 'string',
            category: 'security',
            description: 'API密钥',
            required: true,
            sensitive: true,
            defaultValue: '',
            lastModified: new Date(),
            modifiedBy: 'system',
          },
          {
            id: '12',
            key: 'features.enabledFeatures',
            value: ['chat', 'notifications', 'analytics'],
            type: 'array',
            category: 'app',
            description: '启用的功能列表',
            required: true,
            sensitive: false,
            defaultValue: [],
            lastModified: new Date(),
            modifiedBy: 'system',
          },
        ];
        setConfigs(defaultConfigs);
        await AsyncStorage.setItem('app_configs', JSON.stringify(defaultConfigs));
      }
    } catch (error) {
      console.error('加载配置失败:', error);
    }
  };

  const loadConfigGroups = async () => {
    try {
      const storedGroups = await AsyncStorage.getItem('config_groups');
      if (storedGroups) {
        setConfigGroups(JSON.parse(storedGroups));
      } else {
        const defaultGroups: ConfigGroup[] = [
          {
            id: '1',
            name: '应用设置',
            description: '应用程序基本配置',
            items: ['1', '2', '12'],
            collapsed: false,
          },
          {
            id: '2',
            name: 'API配置',
            description: 'API相关配置',
            items: ['3', '4', '5'],
            collapsed: false,
          },
          {
            id: '3',
            name: '用户界面',
            description: 'UI相关配置',
            items: ['6', '7'],
            collapsed: false,
          },
          {
            id: '4',
            name: '性能优化',
            description: '性能相关配置',
            items: ['8', '9'],
            collapsed: false,
          },
          {
            id: '5',
            name: '安全设置',
            description: '安全相关配置',
            items: ['10', '11'],
            collapsed: false,
          },
        ];
        setConfigGroups(defaultGroups);
        await AsyncStorage.setItem('config_groups', JSON.stringify(defaultGroups));
      }
    } catch (error) {
      console.error('加载配置组失败:', error);
    }
  };

  const loadConfigHistory = async () => {
    try {
      const storedHistory = await AsyncStorage.getItem('config_history');
      if (storedHistory) {
        const parsedHistory = JSON.parse(storedHistory).map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        }));
        setConfigHistory(parsedHistory);
      }
    } catch (error) {
      console.error('加载配置历史失败:', error);
    }
  };

  const saveConfigs = async (updatedConfigs: ConfigItem[]) => {
    try {
      await AsyncStorage.setItem('app_configs', JSON.stringify(updatedConfigs));
      setConfigs(updatedConfigs);
    } catch (error) {
      console.error('保存配置失败:', error);
    }
  };

  const updateConfig = async (configId: string, newValue: any) => {
    const config = configs.find(c => c.id === configId);
    if (!config) return;

    // 验证新值
    if (!validateConfigValue(config, newValue)) {
      Alert.alert('验证失败', '配置值不符合验证规则');
      return;
    }

    // 添加历史记录
    const historyEntry: ConfigHistory = {
      id: Date.now().toString(),
      configId: configId,
      oldValue: config.value,
      newValue: newValue,
      timestamp: new Date(),
      user: 'current_user',
      reason: '手动更新',
    };

    setConfigHistory(prev => [historyEntry, ...prev]);

    // 更新配置
    const updatedConfigs = configs.map(c =>
      c.id === configId
        ? { ...c, value: newValue, lastModified: new Date(), modifiedBy: 'current_user' }
        : c
    );

    await saveConfigs(updatedConfigs);
  };

  const validateConfigValue = (config: ConfigItem, value: any): boolean => {
    if (config.required && (value === null || value === undefined || value === '')) {
      return false;
    }

    if (config.validation) {
      const { min, max, pattern, options } = config.validation;

      if (config.type === 'number') {
        const numValue = Number(value);
        if (isNaN(numValue)) return false;
        if (min !== undefined && numValue < min) return false;
        if (max !== undefined && numValue > max) return false;
      }

      if (config.type === 'string' && pattern) {
        const regex = new RegExp(pattern);
        if (!regex.test(value)) return false;
      }

      if (options && !options.includes(value)) {
        return false;
      }
    }

    return true;
  };

  const createConfig = async () => {
    if (!editingConfig.key || editingConfig.value === undefined) {
      Alert.alert('错误', '请填写配置键和值');
      return;
    }

    const newConfig: ConfigItem = {
      id: Date.now().toString(),
      key: editingConfig.key!,
      value: editingConfig.value,
      type: editingConfig.type || 'string',
      category: editingConfig.category || 'app',
      description: editingConfig.description || '',
      required: editingConfig.required || false,
      sensitive: editingConfig.sensitive || false,
      defaultValue: editingConfig.defaultValue || editingConfig.value,
      validation: editingConfig.validation,
      lastModified: new Date(),
      modifiedBy: 'current_user',
    };

    const updatedConfigs = [...configs, newConfig];
    await saveConfigs(updatedConfigs);

    setEditingConfig({});
    setShowCreateModal(false);
  };

  const deleteConfig = async (configId: string) => {
    Alert.alert(
      '删除确认',
      '确定要删除这个配置项吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            const updatedConfigs = configs.filter(c => c.id !== configId);
            await saveConfigs(updatedConfigs);
          },
        },
      ]
    );
  };

  const exportConfigs = () => {
    const exportData = {
      configs: configs,
      groups: configGroups,
      timestamp: new Date().toISOString(),
      version: '1.0',
    };
    const jsonData = JSON.stringify(exportData, null, 2);
    Alert.alert('导出配置', '配置数据已准备导出');
    // 这里可以实现实际的导出功能
  };

  const importConfigs = async () => {
    try {
      const importedData = JSON.parse(importData);
      if (importedData.configs && Array.isArray(importedData.configs)) {
        await saveConfigs(importedData.configs);
        if (importedData.groups) {
          setConfigGroups(importedData.groups);
          await AsyncStorage.setItem('config_groups', JSON.stringify(importedData.groups));
        }
        setImportData('');
        setShowImportModal(false);
        Alert.alert('导入成功', '配置已成功导入');
      } else {
        Alert.alert('导入失败', '无效的配置数据格式');
      }
    } catch (error) {
      Alert.alert('导入失败', '配置数据解析错误');
    }
  };

  const resetToDefaults = () => {
    Alert.alert(
      '重置确认',
      '确定要重置所有配置到默认值吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '重置',
          style: 'destructive',
          onPress: async () => {
            const resetConfigs = configs.map(config => ({
              ...config,
              value: config.defaultValue,
              lastModified: new Date(),
              modifiedBy: 'system',
            }));
            await saveConfigs(resetConfigs);
          },
        },
      ]
    );
  };

  const toggleGroup = (groupId: string) => {
    const updatedGroups = configGroups.map(group =>
      group.id === groupId ? { ...group, collapsed: !group.collapsed } : group
    );
    setConfigGroups(updatedGroups);
  };

  const filteredConfigs = configs.filter(config => {
    const matchesCategory = selectedCategory === 'all' || config.category === selectedCategory;
    const matchesSearch = config.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         config.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'app':
        return '#2196F3';
      case 'api':
        return '#4CAF50';
      case 'ui':
        return '#9C27B0';
      case 'performance':
        return '#FF9800';
      case 'security':
        return '#F44336';
      default:
        return theme.colors.textSecondary;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'app':
        return 'apps';
      case 'api':
        return 'cloud';
      case 'ui':
        return 'color-palette';
      case 'performance':
        return 'speedometer';
      case 'security':
        return 'shield';
      default:
        return 'settings';
    }
  };

  const renderConfigValue = (config: ConfigItem) => {
    if (config.sensitive) {
      return '••••••••';
    }

    switch (config.type) {
      case 'boolean':
        return (
          <Switch
            value={config.value}
            onValueChange={(value) => updateConfig(config.id, value)}
            trackColor={{ false: '#E0E0E0', true: theme.colors.primary }}
            thumbColor={config.value ? '#FFFFFF' : '#F4F3F4'}
          />
        );
      case 'array':
        return `[${config.value.length} 项]`;
      case 'object':
        return '{...}';
      default:
        return config.value?.toString() || '';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* 头部 */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          配置管理
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
            onPress={exportConfigs}
          >
            <Ionicons name="download" size={16} color={theme.colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerButton, { borderColor: theme.colors.primary }]}
            onPress={() => setShowImportModal(true)}
          >
            <Ionicons name="cloud-upload" size={16} color={theme.colors.primary} />
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
            placeholder="搜索配置项..."
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
        {(['all', 'app', 'api', 'ui', 'performance', 'security'] as const).map((category) => (
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

      {/* 配置列表 */}
      <ScrollView style={styles.configsList}>
        {configGroups.map((group) => {
          const groupConfigs = filteredConfigs.filter(config => group.items.includes(config.id));
          if (groupConfigs.length === 0) return null;

          return (
            <View key={group.id} style={styles.configGroup}>
              <TouchableOpacity
                style={styles.groupHeader}
                onPress={() => toggleGroup(group.id)}
              >
                <View style={styles.groupInfo}>
                  <Text style={[styles.groupName, { color: theme.colors.text }]}>
                    {group.name}
                  </Text>
                  <Text style={[styles.groupDescription, { color: theme.colors.textSecondary }]}>
                    {group.description}
                  </Text>
                </View>
                <Ionicons
                  name={group.collapsed ? 'chevron-down' : 'chevron-up'}
                  size={20}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>

              {!group.collapsed && (
                <View style={styles.groupContent}>
                  {groupConfigs.map((config) => (
                    <View
                      key={config.id}
                      style={[styles.configItem, { backgroundColor: theme.colors.surface }]}
                    >
                      <View style={styles.configHeader}>
                        <View style={styles.configInfo}>
                          <View style={styles.configTitleRow}>
                            <Text style={[styles.configKey, { color: theme.colors.text }]}>
                              {config.key}
                            </Text>
                            <View
                              style={[
                                styles.categoryBadge,
                                { backgroundColor: getCategoryColor(config.category) },
                              ]}
                            >
                              <Ionicons
                                name={getCategoryIcon(config.category) as any}
                                size={10}
                                color="#FFFFFF"
                              />
                              <Text style={styles.categoryBadgeText}>
                                {config.category.toUpperCase()}
                              </Text>
                            </View>
                            {config.required && (
                              <View style={styles.requiredBadge}>
                                <Text style={styles.requiredBadgeText}>必需</Text>
                              </View>
                            )}
                            {config.sensitive && (
                              <View style={styles.sensitiveBadge}>
                                <Ionicons name="eye-off" size={10} color="#FFFFFF" />
                              </View>
                            )}
                          </View>
                          <Text style={[styles.configDescription, { color: theme.colors.textSecondary }]}>
                            {config.description}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.configValue}>
                        <Text style={[styles.configType, { color: theme.colors.textSecondary }]}>
                          {config.type}
                        </Text>
                        <View style={styles.valueContainer}>
                          {config.type === 'boolean' ? (
                            renderConfigValue(config)
                          ) : (
                            <TouchableOpacity
                              style={styles.valueButton}
                              onPress={() => {
                                setSelectedConfig(config);
                                setEditingConfig(config);
                                setShowEditModal(true);
                              }}
                            >
                              <Text style={[styles.valueText, { color: theme.colors.text }]}>
                                {renderConfigValue(config)}
                              </Text>
                              <Ionicons name="create" size={16} color={theme.colors.textSecondary} />
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>

                      <View style={styles.configMeta}>
                        <Text style={[styles.configMetaText, { color: theme.colors.textSecondary }]}>
                          最后修改: {config.lastModified.toLocaleString()} by {config.modifiedBy}
                        </Text>
                        <TouchableOpacity
                          style={[styles.deleteButton, { borderColor: '#F44336' }]}
                          onPress={() => deleteConfig(config.id)}
                        >
                          <Ionicons name="trash" size={14} color="#F44336" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* 底部操作 */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={[styles.bottomButton, { backgroundColor: theme.colors.surface }]}
          onPress={resetToDefaults}
        >
          <Ionicons name="refresh" size={20} color="#F44336" />
          <Text style={[styles.bottomButtonText, { color: '#F44336' }]}>
            重置默认
          </Text>
        </TouchableOpacity>
      </View>

      {/* 创建/编辑配置模态框 */}
      <Modal
        visible={showCreateModal || showEditModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setShowCreateModal(false);
          setShowEditModal(false);
          setEditingConfig({});
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              {showCreateModal ? '创建配置' : '编辑配置'}
            </Text>
            
            <ScrollView style={styles.editForm}>
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: theme.colors.text }]}>
                  配置键 *
                </Text>
                <TextInput
                  style={[styles.formInput, { 
                    backgroundColor: theme.colors.background,
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                  }]}
                  value={editingConfig.key}
                  onChangeText={(text) => setEditingConfig(prev => ({ ...prev, key: text }))}
                  placeholder="输入配置键"
                  placeholderTextColor={theme.colors.textSecondary}
                  editable={showCreateModal}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: theme.colors.text }]}>
                  配置值 *
                </Text>
                <TextInput
                  style={[styles.formInput, { 
                    backgroundColor: theme.colors.background,
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                  }]}
                  value={editingConfig.value?.toString()}
                  onChangeText={(text) => {
                    let value: any = text;
                    if (editingConfig.type === 'number') {
                      value = Number(text);
                    } else if (editingConfig.type === 'boolean') {
                      value = text === 'true';
                    }
                    setEditingConfig(prev => ({ ...prev, value }));
                  }}
                  placeholder="输入配置值"
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
                  value={editingConfig.description}
                  onChangeText={(text) => setEditingConfig(prev => ({ ...prev, description: text }))}
                  placeholder="输入配置描述"
                  placeholderTextColor={theme.colors.textSecondary}
                  multiline
                  numberOfLines={3}
                />
              </View>

              {showCreateModal && (
                <>
                  <View style={styles.formGroup}>
                    <Text style={[styles.formLabel, { color: theme.colors.text }]}>
                      类型
                    </Text>
                    <View style={styles.typeSelector}>
                      {(['string', 'number', 'boolean', 'object', 'array'] as const).map((type) => (
                        <TouchableOpacity
                          key={type}
                          style={[
                            styles.typeSelectorButton,
                            {
                              backgroundColor: editingConfig.type === type
                                ? theme.colors.primary
                                : theme.colors.background,
                              borderColor: theme.colors.primary,
                            },
                          ]}
                          onPress={() => setEditingConfig(prev => ({ ...prev, type }))}
                        >
                          <Text
                            style={[
                              styles.typeSelectorText,
                              {
                                color: editingConfig.type === type
                                  ? '#FFFFFF'
                                  : theme.colors.primary,
                              },
                            ]}
                          >
                            {type}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={[styles.formLabel, { color: theme.colors.text }]}>
                      分类
                    </Text>
                    <View style={styles.categorySelector}>
                      {(['app', 'api', 'ui', 'performance', 'security'] as const).map((category) => (
                        <TouchableOpacity
                          key={category}
                          style={[
                            styles.categorySelectorButton,
                            {
                              backgroundColor: editingConfig.category === category
                                ? getCategoryColor(category)
                                : theme.colors.background,
                              borderColor: getCategoryColor(category),
                            },
                          ]}
                          onPress={() => setEditingConfig(prev => ({ ...prev, category }))}
                        >
                          <Text
                            style={[
                              styles.categorySelectorText,
                              {
                                color: editingConfig.category === category
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
                        必需配置
                      </Text>
                      <Switch
                        value={editingConfig.required}
                        onValueChange={(required) => setEditingConfig(prev => ({ ...prev, required }))}
                        trackColor={{ false: '#E0E0E0', true: theme.colors.primary }}
                        thumbColor={editingConfig.required ? '#FFFFFF' : '#F4F3F4'}
                      />
                    </View>
                  </View>

                  <View style={styles.formGroup}>
                    <View style={styles.switchRow}>
                      <Text style={[styles.formLabel, { color: theme.colors.text }]}>
                        敏感数据
                      </Text>
                      <Switch
                        value={editingConfig.sensitive}
                        onValueChange={(sensitive) => setEditingConfig(prev => ({ ...prev, sensitive }))}
                        trackColor={{ false: '#E0E0E0', true: theme.colors.primary }}
                        thumbColor={editingConfig.sensitive ? '#FFFFFF' : '#F4F3F4'}
                      />
                    </View>
                  </View>
                </>
              )}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.colors.background }]}
                onPress={() => {
                  setShowCreateModal(false);
                  setShowEditModal(false);
                  setEditingConfig({});
                }}
              >
                <Text style={[styles.modalButtonText, { color: theme.colors.text }]}>
                  取消
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.colors.primary }]}
                onPress={showCreateModal ? createConfig : () => {
                  if (selectedConfig && editingConfig.value !== undefined) {
                    updateConfig(selectedConfig.id, editingConfig.value);
                    setShowEditModal(false);
                    setEditingConfig({});
                  }
                }}
              >
                <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>
                  {showCreateModal ? '创建' : '保存'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 导入配置模态框 */}
      <Modal
        visible={showImportModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowImportModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              导入配置
            </Text>
            
            <View style={styles.importForm}>
              <Text style={[styles.formLabel, { color: theme.colors.text }]}>
                配置数据 (JSON格式)
              </Text>
              <TextInput
                style={[styles.formInput, styles.importTextArea, { 
                  backgroundColor: theme.colors.background,
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                }]}
                value={importData}
                onChangeText={setImportData}
                placeholder="粘贴配置JSON数据..."
                placeholderTextColor={theme.colors.textSecondary}
                multiline
                numberOfLines={10}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.colors.background }]}
                onPress={() => setShowImportModal(false)}
              >
                <Text style={[styles.modalButtonText, { color: theme.colors.text }]}>
                  取消
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.colors.primary }]}
                onPress={importConfigs}
              >
                <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>
                  导入
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
              配置历史
            </Text>
            
            <ScrollView style={styles.historyList}>
              {configHistory.map((entry) => {
                const config = configs.find(c => c.id === entry.configId);
                return (
                  <View
                    key={entry.id}
                    style={[styles.historyItem, { backgroundColor: theme.colors.background }]}
                  >
                    <View style={styles.historyHeader}>
                      <Text style={[styles.historyConfig, { color: theme.colors.text }]}>
                        {config?.key || '未知配置'}
                      </Text>
                      <Text style={[styles.historyTimestamp, { color: theme.colors.textSecondary }]}>
                        {entry.timestamp.toLocaleString()}
                      </Text>
                    </View>
                    <View style={styles.historyChange}>
                      <Text style={[styles.historyValue, { color: '#F44336' }]}>
                        旧值: {JSON.stringify(entry.oldValue)}
                      </Text>
                      <Text style={[styles.historyValue, { color: '#4CAF50' }]}>
                        新值: {JSON.stringify(entry.newValue)}
                      </Text>
                    </View>
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
  configsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  configGroup: {
    marginBottom: 16,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  groupDescription: {
    fontSize: 14,
  },
  groupContent: {
    gap: 8,
  },
  configItem: {
    padding: 16,
    borderRadius: 12,
  },
  configHeader: {
    marginBottom: 12,
  },
  configInfo: {
    flex: 1,
  },
  configTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
    flexWrap: 'wrap',
  },
  configKey: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 2,
  },
  categoryBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '600',
  },
  requiredBadge: {
    backgroundColor: '#F44336',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 8,
  },
  requiredBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '600',
  },
  sensitiveBadge: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 8,
  },
  configDescription: {
    fontSize: 12,
  },
  configValue: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  configType: {
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  valueContainer: {
    flex: 1,
    marginLeft: 12,
  },
  valueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  valueText: {
    fontSize: 14,
    fontFamily: 'monospace',
    flex: 1,
  },
  configMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  configMetaText: {
    fontSize: 10,
    flex: 1,
  },
  deleteButton: {
    padding: 4,
    borderWidth: 1,
    borderRadius: 4,
  },
  bottomActions: {
    padding: 16,
  },
  bottomButton: {
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
  editForm: {
    maxHeight: 400,
  },
  importForm: {
    marginBottom: 16,
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
  importTextArea: {
    height: 200,
    textAlignVertical: 'top',
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeSelectorButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 16,
  },
  typeSelectorText: {
    fontSize: 12,
    fontWeight: '500',
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
    marginBottom: 8,
  },
  historyConfig: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  historyTimestamp: {
    fontSize: 12,
  },
  historyChange: {
    marginBottom: 4,
  },
  historyValue: {
    fontSize: 12,
    fontFamily: 'monospace',
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

export default ConfigManager;