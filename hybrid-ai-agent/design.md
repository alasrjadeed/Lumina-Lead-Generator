# Design Document
## Hybrid AI Agent & Real-Time Chat Platform

**Version:** 1.0.0  
**Date:** July 2026

---

## 1. Design Philosophy

### 1.1 Core Principles

1. **User-Centric:** Every design decision prioritizes user experience
2. **Consistency:** Unified design language across all components
3. **Accessibility:** WCAG 2.1 AA compliance
4. **Performance:** Optimized for speed and responsiveness
5. **Scalability:** Design supports growth without major rewrites

### 1.2 Design System

| Element | Value |
|---------|-------|
| Primary Color | #6366f1 (Indigo) |
| Secondary Color | #10b981 (Emerald) |
| Accent Color | #f59e0b (Amber) |
| Font Family | Inter (Primary), JetBrains Mono (Code) |
| Border Radius | 8px (default), 12px (cards) |
| Shadows | Subtle, layered shadows |
| Spacing | 4px base unit |

---

## 2. UI Components

### 2.1 Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│                        Header                               │
├─────────┬───────────────────────────────────────────────────┤
│         │                                                   │
│  Side   │                   Main Content                    │
│  bar    │                                                   │
│         │                                                   │
│  ┌───┐  │  ┌─────────────────────────────────────────────┐ │
│  │   │  │  │                                             │ │
│  │   │  │  │                                             │ │
│  └───┘  │  └─────────────────────────────────────────────┘ │
│         │                                                   │
├─────────┴───────────────────────────────────────────────────┤
│                        Footer                               │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Sidebar Navigation

```
┌─────────────┐
│  🏠 Home    │
│  💬 Chat    │
│  👥 Leads   │
│  📊 Analytics│
│  ⚙️ Settings│
│  ─────────  │
│  👤 Profile │
│  🚪 Logout  │
└─────────────┘
```

### 2.3 Card Components

```
┌─────────────────────────────────────┐
│  Lead Card                          │
├─────────────────────────────────────┤
│  ┌─────┐  John Smith               │
│  │ 📷  │  Acme Corporation         │
│  └─────┘  Score: 85/100            │
│           Status: Qualified         │
│           Source: LinkedIn          │
│           ─────────────────         │
│           [View] [Contact] [More]  │
└─────────────────────────────────────┘
```

---

## 3. Page Designs

### 3.1 Login Page

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│         ┌─────────────────────────────────┐                │
│         │        🔐 Login                 │                │
│         │                                 │                │
│         │  Email: [________________]      │                │
│         │                                 │                │
│         │  Password: [________________]   │                │
│         │                                 │                │
│         │  [  Login  ]                    │                │
│         │                                 │                │
│         │  ─────── or ───────             │                │
│         │                                 │                │
│         │  [Send OTP Instead]             │                │
│         │                                 │                │
│         │  Don't have account? [Sign Up]  │                │
│         └─────────────────────────────────┘                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Chat Interface

```
┌─────────────────────────────────────────────────────────────┐
│  Conversations  │  Chat: John Smith                │
├─────────────────┤───────────────────────────────────────────┤
│                 │                                           │
│  ┌───────────┐  │  ┌─────────────────────────────────────┐ │
│  │ John S. ● │  │  │  Hey, I'm interested in your       │ │
│  │ Last msg  │  │  │  services...                        │ │
│  └───────────┘  │  └─────────────────────────────────────┘ │
│                 │                                           │
│  ┌───────────┐  │  ┌─────────────────────────────────────┐ │
│  │ Jane D.   │  │  │  Thank you for your interest!       │ │
│  │ Last msg  │  │  │  Let me help you...                 │ │
│  └───────────┘  │  └─────────────────────────────────────┘ │
│                 │                                           │
│  ┌───────────┐  │  ┌─────────────────────────────────────┐ │
│  │ AI Bot ●  │  │  │  🤖 AI suggested response:         │ │
│  │ Last msg  │  │  │  "I'd be happy to help..."          │ │
│  └───────────┘  │  └─────────────────────────────────────┘ │
│                 │                                           │
│  Search: [____]│  ┌─────────────────────────────────────┐ │
│                 │  │ [📎] [Type message...     ] [Send]  │ │
│                 │  └─────────────────────────────────────┘ │
│                 │                                           │
└─────────────────┴───────────────────────────────────────────┘
```

