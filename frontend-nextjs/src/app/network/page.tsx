'use client';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import Navbar from '@/components/navigation/Navbar';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter,
  MapPin,
  Building,
  MessageCircle,
  UserCheck,
  Star
} from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  title: string;
  company: string;
  location: string;
  avatar?: string;
  isConnected: boolean;
  mutualConnections: number;
  industry: string;
}

interface Recommendation {
  id: string;
  name: string;
  title: string;
  company: string;
  reason: string;
  mutualConnections: number;
}

export default function NetworkPage() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [activeTab, setActiveTab] = useState<'connections' | 'discover' | 'invitations'>('connections');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterIndustry, setFilterIndustry] = useState('');

  // 模拟数据
  const connections: Contact[] = [
    {
      id: '1',
      name: '李明',
      title: '产品经理',
      company: '字节跳动',
      location: '北京',
      isConnected: true,
      mutualConnections: 12,
      industry: '互联网'
    },
    {
      id: '2',
      name: '王小红',
      title: 'UI设计师',
      company: '美团',
      location: '上海',
      isConnected: true,
      mutualConnections: 8,
      industry: '互联网'
    },
    {
      id: '3',
      name: '张伟',
      title: '后端工程师',
      company: '阿里巴巴',
      location: '杭州',
      isConnected: true,
      mutualConnections: 15,
      industry: '互联网'
    }
  ];

  const recommendations: Recommendation[] = [
    {
      id: '4',
      name: '陈晓',
      title: '前端架构师',
      company: '腾讯',
      reason: '你们都在前端开发领域工作',
      mutualConnections: 5
    },
    {
      id: '5',
      name: '刘芳',
      title: '技术总监',
      company: '京东',
      reason: '你们有3个共同联系人',
      mutualConnections: 3
    },
    {
      id: '6',
      name: '赵强',
      title: '全栈工程师',
      company: '小米',
      reason: '同样关注React技术',
      mutualConnections: 7
    }
  ];

  const pendingInvitations = [
    {
      id: '7',
      name: '孙丽',
      title: 'HR经理',
      company: '华为',
      message: '希望能与您建立职业联系'
    },
    {
      id: '8',
      name: '周杰',
      title: '项目经理',
      company: '百度',
      message: '我们在同一个技术群里见过'
    }
  ];

  const handleConnect = (contactId: string) => {
    // 发送连接请求
    console.log('发送连接请求:', contactId);
  };

  const handleMessage = (contactId: string) => {
    // 发送消息
    console.log('发送消息:', contactId);
  };

  const handleAcceptInvitation = (invitationId: string) => {
    // 接受邀请
    console.log('接受邀请:', invitationId);
  };

  const handleDeclineInvitation = (invitationId: string) => {
    // 拒绝邀请
    console.log('拒绝邀请:', invitationId);
  };

  const filteredConnections = connections.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         contact.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         contact.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesIndustry = !filterIndustry || contact.industry === filterIndustry;
    return matchesSearch && matchesIndustry;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text mb-2">我的网络</h1>
          <p className="text-gray-600">管理您的职业联系人和拓展网络</p>
        </div>
        
        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card rounded-lg shadow-sm border border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">联系人</p>
                <p className="text-2xl font-bold text-text">{connections.length}</p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
          </div>
          
          <div className="bg-card rounded-lg shadow-sm border border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">待处理邀请</p>
                <p className="text-2xl font-bold text-text">{pendingInvitations.length}</p>
              </div>
              <UserPlus className="w-8 h-8 text-warning" />
            </div>
          </div>
          
          <div className="bg-card rounded-lg shadow-sm border border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">推荐联系人</p>
                <p className="text-2xl font-bold text-text">{recommendations.length}</p>
              </div>
              <Star className="w-8 h-8 text-success" />
            </div>
          </div>
        </div>
        
        {/* 标签页导航 */}
        <div className="border-b border-border mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('connections')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'connections'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              我的联系人 ({connections.length})
            </button>
            <button
              onClick={() => setActiveTab('discover')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'discover'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              发现新联系人 ({recommendations.length})
            </button>
            <button
              onClick={() => setActiveTab('invitations')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'invitations'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              邀请 ({pendingInvitations.length})
            </button>
          </nav>
        </div>
        
        {/* 搜索和筛选 */}
        {(activeTab === 'connections' || activeTab === 'discover') && (
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="搜索联系人..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={filterIndustry}
                onChange={(e) => setFilterIndustry(e.target.value)}
                className="pl-10 pr-8 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none bg-white"
              >
                <option value="">所有行业</option>
                <option value="互联网">互联网</option>
                <option value="金融">金融</option>
                <option value="教育">教育</option>
                <option value="医疗">医疗</option>
              </select>
            </div>
          </div>
        )}
        
        {/* 内容区域 */}
        <div className="space-y-6">
          {/* 我的联系人 */}
          {activeTab === 'connections' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredConnections.map((contact) => (
                <div key={contact.id} className="bg-card rounded-lg shadow-sm border border-border p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-text truncate">{contact.name}</h3>
                      <p className="text-sm text-gray-600 truncate">{contact.title}</p>
                      <div className="flex items-center space-x-1 text-xs text-gray-500 mt-1">
                        <Building className="w-3 h-3" />
                        <span className="truncate">{contact.company}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <MapPin className="w-3 h-3" />
                        <span>{contact.location}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {contact.mutualConnections} 个共同联系人
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 mt-4">
                    <button
                      onClick={() => handleMessage(contact.id)}
                      className="flex-1 btn-primary py-2 text-sm flex items-center justify-center space-x-1"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>消息</span>
                    </button>
                    <button className="px-3 py-2 border border-border rounded-lg hover:bg-gray-50">
                      <UserCheck className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* 发现新联系人 */}
          {activeTab === 'discover' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((person) => (
                <div key={person.id} className="bg-card rounded-lg shadow-sm border border-border p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-text truncate">{person.name}</h3>
                      <p className="text-sm text-gray-600 truncate">{person.title}</p>
                      <div className="flex items-center space-x-1 text-xs text-gray-500 mt-1">
                        <Building className="w-3 h-3" />
                        <span className="truncate">{person.company}</span>
                      </div>
                      <p className="text-xs text-primary mt-2">{person.reason}</p>
                      <p className="text-xs text-gray-500">
                        {person.mutualConnections} 个共同联系人
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 mt-4">
                    <button
                      onClick={() => handleConnect(person.id)}
                      className="flex-1 btn-primary py-2 text-sm flex items-center justify-center space-x-1"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>连接</span>
                    </button>
                    <button
                      onClick={() => handleMessage(person.id)}
                      className="flex-1 btn-outline py-2 text-sm flex items-center justify-center space-x-1"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>消息</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* 邀请 */}
          {activeTab === 'invitations' && (
            <div className="space-y-4">
              {pendingInvitations.map((invitation) => (
                <div key={invitation.id} className="bg-card rounded-lg shadow-sm border border-border p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-warning rounded-full flex items-center justify-center flex-shrink-0">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-text">{invitation.name}</h3>
                        <p className="text-sm text-gray-600">{invitation.title}</p>
                        <div className="flex items-center space-x-1 text-xs text-gray-500 mt-1">
                          <Building className="w-3 h-3" />
                          <span>{invitation.company}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">"{invitation.message}"</p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleAcceptInvitation(invitation.id)}
                        className="btn-primary px-4 py-2 text-sm"
                      >
                        接受
                      </button>
                      <button
                        onClick={() => handleDeclineInvitation(invitation.id)}
                        className="btn-outline px-4 py-2 text-sm"
                      >
                        拒绝
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {pendingInvitations.length === 0 && (
                <div className="text-center py-12">
                  <UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">暂无待处理邀请</h3>
                  <p className="text-gray-600">当有人向您发送连接邀请时，会显示在这里</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}