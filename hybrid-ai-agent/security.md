# Security Document
## Hybrid AI Agent & Real-Time Chat Platform

**Version:** 1.0.0  
**Date:** July 2026  
**Classification:** Confidential

---

## 1. Security Overview

### 1.1 Security Principles

1. **Defense in Depth:** Multiple layers of security controls
2. **Least Privilege:** Minimum required permissions
3. **Zero Trust:** Verify everything, trust nothing
4. **Security by Design:** Built-in, not bolted-on
5. **Continuous Monitoring:** Real-time threat detection

### 1.2 Security Objectives

| Objective | Description | Priority |
|-----------|-------------|----------|
| Confidentiality | Protect sensitive data from unauthorized access | Critical |
| Integrity | Ensure data accuracy and prevent tampering | Critical |
| Availability | Maintain system uptime and accessibility | High |
| Authentication | Verify user identity | Critical |
| Authorization | Control access to resources | Critical |
| Auditability | Track and log all actions | High |

---

## 2. Authentication

### 2.1 JWT Authentication

```javascript
// Token Structure
{
  header: {
    alg: "HS256",
    typ: "JWT"
  },
  payload: {
    id: "user_id",
    role: "user",
    iat: 1690000000,
    exp: 1692592000  // 30 days
  },
  signature: "HMACSHA256(base64UrlEncode(header) + '.' + base64UrlEncode(payload), secret)"
}
```

### 2.2 Password Security

```javascript
// Password Hashing Configuration
const bcryptConfig = {
  saltRounds: 10,           // Minimum 10
  memoryCost: 65536,        // 64MB
  timeCost: 3,              // 3 iterations
  parallelism: 1            // Single thread
};

// Password Policy
const passwordPolicy = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  preventReuse: 5,          // Last 5 passwords
  maxAge: 90                // Days before forced change
};
```

### 2.3 OTP Authentication

```javascript
// OTP Configuration
const otpConfig = {
  length: 6,
  expiry: 300,              // 5 minutes
  maxAttempts: 5,
  lockoutDuration: 1800,    // 30 minutes
  rateLimit: {
    windowMs: 900000,       // 15 minutes
    maxRequests: 5          // 5 OTP requests per window
  }
};
```

### 2.4 Multi-Factor Authentication (Future)

```javascript
// MFA Options
const mfaOptions = {
  totp: true,               // Time-based OTP (Google Authenticator)
  sms: true,                // SMS verification
  email: true,              // Email verification
  backupCodes: 10           // Backup recovery codes
};
```

---

## 3. Authorization

### 3.1 Role-Based Access Control (RBAC)

```javascript
const roles = {
  user: {
    permissions: [
      'read:own_profile',
      'update:own_profile',
      'read:conversations',
      'send:messages',
      'read:leads'
    ]
  },
  agent: {
    permissions: [
      'read:own_profile',
      'update:own_profile',
      'read:conversations',
      'send:messages',
      'read:leads',
      'update:leads',
      'assign:leads',
      'read:analytics'
    ]
  },
  admin: {
    permissions: [
      'read:all_profiles',
      'update:all_profiles',
      'delete:profiles',
      'read:all_conversations',
      'manage:leads',
      'manage:settings',
      'read:all_analytics',
      'manage:users',
      'manage:api_keys'
    ]
  },
  superadmin: {
    permissions: ['*']  // All permissions
  }
};
```

### 3.2 Permission Matrix

| Resource | User | Agent | Admin | SuperAdmin |
|----------|------|-------|-------|------------|
| Own Profile | R/U | R/U | R/U/D | R/U/D |
| Other Profiles | - | - | R/U | R/U/D |
| Conversations | R/S | R/S | R/S/D | R/S/D |
| Leads | R | R/U | R/U/D | R/U/D |
| Analytics | - | R | R | R |
| Settings | - | - | R/U | R/U/D |
| Users | - | - | R/U | R/U/D |
| API Keys | - | - | - | R/U/D |

---

## 4. Data Protection

### 4.1 Data Classification

| Level | Description | Examples |
|-------|-------------|----------|
| **Public** | No restriction | Public profile info |
| **Internal** | Internal use only | System logs, metrics |
| **Confidential** | Restricted access | User PII, chat messages |
| **Secret** | Highly restricted | API keys, passwords |

### 4.2 Encryption

