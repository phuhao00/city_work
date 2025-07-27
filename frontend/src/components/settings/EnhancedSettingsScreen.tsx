import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import {
  EnhancedButton,
  EnhancedCard,
  BottomSheet,
  toastManager,
} from '../ui';
import ThemeSwitcher from '../ui/ThemeSwitcher';

interface SettingItemProps {
  icon: string;
  title: string;
  subtitle?: string;
  rightComponent?: React.ReactNode;
  onPress?: () => void;
  showArrow?: boolean;
}

const SettingItem: React.FC<SettingItemProps> = ({
  icon,
  title,
  subtitle,
  rightComponent,
  onPress,
  showArrow = false,
}) => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      marginBottom: theme.spacing.sm,
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.primary + '20',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.md,
    },
    content: {
      flex: 1,
    },
    title: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: subtitle ? 4 : 0,
    },
    subtitle: {
      fontSize: 14,
      color: theme.colors.gray,
    },
    rightContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
  });

  return (
    <EnhancedCard
      variant="default"
      onPress={onPress}
      style={{ marginBottom: theme.spacing.sm }}
    >
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon as any} size={20} color={theme.colors.primary} />
        </View>
        
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        
        <View style={styles.rightContainer}>
          {rightComponent}
          {showArrow && (
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.colors.gray}
            />
          )}
        </View>
      </View>
    </EnhancedCard>
  );
};

