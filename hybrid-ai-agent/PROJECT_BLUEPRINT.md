# PROJECT BLUEPRINT
## Hybrid AI Agent & Real-Time Chat Platform

**Document Version:** 2.0.0  
**Last Updated:** July 27, 2026  
**Author:** Lmina AI Team  
**Classification:** Internal - Confidential

---

## TABLE OF CONTENTS
1. [Executive Overview](#1-executive-overview)
2. [Project Charter](#2-project-charter)
3. [System Landscape](#3-system-landscape)
4. [Core Capabilities](#4-core-capabilities)
5. [Technology Stack](#5-technology-stack)
6. [Integration Architecture](#6-integration-architecture)
7. [Deployment Strategy](#7-deployment-strategy)
8. [Team Structure](#8-team-structure)
9. [Success Criteria](#9-success-criteria)
10. [Resource Requirements](#10-resource-requirements)
11. [Appendices](#11-appendices)

---

## 1. EXECUTIVE OVERVIEW

### 1.1 Project Name
**Hybrid AI Agent Platform** - An intelligent, multi-channel business automation system combining real-time communication with AI-powered lead generation and client management.

### 1.2 Project Code
`LMNA-HYBRID-AI-V2`

### 1.3 Business Justification
Traditional business communication and lead generation are fragmented across multiple tools, requiring manual effort and lacking intelligence. This platform unifies all channels into a single intelligent system that:
- Reduces manual lead generation time by 90%
- Increases lead-to-customer conversion by 3-5x
- Provides 24/7 AI-powered client engagement
- Enables data-driven decision making through comprehensive analytics

### 1.4 Strategic Alignment
- **Digital Transformation:** Enables SMBs to compete with enterprise-level automation
- **AI-First Approach:** Leverages cutting-edge AI to automate repetitive tasks
- **Multi-Channel Strategy:** Meets customers where they are (WhatsApp, Web, Social, Email)
- **Scalability:** Architecture supports growth from 10 to 100,000+ users

---

## 2. PROJECT CHARTER

### 2.1 Mission Statement
Build a unified, intelligent platform that automates lead generation, qualifies prospects, and enables seamless multi-channel communication through AI-powered agents, empowering businesses to scale their sales and marketing efforts exponentially.

### 2.2 Vision Statement
Become the leading AI-powered business automation platform in the MENA region, recognized for:
- Most comprehensive lead generation (12+ sources)
- Highest quality AI interactions
- Most flexible integration options
- Best-in-class user experience

### 2.3 Objectives (SMART Goals)
| Objective | Metric | Target | Timeline | Owner |
|-----------|--------|--------|----------|-------|
| Launch MVP | Feature completion | 100% | Q3 2026 | Engineering |
| Lead generation volume | Leads/day | 1,000+ | Q4 2026 | AI Team |
| Conversion rate | % | 5%+ | Q1 2027 | Sales |
| User adoption | Active users | 1,000+ | Q2 2027 | Marketing |
| Revenue | MRR | $50K+ | Q4 2027 | Business |
| Uptime | % | 99.9% | Ongoing | DevOps |

### 2.4 Scope Statement

#### In Scope
✅ Real-time chat application with AI chatbot
✅ Multi-source lead generation (12+ platforms)
✅ AI-powered lead scoring and qualification
✅ Multi-channel communication (WhatsApp, Web, Email, Social)
✅ MCP Server for tool integration
✅ Analytics and reporting dashboard
✅ Customizable chat widget for websites
✅ API for third-party integrations
✅ Mobile-responsive web application

#### Out of Scope
❌ Native mobile apps (iOS/Android) - Phase 2
❌ Voice calling integration - Phase 2
❌ Video conferencing - Phase 2
❌ Custom AI model training - Phase 3
❌ White-label reseller program - Phase 3
❌ Multi-tenant SaaS architecture - Phase 3

---

## 3. SYSTEM LANDSCAPE

### 3.1 Context Diagram
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           EXTERNAL ENTITIES                                    │
├──────────────────┬──────────────────┬──────────────────┬──────────────────┤
│   Business Users  │   Website Visitors│   Platform APIs  │   AI Providers   │
│   (Primary)       │   (Anonymous)     │   (Integrations) │   (3rd Party)    │
└────────┬─────────┴────────┬─────────┴────────┬─────────┴────────┬─────────┘
         │                  │                  │                  │
         ▼                  ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    HYBRID AI AGENT PLATFORM                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        PRESENTATION LAYER                              │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │   │
│  │  │  Web Portal  │  │  Chat Widget │  │  Mobile Web  │  │  Admin UI    │  │   │
│  │  │  (React)     │  │  (Embed)     │  │  (PWA)       │  │  (Dashboard) │  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      APPLICATION & INTEGRATION LAYER                    │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │   │
│  │  │   API       │  │   MCP       │  │   Socket.io │  │   Workers   │  │   │
│  │  │   Gateway   │  │   Server    │  │   Server    │  │   (Queue)    │  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         DATA & INTELLIGENCE LAYER                       │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │   │
│  │  │   MongoDB   │  │   Redis     │  │   AI Cache   │  │   Analytics  │  │   │
│  │  │   (Primary) │  │   (Cache)    │  │   (Vector)   │  │   (Time-Series)│ │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
         │                  │                  │                  │
         ▼                  ▼                  ▼                  ▼
┌──────────────────┬──────────────────┬──────────────────┬──────────────────┤
│  Email/SMTP       │  WhatsApp API     │  Social APIs     │  Apify/Scraping  │
│  (SendGrid/Gmail) │  (Business)        │  (Meta, LinkedIn) │  (Lead Gen)       │
└──────────────────┴──────────────────┴──────────────────┴──────────────────┘
```

### 3.2 Component Inventory

| Component | Type | Purpose | Technology | Owner |
|-----------|------|---------|------------|-------|
| Web Portal | UI | Main user interface | React, Tailwind | Frontend |
| Chat Widget | UI | Embeddable chat for websites | React, Iframe | Frontend |
| Admin Dashboard | UI | Analytics and management | React, Charts | Frontend |
| API Server | Backend | REST API endpoints | Node, Express | Backend |
| MCP Server | Backend | Tool execution engine | Node, MCP SDK | Backend |
| Socket Server | Backend | Real-time communication | Socket.io | Backend |
| Worker Queue | Backend | Background jobs | Bull/BullMQ | Backend |
| MongoDB | Database | Primary data store | MongoDB Atlas | DevOps |
| Redis | Cache | Session and cache | Redis Cloud | DevOps |
| Cloudinary | Storage | Media files | Cloudinary | DevOps |

### 3.3 Data Flow Architecture
```
User Request
     │
     ▼
┌─────────────────┐
│   Load Balancer  │ ←─ (Nginx/AWS ALB)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   API Gateway   │ ←─ (Express Middleware)
└────────┬────────┘
         │
    ┌────┴────┬─────────────────┐
    │         │                 │
    ▼         ▼                 ▼
┌─────────┐ ┌─────────┐ ┌─────────────────┐
│  Auth    │ │  Chat   │ │   Lead           │
│  Service │ │  Service│ │   Generation      │
└────┬─────┘ └────┬────┘ │   Service         │
     │           │        └────────┬────────┘
     │           │                 │
     ▼           ▼                 ▼
┌─────────────────────────────────────────────┐
│              Data Layer                       │
│  ┌─────────────────┬─────────────────┐       │
│  │    MongoDB      │    Redis Cache   │       │
│  └─────────────────┴─────────────────┘       │
└─────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│           External Services                    │
│  Apify • WhatsApp • Email • Social APIs • AI  │
└─────────────────────────────────────────────┘
```

---

## 4. CORE CAPABILITIES

### 4.1 Feature Matrix

| Category | Feature | Priority | Status | Complexity |
|----------|---------|----------|--------|------------|
| **Chat** | Real-time messaging | P0 | ✅ Done | Medium |
| **Chat** | AI-powered responses | P0 | ✅ Done | High |
| **Chat** | Media sharing | P0 | ✅ Done | Medium |
| **Chat** | Typing indicators | P1 | ✅ Done | Low |
| **Chat** | Read receipts | P1 | 🟡 TODO | Low |
| **Chat** | Voice messages | P2 | 🟡 TODO | Medium |
| **Chat** | Message search | P2 | 🟡 TODO | Medium |
| **Chat** | Group chats | P2 | 🟡 TODO | Medium |
| **Lead Gen** | Google Maps scraping | P0 | ✅ Done | High |
| **Lead Gen** | Google Business scraping | P0 | ✅ Done | High |
| **Lead Gen** | LinkedIn scraping | P0 | ✅ Done | High |
| **Lead Gen** | Instagram scraping | P0 | ✅ Done | High |
| **Lead Gen** | Facebook scraping | P0 | ✅ Done | High |
| **Lead Gen** | Classifieds (6 sources) | P0 | ✅ Done | High |
| **Lead Gen** | Custom website scraping | P0 | ✅ Done | High |
| **Lead Gen** | Lead deduplication | P0 | ✅ Done | Medium |
| **Lead Gen** | AI scoring | P0 | ✅ Done | High |
| **Lead Gen** | Lead enrichment | P1 | 🟡 TODO | High |
| **Lead Gen** | Bulk import | P1 | ✅ Done | Medium |
| **AI** | Multi-LLM support | P0 | ✅ Done | High |
| **AI** | Context-aware responses | P0 | ✅ Done | High |
| **AI** | Email generation | P0 | ✅ Done | Medium |
| **AI** | Lead analysis | P0 | ✅ Done | High |
| **AI** | Conversation summarization | P1 | 🟡 TODO | Medium |
| **AI** | Sentiment analysis | P1 | 🟡 TODO | Medium |
| **AI** | Knowledge base | P1 | ✅ Done | Medium |
| **WhatsApp** | Text messaging | P0 | ✅ Done | High |
| **WhatsApp** | Media sharing | P0 | ✅ Done | High |
| **WhatsApp** | Templates | P1 | 🟡 TODO | Medium |
| **WhatsApp** | Status tracking | P1 | ✅ Done | Low |
| **Email** | SMTP integration | P0 | ✅ Done | Medium |
| **Email** | Bulk email | P1 | ✅ Done | Medium |
| **Email** | Templates | P1 | 🟡 TODO | Low |
| **Analytics** | Dashboard | P1 | ✅ Done | Medium |
| **Analytics** | Lead tracking | P1 | ✅ Done | Medium |
| **Analytics** | Chat analytics | P1 | ✅ Done | Medium |
| **Analytics** | Conversion funnel | P1 | ✅ Done | Medium |
| **Analytics** | Export reports | P2 | 🟡 TODO | Low |

### 4.2 Capability Details

#### 4.2.1 Real-Time Chat System
- **Technology:** Socket.io v4.7+
- **Features:**
  - Instant message delivery (<100ms)
  - Online/offline presence tracking
  - Typing indicators
  - Message read receipts
  - Media uploads (images, videos, documents)
  - Group chats (up to 100 participants)
  - AI chatbot integration
- **Scalability:** Supports 10,000+ concurrent connections
- **Persistence:** Messages stored in MongoDB with 1-year retention

#### 4.2.2 AI Agent System
- **Supported LLMs:**
  - OpenAI (GPT-4, GPT-3.5)
  - Google Gemini (1.5 Pro, 1.5 Flash)
  - Groq (Llama 3, Mixtral)
  - Claude (3 Sonnet, 3 Haiku)
  - DeepSeek (Chat, Coder)
  - NVIDIA NIM
  - Hugging Face
- **Capabilities:**
  - Natural language understanding
  - Context-aware responses
  - Multi-turn conversation memory
  - Lead qualification scoring (0-100)
  - Email generation and personalization
  - Sentiment analysis
  - Intent detection
- **Abstraction Layer:** Unified API for all providers

#### 4.2.3 Lead Generation Engine
- **Sources (12):**
  1. Google Maps
  2. Google Business
  3. LinkedIn
  4. Instagram
  5. Facebook
  6. Dubizzle Bahrain
  7. OpenSooq Bahrain
  8. GDN Classifieds
  9. Expatriates Bahrain
  10. Reddit r/Bahrain
  11. Ask.com
  12. Custom websites
- **Scraping Technology:** Apify actors + Custom scrapers
- **Deduplication:** Fuzzy matching + Exact matching
- **Scoring:** AI-powered analysis of 20+ data points
- **Enrichment:** Contact info, social profiles, company data

#### 4.2.4 Multi-Channel Communication
- **WhatsApp Business API:**
  - Text messages
  - Media (images, videos, documents)
  - Voice notes
  - Message templates
  - Status tracking
- **Web Chat Widget:**
  - Embeddable on any website
  - Customizable branding
  - 30+ theme options (DaisyUI)
  - Mobile-responsive
- **Email:**
  - SMTP integration
  - Bulk email campaigns
  - HTML templates
  - Open/click tracking
- **Social Media:**
  - Instagram DMs
  - Facebook Messenger
  - LinkedIn Messages
  - Telegram Bot

---

## 5. TECHNOLOGY STACK

### 5.1 Frontend Stack
| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| Framework | React.js | 18.x | UI components |
| Styling | Tailwind CSS | 3.x | Utility-first CSS |
| Components | DaisyUI | 4.x | Pre-built components |
| Icons | Heroicons | 2.x | UI icons |
| State Management | Context API | Built-in | Global state |
| Forms | React Hook Form | 7.x | Form handling |
| Charts | Chart.js | 4.x | Data visualization |
| PWA | Workbox | 7.x | Offline support |

### 5.2 Backend Stack
| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| Runtime | Node.js | 20.x LTS | JavaScript runtime |
| Framework | Express.js | 4.x | Web framework |
| Database | MongoDB | 8.x | Document database |
| ODM | Mongoose | 8.x | MongoDB modeling |
| Cache | Redis | 7.x | In-memory cache |
| Real-time | Socket.io | 4.7.x | WebSocket communication |
| Validation | Zod | 3.x | Schema validation |
| Authentication | JWT | 9.x | Token-based auth |
| Rate Limiting | express-rate-limit | 7.x | API protection |
| File Upload | Multer | 1.4.x | Form data handling |
| CORS | cors | 2.8.x | Cross-origin support |

### 5.3 AI & Integration Stack
| Service | Technology | Purpose |
|---------|------------|---------|
| LLM Abstraction | Custom SDK | Unified AI interface |
| MCP Server | @modelcontextprotocol/sdk | Tool execution |
| Scraping | Apify Client | Web scraping |
| WhatsApp | whatsapp-web.js | WhatsApp integration |
| Email | Nodemailer | Email sending |
| Media Storage | Cloudinary | Image/video hosting |
| QR Codes | qrcode-terminal | Terminal QR display |
| TTS | Edge TTS | Text-to-speech |

### 5.4 DevOps & Infrastructure
| Category | Technology | Purpose |
|----------|------------|---------|
| Containerization | Docker | Application packaging |
| Orchestration | Docker Compose | Multi-container management |
| CI/CD | GitHub Actions | Automated deployment |
| Monitoring | PM2 | Process management |
| Logging | Winston | Structured logging |
| Environment | dotenv | Configuration management |
| Documentation | Swagger/OpenAPI | API documentation |

---

## 6. INTEGRATION ARCHITECTURE

### 6.1 MCP Server Integration
The MCP (Model Context Protocol) server provides 43+ tools for AI agents to interact with the platform:

#### 6.1.1 Tool Categories
- **Chat Tools (7):** Conversation management, messaging, user search
- **Lead Tools (11):** Lead CRUD, generation, scoring, analytics
- **AI Tools (7):** Chat, email generation, analysis, knowledge base
- **WhatsApp Tools (4):** Message sending, media, status
- **Email Tools (4):** Sending, OTP, bulk, templates
- **Business Tools (4):** Profile, settings, widget configuration
- **Analytics Tools (4):** Dashboard, lead analytics, chat analytics, funnel

#### 6.1.2 Auto-Discovery
The system includes auto-discovery of MCP servers from:
- Configuration files (`mcp-config.json`)
- Environment variables (`MCP_SERVERS`)
- Local server indexing

### 6.2 Third-Party Integrations

| Integration | Type | API | Use Case |
|-------------|------|-----|----------|
| Apify | Scraping | REST API | Lead generation |
| WhatsApp Business | Messaging | Web API | Client communication |
| Cloudinary | Storage | REST API | Media hosting |
| OpenAI | AI | REST API | LLM capabilities |
| Google Gemini | AI | REST API | LLM capabilities |
| Groq | AI | REST API | Fast inference |
| Claude | AI | REST API | Advanced reasoning |
| DeepSeek | AI | REST API | Cost-effective AI |
| NVIDIA NIM | AI | REST API | GPU-accelerated AI |
| Hugging Face | AI | REST API | Open-source models |
| Gmail | Email | SMTP | Email sending |
| SendGrid | Email | REST API | Bulk email |
| Instagram | Social | Graph API | Lead source |
| Facebook | Social | Graph API | Lead source |
| LinkedIn | Social | API | Lead source |

---

## 7. DEPLOYMENT STRATEGY

### 7.1 Environment Strategy
| Environment | Purpose | Access | Data |
|-------------|---------|--------|------|
| Development | Local development | Developers | Local MongoDB |
| Staging | Pre-production testing | Team | Staging DB |
| Production | Live system | Public | Production DB |

### 7.2 Deployment Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                        DEPLOYMENT OPTIONS                        │
├─────────────────┬─────────────────┬─────────────────┬─────────┤
│   Local Dev     │   Docker        │   Cloud Native  │  Server  │
│   (Single)      │   (Compose)     │   (K8s)         │  (Bare)  │
├─────────────────┼─────────────────┼─────────────────┼─────────┤
│  - Single host  │  - Multi-        │  - Kubernetes    │  - PM2   │
│  - Node + Mongo │    container     │  - Helm charts   │  - Nginx │
│  - Hot reload   │  - Isolated       │  - Auto-scaling  │  - SSL   │
│  - Debug mode   │    services      │  - Load balancer │         │
└─────────────────┴─────────────────┴─────────────────┴─────────┘
```

### 7.3 Infrastructure Requirements

#### Minimum (Development)
- CPU: 2 cores
- RAM: 4GB
- Storage: 50GB SSD
- OS: Linux/Windows/macOS
- Docker: 20.x+

#### Recommended (Staging)
- CPU: 4 cores
- RAM: 8GB
- Storage: 100GB SSD
- OS: Ubuntu 22.04 LTS
- Docker: 20.x+

#### Production (Small Scale)
- CPU: 8 cores
- RAM: 16GB
- Storage: 200GB SSD
- OS: Ubuntu 22.04 LTS
- Docker: 20.x+
- MongoDB: Atlas M10+
- Redis: Cloud Memory 1GB+

#### Production (Enterprise)
- CPU: 16+ cores
- RAM: 32GB+
- Storage: 500GB+ SSD
- OS: Ubuntu 22.04 LTS
- Kubernetes: 3+ nodes
- MongoDB: Atlas M30+ (Replica Set)
- Redis: Cloud Memory 4GB+ (Cluster)
- Load Balancer: AWS ALB / Nginx

---

## 8. TEAM STRUCTURE

### 8.1 Organizational Structure
```
┌─────────────────────────────────────────────────────────────┐
│                      PROJECT LEADERSHIP                        │
├─────────────────────────────────────────────────────────────┤
│  Product Owner • Technical Lead • Architecture Lead           │
└─────────────────────────────────┬─────────────────────────────┘
                                      │
         ┌────────────────────────────┼────────────────────────────┐
         │                            │                            │
    ┌────┴─────┐                ┌────┴─────┐                ┌────┴─────┐
    │ Frontend │                │ Backend  │                │ AI/ML    │
    │  Team    │                │  Team    │                │  Team    │
    └────┬─────┘                └────┬─────┘                └────┬─────┘
         │                            │                            │
    ┌────┴─────┐                ┌────┴─────┐                ┌────┴─────┐
    │  React   │                │  Node.js │                │  LLM     │
    │  Dev 1   │                │  Dev 1   │                │  Engineer│
    │  React   │                │  Node.js │                │  Prompt  │
    │  Dev 2   │                │  Dev 2   │                │  Engineer│
    │  UI/UX   │                │  Dev 3   │                └──────────┘
    └──────────┘                └────┬─────┘
                                   │
                              ┌────┴─────┐
                              │ DevOps   │
                              │ Engineer │
                              └──────────┘
```

### 8.2 Roles & Responsibilities

| Role | Responsibilities | Team Size | Reporting To |
|------|------------------|-----------|--------------|
| Product Owner | Define features, prioritize backlog, stakeholder management | 1 | CEO |
| Technical Lead | Architecture decisions, code reviews, technical direction | 1 | CTO |
| Frontend Lead | UI/UX implementation, React development | 1 | Tech Lead |
| Backend Lead | API, database, server development | 1 | Tech Lead |
| AI/ML Lead | AI integration, prompt engineering, model optimization | 1 | Tech Lead |
| DevOps Engineer | Deployment, CI/CD, monitoring, infrastructure | 1 | Tech Lead |
| Frontend Developer | React components, UI implementation | 2 | Frontend Lead |
| Backend Developer | Node.js, API, database | 3 | Backend Lead |
| AI Engineer | LLM integration, prompt engineering | 2 | AI Lead |
| QA Engineer | Testing, quality assurance | 1 | Tech Lead |

### 8.3 Skill Requirements

#### Frontend
- React.js (3+ years)
- Tailwind CSS
- DaisyUI
- Socket.io client
- Responsive design
- PWA development

#### Backend
- Node.js (3+ years)
- Express.js
- MongoDB/Mongoose
- Socket.io
- REST API design
- JWT authentication

#### AI/ML
- LLM integration (OpenAI, Gemini, etc.)
- Prompt engineering
- Vector databases
- AI model evaluation
- Python (optional, for data processing)

#### DevOps
- Docker/Docker Compose
- Kubernetes (Phase 2)
- CI/CD pipelines
- Monitoring (Prometheus, Grafana)
- Cloud platforms (AWS/Azure/GCP)

---

## 9. SUCCESS CRITERIA

### 9.1 Technical KPIs
| KPI | Target | Measurement | Frequency |
|-----|--------|-------------|-----------|
| System Uptime | 99.9% | Monitoring dashboard | Monthly |
| API Response Time (P95) | < 200ms | APM tools | Continuous |
| Real-time Message Latency | < 100ms | Socket.io metrics | Continuous |
| Lead Generation Time | < 30s/batch | Logging | Per batch |
| Concurrent Users | 10,000+ | Load testing | As needed |
| Database Query Time | < 50ms | MongoDB Atlas | Continuous |

### 9.2 Business KPIs
| KPI | Target | Measurement | Frequency |
|-----|--------|-------------|-----------|
| Lead Generation Volume | 1,000+/day | Database count | Daily |
| Lead-to-Customer Conversion | 5%+ | CRM tracking | Monthly |
| User Satisfaction (NPS) | 4.5/5 | User surveys | Quarterly |
| Active Users | 1,000+ | Analytics | Monthly |
| Monthly Recurring Revenue | $50K+ | Billing system | Monthly |
| Customer Retention | 90%+ | Subscription analytics | Monthly |

### 9.3 Quality Metrics
| Metric | Target | Measurement |
|--------|--------|-------------|
| Code Coverage | 80%+ | Jest tests | Per PR |
| Security Vulnerabilities | 0 critical | Snyk/Dependabot | Weekly |
| Performance Score (Lighthouse) | 90+ | Lighthouse | Per release |
| Accessibility Compliance | WCAG 2.1 AA | Audit tools | Per release |
| Bug Escape Rate | < 2% | Production incidents | Monthly |

---

## 10. RESOURCE REQUIREMENTS

### 10.1 Human Resources
| Role | Count | Duration | Cost (Est.) |
|------|-------|----------|-------------|
| Product Owner | 1 | 12 months | $120K |
| Technical Lead | 1 | 12 months | $150K |
| Frontend Lead | 1 | 12 months | $130K |
| Backend Lead | 1 | 12 months | $140K |
| AI/ML Lead | 1 | 12 months | $160K |
| DevOps Engineer | 1 | 12 months | $140K |
| Frontend Developer | 2 | 12 months | $240K |
| Backend Developer | 3 | 12 months | $360K |
| AI Engineer | 2 | 12 months | $280K |
| QA Engineer | 1 | 12 months | $100K |
| **Total** | **14** | **12 months** | **$1.82M** |

### 10.2 Technology Resources
| Resource | Type | Estimated Cost (Annual) |
|----------|------|-------------------------|
| MongoDB Atlas | Database | $12,000 |
| Redis Cloud | Cache | $6,000 |
| Cloudinary | Storage | $5,000 |
| Apify | Scraping | $24,000 |
| OpenAI API | AI | $50,000 |
| Google Cloud | Infrastructure | $30,000 |
| GitHub | Version Control | $4,800 |
| Sentry | Monitoring | $3,600 |
| **Total** | | **$135,400** |

### 10.3 Infrastructure Costs
| Environment | Specification | Monthly Cost |
|-------------|---------------|--------------|
| Development | Local machines | $0 |
| Staging | Cloud VM (4 vCPU, 8GB RAM) | $200 |
| Production | Cloud VM (8 vCPU, 16GB RAM) | $800 |
| Disaster Recovery | Backup storage | $100 |
| **Total (Monthly)** | | **$1,100** |

---

## 11. APPENDICES

### Appendix A: Glossary
| Term | Definition |
|------|------------|
| AI Agent | Autonomous software entity that performs tasks using AI |
| MCP | Model Context Protocol - Standard for AI tool integration |
| LLM | Large Language Model - AI models for text generation |
| Lead | Potential customer contact |
| Scraping | Automated data extraction from websites |
| Enrichment | Adding additional data to existing records |
| Deduplication | Removing duplicate entries |
| PWA | Progressive Web App - Web app with native capabilities |

### Appendix B: Document References
- [PRD.md](PRD.md) - Product Requirements Document
- [Architecture.md](Architecture.md) - System Architecture
- [Phases.md](Phases.md) - Implementation Phases
- [Design.md](Design.md) - UI/UX Design
- [Rules.md](Rules.md) - Development Guidelines
- [Security.md](Security.md) - Security Documentation

### Appendix C: Version History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | June 2026 | Lmina AI Team | Initial draft |
| 2.0.0 | July 27, 2026 | Mistral Vibe | Complete rewrite, added blueprint structure |

---

**Document Classification:** Internal - Confidential  
**Next Review Date:** August 27, 2026  
**Approver:** Technical Lead

---

*This document is maintained by the Lmina AI Team. For questions or updates, contact the Technical Lead.*
