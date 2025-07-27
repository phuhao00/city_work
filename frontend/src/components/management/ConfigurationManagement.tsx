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
  Picker,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ConfigItem {
  id: string;
  key: string;
  value: string | number | boolean;
  type: 'string' | 'number' | 'boolean' | 'json' | 'password';
  category: string;
  description: string;
  required: boolean;
  editable: boolean;
  lastModified: string;
  modifiedBy: string;
  defaultValue?: string | number | boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    options?: string[];
  };
}

interface ConfigCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  itemCount: number;
}

interface ConfigHistory {
  id: string;
  configId: string;
  oldValue: any;
  newValue: any;
  timestamp: string;
  user: string;
  action: 'create' | 'update' | 'delete';
}

const ConfigurationManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'configs' | 'categories' | 'history' | 'import'>('configs');
  const [configs, setConfigs] = useState<ConfigItem[]>([]);
  const [categories, setCategories] = useState<ConfigCategory[]>([]);
  const [history, setHistory] = useState<ConfigHistory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingConfig, setEditingConfig] = useState<ConfigItem | null>(null);
  const [newConfigValue, setNewConfigValue] = useState<string>('');
  const [showPassword, setShowPassword] = useState<{ [key: string]: boolean }>({});

  // Mock data generation
  useEffect(() => {
    generateMockData();
  }, []);

  const generateMockData = () => {
    const mockCategories: ConfigCategory[] = [
      {
        id: '1',
        name: 'Database',
        description: 'Database connection and configuration settings',
        icon: 'server-outline',
        itemCount: 8,
      },
      {
        id: '2',
        name: 'Security',
        description: 'Security and authentication settings',
        icon: 'shield-checkmark-outline',
        itemCount: 12,
      },
      {
        id: '3',
        name: 'API',
        description: 'API endpoints and service configurations',
        icon: 'cloud-outline',
        itemCount: 6,
      },
      {
        id: '4',
        name: 'UI/UX',
        description: 'User interface and experience settings',
        icon: 'color-palette-outline',
        itemCount: 5,
      },
      {
        id: '5',
        name: 'Performance',
        description: 'Performance optimization settings',
        icon: 'speedometer-outline',
        itemCount: 7,
      },
    ];

    const mockConfigs: ConfigItem[] = [
      {
        id: '1',
        key: 'database.host',
        value: 'localhost',
        type: 'string',
        category: 'Database',
        description: 'Database server hostname',
        required: true,
        editable: true,
        lastModified: new Date().toISOString(),
        modifiedBy: 'admin',
        defaultValue: 'localhost',
      },
      {
        id: '2',
        key: 'database.port',
        value: 5432,
        type: 'number',
        category: 'Database',
        description: 'Database server port',
        required: true,
        editable: true,
        lastModified: new Date().toISOString(),
        modifiedBy: 'admin',
        defaultValue: 5432,
        validation: { min: 1, max: 65535 },
      },
      {
        id: '3',
        key: 'database.password',
        value: 'secretpassword123',
        type: 'password',
        category: 'Database',
        description: 'Database connection password',
        required: true,
        editable: true,
        lastModified: new Date().toISOString(),
        modifiedBy: 'admin',
      },
      {
        id: '4',
        key: 'security.enable_2fa',
        value: true,
        type: 'boolean',
        category: 'Security',
        description: 'Enable two-factor authentication',
        required: false,
        editable: true,
        lastModified: new Date().toISOString(),
        modifiedBy: 'security_admin',
        defaultValue: false,
      },
      {
        id: '5',
        key: 'security.session_timeout',
        value: 3600,
        type: 'number',
        category: 'Security',
        description: 'Session timeout in seconds',
        required: true,
        editable: true,
        lastModified: new Date().toISOString(),
        modifiedBy: 'security_admin',
        defaultValue: 1800,
        validation: { min: 300, max: 86400 },
      },
      {
        id: '6',
        key: 'api.rate_limit',
        value: 1000,
        type: 'number',
        category: 'API',
        description: 'API rate limit per hour',
        required: true,
        editable: true,
        lastModified: new Date().toISOString(),
        modifiedBy: 'api_admin',
        defaultValue: 500,
        validation: { min: 100, max: 10000 },
      },
      {
        id: '7',
        key: 'ui.theme',
        value: 'light',
        type: 'string',
        category: 'UI/UX',
        description: 'Default application theme',
        required: true,
        editable: true,
        lastModified: new Date().toISOString(),
        modifiedBy: 'ui_admin',
        defaultValue: 'light',
        validation: { options: ['light', 'dark', 'auto'] },
      },
      {
        id: '8',
        key: 'performance.cache_enabled',
        value: true,
        type: 'boolean',
        category: 'Performance',
        description: 'Enable application caching',
        required: false,
        editable: true,
        lastModified: new Date().toISOString(),
        modifiedBy: 'perf_admin',
        defaultValue: true,
      },
      {
        id: '9',
        key: 'performance.cache_ttl',
        value: 300,
        type: 'number',
        category: 'Performance',
        description: 'Cache time-to-live in seconds',
        required: true,
        editable: true,
        lastModified: new Date().toISOString(),
        modifiedBy: 'perf_admin',
        defaultValue: 300,
        validation: { min: 60, max: 3600 },
      },
      {
        id: '10',
        key: 'api.endpoints',
        value: JSON.stringify({
          auth: '/api/v1/auth',
          users: '/api/v1/users',
          data: '/api/v1/data'
        }),
        type: 'json',
        category: 'API',
        description: 'API endpoint configuration',
        required: true,
        editable: true,
        lastModified: new Date().toISOString(),
        modifiedBy: 'api_admin',
      },
    ];

    const mockHistory: ConfigHistory[] = [
      {
        id: '1',
        configId: '4',
        oldValue: false,
        newValue: true,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        user: 'security_admin',
        action: 'update',
      },
      {
        id: '2',
        configId: '6',
        oldValue: 500,
        newValue: 1000,
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        user: 'api_admin',
        action: 'update',
      },
      {
        id: '3',
        configId: '9',
        oldValue: 600,
        newValue: 300,
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        user: 'perf_admin',
        action: 'update',
      },
    ];

    setCategories(mockCategories);
    setConfigs(mockConfigs);
    setHistory(mockHistory);
  };

  const filteredConfigs = configs.filter(config => {
    const matchesSearch = config.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         config.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || config.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleConfigUpdate = (configId: string, newValue: any) => {
    const config = configs.find(c => c.id === configId);
    if (!config) return;

    // Validate the new value
    if (config.validation) {
      if (config.type === 'number') {
        const numValue = Number(newValue);
        if (config.validation.min && numValue < config.validation.min) {
          Alert.alert('Validation Error', `Value must be at least ${config.validation.min}`);
          return;
        }
        if (config.validation.max && numValue > config.validation.max) {
          Alert.alert('Validation Error', `Value must be at most ${config.validation.max}`);
          return;
        }
      }
      if (config.validation.options && !config.validation.options.includes(newValue)) {
        Alert.alert('Validation Error', `Value must be one of: ${config.validation.options.join(', ')}`);
        return;
      }
    }

    // Add to history
    const historyEntry: ConfigHistory = {
      id: Date.now().toString(),
      configId,
      oldValue: config.value,
      newValue,
      timestamp: new Date().toISOString(),
      user: 'current_user',
      action: 'update',
    };

    setHistory(prev => [historyEntry, ...prev]);

    // Update config
    setConfigs(prev => prev.map(c =>
      c.id === configId
        ? { ...c, value: newValue, lastModified: new Date().toISOString(), modifiedBy: 'current_user' }
        : c
    ));

    setShowConfigModal(false);
    setEditingConfig(null);
    setNewConfigValue('');
  };

  const renderConfigValue = (config: ConfigItem) => {
    switch (config.type) {
      case 'password':
        return showPassword[config.id] ? config.value : '••••••••';
      case 'boolean':
        return config.value ? 'true' : 'false';
      case 'json':
        try {
          return JSON.stringify(JSON.parse(config.value as string), null, 2);
        } catch {
          return config.value;
        }
      default:
        return config.value.toString();
    }
  };

  const renderConfigEditor = (config: ConfigItem) => {
    switch (config.type) {
      case 'boolean':
        return (
          <Switch
            value={newConfigValue === 'true'}
            onValueChange={(value) => setNewConfigValue(value.toString())}
            trackColor={{ false: '#e0e0e0', true: '#2196F3' }}
            thumbColor={newConfigValue === 'true' ? '#fff' : '#f4f3f4'}
          />
        );
      case 'string':
      case 'password':
        return (
          <TextInput
            style={styles.input}
            value={newConfigValue}
            onChangeText={setNewConfigValue}
            placeholder={`Enter ${config.type}`}
            secureTextEntry={config.type === 'password'}
            multiline={config.type === 'json'}
          />
        );
      case 'number':
        return (
          <TextInput
            style={styles.input}
            value={newConfigValue}
            onChangeText={setNewConfigValue}
            placeholder="Enter number"
            keyboardType="numeric"
          />
        );
      case 'json':
        return (
          <TextInput
            style={[styles.input, styles.jsonInput]}
            value={newConfigValue}
            onChangeText={setNewConfigValue}
            placeholder="Enter JSON"
            multiline
          />
        );
      default:
        return (
          <TextInput
            style={styles.input}
            value={newConfigValue}
            onChangeText={setNewConfigValue}
            placeholder="Enter value"
          />
        );
    }
  };

  const renderConfigs = () => (
    <View style={styles.content}>
      <View style={styles.controlsContainer}>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search configurations..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.categoryFilter}>
          <Text style={styles.filterLabel}>Category:</Text>
          <TouchableOpacity
            style={styles.categoryButton}
            onPress={() => {
              const allCategories = ['all', ...categories.map(c => c.name)];
              const currentIndex = allCategories.indexOf(selectedCategory);
              const nextIndex = (currentIndex + 1) % allCategories.length;
              setSelectedCategory(allCategories[nextIndex]);
            }}
          >
            <Text style={styles.categoryButtonText}>{selectedCategory}</Text>
            <Ionicons name="chevron-down-outline" size={16} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={filteredConfigs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.configCard}>
            <View style={styles.configHeader}>
              <View style={styles.configInfo}>
                <Text style={styles.configKey}>{item.key}</Text>
                <Text style={styles.configCategory}>{item.category}</Text>
              </View>
              <View style={styles.configActions}>
                {item.type === 'password' && (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => setShowPassword(prev => ({
                      ...prev,
                      [item.id]: !prev[item.id]
                    }))}
                  >
                    <Ionicons
                      name={showPassword[item.id] ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color="#666"
                    />
                  </TouchableOpacity>
                )}
                {item.editable && (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => {
                      setEditingConfig(item);
                      setNewConfigValue(item.value.toString());
                      setShowConfigModal(true);
                    }}
                  >
                    <Ionicons name="create-outline" size={20} color="#2196F3" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <Text style={styles.configDescription}>{item.description}</Text>

            <View style={styles.configValueContainer}>
              <Text style={styles.configValueLabel}>Value:</Text>
              <Text style={[
                styles.configValue,
                item.type === 'json' && styles.jsonValue
              ]}>
                {renderConfigValue(item)}
              </Text>
            </View>

            <View style={styles.configMeta}>
              <Text style={styles.configMetaText}>
                Type: {item.type} • Required: {item.required ? 'Yes' : 'No'}
              </Text>
              <Text style={styles.configMetaText}>
                Modified by {item.modifiedBy} on {new Date(item.lastModified).toLocaleString()}
              </Text>
            </View>

            {item.validation && (
              <View style={styles.validationInfo}>
                <Text style={styles.validationLabel}>Validation:</Text>
                {item.validation.min && (
                  <Text style={styles.validationText}>Min: {item.validation.min}</Text>
                )}
                {item.validation.max && (
                  <Text style={styles.validationText}>Max: {item.validation.max}</Text>
                )}
                {item.validation.options && (
                  <Text style={styles.validationText}>
                    Options: {item.validation.options.join(', ')}
                  </Text>
                )}
              </View>
            )}
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );

  const renderCategories = () => (
    <View style={styles.content}>
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.categoryCard}
            onPress={() => {
              setSelectedCategory(item.name);
              setActiveTab('configs');
            }}
          >
            <View style={styles.categoryHeader}>
              <Ionicons name={item.icon as any} size={24} color="#2196F3" />
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryName}>{item.name}</Text>
                <Text style={styles.categoryDescription}>{item.description}</Text>
              </View>
              <View style={styles.categoryCount}>
                <Text style={styles.categoryCountText}>{item.itemCount}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );

  const renderHistory = () => (
    <View style={styles.content}>
      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const config = configs.find(c => c.id === item.configId);
          return (
            <View style={styles.historyCard}>
              <View style={styles.historyHeader}>
                <Ionicons
                  name={item.action === 'create' ? 'add-circle-outline' :
                        item.action === 'update' ? 'create-outline' : 'trash-outline'}
                  size={20}
                  color={item.action === 'create' ? '#4CAF50' :
                         item.action === 'update' ? '#2196F3' : '#F44336'}
                />
                <View style={styles.historyInfo}>
                  <Text style={styles.historyAction}>
                    {item.action.toUpperCase()} - {config?.key || 'Unknown Config'}
                  </Text>
                  <Text style={styles.historyUser}>by {item.user}</Text>
                </View>
                <Text style={styles.historyTimestamp}>
                  {new Date(item.timestamp).toLocaleString()}
                </Text>
              </View>

              <View style={styles.historyChanges}>
                <View style={styles.historyChange}>
                  <Text style={styles.historyChangeLabel}>Old Value:</Text>
                  <Text style={styles.historyChangeValue}>
                    {typeof item.oldValue === 'object' ? JSON.stringify(item.oldValue) : item.oldValue?.toString() || 'N/A'}
                  </Text>
                </View>
                <View style={styles.historyChange}>
                  <Text style={styles.historyChangeLabel}>New Value:</Text>
                  <Text style={styles.historyChangeValue}>
                    {typeof item.newValue === 'object' ? JSON.stringify(item.newValue) : item.newValue?.toString() || 'N/A'}
                  </Text>
                </View>
              </View>
            </View>
          );
        }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );

  const renderImport = () => (
    <View style={styles.content}>
      <View style={styles.importContainer}>
        <Text style={styles.importTitle}>Import/Export Configurations</Text>
        
        <View style={styles.importSection}>
          <Text style={styles.sectionTitle}>Export</Text>
          <TouchableOpacity style={styles.exportButton}>
            <Ionicons name="download-outline" size={20} color="#2196F3" />
            <Text style={styles.exportButtonText}>Export All Configurations</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.importSection}>
          <Text style={styles.sectionTitle}>Import</Text>
          <TouchableOpacity
            style={styles.importButton}
            onPress={() => setShowImportModal(true)}
          >
            <Ionicons name="cloud-upload-outline" size={20} color="#4CAF50" />
            <Text style={styles.importButtonText}>Import Configurations</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.importSection}>
          <Text style={styles.sectionTitle}>Backup</Text>
          <TouchableOpacity style={styles.backupButton}>
            <Ionicons name="archive-outline" size={20} color="#FF9800" />
            <Text style={styles.backupButtonText}>Create Backup</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Configuration Management</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={generateMockData}
        >
          <Ionicons name="refresh-outline" size={24} color="#2196F3" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        {[
          { key: 'configs', label: 'Configs', icon: 'settings-outline' },
          { key: 'categories', label: 'Categories', icon: 'folder-outline' },
          { key: 'history', label: 'History', icon: 'time-outline' },
          { key: 'import', label: 'Import/Export', icon: 'swap-horizontal-outline' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => setActiveTab(tab.key as any)}
          >
            <Ionicons
              name={tab.icon as any}
              size={20}
              color={activeTab === tab.key ? '#2196F3' : '#666'}
            />
            <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'configs' && renderConfigs()}
      {activeTab === 'categories' && renderCategories()}
      {activeTab === 'history' && renderHistory()}
      {activeTab === 'import' && renderImport()}

      {/* Config Edit Modal */}
      <Modal
        visible={showConfigModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Configuration</Text>
            <TouchableOpacity onPress={() => setShowConfigModal(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            {editingConfig && (
              <View>
                <Text style={styles.modalSectionTitle}>Configuration Details</Text>
                <Text style={styles.modalText}>Key: {editingConfig.key}</Text>
                <Text style={styles.modalText}>Type: {editingConfig.type}</Text>
                <Text style={styles.modalText}>Category: {editingConfig.category}</Text>
                <Text style={styles.modalText}>Description: {editingConfig.description}</Text>
                
                <Text style={styles.modalSectionTitle}>Current Value</Text>
                <Text style={styles.modalText}>{renderConfigValue(editingConfig)}</Text>
                
                <Text style={styles.modalSectionTitle}>New Value</Text>
                {renderConfigEditor(editingConfig)}
                
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={() => handleConfigUpdate(editingConfig.id, 
                    editingConfig.type === 'number' ? Number(newConfigValue) :
                    editingConfig.type === 'boolean' ? newConfigValue === 'true' :
                    newConfigValue
                  )}
                >
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Import Modal */}
      <Modal
        visible={showImportModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Import Configurations</Text>
            <TouchableOpacity onPress={() => setShowImportModal(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalText}>Import functionality would be implemented here...</Text>
          </ScrollView>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  refreshButton: {
    padding: 8,
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
    gap: 4,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#2196F3',
  },
  tabText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#2196F3',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  controlsContainer: {
    marginBottom: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  categoryFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  filterLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 4,
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#333',
    textTransform: 'capitalize',
  },
  configCard: {
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
  configHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  configInfo: {
    flex: 1,
  },
  configKey: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  configCategory: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  configActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  configDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  configValueContainer: {
    marginBottom: 8,
  },
  configValueLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  configValue: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'monospace',
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 4,
  },
  jsonValue: {
    fontSize: 12,
  },
  configMeta: {
    marginBottom: 8,
  },
  configMetaText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  validationInfo: {
    backgroundColor: '#f0f8ff',
    padding: 8,
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#2196F3',
  },
  validationLabel: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '600',
    marginBottom: 4,
  },
  validationText: {
    fontSize: 12,
    color: '#666',
  },
  categoryCard: {
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
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  categoryDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  categoryCount: {
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  categoryCountText: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '600',
  },
  historyCard: {
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
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  historyInfo: {
    flex: 1,
  },
  historyAction: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  historyUser: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  historyTimestamp: {
    fontSize: 12,
    color: '#999',
  },
  historyChanges: {
    gap: 8,
  },
  historyChange: {
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 4,
  },
  historyChangeLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    marginBottom: 2,
  },
  historyChangeValue: {
    fontSize: 12,
    color: '#333',
    fontFamily: 'monospace',
  },
  importContainer: {
    gap: 20,
  },
  importTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  importSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  exportButtonText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
  },
  importButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e8',
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  importButtonText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  backupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3e0',
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  backupButtonText: {
    fontSize: 14,
    color: '#FF9800',
    fontWeight: '500',
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
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  modalText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#333',
    marginBottom: 15,
  },
  jsonInput: {
    height: 120,
    textAlignVertical: 'top',
    fontFamily: 'monospace',
  },
  saveButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});

export default ConfigurationManagement;