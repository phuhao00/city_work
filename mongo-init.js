// MongoDB initialization script
db = db.getSiblingDB('city_work');

// Create collections
db.createCollection('users');
db.createCollection('companies');
db.createCollection('jobs');
db.createCollection('applications');
db.createCollection('savedjobs');
db.createCollection('messages');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.jobs.createIndex({ "title": "text", "description": "text", "skills": "text" });
db.jobs.createIndex({ "companyId": 1 });
db.jobs.createIndex({ "location": 1 });
db.jobs.createIndex({ "type": 1 });
db.jobs.createIndex({ "isActive": 1 });

db.applications.createIndex({ "userId": 1, "jobId": 1 }, { unique: true });
db.savedjobs.createIndex({ "userId": 1, "jobId": 1 }, { unique: true });

db.messages.createIndex({ "senderId": 1, "recipientId": 1 });
db.messages.createIndex({ "createdAt": -1 });

print('Database initialized successfully!');