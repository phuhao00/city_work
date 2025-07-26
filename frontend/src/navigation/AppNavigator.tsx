import React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import { RootState } from '../store/index';
import { useTheme } from '../theme/ThemeProvider';
import { darkTheme } from '../theme/theme';

// Import screens
import { 
  LoginScreen, 
  RegisterScreen, 
  JobListScreen, 
  SearchScreen, 
  HomeScreen, 
  ProfileScreen, 
  MessagesScreen, 
  ChatScreen, 
  JobDetailScreen,
  NotificationsScreen,
  CompanyProfileScreen,
  ApplicationsScreen,
  SettingsScreen,
  CompanyAnalyticsScreen
} from '../components';
import { FeedScreen } from '../components/feed/FeedScreen';
import { NetworkScreen } from '../components/network/NetworkScreen';

// Define navigation types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  JobDetail: { jobId: string };
  Chat: { conversationId: string; otherUser: any };
  Notifications: undefined;
  CompanyProfile: { companyId: string };
  Applications: undefined;
  Settings: undefined;
  CompanyAnalytics: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Feed: undefined;
  Jobs: undefined;
  Network: undefined;
  Messages: undefined;
  Profile: undefined;
};

// Create navigators
const Stack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Auth Navigator
const AuthNavigator = () => {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
};

// Main Tab Navigator
const MainNavigator = () => {
  const { theme } = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.gray,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopColor: theme.colors.border,
          paddingBottom: 5,
          height: 60,
        },
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTintColor: theme.colors.text,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{
          title: '首页',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>🏠</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="Feed" 
        component={FeedScreen} 
        options={{
          title: '动态',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>📰</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="Jobs" 
        component={JobListScreen} 
        options={{
          title: '职位',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>💼</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="Network" 
        component={NetworkScreen} 
        options={{
          title: '人脉',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>👥</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="Messages" 
        component={MessagesScreen} 
        options={{
          title: '消息',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>💬</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{
          title: '我的',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>👤</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Root Navigator
const AppNavigator = () => {
  const { theme } = useTheme();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <NavigationContainer
      theme={{
        dark: theme === darkTheme,
        colors: {
          primary: theme.colors.primary,
          background: theme.colors.background,
          card: theme.colors.card,
          text: theme.colors.text,
          border: theme.colors.border,
          notification: theme.colors.notification,
        },
      }}
    >
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainNavigator} />
            <Stack.Screen 
              name="JobDetail" 
              component={JobDetailScreen} 
              options={{ headerShown: true, title: '职位详情' }}
            />
            <Stack.Screen 
              name="Chat" 
              component={ChatScreen} 
              options={{ headerShown: true, title: '聊天' }}
            />
            <Stack.Screen 
              name="Notifications" 
              component={NotificationsScreen} 
              options={{ headerShown: true, title: '通知' }}
            />
            <Stack.Screen 
              name="CompanyProfile" 
              component={CompanyProfileScreen} 
              options={{ headerShown: true, title: '公司详情' }}
            />
            <Stack.Screen 
              name="Applications" 
              component={ApplicationsScreen} 
              options={{ headerShown: true, title: '我的申请' }}
            />
            <Stack.Screen 
              name="Settings" 
              component={SettingsScreen} 
              options={{ headerShown: true, title: '设置' }}
            />
            <Stack.Screen 
              name="CompanyAnalytics" 
              component={CompanyAnalyticsScreen} 
              options={{ headerShown: true, title: '数据分析' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;