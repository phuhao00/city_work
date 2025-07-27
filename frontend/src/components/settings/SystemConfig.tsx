import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

interface SystemConfigProps {
  navigation?: any;
}

interface SystemSettings {
  // 应用设置
  app: {
    version: string;
    buildNumber: string;
    environment: 'development' | 'staging' | 'production';
    debugMode: boolean;
    crashReporting: boolean;
    analytics: boolean;
  };
  
  // 性能设置
  performance: {
    cacheEnabled: boolean;
    cacheSize: number; // MB
    imageQuality: 'low' | 'medium' | 'high';
    animationsEnabled: boolean;
    preloadData: boolean;
    backgroundSync: boolean;
  };
  
  // 网络设置
  network: {
    timeout: number; // seconds
    retryAttempts: number;
    offlineMode: boolean;
    compressionEnabled: boolean;
    cdnEnabled: boolean;
  };
  
  // 安全设置
  security: {
    biometricAuth: boolean;
    autoLock: boolean;
    autoLockTime: number; // minutes
    sessionTimeout: number; // minutes
    encryptLocalData: boolean;
    allowScreenshots: boolean;
  };
  
  // 开发者设置
  developer: {
    showPerformanceOverlay: boolean;
    enableLogging: boolean;
    logLevel: 'error' | 'warn' | 'info' | 'debug';
    mockData: boolean;
    apiEndpoint: string;
  };
}

