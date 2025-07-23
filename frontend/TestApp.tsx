import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function TestApp() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>City Work App</Text>
      <Text style={styles.subtitle}>Frontend is running successfully!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
});