import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
  TextInput,
  FlatList,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface SecuritySetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  type: 'switch' | 'action' | 'info';
  icon: string;
  category: 'account' | 'privacy' | 'data' | 'device';
  level: 'basic' | 'advanced' | 'enterprise';
}

interface PrivacySetting {
  id: string;
  title: string;
  description: string;
  value: 'public' | 'connections' | 'private';
  options: Array<{ value: string; label: string; description: string }>;
  icon: string;
}

interface SecurityLog {
  id: string;
  type: 'login' | 'password_change' | 'privacy_update' | 'data_access' | 'suspicious';
  title: string;
  description: string;
  timestamp: Date;
  location: string;
  device: string;
  status: 'success' | 'warning' | 'error';
  ip: string;
}

interface DataUsage {
  category: string;
  description: string;
  dataTypes: string[];
  purpose: string;
  retention: string;
  sharing: string[];
  userControl: string;
}

const SecurityPrivacyScreen: React.FC = () => {
  const { theme } = useTheme();
  const [securitySettings, setSecuritySettings] = useState<SecuritySetting[]>([]);
  const [privacySettings, setPrivacySettings] = useState<PrivacySetting[]>([]);
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([]);
  const [dataUsage, setDataUsage] = useState<DataUsage[]>([]);
  const [selectedTab, setSelectedTab] = useState<'security' | 'privacy' | 'logs' | 'data'>('security');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = async () => {
    try {
      // 模拟 API 调用
      setTimeout(() => {
        setSecuritySettings([
          {
            id: '1',
            title: '双因素认证 (2FA)',
            description: '为您的账户添加额外的安全层',
            enabled: true,
            type: 'switch',
            icon: 'shield-checkmark',
            category: 'account',
            level: 'basic',
          },
          {
            id: '2',
            title: '登录通知',
            description: '新设备登录时发送通知',
            enabled: true,
            type: 'switch',
            icon: 'notifications',
            category: 'account',
            level: 'basic',
          },
          {
            id: '3',
            title: '密码强度检查',
            description: '定期检查密码安全性',
            enabled: true,
            type: 'switch',
            icon: 'key',
            category: 'account',
            level: 'basic',
          },
          {
            id: '4',
            title: '更改密码',
            description: '定期更新您的登录密码',
            enabled: false,
            type: 'action',
            icon: 'lock-closed',
            category: 'account',
            level: 'basic',
          },
          {
            id: '5',
            title: '生物识别登录',
            description: '使用指纹或面部识别登录',
            enabled: false,
            type: 'switch',
            icon: 'finger-print',
            category: 'device',
            level: 'advanced',
          },
          {
            id: '6',
            title: '会话管理',
            description: '管理活跃的登录会话',
            enabled: false,
            type: 'action',
            icon: 'desktop',
            category: 'device',
            level: 'advanced',
          },
          {
            id: '7',
            title: '数据加密',
            description: '端到端加密您的敏感数据',
            enabled: true,
            type: 'switch',
            icon: 'lock-open',
            category: 'data',
            level: 'enterprise',
          },
          {
            id: '8',
            title: '安全审计',
            description: '定期进行安全漏洞扫描',
            enabled: true,
            type: 'switch',
            icon: 'search',
            category: 'account',
            level: 'enterprise',
          },
        ]);

        setPrivacySettings([
          {
            id: '1',
            title: '个人资料可见性',
            description: '控制谁可以查看您的个人资料',
            value: 'connections',
            options: [
              { value: 'public', label: '公开', description: '所有人都可以查看' },
              { value: 'connections', label: '仅连接', description: '只有您的连接可以查看' },
              { value: 'private', label: '私密', description: '只有您自己可以查看' },
            ],
            icon: 'person',
          },
          {
            id: '2',
            title: '联系信息',
            description: '控制谁可以看到您的联系方式',
            value: 'connections',
            options: [
              { value: 'public', label: '公开', description: '所有人都可以查看' },
              { value: 'connections', label: '仅连接', description: '只有您的连接可以查看' },
              { value: 'private', label: '私密', description: '只有您自己可以查看' },
            ],
            icon: 'call',
          },
          {
            id: '3',
            title: '工作经历',
            description: '控制工作经历的可见性',
            value: 'public',
            options: [
              { value: 'public', label: '公开', description: '所有人都可以查看' },
              { value: 'connections', label: '仅连接', description: '只有您的连接可以查看' },
              { value: 'private', label: '私密', description: '只有您自己可以查看' },
            ],
            icon: 'briefcase',
          },
          {
            id: '4',
            title: '活动状态',
            description: '控制在线状态的显示',
            value: 'connections',
            options: [
              { value: 'public', label: '公开', description: '所有人都可以看到' },
              { value: 'connections', label: '仅连接', description: '只有您的连接可以看到' },
              { value: 'private', label: '隐藏', description: '不显示在线状态' },
            ],
            icon: 'radio-button-on',
          },
          {
            id: '5',
            title: '搜索可见性',
            description: '控制是否出现在搜索结果中',
            value: 'public',
            options: [
              { value: 'public', label: '可搜索', description: '出现在搜索结果中' },
              { value: 'connections', label: '限制搜索', description: '只有连接可以搜索到您' },
              { value: 'private', label: '不可搜索', description: '不出现在搜索结果中' },
            ],
            icon: 'search',
          },
        ]);

        setSecurityLogs([
          {
            id: '1',
            type: 'login',
            title: '成功登录',
            description: '从新设备登录',
            timestamp: new Date(Date.now() - 1000 * 60 * 30),
            location: '北京, 中国',
            device: 'iPhone 15 Pro',
            status: 'success',
            ip: '192.168.1.100',
          },
          {
            id: '2',
            type: 'password_change',
            title: '密码已更改',
            description: '账户密码已成功更新',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
            location: '北京, 中国',
            device: 'MacBook Pro',
            status: 'success',
            ip: '192.168.1.101',
          },
          {
            id: '3',
            type: 'suspicious',
            title: '可疑登录尝试',
            description: '来自未知位置的登录尝试已被阻止',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
            location: '上海, 中国',
            device: '未知设备',
            status: 'warning',
            ip: '203.0.113.1',
          },
          {
            id: '4',
            type: 'privacy_update',
            title: '隐私设置更新',
            description: '个人资料可见性设置已更改',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
            location: '北京, 中国',
            device: 'iPad Air',
            status: 'success',
            ip: '192.168.1.102',
          },
          {
            id: '5',
            type: 'data_access',
            title: '数据导出请求',
            description: '您请求导出个人数据',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
            location: '北京, 中国',
            device: 'Chrome浏览器',
            status: 'success',
            ip: '192.168.1.100',
          },
        ]);

        setDataUsage([
          {
            category: '个人信息',
            description: '用于创建和维护您的个人资料',
            dataTypes: ['姓名', '邮箱', '电话', '头像', '工作经历'],
            purpose: '提供个性化服务和身份验证',
            retention: '账户存续期间',
            sharing: ['不与第三方分享'],
            userControl: '可随时查看、修改或删除',
          },
          {
            category: '使用数据',
            description: '用于改善服务质量和用户体验',
            dataTypes: ['访问日志', '搜索记录', '点击行为', '设备信息'],
            purpose: '分析用户行为，优化产品功能',
            retention: '12个月',
            sharing: ['匿名化后用于统计分析'],
            userControl: '可选择退出数据收集',
          },
          {
            category: '通信数据',
            description: '用于消息传递和通知服务',
            dataTypes: ['消息内容', '通话记录', '通知偏好'],
            purpose: '提供通信服务和重要通知',
            retention: '消息：30天，通话记录：90天',
            sharing: ['仅在法律要求时分享'],
            userControl: '可删除历史记录',
          },
          {
            category: '位置信息',
            description: '用于提供基于位置的服务',
            dataTypes: ['GPS坐标', 'IP地址', '时区信息'],
            purpose: '推荐附近的工作机会和活动',
            retention: '6个月',
            sharing: ['不与第三方分享精确位置'],
            userControl: '可随时关闭位置服务',
          },
        ]);

        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('加载安全数据失败:', error);
      Alert.alert('错误', '加载数据失败，请稍后重试');
      setLoading(false);
    }
  };

  const handleSecurityToggle = (settingId: string) => {
    setSecuritySettings(prev =>
      prev.map(setting =>
        setting.id === settingId
          ? { ...setting, enabled: !setting.enabled }
          : setting
      )
    );
  };

  const handlePrivacyChange = (settingId: string, value: string) => {
    setPrivacySettings(prev =>
      prev.map(setting =>
        setting.id === settingId
          ? { ...setting, value: value as any }
          : setting
      )
    );
  };

  const handlePasswordChange = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('错误', '请填写所有字段');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('错误', '新密码和确认密码不匹配');
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert('错误', '密码长度至少为8位');
      return;
    }

    // 模拟密码更改
    Alert.alert('成功', '密码已成功更改', [
      {
        text: '确定',
        onPress: () => {
          setShowPasswordModal(false);
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
        },
      },
    ]);
  };

  const handleSecurityAction = (settingId: string) => {
    switch (settingId) {
      case '4': // 更改密码
        setShowPasswordModal(true);
        break;
      case '6': // 会话管理
        Alert.alert(
          '活跃会话',
          '当前有3个活跃会话\n\n• iPhone 15 Pro (当前设备)\n• MacBook Pro (2小时前)\n• iPad Air (1天前)',
          [
            { text: '取消', style: 'cancel' },
            { text: '结束其他会话', onPress: () => Alert.alert('成功', '已结束其他设备的会话') },
          ]
        );
        break;
      default:
        break;
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (hours < 1) return '刚刚';
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    
    return timestamp.toLocaleDateString('zh-CN');
  };

  const getLogIcon = (type: SecurityLog['type']) => {
    switch (type) {
      case 'login':
        return 'log-in';
      case 'password_change':
        return 'key';
      case 'privacy_update':
        return 'shield';
      case 'data_access':
        return 'download';
      case 'suspicious':
        return 'warning';
      default:
        return 'information-circle';
    }
  };

  const getLogColor = (status: SecurityLog['status']) => {
    switch (status) {
      case 'success':
        return theme.success;
      case 'warning':
        return theme.warning;
      case 'error':
        return theme.error;
      default:
        return theme.primary;
    }
  };

  const renderSecuritySetting = ({ item: setting }: { item: SecuritySetting }) => (
    <View style={[styles.settingCard, { backgroundColor: theme.surface }]}>
      <View style={styles.settingHeader}>
        <View style={styles.settingIcon}>
          <Ionicons name={setting.icon as any} size={24} color={theme.primary} />
        </View>
        <View style={styles.settingInfo}>
          <View style={styles.settingTitleRow}>
            <Text style={[styles.settingTitle, { color: theme.text }]}>
              {setting.title}
            </Text>
            <View style={[
              styles.levelBadge,
              { backgroundColor: 
                setting.level === 'basic' ? theme.success + '20' :
                setting.level === 'advanced' ? theme.warning + '20' :
                theme.error + '20'
              }
            ]}>
              <Text style={[
                styles.levelText,
                { color: 
                  setting.level === 'basic' ? theme.success :
                  setting.level === 'advanced' ? theme.warning :
                  theme.error
                }
              ]}>
                {setting.level === 'basic' ? '基础' :
                 setting.level === 'advanced' ? '高级' : '企业'}
              </Text>
            </View>
          </View>
          <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
            {setting.description}
          </Text>
        </View>
        {setting.type === 'switch' ? (
          <Switch
            value={setting.enabled}
            onValueChange={() => handleSecurityToggle(setting.id)}
            trackColor={{ false: theme.border, true: theme.primary }}
            thumbColor={setting.enabled ? theme.background : theme.textSecondary}
          />
        ) : (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.primary }]}
            onPress={() => handleSecurityAction(setting.id)}
          >
            <Ionicons name="chevron-forward" size={16} color={theme.background} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderPrivacySetting = ({ item: setting }: { item: PrivacySetting }) => (
    <View style={[styles.settingCard, { backgroundColor: theme.surface }]}>
      <View style={styles.settingHeader}>
        <View style={styles.settingIcon}>
          <Ionicons name={setting.icon as any} size={24} color={theme.primary} />
        </View>
        <View style={styles.settingInfo}>
          <Text style={[styles.settingTitle, { color: theme.text }]}>
            {setting.title}
          </Text>
          <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
            {setting.description}
          </Text>
        </View>
      </View>
      
      <View style={styles.privacyOptions}>
        {setting.options.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.privacyOption,
              { 
                backgroundColor: setting.value === option.value ? theme.primary + '20' : 'transparent',
                borderColor: setting.value === option.value ? theme.primary : theme.border,
              }
            ]}
            onPress={() => handlePrivacyChange(setting.id, option.value)}
          >
            <View style={styles.privacyOptionHeader}>
              <Text style={[
                styles.privacyOptionLabel,
                { color: setting.value === option.value ? theme.primary : theme.text }
              ]}>
                {option.label}
              </Text>
              {setting.value === option.value && (
                <Ionicons name="checkmark-circle" size={16} color={theme.primary} />
              )}
            </View>
            <Text style={[styles.privacyOptionDescription, { color: theme.textSecondary }]}>
              {option.description}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderSecurityLog = ({ item: log }: { item: SecurityLog }) => (
    <View style={[styles.logCard, { backgroundColor: theme.surface }]}>
      <View style={styles.logHeader}>
        <View style={[styles.logIcon, { backgroundColor: getLogColor(log.status) + '20' }]}>
          <Ionicons name={getLogIcon(log.type)} size={20} color={getLogColor(log.status)} />
        </View>
        <View style={styles.logInfo}>
          <Text style={[styles.logTitle, { color: theme.text }]}>
            {log.title}
          </Text>
          <Text style={[styles.logDescription, { color: theme.textSecondary }]}>
            {log.description}
          </Text>
          <View style={styles.logDetails}>
            <Text style={[styles.logDetail, { color: theme.textSecondary }]}>
              {formatTimestamp(log.timestamp)} • {log.location}
            </Text>
            <Text style={[styles.logDetail, { color: theme.textSecondary }]}>
              {log.device} • {log.ip}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderDataUsage = ({ item: data }: { item: DataUsage }) => (
    <View style={[styles.dataCard, { backgroundColor: theme.surface }]}>
      <Text style={[styles.dataCategory, { color: theme.text }]}>
        {data.category}
      </Text>
      <Text style={[styles.dataDescription, { color: theme.textSecondary }]}>
        {data.description}
      </Text>
      
      <View style={styles.dataSection}>
        <Text style={[styles.dataSectionTitle, { color: theme.primary }]}>
          数据类型
        </Text>
        <View style={styles.dataTypes}>
          {data.dataTypes.map((type, index) => (
            <View key={index} style={[styles.dataType, { backgroundColor: theme.primary + '20' }]}>
              <Text style={[styles.dataTypeText, { color: theme.primary }]}>
                {type}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.dataSection}>
        <Text style={[styles.dataSectionTitle, { color: theme.primary }]}>
          使用目的
        </Text>
        <Text style={[styles.dataSectionContent, { color: theme.text }]}>
          {data.purpose}
        </Text>
      </View>

      <View style={styles.dataSection}>
        <Text style={[styles.dataSectionTitle, { color: theme.primary }]}>
          保留期限
        </Text>
        <Text style={[styles.dataSectionContent, { color: theme.text }]}>
          {data.retention}
        </Text>
      </View>

      <View style={styles.dataSection}>
        <Text style={[styles.dataSectionTitle, { color: theme.primary }]}>
          用户控制
        </Text>
        <Text style={[styles.dataSectionContent, { color: theme.text }]}>
          {data.userControl}
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.background }]}>
        <Text style={[styles.loadingText, { color: theme.text }]}>加载安全设置中...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <LinearGradient
        colors={[theme.primary, theme.primary + '80']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.headerTitle}>安全与隐私</Text>
        <Text style={styles.headerSubtitle}>保护您的账户和个人信息</Text>
      </LinearGradient>

      <View style={[styles.tabBar, { backgroundColor: theme.surface }]}>
        {[
          { key: 'security', label: '安全设置', icon: 'shield-checkmark' },
          { key: 'privacy', label: '隐私控制', icon: 'eye-off' },
          { key: 'logs', label: '安全日志', icon: 'list' },
          { key: 'data', label: '数据使用', icon: 'document-text' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tabButton,
              selectedTab === tab.key && { backgroundColor: theme.primary }
            ]}
            onPress={() => setSelectedTab(tab.key as any)}
          >
            <Ionicons
              name={tab.icon as any}
              size={18}
              color={selectedTab === tab.key ? theme.background : theme.textSecondary}
            />
            <Text style={[
              styles.tabButtonText,
              { color: selectedTab === tab.key ? theme.background : theme.textSecondary }
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {selectedTab === 'security' && (
          <FlatList
            data={securitySettings}
            renderItem={renderSecuritySetting}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.settingsList}
          />
        )}

        {selectedTab === 'privacy' && (
          <FlatList
            data={privacySettings}
            renderItem={renderPrivacySetting}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.settingsList}
          />
        )}

        {selectedTab === 'logs' && (
          <FlatList
            data={securityLogs}
            renderItem={renderSecurityLog}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.logsList}
          />
        )}

        {selectedTab === 'data' && (
          <FlatList
            data={dataUsage}
            renderItem={renderDataUsage}
            keyExtractor={(item) => item.category}
            scrollEnabled={false}
            contentContainerStyle={styles.dataList}
          />
        )}
      </ScrollView>

      {/* 密码更改模态框 */}
      <Modal
        visible={showPasswordModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: theme.surface }]}>
            <TouchableOpacity onPress={() => setShowPasswordModal(false)}>
              <Text style={[styles.modalCancel, { color: theme.textSecondary }]}>
                取消
              </Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              更改密码
            </Text>
            <TouchableOpacity onPress={handlePasswordChange}>
              <Text style={[styles.modalSave, { color: theme.primary }]}>
                保存
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.text }]}>
                当前密码
              </Text>
              <TextInput
                style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                placeholder="请输入当前密码"
                placeholderTextColor={theme.textSecondary}
                secureTextEntry
                value={currentPassword}
                onChangeText={setCurrentPassword}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.text }]}>
                新密码
              </Text>
              <TextInput
                style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                placeholder="请输入新密码"
                placeholderTextColor={theme.textSecondary}
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.text }]}>
                确认新密码
              </Text>
              <TextInput
                style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                placeholder="请再次输入新密码"
                placeholderTextColor={theme.textSecondary}
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>

            <View style={[styles.passwordTips, { backgroundColor: theme.surface }]}>
              <Text style={[styles.passwordTipsTitle, { color: theme.text }]}>
                密码要求：
              </Text>
              <Text style={[styles.passwordTip, { color: theme.textSecondary }]}>
                • 至少8个字符
              </Text>
              <Text style={[styles.passwordTip, { color: theme.textSecondary }]}>
                • 包含大小写字母
              </Text>
              <Text style={[styles.passwordTip, { color: theme.textSecondary }]}>
                • 包含数字和特殊字符
              </Text>
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
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
  },
  loadingText: {
    fontSize: 16,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    marginHorizontal: 2,
    borderRadius: 16,
  },
  tabButtonText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  settingsList: {
    paddingBottom: 20,
  },
  settingCard: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  levelText: {
    fontSize: 10,
    fontWeight: '600',
  },
  settingDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  actionButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  privacyOptions: {
    marginTop: 15,
  },
  privacyOption: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  privacyOptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  privacyOptionLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  privacyOptionDescription: {
    fontSize: 12,
  },
  logsList: {
    paddingBottom: 20,
  },
  logCard: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  logIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logInfo: {
    flex: 1,
  },
  logTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  logDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  logDetails: {
    gap: 2,
  },
  logDetail: {
    fontSize: 12,
  },
  dataList: {
    paddingBottom: 20,
  },
  dataCard: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dataCategory: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  dataDescription: {
    fontSize: 14,
    marginBottom: 15,
  },
  dataSection: {
    marginBottom: 12,
  },
  dataSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
  },
  dataSectionContent: {
    fontSize: 14,
    lineHeight: 20,
  },
  dataTypes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  dataType: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dataTypeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
  },
  modalCancel: {
    fontSize: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalSave: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  passwordTips: {
    borderRadius: 8,
    padding: 15,
    marginTop: 20,
  },
  passwordTipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  passwordTip: {
    fontSize: 14,
    marginBottom: 5,
  },
});

export default SecurityPrivacyScreen;