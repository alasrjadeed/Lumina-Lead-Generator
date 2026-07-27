# Project Rules & Guidelines
## Hybrid AI Agent & Real-Time Chat Platform

**Version:** 1.0.0  
**Date:** July 2026

---

## 1. Code Style & Standards

### 1.1 JavaScript/Node.js Rules

```javascript
// ✅ DO: Use ES6+ modules
import express from 'express';
export default router;

// ❌ DON'T: Use CommonJS in new files
const express = require('express');
module.exports = router;
```

```javascript
// ✅ DO: Use async/await for asynchronous operations
async function getUser(id) {
  const user = await User.findById(id);
  return user;
}

// ❌ DON'T: Use raw promises when async/await is clearer
function getUser(id) {
  return User.findById(id).then(user => user);
}
```

```javascript
// ✅ DO: Use destructuring for objects and arrays
const { name, email, role } = user;
const [first, second] = array;

// ❌ DON'T: Access properties individually
const name = user.name;
const email = user.email;
```

### 1.2 Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Variables | camelCase | `userName`, `leadScore` |
| Functions | camelCase | `getUser()`, `createLead()` |
| Classes | PascalCase | `User`, `LeadGenerator` |
| Constants | UPPER_SNAKE_CASE | `APIFY_TOKEN`, `MAX_RETRIES` |
| Files | camelCase | `user.js`, `leadGenerator.js` |
| Routes | kebab-case | `/api/user-profile` |
| Database | camelCase | `businessId`, `createdAt` |

### 1.3 File Organization

```
src/
├── config/           # Configuration files
├── middleware/        # Express middleware
├── models/           # Mongoose models
├── routes/           # API route handlers
├── services/         # Business logic
├── mcp/              # MCP server code
├── socket/           # WebSocket handlers
├── utils/            # Utility functions
└── index.js          # Entry point
```

### 1.4 Import Order

```javascript
// 1. External packages
import express from 'express';
import mongoose from 'mongoose';
import axios from 'axios';

// 2. Internal modules (absolute paths)
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

// 3. Local modules (relative paths)
import { generateToken } from './utils.js';
```

---

## 2. Git Workflow

### 2.1 Branch Naming

| Type | Pattern | Example |
|------|---------|---------|
| Feature | `feature/description` | `feature/instagram-leads` |
| Bug Fix | `bugfix/description` | `bugfix/chat-disconnect` |
| Hotfix | `hotfix/description` | `hotfix/security-patch` |
| Release | `release/version` | `release/1.0.0` |
| Documentation | `docs/description` | `docs/api-update` |

### 2.2 Commit Messages

```
<type>(<scope>): <description>

Types:
- feat:     New feature
- fix:      Bug fix
- docs:     Documentation changes
- style:    Code style changes (formatting, etc.)
- refactor: Code refactoring
- test:     Adding or updating tests
- chore:    Build process or auxiliary tool changes

Examples:
feat(leads): add Instagram lead generation
fix(chat): resolve WebSocket disconnection issue
docs(api): update endpoint documentation
```

### 2.3 Pull Request Rules

1. **Title:** Clear, descriptive title following commit message format
2. **Description:** What changed, why, and how to test
3. **Reviews:** Minimum 1 approval required
4. **Tests:** All tests must pass
5. **Conflict-free:** Must be up to date with main branch
6. **Small Scope:** One feature/fix per PR

---

## 3. API Design Rules

### 3.1 RESTful Conventions

```javascript
// ✅ Resource naming
GET    /api/leads          # List leads
POST   /api/leads          # Create lead
GET    /api/leads/:id      # Get specific lead
PUT    /api/leads/:id      # Update lead
DELETE /api/leads/:id      # Delete lead

// ❌ Avoid
GET    /api/getLeads
POST   /api/createLead
```

### 3.2 Response Format

