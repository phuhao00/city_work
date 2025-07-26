import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
  Dimensions,
  SafeAreaView,
  TextInput,
  Alert,
} from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { CreatePostModal } from './CreatePostModal';

interface FeedItem {
  _id: string;
  type: 'job_post' | 'company_update' | 'user_achievement' | 'industry_news';
  author: {
    _id: string;
    name: string;
    avatar?: string;
    title?: string;
    company?: string;
  };
  content: string;
  images?: string[];
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  createdAt: string;
  tags?: string[];
}

interface FeedScreenProps {
  navigation?: any;
}

export const FeedScreen: React.FC<FeedScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [feedData, setFeedData] = useState<FeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [filteredData, setFilteredData] = useState<FeedItem[]>([]);

  // Mock data - 实际项目中应该从API获取
  const mockFeedData: FeedItem[] = [
    {
      _id: '1',
      type: 'job_post',
      author: {
        _id: 'company1',
        name: '腾讯科技',
        avatar: '',
        title: 'HR招聘专员',
        company: '腾讯科技'
      },
      content: '我们正在寻找优秀的前端工程师加入我们的团队！要求熟悉React、Vue等前端框架，有3年以上工作经验。薪资面议，福利优厚。',
      likes: 128,
      comments: 23,
      shares: 15,
      isLiked: false,
      createdAt: '2024-01-15T10:30:00Z',
      tags: ['前端工程师', '腾讯', '招聘']
    },
    {
      _id: '2',
      type: 'user_achievement',
      author: {
        _id: 'user1',
        name: '张小明',
        avatar: '',
        title: '高级产品经理',
        company: '字节跳动'
      },
      content: '很高兴分享，我刚刚通过了PMP认证考试！感谢团队的支持和帮助。继续在产品管理的道路上前进！',
      likes: 89,
      comments: 12,
      shares: 8,
      isLiked: true,
      createdAt: '2024-01-15T09:15:00Z',
      tags: ['PMP认证', '产品经理', '职业发展']
    },
    {
      _id: '3',
      type: 'industry_news',
      author: {
        _id: 'news1',
        name: '科技日报',
        avatar: '',
        title: '官方媒体',
        company: '科技日报'
      },
      content: '2024年AI行业发展趋势报告发布：人工智能将在更多传统行业落地应用，预计创造500万个新就业岗位。',
      likes: 256,
      comments: 45,
      shares: 78,
      isLiked: false,
      createdAt: '2024-01-15T08:00:00Z',
      tags: ['AI', '人工智能', '就业趋势']
    }
  ];

  React.useEffect(() => {
    setFeedData(mockFeedData);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    // 模拟API调用
    setTimeout(() => {
      setFeedData(mockFeedData);
      setRefreshing(false);
    }, 1000);
  };

  const handleLike = (itemId: string) => {
    const updatedData = feedData.map(item => {
      if (item._id === itemId) {
        return {
          ...item,
          isLiked: !item.isLiked,
          likes: item.isLiked ? item.likes - 1 : item.likes + 1,
        };
      }
      return item;
    });
    setFeedData(updatedData);
    updateFilteredData(updatedData, searchQuery);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    updateFilteredData(feedData, query);
  };

  const updateFilteredData = (data: FeedItem[], query: string) => {
    if (!query.trim()) {
      setFilteredData(data);
      return;
    }

    const filtered = data.filter(item => 
      item.content.toLowerCase().includes(query.toLowerCase()) ||
      item.author.name.toLowerCase().includes(query.toLowerCase()) ||
      item.author.company.toLowerCase().includes(query.toLowerCase()) ||
      (item.tags && item.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase())))
    );
    setFilteredData(filtered);
  };

  const handleCreatePost = async (postData: any) => {
    const newPost: FeedItem = {
      ...postData,
      _id: Date.now().toString(),
    };
    
    const updatedData = [newPost, ...feedData];
    setFeedData(updatedData);
    updateFilteredData(updatedData, searchQuery);
  };

  // 初始化过滤数据
  React.useEffect(() => {
    updateFilteredData(feedData, searchQuery);
  }, [feedData]);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return '刚刚';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}小时前`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}天前`;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'job_post': return '💼';
      case 'company_update': return '🏢';
      case 'user_achievement': return '🎉';
      case 'industry_news': return '📰';
      default: return '📝';
    }
  };

  const renderFeedItem = ({ item }: { item: FeedItem }) => (
    <View style={[styles.feedItem, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
      {/* 作者信息 */}
      <View style={styles.authorSection}>
        <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
          <Text style={styles.avatarText}>
            {item.author.name[0]}
          </Text>
        </View>
        <View style={styles.authorInfo}>
          <View style={styles.authorHeader}>
            <Text style={[styles.authorName, { color: theme.colors.text }]}>
              {item.author.name}
            </Text>
            <Text style={styles.typeIcon}>{getTypeIcon(item.type)}</Text>
          </View>
          <Text style={[styles.authorTitle, { color: theme.colors.gray }]}>
            {item.author.title} · {item.author.company}
          </Text>
          <Text style={[styles.timestamp, { color: theme.colors.gray }]}>
            {formatTime(item.createdAt)}
          </Text>
        </View>
      </View>

      {/* 内容 */}
      <Text style={[styles.content, { color: theme.colors.text }]}>
        {item.content}
      </Text>

      {/* 标签 */}
      {item.tags && item.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {item.tags.map((tag, index) => (
            <View key={index} style={[styles.tag, { backgroundColor: theme.colors.primary + '20' }]}>
              <Text style={[styles.tagText, { color: theme.colors.primary }]}>
                #{tag}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* 互动按钮 */}
      <View style={[styles.actionBar, { borderTopColor: theme.colors.border }]}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleLike(item._id)}
        >
          <Text style={styles.actionIcon}>
            {item.isLiked ? '❤️' : '🤍'}
          </Text>
          <Text style={[styles.actionText, { color: theme.colors.gray }]}>
            {item.likes}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionIcon}>💬</Text>
          <Text style={[styles.actionText, { color: theme.colors.gray }]}>
            {item.comments}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionIcon}>🔄</Text>
          <Text style={[styles.actionText, { color: theme.colors.gray }]}>
            {item.shares}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* 头部搜索栏 */}
      <View style={[styles.header, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
        <View style={[styles.searchContainer, { backgroundColor: theme.colors.background }]}>
          <Text style={[styles.searchIcon, { color: theme.colors.gray }]}>🔍</Text>
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text }]}
            placeholder="搜索动态、用户或标签..."
            placeholderTextColor={theme.colors.gray}
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Text style={[styles.clearButton, { color: theme.colors.gray }]}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity 
          style={[styles.createButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => setIsCreateModalVisible(true)}
        >
          <Text style={styles.createButtonText}>发布</Text>
        </TouchableOpacity>
      </View>

      {/* 搜索结果提示 */}
      {searchQuery.length > 0 && (
        <View style={[styles.searchResultsHeader, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.searchResultsText, { color: theme.colors.text }]}>
            找到 {filteredData.length} 条相关动态
          </Text>
        </View>
      )}

      <FlatList
        data={filteredData}
        renderItem={renderFeedItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => (
          <View style={[styles.separator, { backgroundColor: theme.colors.border }]} />
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.colors.gray }]}>
              {searchQuery ? '没有找到相关动态' : '暂无动态'}
            </Text>
            {!searchQuery && (
              <TouchableOpacity 
                style={[styles.emptyCreateButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => setIsCreateModalVisible(true)}
              >
                <Text style={styles.emptyCreateButtonText}>发布第一条动态</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      />

      {/* 发布模态框 */}
      <CreatePostModal
        visible={isCreateModalVisible}
        onClose={() => setIsCreateModalVisible(false)}
        onSubmit={handleCreatePost}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 4,
  },
  clearButton: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingHorizontal: 4,
  },
  createButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  searchResultsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchResultsText: {
    fontSize: 14,
    fontWeight: '500',
  },
  separator: {
    height: 1,
    marginHorizontal: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyCreateButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  emptyCreateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  postButton: {
    padding: 8,
  },
  postIcon: {
    fontSize: 20,
  },
  listContainer: {
    paddingBottom: 16,
  },
  feedItem: {
    margin: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  authorSection: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  authorInfo: {
    flex: 1,
  },
  authorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
  },
  typeIcon: {
    fontSize: 16,
  },
  authorTitle: {
    fontSize: 14,
    marginTop: 2,
  },
  timestamp: {
    fontSize: 12,
    marginTop: 2,
  },
  content: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  actionIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  actionText: {
    fontSize: 14,
  },
});