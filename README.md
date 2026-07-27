# Lumina Lead Generator

> Open-source Laravel lead generation system with AI enrichment, multi-platform scraping, bulk email, and WhatsApp outreach.

**Author:** AL ASAR JADEED
**Web:** [infoalasarjadeed.com](https://infoalasarjadeed.com)
**Email:** [info@infoalasarjadeed.com](mailto:info@infoalasarjadeed.com)

## Quick Start

```bash
# Login
http://localhost:8000/login

# Credentials
Email:    info@alasarjadeed.com
Password: Aroojaamir@1
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | PHP 8.3 / Laravel 9.52 |
| Database | SQLite (`database/database.sqlite`) |
| Frontend | Blade + Bootstrap 5 + jQuery |
| Web Server | `php -S 0.0.0.0:8000 -t public` |
| Email | Namecheap Private Email SMTP (SSL, port 465) |
| Scraping | Apify actors (multi-token fallback) |
| AI | Cloudflare, DeepSeek, OpenAI, OpenRouter, GROQ, Gemini, NVIDIA, Mistral, Z.AI (all with multi-key fallback) |

## Architecture

```
├── app/
│   ├── Http/Controllers/Admin/
│   │   ├── LeadGenController.php    # Main controller (~1460 lines)
│   │   └── SettingsController.php   # Settings CRUD
│   ├── Http/Controllers/Auth/
│   │   └── AuthController.php       # Login/logout
│   ├── Models/
│   │   ├── SeoLead.php              # Lead model (39 cols)
│   │   ├── SeoLeadCategory.php      # Categories (18 cols)
│   │   ├── SeoLeadOutreach.php      # Outreach log
│   │   ├── WhatsAppImportHistory.php
│   │   └── Setting.php
│   ├── Services/
│   │   ├── ApifyLeadService.php     # Multi-token Apify scraping
│   │   ├── AiKeyManager.php         # Multi-key AI fallback (9 providers)
│   │   ├── AiContentService.php
│   │   ├── WhatsAppCloudService.php
│   │   ├── LuminaAIService.php
│   │   └── LeadAutomationService.php
│   ├── Mail/
│   │   ├── LeadOutreachMail.php
│   │   └── SimpleEmail.php
│   └── Providers/
│       ├── RouteServiceProvider.php
│       └── MailServiceProvider.php
├── resources/views/admin/
│   ├── layout.blade.php            # Theme system (dark/light), sidebar
│   ├── lead-gen/
│   │   ├── dashboard.blade.php
│   │   ├── leads.blade.php
│   │   ├── categories.blade.php
│   │   ├── lead-form.blade.php
│   │   └── whatsapp-imports.blade.php
│   └── settings/
│       └── index.blade.php
├── routes/web.php                   # 53 routes
├── scripts/
│   └── generate_background.php      # Background lead generation
└── database/
    └── database.sqlite
```

## Features

### Lead Generation
- **Multi-platform scraping**: Google Maps, Google Reviews, Google Search, Instagram, Facebook, TikTok, YouTube, Twitter, E-commerce, vCard import
- **Apify integration**: Multi-token fallback (Token 1 + Token 2), auto-rotates on rate limit/quota
- **Background generation**: Long-running jobs via `exec()` with status polling
- **Quick generate**: Single-platform instant scraping
- **Bulk generate**: Multi-platform parallel scraping

### AI Enrichment
- **9 AI providers** with multi-key fallback: Cloudflare → DeepSeek → OpenAI → OpenRouter → GROQ → Gemini → NVIDIA → Mistral → Z.AI
- **Auto-rotation**: Exhausted keys skipped, rotates through available keys
- **Lead scoring**: AI-powered classification (provider/customer/unknown) and scoring (0-100)

### Email Outreach
- **Bulk email**: Send to all leads or selected leads
- **Custom email**: Send to any email address
- **Templates**: Introduction, Follow Up, Partnership Proposal
- **Placeholders**: `{contact_person}`, `{business_name}`, `{email}`, `{phone}`, `{website}`, `{address}`, `{city}`, `{country}`, `{lead_type}`, `{lead_score}`, `{source}`
- **SMTP**: Namecheap Private Email (SSL, port 465)

### WhatsApp
- **Bulk WhatsApp**: Send to all leads or selected leads
- **Group import**: Import members from WhatsApp groups
- **AI draft generation**: Generate WhatsApp messages with AI

### Admin Panel
- **Dashboard**: Stats, charts, platform breakdown
- **Leads table**: Sortable, filterable, bulk actions (status update, delete, export)
- **Categories**: Organize leads by custom categories with toggle enable/disable
- **Settings**: All API keys, SMTP config, platform settings
- **Theme**: Dark/light mode with localStorage persistence
- **Responsive**: Mobile hamburger menu, collapsible sidebar

## Database Tables

| Table | Description |
|-------|-------------|
| `seo_leads` | 39 columns — main lead data |
| `seo_lead_categories` | 18 columns — category management |
| `seo_lead_outreach` | Email/WhatsApp send log |
| `whatsapp_import_histories` | Import audit trail |
| `settings` | Key-value config (58 API keys seeded) |
| `users` | Admin users |
| `jobs` / `failed_jobs` | Queue tables |

## API Keys (58 seeded)

| Provider | Keys |
|----------|------|
| Apify | 2 tokens (fallback) |
| Cloudflare AI | Multiple keys |
| OpenAI | Multiple keys |
| OpenRouter | Multiple keys |
| DeepSeek | Multiple keys |
| GROQ | Multiple keys |
| Gemini | Multiple keys |
| NVIDIA | Multiple keys |
| Mistral | Multiple keys |
| Z.AI | Multiple keys |
| SerpAPI | 1 key |
| WhatsApp Cloud API | Token + Phone ID + Business ID |
| WHAPI | Token |
| 9Route | Token |
| ElevenLabs | API key |
| Facebook Business | Token |
| Blogger | API key |
| Google Business | API key |
| HuggingFace | Token |
| ComfyUI | URL + API key |
| RunningHub | API key |
| Render | API key |

## Known Bugs

See `BUG_REPORT.md` for full details. Key issues:

| # | Severity | Issue |
|---|----------|-------|
| 1 | Critical | Category toggle URL segments swapped |
| 2 | Critical | Edit category form wrong URL + wrong HTTP method |
| 3 | Critical | Bulk delete categories hits non-existent route |
| 4 | Critical | Lead form update sends POST instead of PUT |
| 5 | Critical | Logout link sends GET but route requires POST |
| 6 | Critical | `copyToWhatsapp()` scoped inside closure |
| 7 | Low | Dashboard broken HTML tag `<div="mb-3">` |

## Running

```bash
# Start server
php -S 0.0.0.0:8000 -t public public/index.php

# Login
open http://localhost:8000/login
```

## Cron Jobs

```
*/5 * * * * codebase-memory-mcp cli index_repository .../Lmina\ myai mode=fast
```
