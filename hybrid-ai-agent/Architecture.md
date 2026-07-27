# System Architecture
## Hybrid AI Agent & Real-Time Chat Platform

**Version:** 1.0.0  
**Date:** July 2026

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                                       │
├─────────────────┬─────────────────┬─────────────────┬───────────────────────┤
│   Web App       │   Mobile App    │   Chat Widget   │   Admin Dashboard     │
│   (React)       │   (React Native)│   (Embeddable)  │   (React)             │
└────────┬────────┴────────┬────────┴────────┬────────┴───────────┬───────────┘
         │                 │                 │                     │
         ▼                 ▼                 ▼                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         API GATEWAY / LOAD BALANCER                         │
│                           (Nginx / AWS ALB)                                 │
└─────────────────────────────────────┬───────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         APPLICATION LAYER                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │  Auth        │  │  Chat        │  │  Lead        │  │  AI          │   │
│  │  Service     │  │  Service     │  │  Service     │  │  Service     │   │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘   │
│                                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │  WhatsApp    │  │  Email       │  │  Widget      │  │  Analytics   │   │
│  │  Service     │  │  Service     │  │  Service     │  │  Service     │   │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘   │
│                                                                             │
└─────────────────────────────────────┬───────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       REAL-TIME LAYER                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                      Socket.io Server                                │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │  │
│  │  │  Chat       │  │  Presence   │  │  Typing     │                 │  │
│  │  │  Events     │  │  Events     │  │  Indicators │                 │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘                 │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────┬───────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         AI ORCHESTRATION LAYER                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                      MCP Server (Model Context Protocol)            │  │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  │  │
│  │  │  Chat   │  │  Lead   │  │  Email  │  │  WA     │  │  Analytics│ │  │
│  │  │  Tools  │  │  Tools  │  │  Tools  │  │  Tools  │  │  Tools   │  │  │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘  └─────────┘  │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                      AI Provider Abstraction                         │  │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐                │  │
│  │  │ OpenAI  │  │ Gemini  │  │  Groq   │  │ Claude  │                │  │
│  │  │  API    │  │  API    │  │  API    │  │  API    │                │  │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘                │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────┬───────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    EXTERNAL INTEGRATIONS LAYER                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
│  │   Apify     │  │  WhatsApp   │  │  Cloudinary │  │   Gmail     │      │
│  │  (Scraping) │  │  Business   │  │  (Media)    │  │  (Email)    │      │
│  │             │  │  API        │  │             │  │             │      │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘      │
│                                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
│  │  Instagram  │  │  Facebook   │  │  LinkedIn   │  │  Telegram   │      │
│  │  Graph API  │  │  Graph API  │  │  API        │  │  Bot API    │      │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘      │
│                                                                             │
└─────────────────────────────────────┬───────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DATA LAYER                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
│  │  MongoDB    │  │  Redis      │  │  S3/Cloud   │  │  Vector     │      │
│  │  (Primary)  │  │  (Cache)    │  │  Storage    │  │  DB (RAG)   │      │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Component Architecture

### 2.1 Backend Structure

```
server/
├── src/
│   ├── config/
│   │   ├── database.js          # MongoDB connection
│   │   └── ai.js                # AI provider configuration
│   ├── middleware/
│   │   ├── auth.js              # JWT authentication
│   │   ├── role.js              # Role-based access
│   │   ├── upload.js            # File upload handling
│   │   └── validate.js          # Request validation
│   ├── models/
│   │   ├── User.js              # User model
│   │   ├── Lead.js              # Lead model
│   │   ├── Conversation.js      # Conversation model
│   │   ├── Message.js           # Message model
│   │   ├── Business.js          # Business model
│   │   ├── KnowledgeBase.js     # Knowledge base model
│   │   ├── WidgetConfig.js      # Widget configuration
│   │   └── OTPSession.js        # OTP sessions
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   ├── chat.js              # Chat routes
│   │   ├── leads.js             # Lead management routes
│   │   ├── ai.js                # AI service routes
│   │   ├── admin.js             # Admin routes
│   │   ├── widget.js            # Widget routes
│   │   └── agent.js             # Agent routes
│   ├── services/
│   │   ├── ai/
│   │   │   └── aiService.js     # AI provider abstraction
│   │   ├── email/
│   │   │   └── emailService.js  # Email service
│   │   ├── leadgen/
│   │   │   ├── leadGenerator.js # Lead generation service
│   │   │   └── cronJobs.js      # Scheduled tasks
│   │   ├── media/
│   │   │   └── mediaService.js  # Media upload service
│   │   └── whatsapp/
│   │       └── whatsappClient.js # WhatsApp integration
│   ├── mcp/
│   │   ├── index.js             # MCP server entry
│   │   ├── tools.js             # Tool registry
│   │   ├── resources.js         # Resource registry
│   │   ├── prompts.js           # Prompt templates
│   │   ├── handlers.js          # Request handlers
│   │   ├── schemas.js           # Zod schemas
│   │   └── tools/
│   │       ├── chatTools.js     # Chat MCP tools
│   │       ├── leadTools.js     # Lead MCP tools
│   │       ├── aiTools.js       # AI MCP tools
│   │       ├── emailTools.js    # Email MCP tools
│   │       ├── whatsappTools.js # WhatsApp MCP tools
│   │       ├── businessTools.js # Business MCP tools
│   │       └── analyticsTools.js # Analytics MCP tools
│   ├── socket/
│   │   └── chatSocket.js        # Socket.io handlers
│   ├── index.js                 # Application entry
│   └── mcp-server.js            # MCP server entry
├── package.json
└── .env.example
```