```javascript
// At Rest
const encryptionConfig = {
  algorithm: 'aes-256-gcm',
  keySize: 256,
  ivSize: 128,
  tagSize: 128,
  saltSize: 64
};

// In Transit
const tlsConfig = {
  minVersion: 'TLSv1.2',
  ciphers: [
    'ECDHE-RSA-AES128-GCM-SHA256',
    'ECDHE-RSA-AES256-GCM-SHA384',
    'ECDHE-RSA-AES128-SHA256',
    'ECDHE-RSA-AES256-SHA384'
  ]
};
```

### 4.3 Sensitive Data Handling

```javascript
// Fields to encrypt
const sensitiveFields = [
  'password',
  'phone',
  'email',
  'apiKeys',
  'tokens'
];

// Fields to mask in logs
const maskedFields = [
  'password',
  'token',
  'apiKey',
  'secret',
  'creditCard'
];

// Logging sanitization
function sanitizeLog(data) {
  const sanitized = { ...data };
  for (const field of maskedFields) {
    if (sanitized[field]) {
      sanitized[field] = '***MASKED***';
    }
  }
  return sanitized;
}
```

---

## 5. Input Validation

### 5.1 Zod Schemas

```javascript
import { z } from 'zod';

// User Input Validation
const userSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name too long')
    .regex(/^[a-zA-Z\s]+$/, 'Invalid characters'),
  
  email: z.string()
    .email('Invalid email')
    .max(255, 'Email too long'),
  
  phone: z.string()
    .regex(/^\+?[\d\s-]{10,}$/, 'Invalid phone')
    .optional(),
  
  password: z.string()
    .min(8, 'Password too short')
    .max(128, 'Password too long')
    .regex(/[A-Z]/, 'Need uppercase')
    .regex(/[a-z]/, 'Need lowercase')
    .regex(/[0-9]/, 'Need number')
    .regex(/[^A-Za-z0-9]/, 'Need special char')
});

// Lead Input Validation
const leadSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().optional(),
  phone: z.string().regex(/^\+?[\d\s-]{10,}$/).optional(),
  company: z.string().max(100).optional(),
  source: z.enum(['google_maps', 'linkedin', 'instagram', 'facebook', 'manual'])
});
```

### 5.2 SQL Injection Prevention

```javascript
// ✅ Use parameterized queries
const user = await User.findOne({ email: req.body.email });

// ✅ Use Mongoose (built-in protection)
const leads = await Lead.find({ businessId: req.user.business });

// ❌ Never concatenate user input into queries
// BAD: db.collection.find({ email: userInput })  // If userInput is crafted
```

### 5.3 XSS Prevention

```javascript
import DOMPurify from 'dompurify';

// Sanitize user input
const clean = DOMPurify.sanitize(userInput, {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
  ALLOWED_ATTR: ['href']
});

// Set Content-Security-Policy headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "wss:"]
    }
  }
}));
```

---

## 6. Rate Limiting

### 6.1 Global Rate Limits

```javascript
const globalRateLimit = {
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 1000,                   // 1000 requests per window
  message: 'Too many requests',
  standardHeaders: true,
  legacyHeaders: false
};
```

### 6.2 Endpoint-Specific Limits

```javascript
const endpointLimits = {
  '/api/auth/login': {
    windowMs: 15 * 60 * 1000,
    max: 10,                    // 10 login attempts per 15 min
    message: 'Too many login attempts'
  },
  '/api/auth/send-otp': {
    windowMs: 15 * 60 * 1000,
    max: 5,                     // 5 OTP requests per 15 min
    message: 'Too many OTP requests'
  },
  '/api/leads/generate': {
    windowMs: 60 * 60 * 1000,
    max: 50,                    // 50 lead generations per hour
    message: 'Lead generation limit reached'
  }
};
```

### 6.3 IP-Based Blocking

```javascript
const ipBlocklist = new Set();

// Add suspicious IPs
function blockIP(ip, reason, duration = 3600000) {
  ipBlocklist.add(ip);
  setTimeout(() => ipBlocklist.delete(ip), duration);
  logSecurityEvent('IP_BLOCKED', { ip, reason });
}

// Check blocked IPs
function isIPBlocked(ip) {
  return ipBlocklist.has(ip);
}
```

---

## 7. API Security

### 7.1 CORS Configuration

```javascript
const corsConfig = {
  origin: function(origin, callback) {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://yourdomain.com'
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['X-Total-Count'],
  maxAge: 600  // 10 minutes
};
```

### 7.2 Security Headers

```javascript
app.use(helmet({
  contentSecurityPolicy: true,
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: { policy: 'same-site' },
  dnsPrefetchControl: true,
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  ieNoOpen: true,
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true
}));
```

### 7.3 Request Validation

