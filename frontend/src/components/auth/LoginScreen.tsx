import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store/index';
import { useLoginMutation } from '../../features/auth/authSlice';
import { setCredentials } from '../../features/auth/authSlice';
import { validateEmail, validatePassword } from '../../utils/validation';
import { useTheme } from '../../theme/ThemeProvider';

interface LoginScreenProps {
  navigation: any;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const { theme } = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const [login, { isLoading }] = useLoginMutation();

  const handleLogin = async () => {
    // Reset errors
    setEmailError('');
    setPasswordError('');

    // Validate inputs
    let hasErrors = false;

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      hasErrors = true;
    }

    if (!password) {
      setPasswordError('Password is required');
      hasErrors = true;
    }

    if (hasErrors) return;

    try {
      const result = await login({ email, password }).unwrap();
      dispatch(setCredentials(result));
      navigation.navigate('Home');
    } catch (error: any) {
      Alert.alert(
        'Login Failed',
        error.data?.message || 'An error occurred during login'
      );
    }
  };

  const navigateToRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Welcome Back</Text>
      <Text style={[styles.subtitle, { color: theme.colors.gray }]}>Sign in to continue</Text>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <TextInput
            style={[
              styles.input, 
              { backgroundColor: theme.colors.card, borderColor: theme.colors.border, color: theme.colors.text },
              emailError ? { borderColor: theme.colors.error } : null
            ]}
            placeholder="Email"
            placeholderTextColor={theme.colors.gray}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {emailError ? <Text style={[styles.errorText, { color: theme.colors.error }]}>{emailError}</Text> : null}
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={[
              styles.input, 
              { backgroundColor: theme.colors.card, borderColor: theme.colors.border, color: theme.colors.text },
              passwordError ? { borderColor: theme.colors.error } : null
            ]}
            placeholder="Password"
            placeholderTextColor={theme.colors.gray}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />
          {passwordError ? <Text style={[styles.errorText, { color: theme.colors.error }]}>{passwordError}</Text> : null}
        </View>

        <TouchableOpacity
          style={[
            styles.button, 
            { backgroundColor: theme.colors.primary },
            isLoading && styles.buttonDisabled
          ]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Sign In</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={navigateToRegister}>
          <Text style={[styles.linkText, { color: theme.colors.gray }]}>
            Don't have an account? <Text style={[styles.linkTextBold, { color: theme.colors.primary }]}>Sign Up</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 48,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  errorText: {
    fontSize: 14,
    marginTop: 4,
    marginLeft: 8,
  },
  button: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
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
    marginTop: 24,
    fontSize: 16,
  },
  linkTextBold: {
    fontWeight: '600',
  },
});