### 2.2 Client Structure

```
client/
├── src/
│   ├── components/
│   │   ├── auth/                # Authentication components
│   │   ├── chat/                # Chat interface components
│   │   ├── leads/               # Lead management components
│   │   ├── admin/               # Admin dashboard components
│   │   └── common/              # Shared components
│   ├── hooks/                   # Custom React hooks
│   ├── services/                # API service layer
│   ├── store/                   # State management (Zustand)
│   ├── utils/                   # Utility functions
│   ├── App.jsx                  # Main application
│   └── main.jsx                 # Entry point
├── public/
├── package.json
└── vite.config.js
```

---

## 3. Data Flow Architecture

### 3.1 Lead Generation Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   User      │────▶│   API       │────▶│  Lead       │────▶│  MongoDB    │
│   Request   │     │   Gateway   │     │  Generator  │     │  Database   │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                         │                    │                    │
                         │                    ▼                    │
                         │            ┌─────────────┐             │
                         │            │   Apify     │             │
                         │            │   Scraping  │             │
                         │            └─────────────┘             │
                         │                    │                    │
                         │                    ▼                    │
                         │            ┌─────────────┐             │
                         │            │  AI Scoring │─────────────│
                         │            └─────────────┘             │
                         │                                        │
                         └────────────────────────────────────────┘
                                        Response
```

### 3.2 Real-Time Chat Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────▶│  Socket.io  │────▶│   Server    │
│   Browser   │◀────│   Server    │◀────│   Handler   │
└─────────────┘     └─────────────┘     └─────────────┘
        │                    │                    │
        │                    │                    ▼
        │                    │            ┌─────────────┐
        │                    │            │   MongoDB   │
        │                    │            │   (Messages)│
        │                    │            └─────────────┘
        │                    │
        │                    ▼
        │            ┌─────────────┐
        │            │  WhatsApp   │
        └────────────│  Business   │
                     │  API        │
                     └─────────────┘
```

### 3.3 AI Processing Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   User      │────▶│   MCP       │────▶│   AI        │
│   Input     │     │   Server    │     │   Router    │
└─────────────┘     └─────────────┘     └─────────────┘
                         │                    │
                         │                    ▼
                         │            ┌─────────────┐
                         │            │  Provider   │
                         │            │  Selection  │
                         │            └─────────────┘
                         │                    │
                         │         ┌──────────┼──────────┐
                         │         ▼          ▼          ▼
                         │    ┌─────────┐ ┌─────────┐ ┌─────────┐
                         │    │ OpenAI  │ │ Gemini  │ │  Groq   │
                         │    └─────────┘ └─────────┘ └─────────┘
                         │         │          │          │
                         │         └──────────┼──────────┘
                         │                    ▼
                         │            ┌─────────────┐
                         │            │   Response  │
                         └────────────│   Formatting│
                                      └─────────────┘
```

---

## 4. Database Schema

### 4.1 Core Collections

```javascript
// Users Collection
{
  _id: ObjectId,
  name: String,
  email: String (unique, indexed),
  password: String (hashed),
  phone: String,
  avatar: String,
  role: Enum ['user', 'admin', 'agent'],
  status: Enum ['active', 'inactive', 'banned'],
  theme: String,
  isVerified: Boolean,
  lastSeen: Date,
  createdAt: Date,
  updatedAt: Date
}