### 3.3 Lead Management

```
┌─────────────────────────────────────────────────────────────┐
│  Lead Management                    [+ Generate Leads]      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Filters: [Status ▼] [Source ▼] [Score ▼] [Search...]     │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Name      │ Email         │ Source   │ Score │ Status│   │
│  ├───────────┼───────────────┼──────────┼───────┼───────┤   │
│  │ John Smith│ john@acme.com │ LinkedIn │ 85    │ New   │   │
│  │ Jane Doe  │ jane@xyz.com  │ Google   │ 72    │ New   │   │
│  │ Bob Wilson│ bob@test.com  │ Dubizzle │ 91    │ Qual  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Pagination: [1] [2] [3] ... [10] [Next]                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 3.4 Lead Generation Modal

```
┌─────────────────────────────────────────────────────────────┐
│  Generate Leads                                   [X]       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Search Query: [restaurants in Bahrain         ]            │
│                                                             │
│  Location: [Bahrain                          ]              │
│                                                             │
│  Platform:                                                   │
│  ○ Google Maps    ○ Google Business   ● LinkedIn            │
│  ○ Instagram      ○ Facebook          ○ Dubizzle            │
│  ○ OpenSooq       ○ GDN Classifieds   ○ Reddit             │
│  ○ Custom Website                                              │
│                                                             │
│  Max Results: [50]                                           │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Preview: This will search for "restaurants in      │   │
│  │  Bahrain" on LinkedIn and generate up to 50 leads.  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [Cancel]                                    [Generate]     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Responsive Design

### 4.1 Breakpoints

| Breakpoint | Width | Description |
|------------|-------|-------------|
| Mobile | < 640px | Single column, bottom navigation |
| Tablet | 640-1024px | Collapsible sidebar |
| Desktop | > 1024px | Full sidebar, multi-column |
| Large | > 1280px | Expanded layouts |

### 4.2 Mobile Adaptations

```
Desktop (1024px+)          Mobile (< 640px)
┌────┬──────────┐         ┌──────────────┐
│Nav │ Content  │    →    │    Header    │
│    │          │         │──────────────│
│    │          │         │   Content    │
│    │          │         │              │
└────┴──────────┘         │──────────────│
                          │  Bottom Nav  │
                          └──────────────┘
```

---

## 5. Theme System

### 5.1 Color Themes (30+)

```javascript
const themes = {
  // Light Themes
  'default': { primary: '#6366f1', background: '#ffffff' },
  'ocean': { primary: '#0ea5e9', background: '#f0f9ff' },
  'forest': { primary: '#10b981', background: '#ecfdf5' },
  'sunset': { primary: '#f59e0b', background: '#fffbeb' },
  'rose': { primary: '#f43f5e', background: '#fff1f2' },
  
  // Dark Themes
  'dark': { primary: '#818cf8', background: '#1e1b4b' },
  'midnight': { primary: '#3b82f6', background: '#0f172a' },
  'charcoal': { primary: '#64748b', background: '#1e293b' },
  
  // Brand Themes
  'whatsapp': { primary: '#25D366', background: '#e9fcef' },
  'telegram': { primary: '#0088cc', background: '#e6f4ff' },
  'slack': { primary: '#4a154b', background: '#f8f0f8' },
};
```

### 5.2 Theme Switcher UI

