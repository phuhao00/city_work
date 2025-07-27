import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  StatusBar,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store/index';
import { useLoginMutation } from '../../services/authApi';
import { setCredentials } from '../../features/auth/authSlice';
import { validateEmail, validatePassword } from '../../utils/validation';
import { useTheme } from '../../theme/ThemeContext';
import { 
  EnhancedButton, 
  EnhancedInput, 
  EnhancedCard,
  toastManager 
} from '../ui';

interface EnhancedLoginScreenProps {
  navigation: any;
}

export const EnhancedLoginScreen: React.FC<EnhancedLoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const { theme } = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const [login, { isLoading }] = useLoginMutation();
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    // Reset errors
    setEmailError('');
    setPasswordError('');

    // Validate inputs
    let hasErrors = false;

    if (!validateEmail(email)) {
      setEmailError('请输入有效的邮箱地址');
      hasErrors = true;
    }

    if (!password) {
      setPasswordError('密码不能为空');
      hasErrors = true;
    } else if (password.length < 6) {
      setPasswordError('密码至少需要6位字符');
      hasErrors = true;
    }

    if (hasErrors) {
      toastManager.show({
        message: '请检查输入信息',
        type: 'error',
        duration: 3000,
      });
      return;
    }

    try {
      const result = await login({ email, password }).unwrap();
      dispatch(setCredentials(result));
      
      toastManager.show({
        message: '登录成功！',
        type: 'success',
        duration: 2000,
      });
      
      // Navigation will be handled by AppNavigator based on auth state
    } catch (error: any) {
      const errorMessage = error.data?.message || error.message || '登录失败，请重试';
      
      toastManager.show({
        message: errorMessage,
        type: 'error',
        duration: 4000,
      });
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const handleSocialLogin = (provider: string) => {
    toastManager.show({
      message: `${provider}登录功能即将上线`,
      type: 'info',
      duration: 3000,
    });
  };

  const navigateToRegister = () => {
    navigation.navigate('Register');
  };

  const renderHeader = () => (
    <LinearGradient
      colors={[theme.colors.primary, theme.colors.secondary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.header}
    >
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      <Animated.View
        style={[
          styles.headerContent,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Text style={styles.welcomeTitle}>欢迎回来</Text>
        <Text style={styles.welcomeSubtitle}>登录您的账户继续使用</Text>
      </Animated.View>
    </LinearGradient>
  );

  const renderLoginForm = () => (
    <Animated.View
      style={[
        styles.formContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <EnhancedCard
        variant="elevated"
        padding="large"
        style={styles.loginCard}
      >
        <View style={styles.form}>
          <EnhancedInput
            label="邮箱地址"
            value={email}
            onChangeText={setEmail}
            error={emailError}
            icon="mail"
            variant="outlined"
            size="large"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            required
            hint="请输入您的邮箱地址"
          />

          <EnhancedInput
            label="密码"
            value={password}
            onChangeText={setPassword}
            error={passwordError}
            icon="lock-closed"
            variant="outlined"
            size="large"
            secureTextEntry
            autoCapitalize="none"
            required
            hint="密码至少6位字符"
          />

          <View style={styles.optionsContainer}>
            <EnhancedButton
              title={rememberMe ? '记住我 ✓' : '记住我'}
              onPress={() => setRememberMe(!rememberMe)}
              variant="ghost"
              size="small"
              style={styles.rememberButton}
            />
            
            <EnhancedButton
              title="忘记密码？"
              onPress={handleForgotPassword}
              variant="ghost"
              size="small"
              style={styles.forgotButton}
            />
          </View>

          <EnhancedButton
            title={isLoading ? '登录中...' : '登录'}
            onPress={handleLogin}
            variant="gradient"
            size="large"
            loading={isLoading}
            disabled={isLoading}
            fullWidth
            gradientColors={[theme.colors.primary, theme.colors.secondary]}
            style={styles.loginButton}
          />
        </View>
      </EnhancedCard>
    </Animated.View>
  );

  const renderSocialLogin = () => (
    <Animated.View
      style={[
        styles.socialContainer,
        {
          opacity: fadeAnim,
        },
      ]}
    >
      <View style={styles.dividerContainer}>
        <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
        <Text style={[styles.dividerText, { color: theme.colors.gray }]}>
          或使用以下方式登录
        </Text>
        <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
      </View>

      <View style={styles.socialButtons}>
        <EnhancedButton
          title="微信登录"
          onPress={() => handleSocialLogin('微信')}
          variant="outline"
          size="medium"
          icon="logo-wechat"
          style={[styles.socialButton, { borderColor: '#07C160' }]}
          textStyle={{ color: '#07C160' }}
        />
        
        <EnhancedButton
          title="QQ登录"
          onPress={() => handleSocialLogin('QQ')}
          variant="outline"
          size="medium"
          icon="logo-qq"
          style={[styles.socialButton, { borderColor: '#1296DB' }]}
          textStyle={{ color: '#1296DB' }}
        />
      </View>
    </Animated.View>
  );

  const renderFooter = () => (
    <Animated.View
      style={[
        styles.footer,
        {
          opacity: fadeAnim,
        },
      ]}
    >
      <Text style={[styles.footerText, { color: theme.colors.gray }]}>
        还没有账户？
      </Text>
      <EnhancedButton
        title="立即注册"
        onPress={navigateToRegister}
        variant="ghost"
        size="medium"
        style={styles.registerButton}
      />
    </Animated.View>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {renderHeader()}
        {renderLoginForm()}
        {renderSocialLogin()}
        {renderFooter()}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  formContainer: {
    padding: 20,
    marginTop: -20,
  },
  loginCard: {
    borderRadius: 20,
  },
  form: {
    gap: 20,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  rememberButton: {
    alignSelf: 'flex-start',
  },
  forgotButton: {
    alignSelf: 'flex-end',
  },
  loginButton: {
    marginTop: 8,
    borderRadius: 12,
  },
  socialContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  socialButton: {
    flex: 1,
    borderRadius: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 30,
    marginTop: 'auto',
  },
  footerText: {
    fontSize: 16,
  },
  registerButton: {
    marginLeft: 8,
  },
});