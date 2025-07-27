import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Switch,
  FlatList,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SearchFilter {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'select' | 'boolean';
  field: string;
  operator: 'equals' | 'contains' | 'greater' | 'less' | 'between' | 'in';
  value: any;
  options?: string[];
  enabled: boolean;
}

interface SearchQuery {
  id: string;
  name: string;
  description?: string;
  filters: SearchFilter[];
  sortBy?: string;
  sortOrder: 'asc' | 'desc';
  createdAt: string;
  lastUsed?: string;
  isPublic: boolean;
  category: string;
}

interface SearchResult {
  id: string;
  type: 'job' | 'company' | 'user' | 'application';
  title: string;
  subtitle: string;
  description: string;
  metadata: any;
  relevanceScore: number;
  matchedFields: string[];
}

interface SearchHistory {
  id: string;
  query: string;
  filters: SearchFilter[];
  timestamp: string;
  resultCount: number;
}

const AdvancedSearch: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'search' | 'queries' | 'history'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilter[]>([]);
  const [savedQueries, setSavedQueries] = useState<SearchQuery[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Modal states
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showSaveQueryModal, setShowSaveQueryModal] = useState(false);
  const [showQueryDetailModal, setShowQueryDetailModal] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState<SearchQuery | null>(null);
  const [editingFilter, setEditingFilter] = useState<SearchFilter | null>(null);

  // Form states
  const [queryName, setQueryName] = useState('');
  const [queryDescription, setQueryDescription] = useState('');
  const [queryCategory, setQueryCategory] = useState('general');
  const [queryIsPublic, setQueryIsPublic] = useState(false);

  // Search settings
  const [searchType, setSearchType] = useState<'all' | 'job' | 'company' | 'user' | 'application'>('all');
  const [sortBy, setSortBy] = useState('relevance');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    loadMockData();
  }, []);

  const loadMockData = () => {
    // Mock saved queries
    const mockQueries: SearchQuery[] = [
      {
        id: '1',
        name: '高薪技术职位',
        description: '搜索薪资超过20K的技术类职位',
        filters: [
          {
            id: '1',
            name: '职位类型',
            type: 'select',
            field: 'category',
            operator: 'in',
            value: ['技术', '开发', '工程师'],
            options: ['技术', '开发', '工程师', '产品', '设计', '运营'],
            enabled: true,
          },
          {
            id: '2',
            name: '薪资范围',
            type: 'number',
            field: 'salary',
            operator: 'greater',
            value: 20000,
            enabled: true,
          },
        ],
        sortBy: 'salary',
        sortOrder: 'desc',
        createdAt: '2024-01-10',
        lastUsed: '2024-01-15',
        isPublic: true,
        category: 'job',
      },
      {
        id: '2',
        name: '北京互联网公司',
        description: '搜索北京地区的互联网公司',
        filters: [
          {
            id: '3',
            name: '城市',
            type: 'text',
            field: 'location',
            operator: 'contains',
            value: '北京',
            enabled: true,
          },
          {
            id: '4',
            name: '行业',
            type: 'select',
            field: 'industry',
            operator: 'in',
            value: ['互联网', '软件', '电商'],
            options: ['互联网', '软件', '电商', '金融', '教育', '医疗'],
            enabled: true,
          },
        ],
        sortBy: 'rating',
        sortOrder: 'desc',
        createdAt: '2024-01-08',
        lastUsed: '2024-01-14',
        isPublic: false,
        category: 'company',
      },
    ];

    // Mock search history
    const mockHistory: SearchHistory[] = [
      {
        id: '1',
        query: 'React开发工程师',
        filters: [],
        timestamp: '2024-01-15 14:30:00',
        resultCount: 25,
      },
      {
        id: '2',
        query: '前端',
        filters: [
          {
            id: '5',
            name: '经验要求',
            type: 'select',
            field: 'experience',
            operator: 'equals',
            value: '3-5年',
            options: ['1-3年', '3-5年', '5-10年', '10年以上'],
            enabled: true,
          },
        ],
        timestamp: '2024-01-15 10:15:00',
        resultCount: 42,
      },
    ];

    setSavedQueries(mockQueries);
    setSearchHistory(mockHistory);
  };

  const performSearch = async () => {
    if (!searchQuery.trim() && filters.filter(f => f.enabled).length === 0) {
      Alert.alert('提示', '请输入搜索关键词或设置筛选条件');
      return;
    }

    setLoading(true);

    // Mock search results
    const mockResults: SearchResult[] = [
      {
        id: '1',
        type: 'job',
        title: 'React前端开发工程师',
        subtitle: '阿里巴巴 • 北京',
        description: '负责前端页面开发，使用React技术栈，要求3年以上经验',
        metadata: {
          salary: '25K-40K',
          experience: '3-5年',
          education: '本科',
          tags: ['React', 'JavaScript', 'TypeScript'],
        },
        relevanceScore: 95,
        matchedFields: ['title', 'description', 'tags'],
      },
      {
        id: '2',
        type: 'job',
        title: 'Vue.js开发工程师',
        subtitle: '腾讯 • 深圳',
        description: '负责Web前端开发，熟练使用Vue.js框架',
        metadata: {
          salary: '20K-35K',
          experience: '2-4年',
          education: '本科',
          tags: ['Vue.js', 'JavaScript', 'CSS'],
        },
        relevanceScore: 88,
        matchedFields: ['title', 'description'],
      },
      {
        id: '3',
        type: 'company',
        title: '字节跳动',
        subtitle: '互联网 • 北京',
        description: '全球领先的移动互联网公司，旗下有抖音、今日头条等产品',
        metadata: {
          size: '10000+',
          funding: '已上市',
          rating: 4.5,
          benefits: ['五险一金', '年终奖', '股票期权'],
        },
        relevanceScore: 82,
        matchedFields: ['name', 'description'],
      },
    ];

    // Add to search history
    const historyItem: SearchHistory = {
      id: Date.now().toString(),
      query: searchQuery,
      filters: filters.filter(f => f.enabled),
      timestamp: new Date().toLocaleString(),
      resultCount: mockResults.length,
    };
    setSearchHistory(prev => [historyItem, ...prev.slice(0, 19)]);

    setTimeout(() => {
      setSearchResults(mockResults);
      setLoading(false);
    }, 1000);
  };

  const addFilter = () => {
    const newFilter: SearchFilter = {
      id: Date.now().toString(),
      name: '新筛选条件',
      type: 'text',
      field: 'title',
      operator: 'contains',
      value: '',
      enabled: true,
    };
    setFilters(prev => [...prev, newFilter]);
    setEditingFilter(newFilter);
    setShowFilterModal(true);
  };

  const updateFilter = (filterId: string, updates: Partial<SearchFilter>) => {
    setFilters(prev => prev.map(filter => 
      filter.id === filterId ? { ...filter, ...updates } : filter
    ));
  };

  const removeFilter = (filterId: string) => {
    setFilters(prev => prev.filter(filter => filter.id !== filterId));
  };

  const saveQuery = () => {
    if (!queryName.trim()) {
      Alert.alert('错误', '请输入查询名称');
      return;
    }

    const newQuery: SearchQuery = {
      id: Date.now().toString(),
      name: queryName,
      description: queryDescription,
      filters: filters.filter(f => f.enabled),
      sortBy,
      sortOrder,
      createdAt: new Date().toISOString().split('T')[0],
      isPublic: queryIsPublic,
      category: queryCategory,
    };

    setSavedQueries(prev => [newQuery, ...prev]);
    setShowSaveQueryModal(false);
    setQueryName('');
    setQueryDescription('');
    Alert.alert('成功', '查询已保存');
  };

  const loadQuery = (query: SearchQuery) => {
    setSearchQuery('');
    setFilters(query.filters);
    setSortBy(query.sortBy || 'relevance');
    setSortOrder(query.sortOrder);
    
    // Update last used
    setSavedQueries(prev => prev.map(q => 
      q.id === query.id ? { ...q, lastUsed: new Date().toISOString().split('T')[0] } : q
    ));
    
    setActiveTab('search');
    Alert.alert('成功', '查询已加载');
  };

  const deleteQuery = (queryId: string) => {
    Alert.alert(
      '确认删除',
      '确定要删除这个保存的查询吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: () => {
            setSavedQueries(prev => prev.filter(q => q.id !== queryId));
            Alert.alert('成功', '查询已删除');
          },
        },
      ]
    );
  };

  const clearHistory = () => {
    Alert.alert(
      '确认清空',
      '确定要清空所有搜索历史吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '清空',
          style: 'destructive',
          onPress: () => {
            setSearchHistory([]);
            Alert.alert('成功', '搜索历史已清空');
          },
        },
      ]
    );
  };

  const getResultTypeIcon = (type: string) => {
    switch (type) {
      case 'job': return 'briefcase-outline';
      case 'company': return 'business-outline';
      case 'user': return 'person-outline';
      case 'application': return 'document-text-outline';
      default: return 'help-circle-outline';
    }
  };

  const getResultTypeColor = (type: string) => {
    switch (type) {
      case 'job': return '#2196F3';
      case 'company': return '#4CAF50';
      case 'user': return '#FF9800';
      case 'application': return '#9C27B0';
      default: return '#666';
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadMockData();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const renderSearchTab = () => (
    <ScrollView style={styles.tabContent}>
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="输入搜索关键词..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={performSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity
          style={styles.searchButton}
          onPress={performSearch}
          disabled={loading}
        >
          <Ionicons name="search" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Search Type Selector */}
      <View style={styles.typeSelector}>
        {[
          { key: 'all', label: '全部' },
          { key: 'job', label: '职位' },
          { key: 'company', label: '公司' },
          { key: 'user', label: '用户' },
          { key: 'application', label: '申请' },
        ].map((type) => (
          <TouchableOpacity
            key={type.key}
            style={[
              styles.typeOption,
              searchType === type.key && styles.selectedType,
            ]}
            onPress={() => setSearchType(type.key as any)}
          >
            <Text
              style={[
                styles.typeText,
                searchType === type.key && styles.selectedTypeText,
              ]}
            >
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Filters */}
      <View style={styles.filtersSection}>
        <View style={styles.filtersHeader}>
          <Text style={styles.sectionTitle}>筛选条件</Text>
          <TouchableOpacity style={styles.addFilterButton} onPress={addFilter}>
            <Ionicons name="add" size={16} color="#2196F3" />
            <Text style={styles.addFilterText}>添加筛选</Text>
          </TouchableOpacity>
        </View>

        {filters.map((filter) => (
          <View key={filter.id} style={styles.filterItem}>
            <View style={styles.filterInfo}>
              <Switch
                value={filter.enabled}
                onValueChange={(enabled) => updateFilter(filter.id, { enabled })}
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={filter.enabled ? '#f5dd4b' : '#f4f3f4'}
              />
              <Text style={[styles.filterName, !filter.enabled && styles.disabledText]}>
                {filter.name}
              </Text>
              <Text style={[styles.filterValue, !filter.enabled && styles.disabledText]}>
                {Array.isArray(filter.value) ? filter.value.join(', ') : filter.value}
              </Text>
            </View>
            <View style={styles.filterActions}>
              <TouchableOpacity
                onPress={() => {
                  setEditingFilter(filter);
                  setShowFilterModal(true);
                }}
              >
                <Ionicons name="create-outline" size={20} color="#2196F3" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => removeFilter(filter.id)}>
                <Ionicons name="trash-outline" size={20} color="#F44336" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      {/* Sort Options */}
      <View style={styles.sortSection}>
        <Text style={styles.sectionTitle}>排序方式</Text>
        <View style={styles.sortOptions}>
          <View style={styles.sortOption}>
            <Text style={styles.sortLabel}>排序字段:</Text>
            <TouchableOpacity style={styles.sortSelector}>
              <Text style={styles.sortValue}>{sortBy}</Text>
              <Ionicons name="chevron-down" size={16} color="#666" />
            </TouchableOpacity>
          </View>
          <View style={styles.sortOption}>
            <Text style={styles.sortLabel}>排序方向:</Text>
            <TouchableOpacity
              style={styles.sortToggle}
              onPress={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            >
              <Ionicons
                name={sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'}
                size={16}
                color="#2196F3"
              />
              <Text style={styles.sortToggleText}>
                {sortOrder === 'asc' ? '升序' : '降序'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.saveQueryButton}
          onPress={() => setShowSaveQueryModal(true)}
        >
          <Ionicons name="bookmark-outline" size={16} color="#2196F3" />
          <Text style={styles.saveQueryText}>保存查询</Text>
        </TouchableOpacity>
      </View>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <View style={styles.resultsSection}>
          <Text style={styles.sectionTitle}>搜索结果 ({searchResults.length})</Text>
          {searchResults.map((result) => (
            <View key={result.id} style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <Ionicons
                  name={getResultTypeIcon(result.type)}
                  size={24}
                  color={getResultTypeColor(result.type)}
                />
                <View style={styles.resultInfo}>
                  <Text style={styles.resultTitle}>{result.title}</Text>
                  <Text style={styles.resultSubtitle}>{result.subtitle}</Text>
                </View>
                <View style={styles.relevanceScore}>
                  <Text style={styles.scoreText}>{result.relevanceScore}%</Text>
                </View>
              </View>
              <Text style={styles.resultDescription}>{result.description}</Text>
              <View style={styles.resultFooter}>
                <View style={styles.matchedFields}>
                  {result.matchedFields.map((field) => (
                    <View key={field} style={styles.matchedField}>
                      <Text style={styles.matchedFieldText}>{field}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );

  const renderQueriesTab = () => (
    <ScrollView style={styles.tabContent}>
      {savedQueries.map((query) => (
        <View key={query.id} style={styles.queryCard}>
          <View style={styles.queryHeader}>
            <View style={styles.queryInfo}>
              <Text style={styles.queryName}>{query.name}</Text>
              <Text style={styles.queryDescription}>{query.description}</Text>
              <Text style={styles.queryMeta}>
                创建: {query.createdAt} • 最后使用: {query.lastUsed || '从未'}
              </Text>
            </View>
            <View style={styles.queryActions}>
              <TouchableOpacity
                style={styles.queryAction}
                onPress={() => loadQuery(query)}
              >
                <Ionicons name="play" size={16} color="#4CAF50" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.queryAction}
                onPress={() => {
                  setSelectedQuery(query);
                  setShowQueryDetailModal(true);
                }}
              >
                <Ionicons name="eye" size={16} color="#2196F3" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.queryAction}
                onPress={() => deleteQuery(query.id)}
              >
                <Ionicons name="trash" size={16} color="#F44336" />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.queryFilters}>
            <Text style={styles.filtersCount}>
              {query.filters.length} 个筛选条件
            </Text>
            {query.isPublic && (
              <View style={styles.publicBadge}>
                <Text style={styles.publicText}>公开</Text>
              </View>
            )}
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const renderHistoryTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.historyHeader}>
        <Text style={styles.sectionTitle}>搜索历史</Text>
        <TouchableOpacity style={styles.clearHistoryButton} onPress={clearHistory}>
          <Text style={styles.clearHistoryText}>清空历史</Text>
        </TouchableOpacity>
      </View>

      {searchHistory.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.historyItem}
          onPress={() => {
            setSearchQuery(item.query);
            setFilters(item.filters);
            setActiveTab('search');
          }}
        >
          <View style={styles.historyInfo}>
            <Text style={styles.historyQuery}>{item.query}</Text>
            <Text style={styles.historyMeta}>
              {item.timestamp} • {item.resultCount} 个结果
            </Text>
            {item.filters.length > 0 && (
              <Text style={styles.historyFilters}>
                {item.filters.length} 个筛选条件
              </Text>
            )}
          </View>
          <Ionicons name="chevron-forward" size={16} color="#666" />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>高级搜索</Text>
      </View>

      <View style={styles.tabContainer}>
        {[
          { key: 'search', label: '搜索', icon: 'search-outline' },
          { key: 'queries', label: '保存的查询', icon: 'bookmark-outline' },
          { key: 'history', label: '历史记录', icon: 'time-outline' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => setActiveTab(tab.key as any)}
          >
            <Ionicons
              name={tab.icon as any}
              size={18}
              color={activeTab === tab.key ? '#2196F3' : '#666'}
            />
            <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {activeTab === 'search' && renderSearchTab()}
        {activeTab === 'queries' && renderQueriesTab()}
        {activeTab === 'history' && renderHistoryTab()}
      </ScrollView>

      {/* Save Query Modal */}
      <Modal
        visible={showSaveQueryModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>保存查询</Text>
            <TouchableOpacity onPress={() => setShowSaveQueryModal(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>查询名称</Text>
              <TextInput
                style={styles.input}
                value={queryName}
                onChangeText={setQueryName}
                placeholder="输入查询名称"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>描述</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={queryDescription}
                onChangeText={setQueryDescription}
                placeholder="输入查询描述（可选）"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>分类</Text>
              <View style={styles.categorySelector}>
                {['general', 'job', 'company', 'user'].map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryOption,
                      queryCategory === category && styles.selectedCategory,
                    ]}
                    onPress={() => setQueryCategory(category)}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        queryCategory === category && styles.selectedCategoryText,
                      ]}
                    >
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <View style={styles.switchRow}>
                <Text style={styles.label}>公开查询</Text>
                <Switch
                  value={queryIsPublic}
                  onValueChange={setQueryIsPublic}
                  trackColor={{ false: '#767577', true: '#81b0ff' }}
                  thumbColor={queryIsPublic ? '#f5dd4b' : '#f4f3f4'}
                />
              </View>
              <Text style={styles.helpText}>
                公开查询可以被其他用户查看和使用
              </Text>
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowSaveQueryModal(false)}
            >
              <Text style={styles.cancelButtonText}>取消</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.confirmButton]}
              onPress={saveQuery}
            >
              <Text style={styles.confirmButtonText}>保存</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#2196F3',
  },
  tabText: {
    fontSize: 12,
    color: '#666',
  },
  activeTabText: {
    color: '#2196F3',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  searchButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  typeOption: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedType: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196F3',
  },
  typeText: {
    fontSize: 12,
    color: '#666',
  },
  selectedTypeText: {
    color: '#2196F3',
    fontWeight: '600',
  },
  filtersSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filtersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  addFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addFilterText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '600',
  },
  filterItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  filterName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    minWidth: 80,
  },
  filterValue: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  disabledText: {
    opacity: 0.5,
  },
  filterActions: {
    flexDirection: 'row',
    gap: 10,
  },
  sortSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sortOptions: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 10,
  },
  sortOption: {
    flex: 1,
  },
  sortLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  sortSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
    padding: 8,
  },
  sortValue: {
    fontSize: 14,
    color: '#333',
  },
  sortToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
    padding: 8,
    gap: 4,
  },
  sortToggleText: {
    fontSize: 14,
    color: '#2196F3',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  saveQueryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  saveQueryText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '600',
  },
  resultsSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultCard: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingVertical: 15,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  resultInfo: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  resultSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  relevanceScore: {
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  scoreText: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '600',
  },
  resultDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  resultFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  matchedFields: {
    flexDirection: 'row',
    gap: 6,
  },
  matchedField: {
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  matchedFieldText: {
    fontSize: 10,
    color: '#666',
  },
  queryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  queryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  queryInfo: {
    flex: 1,
  },
  queryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  queryDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  queryMeta: {
    fontSize: 10,
    color: '#999',
  },
  queryActions: {
    flexDirection: 'row',
    gap: 8,
  },
  queryAction: {
    padding: 6,
  },
  queryFilters: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filtersCount: {
    fontSize: 12,
    color: '#666',
  },
  publicBadge: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  publicText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  clearHistoryButton: {
    padding: 8,
  },
  clearHistoryText: {
    fontSize: 14,
    color: '#F44336',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  historyInfo: {
    flex: 1,
  },
  historyQuery: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  historyMeta: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  historyFilters: {
    fontSize: 10,
    color: '#999',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  categorySelector: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryOption: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  selectedCategory: {
    borderColor: '#2196F3',
    backgroundColor: '#e3f2fd',
  },
  categoryText: {
    fontSize: 12,
    color: '#666',
  },
  selectedCategoryText: {
    color: '#2196F3',
    fontWeight: '600',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  confirmButton: {
    backgroundColor: '#2196F3',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AdvancedSearch;