import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

interface ThemeSwitcherProps {
  style?: any;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  style,
  size = 'medium',
  showLabel = true,
}) => {
  const { theme, isDark, toggleTheme } = useTheme();
  const animatedValue = React.useRef(new Animated.Value(isDark ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isDark ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isDark]);

  const getSizes = () => {
    switch (size) {
      case 'small':
        return {
          container: { width: 50, height: 28 },
          thumb: { width: 24, height: 24 },
          iconSize: 14,
          fontSize: 12,
        };
      case 'large':
        return {
          container: { width: 70, height: 38 },
          thumb: { width: 34, height: 34 },
          iconSize: 20,
          fontSize: 16,
        };
      default:
        return {
          container: { width: 60, height: 32 },
          thumb: { width: 28, height: 28 },
          iconSize: 16,
          fontSize: 14,
        };
    }
  };

  const sizes = getSizes();

  const thumbTranslateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [2, sizes.container.width - sizes.thumb.width - 2],
  });

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.colors.gray + '40', theme.colors.primary],
  });

  const styles = StyleSheet.create({
    container: {
      flexDirection: showLabel ? 'row' : 'column',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    switchContainer: {
      ...sizes.container,
      borderRadius: sizes.container.height / 2,
      justifyContent: 'center',
      position: 'relative',
    },
    thumb: {
      ...sizes.thumb,
      borderRadius: sizes.thumb.width / 2,
      backgroundColor: '#FFFFFF',
      position: 'absolute',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    label: {
      fontSize: sizes.fontSize,
      color: theme.colors.text,
      fontWeight: '500',
    },
  });

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        onPress={toggleTheme}
        activeOpacity={0.8}
      >
        <Animated.View
          style={[
            styles.switchContainer,
            { backgroundColor },
          ]}
        >
          <Animated.View
            style={[
              styles.thumb,
              {
                transform: [{ translateX: thumbTranslateX }],
              },
            ]}
          >
            <Ionicons
              name={isDark ? 'moon' : 'sunny'}
              size={sizes.iconSize}
              color={isDark ? '#4A5568' : '#F6AD55'}
            />
          </Animated.View>
        </Animated.View>
      </TouchableOpacity>
      
      {showLabel && (
        <Text style={styles.label}>
          {isDark ? '深色模式' : '浅色模式'}
        </Text>
      )}
    </View>
  );
};

export default ThemeSwitcher;