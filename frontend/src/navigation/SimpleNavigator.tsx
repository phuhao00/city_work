import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

export default function SimpleNavigator() {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>
        City Work App
      </Text>
      <Text style={[styles.subtitle, { color: theme.colors.gray }]}>
        Welcome to the job search platform
      </Text>
      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
          🎉 Frontend Setup Complete!
        </Text>
        <Text style={[styles.cardText, { color: theme.colors.gray }]}>
          • Redux store configured
        </Text>
        <Text style={[styles.cardText, { color: theme.colors.gray }]}>
          • Theme system working
        </Text>
        <Text style={[styles.cardText, { color: theme.colors.gray }]}>
          • Navigation ready
        </Text>
        <Text style={[styles.cardText, { color: theme.colors.gray }]}>
          • Components created
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 32,
  },
  card: {
    padding: 24,
    borderRadius: 12,
    width: '100%',
    maxWidth: 400,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  cardText: {
    fontSize: 16,
    marginBottom: 8,
    paddingLeft: 8,
  },
});