// Leads Collection
{
  _id: ObjectId,
  name: String,
  email: String (indexed),
  phone: String,
  company: String,
  source: Enum ['google_maps', 'google_business', 'linkedin', 'instagram', 
                'facebook', 'dubizzle_bahrain', 'opensooq_bahrain', 
                'gdn_classified', 'expatriates_bahrain', 'reddit', 
                'ask_com', 'manual', 'website'],
  status: Enum ['new', 'contacted', 'qualified', 'converted', 'lost'],
  score: Number (0-100),
  businessId: ObjectId (indexed),
  assignedAgent: ObjectId,
  metadata: Map,
  notes: Array [{
    content: String,
    by: ObjectId,
    createdAt: Date
  }],
  interactions: Array [{
    channel: String,
    content: String,
    direction: Enum ['inbound', 'outbound'],
    timestamp: Date
  }],
  tags: [String],
  lastContactedAt: Date,
  isDeleted: Boolean,
  createdAt: Date,
  updatedAt: Date
}

// Conversations Collection
{
  _id: ObjectId,
  participants: [ObjectId],
  type: Enum ['direct', 'group', 'ai'],
  lastMessage: ObjectId,
  unreadCount: Map,
  businessId: ObjectId,
  metadata: Map,
  createdAt: Date,
  updatedAt: Date
}

// Messages Collection
{
  _id: ObjectId,
  conversationId: ObjectId (indexed),
  sender: ObjectId,
  content: String,
  type: Enum ['text', 'image', 'file', 'audio', 'video', 'system'],
  metadata: Map,
  readBy: [ObjectId],
  createdAt: Date
}

// Business Collection
{
  _id: ObjectId,
  name: String,
  owner: ObjectId,
  description: String,
  website: String,
  logo: String,
  settings: Map,
  apiKey: String (unique),
  createdAt: Date,
  updatedAt: Date
}

