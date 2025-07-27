import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, BarChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  avatar: string;
  status: 'online' | 'offline' | 'busy' | 'away';
  lastActive: string;
  skills: string[];
  currentTasks: number;
  completedTasks: number;
  rating: number;
}

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'in_progress' | 'review' | 'completed' | 'on_hold';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  progress: number;
  startDate: string;
  endDate: string;
  teamMembers: string[];
  tasks: number;
  completedTasks: number;
  budget: number;
  spentBudget: number;
}

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  type: 'text' | 'file' | 'image' | 'system';
  channelId: string;
  reactions: { emoji: string; count: number; users: string[] }[];
}

interface Channel {
  id: string;
  name: string;
  type: 'public' | 'private' | 'direct';
  description: string;
  members: string[];
  unreadCount: number;
  lastMessage?: Message;
}

interface Meeting {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  attendees: string[];
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  meetingLink: string;
  agenda: string[];
  notes?: string;
}

const TeamCollaboration: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'team' | 'projects' | 'chat' | 'meetings'>('team');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [messageText, setMessageText] = useState('');

  // Mock data
  useEffect(() => {
    const mockTeamMembers: TeamMember[] = [
      {
        id: '1',
        name: '张三',
        role: '项目经理',
        department: '技术部',
        avatar: 'https://via.placeholder.com/50',
        status: 'online',
        lastActive: '刚刚',
        skills: ['项目管理', '团队协作', 'Scrum'],
        currentTasks: 5,
        completedTasks: 23,
        rating: 4.8,
      },
      {
        id: '2',
        name: '李四',
        role: '前端开发',
        department: '技术部',
        avatar: 'https://via.placeholder.com/50',
        status: 'busy',
        lastActive: '5分钟前',
        skills: ['React', 'TypeScript', 'UI/UX'],
        currentTasks: 3,
        completedTasks: 45,
        rating: 4.9,
      },
      {
        id: '3',
        name: '王五',
        role: '后端开发',
        department: '技术部',
        avatar: 'https://via.placeholder.com/50',
        status: 'online',
        lastActive: '2分钟前',
        skills: ['Node.js', 'Python', '数据库'],
        currentTasks: 4,
        completedTasks: 38,
        rating: 4.7,
      },
      {
        id: '4',
        name: '赵六',
        role: 'UI设计师',
        department: '设计部',
        avatar: 'https://via.placeholder.com/50',
        status: 'away',
        lastActive: '1小时前',
        skills: ['Figma', 'Sketch', '用户体验'],
        currentTasks: 2,
        completedTasks: 28,
        rating: 4.6,
      },
    ];

    const mockProjects: Project[] = [
      {
        id: '1',
        name: '城市工作平台',
        description: '开发综合性城市工作管理平台',
        status: 'in_progress',
        priority: 'high',
        progress: 75,
        startDate: '2024-01-01',
        endDate: '2024-03-31',
        teamMembers: ['1', '2', '3', '4'],
        tasks: 45,
        completedTasks: 34,
        budget: 500000,
        spentBudget: 375000,
      },
      {
        id: '2',
        name: '移动端应用',
        description: '开发配套的移动端应用',
        status: 'planning',
        priority: 'medium',
        progress: 15,
        startDate: '2024-02-15',
        endDate: '2024-05-15',
        teamMembers: ['2', '4'],
        tasks: 28,
        completedTasks: 4,
        budget: 300000,
        spentBudget: 45000,
      },
      {
        id: '3',
        name: '数据分析系统',
        description: '构建数据分析和报告系统',
        status: 'review',
        priority: 'high',
        progress: 90,
        startDate: '2023-11-01',
        endDate: '2024-01-31',
        teamMembers: ['1', '3'],
        tasks: 22,
        completedTasks: 20,
        budget: 200000,
        spentBudget: 180000,
      },
    ];

    const mockChannels: Channel[] = [
      {
        id: '1',
        name: '技术讨论',
        type: 'public',
        description: '技术相关讨论和分享',
        members: ['1', '2', '3'],
        unreadCount: 3,
      },
      {
        id: '2',
        name: '项目进展',
        type: 'public',
        description: '项目进展汇报和更新',
        members: ['1', '2', '3', '4'],
        unreadCount: 1,
      },
      {
        id: '3',
        name: '设计评审',
        type: 'private',
        description: '设计方案评审和讨论',
        members: ['1', '4'],
        unreadCount: 0,
      },
    ];

    const mockMessages: Message[] = [
      {
        id: '1',
        senderId: '2',
        senderName: '李四',
        content: '新的UI组件已经完成，请大家review一下',
        timestamp: '2024-01-30 14:30:00',
        type: 'text',
        channelId: '1',
        reactions: [{ emoji: '👍', count: 2, users: ['1', '3'] }],
      },
      {
        id: '2',
        senderId: '3',
        senderName: '王五',
        content: 'API接口文档已更新，新增了用户管理相关接口',
        timestamp: '2024-01-30 15:15:00',
        type: 'text',
        channelId: '1',
        reactions: [],
      },
      {
        id: '3',
        senderId: '1',
        senderName: '张三',
        content: '明天下午2点开会讨论下一阶段的开发计划',
        timestamp: '2024-01-30 16:00:00',
        type: 'text',
        channelId: '2',
        reactions: [{ emoji: '✅', count: 3, users: ['2', '3', '4'] }],
      },
    ];

    const mockMeetings: Meeting[] = [
      {
        id: '1',
        title: '每周项目进展会议',
        description: '回顾本周工作进展，讨论下周计划',
        startTime: '2024-01-31 14:00:00',
        endTime: '2024-01-31 15:00:00',
        attendees: ['1', '2', '3', '4'],
        status: 'scheduled',
        meetingLink: 'https://meet.example.com/abc123',
        agenda: ['本周工作总结', '下周工作计划', '问题讨论'],
      },
      {
        id: '2',
        title: '技术架构评审',
        description: '评审新功能的技术架构设计',
        startTime: '2024-02-01 10:00:00',
        endTime: '2024-02-01 11:30:00',
        attendees: ['1', '2', '3'],
        status: 'scheduled',
        meetingLink: 'https://meet.example.com/def456',
        agenda: ['架构设计介绍', '技术选型讨论', '实施计划'],
      },
      {
        id: '3',
        title: 'UI设计评审',
        description: '评审新版本的UI设计方案',
        startTime: '2024-01-30 09:00:00',
        endTime: '2024-01-30 10:00:00',
        attendees: ['1', '4'],
        status: 'completed',
        meetingLink: 'https://meet.example.com/ghi789',
        agenda: ['设计方案展示', '用户体验讨论', '修改建议'],
        notes: '设计方案整体通过，需要调整部分颜色搭配',
      },
    ];

    setTeamMembers(mockTeamMembers);
    setProjects(mockProjects);
    setChannels(mockChannels);
    setMessages(mockMessages);
    setMeetings(mockMeetings);
    setSelectedChannel(mockChannels[0]);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': case 'completed': case 'ongoing': return '#34C759';
      case 'busy': case 'in_progress': case 'scheduled': return '#FF9500';
      case 'away': case 'review': case 'planning': return '#007AFF';
      case 'offline': case 'on_hold': case 'cancelled': return '#8E8E93';
      default: return '#8E8E93';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#FF3B30';
      case 'high': return '#FF9500';
      case 'medium': return '#007AFF';
      case 'low': return '#34C759';
      default: return '#8E8E93';
    }
  };

  const sendMessage = () => {
    if (messageText.trim() && selectedChannel) {
      const newMessage: Message = {
        id: Date.now().toString(),
        senderId: '1',
        senderName: '我',
        content: messageText.trim(),
        timestamp: new Date().toLocaleString(),
        type: 'text',
        channelId: selectedChannel.id,
        reactions: [],
      };
      setMessages(prev => [...prev, newMessage]);
      setMessageText('');
    }
  };

  const renderTeamMember = ({ item }: { item: TeamMember }) => (
    <TouchableOpacity
      style={styles.memberCard}
      onPress={() => {
        setSelectedMember(item);
        setShowMemberModal(true);
      }}
    >
      <View style={styles.memberHeader}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
          </View>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
        </View>
        <View style={styles.memberInfo}>
          <Text style={styles.memberName}>{item.name}</Text>
          <Text style={styles.memberRole}>{item.role}</Text>
          <Text style={styles.memberDepartment}>{item.department}</Text>
        </View>
        <View style={styles.memberStats}>
          <Text style={styles.rating}>⭐ {item.rating}</Text>
          <Text style={styles.lastActive}>{item.lastActive}</Text>
        </View>
      </View>
      
      <View style={styles.taskStats}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{item.currentTasks}</Text>
          <Text style={styles.statLabel}>进行中</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{item.completedTasks}</Text>
          <Text style={styles.statLabel}>已完成</Text>
        </View>
      </View>
      
      <View style={styles.skillsContainer}>
        {item.skills.slice(0, 3).map((skill, index) => (
          <View key={index} style={styles.skillTag}>
            <Text style={styles.skillText}>{skill}</Text>
          </View>
        ))}
        {item.skills.length > 3 && (
          <Text style={styles.moreSkills}>+{item.skills.length - 3}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderProject = ({ item }: { item: Project }) => (
    <View style={styles.projectCard}>
      <View style={styles.projectHeader}>
        <View style={styles.projectInfo}>
          <Text style={styles.projectName}>{item.name}</Text>
          <View style={styles.projectBadges}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
              <Text style={styles.badgeText}>
                {item.status === 'planning' ? '计划中' : 
                 item.status === 'in_progress' ? '进行中' : 
                 item.status === 'review' ? '评审中' : 
                 item.status === 'completed' ? '已完成' : '暂停'}
              </Text>
            </View>
            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) }]}>
              <Text style={styles.badgeText}>
                {item.priority === 'urgent' ? '紧急' : 
                 item.priority === 'high' ? '高' : 
                 item.priority === 'medium' ? '中' : '低'}
              </Text>
            </View>
          </View>
        </View>
      </View>
      
      <Text style={styles.projectDescription}>{item.description}</Text>
      
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>进度</Text>
          <Text style={styles.progressValue}>{item.progress}%</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${item.progress}%` }]} />
        </View>
      </View>
      
      <View style={styles.projectStats}>
        <View style={styles.statRow}>
          <View style={styles.statItem}>
            <Ionicons name="calendar-outline" size={16} color="#666" />
            <Text style={styles.statText}>{item.startDate} - {item.endDate}</Text>
          </View>
        </View>
        <View style={styles.statRow}>
          <View style={styles.statItem}>
            <Ionicons name="checkmark-circle-outline" size={16} color="#666" />
            <Text style={styles.statText}>{item.completedTasks}/{item.tasks} 任务</Text>
          </View>
        </View>
        <View style={styles.statRow}>
          <View style={styles.statItem}>
            <Ionicons name="wallet-outline" size={16} color="#666" />
            <Text style={styles.statText}>¥{item.spentBudget.toLocaleString()}/¥{item.budget.toLocaleString()}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.teamAvatars}>
        <Text style={styles.teamLabel}>团队成员:</Text>
        <View style={styles.avatarsList}>
          {item.teamMembers.slice(0, 4).map((memberId, index) => {
            const member = teamMembers.find(m => m.id === memberId);
            return (
              <View key={index} style={styles.miniAvatar}>
                <Text style={styles.miniAvatarText}>{member?.name.charAt(0) || '?'}</Text>
              </View>
            );
          })}
          {item.teamMembers.length > 4 && (
            <View style={styles.moreMembers}>
              <Text style={styles.moreMembersText}>+{item.teamMembers.length - 4}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={styles.messageContainer}>
      <View style={styles.messageHeader}>
        <Text style={styles.senderName}>{item.senderName}</Text>
        <Text style={styles.messageTime}>{item.timestamp}</Text>
      </View>
      <Text style={styles.messageContent}>{item.content}</Text>
      {item.reactions.length > 0 && (
        <View style={styles.reactionsContainer}>
          {item.reactions.map((reaction, index) => (
            <View key={index} style={styles.reactionItem}>
              <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
              <Text style={styles.reactionCount}>{reaction.count}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const renderMeeting = ({ item }: { item: Meeting }) => (
    <View style={styles.meetingCard}>
      <View style={styles.meetingHeader}>
        <Text style={styles.meetingTitle}>{item.title}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.badgeText}>
            {item.status === 'scheduled' ? '已安排' : 
             item.status === 'ongoing' ? '进行中' : 
             item.status === 'completed' ? '已完成' : '已取消'}
          </Text>
        </View>
      </View>
      
      <Text style={styles.meetingDescription}>{item.description}</Text>
      
      <View style={styles.meetingDetails}>
        <View style={styles.timeInfo}>
          <Ionicons name="time-outline" size={16} color="#666" />
          <Text style={styles.timeText}>{item.startTime} - {item.endTime}</Text>
        </View>
        
        <View style={styles.attendeesInfo}>
          <Ionicons name="people-outline" size={16} color="#666" />
          <Text style={styles.attendeesText}>{item.attendees.length} 人参加</Text>
        </View>
      </View>
      
      <View style={styles.agendaContainer}>
        <Text style={styles.agendaTitle}>会议议程:</Text>
        {item.agenda.map((agendaItem, index) => (
          <Text key={index} style={styles.agendaItem}>• {agendaItem}</Text>
        ))}
      </View>
      
      {item.notes && (
        <View style={styles.notesContainer}>
          <Text style={styles.notesTitle}>会议纪要:</Text>
          <Text style={styles.notesContent}>{item.notes}</Text>
        </View>
      )}
      
      <View style={styles.meetingActions}>
        {item.status === 'scheduled' && (
          <TouchableOpacity style={styles.joinButton}>
            <Ionicons name="videocam-outline" size={16} color="#fff" />
            <Text style={styles.joinButtonText}>加入会议</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.detailsButton}>
          <Text style={styles.detailsButtonText}>查看详情</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCollaborationChart = () => {
    const chartData = {
      labels: ['周一', '周二', '周三', '周四', '周五'],
      datasets: [{
        data: [12, 15, 18, 14, 16],
        color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
        strokeWidth: 2
      }]
    };

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>本周协作活动</Text>
        <LineChart
          data={chartData}
          width={width - 60}
          height={200}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16
            },
          }}
          style={styles.chart}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>团队协作</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'team' && styles.activeTab]}
          onPress={() => setActiveTab('team')}
        >
          <Text style={[styles.tabText, activeTab === 'team' && styles.activeTabText]}>
            团队成员
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'projects' && styles.activeTab]}
          onPress={() => setActiveTab('projects')}
        >
          <Text style={[styles.tabText, activeTab === 'projects' && styles.activeTabText]}>
            项目管理
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'chat' && styles.activeTab]}
          onPress={() => setActiveTab('chat')}
        >
          <Text style={[styles.tabText, activeTab === 'chat' && styles.activeTabText]}>
            团队聊天
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'meetings' && styles.activeTab]}
          onPress={() => setActiveTab('meetings')}
        >
          <Text style={[styles.tabText, activeTab === 'meetings' && styles.activeTabText]}>
            会议管理
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'team' && (
        <FlatList
          data={teamMembers}
          renderItem={renderTeamMember}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          ListHeaderComponent={renderCollaborationChart}
        />
      )}

      {activeTab === 'projects' && (
        <FlatList
          data={projects}
          renderItem={renderProject}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      )}

      {activeTab === 'chat' && (
        <View style={styles.chatContainer}>
          <View style={styles.channelsHeader}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {channels.map(channel => (
                <TouchableOpacity
                  key={channel.id}
                  style={[
                    styles.channelTab,
                    selectedChannel?.id === channel.id && styles.activeChannelTab
                  ]}
                  onPress={() => setSelectedChannel(channel)}
                >
                  <Text style={[
                    styles.channelTabText,
                    selectedChannel?.id === channel.id && styles.activeChannelTabText
                  ]}>
                    {channel.name}
                  </Text>
                  {channel.unreadCount > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadText}>{channel.unreadCount}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          
          <FlatList
            data={messages.filter(msg => msg.channelId === selectedChannel?.id)}
            renderItem={renderMessage}
            keyExtractor={item => item.id}
            style={styles.messagesList}
            contentContainerStyle={styles.messagesContainer}
          />
          
          <View style={styles.messageInput}>
            <TextInput
              style={styles.textInput}
              placeholder="输入消息..."
              value={messageText}
              onChangeText={setMessageText}
              multiline
            />
            <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
              <Ionicons name="send" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {activeTab === 'meetings' && (
        <FlatList
          data={meetings}
          renderItem={renderMeeting}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      )}

      {/* Member Detail Modal */}
      <Modal
        visible={showMemberModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowMemberModal(false)}>
              <Text style={styles.closeButton}>关闭</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>成员详情</Text>
            <View style={{ width: 50 }} />
          </View>
          
          {selectedMember && (
            <ScrollView style={styles.modalContent}>
              <View style={styles.memberProfile}>
                <View style={styles.profileAvatar}>
                  <Text style={styles.profileAvatarText}>{selectedMember.name.charAt(0)}</Text>
                </View>
                <Text style={styles.profileName}>{selectedMember.name}</Text>
                <Text style={styles.profileRole}>{selectedMember.role}</Text>
                <Text style={styles.profileDepartment}>{selectedMember.department}</Text>
              </View>
              
              <View style={styles.profileSection}>
                <Text style={styles.sectionTitle}>技能标签</Text>
                <View style={styles.skillsList}>
                  {selectedMember.skills.map((skill, index) => (
                    <View key={index} style={styles.skillTag}>
                      <Text style={styles.skillText}>{skill}</Text>
                    </View>
                  ))}
                </View>
              </View>
              
              <View style={styles.profileSection}>
                <Text style={styles.sectionTitle}>工作统计</Text>
                <View style={styles.statsGrid}>
                  <View style={styles.statCard}>
                    <Text style={styles.statNumber}>{selectedMember.currentTasks}</Text>
                    <Text style={styles.statLabel}>进行中任务</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text style={styles.statNumber}>{selectedMember.completedTasks}</Text>
                    <Text style={styles.statLabel}>已完成任务</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text style={styles.statNumber}>{selectedMember.rating}</Text>
                    <Text style={styles.statLabel}>评分</Text>
                  </View>
                </View>
              </View>
            </ScrollView>
          )}
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
  addButton: {
    backgroundColor: '#007AFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  listContainer: {
    padding: 15,
  },
  memberCard: {
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
  memberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 15,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  memberRole: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  memberDepartment: {
    fontSize: 12,
    color: '#999',
  },
  memberStats: {
    alignItems: 'flex-end',
  },
  rating: {
    fontSize: 14,
    color: '#FF9500',
    marginBottom: 4,
  },
  lastActive: {
    fontSize: 12,
    color: '#999',
  },
  taskStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
    paddingVertical: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  skillTag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  skillText: {
    fontSize: 10,
    color: '#1976d2',
  },
  moreSkills: {
    fontSize: 12,
    color: '#666',
  },
  projectCard: {
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
  projectHeader: {
    marginBottom: 15,
  },
  projectInfo: {
    flex: 1,
  },
  projectName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  projectBadges: {
    flexDirection: 'row',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#fff',
  },
  projectDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 15,
  },
  progressContainer: {
    marginBottom: 15,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: '#333',
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  projectStats: {
    marginBottom: 15,
  },
  statRow: {
    marginBottom: 8,
  },
  statText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  teamAvatars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamLabel: {
    fontSize: 12,
    color: '#666',
    marginRight: 10,
  },
  avatarsList: {
    flexDirection: 'row',
  },
  miniAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  miniAvatarText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  moreMembers: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreMembersText: {
    fontSize: 8,
    color: '#666',
  },
  chatContainer: {
    flex: 1,
  },
  channelsHeader: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingVertical: 10,
  },
  channelTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  activeChannelTab: {
    backgroundColor: '#007AFF',
  },
  channelTabText: {
    fontSize: 14,
    color: '#666',
  },
  activeChannelTabText: {
    color: '#fff',
  },
  unreadBadge: {
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  unreadText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  messagesList: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  messagesContainer: {
    padding: 15,
  },
  messageContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  senderName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  messageTime: {
    fontSize: 12,
    color: '#999',
  },
  messageContent: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 8,
  },
  reactionsContainer: {
    flexDirection: 'row',
  },
  reactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  reactionEmoji: {
    fontSize: 14,
    marginRight: 4,
  },
  reactionCount: {
    fontSize: 12,
    color: '#007AFF',
  },
  messageInput: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  meetingCard: {
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
  meetingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  meetingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  meetingDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 15,
  },
  meetingDetails: {
    marginBottom: 15,
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  attendeesInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attendeesText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  agendaContainer: {
    marginBottom: 15,
  },
  agendaTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  agendaItem: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    lineHeight: 16,
  },
  notesContainer: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  notesTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  notesContent: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  meetingActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#34C759',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    justifyContent: 'center',
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 5,
  },
  detailsButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsButtonText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '500',
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
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
  closeButton: {
    fontSize: 16,
    color: '#007AFF',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  memberProfile: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  profileAvatarText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  profileRole: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  profileDepartment: {
    fontSize: 14,
    color: '#999',
  },
  profileSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  skillsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
});

export default TeamCollaboration;