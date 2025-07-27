import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useTheme } from '../hooks/useTheme';
import {
  EnhancedButton,
  EnhancedInput,
  EnhancedCard,
  BottomSheet,
  toastManager,
  SkeletonCard,
  SkeletonList,
  SkeletonJobCard,
  SkeletonProfile,
} from '../ui';

const ComponentShowcaseScreen: React.FC = () => {
  const { theme } = useTheme();
  const [inputValue, setInputValue] = useState('');
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSkeletons, setShowSkeletons] = useState(false);

  const handleShowToast = (type: 'success' | 'error' | 'warning' | 'info') => {
    const messages = {
      success: '操作成功！',
      error: '操作失败，请重试',
      warning: '请注意检查输入内容',
      info: '这是一条信息提示',
    };

    toastManager.show({
      message: messages[type],
      type,
      duration: 3000,
    });
  };

  const handleLoadingDemo = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      handleShowToast('success');
    }, 2000);
  };

  const toggleSkeletons = () => {
    setShowSkeletons(!showSkeletons);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      padding: theme.spacing.md,
    },
    section: {
      marginBottom: theme.spacing.xl,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    subsectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
      marginTop: theme.spacing.md,
    },
    buttonRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.md,
    },
    inputContainer: {
      marginBottom: theme.spacing.md,
    },
    cardContainer: {
      marginBottom: theme.spacing.md,
    },
    bottomSheetContent: {
      padding: theme.spacing.lg,
      alignItems: 'center',
    },
    bottomSheetTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    bottomSheetText: {
      fontSize: 14,
      color: theme.colors.gray,
      textAlign: 'center',
      marginBottom: theme.spacing.lg,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* 标题 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎨 UI组件展示</Text>
          <Text style={{ color: theme.colors.gray, fontSize: 14 }}>
            展示所有增强版UI组件的功能和样式
          </Text>
        </View>

        {/* 按钮组件 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>按钮组件</Text>
          
          <Text style={styles.subsectionTitle}>按钮样式</Text>
          <View style={styles.buttonRow}>
            <EnhancedButton
              title="主要按钮"
              variant="primary"
              onPress={() => handleShowToast('success')}
            />
            <EnhancedButton
              title="次要按钮"
              variant="secondary"
              onPress={() => handleShowToast('info')}
            />
            <EnhancedButton
              title="轮廓按钮"
              variant="outline"
              onPress={() => handleShowToast('warning')}
            />
            <EnhancedButton
              title="幽灵按钮"
              variant="ghost"
              onPress={() => handleShowToast('error')}
            />
          </View>

          <Text style={styles.subsectionTitle}>按钮尺寸</Text>
          <View style={styles.buttonRow}>
            <EnhancedButton
              title="小按钮"
              size="small"
              variant="primary"
              onPress={() => handleShowToast('success')}
            />
            <EnhancedButton
              title="中等按钮"
              size="medium"
              variant="primary"
              onPress={() => handleShowToast('success')}
            />
            <EnhancedButton
              title="大按钮"
              size="large"
              variant="primary"
              onPress={() => handleShowToast('success')}
            />
          </View>

          <Text style={styles.subsectionTitle}>特殊状态</Text>
          <View style={styles.buttonRow}>
            <EnhancedButton
              title="带图标"
              variant="primary"
              icon="star"
              onPress={() => handleShowToast('success')}
            />
            <EnhancedButton
              title="加载中"
              variant="primary"
              loading={loading}
              onPress={handleLoadingDemo}
            />
            <EnhancedButton
              title="禁用状态"
              variant="primary"
              disabled
              onPress={() => {}}
            />
            <EnhancedButton
              title="渐变按钮"
              variant="gradient"
              onPress={() => handleShowToast('success')}
            />
          </View>
        </View>

        {/* 输入框组件 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>输入框组件</Text>
          
          <View style={styles.inputContainer}>
            <EnhancedInput
              label="默认输入框"
              value={inputValue}
              onChangeText={setInputValue}
              placeholder="请输入内容"
            />
          </View>

          <View style={styles.inputContainer}>
            <EnhancedInput
              label="带图标的输入框"
              value=""
              onChangeText={() => {}}
              placeholder="请输入邮箱"
              icon="mail"
              variant="outlined"
            />
          </View>

          <View style={styles.inputContainer}>
            <EnhancedInput
              label="填充样式"
              value=""
              onChangeText={() => {}}
              placeholder="请输入密码"
              icon="lock-closed"
              variant="filled"
              secureTextEntry
            />
          </View>

          <View style={styles.inputContainer}>
            <EnhancedInput
              label="错误状态"
              value=""
              onChangeText={() => {}}
              placeholder="请输入手机号"
              icon="call"
              variant="outlined"
              error="手机号格式不正确"
            />
          </View>

          <View style={styles.inputContainer}>
            <EnhancedInput
              label="带提示信息"
              value=""
              onChangeText={() => {}}
              placeholder="请输入用户名"
              icon="person"
              variant="outlined"
              hint="用户名长度为3-20个字符"
            />
          </View>
        </View>

        {/* 卡片组件 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>卡片组件</Text>
          
          <View style={styles.cardContainer}>
            <EnhancedCard variant="default">
              <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: 'bold' }}>
                默认卡片
              </Text>
              <Text style={{ color: theme.colors.gray, marginTop: theme.spacing.xs }}>
                这是一个默认样式的卡片组件
              </Text>
            </EnhancedCard>
          </View>

          <View style={styles.cardContainer}>
            <EnhancedCard variant="elevated" animated>
              <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: 'bold' }}>
                阴影卡片
              </Text>
              <Text style={{ color: theme.colors.gray, marginTop: theme.spacing.xs }}>
                这是一个带阴影和动画的卡片组件
              </Text>
            </EnhancedCard>
          </View>

          <View style={styles.cardContainer}>
            <EnhancedCard variant="outlined">
              <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: 'bold' }}>
                轮廓卡片
              </Text>
              <Text style={{ color: theme.colors.gray, marginTop: theme.spacing.xs }}>
                这是一个轮廓样式的卡片组件
              </Text>
            </EnhancedCard>
          </View>

          <View style={styles.cardContainer}>
            <EnhancedCard 
              variant="gradient" 
              gradientColors={[theme.colors.primary, theme.colors.secondary]}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }}>
                渐变卡片
              </Text>
              <Text style={{ color: '#FFFFFF', marginTop: theme.spacing.xs, opacity: 0.9 }}>
                这是一个渐变背景的卡片组件
              </Text>
            </EnhancedCard>
          </View>

          <View style={styles.cardContainer}>
            <EnhancedCard 
              variant="elevated" 
              title="带标题的卡片"
              subtitle="副标题信息"
              icon="star"
            >
              <Text style={{ color: theme.colors.gray, marginTop: theme.spacing.sm }}>
                这是一个带有标题、副标题和图标的卡片组件
              </Text>
            </EnhancedCard>
          </View>
        </View>

        {/* 底部弹出层 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>底部弹出层</Text>
          <EnhancedButton
            title="显示底部弹出层"
            variant="outline"
            icon="layers"
            onPress={() => setShowBottomSheet(true)}
          />
        </View>

        {/* 骨架屏组件 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>骨架屏组件</Text>
          <EnhancedButton
            title={showSkeletons ? "隐藏骨架屏" : "显示骨架屏"}
            variant="outline"
            icon="grid"
            onPress={toggleSkeletons}
          />
          
          {showSkeletons && (
            <View style={{ marginTop: theme.spacing.md }}>
              <Text style={styles.subsectionTitle}>卡片骨架屏</Text>
              <SkeletonCard />
              
              <Text style={styles.subsectionTitle}>职位卡片骨架屏</Text>
              <SkeletonJobCard />
              
              <Text style={styles.subsectionTitle}>个人资料骨架屏</Text>
              <SkeletonProfile />
              
              <Text style={styles.subsectionTitle}>列表骨架屏</Text>
              <SkeletonList itemCount={3} />
            </View>
          )}
        </View>

        {/* 消息提示 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>消息提示</Text>
          <View style={styles.buttonRow}>
            <EnhancedButton
              title="成功提示"
              variant="outline"
              size="small"
              onPress={() => handleShowToast('success')}
            />
            <EnhancedButton
              title="错误提示"
              variant="outline"
              size="small"
              onPress={() => handleShowToast('error')}
            />
            <EnhancedButton
              title="警告提示"
              variant="outline"
              size="small"
              onPress={() => handleShowToast('warning')}
            />
            <EnhancedButton
              title="信息提示"
              variant="outline"
              size="small"
              onPress={() => handleShowToast('info')}
            />
          </View>
        </View>
      </ScrollView>

      {/* 底部弹出层 */}
      <BottomSheet
        visible={showBottomSheet}
        onClose={() => setShowBottomSheet(false)}
        snapPoints={[300]}
      >
        <View style={styles.bottomSheetContent}>
          <Text style={styles.bottomSheetTitle}>底部弹出层演示</Text>
          <Text style={styles.bottomSheetText}>
            这是一个可定制的底部弹出层组件，支持手势操作、多个停靠点和流畅的动画效果。
          </Text>
          <EnhancedButton
            title="关闭"
            variant="primary"
            onPress={() => setShowBottomSheet(false)}
          />
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
};

export default ComponentShowcaseScreen;