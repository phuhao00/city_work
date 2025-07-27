import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Keyboard,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { debounce } from '../../utils/PerformanceUtils';

interface SmartFormProps {
  children: React.ReactNode;
  onSubmit?: (data: Record<string, any>) => void;
  validationRules?: Record<string, ValidationRule[]>;
  autoSave?: boolean;
  autoSaveDelay?: number;
  style?: any;
}

interface ValidationRule {
  type: 'required' | 'email' | 'phone' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  value?: any;
  message: string;
  validator?: (value: string) => boolean;
}

interface FormFieldProps {
  name: string;
  label?: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  multiline?: boolean;
  numberOfLines?: number;
  maxLength?: number;
  editable?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  autoFocus?: boolean;
  returnKeyType?: 'done' | 'go' | 'next' | 'search' | 'send';
  onSubmitEditing?: () => void;
  style?: any;
  inputStyle?: any;
  errorStyle?: any;
  required?: boolean;
}

// 表单上下文
const FormContext = React.createContext<{
  values: Record<string, string>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  setValue: (name: string, value: string) => void;
  setError: (name: string, error: string) => void;
  setTouched: (name: string, touched: boolean) => void;
  validateField: (name: string, value: string) => string | null;
  validationRules: Record<string, ValidationRule[]>;
}>({
  values: {},
  errors: {},
  touched: {},
  setValue: () => {},
  setError: () => {},
  setTouched: () => {},
  validateField: () => null,
  validationRules: {},
});

// 智能表单组件
export function SmartForm({
  children,
  onSubmit,
  validationRules = {},
  autoSave = false,
  autoSaveDelay = 1000,
  style,
}: SmartFormProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  
  const keyboardHeightAnim = useRef(new Animated.Value(0)).current;

  // 键盘事件监听
  useEffect(() => {
    const keyboardWillShow = (event: any) => {
      const height = event.endCoordinates.height;
      setKeyboardHeight(height);
      Animated.timing(keyboardHeightAnim, {
        toValue: height,
        duration: event.duration || 250,
        useNativeDriver: false,
      }).start();
    };

    const keyboardWillHide = (event: any) => {
      setKeyboardHeight(0);
      Animated.timing(keyboardHeightAnim, {
        toValue: 0,
        duration: event.duration || 250,
        useNativeDriver: false,
      }).start();
    };

    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showListener = Keyboard.addListener(showEvent, keyboardWillShow);
    const hideListener = Keyboard.addListener(hideEvent, keyboardWillHide);

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, [keyboardHeightAnim]);

  // 字段验证
  const validateField = useCallback((name: string, value: string): string | null => {
    const rules = validationRules[name];
    if (!rules) return null;

    for (const rule of rules) {
      switch (rule.type) {
        case 'required':
          if (!value || value.trim() === '') {
            return rule.message;
          }
          break;
        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (value && !emailRegex.test(value)) {
            return rule.message;
          }
          break;
        case 'phone':
          const phoneRegex = /^1[3-9]\d{9}$/;
          if (value && !phoneRegex.test(value)) {
            return rule.message;
          }
          break;
        case 'minLength':
          if (value && value.length < rule.value) {
            return rule.message;
          }
          break;
        case 'maxLength':
          if (value && value.length > rule.value) {
            return rule.message;
          }
          break;
        case 'pattern':
          if (value && !rule.value.test(value)) {
            return rule.message;
          }
          break;
        case 'custom':
          if (value && rule.validator && !rule.validator(value)) {
            return rule.message;
          }
          break;
      }
    }

    return null;
  }, [validationRules]);

  // 设置字段值
  const setValue = useCallback((name: string, value: string) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // 实时验证
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error || '' }));
  }, [validateField]);

  // 设置字段错误
  const setError = useCallback((name: string, error: string) => {
    setErrors(prev => ({ ...prev, [name]: error }));
  }, []);

  // 设置字段触摸状态
  const setTouchedField = useCallback((name: string, isTouched: boolean) => {
    setTouched(prev => ({ ...prev, [name]: isTouched }));
  }, []);

  // 自动保存
  const debouncedAutoSave = useCallback(
    debounce(() => {
      if (autoSave && onSubmit) {
        const hasErrors = Object.values(errors).some(error => error);
        if (!hasErrors) {
          onSubmit(values);
        }
      }
    }, autoSaveDelay),
    [autoSave, onSubmit, values, errors, autoSaveDelay]
  );

  // 监听值变化进行自动保存
  useEffect(() => {
    if (autoSave) {
      debouncedAutoSave();
    }
  }, [values, debouncedAutoSave, autoSave]);

  // 表单提交
  const handleSubmit = useCallback(() => {
    // 验证所有字段
    const newErrors: Record<string, string> = {};
    let hasErrors = false;

    Object.keys(validationRules).forEach(fieldName => {
      const error = validateField(fieldName, values[fieldName] || '');
      if (error) {
        newErrors[fieldName] = error;
        hasErrors = true;
      }
    });

    setErrors(newErrors);

    if (!hasErrors && onSubmit) {
      onSubmit(values);
    }
  }, [values, validationRules, validateField, onSubmit]);

  const contextValue = {
    values,
    errors,
    touched,
    setValue,
    setError,
    setTouched: setTouchedField,
    validateField,
    validationRules,
  };

  return (
    <FormContext.Provider value={contextValue}>
      <KeyboardAvoidingView
        style={[styles.container, style]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
        <Animated.View
          style={[
            styles.keyboardSpacer,
            { height: keyboardHeightAnim },
          ]}
        />
      </KeyboardAvoidingView>
    </FormContext.Provider>
  );
}

