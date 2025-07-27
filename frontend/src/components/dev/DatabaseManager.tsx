import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Switch,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface DatabaseManagerProps {
  navigation?: any;
}

interface DatabaseConnection {
  id: string;
  name: string;
  type: 'postgresql' | 'mysql' | 'mongodb' | 'redis' | 'sqlite';
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
  status: 'connected' | 'disconnected' | 'error';
  lastConnected?: Date;
  connectionString?: string;
  options: Record<string, any>;
}

interface DatabaseQuery {
  id: string;
  connectionId: string;
  name: string;
  query: string;
  type: 'select' | 'insert' | 'update' | 'delete' | 'create' | 'drop';
  favorite: boolean;
  lastExecuted?: Date;
  executionTime?: number;
  resultCount?: number;
}

interface QueryResult {
  id: string;
  queryId: string;
  data: any[];
  columns: string[];
  executionTime: number;
  timestamp: Date;
  error?: string;
}

const DatabaseManager: React.FC<DatabaseManagerProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const [connections, setConnections] = useState<DatabaseConnection[]>([]);
  const [queries, setQueries] = useState<DatabaseQuery[]>([]);
  const [queryResults, setQueryResults] = useState<QueryResult[]>([]);
  const [selectedConnection, setSelectedConnection] = useState<DatabaseConnection | null>(null);
  const [selectedQuery, setSelectedQuery] = useState<DatabaseQuery | null>(null);
  const [activeTab, setActiveTab] = useState<'connections' | 'queries' | 'results'>('connections');
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [showQueryModal, setShowQueryModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [editingConnection, setEditingConnection] = useState<Partial<DatabaseConnection>>({});
  const [editingQuery, setEditingQuery] = useState<Partial<DatabaseQuery>>({});
  const [queryText, setQueryText] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);

  useEffect(() => {
    loadConnections();
    loadQueries();
    loadQueryResults();
  }, []);

  const loadConnections = async () => {
    try {
      const storedConnections = await AsyncStorage.getItem('db_connections');
      if (storedConnections) {
        const parsedConnections = JSON.parse(storedConnections).map((conn: any) => ({
          ...conn,
          lastConnected: conn.lastConnected ? new Date(conn.lastConnected) : undefined,
        }));
        setConnections(parsedConnections);
      } else {
        // 初始化示例连接
        const defaultConnections: DatabaseConnection[] = [
          {
            id: '1',
            name: '本地PostgreSQL',
            type: 'postgresql',
            host: 'localhost',
            port: 5432,
            database: 'citywork',
            username: 'postgres',
            password: 'password',
            ssl: false,
            status: 'disconnected',
            options: {
              maxConnections: 10,
              timeout: 30000,
            },
          },
          {
            id: '2',
            name: '生产MySQL',
            type: 'mysql',
            host: 'prod-mysql.example.com',
            port: 3306,
            database: 'citywork_prod',
            username: 'app_user',
            password: 'secure_password',
            ssl: true,
            status: 'disconnected',
            options: {
              charset: 'utf8mb4',
              timezone: 'UTC',
            },
          },
          {
            id: '3',
            name: 'MongoDB集群',
            type: 'mongodb',
            host: 'mongodb-cluster.example.com',
            port: 27017,
            database: 'citywork',
            username: 'admin',
            password: 'admin_password',
            ssl: true,
            status: 'disconnected',
            options: {
              authSource: 'admin',
              replicaSet: 'rs0',
            },
          },
          {
            id: '4',
            name: 'Redis缓存',
            type: 'redis',
            host: 'redis.example.com',
            port: 6379,
            database: '0',
            username: '',
            password: 'redis_password',
            ssl: false,
            status: 'disconnected',
            options: {
              keyPrefix: 'citywork:',
              retryDelayOnFailover: 100,
            },
          },
        ];
        setConnections(defaultConnections);
        await AsyncStorage.setItem('db_connections', JSON.stringify(defaultConnections));
      }
    } catch (error) {
      console.error('加载数据库连接失败:', error);
    }
  };

  const loadQueries = async () => {
    try {
      const storedQueries = await AsyncStorage.getItem('db_queries');
      if (storedQueries) {
        const parsedQueries = JSON.parse(storedQueries).map((query: any) => ({
          ...query,
          lastExecuted: query.lastExecuted ? new Date(query.lastExecuted) : undefined,
        }));
        setQueries(parsedQueries);
      } else {
        // 初始化示例查询
        const defaultQueries: DatabaseQuery[] = [
          {
            id: '1',
            connectionId: '1',
            name: '获取所有用户',
            query: 'SELECT id, username, email, created_at FROM users ORDER BY created_at DESC LIMIT 100;',
            type: 'select',
            favorite: true,
          },
          {
            id: '2',
            connectionId: '1',
            name: '活跃职位统计',
            query: `SELECT 
              COUNT(*) as total_jobs,
              COUNT(CASE WHEN status = 'active' THEN 1 END) as active_jobs,
              COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as recent_jobs
            FROM jobs;`,
            type: 'select',
            favorite: true,
          },
          {
            id: '3',
            connectionId: '2',
            name: '用户申请统计',
            query: `SELECT 
              u.username,
              COUNT(a.id) as application_count,
              MAX(a.created_at) as last_application
            FROM users u
            LEFT JOIN applications a ON u.id = a.user_id
            GROUP BY u.id, u.username
            ORDER BY application_count DESC;`,
            type: 'select',
            favorite: false,
          },
          {
            id: '4',
            connectionId: '3',
            name: '公司信息查询',
            query: `db.companies.find({
              "status": "active",
              "employees": { "$gte": 10 }
            }).sort({ "created_at": -1 }).limit(50)`,
            type: 'select',
            favorite: true,
          },
        ];
        setQueries(defaultQueries);
        await AsyncStorage.setItem('db_queries', JSON.stringify(defaultQueries));
      }
    } catch (error) {
      console.error('加载查询失败:', error);
    }
  };

  const loadQueryResults = async () => {
    try {
      const storedResults = await AsyncStorage.getItem('query_results');
      if (storedResults) {
        const parsedResults = JSON.parse(storedResults).map((result: any) => ({
          ...result,
          timestamp: new Date(result.timestamp),
        }));
        setQueryResults(parsedResults);
      }
    } catch (error) {
      console.error('加载查询结果失败:', error);
    }
  };

  const saveConnections = async (updatedConnections: DatabaseConnection[]) => {
    try {
      await AsyncStorage.setItem('db_connections', JSON.stringify(updatedConnections));
      setConnections(updatedConnections);
    } catch (error) {
      console.error('保存连接失败:', error);
    }
  };

  const saveQueries = async (updatedQueries: DatabaseQuery[]) => {
    try {
      await AsyncStorage.setItem('db_queries', JSON.stringify(updatedQueries));
      setQueries(updatedQueries);
    } catch (error) {
      console.error('保存查询失败:', error);
    }
  };

  const testConnection = async (connection: DatabaseConnection) => {
    try {
      // 模拟连接测试
      const updatedConnections = connections.map(conn =>
        conn.id === connection.id
          ? { ...conn, status: 'connected' as const, lastConnected: new Date() }
          : conn
      );
      await saveConnections(updatedConnections);
      Alert.alert('连接成功', `已成功连接到 ${connection.name}`);
    } catch (error) {
      const updatedConnections = connections.map(conn =>
        conn.id === connection.id
          ? { ...conn, status: 'error' as const }
          : conn
      );
      await saveConnections(updatedConnections);
      Alert.alert('连接失败', '无法连接到数据库');
    }
  };

  const executeQuery = async (query: DatabaseQuery) => {
    if (!selectedConnection) {
      Alert.alert('错误', '请先选择数据库连接');
      return;
    }

    setIsExecuting(true);
    try {
      // 模拟查询执行
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

      // 生成模拟结果
      const mockData = generateMockQueryResult(query);
      const result: QueryResult = {
        id: Date.now().toString(),
        queryId: query.id,
        data: mockData.data,
        columns: mockData.columns,
        executionTime: Math.round(Math.random() * 1000 + 100),
        timestamp: new Date(),
      };

      const updatedResults = [result, ...queryResults.slice(0, 49)]; // 保留最近50个结果
      setQueryResults(updatedResults);
      await AsyncStorage.setItem('query_results', JSON.stringify(updatedResults));

      // 更新查询统计
      const updatedQueries = queries.map(q =>
        q.id === query.id
          ? {
              ...q,
              lastExecuted: new Date(),
              executionTime: result.executionTime,
              resultCount: result.data.length,
            }
          : q
      );
      await saveQueries(updatedQueries);

      setActiveTab('results');
      Alert.alert('执行成功', `查询已执行，返回 ${result.data.length} 条记录`);
    } catch (error) {
      Alert.alert('执行失败', '查询执行出错');
    } finally {
      setIsExecuting(false);
    }
  };

  const generateMockQueryResult = (query: DatabaseQuery) => {
    const { type } = query;
    
    if (type === 'select') {
      if (query.query.toLowerCase().includes('users')) {
        return {
          columns: ['id', 'username', 'email', 'created_at'],
          data: Array.from({ length: Math.floor(Math.random() * 20) + 5 }, (_, i) => ({
            id: i + 1,
            username: `user${i + 1}`,
            email: `user${i + 1}@example.com`,
            created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          })),
        };
      } else if (query.query.toLowerCase().includes('jobs')) {
        return {
          columns: ['total_jobs', 'active_jobs', 'recent_jobs'],
          data: [{
            total_jobs: Math.floor(Math.random() * 1000) + 500,
            active_jobs: Math.floor(Math.random() * 300) + 200,
            recent_jobs: Math.floor(Math.random() * 50) + 10,
          }],
        };
      } else if (query.query.toLowerCase().includes('companies')) {
        return {
          columns: ['name', 'industry', 'employees', 'status'],
          data: Array.from({ length: Math.floor(Math.random() * 15) + 5 }, (_, i) => ({
            name: `Company ${i + 1}`,
            industry: ['Technology', 'Finance', 'Healthcare', 'Education'][Math.floor(Math.random() * 4)],
            employees: Math.floor(Math.random() * 500) + 10,
            status: 'active',
          })),
        };
      }
    }

    return {
      columns: ['result'],
      data: [{ result: 'Query executed successfully' }],
    };
  };

  const createConnection = async () => {
    if (!editingConnection.name || !editingConnection.host) {
      Alert.alert('错误', '请填写连接名称和主机地址');
      return;
    }

    const newConnection: DatabaseConnection = {
      id: Date.now().toString(),
      name: editingConnection.name!,
      type: editingConnection.type || 'postgresql',
      host: editingConnection.host!,
      port: editingConnection.port || 5432,
      database: editingConnection.database || '',
      username: editingConnection.username || '',
      password: editingConnection.password || '',
      ssl: editingConnection.ssl || false,
      status: 'disconnected',
      options: editingConnection.options || {},
    };

    const updatedConnections = [...connections, newConnection];
    await saveConnections(updatedConnections);

    setEditingConnection({});
    setShowConnectionModal(false);
  };

  const createQuery = async () => {
    if (!editingQuery.name || !editingQuery.query) {
      Alert.alert('错误', '请填写查询名称和SQL语句');
      return;
    }

    const newQuery: DatabaseQuery = {
      id: Date.now().toString(),
      connectionId: selectedConnection?.id || connections[0]?.id || '',
      name: editingQuery.name!,
      query: editingQuery.query!,
      type: editingQuery.type || 'select',
      favorite: editingQuery.favorite || false,
    };

    const updatedQueries = [...queries, newQuery];
    await saveQueries(updatedQueries);

    setEditingQuery({});
    setShowQueryModal(false);
  };

  const deleteConnection = async (connectionId: string) => {
    Alert.alert(
      '删除确认',
      '确定要删除这个数据库连接吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            const updatedConnections = connections.filter(c => c.id !== connectionId);
            await saveConnections(updatedConnections);
          },
        },
      ]
    );
  };

  const deleteQuery = async (queryId: string) => {
    Alert.alert(
      '删除确认',
      '确定要删除这个查询吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            const updatedQueries = queries.filter(q => q.id !== queryId);
            await saveQueries(updatedQueries);
          },
        },
      ]
    );
  };

  const toggleQueryFavorite = async (queryId: string) => {
    const updatedQueries = queries.map(q =>
      q.id === queryId ? { ...q, favorite: !q.favorite } : q
    );
    await saveQueries(updatedQueries);
  };

  const getConnectionStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return '#4CAF50';
      case 'error':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const getConnectionStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return 'checkmark-circle';
      case 'error':
        return 'close-circle';
      default:
        return 'ellipse';
    }
  };

  const getDatabaseIcon = (type: string) => {
    switch (type) {
      case 'postgresql':
        return 'server';
      case 'mysql':
        return 'server';
      case 'mongodb':
        return 'leaf';
      case 'redis':
        return 'flash';
      case 'sqlite':
        return 'document';
      default:
        return 'server';
    }
  };

  const getQueryTypeColor = (type: string) => {
    switch (type) {
      case 'select':
        return '#2196F3';
      case 'insert':
        return '#4CAF50';
      case 'update':
        return '#FF9800';
      case 'delete':
        return '#F44336';
      case 'create':
        return '#9C27B0';
      case 'drop':
        return '#795548';
      default:
        return '#9E9E9E';
    }
  };

  const renderConnectionsTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.tabHeader}>
        <Text style={[styles.tabTitle, { color: theme.colors.text }]}>
          数据库连接
        </Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => setShowConnectionModal(true)}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {connections.map((connection) => (
        <View
          key={connection.id}
          style={[styles.connectionCard, { backgroundColor: theme.colors.surface }]}
        >
          <View style={styles.connectionHeader}>
            <View style={styles.connectionInfo}>
              <View style={styles.connectionTitleRow}>
                <Ionicons
                  name={getDatabaseIcon(connection.type) as any}
                  size={20}
                  color={theme.colors.primary}
                />
                <Text style={[styles.connectionName, { color: theme.colors.text }]}>
                  {connection.name}
                </Text>
                <View
                  style={[
                    styles.statusIndicator,
                    { backgroundColor: getConnectionStatusColor(connection.status) },
                  ]}
                >
                  <Ionicons
                    name={getConnectionStatusIcon(connection.status) as any}
                    size={12}
                    color="#FFFFFF"
                  />
                </View>
              </View>
              <Text style={[styles.connectionDetails, { color: theme.colors.textSecondary }]}>
                {connection.type.toUpperCase()} • {connection.host}:{connection.port}
              </Text>
              <Text style={[styles.connectionDatabase, { color: theme.colors.textSecondary }]}>
                数据库: {connection.database}
              </Text>
              {connection.lastConnected && (
                <Text style={[styles.connectionLastConnected, { color: theme.colors.textSecondary }]}>
                  最后连接: {connection.lastConnected.toLocaleString()}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.connectionActions}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => testConnection(connection)}
            >
              <Ionicons name="play" size={16} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>测试连接</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
              onPress={() => setSelectedConnection(connection)}
            >
              <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>选择</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#F44336' }]}
              onPress={() => deleteConnection(connection.id)}
            >
              <Ionicons name="trash" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const renderQueriesTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.tabHeader}>
        <Text style={[styles.tabTitle, { color: theme.colors.text }]}>
          SQL查询
        </Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => setShowQueryModal(true)}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {selectedConnection && (
        <View style={[styles.selectedConnection, { backgroundColor: theme.colors.surface }]}>
          <Ionicons name="link" size={16} color={theme.colors.primary} />
          <Text style={[styles.selectedConnectionText, { color: theme.colors.text }]}>
            当前连接: {selectedConnection.name}
          </Text>
        </View>
      )}

      {queries
        .filter(query => !selectedConnection || query.connectionId === selectedConnection.id)
        .map((query) => (
          <View
            key={query.id}
            style={[styles.queryCard, { backgroundColor: theme.colors.surface }]}
          >
            <View style={styles.queryHeader}>
              <View style={styles.queryInfo}>
                <View style={styles.queryTitleRow}>
                  <Text style={[styles.queryName, { color: theme.colors.text }]}>
                    {query.name}
                  </Text>
                  <View
                    style={[
                      styles.queryTypeBadge,
                      { backgroundColor: getQueryTypeColor(query.type) },
                    ]}
                  >
                    <Text style={styles.queryTypeBadgeText}>
                      {query.type.toUpperCase()}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => toggleQueryFavorite(query.id)}
                  >
                    <Ionicons
                      name={query.favorite ? 'star' : 'star-outline'}
                      size={16}
                      color={query.favorite ? '#FFD700' : theme.colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
                <Text
                  style={[styles.queryText, { color: theme.colors.textSecondary }]}
                  numberOfLines={3}
                >
                  {query.query}
                </Text>
                {query.lastExecuted && (
                  <Text style={[styles.queryMeta, { color: theme.colors.textSecondary }]}>
                    最后执行: {query.lastExecuted.toLocaleString()} • 
                    耗时: {query.executionTime}ms • 
                    结果: {query.resultCount} 条
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.queryActions}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => executeQuery(query)}
                disabled={isExecuting}
              >
                <Ionicons name="play" size={16} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>
                  {isExecuting ? '执行中...' : '执行'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#FF9800' }]}
                onPress={() => {
                  setEditingQuery(query);
                  setShowQueryModal(true);
                }}
              >
                <Ionicons name="create" size={16} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#F44336' }]}
                onPress={() => deleteQuery(query.id)}
              >
                <Ionicons name="trash" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
    </ScrollView>
  );

  const renderResultsTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.tabHeader}>
        <Text style={[styles.tabTitle, { color: theme.colors.text }]}>
          查询结果
        </Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: '#F44336' }]}
          onPress={() => {
            setQueryResults([]);
            AsyncStorage.removeItem('query_results');
          }}
        >
          <Ionicons name="trash" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {queryResults.map((result) => {
        const query = queries.find(q => q.id === result.queryId);
        return (
          <View
            key={result.id}
            style={[styles.resultCard, { backgroundColor: theme.colors.surface }]}
          >
            <View style={styles.resultHeader}>
              <View style={styles.resultInfo}>
                <Text style={[styles.resultQuery, { color: theme.colors.text }]}>
                  {query?.name || '未知查询'}
                </Text>
                <Text style={[styles.resultMeta, { color: theme.colors.textSecondary }]}>
                  {result.timestamp.toLocaleString()} • 
                  耗时: {result.executionTime}ms • 
                  {result.data.length} 条记录
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.viewButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => {
                  setSelectedQuery(query || null);
                  setShowResultModal(true);
                }}
              >
                <Ionicons name="eye" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {result.error ? (
              <View style={styles.errorContainer}>
                <Ionicons name="warning" size={16} color="#F44336" />
                <Text style={[styles.errorText, { color: '#F44336' }]}>
                  {result.error}
                </Text>
              </View>
            ) : (
              <View style={styles.resultPreview}>
                <Text style={[styles.resultColumns, { color: theme.colors.textSecondary }]}>
                  列: {result.columns.join(', ')}
                </Text>
                {result.data.slice(0, 3).map((row, index) => (
                  <Text
                    key={index}
                    style={[styles.resultRow, { color: theme.colors.textSecondary }]}
                    numberOfLines={1}
                  >
                    {JSON.stringify(row)}
                  </Text>
                ))}
                {result.data.length > 3 && (
                  <Text style={[styles.resultMore, { color: theme.colors.textSecondary }]}>
                    ... 还有 {result.data.length - 3} 条记录
                  </Text>
                )}
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* 头部 */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          数据库管理
        </Text>
      </View>

      {/* 标签页 */}
      <View style={styles.tabBar}>
        {(['connections', 'queries', 'results'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tabButton,
              {
                backgroundColor: activeTab === tab
                  ? theme.colors.primary
                  : theme.colors.surface,
              },
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Ionicons
              name={
                tab === 'connections' ? 'server' :
                tab === 'queries' ? 'code' : 'list'
              }
              size={16}
              color={activeTab === tab ? '#FFFFFF' : theme.colors.text}
            />
            <Text
              style={[
                styles.tabButtonText,
                {
                  color: activeTab === tab ? '#FFFFFF' : theme.colors.text,
                },
              ]}
            >
              {tab === 'connections' ? '连接' :
               tab === 'queries' ? '查询' : '结果'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 标签页内容 */}
      {activeTab === 'connections' && renderConnectionsTab()}
      {activeTab === 'queries' && renderQueriesTab()}
      {activeTab === 'results' && renderResultsTab()}

      {/* 连接模态框 */}
      <Modal
        visible={showConnectionModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowConnectionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              新建数据库连接
            </Text>
            
            <ScrollView style={styles.connectionForm}>
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: theme.colors.text }]}>
                  连接名称 *
                </Text>
                <TextInput
                  style={[styles.formInput, { 
                    backgroundColor: theme.colors.background,
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                  }]}
                  value={editingConnection.name}
                  onChangeText={(text) => setEditingConnection(prev => ({ ...prev, name: text }))}
                  placeholder="输入连接名称"
                  placeholderTextColor={theme.colors.textSecondary}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: theme.colors.text }]}>
                  数据库类型
                </Text>
                <View style={styles.typeSelector}>
                  {(['postgresql', 'mysql', 'mongodb', 'redis', 'sqlite'] as const).map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.typeSelectorButton,
                        {
                          backgroundColor: editingConnection.type === type
                            ? theme.colors.primary
                            : theme.colors.background,
                          borderColor: theme.colors.primary,
                        },
                      ]}
                      onPress={() => setEditingConnection(prev => ({ ...prev, type }))}
                    >
                      <Text
                        style={[
                          styles.typeSelectorText,
                          {
                            color: editingConnection.type === type
                              ? '#FFFFFF'
                              : theme.colors.primary,
                          },
                        ]}
                      >
                        {type.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 2 }]}>
                  <Text style={[styles.formLabel, { color: theme.colors.text }]}>
                    主机地址 *
                  </Text>
                  <TextInput
                    style={[styles.formInput, { 
                      backgroundColor: theme.colors.background,
                      color: theme.colors.text,
                      borderColor: theme.colors.border,
                    }]}
                    value={editingConnection.host}
                    onChangeText={(text) => setEditingConnection(prev => ({ ...prev, host: text }))}
                    placeholder="localhost"
                    placeholderTextColor={theme.colors.textSecondary}
                  />
                </View>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={[styles.formLabel, { color: theme.colors.text }]}>
                    端口
                  </Text>
                  <TextInput
                    style={[styles.formInput, { 
                      backgroundColor: theme.colors.background,
                      color: theme.colors.text,
                      borderColor: theme.colors.border,
                    }]}
                    value={editingConnection.port?.toString()}
                    onChangeText={(text) => setEditingConnection(prev => ({ ...prev, port: parseInt(text) || 5432 }))}
                    placeholder="5432"
                    placeholderTextColor={theme.colors.textSecondary}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: theme.colors.text }]}>
                  数据库名称
                </Text>
                <TextInput
                  style={[styles.formInput, { 
                    backgroundColor: theme.colors.background,
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                  }]}
                  value={editingConnection.database}
                  onChangeText={(text) => setEditingConnection(prev => ({ ...prev, database: text }))}
                  placeholder="数据库名称"
                  placeholderTextColor={theme.colors.textSecondary}
                />
              </View>

              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={[styles.formLabel, { color: theme.colors.text }]}>
                    用户名
                  </Text>
                  <TextInput
                    style={[styles.formInput, { 
                      backgroundColor: theme.colors.background,
                      color: theme.colors.text,
                      borderColor: theme.colors.border,
                    }]}
                    value={editingConnection.username}
                    onChangeText={(text) => setEditingConnection(prev => ({ ...prev, username: text }))}
                    placeholder="用户名"
                    placeholderTextColor={theme.colors.textSecondary}
                  />
                </View>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={[styles.formLabel, { color: theme.colors.text }]}>
                    密码
                  </Text>
                  <TextInput
                    style={[styles.formInput, { 
                      backgroundColor: theme.colors.background,
                      color: theme.colors.text,
                      borderColor: theme.colors.border,
                    }]}
                    value={editingConnection.password}
                    onChangeText={(text) => setEditingConnection(prev => ({ ...prev, password: text }))}
                    placeholder="密码"
                    placeholderTextColor={theme.colors.textSecondary}
                    secureTextEntry
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <View style={styles.switchRow}>
                  <Text style={[styles.formLabel, { color: theme.colors.text }]}>
                    启用SSL
                  </Text>
                  <Switch
                    value={editingConnection.ssl}
                    onValueChange={(ssl) => setEditingConnection(prev => ({ ...prev, ssl }))}
                    trackColor={{ false: '#E0E0E0', true: theme.colors.primary }}
                    thumbColor={editingConnection.ssl ? '#FFFFFF' : '#F4F3F4'}
                  />
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.colors.background }]}
                onPress={() => {
                  setShowConnectionModal(false);
                  setEditingConnection({});
                }}
              >
                <Text style={[styles.modalButtonText, { color: theme.colors.text }]}>
                  取消
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.colors.primary }]}
                onPress={createConnection}
              >
                <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>
                  创建
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 查询模态框 */}
      <Modal
        visible={showQueryModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowQueryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              {editingQuery.id ? '编辑查询' : '新建查询'}
            </Text>
            
            <ScrollView style={styles.queryForm}>
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: theme.colors.text }]}>
                  查询名称 *
                </Text>
                <TextInput
                  style={[styles.formInput, { 
                    backgroundColor: theme.colors.background,
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                  }]}
                  value={editingQuery.name}
                  onChangeText={(text) => setEditingQuery(prev => ({ ...prev, name: text }))}
                  placeholder="输入查询名称"
                  placeholderTextColor={theme.colors.textSecondary}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: theme.colors.text }]}>
                  查询类型
                </Text>
                <View style={styles.typeSelector}>
                  {(['select', 'insert', 'update', 'delete', 'create', 'drop'] as const).map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.typeSelectorButton,
                        {
                          backgroundColor: editingQuery.type === type
                            ? getQueryTypeColor(type)
                            : theme.colors.background,
                          borderColor: getQueryTypeColor(type),
                        },
                      ]}
                      onPress={() => setEditingQuery(prev => ({ ...prev, type }))}
                    >
                      <Text
                        style={[
                          styles.typeSelectorText,
                          {
                            color: editingQuery.type === type
                              ? '#FFFFFF'
                              : getQueryTypeColor(type),
                          },
                        ]}
                      >
                        {type.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: theme.colors.text }]}>
                  SQL语句 *
                </Text>
                <TextInput
                  style={[styles.formInput, styles.queryTextArea, { 
                    backgroundColor: theme.colors.background,
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                  }]}
                  value={editingQuery.query}
                  onChangeText={(text) => setEditingQuery(prev => ({ ...prev, query: text }))}
                  placeholder="输入SQL查询语句..."
                  placeholderTextColor={theme.colors.textSecondary}
                  multiline
                  numberOfLines={8}
                />
              </View>

              <View style={styles.formGroup}>
                <View style={styles.switchRow}>
                  <Text style={[styles.formLabel, { color: theme.colors.text }]}>
                    添加到收藏
                  </Text>
                  <Switch
                    value={editingQuery.favorite}
                    onValueChange={(favorite) => setEditingQuery(prev => ({ ...prev, favorite }))}
                    trackColor={{ false: '#E0E0E0', true: theme.colors.primary }}
                    thumbColor={editingQuery.favorite ? '#FFFFFF' : '#F4F3F4'}
                  />
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.colors.background }]}
                onPress={() => {
                  setShowQueryModal(false);
                  setEditingQuery({});
                }}
              >
                <Text style={[styles.modalButtonText, { color: theme.colors.text }]}>
                  取消
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.colors.primary }]}
                onPress={createQuery}
              >
                <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>
                  {editingQuery.id ? '保存' : '创建'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 结果查看模态框 */}
      <Modal
        visible={showResultModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowResultModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.resultModalContent, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              查询结果
            </Text>
            
            {selectedQuery && (
              <View style={styles.resultDetails}>
                <Text style={[styles.resultQueryName, { color: theme.colors.text }]}>
                  {selectedQuery.name}
                </Text>
                <ScrollView style={styles.resultData}>
                  {/* 这里可以添加表格或其他数据展示组件 */}
                  <Text style={[styles.resultDataText, { color: theme.colors.textSecondary }]}>
                    查询结果将在这里显示...
                  </Text>
                </ScrollView>
              </View>
            )}

            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => setShowResultModal(false)}
            >
              <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>
                关闭
              </Text>
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
  },
  header: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 4,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  tabHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tabTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  addButton: {
    padding: 8,
    borderRadius: 6,
  },
  selectedConnection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  selectedConnectionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  connectionCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  connectionHeader: {
    marginBottom: 12,
  },
  connectionInfo: {
    flex: 1,
  },
  connectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  connectionName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  statusIndicator: {
    padding: 4,
    borderRadius: 12,
  },
  connectionDetails: {
    fontSize: 14,
    marginBottom: 2,
  },
  connectionDatabase: {
    fontSize: 12,
    marginBottom: 2,
  },
  connectionLastConnected: {
    fontSize: 12,
  },
  connectionActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  queryCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  queryHeader: {
    marginBottom: 12,
  },
  queryInfo: {
    flex: 1,
  },
  queryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  queryName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  queryTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  queryTypeBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  queryText: {
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  queryMeta: {
    fontSize: 10,
  },
  queryActions: {
    flexDirection: 'row',
    gap: 8,
  },
  resultCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultInfo: {
    flex: 1,
  },
  resultQuery: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  resultMeta: {
    fontSize: 12,
  },
  viewButton: {
    padding: 8,
    borderRadius: 6,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  errorText: {
    fontSize: 12,
    flex: 1,
  },
  resultPreview: {
    marginTop: 8,
  },
  resultColumns: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  resultRow: {
    fontSize: 10,
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  resultMore: {
    fontSize: 10,
    fontStyle: 'italic',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 12,
    padding: 20,
  },
  resultModalContent: {
    width: '95%',
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  connectionForm: {
    maxHeight: 400,
  },
  queryForm: {
    maxHeight: 400,
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  formInput: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 16,
  },
  queryTextArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeSelectorButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 16,
  },
  typeSelectorText: {
    fontSize: 12,
    fontWeight: '500',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  resultDetails: {
    flex: 1,
    marginBottom: 16,
  },
  resultQueryName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  resultData: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
  },
  resultDataText: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default DatabaseManager;