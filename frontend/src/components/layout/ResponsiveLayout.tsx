import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  showBottomNav?: boolean;
  headerTitle?: string;
  headerActions?: React.ReactNode;
  backgroundColor?: string;
}

interface BreakpointConfig {
  mobile: number;
  tablet: number;
  desktop: number;
}

interface LayoutMetrics {
  width: number;
  height: number;
  isLandscape: boolean;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  platform: 'ios' | 'android' | 'web';
  safeAreaInsets: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  showHeader = true,
  showBottomNav = true,
  headerTitle = 'City Work',
  headerActions,
  backgroundColor,
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [layoutMetrics, setLayoutMetrics] = useState<LayoutMetrics>({
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    isLandscape: false,
    deviceType: 'mobile',
    platform: Platform.OS as 'ios' | 'android' | 'web',
    safeAreaInsets: {
      top: insets.top,
      bottom: insets.bottom,
      left: insets.left,
      right: insets.right,
    },
  });

  const breakpoints: BreakpointConfig = {
    mobile: 768,
    tablet: 1024,
    desktop: 1200,
  };

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      const isLandscape = window.width > window.height;
      let deviceType: 'mobile' | 'tablet' | 'desktop' = 'mobile';

      if (window.width >= breakpoints.desktop) {
        deviceType = 'desktop';
      } else if (window.width >= breakpoints.tablet) {
        deviceType = 'tablet';
      }

