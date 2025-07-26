import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useGlobalSearchQuery } from '../../services/searchApi';

interface SearchScreenProps {
  navigation?: any;
}

export const SearchScreen: React.FC<SearchScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'all' | 'jobs' | 'companies' | 'users'>('all');

  const { 
    data: searchResults, 
    isLoading, 
    error 
  } = useGlobalSearchQuery(
    { query: searchQuery },
    { skip: searchQuery.length < 2 }
  );

  const searchTypes = [
    { key: 'all', label: 'All' },
    { key: 'jobs', label: 'Jobs' },
    { key: 'companies', label: 'Companies' },
    { key: 'users', label: 'Users' },
  ];

  const renderSearchTypeButton = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.typeButton,
        { borderColor: theme.colors.border },
        searchType === item.key && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
      ]}
      onPress={() => setSearchType(item.key)}
    >
      <Text style={[
        styles.typeButtonText,
        { color: theme.colors.text },
        searchType === item.key && { color: '#FFFFFF' }
      ]}>
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  const renderResultItem = ({ item, index }: { item: any; index: number }) => {
    const isJob = item.type === 'job' || item.title;
    const isCompany = item.type === 'company' || item.industry;
    const isUser = item.type === 'user' || item.firstName;

    return (
      <TouchableOpacity
        style={[styles.resultItem, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
        onPress={() => {
          if (isJob) {
            navigation?.navigate('JobDetail', { jobId: item._id });
          } else if (isCompany) {
            navigation?.navigate('CompanyDetail', { companyId: item._id });
          } else if (isUser) {
            navigation?.navigate('UserProfile', { userId: item._id });
          }
        }}
      >
        <View style={styles.resultContent}>
          <Text style={[styles.resultTitle, { color: theme.colors.text }]}>
            {isJob ? item.title : isCompany ? item.name : `${item.firstName} ${item.lastName}`}
          </Text>
          <Text style={[styles.resultSubtitle, { color: theme.colors.gray }]}>
            {isJob 
              ? item.company?.name || 'Company not specified'
              : isCompany 
                ? item.industry || 'Industry not specified'
                : item.email || 'Email not specified'
            }
          </Text>
          {isJob && item.location && (
            <Text style={[styles.resultLocation, { color: theme.colors.gray }]}>
              📍 {item.location}
            </Text>
          )}
          {isJob && item.salary && (
            <Text style={[styles.resultSalary, { color: theme.colors.primary }]}>
              💰 ${item.salary.min?.toLocaleString()} - ${item.salary.max?.toLocaleString()}
            </Text>
          )}
        </View>
        <View style={[styles.resultType, { backgroundColor: theme.colors.primary }]}>
          <Text style={styles.resultTypeText}>
            {isJob ? 'JOB' : isCompany ? 'COMPANY' : 'USER'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => {
    if (searchQuery.length < 2) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: theme.colors.gray }]}>
            Enter at least 2 characters to search
          </Text>
        </View>
      );
    }

    if (!isLoading && searchResults && searchResults.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: theme.colors.gray }]}>
            No results found for "{searchQuery}"
          </Text>
        </View>
      );
    }

    return null;
  };

  const getFilteredResults = () => {
    if (!searchResults) return [];
    
    if (searchType === 'all') return searchResults;
    
    return searchResults.filter((item: any) => {
      switch (searchType) {
        case 'jobs':
          return item.type === 'job' || item.title;
        case 'companies':
          return item.type === 'company' || item.industry;
        case 'users':
          return item.type === 'user' || item.firstName;
        default:
          return true;
      }
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Search Header */}
      <View style={styles.searchHeader}>
        <TextInput
          style={[
            styles.searchInput,
            { backgroundColor: theme.colors.card, borderColor: theme.colors.border, color: theme.colors.text }
          ]}
          placeholder="Search jobs, companies, or people..."
          placeholderTextColor={theme.colors.gray}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {/* Search Type Filters */}
      <FlatList
        data={searchTypes}
        renderItem={renderSearchTypeButton}
        keyExtractor={(item) => item.key}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.typeButtonsContainer}
      />

      {/* Search Results */}
      <View style={styles.resultsContainer}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.gray }]}>Searching...</Text>
          </View>
        ) : error ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.colors.error }]}>
              Search failed. Please try again.
            </Text>
          </View>
        ) : (
          <FlatList
            data={getFilteredResults()}
            renderItem={renderResultItem}
            keyExtractor={(item, index) => `${item._id || item.id || index}`}
            contentContainerStyle={styles.resultsList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderEmptyState}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchHeader: {
    padding: 16,
  },
  searchInput: {
    height: 50,
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 20,
    fontSize: 16,
  },
  typeButtonsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  resultsContainer: {
    flex: 1,
  },
  resultsList: {
    padding: 16,
  },
  resultItem: {
    flexDirection: 'row',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  resultContent: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  resultSubtitle: {
    fontSize: 14,
    marginBottom: 4,
  },
  resultLocation: {
    fontSize: 12,
    marginBottom: 2,
  },
  resultSalary: {
    fontSize: 12,
    fontWeight: '500',
  },
  resultType: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  resultTypeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
});