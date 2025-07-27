import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Animated,
  ViewStyle,
  TextStyle,
  TextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';

interface EnhancedInputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'small' | 'medium' | 'large';
  required?: boolean;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
}

export const EnhancedInput: React.FC<EnhancedInputProps> = ({
  label,
  error,
  hint,
  icon,
  iconPosition = 'left',
  variant = 'outlined',
  size = 'medium',
  required = false,
  containerStyle,
  inputStyle,
  labelStyle,
  value,
  onFocus,
  onBlur,
  ...props
}) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [animatedValue] = useState(new Animated.Value(value ? 1 : 0));

  const handleFocus = (e: any) => {
    setIsFocused(true);
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    if (!value) {
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
    onBlur?.(e);
  };

  const getContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      marginBottom: 16,
    };

    const variantStyles = {
      default: {
        borderBottomWidth: 2,
        borderBottomColor: error ? theme.colors.error : isFocused ? theme.colors.primary : theme.colors.border,
      },
      filled: {
        backgroundColor: theme.colors.card,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: error ? theme.colors.error : isFocused ? theme.colors.primary : 'transparent',
      },
      outlined: {
        borderWidth: 2,
        borderRadius: 8,
        borderColor: error ? theme.colors.error : isFocused ? theme.colors.primary : theme.colors.border,
        backgroundColor: theme.colors.background,
      },
    };

    return {
      ...baseStyle,
      ...variantStyles[variant],
    };
  };

  const getInputStyle = (): TextStyle => {
    const sizeStyles = {
      small: { fontSize: 14, paddingVertical: 8, paddingHorizontal: 12 },
      medium: { fontSize: 16, paddingVertical: 12, paddingHorizontal: 16 },
      large: { fontSize: 18, paddingVertical: 16, paddingHorizontal: 20 },
    };

    return {
      ...sizeStyles[size],
      color: theme.colors.text,
      flex: 1,
    };
  };

  const getLabelStyle = (): any => {
    const isFloating = variant !== 'default';
    
    if (isFloating) {
      return {
        position: 'absolute',
        left: 16,
        fontSize: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [16, 12],
        }),
        top: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [size === 'large' ? 20 : size === 'medium' ? 16 : 12, -8],
        }),
        color: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [theme.colors.gray, isFocused ? theme.colors.primary : theme.colors.gray],
        }),
        backgroundColor: theme.colors.background,
        paddingHorizontal: 4,
        zIndex: 1,
      };
    }

    return {
      fontSize: 14,
      color: theme.colors.text,
      marginBottom: 8,
      fontWeight: '500',
    };
  };

  return (
    <View style={[containerStyle]}>
      {label && variant === 'default' && (
        <Text style={[getLabelStyle(), labelStyle]}>
          {label}
          {required && <Text style={{ color: theme.colors.error }}> *</Text>}
        </Text>
      )}
      
      <View style={getContainerStyle()}>
        {label && variant !== 'default' && (
          <Animated.Text style={[getLabelStyle(), labelStyle]}>
            {label}
            {required && <Text style={{ color: theme.colors.error }}> *</Text>}
          </Animated.Text>
        )}
        
        <View style={styles.inputContainer}>
          {icon && iconPosition === 'left' && (
            <Ionicons
              name={icon}
              size={20}
              color={isFocused ? theme.colors.primary : theme.colors.gray}
              style={styles.iconLeft}
            />
          )}
          
          <TextInput
            {...props}
            value={value}
            onFocus={handleFocus}
            onBlur={handleBlur}
            style={[getInputStyle(), inputStyle]}
            placeholderTextColor={theme.colors.gray}
          />
          
          {icon && iconPosition === 'right' && (
            <Ionicons
              name={icon}
              size={20}
              color={isFocused ? theme.colors.primary : theme.colors.gray}
              style={styles.iconRight}
            />
          )}
        </View>
      </View>
      
      {error && (
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          {error}
        </Text>
      )}
      
      {hint && !error && (
        <Text style={[styles.hintText, { color: theme.colors.gray }]}>
          {hint}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconLeft: {
    marginRight: 12,
  },
  iconRight: {
    marginLeft: 12,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  hintText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});