      setLayoutMetrics({
        width: window.width,
        height: window.height,
        isLandscape,
        deviceType,
        platform: Platform.OS as 'ios' | 'android' | 'web',
        safeAreaInsets: {
          top: insets.top,
          bottom: insets.bottom,
          left: insets.left,
          right: insets.right,
        },
      });
    });

    return () => subscription?.remove();
  }, [insets]);

  const getResponsiveStyles = () => {
    const { deviceType, isLandscape, width } = layoutMetrics;

    return {
      container: {
        paddingHorizontal: deviceType === 'mobile' ? 16 : deviceType === 'tablet' ? 24 : 32,
        maxWidth: deviceType === 'desktop' ? 1200 : '100%',
        alignSelf: 'center' as const,
        width: '100%',
      },
      grid: {
        flexDirection: (deviceType === 'mobile' && !isLandscape ? 'column' : 'row') as 'row' | 'column',
        flexWrap: 'wrap' as const,
      },
      column: {
        width: deviceType === 'mobile' && !isLandscape ? '100%' : 
              deviceType === 'tablet' ? '50%' : 
              '33.333%',
      },
      spacing: {
        small: deviceType === 'mobile' ? 8 : 12,
        medium: deviceType === 'mobile' ? 16 : 20,
        large: deviceType === 'mobile' ? 24 : 32,
      },
      typography: {
        h1: deviceType === 'mobile' ? 24 : deviceType === 'tablet' ? 28 : 32,
        h2: deviceType === 'mobile' ? 20 : deviceType === 'tablet' ? 24 : 28,
        h3: deviceType === 'mobile' ? 18 : deviceType === 'tablet' ? 20 : 24,
        body: deviceType === 'mobile' ? 14 : 16,
        caption: deviceType === 'mobile' ? 12 : 14,
      },
    };
  };

  const responsiveStyles = getResponsiveStyles();

  const renderHeader = () => {
    if (!showHeader) return null;

    return (
      <LinearGradient
        colors={[theme.primary, theme.primary + '90']}
        style={[
          styles.header,
          {
            paddingTop: layoutMetrics.safeAreaInsets.top + 10,
            paddingHorizontal: responsiveStyles.container.paddingHorizontal,
          }
        ]}
      >
        <View style={styles.headerContent}>
          <Text style={[
            styles.headerTitle,
            { fontSize: responsiveStyles.typography.h2 }
          ]}>
            {headerTitle}
          </Text>
          {headerActions && (
            <View style={styles.headerActions}>
              {headerActions}
            </View>
          )}
        </View>
      </LinearGradient>
    );
  };

  const renderBottomNavigation = () => {
    if (!showBottomNav || layoutMetrics.deviceType !== 'mobile') return null;

    const navItems = [
      { key: 'home', icon: 'home', label: '首页' },
      { key: 'search', icon: 'search', label: '搜索' },
      { key: 'applications', icon: 'document-text', label: '申请' },
      { key: 'messages', icon: 'chatbubble', label: '消息' },
      { key: 'profile', icon: 'person', label: '我的' },
    ];

    return (
      <View style={[
        styles.bottomNav,
        {
          backgroundColor: theme.surface,
          paddingBottom: layoutMetrics.safeAreaInsets.bottom,
        }
      ]}>
        {navItems.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={styles.navItem}
            activeOpacity={0.7}
          >
            <Ionicons
              name={item.icon as any}
              size={24}
              color={theme.textSecondary}
            />
            <Text style={[
              styles.navLabel,
              { color: theme.textSecondary, fontSize: responsiveStyles.typography.caption }
            ]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderSideNavigation = () => {
    if (layoutMetrics.deviceType === 'mobile') return null;

    const navItems = [
      { key: 'dashboard', icon: 'grid', label: '仪表板' },
      { key: 'jobs', icon: 'briefcase', label: '职位' },
      { key: 'companies', icon: 'business', label: '公司' },
      { key: 'applications', icon: 'document-text', label: '申请记录' },
      { key: 'interviews', icon: 'videocam', label: '面试' },
      { key: 'messages', icon: 'chatbubble', label: '消息' },
      { key: 'analytics', icon: 'analytics', label: '数据分析' },
      { key: 'settings', icon: 'settings', label: '设置' },
    ];

    return (
      <View style={[
        styles.sideNav,
        {
          backgroundColor: theme.surface,
          width: layoutMetrics.deviceType === 'tablet' ? 200 : 250,
        }
      ]}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.sideNavContent}>
            {navItems.map((item) => (
              <TouchableOpacity
                key={item.key}
                style={[styles.sideNavItem, { backgroundColor: 'transparent' }]}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={item.icon as any}
                  size={20}
                  color={theme.textSecondary}
                />
                <Text style={[
                  styles.sideNavLabel,
                  { color: theme.textSecondary, fontSize: responsiveStyles.typography.body }
                ]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={[
      styles.container,
      {
        backgroundColor: backgroundColor || theme.background,
      }
    ]}>
      <StatusBar
        barStyle={theme.dark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.primary}
      />

      {renderHeader()}

      <View style={styles.body}>
        {renderSideNavigation()}
        
        <View style={[
          styles.content,
          responsiveStyles.container,
          {
            marginLeft: layoutMetrics.deviceType !== 'mobile' ? 
              (layoutMetrics.deviceType === 'tablet' ? 200 : 250) : 0,
          }
        ]}>
          {children}
        </View>
      </View>

      {renderBottomNavigation()}
    </View>
  );
};

// 响应式网格组件
interface ResponsiveGridProps {
  children: React.ReactNode;
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  spacing?: number;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  columns = { mobile: 1, tablet: 2, desktop: 3 },
  spacing = 16,
}) => {
  const [layoutMetrics, setLayoutMetrics] = useState({
    width: Dimensions.get('window').width,
    deviceType: 'mobile' as 'mobile' | 'tablet' | 'desktop',
  });

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      let deviceType: 'mobile' | 'tablet' | 'desktop' = 'mobile';
      
      if (window.width >= 1200) {
        deviceType = 'desktop';
      } else if (window.width >= 768) {
        deviceType = 'tablet';
      }

      setLayoutMetrics({
        width: window.width,
        deviceType,
      });
    });

    return () => subscription?.remove();
  }, []);

  const getColumnCount = () => {
    switch (layoutMetrics.deviceType) {
      case 'desktop':
        return columns.desktop || 3;
      case 'tablet':
        return columns.tablet || 2;
      default:
        return columns.mobile || 1;
    }
  };

  const columnCount = getColumnCount();
  const itemWidth = (layoutMetrics.width - (spacing * (columnCount + 1))) / columnCount;

  return (
    <View style={[styles.grid, { padding: spacing / 2 }]}>
      {React.Children.map(children, (child, index) => (
        <View style={[
          styles.gridItem,
          {
            width: itemWidth,
            marginHorizontal: spacing / 2,
            marginVertical: spacing / 2,
          }
        ]}>
          {child}
        </View>
      ))}
    </View>
  );
};

// 响应式卡片组件
interface ResponsiveCardProps {
  children: React.ReactNode;
  padding?: 'small' | 'medium' | 'large';
  elevation?: number;
  backgroundColor?: string;
}

export const ResponsiveCard: React.FC<ResponsiveCardProps> = ({
  children,
  padding = 'medium',
  elevation = 2,
  backgroundColor,
}) => {
  const { theme } = useTheme();
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      let type: 'mobile' | 'tablet' | 'desktop' = 'mobile';
      
      if (window.width >= 1200) {
        type = 'desktop';
      } else if (window.width >= 768) {
        type = 'tablet';
      }

      setDeviceType(type);
    });

    return () => subscription?.remove();
  }, []);

  const getPadding = () => {
    const base = deviceType === 'mobile' ? 16 : deviceType === 'tablet' ? 20 : 24;
    
    switch (padding) {
      case 'small':
        return base * 0.75;
      case 'large':
        return base * 1.5;
      default:
        return base;
    }
  };

  return (
    <View style={[
      styles.card,
      {
        backgroundColor: backgroundColor || theme.surface,
        padding: getPadding(),
        elevation,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: elevation },
        shadowOpacity: 0.1,
        shadowRadius: elevation * 2,
      }
    ]}>
      {children}
    </View>
  );
};