```
┌─────────────────────────────────────┐
│  Theme Settings                     │
├─────────────────────────────────────┤
│                                     │
│  Light Themes:                      │
│  [🔵] [🟢] [🟡] [🔴] [🟣]         │
│                                     │
│  Dark Themes:                       │
│  [⚫] [🔵] [⚫]                     │
│                                     │
│  Brand Themes:                      │
│  [💬] [✈️] [💼]                     │
│                                     │
│  Custom Theme:                      │
│  Primary: [____]  Background: [____]│
│                                     │
└─────────────────────────────────────┘
```

---

## 6. Widget Design

### 6.1 Widget States

```
Collapsed State          Expanded State
┌─────┐                 ┌───────────────┐
│ 💬  │          →      │  Chat with us │
└─────┘                 │───────────────│
                        │ [Messages]    │
                        │ [Input]       │
                        └───────────────┘
```

### 6.2 Widget Customization

```javascript
const widgetConfig = {
  // Position
  position: 'bottom-right', // bottom-left, bottom-right, top-left, top-right
  
  // Theme
  theme: 'light', // dark, custom
  
  // Colors
  primaryColor: '#6366f1',
  backgroundColor: '#ffffff',
  textColor: '#1f2937',
  
  // Branding
  logo: 'https://example.com/logo.png',
  title: 'Chat with us',
  subtitle: 'We typically reply in minutes',
  
  // Features
  showOfflineMessage: true,
  showAgentAvatar: true,
  showTypingIndicator: true,
  allowFileUpload: true,
  allowEmoji: true,
};
```

---

## 7. Animation & Transitions

### 7.1 Micro-Interactions

```css
/* Button hover */
.button {
  transition: all 0.2s ease;
}
.button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Message appear */
.message-enter {
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Typing indicator */
.typing-dot {
  animation: typingBounce 1.4s infinite ease-in-out;
}
.typing-dot:nth-child(1) { animation-delay: 0s; }
.typing-dot:nth-child(2) { animation-delay: 0.2s; }
.typing-dot:nth-child(3) { animation-delay: 0.4s; }
```

### 7.2 Page Transitions

```css
/* Fade transition */
.page-enter {
  opacity: 0;
}
.page-enter-active {
  opacity: 1;
  transition: opacity 300ms ease;
}
.page-exit {
  opacity: 1;
}
.page-exit-active {
  opacity: 0;
  transition: opacity 300ms ease;
}
```

---

## 8. Accessibility

### 8.1 WCAG 2.1 AA Compliance

- **Color Contrast:** Minimum 4.5:1 ratio
- **Keyboard Navigation:** Full keyboard support
- **Screen Reader:** ARIA labels on all interactive elements
- **Focus Indicators:** Visible focus states
- **Alt Text:** All images have descriptive alt text

### 8.2 Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + K` | Quick search |
| `Ctrl + N` | New conversation |
| `Ctrl + /` | Show shortcuts |
| `Esc` | Close modal |
| `Enter` | Send message |

---

## 9. Loading States

### 9.1 Skeleton Screens

```
┌─────────────────────────────────────┐
│  ┌─────┐  ░░░░░░░░░░░░░░░░░░░░░░  │
│  │ ░░░ │  ░░░░░░░░░░               │
│  └─────┘  ░░░░░░░░░░░░░░░░░░░░░░  │
│                                     │
│  ┌─────┐  ░░░░░░░░░░░░░░░░░░░░░░  │
│  │ ░░░ │  ░░░░░░░░░░               │
│  └─────┘  ░░░░░░░░░░░░░░░░░░░░░░  │
│                                     │
│  ┌─────┐  ░░░░░░░░░░░░░░░░░░░░░░  │
│  │ ░░░ │  ░░░░░░░░░░               │
│  └─────┘  ░░░░░░░░░░░░░░░░░░░░░░  │
└─────────────────────────────────────┘
```

### 9.2 Spinners

```css
.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #6366f1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
```

---

## 10. Iconography

### 10.1 Icon Library

