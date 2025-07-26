import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface User {
  id: string;
  name: string;
  avatar: string;
  title: string;
  company: string;
  location: string;
  industry: string;
  connections: number;
  mutualConnections: number;
  verified: boolean;
  premium: boolean;
  skills: string[];
  bio: string;
}

interface Post {
  id: string;
  userId: string;
  user: User;
  content: string;
  images?: string[];
  timestamp: Date;
  likes: number;
  comments: number;
  shares: number;
  liked: boolean;
  type: 'text' | 'image' | 'article' | 'job' | 'achievement';
  tags?: string[];
}

interface Comment {
  id: string;
  postId: string;
  userId: string;
  user: User;
  content: string;
  timestamp: Date;
  likes: number;
  liked: boolean;
  replies?: Comment[];
}

interface NetworkEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  type: 'conference' | 'meetup' | 'workshop' | 'networking';
  attendees: number;
  maxAttendees: number;
  price: number;
  organizer: User;
  tags: string[];
  attending: boolean;
}

const SocialNetworkScreen: React.FC = () => {
  const { theme } = useTheme();
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [events, setEvents] = useState<NetworkEvent[]>([]);
  const [selectedTab, setSelectedTab] = useState<'feed' | 'network' | 'events' | 'messages'>('feed');
  const [showPostModal, setShowPostModal] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSocialData();
  }, []);

  const loadSocialData = async () => {
    try {
      // 模拟 API 调用
      setTimeout(() => {
        const mockUsers: User[] = [
          {
            id: '1',
            name: '张伟',
            avatar: 'https://via.placeholder.com/50',
            title: '高级前端工程师',
            company: 'TechCorp',
            location: '北京',
            industry: '互联网科技',
            connections: 1250,
            mutualConnections: 23,
            verified: true,
            premium: true,
            skills: ['React', 'TypeScript', 'Node.js'],
            bio: '专注于前端技术，热爱开源，乐于分享',
          },
          {
            id: '2',
            name: '李娜',
            avatar: 'https://via.placeholder.com/50',
            title: '产品经理',
            company: 'StartupXYZ',
            location: '上海',
            industry: '金融科技',
            connections: 890,
            mutualConnections: 15,
            verified: true,
            premium: false,
            skills: ['产品设计', '用户研究', '数据分析'],
            bio: '用户体验驱动的产品经理',
          },
          {
            id: '3',
            name: '王强',
            avatar: 'https://via.placeholder.com/50',
            title: 'UI/UX 设计师',
            company: 'DesignStudio',
            location: '深圳',
            industry: '设计',
            connections: 567,
            mutualConnections: 8,
            verified: false,
            premium: false,
            skills: ['UI设计', 'UX设计', 'Figma'],
            bio: '追求极致用户体验的设计师',
          },
        ];

        setUsers(mockUsers);

        setPosts([
          {
            id: '1',
            userId: '1',
            user: mockUsers[0],
            content: '刚刚完成了一个复杂的微前端项目，使用了 qiankun 框架。整个过程中学到了很多关于模块联邦和应用隔离的知识。分享一些心得：\n\n1. 合理的应用拆分策略很重要\n2. 公共依赖的管理需要特别注意\n3. 样式隔离是个技术难点\n\n有同样经验的朋友欢迎交流！ #微前端 #前端架构',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
            likes: 45,
            comments: 12,
            shares: 8,
            liked: false,
            type: 'text',
            tags: ['微前端', '前端架构'],
          },
          {
            id: '2',
            userId: '2',
            user: mockUsers[1],
            content: '参加了今天的产品经理大会，收获满满！特别是关于 AI 在产品设计中的应用，让我对未来的产品发展有了新的思考。\n\n几个关键点：\n• AI 可以帮助个性化推荐\n• 用户行为预测变得更准确\n• 自动化测试覆盖更全面\n\n期待在实际项目中应用这些理念！',
            images: ['https://via.placeholder.com/300x200'],
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6),
            likes: 32,
            comments: 7,
            shares: 5,
            liked: true,
            type: 'image',
            tags: ['产品管理', 'AI'],
          },
          {
            id: '3',
            userId: '3',
            user: mockUsers[2],
            content: '设计系统 2.0 正式发布！🎉\n\n经过 3 个月的努力，我们团队完成了设计系统的重大升级：\n\n✨ 新增 50+ 组件\n🎨 支持深色模式\n📱 完全响应式设计\n🔧 更好的开发者体验\n\n感谢所有参与的同事，这是团队协作的胜利！',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12),
            likes: 78,
            comments: 23,
            shares: 15,
            liked: false,
            type: 'achievement',
            tags: ['设计系统', '团队协作'],
          },
        ]);

        setEvents([
          {
            id: '1',
            title: '前端技术大会 2024',
            description: '汇聚前端领域最新技术趋势，邀请行业专家分享实战经验',
            date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
            location: '北京国际会议中心',
            type: 'conference',
            attendees: 1250,
            maxAttendees: 2000,
            price: 299,
            organizer: mockUsers[0],
            tags: ['前端', '技术', '大会'],
            attending: false,
          },
          {
            id: '2',
            title: 'React 开发者聚会',
            description: '本地 React 开发者交流聚会，分享最佳实践和新特性',
            date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
            location: '上海创业咖啡',
            type: 'meetup',
            attendees: 45,
            maxAttendees: 60,
            price: 0,
            organizer: mockUsers[1],
            tags: ['React', '聚会', '交流'],
            attending: true,
          },
          {
            id: '3',
            title: 'UI/UX 设计工作坊',
            description: '实战导向的设计工作坊，学习最新的设计方法和工具',
            date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
            location: '深圳设计中心',
            type: 'workshop',
            attendees: 28,
            maxAttendees: 40,
            price: 199,
            organizer: mockUsers[2],
            tags: ['设计', '工作坊', 'UX'],
            attending: false,
          },
        ]);

        setComments([
          {
            id: '1',
            postId: '1',
            userId: '2',
            user: mockUsers[1],
            content: '很棒的分享！我们也在考虑微前端架构，能详细说说样式隔离是怎么解决的吗？',
            timestamp: new Date(Date.now() - 1000 * 60 * 60),
            likes: 5,
            liked: false,
          },
          {
            id: '2',
            postId: '1',
            userId: '3',
            user: mockUsers[2],
            content: '赞同！模块联邦确实是个不错的方案，我们团队也在研究中',
            timestamp: new Date(Date.now() - 1000 * 60 * 30),
            likes: 3,
            liked: true,
          },
        ]);

        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('加载社交数据失败:', error);
      Alert.alert('错误', '加载数据失败，请稍后重试');
      setLoading(false);
    }
  };

  const handleLikePost = (postId: string) => {
    setPosts(prev =>
      prev.map(post =>
        post.id === postId
          ? {
              ...post,
              liked: !post.liked,
              likes: post.liked ? post.likes - 1 : post.likes + 1,
            }
          : post
      )
    );
  };

  const handleSharePost = (post: Post) => {
    Alert.alert(
      '分享动态',
      '选择分享方式',
      [
        { text: '取消', style: 'cancel' },
        { text: '复制链接', onPress: () => Alert.alert('成功', '链接已复制到剪贴板') },
        { text: '分享到朋友圈', onPress: () => Alert.alert('成功', '已分享到朋友圈') },
      ]
    );
  };

  const handleCommentPost = (post: Post) => {
    setSelectedPost(post);
    setShowCommentsModal(true);
  };

  const handlePublishPost = () => {
    if (!newPostContent.trim()) {
      Alert.alert('提示', '请输入动态内容');
      return;
    }

    const newPost: Post = {
      id: Date.now().toString(),
      userId: 'current_user',
      user: {
        id: 'current_user',
        name: '我',
        avatar: 'https://via.placeholder.com/50',
        title: '前端工程师',
        company: 'City Work',
        location: '北京',
        industry: '互联网',
        connections: 500,
        mutualConnections: 0,
        verified: true,
        premium: false,
        skills: ['React', 'JavaScript'],
        bio: '',
      },
      content: newPostContent,
      timestamp: new Date(),
      likes: 0,
      comments: 0,
      shares: 0,
      liked: false,
      type: 'text',
    };

    setPosts(prev => [newPost, ...prev]);
    setNewPostContent('');
    setShowPostModal(false);
    Alert.alert('成功', '动态发布成功！');
  };

  const handleConnectUser = (userId: string) => {
    Alert.alert(
      '发送连接请求',
      '确定要向该用户发送连接请求吗？',
      [
        { text: '取消', style: 'cancel' },
        { 
          text: '发送', 
          onPress: () => Alert.alert('成功', '连接请求已发送')
        },
      ]
    );
  };

  const handleJoinEvent = (eventId: string) => {
    setEvents(prev =>
      prev.map(event =>
        event.id === eventId
          ? {
              ...event,
              attending: !event.attending,
              attendees: event.attending ? event.attendees - 1 : event.attendees + 1,
            }
          : event
      )
    );
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (hours < 1) return '刚刚';
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    
    return timestamp.toLocaleDateString('zh-CN');
  };

  const getPostTypeIcon = (type: Post['type']) => {
    switch (type) {
      case 'image':
        return 'image';
      case 'article':
        return 'document-text';
      case 'job':
        return 'briefcase';
      case 'achievement':
        return 'trophy';
      default:
        return 'chatbubble-ellipses';
    }
  };

  const renderPost = ({ item: post }: { item: Post }) => (
    <View style={[styles.postCard, { backgroundColor: theme.surface }]}>
      <View style={styles.postHeader}>
        <Image source={{ uri: post.user.avatar }} style={styles.userAvatar} />
        <View style={styles.userInfo}>
          <View style={styles.userNameRow}>
            <Text style={[styles.userName, { color: theme.text }]}>
              {post.user.name}
            </Text>
            {post.user.verified && (
              <Ionicons name="checkmark-circle" size={16} color={theme.success} />
            )}
            {post.user.premium && (
              <Ionicons name="star" size={16} color={theme.warning} />
            )}
          </View>
          <Text style={[styles.userTitle, { color: theme.textSecondary }]}>
            {post.user.title} • {post.user.company}
          </Text>
          <Text style={[styles.postTime, { color: theme.textSecondary }]}>
            {formatTimestamp(post.timestamp)}
          </Text>
        </View>
        <View style={styles.postTypeIcon}>
          <Ionicons 
            name={getPostTypeIcon(post.type)} 
            size={16} 
            color={theme.primary} 
          />
        </View>
      </View>

      <Text style={[styles.postContent, { color: theme.text }]}>
        {post.content}
      </Text>

      {post.images && post.images.length > 0 && (
        <ScrollView horizontal style={styles.postImages} showsHorizontalScrollIndicator={false}>
          {post.images.map((image, index) => (
            <Image key={index} source={{ uri: image }} style={styles.postImage} />
          ))}
        </ScrollView>
      )}

      {post.tags && post.tags.length > 0 && (
        <View style={styles.postTags}>
          {post.tags.map((tag, index) => (
            <TouchableOpacity key={index} style={[styles.postTag, { backgroundColor: theme.primary + '20' }]}>
              <Text style={[styles.postTagText, { color: theme.primary }]}>
                #{tag}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.postStats}>
        <Text style={[styles.postStat, { color: theme.textSecondary }]}>
          {post.likes} 赞
        </Text>
        <Text style={[styles.postStat, { color: theme.textSecondary }]}>
          {post.comments} 评论
        </Text>
        <Text style={[styles.postStat, { color: theme.textSecondary }]}>
          {post.shares} 分享
        </Text>
      </View>

      <View style={[styles.postActions, { borderTopColor: theme.border }]}>
        <TouchableOpacity
          style={styles.postAction}
          onPress={() => handleLikePost(post.id)}
        >
          <Ionicons
            name={post.liked ? "heart" : "heart-outline"}
            size={20}
            color={post.liked ? theme.error : theme.textSecondary}
          />
          <Text style={[
            styles.postActionText,
            { color: post.liked ? theme.error : theme.textSecondary }
          ]}>
            赞
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.postAction}
          onPress={() => handleCommentPost(post)}
        >
          <Ionicons name="chatbubble-outline" size={20} color={theme.textSecondary} />
          <Text style={[styles.postActionText, { color: theme.textSecondary }]}>
            评论
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.postAction}
          onPress={() => handleSharePost(post)}
        >
          <Ionicons name="share-outline" size={20} color={theme.textSecondary} />
          <Text style={[styles.postActionText, { color: theme.textSecondary }]}>
            分享
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderUser = ({ item: user }: { item: User }) => (
    <View style={[styles.userCard, { backgroundColor: theme.surface }]}>
      <Image source={{ uri: user.avatar }} style={styles.userCardAvatar} />
      <View style={styles.userCardInfo}>
        <View style={styles.userCardNameRow}>
          <Text style={[styles.userCardName, { color: theme.text }]}>
            {user.name}
          </Text>
          {user.verified && (
            <Ionicons name="checkmark-circle" size={16} color={theme.success} />
          )}
        </View>
        <Text style={[styles.userCardTitle, { color: theme.textSecondary }]}>
          {user.title}
        </Text>
        <Text style={[styles.userCardCompany, { color: theme.textSecondary }]}>
          {user.company} • {user.location}
        </Text>
        <Text style={[styles.userCardConnections, { color: theme.primary }]}>
          {user.connections} 个连接 • {user.mutualConnections} 个共同连接
        </Text>
        <View style={styles.userCardSkills}>
          {user.skills.slice(0, 3).map((skill, index) => (
            <View key={index} style={[styles.userSkillTag, { backgroundColor: theme.primary + '20' }]}>
              <Text style={[styles.userSkillText, { color: theme.primary }]}>
                {skill}
              </Text>
            </View>
          ))}
        </View>
      </View>
      <TouchableOpacity
        style={[styles.connectButton, { backgroundColor: theme.primary }]}
        onPress={() => handleConnectUser(user.id)}
      >
        <Ionicons name="person-add" size={16} color={theme.background} />
        <Text style={[styles.connectButtonText, { color: theme.background }]}>
          连接
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderEvent = ({ item: event }: { item: NetworkEvent }) => (
    <View style={[styles.eventCard, { backgroundColor: theme.surface }]}>
      <LinearGradient
        colors={[theme.primary, theme.primary + '80']}
        style={styles.eventHeader}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.eventTypeIcon}>
          <Ionicons
            name={
              event.type === 'conference' ? 'people' :
              event.type === 'meetup' ? 'cafe' :
              event.type === 'workshop' ? 'school' : 'networking'
            }
            size={24}
            color="white"
          />
        </View>
        <View style={styles.eventHeaderInfo}>
          <Text style={styles.eventTitle}>{event.title}</Text>
          <Text style={styles.eventDate}>
            {event.date.toLocaleDateString('zh-CN')} • {event.location}
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.eventContent}>
        <Text style={[styles.eventDescription, { color: theme.textSecondary }]}>
          {event.description}
        </Text>

        <View style={styles.eventStats}>
          <View style={styles.eventStat}>
            <Ionicons name="people" size={16} color={theme.primary} />
            <Text style={[styles.eventStatText, { color: theme.text }]}>
              {event.attendees}/{event.maxAttendees} 人参加
            </Text>
          </View>
          <View style={styles.eventStat}>
            <Ionicons name="pricetag" size={16} color={theme.success} />
            <Text style={[styles.eventStatText, { color: theme.text }]}>
              {event.price === 0 ? '免费' : `¥${event.price}`}
            </Text>
          </View>
        </View>

        <View style={styles.eventTags}>
          {event.tags.map((tag, index) => (
            <View key={index} style={[styles.eventTag, { backgroundColor: theme.primary + '20' }]}>
              <Text style={[styles.eventTagText, { color: theme.primary }]}>
                {tag}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.eventFooter}>
          <View style={styles.eventOrganizer}>
            <Image source={{ uri: event.organizer.avatar }} style={styles.organizerAvatar} />
            <Text style={[styles.organizerName, { color: theme.textSecondary }]}>
              主办：{event.organizer.name}
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.joinButton,
              { backgroundColor: event.attending ? theme.success : theme.primary }
            ]}
            onPress={() => handleJoinEvent(event.id)}
          >
            <Ionicons
              name={event.attending ? "checkmark" : "add"}
              size={16}
              color={theme.background}
            />
            <Text style={[styles.joinButtonText, { color: theme.background }]}>
              {event.attending ? '已参加' : '参加'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderFeedTab = () => (
    <View style={styles.tabContent}>
      <TouchableOpacity
        style={[styles.postButton, { backgroundColor: theme.primary }]}
        onPress={() => setShowPostModal(true)}
      >
        <Ionicons name="add" size={20} color={theme.background} />
        <Text style={[styles.postButtonText, { color: theme.background }]}>
          发布动态
        </Text>
      </TouchableOpacity>

      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.postsList}
      />
    </View>
  );

  const renderNetworkTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.networkStats}>
        <View style={[styles.networkStat, { backgroundColor: theme.surface }]}>
          <Text style={[styles.networkStatNumber, { color: theme.primary }]}>
            1,250
          </Text>
          <Text style={[styles.networkStatLabel, { color: theme.textSecondary }]}>
            连接
          </Text>
        </View>
        <View style={[styles.networkStat, { backgroundColor: theme.surface }]}>
          <Text style={[styles.networkStatNumber, { color: theme.success }]}>
            89
          </Text>
          <Text style={[styles.networkStatLabel, { color: theme.textSecondary }]}>
            关注者
          </Text>
        </View>
        <View style={[styles.networkStat, { backgroundColor: theme.surface }]}>
          <Text style={[styles.networkStatNumber, { color: theme.warning }]}>
            156
          </Text>
          <Text style={[styles.networkStatLabel, { color: theme.textSecondary }]}>
            关注中
          </Text>
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: theme.text }]}>推荐连接</Text>
      
      <FlatList
        data={users}
        renderItem={renderUser}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.usersList}
      />
    </View>
  );

  const renderEventsTab = () => (
    <View style={styles.tabContent}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>推荐活动</Text>
      
      <FlatList
        data={events}
        renderItem={renderEvent}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.eventsList}
      />
    </View>
  );

  const renderMessagesTab = () => (
    <View style={[styles.tabContent, styles.centered]}>
      <Ionicons name="chatbubbles" size={64} color={theme.textSecondary} />
      <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
        消息功能开发中...
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.background }]}>
        <Text style={[styles.loadingText, { color: theme.text }]}>加载社交数据中...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>职场社交</Text>
        <TouchableOpacity>
          <Ionicons name="search" size={24} color={theme.primary} />
        </TouchableOpacity>
      </View>

      <View style={[styles.tabBar, { backgroundColor: theme.surface }]}>
        {[
          { key: 'feed', label: '动态', icon: 'home' },
          { key: 'network', label: '人脉', icon: 'people' },
          { key: 'events', label: '活动', icon: 'calendar' },
          { key: 'messages', label: '消息', icon: 'chatbubbles' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tabButton,
              selectedTab === tab.key && { backgroundColor: theme.primary }
            ]}
            onPress={() => setSelectedTab(tab.key as any)}
          >
            <Ionicons
              name={tab.icon as any}
              size={18}
              color={selectedTab === tab.key ? theme.background : theme.textSecondary}
            />
            <Text style={[
              styles.tabButtonText,
              { color: selectedTab === tab.key ? theme.background : theme.textSecondary }
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {selectedTab === 'feed' && renderFeedTab()}
      {selectedTab === 'network' && renderNetworkTab()}
      {selectedTab === 'events' && renderEventsTab()}
      {selectedTab === 'messages' && renderMessagesTab()}

      {/* 发布动态模态框 */}
      <Modal
        visible={showPostModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: theme.surface }]}>
            <TouchableOpacity onPress={() => setShowPostModal(false)}>
              <Text style={[styles.modalCancel, { color: theme.textSecondary }]}>
                取消
              </Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              发布动态
            </Text>
            <TouchableOpacity onPress={handlePublishPost}>
              <Text style={[styles.modalPublish, { color: theme.primary }]}>
                发布
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.modalContent}>
            <TextInput
              style={[styles.postInput, { color: theme.text, borderColor: theme.border }]}
              placeholder="分享你的想法..."
              placeholderTextColor={theme.textSecondary}
              multiline
              value={newPostContent}
              onChangeText={setNewPostContent}
              autoFocus
            />
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
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  loadingText: {
    fontSize: 16,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 2,
    borderRadius: 16,
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  tabContent: {
    flex: 1,
    padding: 20,
  },
  postButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginBottom: 20,
  },
  postButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  postsList: {
    paddingBottom: 20,
  },
  postCard: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  postHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 5,
  },
  userTitle: {
    fontSize: 14,
    marginBottom: 2,
  },
  postTime: {
    fontSize: 12,
  },
  postTypeIcon: {
    marginLeft: 10,
  },
  postContent: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  postImages: {
    marginBottom: 12,
  },
  postImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
    marginRight: 10,
  },
  postTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  postTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 5,
  },
  postTagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  postStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  postStat: {
    fontSize: 14,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
  },
  postAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postActionText: {
    fontSize: 14,
    marginLeft: 5,
  },
  networkStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  networkStat: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 15,
    marginHorizontal: 5,
    borderRadius: 12,
  },
  networkStatNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  networkStatLabel: {
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  usersList: {
    paddingBottom: 20,
  },
  userCard: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  userCardAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  userCardInfo: {
    flex: 1,
  },
  userCardNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  userCardName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 5,
  },
  userCardTitle: {
    fontSize: 14,
    marginBottom: 2,
  },
  userCardCompany: {
    fontSize: 14,
    marginBottom: 5,
  },
  userCardConnections: {
    fontSize: 12,
    marginBottom: 8,
  },
  userCardSkills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  userSkillTag: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
    marginRight: 5,
    marginBottom: 3,
  },
  userSkillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  connectButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
  eventsList: {
    paddingBottom: 20,
  },
  eventCard: {
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  eventTypeIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  eventHeaderInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  eventDate: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  eventContent: {
    padding: 15,
  },
  eventDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 15,
  },
  eventStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  eventStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventStatText: {
    fontSize: 14,
    marginLeft: 5,
  },
  eventTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  eventTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 5,
  },
  eventTagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventOrganizer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  organizerAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
  organizerName: {
    fontSize: 12,
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  joinButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
  },
  modalCancel: {
    fontSize: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalPublish: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  postInput: {
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 200,
    borderWidth: 1,
    borderRadius: 12,
    padding: 15,
  },
});

export default SocialNetworkScreen;