const SystemConfig: React.FC<SystemConfigProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const [settings, setSettings] = useState<SystemSettings>({
    app: {
      version: '1.0.0',
      buildNumber: '100',
      environment: 'production',
      debugMode: false,
      crashReporting: true,
      analytics: true,
    },
    performance: {
      cacheEnabled: true,
      cacheSize: 100,
      imageQuality: 'medium',
      animationsEnabled: true,
      preloadData: true,
      backgroundSync: true,
    },
    network: {
      timeout: 30,
      retryAttempts: 3,
      offlineMode: false,
      compressionEnabled: true,
      cdnEnabled: true,
    },
    security: {
      biometricAuth: false,
      autoLock: true,
      autoLockTime: 5,
      sessionTimeout: 30,
      encryptLocalData: true,
      allowScreenshots: true,
    },
    developer: {
      showPerformanceOverlay: false,
      enableLogging: true,
      logLevel: 'info',
      mockData: false,
      apiEndpoint: 'https://api.citywork.com/v1',
    },
  });

  const [showDeveloperOptions, setShowDeveloperOptions] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSetting, setSelectedSetting] = useState<any>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // 从AsyncStorage或配置文件加载设置
      // const savedSettings = await AsyncStorage.getItem('systemSettings');
      // if (savedSettings) {
      //   setSettings(JSON.parse(savedSettings));
      // }
    } catch (error) {
      console.error('加载系统设置失败:', error);
    }
  };

  const saveSettings = async (newSettings: SystemSettings) => {
    try {
      setSettings(newSettings);
      // await AsyncStorage.setItem('systemSettings', JSON.stringify(newSettings));
      Alert.alert('成功', '设置已保存');
    } catch (error) {
      console.error('保存系统设置失败:', error);
      Alert.alert('错误', '保存设置失败');
    }
  };

  const handleVersionTap = () => {
    const newTapCount = tapCount + 1;
    setTapCount(newTapCount);
    
    if (newTapCount >= 7) {
      setShowDeveloperOptions(true);
      setTapCount(0);
      Alert.alert('开发者选项', '开发者选项已启用');
    }
  };

  const resetToDefaults = () => {
    Alert.alert(
      '重置设置',
      '确定要重置所有设置到默认值吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确定',
          style: 'destructive',
          onPress: () => {
            const defaultSettings: SystemSettings = {
              app: {
                version: '1.0.0',
                buildNumber: '100',
                environment: 'production',
                debugMode: false,
                crashReporting: true,
                analytics: true,
              },
              performance: {
                cacheEnabled: true,
                cacheSize: 100,
                imageQuality: 'medium',
                animationsEnabled: true,
                preloadData: true,
                backgroundSync: true,
              },
              network: {
                timeout: 30,
                retryAttempts: 3,
                offlineMode: false,
                compressionEnabled: true,
                cdnEnabled: true,
              },
              security: {
                biometricAuth: false,
                autoLock: true,
                autoLockTime: 5,
                sessionTimeout: 30,
                encryptLocalData: true,
                allowScreenshots: true,
              },
              developer: {
                showPerformanceOverlay: false,
                enableLogging: true,
                logLevel: 'info',
                mockData: false,
                apiEndpoint: 'https://api.citywork.com/v1',
              },
            };
            saveSettings(defaultSettings);
          },
        },
      ]
    );
  };

  const exportSettings = () => {
    const settingsJson = JSON.stringify(settings, null, 2);
    Alert.alert(
      '导出设置',
      '设置已复制到剪贴板',
      [{ text: '确定' }]
    );
    // 这里可以实现复制到剪贴板的功能
  };

  const clearCache = () => {
    Alert.alert(
      '清除缓存',
      '确定要清除所有缓存数据吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确定',
          onPress: () => {
            // 实现清除缓存的逻辑
            Alert.alert('成功', '缓存已清除');
          },
        },
      ]
    );
  };

  const renderToggleSetting = (
    title: string,
    description: string,
    value: boolean,
    onToggle: () => void,
    icon?: string
  ) => (
    <View style={[styles.settingItem, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.settingContent}>
        {icon && (
          <Ionicons
            name={icon as any}
            size={24}
            color={theme.colors.primary}
            style={styles.settingIcon}
          />
        )}
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
            {title}
          </Text>
          <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
            {description}
          </Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#E0E0E0', true: theme.colors.primary }}
        thumbColor={value ? '#FFFFFF' : '#F4F3F4'}
      />
    </View>
  );

  const renderSelectSetting = (
    title: string,
    description: string,
    value: string,
    options: Array<{ label: string; value: string }>,
    onSelect: (value: string) => void,
    icon?: string
  ) => (
    <TouchableOpacity
      style={[styles.settingItem, { backgroundColor: theme.colors.surface }]}
      onPress={() => {
        setSelectedSetting({ title, options, onSelect, currentValue: value });
        setModalVisible(true);
      }}
    >
      <View style={styles.settingContent}>
        {icon && (
          <Ionicons
            name={icon as any}
            size={24}
            color={theme.colors.primary}
            style={styles.settingIcon}
          />
        )}
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
            {title}
          </Text>
          <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
            {description}
          </Text>
        </View>
      </View>
      <View style={styles.settingValue}>
        <Text style={[styles.valueText, { color: theme.colors.text }]}>
          {options.find(opt => opt.value === value)?.label || value}
        </Text>
        <Ionicons
          name="chevron-forward"
          size={20}
          color={theme.colors.textSecondary}
        />
      </View>
    </TouchableOpacity>
  );

  const renderNumberSetting = (
    title: string,
    description: string,
    value: number,
    unit: string,
    onChangeValue: (value: number) => void,
    icon?: string
  ) => (
    <View style={[styles.settingItem, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.settingContent}>
        {icon && (
          <Ionicons
            name={icon as any}
            size={24}
            color={theme.colors.primary}
            style={styles.settingIcon}
          />
        )}
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
            {title}
          </Text>
          <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
            {description}
          </Text>
        </View>
      </View>
      <View style={styles.numberInput}>
        <TextInput
          style={[styles.numberInputField, { 
            color: theme.colors.text,
            borderColor: theme.colors.border 
          }]}
          value={value.toString()}
          onChangeText={(text) => {
            const num = parseInt(text) || 0;
            onChangeValue(num);
          }}
          keyboardType="numeric"
        />
        <Text style={[styles.unitText, { color: theme.colors.textSecondary }]}>
          {unit}
        </Text>
      </View>
    </View>
  );

  const renderActionButton = (
    title: string,
    description: string,
    onPress: () => void,
    icon: string,
    color?: string
  ) => (
    <TouchableOpacity
      style={[styles.actionButton, { backgroundColor: theme.colors.surface }]}
      onPress={onPress}
    >
      <Ionicons
        name={icon as any}
        size={24}
        color={color || theme.colors.primary}
        style={styles.actionIcon}
      />
      <View style={styles.actionText}>
        <Text style={[styles.actionTitle, { color: theme.colors.text }]}>
          {title}
        </Text>
        <Text style={[styles.actionDescription, { color: theme.colors.textSecondary }]}>
          {description}
        </Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={20}
        color={theme.colors.textSecondary}
      />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* 应用信息 */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          应用信息
        </Text>
        
        <TouchableOpacity
          style={[styles.infoItem, { backgroundColor: theme.colors.surface }]}
          onPress={handleVersionTap}
        >
          <Text style={[styles.infoLabel, { color: theme.colors.text }]}>版本</Text>
          <Text style={[styles.infoValue, { color: theme.colors.textSecondary }]}>
            {settings.app.version} ({settings.app.buildNumber})
          </Text>
        </TouchableOpacity>

        <View style={[styles.infoItem, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.infoLabel, { color: theme.colors.text }]}>环境</Text>
          <Text style={[styles.infoValue, { color: theme.colors.textSecondary }]}>
            {settings.app.environment}
          </Text>
        </View>
      </View>

      {/* 性能设置 */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          性能设置
        </Text>

        {renderToggleSetting(
          '启用缓存',
          '缓存数据以提高应用性能',
          settings.performance.cacheEnabled,
          () => {
            const newSettings = {
              ...settings,
              performance: {
                ...settings.performance,
                cacheEnabled: !settings.performance.cacheEnabled,
              },
            };
            saveSettings(newSettings);
          },
          'flash'
        )}

        {renderNumberSetting(
          '缓存大小',
          '设置最大缓存大小',
          settings.performance.cacheSize,
          'MB',
          (value) => {
            const newSettings = {
              ...settings,
              performance: {
                ...settings.performance,
                cacheSize: value,
              },
            };
            saveSettings(newSettings);
          },
          'archive'
        )}

        {renderSelectSetting(
          '图片质量',
          '选择图片显示质量',
          settings.performance.imageQuality,
          [
            { label: '低', value: 'low' },
            { label: '中', value: 'medium' },
            { label: '高', value: 'high' },
          ],
          (value) => {
            const newSettings = {
              ...settings,
              performance: {
                ...settings.performance,
                imageQuality: value as 'low' | 'medium' | 'high',
              },
            };
            saveSettings(newSettings);
          },
          'image'
        )}

        {renderToggleSetting(
          '启用动画',
          '显示界面过渡动画',
          settings.performance.animationsEnabled,
          () => {
            const newSettings = {
              ...settings,
              performance: {
                ...settings.performance,
                animationsEnabled: !settings.performance.animationsEnabled,
              },
            };
            saveSettings(newSettings);
          },
          'play'
        )}
      </View>

      {/* 网络设置 */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          网络设置
        </Text>

        {renderNumberSetting(
          '请求超时',
          '网络请求超时时间',
          settings.network.timeout,
          '秒',
          (value) => {
            const newSettings = {
              ...settings,
              network: {
                ...settings.network,
                timeout: value,
              },
            };
            saveSettings(newSettings);
          },
          'time'
        )}

        {renderNumberSetting(
          '重试次数',
          '网络请求失败重试次数',
          settings.network.retryAttempts,
          '次',
          (value) => {
            const newSettings = {
              ...settings,
              network: {
                ...settings.network,
                retryAttempts: value,
              },
            };
            saveSettings(newSettings);
          },
          'refresh'
        )}

        {renderToggleSetting(
          '数据压缩',
          '启用网络数据压缩',
          settings.network.compressionEnabled,
          () => {
            const newSettings = {
              ...settings,
              network: {
                ...settings.network,
                compressionEnabled: !settings.network.compressionEnabled,
              },
            };
            saveSettings(newSettings);
          },
          'archive'
        )}
      </View>

      {/* 安全设置 */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          安全设置
        </Text>

        {renderToggleSetting(
          '生物识别认证',
          '使用指纹或面部识别',
          settings.security.biometricAuth,
          () => {
            const newSettings = {
              ...settings,
              security: {
                ...settings.security,
                biometricAuth: !settings.security.biometricAuth,
              },
            };
            saveSettings(newSettings);
          },
          'finger-print'
        )}

        {renderToggleSetting(
          '自动锁定',
          '应用进入后台时自动锁定',
          settings.security.autoLock,
          () => {
            const newSettings = {
              ...settings,
              security: {
                ...settings.security,
                autoLock: !settings.security.autoLock,
              },
            };
            saveSettings(newSettings);
          },
          'lock-closed'
        )}

        {renderNumberSetting(
          '会话超时',
          '用户会话超时时间',
          settings.security.sessionTimeout,
          '分钟',
          (value) => {
            const newSettings = {
              ...settings,
              security: {
                ...settings.security,
                sessionTimeout: value,
              },
            };
            saveSettings(newSettings);
          },
          'timer'
        )}

        {renderToggleSetting(
          '加密本地数据',
          '加密存储在设备上的数据',
          settings.security.encryptLocalData,
          () => {
            const newSettings = {
              ...settings,
              security: {
                ...settings.security,
                encryptLocalData: !settings.security.encryptLocalData,
              },
            };
            saveSettings(newSettings);
          },
          'shield-checkmark'
        )}
      </View>

      {/* 开发者选项 */}
      {showDeveloperOptions && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            开发者选项
          </Text>

          {renderToggleSetting(
            '性能覆盖层',
            '显示性能监控信息',
            settings.developer.showPerformanceOverlay,
            () => {
              const newSettings = {
                ...settings,
                developer: {
                  ...settings.developer,
                  showPerformanceOverlay: !settings.developer.showPerformanceOverlay,
                },
              };
              saveSettings(newSettings);
            },
            'speedometer'
          )}

          {renderToggleSetting(
            '启用日志',
            '记录应用运行日志',
            settings.developer.enableLogging,
            () => {
              const newSettings = {
                ...settings,
                developer: {
                  ...settings.developer,
                  enableLogging: !settings.developer.enableLogging,
                },
              };
              saveSettings(newSettings);
            },
            'document-text'
          )}

          {renderSelectSetting(
            '日志级别',
            '设置日志记录级别',
            settings.developer.logLevel,
            [
              { label: '错误', value: 'error' },
              { label: '警告', value: 'warn' },
              { label: '信息', value: 'info' },
              { label: '调试', value: 'debug' },
            ],
            (value) => {
              const newSettings = {
                ...settings,
                developer: {
                  ...settings.developer,
                  logLevel: value as 'error' | 'warn' | 'info' | 'debug',
                },
              };
              saveSettings(newSettings);
            },
            'list'
          )}

          {renderToggleSetting(
            '模拟数据',
            '使用模拟数据进行测试',
            settings.developer.mockData,
            () => {
              const newSettings = {
                ...settings,
                developer: {
                  ...settings.developer,
                  mockData: !settings.developer.mockData,
                },
              };
              saveSettings(newSettings);
            },
            'flask'
          )}
        </View>
      )}

      {/* 操作按钮 */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          系统操作
        </Text>

        {renderActionButton(
          '清除缓存',
          '清除所有缓存数据',
          clearCache,
          'trash',
          '#FF9800'
        )}

        {renderActionButton(
          '导出设置',
          '导出当前配置',
          exportSettings,
          'download',
          theme.colors.primary
        )}

        {renderActionButton(
          '重置设置',
          '恢复到默认配置',
          resetToDefaults,
          'refresh',
          '#F44336'
        )}
      </View>

      {/* 选择器模态框 */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              {selectedSetting?.title}
            </Text>
            {selectedSetting?.options.map((option: any) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionItem,
                  selectedSetting.currentValue === option.value && {
                    backgroundColor: theme.colors.primary + '20',
                  },
                ]}
                onPress={() => {
                  selectedSetting.onSelect(option.value);
                  setModalVisible(false);
                }}
              >
                <Text style={[styles.optionText, { color: theme.colors.text }]}>
                  {option.label}
                </Text>
                {selectedSetting.currentValue === option.value && (
                  <Ionicons
                    name="checkmark"
                    size={20}
                    color={theme.colors.primary}
                  />
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={[styles.cancelButtonText, { color: theme.colors.primary }]}>
                取消
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
  },
  settingValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueText: {
    fontSize: 14,
    marginRight: 8,
  },
  numberInput: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  numberInputField: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    width: 80,
    textAlign: 'center',
    marginRight: 8,
  },
  unitText: {
    fontSize: 14,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  actionIcon: {
    marginRight: 12,
  },
  actionText: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  actionDescription: {
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  optionText: {
    fontSize: 16,
  },
  cancelButton: {
    marginTop: 16,
    padding: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default SystemConfig;