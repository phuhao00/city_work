import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';

interface EnhancedCardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'outlined' | 'gradient';
  padding?: 'none' | 'small' | 'medium' | 'large';
  margin?: 'none' | 'small' | 'medium' | 'large';
  borderRadius?: 'none' | 'small' | 'medium' | 'large' | 'round';
  shadow?: boolean;
  animated?: boolean;
  gradientColors?: string[];
  style?: ViewStyle;
  headerStyle?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
}

export const EnhancedCard: React.FC<EnhancedCardProps> = ({
  children,
  title,
  subtitle,
  icon,
  onPress,
  variant = 'default',
  padding = 'medium',
  margin = 'medium',
  borderRadius = 'medium',
  shadow = true,
  animated = true,
  gradientColors,
  style,
  headerStyle,
  titleStyle,
  subtitleStyle,
}) => {
  const { theme } = useTheme();
  const scaleValue = useRef(new Animated.Value(1)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      Animated.timing(opacityValue, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [animated, opacityValue]);

  const handlePressIn = () => {
    if (onPress && animated) {
      Animated.spring(scaleValue, {
        toValue: 0.98,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (onPress && animated) {
      Animated.spring(scaleValue, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }
  };

  const getCardStyle = (): ViewStyle => {
    const paddingStyles = {
      none: { padding: 0 },
      small: { padding: 8 },
      medium: { padding: 16 },
      large: { padding: 24 },
    };

    const marginStyles = {
      none: { margin: 0 },
      small: { margin: 4 },
      medium: { margin: 8 },
      large: { margin: 16 },
    };

    const borderRadiusStyles = {
      none: { borderRadius: 0 },
      small: { borderRadius: 4 },
      medium: { borderRadius: 12 },
      large: { borderRadius: 20 },
      round: { borderRadius: 50 },
    };

    const variantStyles = {
      default: {
        backgroundColor: theme.colors.card,
      },
      elevated: {
        backgroundColor: theme.colors.card,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      outlined: {
        backgroundColor: theme.colors.card,
        borderWidth: 1,
        borderColor: theme.colors.border,
      },
      gradient: {
        backgroundColor: 'transparent',
      },
    };

    const shadowStyle = shadow && variant !== 'elevated' ? {
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    } : {};

    return {
      ...paddingStyles[padding],
      ...marginStyles[margin],
      ...borderRadiusStyles[borderRadius],
      ...variantStyles[variant],
      ...shadowStyle,
    };
  };

  const renderHeader = () => {
    if (!title && !subtitle && !icon) return null;

    return (
      <View style={[styles.header, headerStyle]}>
        <View style={styles.headerContent}>
          {icon && (
            <Ionicons
              name={icon}
              size={24}
              color={theme.colors.primary}
              style={styles.headerIcon}
            />
          )}
          <View style={styles.headerText}>
            {title && (
              <Text style={[styles.title, { color: theme.colors.text }, titleStyle]}>
                {title}
              </Text>
            )}
            {subtitle && (
              <Text style={[styles.subtitle, { color: theme.colors.gray }, subtitleStyle]}>
                {subtitle}
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  const cardContent = (
    <Animated.View
      style={[
        getCardStyle(),
        style,
        animated && {
          opacity: opacityValue,
          transform: [{ scale: scaleValue }],
        },
      ]}
    >
      {variant === 'gradient' && (
        <LinearGradient
          colors={gradientColors || [theme.colors.primary, theme.colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius: 12 }]}
        />
      )}
      {renderHeader()}
      <View style={styles.content}>
        {children}
      </View>
    </Animated.View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        {cardContent}
      </TouchableOpacity>
    );
  }

  return cardContent;
};

const styles = StyleSheet.create({
  header: {
    marginBottom: 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
  },
  content: {
    flex: 1,
  },
});