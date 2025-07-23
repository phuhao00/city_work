import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

interface SearchScreenProps {
  navigation?: any;
}

// Mock search results
const mockSearchResults = [
  {
    _id: '1',
    title: 'React Developer',
    company: { name: 'Tech Solutions' },
    location: 'Remote',
    salary: { min: 85000, max: 125000 },
    type: 'full-time',
  },
  {
    _id: '2',
    title: 'Node.js Developer',
    company: { name: 'Backend Inc' },
    location: 'Austin, TX',
    salary: { min: 90000, max: 130000 },
    type: 'full-time',
  },
];

export const SearchScreen: React.FC<SearchScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setShowResults(true);
    }
  };

  const renderSearchResult = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={[styles.resultCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
      onPress={() => {
        console.log('Search result selected:', item.title);
      }}
    >
      <Text style={[styles.resultTitle, { color: theme.colors.text }]}>{item.title}</Text>
      <Text style={[styles.resultCompany, { color: theme.colors.gray }]}>{item.company.name}</Text>
      <Text style={[styles.resultLocation, { color: theme.colors.gray }]}>{item.location}</Text>
      <Text style={[styles.resultSalary, { color: theme.colors.primary }]}>
        ${item.salary.min.toLocaleString()} - ${item.salary.max.toLocaleString()}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.header, { color: theme.colors.text }]}>Search Jobs</Text>
      
      <View style={styles.searchContainer}>
        <TextInput
          style={[styles.searchInput, { 
            backgroundColor: theme.colors.surface, 
            borderColor: theme.colors.border,
            color: theme.colors.text 
          }]}
          placeholder="Search for jobs, companies, or skills..."
          placeholderTextColor={theme.colors.gray}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity 
          style={[styles.searchButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleSearch}
        >
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {showResults && (
        <View style={styles.resultsContainer}>
          <Text style={[styles.resultsHeader, { color: theme.colors.text }]}>
            Search Results for "{searchQuery}"
          </Text>
          <FlatList
            data={mockSearchResults}
            renderItem={renderSearchResult}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.resultsList}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}

      {!showResults && (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyStateText, { color: theme.colors.gray }]}>
            Enter a search term to find jobs
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
  },
  searchButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  resultsContainer: {
    flex: 1,
  },
  resultsHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  resultsList: {
    paddingBottom: 16,
  },
  resultCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  resultCompany: {
    fontSize: 16,
    marginBottom: 4,
  },
  resultLocation: {
    fontSize: 14,
    marginBottom: 8,
  },
  resultSalary: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
  },
});