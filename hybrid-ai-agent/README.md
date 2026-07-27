# Hybrid AI Agent & Real-Time Chat Platform

A full-stack platform combining real-time chat with multi-provider AI agents, WhatsApp integration, lead generation, and workflow automation.

## Features

- **Real-Time Chat** - Instant messaging with Socket.IO
- **Multi-Provider AI** - OpenAI, Gemini, Groq, and Claude support
- **WhatsApp Integration** - Send/receive messages via WhatsApp Web
- **Lead Generation** - Apify-powered LinkedIn and web scraping
- **Workflow Automation** - n8n integration for custom pipelines
- **User Authentication** - JWT with OTP email verification
- **File Uploads** - Cloudinary media management
- **Responsive UI** - Modern client built with React

## Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Frontend   | React, Vite, Tailwind CSS, Socket.IO    |
| Backend    | Node.js, Express, Socket.IO, Mongoose   |
| Database   | MongoDB 7                               |
| AI         | OpenAI, Gemini, Groq, Claude APIs       |
| Chat       | WhatsApp Web (whatsapp-web.js)          |
| Leads      | Apify                                    |
| Media      | Cloudinary                               |
| Automation | n8n Webhooks                             |
| Deploy     | Docker, Docker Compose, Nginx            |

## Prerequisites

- [Node.js](https://nodejs.org/) v20+
- [Docker](https://docs.docker.com/get-docker/) & Docker Compose
- [MongoDB](https://www.mongodb.com/) 7+ (if running manually)

## Quick Start

### Docker (Production)

```bash
# Clone and enter the project
cd hybrid-ai-agent

# Create environment file
cp .env.example .env
# Edit .env with your API keys

# Build and start all services
docker compose up -d --build

# Access the app
# Client: http://localhost
# Server: http://localhost:5000
```

### Manual (Development)

```bash
cd hybrid-ai-agent

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install

# Start MongoDB (must be running on localhost:27017)

# Start server
cd ../server && npm run dev

# In a new terminal, start client
cd client && npm run dev
```

### Docker Dev Mode

```bash
# Start MongoDB and server in Docker, run client locally
docker compose -f docker-compose.dev.yml up -d --build

cd client && npm run dev
```

## Environment Variables

Copy `.env.example` to `.env` and fill in:

| Variable               | Description                          | Required |
|------------------------|--------------------------------------|----------|
| `PORT`                 | Server port                          | Yes      |
| `MONGODB_URL`          | MongoDB connection string            | Yes      |
| `JWT_SECRET`           | Secret for JWT signing               | Yes      |
| `CORS_ORIGIN`          | Allowed frontend origin              | Yes      |
| `OPENAI_API_KEY`       | OpenAI API key                       | One AI   |
| `GEMINI_API_KEY`       | Google Gemini API key                | One AI   |
| `GROQ_API_KEY`         | Groq API key                         | One AI   |
| `CLAUDE_API_KEY`       | Anthropic Claude API key             | One AI   |
| `CLOUDINARY_*`         | Cloudinary credentials               | No       |
| `WHATSAPP_SESSION_PATH`| WhatsApp session storage path        | No       |
| `APIFY_TOKEN`          | Apify API token                      | No       |
| `SMTP_*`               | SMTP email credentials               | No       |
| `N8N_WEBHOOK_URL`      | n8n workflow webhook URL             | No       |

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/send-otp` - Send OTP email
- `POST /api/auth/verify-otp` - Verify OTP

### Chat
- `GET /api/chat/rooms` - List chat rooms
- `POST /api/chat/rooms` - Create chat room
- `GET /api/chat/rooms/:id/messages` - Get messages

### AI
- `POST /api/ai/chat` - Send message to AI agent
- `POST /api/ai/stream` - Stream AI response

### WhatsApp
- `GET /api/whatsapp/status` - Connection status
- `POST /api/whatsapp/send` - Send WhatsApp message

### Leads
- `POST /api/leads/scrape` - Start lead scraping job
- `GET /api/leads` - List collected leads

## Deployment

```bash
# On your server
git clone <repo-url> && cd hybrid-ai-agent

cp .env.example .env
# Edit .env with production values and strong secrets

docker compose up -d --build

# Your app is now running on port 80
# Point your domain DNS to the server IP
# Add SSL with Certbot or your preferred method
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

## License

MIT
