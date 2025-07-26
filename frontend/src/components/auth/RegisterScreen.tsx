import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store/index';
import { useRegisterMutation } from '../../services/authApi';
import { setCredentials } from '../../features/auth/authSlice';
import { validateEmail, validatePassword } from '../../utils/validation';
import { useTheme } from '../../theme/ThemeProvider';

interface RegisterScreenProps {
  navigation: any;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: 'JOBSEEKER' as 'JOBSEEKER' | 'EMPLOYER' | 'ADMIN',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { theme } = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const [register, { isLoading }] = useRegisterMutation();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      const result = await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role,
      }).unwrap();
      
      dispatch(setCredentials(result));
      // Navigation will be handled by AppNavigator based on auth state
    } catch (error: any) {
      Alert.alert(
        'Registration Failed',
        error.data?.message || error.message || 'An error occurred during registration'
      );
    }
  };

  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Create Account</Text>
        <Text style={[styles.subtitle, { color: theme.colors.gray }]}>Join our job platform</Text>

        <View style={styles.form}>
          <View style={styles.row}>
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: theme.colors.card, borderColor: theme.colors.border, color: theme.colors.text },
                  errors.firstName ? { borderColor: theme.colors.error } : null
                ]}
                placeholder="First Name"
                placeholderTextColor={theme.colors.gray}
                value={formData.firstName}
                onChangeText={(value) => handleInputChange('firstName', value)}
                autoCapitalize="words"
              />
              {errors.firstName ? <Text style={[styles.errorText, { color: theme.colors.error }]}>{errors.firstName}</Text> : null}
            </View>

            <View style={[styles.inputContainer, styles.halfWidth]}>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: theme.colors.card, borderColor: theme.colors.border, color: theme.colors.text },
                  errors.lastName ? { borderColor: theme.colors.error } : null
                ]}
                placeholder="Last Name"
                placeholderTextColor={theme.colors.gray}
                value={formData.lastName}
                onChangeText={(value) => handleInputChange('lastName', value)}
                autoCapitalize="words"
              />
              {errors.lastName ? <Text style={[styles.errorText, { color: theme.colors.error }]}>{errors.lastName}</Text> : null}
            </View>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: theme.colors.card, borderColor: theme.colors.border, color: theme.colors.text },
                errors.email ? { borderColor: theme.colors.error } : null
              ]}
              placeholder="Email"
              placeholderTextColor={theme.colors.gray}
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {errors.email ? <Text style={[styles.errorText, { color: theme.colors.error }]}>{errors.email}</Text> : null}
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: theme.colors.card, borderColor: theme.colors.border, color: theme.colors.text },
                errors.password ? { borderColor: theme.colors.error } : null
              ]}
              placeholder="Password"
              placeholderTextColor={theme.colors.gray}
              value={formData.password}
              onChangeText={(value) => handleInputChange('password', value)}
              secureTextEntry
              autoCapitalize="none"
            />
            {errors.password ? <Text style={[styles.errorText, { color: theme.colors.error }]}>{errors.password}</Text> : null}
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: theme.colors.card, borderColor: theme.colors.border, color: theme.colors.text },
                errors.confirmPassword ? { borderColor: theme.colors.error } : null
              ]}
              placeholder="Confirm Password"
              placeholderTextColor={theme.colors.gray}
              value={formData.confirmPassword}
              onChangeText={(value) => handleInputChange('confirmPassword', value)}
              secureTextEntry
              autoCapitalize="none"
            />
            {errors.confirmPassword ? <Text style={[styles.errorText, { color: theme.colors.error }]}>{errors.confirmPassword}</Text> : null}
          </View>

          <View style={styles.roleContainer}>
            <Text style={[styles.roleLabel, { color: theme.colors.text }]}>I am a:</Text>
            <View style={styles.roleButtons}>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  { borderColor: theme.colors.border },
                  formData.role === 'JOBSEEKER' && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
                ]}
                onPress={() => handleInputChange('role', 'JOBSEEKER')}
              >
                <Text style={[
                  styles.roleButtonText,
                  { color: theme.colors.text },
                  formData.role === 'JOBSEEKER' && { color: '#FFFFFF' }
                ]}>
                  Job Seeker
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  { borderColor: theme.colors.border },
                  formData.role === 'EMPLOYER' && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
                ]}
                onPress={() => handleInputChange('role', 'EMPLOYER')}
              >
                <Text style={[
                  styles.roleButtonText,
                  { color: theme.colors.text },
                  formData.role === 'EMPLOYER' && { color: '#FFFFFF' }
                ]}>
                  Employer
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: theme.colors.primary },
              isLoading && styles.buttonDisabled
            ]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={navigateToLogin}>
            <Text style={[styles.linkText, { color: theme.colors.gray }]}>
              Already have an account? <Text style={[styles.linkTextBold, { color: theme.colors.primary }]}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  form: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputContainer: {
    marginBottom: 16,
  },
  halfWidth: {
    width: '48%',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  roleContainer: {
    marginBottom: 24,
  },
  roleLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  roleButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roleButton: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  roleButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  linkText: {
    textAlign: 'center',
    fontSize: 14,
  },
  linkTextBold: {
    fontWeight: '600',
  },
});