// 响应式文本组件
interface ResponsiveTextProps {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption';
  color?: string;
  align?: 'left' | 'center' | 'right';
  weight?: 'normal' | 'bold' | '600';
}

export const ResponsiveText: React.FC<ResponsiveTextProps> = ({
  children,
  variant = 'body',
  color,
  align = 'left',
  weight = 'normal',
}) => {
  const { theme } = useTheme();
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      let type: 'mobile' | 'tablet' | 'desktop' = 'mobile';
      
      if (window.width >= 1200) {
        type = 'desktop';
      } else if (window.width >= 768) {
        type = 'tablet';
      }

      setDeviceType(type);
    });

    return () => subscription?.remove();
  }, []);

  const getFontSize = () => {
    const sizes = {
      mobile: {
        h1: 24,
        h2: 20,
        h3: 18,
        body: 14,
        caption: 12,
      },
      tablet: {
        h1: 28,
        h2: 24,
        h3: 20,
        body: 16,
        caption: 14,
      },
      desktop: {
        h1: 32,
        h2: 28,
        h3: 24,
        body: 16,
        caption: 14,
      },
    };

    return sizes[deviceType][variant];
  };

  return (
    <Text style={[
      {
        fontSize: getFontSize(),
        color: color || theme.text,
        textAlign: align,
        fontWeight: weight,
      }
    ]}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  body: {
    flex: 1,
    flexDirection: 'row',
  },
  sideNav: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 1000,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sideNavContent: {
    padding: 20,
  },
  sideNavItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  sideNavLabel: {
    marginLeft: 12,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  bottomNav: {
    flexDirection: 'row',
    paddingTop: 10,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navLabel: {
    marginTop: 4,
    fontWeight: '500',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridItem: {
    // 动态宽度在组件中设置
  },
  card: {
    borderRadius: 12,
    marginBottom: 16,
  },
});

export default ResponsiveLayout;