import aiService from '../../services/ai/aiService.js';
import KnowledgeBase from '../../models/KnowledgeBase.js';
import leadGenerator from '../../services/leadgen/leadGenerator.js';

export const aiToolDefinitions = [
  {
    name: 'ai_chat',
    description: 'Chat with an AI agent using a configured provider (OpenAI, Gemini, or Groq). Supports multi-turn conversations with optional system context.',
    inputSchema: {
      type: 'object',
      properties: {
        message: { type: 'string', description: 'The user message to send to the AI' },
        provider: { type: 'string', enum: ['openai', 'gemini', 'groq'], description: 'AI provider to use' },
        conversationHistory: {
          type: 'array',
          description: 'Optional conversation history for context',
          items: {
            type: 'object',
            properties: {
              role: { type: 'string', enum: ['system', 'user', 'assistant'] },
              content: { type: 'string' },
            },
            required: ['role', 'content'],
          },
        },
        temperature: { type: 'number', description: 'Temperature (0-1) controlling response randomness', default: 0.7, minimum: 0, maximum: 1 },
        maxTokens: { type: 'number', description: 'Maximum tokens in response', default: 1024 },
      },
      required: ['message'],
    },
  },
  {
    name: 'generate_email',
    description: 'Generate a personalized outreach email for a lead using AI. Produces subject line and email body in the specified tone.',
    inputSchema: {
      type: 'object',
      properties: {
        leadName: { type: 'string', description: 'Name of the lead' },
        leadCompany: { type: 'string', description: 'Lead company name' },
        leadIndustry: { type: 'string', description: 'Lead industry' },
        tone: { type: 'string', enum: ['professional', 'casual', 'friendly', 'formal', 'persuasive'], description: 'Email tone', default: 'professional' },
        productDescription: { type: 'string', description: 'Description of the product or service being offered' },
        businessContext: { type: 'string', description: 'Additional business context for the email' },
      },
      required: ['leadName', 'productDescription'],
    },
  },
  {
    name: 'analyze_lead',
    description: 'Analyze a lead using AI to generate a score (0-100), intent level, summary, recommended actions, and talking points.',
    inputSchema: {
      type: 'object',
      properties: {
        leadData: {
          type: 'object',
          description: 'Lead data to analyze',
          properties: {
            name: { type: 'string' },
            email: { type: 'string' },
            company: { type: 'string' },
            industry: { type: 'string' },
          },
          required: ['name'],
        },
        interactions: {
          type: 'array',
          description: 'History of interactions with the lead',
          items: {
            type: 'object',
            properties: {
              channel: { type: 'string' },
              content: { type: 'string' },
              direction: { type: 'string', enum: ['inbound', 'outbound'] },
              timestamp: { type: 'string' },
            },
          },
        },
      },
      required: ['leadData'],
    },
  },
  {
    name: 'suggest_reply',
    description: 'Suggest a reply for a conversation based on recent messages. Returns a professional, context-aware response.',
    inputSchema: {
      type: 'object',
      properties: {
        conversationMessages: {
          type: 'array',
          description: 'Recent messages in the conversation',
          items: {
            type: 'object',
            properties: {
              role: { type: 'string', enum: ['user', 'agent', 'ai'] },
              content: { type: 'string' },
            },
            required: ['role', 'content'],
          },
        },
        businessContext: { type: 'string', description: 'Business context for generating relevant replies' },
      },
      required: ['conversationMessages'],
    },
  },
  {
    name: 'search_knowledge',
    description: 'Search the business knowledge base using semantic similarity. Returns the most relevant knowledge articles for a query.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query' },
        businessId: { type: 'string', description: 'Business ID whose knowledge base to search' },
        limit: { type: 'number', description: 'Maximum results to return', default: 5, minimum: 1, maximum: 20 },
      },
      required: ['query', 'businessId'],
    },
  },
  {
    name: 'add_knowledge',
    description: 'Add a new article to the business knowledge base. Content is embedded for semantic search.',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Knowledge article title' },
        content: { type: 'string', description: 'Full text content of the article' },
        category: { type: 'string', description: 'Category for organizing knowledge', default: 'general' },
        businessId: { type: 'string', description: 'Business ID to add knowledge to' },
      },
      required: ['title', 'content', 'businessId'],
    },
  },
  {
    name: 'web_search',
    description: 'Search the web for business intelligence using Apify scrapers. Useful for competitor research, market analysis, and prospecting.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query or URL to scrape' },
        platform: { type: 'string', enum: ['google', 'linkedin', 'website'], description: 'Platform to search', default: 'google' },
        location: { type: 'string', description: 'Geographic location for local search' },
        limit: { type: 'number', description: 'Maximum results', default: 10 },
      },
      required: ['query'],
    },
  },
];