Using Lucide React icons:

```javascript
import { 
  MessageSquare, 
  Users, 
  BarChart3, 
  Settings,
  Search,
  Plus,
  Edit,
  Trash,
  Send,
  Paperclip,
  Smile
} from 'lucide-react';
```

### 10.2 Icon Sizes

| Size | Pixels | Usage |
|------|--------|-------|
| xs | 12px | Badges, inline |
| sm | 16px | Buttons, navigation |
| md | 20px | Default |
| lg | 24px | Headers |
| xl | 32px | Feature icons |

---

## 11. Typography

### 11.1 Type Scale

```css
/* Display */
.text-display { font-size: 48px; line-height: 1.2; }

/* Heading 1 */
.text-h1 { font-size: 32px; line-height: 1.3; }

/* Heading 2 */
.text-h2 { font-size: 24px; line-height: 1.4; }

/* Heading 3 */
.text-h3 { font-size: 20px; line-height: 1.4; }

/* Body Large */
.text-lg { font-size: 18px; line-height: 1.5; }

/* Body */
.text-base { font-size: 16px; line-height: 1.5; }

/* Body Small */
.text-sm { font-size: 14px; line-height: 1.5; }

/* Caption */
.text-xs { font-size: 12px; line-height: 1.5; }
```

---

## 12. Dark Mode

### 12.1 Color Mapping

```javascript
const darkMode = {
  // Background
  bgPrimary: '#0f172a',
  bgSecondary: '#1e293b',
  bgTertiary: '#334155',
  
  // Text
  textPrimary: '#f8fafc',
  textSecondary: '#94a3b8',
  textTertiary: '#64748b',
  
  // Border
  borderPrimary: '#334155',
  borderSecondary: '#475569',
  
  // Interactive
  interactiveDefault: '#6366f1',
  interactiveHover: '#818cf8',
  interactiveActive: '#4f46e5',
};
```

---

## 13. Export & Sharing

### 13.1 Export Formats

| Format | Use Case |
|--------|----------|
| CSV | Lead data export |
| Excel | Detailed reports |
| PDF | Formal documents |
| JSON | API integration |

### 13.2 Share Options

```
┌─────────────────────────────────────┐
│  Share Lead                         │
├─────────────────────────────────────┤
│                                     │
│  [📧 Email]  [💬 WhatsApp]  [🔗 Copy]│
│                                     │
│  Or share via:                      │
│  [Facebook] [Twitter] [LinkedIn]    │
│                                     │
└─────────────────────────────────────┘
```

---

## 14. Notification System

### 14.1 Toast Notifications

```css
/* Success */
.toast-success {
  background: #10b981;
  icon: ✓;
}

/* Error */
.toast-error {
  background: #ef4444;
  icon: ✗;
}

/* Warning */
.toast-warning {
  background: #f59e0b;
  icon: ⚠;
}

/* Info */
.toast-info {
  background: #3b82f6;
  icon: ℹ;
}
```

### 14.2 Notification Positions

| Position | Usage |
|----------|-------|
| Top-right | Default (desktop) |
| Top-center | Important alerts |
| Bottom-center | Mobile devices |
| Bottom-right | Persistent notifications |

---

## 15. Performance Optimization

### 15.1 Image Optimization

- Lazy loading for all images
- WebP format support
- Responsive image sizing
- CDN delivery via Cloudinary

### 15.2 Code Splitting

```javascript
// Route-based splitting
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Chat = lazy(() => import('./pages/Chat'));
const Leads = lazy(() => import('./pages/Leads'));

// Component-based splitting
const LeadModal = lazy(() => import('./components/LeadModal'));
const Analytics = lazy(() => import('./components/Analytics'));
```

### 15.3 Caching Strategy

```
Static Assets:    1 year (immutable)
API Responses:    5 minutes
User Data:        1 hour
Chat Messages:    Real-time (no cache)
```