```javascript
// ✅ Success response
{
  "success": true,
  "data": {
    "leads": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "pages": 5
    }
  }
}

// ✅ Error response
{
  "success": false,
  "message": "Lead not found",
  "error": {
    "code": "LEAD_NOT_FOUND",
    "details": "No lead found with id: 123"
  }
}
```

### 3.3 HTTP Status Codes

| Code | Usage |
|------|-------|
| 200 | Success |
| 201 | Created |
| 204 | No Content (successful delete) |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (authentication required) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 409 | Conflict (duplicate resource) |
| 429 | Too Many Requests (rate limit) |
| 500 | Internal Server Error |

---

## 4. Database Rules

### 4.1 Model Design

```javascript
// ✅ Always include timestamps
const leadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, index: true },
  // ... other fields
}, {
  timestamps: true  // Adds createdAt, updatedAt
});

// ✅ Use proper indexes
leadSchema.index({ businessId: 1, status: 1 });
leadSchema.index({ email: 1, businessId: 1 }, { unique: true });

// ✅ Use soft deletes
leadSchema.add({
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date }
});
```

### 4.2 Query Rules

```javascript
// ✅ Always filter soft deletes
const leads = await Lead.find({ 
  businessId, 
  isDeleted: { $ne: true } 
});

// ✅ Use projections for large documents
const leads = await Lead.find(filter)
  .select('name email status score')
  .lean();

// ✅ Use pagination
const page = parseInt(req.query.page) || 1;
const limit = parseInt(req.query.limit) || 20;
const skip = (page - 1) * limit;
```

---

## 5. Security Rules

### 5.1 Authentication

```javascript
// ✅ Always use protect middleware for protected routes
router.get('/leads', protect, async (req, res) => {
  // req.user is available
});

// ✅ Hash passwords before saving
const salt = await bcrypt.genSalt(10);
user.password = await bcrypt.hash(password, salt);

// ✅ Use JWT with expiration
const token = jwt.sign({ id: userId }, secret, { expiresIn: '30d' });
```

### 5.2 Input Validation

```javascript
// ✅ Always validate input
import { z } from 'zod';

const leadSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().optional(),
  phone: z.string().regex(/^\+?[\d\s-]{10,}$/).optional(),
  company: z.string().max(100).optional()
});

// ✅ Sanitize user input
const sanitized = DOMPurify.sanitize(userInput);
```

### 5.3 Secrets Management

```bash
# ✅ Use environment variables
APIFY_TOKEN=your_token_here
OPENAI_API_KEY=your_key_here

# ❌ Never commit secrets to git
# ❌ Never hardcode API keys
# ❌ Never log sensitive data
```

---

## 6. Error Handling Rules

### 6.1 Try-Catch Pattern

```javascript
// ✅ Always use try-catch in async handlers
router.post('/leads', protect, async (req, res) => {
  try {
    const lead = await Lead.create(req.body);
    res.status(201).json({ success: true, data: { lead } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ Log errors for debugging
try {
  await riskyOperation();
} catch (error) {
  console.error('[OperationName] Error:', error);
  throw error; // Re-throw if caller should handle
}
```

### 6.2 Error Types

```javascript
// ✅ Use specific error types
class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

class NotFoundError extends Error {
  constructor(resource, id) {
    super(`${resource} not found: ${id}`);
    this.name = 'NotFoundError';
  }
}
```

---

## 7. Testing Rules

### 7.1 Test Structure

```javascript
// ✅ Describe blocks for grouping
describe('Lead Generator', () => {
  describe('scrapeBusinesses', () => {
    it('should scrape Google Maps leads', async () => {
      // Arrange
      const query = 'restaurants';
      const location = 'Bahrain';
      
      // Act
      const result = await leadGenerator.scrapeBusinesses(query, location, 'googleMaps');
      
      // Assert
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
    });
  });
});
```

### 7.2 Test Coverage

- **Minimum Coverage:** 80% for new code
- **Critical Paths:** 100% coverage required
- **Edge Cases:** Test boundary conditions
- **Error Cases:** Test failure scenarios