```javascript
// Validate Content-Type
app.use((req, res, next) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    if (!req.is('application/json')) {
      return res.status(415).json({ 
        error: 'Unsupported Media Type' 
      });
    }
  }
  next();
});

// Validate Content-Length
app.use(express.json({ limit: '10mb' }));

// Validate required headers
function requireHeaders(...headers) {
  return (req, res, next) => {
    for (const header of headers) {
      if (!req.headers[header]) {
        return res.status(400).json({
          error: `Missing required header: ${header}`
        });
      }
    }
    next();
  };
}
```

---

## 8. WebSocket Security

### 8.1 Connection Authentication

```javascript
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication required'));
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    socket.userRole = decoded.role;
    
    next();
  } catch (err) {
    next(new Error('Invalid token'));
  }
});
```

### 8.2 Message Validation

```javascript
// Validate incoming messages
function validateMessage(data) {
  const schema = z.object({
    conversationId: z.string(),
    content: z.string().min(1).max(5000),
    type: z.enum(['text', 'image', 'file'])
  });
  
  return schema.safeParse(data);
}

// Sanitize message content
function sanitizeMessage(content) {
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });
}
```

### 8.3 Rate Limiting for WebSocket

```javascript
const wsRateLimit = new Map();

function checkWsRateLimit(userId, event) {
  const key = `${userId}:${event}`;
  const now = Date.now();
  const windowMs = 60000; // 1 minute
  const maxMessages = 60;
  
  if (!wsRateLimit.has(key)) {
    wsRateLimit.set(key, []);
  }
  
  const timestamps = wsRateLimit.get(key).filter(t => now - t < windowMs);
  
  if (timestamps.length >= maxMessages) {
    return false;
  }
  
  timestamps.push(now);
  wsRateLimit.set(key, timestamps);
  
  return true;
}
```

---

## 9. WhatsApp Security

### 9.1 Webhook Verification

```javascript
// Verify Meta webhook
function verifyWebhook(req, res) {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  
  if (mode === 'subscribe' && token === process.env.WEBHOOK_VERIFY_TOKEN) {
    console.log('Webhook verified');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
}
```

### 9.2 Message Validation

```javascript
// Validate incoming WhatsApp messages
function validateWhatsAppMessage(body) {
  const schema = z.object({
    object: z.literal('whatsapp_business_account'),
    entry: z.array(z.object({
      id: z.string(),
      changes: z.array(z.object({
        value: z.object({
          messaging_product: z.literal('whatsapp'),
          metadata: z.object({
            display_phone_number: z.string(),
            phone_number_id: z.string()
          }),
          messages: z.array(z.object({
            from: z.string(),
            id: z.string(),
            timestamp: z.string(),
            type: z.enum(['text', 'image', 'audio', 'video', 'document']),
            text: z.object({
              body: z.string()
            }).optional()
          })).optional()
        }),
        field: z.literal('messages')
      }))
    }))
  });
  
  return schema.safeParse(body);
}
```

### 9.3 Payload Encryption

```javascript
// Decrypt WhatsApp end-to-end encrypted payloads
const crypto = require('crypto');

function decryptPayload(encryptedData, key) {
  const iv = Buffer.from(encryptedData.nonce, 'base64');
  const encrypted = Buffer.from(encryptedData.ciphertext, 'base64');
  const tag = Buffer.from(encryptedData.tag, 'base64');
  
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    Buffer.from(key, 'hex'),
    iv
  );
  decipher.setAuthTag(tag);
  
  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final()
  ]);
  
  return JSON.parse(decrypted.toString());
}
```

---

## 10. Database Security

### 10.1 MongoDB Security

```javascript
// Connection with auth
const mongoOptions = {
  authSource: 'admin',
  auth: {
    username: process.env.MONGO_USER,
    password: process.env.MONGO_PASS
  },
  ssl: true,
  tlsAllowInvalidCertificates: false
};

// Field-level encryption
const encryptionSchema = {
  bsonType: 'object',
  encryptMetadata: {
    keyId: UUID('key-id'),
    algorithm: 'AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic'
  },
  properties: {
    phone: { encrypt: { bsonType: 'string' } },
    email: { encrypt: { bsonType: 'string' } }
  }
};
```

### 10.2 Query Security

```javascript
// Prevent NoSQL injection
function sanitizeQuery(query) {
  // Remove $ operators from user input
  const sanitized = {};
  for (const [key, value] of Object.entries(query)) {
    if (!key.startsWith('$')) {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

// Limit query results
const defaultLimit = 100;
const maxLimit = 1000;

function getSafeLimit(requestedLimit) {
  const limit = Math.min(requestedLimit || defaultLimit, maxLimit);
  return limit;
}
```

