import { z } from 'zod';

const participantIds = z.array(z.string()).describe('Array of user IDs to include in the conversation');
const conversationType = z.enum(['direct', 'group', 'ai-support', 'whatsapp']).default('direct').describe('Conversation type');
const conversationName = z.string().optional().describe('Optional conversation name (for group chats)');
const channel = z.enum(['web', 'whatsapp', 'email', 'linkedin']).default('web').describe('Channel source');

const conversationId = z.string().describe('ID of the conversation');
const senderId = z.string().describe('ID of the user sending the message');
const content = z.string().describe('Message content text');
const messageType = z.enum(['text', 'image', 'file', 'voice', 'video', 'system']).default('text').describe('Message type');
const mediaUrl = z.string().optional().describe('URL of media attachment');
const userId = z.string().describe('User ID');
const limit = z.number().min(1).max(200).default(50).describe('Maximum number of items');
const before = z.string().optional().describe('ID to get items before (for pagination)');
const page = z.number().min(1).default(1).describe('Page number');
const query = z.string().describe('Search query');
const agentId = z.string().describe('ID of the agent');

const leadName = z.string().describe('Lead contact name');
const leadEmail = z.string().optional().describe('Lead email address');
const leadPhone = z.string().optional().describe('Lead phone number');
const company = z.string().optional().describe('Lead company name');
const leadWebsite = z.string().optional().describe('Lead website URL');
const leadAddress = z.string().optional().describe('Lead address');
const physicalAddress = z.string().optional().describe('Full physical address');
const googleMapsUrl = z.string().optional().describe('Google Maps URL');
const leadCity = z.string().optional().describe('Lead city');
const country = z.string().optional().describe('Lead country');
const leadSource = z.enum(['website', 'manual', 'scraping', 'api', 'email', 'google_maps', 'google_business', 'linkedin', 'instagram', 'facebook', 'classifieds']).default('manual').describe('Lead source channel');
const tags = z.array(z.string()).optional().describe('Tags for categorizing the lead');
const businessId = z.string().describe('Business ID');
const leadId = z.string().describe('Lead ID');
const status = z.enum(['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost']).optional().describe('Filter by status');
const minScore = z.number().optional().describe('Minimum lead score (0-100)');
const maxScore = z.number().optional().describe('Maximum lead score (0-100)');
const assignedAgent = z.string().optional().describe('Filter by assigned agent ID');
const filterCountry = z.string().optional().describe('Filter by country');
const filterCity = z.string().optional().describe('Filter by city');
const updates = z.record(z.any()).describe('Fields to update');
const noteContent = z.string().describe('Note content');
const interactionChannel = z.string().describe('Interaction channel (email, phone, meeting, chat, etc.)');
const interactionContent = z.string().optional().describe('Interaction description or summary');
const direction = z.enum(['inbound', 'outbound']).describe('Direction of the interaction');
const leads = z.array(z.record(z.any())).describe('Array of lead objects to import');
const source = z.string().describe('Platform to scrape leads from (googleMaps, linkedin, instagram, facebook, dubizzle, openSooq, etc.)');
const scrapeQuery = z.string().describe('Search query or business type to find');
const location = z.string().optional().describe('Geographic location for search');
const scrapeCountry = z.string().default('bahrain').describe('Country key for country-specific classifieds');
const dateFrom = z.string().optional().describe('Start date (ISO format)');
const dateTo = z.string().optional().describe('End date (ISO format)');
const searchQuery = z.string().describe('Search query (searches across name, email, phone, website, address, company, city, country)');

const message = z.string().describe('The user message to send to the AI');
const provider = z.enum(['openai', 'gemini', 'groq']).optional().describe('AI provider to use');
const conversationHistory = z.array(z.object({ role: z.enum(['system', 'user', 'assistant']), content: z.string() })).optional().describe('Conversation history');
const temperature = z.number().min(0).max(1).default(0.7).describe('Temperature');
const maxTokens = z.number().default(1024).describe('Maximum tokens');
const leadCompanyName = z.string().optional().describe('Lead company name');
const leadIndustry = z.string().optional().describe('Lead industry');
const tone = z.enum(['professional', 'casual', 'friendly', 'formal', 'persuasive']).default('professional').describe('Email tone');
const productDescription = z.string().describe('Description of the product or service');
const businessContext = z.string().optional().describe('Additional business context');
const leadData = z.record(z.any()).describe('Lead data to analyze');
const interactions = z.array(z.record(z.any())).optional().describe('History of interactions');
const conversationMessages = z.array(z.object({ role: z.enum(['user', 'agent', 'ai']), content: z.string() })).describe('Recent messages');
const kbQuery = z.string().describe('Search query');
const kbLimit = z.number().min(1).max(20).default(5).describe('Maximum results');
const title = z.string().describe('Knowledge article title');
const kbContent = z.string().describe('Full text content');
const category = z.string().default('general').describe('Category');
const webQuery = z.string().describe('Search query or URL');
const webPlatform = z.enum(['google', 'linkedin', 'website']).default('google').describe('Platform');
const webLocation = z.string().optional().describe('Geographic location');
const webLimit = z.number().default(10).describe('Maximum results');