// 表单字段组件
export function FormField({
  name,
  label,
  placeholder,
  value: propValue,
  onChangeText: propOnChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  multiline = false,
  numberOfLines = 1,
  maxLength,
  editable = true,
  autoCapitalize = 'sentences',
  autoCorrect = true,
  autoFocus = false,
  returnKeyType = 'done',
  onSubmitEditing,
  style,
  inputStyle,
  errorStyle,
  required = false,
}: FormFieldProps) {
  const {
    values,
    errors,
    touched,
    setValue,
    setTouched,
  } = React.useContext(FormContext);

  const [isFocused, setIsFocused] = useState(false);
  const animatedValue = useRef(new Animated.Value(0)).current;

  const fieldValue = propValue !== undefined ? propValue : values[name] || '';
  const fieldError = errors[name];
  const fieldTouched = touched[name];
  const showError = fieldTouched && fieldError;

  // 焦点动画
  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isFocused || fieldValue ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, fieldValue, animatedValue]);

  const handleChangeText = useCallback((text: string) => {
    if (propOnChangeText) {
      propOnChangeText(text);
    } else {
      setValue(name, text);
    }
  }, [propOnChangeText, setValue, name]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    setTouched(name, true);
  }, [setTouched, name]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  const labelStyle = {
    top: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [18, 0],
    }),
    fontSize: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12],
    }),
    color: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['#999', isFocused ? '#007AFF' : '#666'],
    }),
  };

  return (
    <View style={[styles.fieldContainer, style]}>
      {label && (
        <View style={styles.labelContainer}>
          <Animated.Text style={[styles.label, labelStyle]}>
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </Animated.Text>
        </View>
      )}
      
      <TextInput
        style={[
          styles.input,
          multiline && styles.multilineInput,
          isFocused && styles.inputFocused,
          showError && styles.inputError,
          inputStyle,
        ]}
        value={fieldValue}
        onChangeText={handleChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        placeholderTextColor="#999"
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={numberOfLines}
        maxLength={maxLength}
        editable={editable}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        autoFocus={autoFocus}
        returnKeyType={returnKeyType}
        onSubmitEditing={onSubmitEditing}
      />
      
      {showError && (
        <Text style={[styles.errorText, errorStyle]}>
          {fieldError}
        </Text>
      )}
    </View>
  );
}

// 提交按钮组件
interface SubmitButtonProps {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: any;
  textStyle?: any;
}

export function SubmitButton({
  title,
  onPress,
  disabled = false,
  loading = false,
  style,
  textStyle,
}: SubmitButtonProps) {
  const { values, errors, validationRules } = React.useContext(FormContext);

  // 检查表单是否有效
  const isFormValid = React.useMemo(() => {
    // 检查必填字段
    const requiredFields = Object.keys(validationRules);
    const hasRequiredValues = requiredFields.every(field => {
      const rules = validationRules[field];
      const hasRequiredRule = rules.some(rule => rule.type === 'required');
      return !hasRequiredRule || (values[field] && values[field].trim() !== '');
    });

    // 检查是否有错误
    const hasErrors = Object.values(errors).some(error => error);

    return hasRequiredValues && !hasErrors;
  }, [values, errors, validationRules]);

  const isDisabled = disabled || loading || !isFormValid;

  return (
    <TouchableOpacity
      style={[
        styles.submitButton,
        isDisabled && styles.submitButtonDisabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      <Text
        style={[
          styles.submitButtonText,
          isDisabled && styles.submitButtonTextDisabled,
          textStyle,
        ]}
      >
        {loading ? '提交中...' : title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  keyboardSpacer: {
    backgroundColor: 'transparent',
  },
  fieldContainer: {
    marginBottom: 20,
  },
  labelContainer: {
    position: 'relative',
    height: 20,
    marginBottom: 8,
  },
  label: {
    position: 'absolute',
    left: 0,
    fontWeight: '500',
  },
  required: {
    color: '#FF3B30',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    minHeight: 48,
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  inputFocused: {
    borderColor: '#007AFF',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonTextDisabled: {
    color: '#999999',
  },
});

export default SmartForm;