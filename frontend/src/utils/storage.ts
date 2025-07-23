import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../config';

/**
 * Storage utility for managing app data
 */
export class StorageService {
  /**
   * Store data in AsyncStorage
   */
  static async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error('Error storing data:', error);
      throw error;
    }
  }

  /**
   * Retrieve data from AsyncStorage
   */
  static async getItem<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('Error retrieving data:', error);
      return null;
    }
  }

  /**
   * Remove data from AsyncStorage
   */
  static async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing data:', error);
      throw error;
    }
  }

  /**
   * Clear all data from AsyncStorage
   */
  static async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  }

  /**
   * Get all keys from AsyncStorage
   */
  static async getAllKeys(): Promise<string[]> {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error('Error getting all keys:', error);
      return [];
    }
  }

  // Auth related storage methods
  static async setAuthToken(token: string): Promise<void> {
    return this.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  }

  static async getAuthToken(): Promise<string | null> {
    return this.getItem<string>(STORAGE_KEYS.AUTH_TOKEN);
  }

  static async removeAuthToken(): Promise<void> {
    return this.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  }

  static async setUserData(userData: any): Promise<void> {
    return this.setItem(STORAGE_KEYS.USER_DATA, userData);
  }

  static async getUserData(): Promise<any | null> {
    return this.getItem(STORAGE_KEYS.USER_DATA);
  }

  static async removeUserData(): Promise<void> {
    return this.removeItem(STORAGE_KEYS.USER_DATA);
  }

  // Theme related storage methods
  static async setTheme(theme: string): Promise<void> {
    return this.setItem(STORAGE_KEYS.THEME, theme);
  }

  static async getTheme(): Promise<string | null> {
    return this.getItem<string>(STORAGE_KEYS.THEME);
  }

  // Language related storage methods
  static async setLanguage(language: string): Promise<void> {
    return this.setItem(STORAGE_KEYS.LANGUAGE, language);
  }

  static async getLanguage(): Promise<string | null> {
    return this.getItem<string>(STORAGE_KEYS.LANGUAGE);
  }

  // Onboarding related storage methods
  static async setOnboardingCompleted(completed: boolean): Promise<void> {
    return this.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, completed);
  }

  static async getOnboardingCompleted(): Promise<boolean> {
    const completed = await this.getItem<boolean>(STORAGE_KEYS.ONBOARDING_COMPLETED);
    return completed ?? false;
  }
}