export async function handleAiChat(args) {
  const messages = [];

  if (args.conversationHistory?.length) {
    messages.push(...args.conversationHistory.map((m) => ({ role: m.role, content: m.content })));
  }

  messages.push({ role: 'user', content: args.message });

  const response = await aiService.chat(messages, {
    provider: args.provider,
    temperature: args.temperature ?? 0.7,
    maxTokens: args.maxTokens ?? 1024,
  });

  return { reply: response, provider: args.provider || aiService.defaultProvider };
}

export async function handleGenerateEmail(args) {
  const leadData = {
    name: args.leadName,
    company: args.leadCompany || '',
    industry: args.leadIndustry || '',
  };

  const email = await aiService.generateEmail(leadData, args.tone || 'professional', args.businessContext || args.productDescription || '');
  return { email, tone: args.tone || 'professional', leadName: args.leadName };
}

export async function handleAnalyzeLead(args) {
  const analysis = await aiService.analyzeLead(args.leadData, args.interactions || []);
  return { analysis, leadName: args.leadData.name };
}

export async function handleSuggestReply(args) {
  const history = args.conversationMessages.map((m) => ({ role: m.role === 'agent' || m.role === 'ai' ? 'assistant' : 'user', content: m.content }));
  const reply = await aiService.generateSuggestedReply(history, args.businessContext || '');
  return { suggestedReply: reply };
}

export async function handleSearchKnowledge(args) {
  const knowledge = await KnowledgeBase.find({ businessId: args.businessId, isActive: true }).lean();

  if (knowledge.length === 0) {
    return { results: [], message: 'No knowledge base articles found for this business' };
  }

  try {
    const results = await aiService.searchKnowledge(args.query, knowledge);
    return { results: results.slice(0, args.limit || 5).map((r) => ({ title: r.title, content: r.content, category: r.category, similarity: r.similarity })) };
  } catch {
    const queryLower = args.query.toLowerCase();
    const matches = knowledge
      .filter((k) => k.title.toLowerCase().includes(queryLower) || k.content.toLowerCase().includes(queryLower))
      .slice(0, args.limit || 5);
    return { results: matches.map((r) => ({ title: r.title, content: r.content, category: r.category })), fallback: true };
  }
}

export async function handleAddKnowledge(args) {
  let embedding = [];
  try {
    embedding = await aiService.embedText(args.title + ' ' + args.content);
  } catch {}

  const article = await KnowledgeBase.create({
    businessId: args.businessId,
    title: args.title,
    content: args.content,
    category: args.category || 'general',
    embedding,
  });

  return { articleId: article._id.toString(), title: article.title, category: article.category };
}

export async function handleWebSearch(args) {
  const platformMap = { google: 'googleMaps', linkedin: 'linkedin', website: 'website' };
  const platform = platformMap[args.platform] || 'googleMaps';

  const results = await leadGenerator.scrapeBusinesses(args.query, args.location || '', platform);
  return { results: results.slice(0, args.limit || 10), query: args.query, platform: args.platform };
}
