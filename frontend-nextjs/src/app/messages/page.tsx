'use client';

import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { setCurrentConversation, addMessage } from '@/features/messaging/messagingSlice';
import Navbar from '@/components/navigation/Navbar';
import { 
  Search, 
  Send, 
  Paperclip, 
  Smile, 
  Phone, 
  Video, 
  MoreVertical,
  ArrowLeft,
  Users,
  MessageCircle
} from 'lucide-react';

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'file';
}

interface Conversation {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  isOnline: boolean;
  messages: Message[];
}

export default function MessagesPage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { currentConversation } = useSelector((state: RootState) => state.messaging);
  const [searchQuery, setSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [showMobileChat, setShowMobileChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 模拟对话数据
  const conversations: Conversation[] = [
    {
      id: '1',
      name: '李明',
      lastMessage: '好的，我们明天讨论一下项目进度',
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 30), // 30分钟前
      unreadCount: 2,
      isOnline: true,
      messages: [
        {
          id: 'm1',
          senderId: '1',
          content: '你好，关于新项目有什么想法吗？',
          timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1小时前
          type: 'text'
        },
        {
          id: 'm2',
          senderId: 'me',
          content: '我觉得我们可以先做一个原型',
          timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45分钟前
          type: 'text'
        },
        {
          id: 'm3',
          senderId: '1',
          content: '好的，我们明天讨论一下项目进度',
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30分钟前
          type: 'text'
        }
      ]
    },
    {
      id: '2',
      name: '王小红',
      lastMessage: '设计稿已经准备好了',
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2小时前
      unreadCount: 0,
      isOnline: false,
      messages: [
        {
          id: 'm4',
          senderId: '2',
          content: '设计稿已经准备好了',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
          type: 'text'
        }
      ]
    },
    {
      id: '3',
      name: '张伟',
      lastMessage: '代码审查完成',
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5小时前
      unreadCount: 1,
      isOnline: true,
      messages: [
        {
          id: 'm5',
          senderId: '3',
          content: '代码审查完成',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
          type: 'text'
        }
      ]
    }
  ];

  const [allConversations, setAllConversations] = useState(conversations);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  const filteredConversations = allConversations.filter(conv => 
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    dispatch(setCurrentConversation(conversation.id));
    setShowMobileChat(true);
    
    // 标记为已读
    setAllConversations(prev => 
      prev.map(conv => 
        conv.id === conversation.id 
          ? { ...conv, unreadCount: 0 }
          : conv
      )
    );
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const message: Message = {
      id: `m${Date.now()}`,
      senderId: 'me',
      content: newMessage,
      timestamp: new Date(),
      type: 'text'
    };

    // 更新对话列表
    setAllConversations(prev => 
      prev.map(conv => 
        conv.id === selectedConversation.id
          ? {
              ...conv,
              messages: [...conv.messages, message],
              lastMessage: newMessage,
              lastMessageTime: new Date()
            }
          : conv
      )
    );

    // 更新选中的对话
    setSelectedConversation(prev => 
      prev ? {
        ...prev,
        messages: [...prev.messages, message],
        lastMessage: newMessage,
        lastMessageTime: new Date()
      } : null
    );

    dispatch(addMessage(message));
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return date.toLocaleDateString();
  };

  const formatMessageTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedConversation?.messages]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
          <div className="flex h-full">
            {/* 对话列表 */}
            <div className={`w-full md:w-1/3 border-r border-border flex flex-col ${
              showMobileChat ? 'hidden md:flex' : 'flex'
            }`}>
              {/* 搜索栏 */}
              <div className="p-4 border-b border-border">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="搜索对话..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
              
              {/* 对话列表 */}
              <div className="flex-1 overflow-y-auto">
                {filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => handleSelectConversation(conversation)}
                    className={`p-4 border-b border-border cursor-pointer hover:bg-gray-50 ${
                      selectedConversation?.id === conversation.id ? 'bg-primary/10' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="relative">
                        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                        {conversation.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-text truncate">{conversation.name}</h3>
                          <span className="text-xs text-gray-500">
                            {formatTime(conversation.lastMessageTime)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 truncate mt-1">
                          {conversation.lastMessage}
                        </p>
                        {conversation.unreadCount > 0 && (
                          <div className="flex justify-end mt-1">
                            <span className="bg-primary text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                              {conversation.unreadCount}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {filteredConversations.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <MessageCircle className="w-12 h-12 mb-4" />
                    <p>没有找到相关对话</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* 聊天区域 */}
            <div className={`flex-1 flex flex-col ${
              !showMobileChat ? 'hidden md:flex' : 'flex'
            }`}>
              {selectedConversation ? (
                <>
                  {/* 聊天头部 */}
                  <div className="p-4 border-b border-border flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setShowMobileChat(false)}
                        className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>
                      <div className="relative">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-white" />
                        </div>
                        {selectedConversation.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-text">{selectedConversation.name}</h3>
                        <p className="text-sm text-gray-500">
                          {selectedConversation.isOnline ? '在线' : '离线'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <Phone className="w-5 h-5 text-gray-600" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <Video className="w-5 h-5 text-gray-600" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <MoreVertical className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>
                  </div>
                  
                  {/* 消息列表 */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {selectedConversation.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.senderId === 'me' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.senderId === 'me'
                              ? 'bg-primary text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.senderId === 'me' ? 'text-primary-100' : 'text-gray-500'
                          }`}>
                            {formatMessageTime(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                  
                  {/* 消息输入 */}
                  <div className="p-4 border-t border-border">
                    <div className="flex items-end space-x-2">
                      <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <Paperclip className="w-5 h-5 text-gray-600" />
                      </button>
                      <div className="flex-1">
                        <textarea
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="输入消息..."
                          rows={1}
                          className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                        />
                      </div>
                      <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <Smile className="w-5 h-5 text-gray-600" />
                      </button>
                      <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        className="p-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <MessageCircle className="w-16 h-16 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">选择一个对话</h3>
                    <p>从左侧选择一个对话开始聊天</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}