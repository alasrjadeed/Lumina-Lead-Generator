import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";

class AIService {
  constructor() {
    this.providers = {};
    this._claudeInitialized = false;

    if (process.env.OPENAI_API_KEY) {
      this.providers.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      console.log("[AI] OpenAI available");
    }

    if (process.env.GEMINI_API_KEY) {
      this.providers.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      console.log("[AI] Gemini available");
    }

    if (process.env.GROQ_API_KEY) {
      this.providers.groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      console.log("[AI] Groq available");
    }

    if (process.env.DEEPSEEK_API_KEY) {
      this.providers.deepseek = new OpenAI({
        apiKey: process.env.DEEPSEEK_API_KEY,
        baseURL: "https://api.deepseek.com",
      });
      console.log("[AI] DeepSeek available");
    }

    if (process.env.OPENROUTER_API_KEY) {
      this.providers.openrouter = new OpenAI({
        apiKey: process.env.OPENROUTER_API_KEY,
        baseURL: "https://openrouter.ai/api/v1",
      });
      console.log("[AI] OpenRouter available");
    }

    if (process.env.NVIDIA_NIM_API_KEY) {
      this.providers.nvidia = new OpenAI({
        apiKey: process.env.NVIDIA_NIM_API_KEY,
        baseURL: "https://integrate.api.nvidia.com/v1",
      });
      console.log("[AI] NVIDIA NIM available");
    }

    if (process.env.HUGGING_FACE_API_TOKEN) {
      this.providers.huggingface = new OpenAI({
        apiKey: process.env.HUGGING_FACE_API_TOKEN,
        baseURL: "https://api-inference.huggingface.co/models",
      });
      console.log("[AI] Hugging Face available");
    }

    // Priority: deepseek > openai > groq > openrouter > nvidia > huggingface
    const priority = ["deepseek", "openai", "groq", "openrouter", "nvidia", "huggingface"];
    this.defaultProvider = priority.find((p) => this.providers[p]) || Object.keys(this.providers)[0] || null;
    console.log(`[AI] Default provider: ${this.defaultProvider || "none"}`);
  }

