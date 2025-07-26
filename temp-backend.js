const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:19006',
    'http://localhost:3000',
    'http://localhost:8081',
    'http://127.0.0.1:19006',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:8081',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Accept',
    'Origin',
    'X-Requested-With',
    'Access-Control-Allow-Origin',
    'Access-Control-Allow-Headers',
    'Access-Control-Allow-Methods',
  ],
  credentials: true,
  optionsSuccessStatus: 200,
}));

app.use(express.json());

// Mock API endpoints
app.get('/api/auth/profile', (req, res) => {
  res.json({
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    avatar: 'https://via.placeholder.com/150',
    title: 'Software Engineer',
    company: 'Tech Corp',
    location: 'San Francisco, CA',
    bio: 'Passionate software engineer with 5+ years of experience.',
  });
});

app.post('/api/auth/login', (req, res) => {
  res.json({
    token: 'mock-jwt-token',
    user: {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
    },
  });
});

app.get('/api/jobs', (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  res.json({
    jobs: [
      {
        id: '1',
        title: 'Senior Frontend Developer',
        company: 'Tech Corp',
        location: 'San Francisco, CA',
        type: 'FULL_TIME',
        salary: '$120,000 - $150,000',
        description: 'We are looking for a senior frontend developer...',
        requirements: ['React', 'TypeScript', 'Node.js'],
        postedAt: new Date().toISOString(),
      },
      {
        id: '2',
        title: 'Backend Engineer',
        company: 'StartupXYZ',
        location: 'Remote',
        type: 'FULL_TIME',
        salary: '$100,000 - $130,000',
        description: 'Join our backend team to build scalable APIs...',
        requirements: ['Node.js', 'MongoDB', 'AWS'],
        postedAt: new Date().toISOString(),
      },
    ],
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: 2,
      pages: 1,
    },
  });
});

app.get('/api/messaging/conversations', (req, res) => {
  res.json([
    {
      id: '1',
      participants: [
        { id: '1', name: 'John Doe', avatar: 'https://via.placeholder.com/40' },
        { id: '2', name: 'Jane Smith', avatar: 'https://via.placeholder.com/40' },
      ],
      lastMessage: {
        content: 'Hello, how are you?',
        timestamp: new Date().toISOString(),
        senderId: '2',
      },
      unreadCount: 1,
    },
  ]);
});

app.get('/api/messaging/conversations/:id', (req, res) => {
  res.json({
    id: req.params.id,
    participants: [
      { id: '1', name: 'John Doe', avatar: 'https://via.placeholder.com/40' },
      { id: '2', name: 'Jane Smith', avatar: 'https://via.placeholder.com/40' },
    ],
    messages: [
      {
        id: '1',
        content: 'Hello, how are you?',
        timestamp: new Date().toISOString(),
        senderId: '2',
      },
      {
        id: '2',
        content: 'I am doing well, thanks!',
        timestamp: new Date().toISOString(),
        senderId: '1',
      },
    ],
  });
});

app.listen(PORT, () => {
  console.log(`Temporary backend server running on http://localhost:${PORT}`);
  console.log(`API available at: http://localhost:${PORT}/api`);
});