### 10.3 Backup Security

```javascript
// Encrypted backups
const backupConfig = {
  encryption: {
    enabled: true,
    algorithm: 'AES-256',
    keyPath: '/secure/backup-key.pem'
  },
  storage: {
    type: 's3',
    bucket: 'backups-bucket',
    serverSideEncryption: 'aws:kms'
  },
  retention: {
    daily: 30,
    weekly: 12,
    monthly: 12
  }
};
```

---

## 11. Logging & Auditing

### 11.1 Security Event Logging

```javascript
const securityEvents = {
  AUTH_SUCCESS: 'AUTH_SUCCESS',
  AUTH_FAILURE: 'AUTH_FAILURE',
  OTP_SENT: 'OTP_SENT',
  OTP_VERIFIED: 'OTP_VERIFIED',
  PASSWORD_CHANGED: 'PASSWORD_CHANGED',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  SUSPICIOUS_ACTIVITY: 'SUSPICIOUS_ACTIVITY',
  DATA_EXPORT: 'DATA_EXPORT',
  USER_DELETED: 'USER_DELETED'
};

function logSecurityEvent(eventType, details) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    eventType,
    userId: details.userId || 'anonymous',
    ip: details.ip,
    userAgent: details.userAgent,
    details: sanitizeLog(details),
    severity: getSeverity(eventType)
  };
  
  // Write to security log
  securityLogger.info(logEntry);
  
  // Alert on critical events
  if (logEntry.severity === 'critical') {
    alertSecurityTeam(logEntry);
  }
}
```

### 11.2 Audit Trail

```javascript
const auditTrail = {
  // Track all data modifications
  create: (collection, document, userId) => ({
    action: 'CREATE',
    collection,
    documentId: document._id,
    userId,
    timestamp: new Date(),
    changes: document
  }),
  
  update: (collection, documentId, changes, userId) => ({
    action: 'UPDATE',
    collection,
    documentId,
    userId,
    timestamp: new Date(),
    changes
  }),
  
  delete: (collection, documentId, userId) => ({
    action: 'DELETE',
    collection,
    documentId,
    userId,
    timestamp: new Date()
  })
};
```

### 11.3 Log Retention

```javascript
const logRetention = {
  security: {
    retention: '1 year',
    storage: 'S3 with encryption'
  },
  application: {
    retention: '30 days',
    storage: 'CloudWatch'
  },
  audit: {
    retention: '7 years',
    storage: 'Glacier'
  }
};
```

---

## 12. Infrastructure Security

### 12.1 Network Security

```javascript
// VPC Configuration
const vpcConfig = {
  cidrBlock: '10.0.0.0/16',
  subnets: [
    { name: 'public', cidr: '10.0.1.0/24', availabilityZone: 'a' },
    { name: 'private', cidr: '10.0.2.0/24', availabilityZone: 'a' },
    { name: 'database', cidr: '10.0.3.0/24', availabilityZone: 'a' }
  ],
  securityGroups: {
    web: {
      inbound: [
        { port: 443, source: '0.0.0.0/0', protocol: 'tcp' }
      ],
      outbound: [
        { port: 80, destination: '0.0.0.0/0', protocol: 'tcp' },
        { port: 443, destination: '0.0.0.0/0', protocol: 'tcp' }
      ]
    },
    database: {
      inbound: [
        { port: 27017, source: 'private-subnet', protocol: 'tcp' }
      ],
      outbound: []
    }
  }
};
```

### 12.2 Container Security

```dockerfile
# Run as non-root
USER node

# Read-only filesystem
RUN chmod -R 555 /app

# Remove unnecessary packages
RUN apk --no-cache add dumb-init && \
    apk --no-cache upgrade && \
    rm -rf /var/cache/apk/*

# Set security flags
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=4096"
```

### 12.3 Kubernetes Security

```yaml
apiVersion: security.k8s.io/v1
kind: PodSecurityPolicy
metadata:
  name: restricted
spec:
  privileged: false
  allowPrivilegeEscalation: false
  requiredDropCapabilities:
    - ALL
  volumes:
    - 'configMap'
    - 'emptyDir'
    - 'projected'
    - 'secret'
  hostNetwork: false
  hostIPC: false
  hostPID: false
  runAsUser:
    rule: 'MustRunAsNonRoot'
```

---

## 13. Incident Response

### 13.1 Incident Severity Levels