---

## 8. Documentation Rules

### 8.1 Code Comments

```javascript
// ✅ Comment complex logic only
// Calculate lead score based on engagement metrics
const score = (interactions * 10) + (pageViews * 2) - (daysSinceContact * 5);

// ❌ Don't comment obvious code
// Get the user
const user = await User.findById(id);
```

### 8.2 API Documentation

```javascript
/**
 * @api {post} /api/leads Generate leads
 * @apiName GenerateLeads
 * @apiGroup Leads
 * 
 * @apiParam {String} query Search query
 * @apiParam {String} location Target location
 * @apiParam {String} platform Source platform
 * 
 * @apiSuccess {Object} data Generated leads
 */
```

---

## 9. Performance Rules

### 9.1 Database Queries

```javascript
// ✅ Use indexes for frequent queries
Lead.schema.index({ businessId: 1, status: 1 });

// ✅ Use lean() for read-only queries
const leads = await Lead.find(filter).lean();

// ✅ Use select() to limit fields
const leads = await Lead.find(filter).select('name email status');

// ❌ Avoid N+1 queries
// Bad
const leads = await Lead.find();
for (const lead of leads) {
  lead.agent = await User.findById(lead.assignedAgent);
}

// Good
const leads = await Lead.find().populate('assignedAgent', 'name email');
```

### 9.2 Caching

```javascript
// ✅ Cache frequently accessed data
const cachedLeads = await redis.get(`leads:${businessId}`);
if (cachedLeads) {
  return JSON.parse(cachedLeads);
}

const leads = await Lead.find({ businessId });
await redis.setex(`leads:${businessId}`, 3600, JSON.stringify(leads));
```

---

## 10. Deployment Rules

### 10.1 Environment Variables

```bash
# Required
NODE_ENV=production
PORT=5000
MONGODB_URL=mongodb://...
JWT_SECRET=your-secret-key
APIFY_TOKEN=your-token

# Optional
REDIS_URL=redis://localhost:6379
CORS_ORIGIN=http://localhost:5173
LOG_LEVEL=info
```

### 10.2 Docker Rules

```dockerfile
# ✅ Use multi-stage builds
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
EXPOSE 5000
CMD ["node", "src/index.js"]
```

### 10.3 Health Checks

```javascript
// ✅ Always include health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

---

## 11. Prohibited Practices

### 11.1 Never Do

- ❌ Commit API keys or secrets to version control
- ❌ Log sensitive user data (passwords, tokens, PII)
- ❌ Use `console.log` in production (use proper logging)
- ❌ Ignore error handling in async functions
- ❌ Use `var` - use `const` or `let`
- ❌ Use `==` or `!=` - use `===` or `!==`
- ❌ Use `eval()` or `new Function()`
- ❌ Leave `TODO` comments without tickets
- ❌ Skip code review for any changes
- ❌ Deploy without running tests

### 11.2 Always Do

- ✅ Validate all user input
- ✅ Use parameterized queries (prevent SQL injection)
- ✅ Implement rate limiting
- ✅ Use HTTPS in production
- ✅ Keep dependencies updated
- ✅ Write meaningful commit messages
- ✅ Update documentation with code changes
- ✅ Handle errors gracefully
- ✅ Use proper logging levels
- ✅ Follow the principle of least privilege

---

## 12. Code Review Checklist

### Before Submitting PR

- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] No console.log statements in production code
- [ ] Error handling is comprehensive
- [ ] Input validation is implemented
- [ ] Database queries are optimized
- [ ] Documentation is updated
- [ ] Security considerations addressed
- [ ] No hardcoded values
- [ ] Environment variables documented

### During Review

- [ ] Logic is clear and correct
- [ ] Edge cases are handled
- [ ] Performance implications considered
- [ ] Security vulnerabilities checked
- [ ] Test coverage is adequate
- [ ] Code is maintainable
- [ ] Follows SOLID principles
- [ ] No code duplication