const EnhancedSettingsScreen: React.FC = () => {
  const { theme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [autoSync, setAutoSync] = useState(true);
  const [biometric, setBiometric] = useState(false);
  const [showLanguageSheet, setShowLanguageSheet] = useState(false);
  const [showAboutSheet, setShowAboutSheet] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('中文');

  const languages = [
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
  ];

  const handleLogout = () => {
    Alert.alert(
      '确认退出',
      '您确定要退出登录吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '退出',
          style: 'destructive',
          onPress: () => {
            toastManager.show({
              message: '已退出登录',
              type: 'success',
              duration: 2000,
            });
          },
        },
      ]
    );
  };

  const handleClearCache = () => {
    Alert.alert(
      '清除缓存',
      '这将清除所有本地缓存数据，确定继续吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '清除',
          style: 'destructive',
          onPress: () => {
            toastManager.show({
              message: '缓存已清除',
              type: 'success',
              duration: 2000,
            });
          },
        },
      ]
    );
  };

  const handleExportData = () => {
    toastManager.show({
      message: '数据导出功能开发中...',
      type: 'info',
      duration: 2000,
    });
  };

  const handleFeedback = () => {
    toastManager.show({
      message: '感谢您的反馈！',
      type: 'success',
      duration: 2000,
    });
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      padding: theme.spacing.md,
    },
    header: {
      marginBottom: theme.spacing.xl,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.gray,
    },
    section: {
      marginBottom: theme.spacing.xl,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    bottomSheetContent: {
      padding: theme.spacing.lg,
    },
    bottomSheetTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: theme.spacing.lg,
      textAlign: 'center',
    },
    languageItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.md,
      borderRadius: 12,
      marginBottom: theme.spacing.sm,
      backgroundColor: theme.colors.surface,
    },
    languageFlag: {
      fontSize: 24,
      marginRight: theme.spacing.md,
    },
    languageName: {
      fontSize: 16,
      color: theme.colors.text,
      flex: 1,
    },
    aboutText: {
      fontSize: 14,
      color: theme.colors.gray,
      lineHeight: 20,
      marginBottom: theme.spacing.md,
    },
    version: {
      fontSize: 12,
      color: theme.colors.gray,
      textAlign: 'center',
      marginTop: theme.spacing.lg,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* 标题 */}
        <View style={styles.header}>
          <Text style={styles.title}>设置</Text>
          <Text style={styles.subtitle}>个性化您的应用体验</Text>
        </View>

        {/* 外观设置 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>外观</Text>
          
          <SettingItem
            icon="color-palette"
            title="主题模式"
            subtitle="切换深色或浅色主题"
            rightComponent={<ThemeSwitcher size="small" showLabel={false} />}
          />
          
          <SettingItem
            icon="language"
            title="语言"
            subtitle={selectedLanguage}
            onPress={() => setShowLanguageSheet(true)}
            showArrow
          />
        </View>

        {/* 通知设置 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>通知</Text>
          
          <SettingItem
            icon="notifications"
            title="推送通知"
            subtitle="接收职位推荐和申请状态更新"
            rightComponent={
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: theme.colors.gray + '40', true: theme.colors.primary + '40' }}
                thumbColor={notifications ? theme.colors.primary : '#f4f3f4'}
              />
            }
          />
          
          <SettingItem
            icon="sync"
            title="自动同步"
            subtitle="自动同步数据到云端"
            rightComponent={
              <Switch
                value={autoSync}
                onValueChange={setAutoSync}
                trackColor={{ false: theme.colors.gray + '40', true: theme.colors.primary + '40' }}
                thumbColor={autoSync ? theme.colors.primary : '#f4f3f4'}
              />
            }
          />
        </View>

        {/* 安全设置 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>安全</Text>
          
          <SettingItem
            icon="finger-print"
            title="生物识别"
            subtitle="使用指纹或面部识别登录"
            rightComponent={
              <Switch
                value={biometric}
                onValueChange={setBiometric}
                trackColor={{ false: theme.colors.gray + '40', true: theme.colors.primary + '40' }}
                thumbColor={biometric ? theme.colors.primary : '#f4f3f4'}
              />
            }
          />
          
          <SettingItem
            icon="shield-checkmark"
            title="隐私设置"
            subtitle="管理您的隐私偏好"
            onPress={() => toastManager.show({ message: '隐私设置功能开发中...', type: 'info' })}
            showArrow
          />
        </View>

        {/* 数据管理 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>数据</Text>
          
          <SettingItem
            icon="download"
            title="导出数据"
            subtitle="导出您的个人数据"
            onPress={handleExportData}
            showArrow
          />
          
          <SettingItem
            icon="trash"
            title="清除缓存"
            subtitle="清除本地缓存数据"
            onPress={handleClearCache}
            showArrow
          />
        </View>

        {/* 帮助与支持 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>帮助与支持</Text>
          
          <SettingItem
            icon="help-circle"
            title="帮助中心"
            subtitle="常见问题和使用指南"
            onPress={() => toastManager.show({ message: '帮助中心功能开发中...', type: 'info' })}
            showArrow
          />
          
          <SettingItem
            icon="chatbubble"
            title="意见反馈"
            subtitle="告诉我们您的想法"
            onPress={handleFeedback}
            showArrow
          />
          
          <SettingItem
            icon="information-circle"
            title="关于我们"
            subtitle="了解更多关于City Work"
            onPress={() => setShowAboutSheet(true)}
            showArrow
          />
        </View>

        {/* 账户操作 */}
        <View style={styles.section}>
          <EnhancedButton
            title="退出登录"
            variant="outline"
            icon="log-out"
            onPress={handleLogout}
            style={{ marginBottom: theme.spacing.md }}
          />
        </View>

        <Text style={styles.version}>City Work v1.0.0</Text>
      </ScrollView>

      {/* 语言选择底部弹出层 */}
      <BottomSheet
        visible={showLanguageSheet}
        onClose={() => setShowLanguageSheet(false)}
        snapPoints={[400]}
      >
        <View style={styles.bottomSheetContent}>
          <Text style={styles.bottomSheetTitle}>选择语言</Text>
          
          {languages.map((language) => (
            <EnhancedCard
              key={language.code}
              variant="default"
              onPress={() => {
                setSelectedLanguage(language.name);
                setShowLanguageSheet(false);
                toastManager.show({
                  message: `语言已切换为${language.name}`,
                  type: 'success',
                  duration: 2000,
                });
              }}
              style={{ marginBottom: theme.spacing.sm }}
            >
              <View style={styles.languageItem}>
                <Text style={styles.languageFlag}>{language.flag}</Text>
                <Text style={styles.languageName}>{language.name}</Text>
                {selectedLanguage === language.name && (
                  <Ionicons
                    name="checkmark"
                    size={20}
                    color={theme.colors.primary}
                  />
                )}
              </View>
            </EnhancedCard>
          ))}
        </View>
      </BottomSheet>

      {/* 关于我们底部弹出层 */}
      <BottomSheet
        visible={showAboutSheet}
        onClose={() => setShowAboutSheet(false)}
        snapPoints={[500]}
      >
        <View style={styles.bottomSheetContent}>
          <Text style={styles.bottomSheetTitle}>关于 City Work</Text>
          
          <Text style={styles.aboutText}>
            City Work 是一个专业的求职招聘平台，致力于为求职者和企业提供高效、便捷的人才匹配服务。
          </Text>
          
          <Text style={styles.aboutText}>
            我们的使命是通过技术创新，让每个人都能找到理想的工作，让每家企业都能找到合适的人才。
          </Text>
          
          <Text style={styles.aboutText}>
            版本：1.0.0{'\n'}
            开发团队：City Work Team{'\n'}
            联系邮箱：support@citywork.com
          </Text>
          
          <EnhancedButton
            title="关闭"
            variant="primary"
            onPress={() => setShowAboutSheet(false)}
          />
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
};

export default EnhancedSettingsScreen;