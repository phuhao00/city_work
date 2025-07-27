import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { GlobalToast } from '../components/ui';
import ErrorBoundary from '../components/common/ErrorBoundary';
import NetworkMonitor from '../components/common/NetworkMonitor';
import PerformanceMonitor from '../components/performance/PerformanceMonitor';

// Import Enhanced Screens
import EnhancedHomeScreen from '../components/home/EnhancedHomeScreen';
import EnhancedJobListScreen from '../components/jobs/EnhancedJobListScreen';
import EnhancedJobDetailScreen from '../components/jobs/EnhancedJobDetailScreen';
import EnhancedProfileScreen from '../components/profile/EnhancedProfileScreen';
import EnhancedMyApplicationsScreen from '../components/applications/EnhancedMyApplicationsScreen';
import EnhancedSettingsScreen from '../components/settings/EnhancedSettingsScreen';
import ComponentShowcaseScreen from '../components/showcase/ComponentShowcaseScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// 主页堆栈导航
const HomeStack = () => {
  const { theme } = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.gray + '20',
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="Home" 
        component={EnhancedHomeScreen} 
        options={{ title: '首页' }}
      />
      <Stack.Screen 
        name="JobDetail" 
        component={EnhancedJobDetailScreen} 
        options={{ title: '职位详情' }}
      />
    </Stack.Navigator>
  );
};

// 职位堆栈导航
const JobsStack = () => {
  const { theme } = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.gray + '20',
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="JobList" 
        component={EnhancedJobListScreen} 
        options={{ title: '职位列表' }}
      />
      <Stack.Screen 
        name="JobDetail" 
        component={EnhancedJobDetailScreen} 
        options={{ title: '职位详情' }}
      />
    </Stack.Navigator>
  );
};

// 个人中心堆栈导航
const ProfileStack = () => {
  const { theme } = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.gray + '20',
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="Profile" 
        component={EnhancedProfileScreen} 
        options={{ title: '个人中心' }}
      />
      <Stack.Screen 
        name="Settings" 
        component={EnhancedSettingsScreen} 
        options={{ title: '设置' }}
      />
      <Stack.Screen 
        name="ComponentShowcase" 
        component={ComponentShowcaseScreen} 
        options={{ title: '组件展示' }}
      />
    </Stack.Navigator>
  );
};

// 底部标签导航
const TabNavigator = () => {
  const { theme, isDark } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'HomeTab':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'JobsTab':
              iconName = focused ? 'briefcase' : 'briefcase-outline';
              break;
            case 'ApplicationsTab':
              iconName = focused ? 'document-text' : 'document-text-outline';
              break;
            case 'ProfileTab':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'circle';
          }

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.gray,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.gray + '20',
          borderTopWidth: 1,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{ title: '首页' }}
      />
      <Tab.Screen
        name="JobsTab"
        component={JobsStack}
        options={{ title: '职位' }}
      />
      <Tab.Screen
        name="ApplicationsTab"
        component={EnhancedMyApplicationsScreen}
        options={{ title: '申请' }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStack}
        options={{ title: '我的' }}
      />
    </Tab.Navigator>
  );
};

// 主应用组件
const EnhancedApp: React.FC = () => {
  const { theme, isDark } = useTheme();
  const [showPerformanceMonitor, setShowPerformanceMonitor] = useState(__DEV__);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
  });

  const handleNetworkChange = (networkState: any) => {
    console.log('Network state changed:', networkState);
    // 可以在这里处理网络状态变化
  };

  const handleError = (error: Error, errorInfo: any) => {
    console.error('App Error:', error);
    console.error('Error Info:', errorInfo);
    // 可以在这里添加错误上报逻辑
  };

  return (
    <ErrorBoundary
      onError={handleError}
      enableReporting={true}
      showErrorDetails={__DEV__}
    >
      <View style={styles.container}>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={theme.colors.surface}
        />
        
        <NetworkMonitor
          onNetworkChange={handleNetworkChange}
          showNotification={true}
          autoHide={true}
          hideDelay={3000}
        />
        
        <NavigationContainer
          theme={{
            dark: isDark,
            colors: {
              primary: theme.colors.primary,
              background: theme.colors.background,
              card: theme.colors.surface,
              text: theme.colors.text,
              border: theme.colors.gray + '20',
              notification: theme.colors.primary,
            },
          }}
        >
          <TabNavigator />
        </NavigationContainer>
        
        <GlobalToast />
        
        {/* 开发环境下显示性能监控 */}
        {showPerformanceMonitor && (
          <PerformanceMonitor
            showRealTime={false}
            onMetricsUpdate={(metrics) => {
              // 可以在这里处理性能指标
              if (metrics.fps < 30) {
                console.warn('Low FPS detected:', metrics.fps);
              }
            }}
          />
        )}
      </View>
    </ErrorBoundary>
  );
};

export default EnhancedApp;