// KnowledgeBase Collection
{
  _id: ObjectId,
  businessId: ObjectId,
  title: String,
  content: String,
  type: Enum ['document', 'faq', 'policy', 'product'],
  embedding: [Number],
  metadata: Map,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 5. API Architecture

### 5.1 REST API Endpoints

```
Base URL: /api/v1

Authentication:
  POST   /auth/register
  POST   /auth/login
  POST   /auth/send-otp
  POST   /auth/verify-otp
  GET    /auth/me
  PUT    /auth/profile
  PUT    /auth/change-password

Leads:
  GET    /leads
  POST   /leads
  GET    /leads/:id
  PUT    /leads/:id
  DELETE /leads/:id
  POST   /leads/generate
  POST   /leads/score
  POST   /leads/enrich
  POST   /leads/import
  POST   /leads/import-csv
  GET    /leads/stats

Chat:
  GET    /chat/conversations
  POST   /chat/conversations
  GET    /chat/conversations/:id/messages
  POST   /chat/conversations/:id/messages
  POST   /chat/search

AI:
  POST   /ai/chat
  POST   /ai/generate-email
  POST   /ai/analyze-lead
  POST   /ai/suggest-reply

Admin:
  GET    /admin/users
  PUT    /admin/users/:id
  GET    /admin/stats
  GET    /admin/logs

Widget:
  GET    /widget/config
  PUT    /widget/config
  POST   /widget/leads
```

### 5.2 WebSocket Events

```
Client → Server:
  chat:send_message
  chat:typing_start
  chat:typing_stop
  user:online
  user:offline
  lead:update_status

Server → Client:
  chat:new_message
  chat:message_read
  chat:user_typing
  chat:user_stopped_typing
  user:status_change
  lead:new_lead
  lead:updated
  notification:new
```

### 5.3 MCP Tools

```
Chat Tools:
  create_conversation
  send_message
  get_messages
  list_conversations
  search_users
  mark_read
  assign_agent

Lead Tools:
  create_lead
  get_leads
  get_lead
  update_lead
  add_lead_note
  log_lead_interaction
  assign_lead
  import_leads
  generate_leads
  get_lead_stats

AI Tools:
  ai_chat
  generate_email
  analyze_lead
  suggest_reply
  search_knowledge
  add_knowledge
  web_search

WhatsApp Tools:
  whatsapp_send_text
  whatsapp_send_media
  whatsapp_get_status
  whatsapp_get_conversations

Email Tools:
  send_email
  send_otp_email
  send_bulk_email
  generate_outreach_email

Business Tools:
  get_business
  update_business
  get_widget_config
  update_widget_config

Analytics Tools:
  get_dashboard_stats
  get_lead_analytics
  get_chat_analytics
  get_conversion_funnel
```

---

## 6. Security Architecture

### 6.1 Authentication Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────▶│   Auth      │────▶│   JWT       │
│   Request   │     │   Middleware │     │   Verify    │
└─────────────┘     └─────────────┘     └─────────────┘
                         │                    │
                         │                    ▼
                         │            ┌─────────────┐
                         │            │   Token     │
                         │            │   Valid     │
                         │            └─────────────┘
                         │                    │
                         │         ┌──────────┴──────────┐
                         │         ▼                      ▼
                         │    ┌─────────┐           ┌─────────┐
                         │    │  Valid  │           │ Invalid │
                         │    └─────────┘           └─────────┘
                         │         │                      │
                         │         ▼                      ▼
                         │    ┌─────────┐           ┌─────────┐
                         │    │ Proceed │           │ Reject  │
                         │    └─────────┘           └─────────┘
```

### 6.2 Security Measures

- **Authentication:** JWT tokens with 30-day expiration
- **Password Hashing:** bcrypt with salt rounds = 10
- **Rate Limiting:** 1000 requests per 15 minutes
- **Input Validation:** Zod schemas on all endpoints
- **CORS:** Configurable origin whitelist
- **Helmet:** Security headers enabled
- **Data Encryption:** AES-256 for sensitive data
- **API Keys:** Stored in environment variables

---

## 7. Deployment Architecture

### 7.1 Docker Deployment

```yaml
# docker-compose.yml
version: '3.8'

services:
  frontend:
    build: ./client
    ports:
      - "3000:3000"
    depends_on:
      - backend

  backend:
    build: ./server
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URL=mongodb://mongo:27017/hybrid-ai-agent
      - REDIS_URL=redis://redis:6379
    depends_on:
      - mongo
      - redis

  mongo:
    image: mongo:6
    volumes:
      - mongo-data:/data/db
    ports:
      - "27017:27017"

  redis:
    image: redis:7-alpine
    volumes:
      - redis-data:/data
    ports:
      - "6379:6379"

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - frontend
      - backend

volumes:
  mongo-data:
  redis-data:
```

### 7.2 Kubernetes Deployment

```yaml
# k8s deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: hybrid-ai-agent
spec:
  replicas: 3
  selector:
    matchLabels:
      app: hybrid-ai-agent
  template:
    metadata:
      labels:
        app: hybrid-ai-agent
    spec:
      containers:
        - name: backend
          image: hybrid-ai-agent:latest
          ports:
            - containerPort: 5000
          env:
            - name: MONGODB_URL
              valueFrom:
                secretKeyRef:
                  name: app-secrets
                  key: mongodb-url
```

---

## 8. Monitoring & Observability

### 8.1 Metrics

- **Application Metrics:** Request latency, error rates, throughput
- **Business Metrics:** Lead generation volume, conversion rates, chat activity
- **Infrastructure Metrics:** CPU, memory, disk usage, network I/O
- **AI Metrics:** LLM response times, token usage, cost tracking

### 8.2 Logging

- **Structured Logging:** JSON format with correlation IDs
- **Log Levels:** error, warn, info, debug
- **Log Storage:** Centralized logging with ELK stack
- **Retention:** 30 days for application logs, 90 days for audit logs

### 8.3 Health Checks

```
GET /health
{
  "status": "ok",
  "timestamp": "2026-07-21T00:00:00Z",
  "services": {
    "database": "connected",
    "redis": "connected",
    "whatsapp": "initialized"
  }
}
```

---

## 9. Scalability Considerations

### 9.1 Horizontal Scaling

- **Stateless Services:** All API services are stateless
- **Load Balancing:** Round-robin or least connections
- **Session Storage:** Redis for session management
- **Database Sharding:** MongoDB sharding by businessId

### 9.2 Caching Strategy

- **API Response Cache:** Redis with 5-minute TTL
- **Lead Data Cache:** Redis with 1-hour TTL
- **Static Assets:** CDN caching with CloudFront
- **WebSocket:** Sticky sessions for connection affinity

### 9.3 Performance Optimization

- **Database Indexes:** Optimized indexes for frequent queries
- **Connection Pooling:** MongoDB connection pool (100 connections)
- **Compression:** Gzip for API responses
- **Lazy Loading:** Client-side code splitting

---

## 10. Disaster Recovery

### 10.1 Backup Strategy

- **Database:** Daily automated backups with 30-day retention
- **Files:** S3 cross-region replication
- **Configuration:** Git version control
- **Secrets:** Encrypted backup in separate vault

### 10.2 Recovery Procedures

- **RTO (Recovery Time Objective):** 1 hour
- **RPO (Recovery Point Objective):** 5 minutes
- **Failover:** Automatic with health checks
- **Rollback:** Blue-green deployment with instant rollback
