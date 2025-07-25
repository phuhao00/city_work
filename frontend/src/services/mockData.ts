// Mock data for development when backend is not available
export const mockUsers = [
  {
    _id: '1',
    name: '张三',
    email: 'zhangsan@example.com',
    role: 'JOBSEEKER',
    phone: '13800138001',
    location: '北京市',
    bio: '资深前端开发工程师，专注于React和Vue.js开发',
    avatar: 'https://via.placeholder.com/100',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '2',
    name: '李四',
    email: 'lisi@example.com',
    role: 'EMPLOYER',
    phone: '13800138002',
    location: '上海市',
    bio: '技术总监，负责团队管理和技术架构',
    avatar: 'https://via.placeholder.com/100',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const mockJobs = [
  {
    _id: '1',
    title: '前端开发工程师',
    description: '负责公司前端产品的开发和维护，使用React、Vue.js等现代前端技术栈。',
    company: {
      _id: 'comp1',
      name: '科技有限公司',
      logo: 'https://via.placeholder.com/50',
      location: '北京市朝阳区',
    },
    location: '北京市朝阳区',
    type: 'FULL_TIME',
    salaryMin: 15000,
    salaryMax: 25000,
    skills: ['React', 'Vue.js', 'JavaScript', 'TypeScript'],
    requirements: [
      '3年以上前端开发经验',
      '熟练掌握React或Vue.js',
      '熟悉TypeScript',
      '有良好的代码规范和团队协作能力',
    ],
    benefits: ['五险一金', '弹性工作', '年终奖', '技能培训'],
    postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '2',
    title: 'Node.js后端开发工程师',
    description: '负责后端API开发，数据库设计，微服务架构等工作。',
    company: {
      _id: 'comp2',
      name: '互联网科技公司',
      logo: 'https://via.placeholder.com/50',
      location: '上海市浦东新区',
    },
    location: '上海市浦东新区',
    type: 'FULL_TIME',
    salaryMin: 18000,
    salaryMax: 30000,
    skills: ['Node.js', 'Express', 'MongoDB', 'Redis'],
    requirements: [
      '3年以上Node.js开发经验',
      '熟悉Express框架',
      '熟悉MongoDB、Redis等数据库',
      '有微服务架构经验优先',
    ],
    benefits: ['五险一金', '股票期权', '年终奖', '带薪年假'],
    postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '3',
    title: 'UI/UX设计师',
    description: '负责产品界面设计，用户体验优化，设计规范制定等工作。',
    company: {
      _id: 'comp3',
      name: '设计工作室',
      logo: 'https://via.placeholder.com/50',
      location: '深圳市南山区',
    },
    location: '深圳市南山区',
    type: 'FULL_TIME',
    salaryMin: 12000,
    salaryMax: 20000,
    skills: ['Figma', 'Sketch', 'Adobe XD', 'Photoshop'],
    requirements: [
      '2年以上UI/UX设计经验',
      '熟练使用Figma、Sketch等设计工具',
      '有移动端设计经验',
      '良好的审美和创意能力',
    ],
    benefits: ['五险一金', '弹性工作', '设计津贴', '团建活动'],
    postedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const mockCompanies = [
  {
    _id: 'comp1',
    name: '科技有限公司',
    description: '专注于前端技术的创新公司，致力于为用户提供最佳的产品体验。',
    logo: 'https://via.placeholder.com/100',
    website: 'https://example.com',
    location: '北京市朝阳区',
    industry: '互联网',
    size: '100-500人',
    founded: 2015,
    benefits: ['五险一金', '弹性工作', '年终奖', '技能培训'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'comp2',
    name: '互联网科技公司',
    description: '领先的互联网技术公司，专注于云计算和大数据解决方案。',
    logo: 'https://via.placeholder.com/100',
    website: 'https://example2.com',
    location: '上海市浦东新区',
    industry: '云计算',
    size: '500-1000人',
    founded: 2012,
    benefits: ['五险一金', '股票期权', '年终奖', '带薪年假'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const mockConversations = [
  {
    _id: 'conv1',
    participants: [mockUsers[0], mockUsers[1]],
    lastMessage: {
      _id: 'msg1',
      content: '你好，我对这个职位很感兴趣',
      sender: mockUsers[0]._id,
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
    unreadCount: 2,
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    _id: 'conv2',
    participants: [mockUsers[0], mockUsers[1]],
    lastMessage: {
      _id: 'msg2',
      content: '面试时间安排在明天下午2点',
      sender: mockUsers[1]._id,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    unreadCount: 0,
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
];

export const mockMessages = [
  {
    _id: 'msg1',
    content: '你好，我对前端开发工程师这个职位很感兴趣',
    sender: mockUsers[0]._id,
    receiver: mockUsers[1]._id,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    read: true,
  },
  {
    _id: 'msg2',
    content: '你好！感谢你的关注，我们可以安排一次面试',
    sender: mockUsers[1]._id,
    receiver: mockUsers[0]._id,
    timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    read: true,
  },
  {
    _id: 'msg3',
    content: '太好了！什么时候方便呢？',
    sender: mockUsers[0]._id,
    receiver: mockUsers[1]._id,
    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    read: true,
  },
  {
    _id: 'msg4',
    content: '明天下午2点怎么样？我们可以在线面试',
    sender: mockUsers[1]._id,
    receiver: mockUsers[0]._id,
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    read: false,
  },
];

// Mock API responses
export const mockApiResponses = {
  login: {
    access_token: 'mock_jwt_token_12345',
    user: mockUsers[0],
  },
  register: {
    access_token: 'mock_jwt_token_12345',
    user: mockUsers[0],
  },
  jobs: {
    jobs: mockJobs,
    total: mockJobs.length,
    page: 1,
    limit: 10,
  },
  companies: {
    companies: mockCompanies,
    total: mockCompanies.length,
    page: 1,
    limit: 10,
  },
  conversations: mockConversations,
  messages: mockMessages,
};