  async _initClaude() {
    if (this._claudeInitialized) return;
    this._claudeInitialized = true;
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const { default: Anthropic } = await import("@anthropic-ai/sdk");
        this.providers.claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
        if (!this.defaultProvider) this.defaultProvider = "claude";
        console.log("[AI] Claude available");
      } catch {
        console.warn("[AI] @anthropic-ai/sdk not installed, Claude unavailable");
      }
    }
  }

  async chat(messages, options = {}) {
    await this._initClaude();

    const {
      provider = this.defaultProvider,
      model,
      temperature = 0.7,
      maxTokens = 1024,
    } = options;

    if (!provider) throw new Error("No AI providers configured. Set at least one API key.");
    if (!this.providers[provider]) {
      throw new Error(`Provider "${provider}" not configured. Available: ${Object.keys(this.providers).join(", ")}`);
    }

    const providers = [provider, ...Object.keys(this.providers).filter((p) => p !== provider)];

    for (const p of providers) {
      if (!this.providers[p]) continue;
      try {
        return await this._routeChat(p, messages, { model, temperature, maxTokens });
      } catch (err) {
        console.error(`[AI] ${p} failed: ${err.message}`);
        if (p === providers[providers.length - 1]) throw err;
      }
    }
  }

  async _routeChat(provider, messages, opts) {
    switch (provider) {
      case "openai":
      case "deepseek":
      case "openrouter":
      case "nvidia":
      case "huggingface":
        return this._openaiCompatibleChat(provider, messages, opts);
      case "gemini":
        return this._geminiChat(messages, opts);
      case "groq":
        return this._groqChat(messages, opts);
      case "claude":
        return this._claudeChat(messages, opts);
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }

  async _openaiCompatibleChat(provider, messages, { model, temperature, maxTokens }) {
    const defaults = {
      openai: "gpt-4o-mini",
      deepseek: "deepseek-chat",
      openrouter: "meta-llama/llama-3.1-70b-instruct",
      nvidia: "meta/llama-3.1-70b-instruct",
      huggingface: "meta-llama/Meta-Llama-3.1-70B-Instruct",
    };
    const response = await this.providers[provider].chat.completions.create({
      model: model || defaults[provider] || "gpt-4o-mini",
      messages,
      temperature,
      max_tokens: maxTokens,
    });
    return response.choices[0].message.content;
  }

  async _geminiChat(messages, { model, temperature, maxTokens }) {
    const genModel = this.providers.gemini.getGenerativeModel({ model: model || "gemini-pro" });
    const contents = messages
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

    const systemMsg = messages.find((m) => m.role === "system");
    const config = { generationConfig: { temperature, maxOutputTokens: maxTokens } };
    if (systemMsg) config.systemInstruction = systemMsg.content;

    const result = await genModel.generateContent({ contents, ...config });
    return result.response.text();
  }

  async _groqChat(messages, { model, temperature, maxTokens }) {
    const response = await this.providers.groq.chat.completions.create({
      model: model || "llama-3.1-70b-versatile",
      messages,
      temperature,
      max_tokens: maxTokens,
    });
    return response.choices[0].message.content;
  }

  async _claudeChat(messages, { model, temperature, maxTokens }) {
    const systemMsg = messages.find((m) => m.role === "system");
    const chatMsgs = messages.filter((m) => m.role !== "system");

    const response = await this.providers.claude.messages.create({
      model: model || "claude-sonnet-4-20250514",
      max_tokens: maxTokens,
      temperature,
      system: systemMsg?.content || "",
      messages: chatMsgs.map((m) => ({ role: m.role, content: m.content })),
    });
    return response.content[0].text;
  }

  async agentChat(messages, businessContext = {}) {
    const {
      businessName = "the business",
      products = "",
      services = "",
      industry = "",
      knowledgeArticles = [],
      faq = "",
      tone = "friendly and professional",
      specialInstructions = "",
    } = businessContext;

    const articleText = knowledgeArticles.length
      ? knowledgeArticles.map((a) => `- ${a.title || "Article"}: ${a.content || a.text || ""}`).join("\n")
      : "No knowledge base articles available.";

    const systemPrompt = `You are an AI assistant for ${businessName}, operating in the ${industry || "general"} industry.

BUSINESS INFORMATION:
- Products: ${products || "Not specified"}
- Services: ${services || "Not specified"}

KNOWLEDGE BASE:
${articleText}

${faq ? `FAQ:\n${faq}\n` : ""}
INSTRUCTIONS:
1. Be ${tone}. Always represent ${businessName} professionally.
2. Answer questions about products, services, pricing, and business hours using the knowledge base.
3. If you don't know something, say so honestly and offer to connect the customer with a human agent.
4. When a customer shows interest in a product or service, naturally gather their lead information:
   - Ask for their name
   - Ask for their email
   - Ask for their phone number
   - Ask about their specific needs or timeline
5. When a customer wants to book or schedule, help them by collecting:
   - Preferred date and time
   - Purpose of the meeting
   - Contact details
6. Handle objections professionally:
   - Acknowledge their concern
   - Provide relevant information or alternatives
   - Offer to schedule a call with a specialist if needed
7. Keep responses concise and conversational (2-3 paragraphs max).
8. Always end with a helpful follow-up question or clear call-to-action.
9. Never make up information not in the knowledge base.
10. Never share internal business details, pricing strategies, or confidential information.

${specialInstructions}`;

    const fullMessages = [
      { role: "system", content: systemPrompt },
      ...messages,
    ];

    return this.chat(fullMessages, { temperature: 0.7, maxTokens: 1024 });
  }

  async generateEmail(leadData, tone = "professional", businessContext = "") {
    const toneInstructions = {
      professional: "Use a formal, polished business tone. Be respectful and authoritative.",
      casual: "Use a relaxed, conversational tone. Be warm and approachable.",
      urgent: "Create a sense of urgency and immediacy. Highlight time-sensitive opportunities.",
      friendly: "Be warm, personable, and genuine. Build rapport before pitching.",
    };

    const systemPrompt = `You are an expert B2B email copywriter. Write a personalized outreach email.

TONE: ${tone}
INSTRUCTIONS: ${toneInstructions[tone] || toneInstructions.professional}

REQUIREMENTS:
- Write a compelling subject line (prefixed with "Subject:")
- Write the email body
- Personalize with the lead's name and company
- Focus on value proposition, not features
- Include a clear call-to-action (meeting, call, demo)
- Keep it under 200 words
- Do NOT use generic filler phrases like "I hope this email finds you well"
- Do NOT use excessive exclamation marks`;

    const prompt = [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `Lead information:\n${JSON.stringify(leadData, null, 2)}\n\nBusiness context:\n${businessContext || "N/A"}\n\nWrite the outreach email:`,
      },
    ];

    return this.chat(prompt, { temperature: 0.8, maxTokens: 512 });
  }

  async generateBulkEmails(leads, template = "", businessContext = "") {
    const results = [];

    for (const lead of leads) {
      try {
        const systemPrompt = `You are an expert email copywriter. Generate a personalized email for each lead.

${template ? `Template to adapt:\n${template}\n\n` : ""}
RULES:
- Personalize each email with the lead's specific details
- Maintain consistent brand voice across all emails
- Each email should feel individually crafted, not mass-produced
- Include a clear call-to-action
- Keep under 200 words per email`;

        const prompt = [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Lead: ${JSON.stringify(lead, null, 2)}\n\nBusiness: ${businessContext || "N/A"}\n\nGenerate the email:`,
          },
        ];

        const email = await this.chat(prompt, { temperature: 0.8, maxTokens: 512 });
        results.push({ lead, email, success: true });
      } catch (err) {
        results.push({ lead, email: null, success: false, error: err.message });
      }
    }

    return results;
  }

  async analyzeLead(leadData, interactionHistory = []) {
    const systemPrompt = `You are a lead scoring analyst for a sales team. Analyze the lead data and interaction history.

RETURN ONLY valid JSON with this exact structure:
{
  "score": <number 0-100>,
  "intent": "<high|medium|low>",
  "summary": "<one sentence summary of the lead>",
  "recommendedAction": "<specific next step>",
  "talkingPoints": ["<point1>", "<point2>", "<point3>"],
  "painPoints": ["<pain1>", "<pain2>"],
  "budgetIndicator": "<unknown|low|medium|high>",
  "timeline": "<immediate|short-term|long-term|unknown>"
}

SCORING CRITERIA:
- 80-100: Ready to buy, actively engaged, clear budget and timeline
- 50-79: Interested, needs nurturing, may have questions
- 20-49: Aware but not committed, early stage
- 0-19: Just browsing or not a fit

Return ONLY the JSON object, no markdown fences, no explanation.`;

    const prompt = [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `Lead data:\n${JSON.stringify(leadData, null, 2)}\n\nInteraction history:\n${JSON.stringify(interactionHistory, null, 2)}\n\nAnalyze this lead:`,
      },
    ];

    const result = await this.chat(prompt, { temperature: 0.3, maxTokens: 512 });

    try {
      const cleaned = result.replace(/```json\n?|\n?```/g, "").trim();
      return JSON.parse(cleaned);
    } catch {
      return {
        score: 50,
        intent: "medium",
        summary: result,
        recommendedAction: "Follow up with the lead to gather more information",
        talkingPoints: [],
        painPoints: [],
        budgetIndicator: "unknown",
        timeline: "unknown",
      };
    }
  }

  async generateSuggestedReply(conversationHistory, businessContext = "") {
    const systemPrompt = `You are a sales conversation assistant. Based on the conversation history, suggest the next reply for the sales agent.

RULES:
- Be professional and helpful
- Address the customer's concerns directly
- Move the conversation toward a concrete next step
- Keep the suggestion concise (2-4 sentences)
- Reference specific details from the conversation
- If the customer seems ready to buy, suggest closing language
- If the customer has objections, suggest a response that acknowledges and addresses them

Return ONLY the suggested reply text, no labels or prefixes.`;

    const conversationText = conversationHistory
      .map((m) => `${m.role === "assistant" ? "Agent" : "Customer"}: ${m.content}`)
      .join("\n");

    const prompt = [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `Business context:\n${businessContext || "N/A"}\n\nConversation:\n${conversationText}\n\nSuggested reply:`,
      },
    ];

    return this.chat(prompt, { temperature: 0.6, maxTokens: 256 });
  }

  async qualifyLead(leadData) {
    const systemPrompt = `You are a lead qualification expert. Based on the lead data, determine if this lead is worth pursuing.

RETURN ONLY valid JSON:
{
  "qualified": <true|false>,
  "score": <number 0-100>,
  "reasoning": "<why qualified or not>",
  "qualifyingQuestions": ["<question1>", "<question2>", "<question3>"],
  "recommendedNextStep": "<specific action>",
  "priority": "<high|medium|low>",
  "category": "<hot lead|warm lead|cold lead|not a fit>"
}

QUALIFICATION CRITERIA:
- Budget: Can they afford the product/service?
- Authority: Are they a decision-maker?
- Need: Do they have a genuine need?
- Timeline: Are they ready to act within a reasonable timeframe?

Return ONLY the JSON, no markdown fences.`;

    const prompt = [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `Lead data:\n${JSON.stringify(leadData, null, 2)}\n\nQualify this lead:`,
      },
    ];

    const result = await this.chat(prompt, { temperature: 0.3, maxTokens: 512 });

    try {
      const cleaned = result.replace(/```json\n?|\n?```/g, "").trim();
      return JSON.parse(cleaned);
    } catch {
      return {
        qualified: true,
        score: 50,
        reasoning: result,
        qualifyingQuestions: ["What is your budget range?", "When are you looking to make a decision?", "Who else is involved in this decision?"],
        recommendedNextStep: "Schedule a discovery call",
        priority: "medium",
        category: "warm lead",
      };
    }
  }

  async embedText(text) {
    if (!this.providers.openai) {
      throw new Error("OpenAI provider is required for embeddings");
    }
    const response = await this.providers.openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });
    return response.data[0].embedding;
  }

  async searchKnowledge(query, knowledgeBase) {
    const queryEmbedding = await this.embedText(query);
    const scored = knowledgeBase.map((item) => ({
      ...item,
      similarity: this._cosineSimilarity(queryEmbedding, item.embedding),
    }));
    scored.sort((a, b) => b.similarity - a.similarity);
    return scored.slice(0, 5);
  }

  _cosineSimilarity(a, b) {
    let dot = 0, magA = 0, magB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      magA += a[i] * a[i];
      magB += b[i] * b[i];
    }
    return dot / (Math.sqrt(magA) * Math.sqrt(magB));
  }
}

export default new AIService();