| Level | Description | Response Time | Examples |
|-------|-------------|---------------|----------|
| P0 - Critical | System down, data breach | Immediate | DB compromised, API keys leaked |
| P1 - High | Major feature unavailable | 1 hour | Chat not working, leads not generating |
| P2 - Medium | Minor feature degraded | 4 hours | Slow responses, UI bugs |
| P3 - Low | Cosmetic issues | 24 hours | Minor UI glitches |

### 13.2 Response Procedures

```javascript
const incidentResponse = {
  // Detection
  detect: (incident) => ({
    severity: assessSeverity(incident),
    timestamp: new Date(),
    detectionSource: incident.source
  }),
  
  // Containment
  contain: (incident) => ({
    immediate: [
      'Isolate affected systems',
      'Block malicious IPs',
      'Revoke compromised credentials'
    ],
    temporary: [
      'Enable enhanced logging',
      'Activate backup systems',
      'Notify affected users'
    ]
  }),
  
  // Eradication
  eradicate: (incident) => ({
    steps: [
      'Identify root cause',
      'Remove malicious code',
      'Patch vulnerabilities',
      'Update security controls'
    ]
  }),
  
  // Recovery
  recover: (incident) => ({
    steps: [
      'Restore from clean backups',
      'Verify system integrity',
      'Monitor for recurrence',
      'Resume normal operations'
    ]
  }),
  
  // Lessons Learned
  review: (incident) => ({
    steps: [
      'Document incident timeline',
      'Identify gaps in controls',
      'Update security procedures',
      'Train team on new threats'
    ]
  })
};
```

### 13.3 Communication Plan

| Stakeholder | Contact | Timeline |
|-------------|---------|----------|
| Security Team | #security-ops | Immediate |
| Engineering Lead | Engineering Manager | Within 15 min |
| CEO | C-Suite | Within 1 hour |
| Customers | Support Team | Within 2 hours |
| Legal | Legal Counsel | Within 4 hours |
| Regulators | Compliance Officer | Within 24 hours |

---

## 14. Compliance

### 14.1 GDPR Compliance

```javascript
const gdprCompliance = {
  dataProcessing: {
    lawfulBasis: 'consent',
    purposeLimitation: true,
    dataMinimization: true,
    accuracy: true,
    storageLimitation: true,
    integrity: true,
    accountability: true
  },
  
  userRights: {
    rightToAccess: true,
    rightToRectification: true,
    rightToErasure: true,
    rightToPortability: true,
    rightToObject: true,
    rightToRestrictProcessing: true
  },
  
  dataProtectionOfficer: {
    name: 'DPO Name',
    email: 'dpo@company.com'
  }
};
```

### 14.2 CCPA Compliance

```javascript
const ccpaCompliance = {
  noticeAtCollection: true,
  optOut: true,
  doNotSell: true,
  dataMinimization: true,
  purposeLimitation: true,
  storageLimitation: true,
  securityMeasures: true
};
```

### 14.3 SOC 2 Compliance

```javascript
const soc2Controls = {
  security: {
    accessControls: true,
    changeManagement: true,
    incidentResponse: true,
    riskAssessment: true
  },
  availability: {
    backupAndRecovery: true,
    disasterRecovery: true,
    monitoring: true,
    capacityPlanning: true
  },
  processingIntegrity: {
    qualityAssurance: true,
    errorHandling: true,
    dataValidation: true
  },
  confidentiality: {
    encryption: true,
    accessControls: true,
    dataClassification: true
  },
  privacy: {
    notice: true,
    consent: true,
    collection: true,
    use: true,
    disclosure: true
  }
};
```

---

## 15. Security Checklist

### Pre-Launch Security Audit

- [ ] All API endpoints require authentication
- [ ] Input validation on all endpoints
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] Security headers enabled
- [ ] SQL/NoSQL injection prevention
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] File upload validation
- [ ] Error messages don't leak sensitive info
- [ ] Logging doesn't include sensitive data
- [ ] Backup encryption enabled
- [ ] SSL/TLS certificates valid
- [ ] Dependencies scanned for vulnerabilities
- [ ] Container security configured
- [ ] Database access restricted
- [ ] API keys rotated regularly
- [ ] Incident response plan documented
- [ ] Security training completed
- [ ] Penetration testing performed

### Ongoing Security Maintenance

- [ ] Daily security log review
- [ ] Weekly dependency updates
- [ ] Monthly security scans
- [ ] Quarterly penetration testing
- [ ] Annual security audit
- [ ] Continuous monitoring
- [ ] Incident response drills
- [ ] Security awareness training