const phone = z.string().describe('Phone number with country code');
const whatsappMessage = z.string().describe('Text message to send');
const whatsappMediaUrl = z.string().describe('URL of the media file');
const caption = z.string().default('').describe('Optional caption');
const whatsappLimit = z.number().min(1).max(100).default(20).describe('Maximum conversations');

const to = z.string().describe('Recipient email address');
const subject = z.string().describe('Email subject line');
const html = z.string().optional().describe('HTML email body');
const text = z.string().optional().describe('Plain text body');
const email = z.string().describe('Email address');
const purpose = z.string().default('verification').describe('Purpose of verification');
const recipients = z.array(z.object({ name: z.string().optional(), email: z.string() })).describe('Recipient objects');
const template = z.object({ html: z.string(), text: z.string().optional() }).describe('Email template');
const outreachLeadId = z.string().describe('Lead ID');
const outreachTone = z.enum(['professional', 'casual', 'friendly', 'formal', 'persuasive']).default('professional').describe('Email tone');

const settings = z.record(z.any()).describe('Settings to update');
const config = z.record(z.any()).describe('Configuration to update');

const dateRange = z.object({ from: z.string().optional(), to: z.string().optional() }).optional().describe('Date range');
const groupBy = z.enum(['day', 'week', 'month']).default('day').describe('Time grouping');

export const toolSchemas = {
  create_conversation: { participantIds, type: conversationType, name: conversationName, channel },
  send_message: { conversationId, senderId, content, type: messageType, mediaUrl },
  get_messages: { conversationId, limit, before },
  list_conversations: { userId, status, channel, page, limit },
  search_users: { query, limit },
  mark_read: { conversationId, userId },
  assign_agent: { conversationId, agentId },

  get_countries: {},
  get_country_platforms: { country: scrapeCountry },
  create_lead: { name: leadName, email: leadEmail, phone: leadPhone, company, website: leadWebsite, address: leadAddress, physicalAddress, googleMapsUrl, city: leadCity, country, source: leadSource, tags, businessId },
  get_leads: { businessId, status, source: leadSource, country: filterCountry, city: filterCity, minScore, maxScore, assignedAgent, page, limit },
  search_leads: { query: searchQuery, businessId, status, source: leadSource, country: filterCountry, city: filterCity, minScore, maxScore, page, limit },
  get_lead: { leadId },
  update_lead: { leadId, updates },
  add_lead_note: { leadId, content: noteContent, userId },
  log_lead_interaction: { leadId, channel: interactionChannel, content: interactionContent, direction },
  assign_lead: { leadId, agentId },
  import_leads: { businessId, leads },
  generate_leads: { source, query: scrapeQuery, location, country: scrapeCountry, businessId, limit },
  get_lead_stats: { businessId, dateFrom, dateTo },

  ai_chat: { message, provider, conversationHistory, temperature, maxTokens },
  generate_email: { leadName, leadCompany: leadCompanyName, leadIndustry, tone, productDescription, businessContext },
  analyze_lead: { leadData, interactions },
  suggest_reply: { conversationMessages, businessContext },
  search_knowledge: { query: kbQuery, businessId, limit: kbLimit },
  add_knowledge: { title, content: kbContent, category, businessId },
  web_search: { query: webQuery, platform: webPlatform, location: webLocation, limit: webLimit },

  whatsapp_send_text: { phone, message: whatsappMessage },
  whatsapp_send_media: { phone, mediaUrl: whatsappMediaUrl, caption },
  whatsapp_get_status: {},
  whatsapp_get_conversations: { limit: whatsappLimit },

  send_email: { to, subject, html, text },
  send_otp_email: { email, purpose },
  send_bulk_email: { recipients, subject, template },
  generate_outreach_email: { leadId: outreachLeadId, businessContext, tone: outreachTone },

  get_business: { businessId },
  update_business: { businessId, settings },
  get_widget_config: { businessId },
  update_widget_config: { businessId, config },

  get_dashboard_stats: { businessId, dateRange },
  get_lead_analytics: { businessId, dateFrom, dateTo, groupBy },
  get_chat_analytics: { businessId, dateFrom, dateTo },
  get_conversion_funnel: { businessId, dateFrom, dateTo },
};
