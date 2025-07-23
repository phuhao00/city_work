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
import { LoginScreen, JobListScreen, SearchScreen, HomeScreen, ProfileScreen, MessagesScreen } from '../components';

// Temporary placeholder screens
const RegisterScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Register Screen - Coming Soon</Text>
  </View>
);
const JobDetailScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Job Detail Screen - Coming Soon</Text>
  </View>
);
const ChatScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Chat Screen - Coming Soon</Text>
  </View>
);

// Define navigation types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  JobDetail: { jobId: string };
  Chat: { chatId: string };
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Jobs: undefined;
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
        },
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTintColor: theme.colors.text,
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{
          // Add icon configuration later
        }}
      />
      <Tab.Screen 
        name="Jobs" 
        component={JobListScreen} 
        options={{
          // Add icon configuration later
        }}
      />
      <Tab.Screen 
        name="Messages" 
        component={MessagesScreen} 
        options={{
          // Add icon configuration later
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{
          // Add icon configuration later
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
              options={{ headerShown: true, title: 'Job Details' }}
            />
            <Stack.Screen 
              name="Chat" 
              component={ChatScreen} 
              options={{ headerShown: true, title: 'Chat' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;