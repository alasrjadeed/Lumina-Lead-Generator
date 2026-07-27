import { chatToolDefinitions } from './tools/chatTools.js';
import { leadToolDefinitions } from './tools/leadTools.js';
import { aiToolDefinitions } from './tools/aiTools.js';
import { whatsappToolDefinitions } from './tools/whatsappTools.js';
import { emailToolDefinitions } from './tools/emailTools.js';
import { businessToolDefinitions } from './tools/businessTools.js';
import { analyticsToolDefinitions } from './tools/analyticsTools.js';

export const allToolDefinitions = [
  ...chatToolDefinitions,
  ...leadToolDefinitions,
  ...aiToolDefinitions,
  ...whatsappToolDefinitions,
  ...emailToolDefinitions,
  ...businessToolDefinitions,
  ...analyticsToolDefinitions,
];

export const toolCategories = {
  chat: chatToolDefinitions,
  leads: leadToolDefinitions,
  ai: aiToolDefinitions,
  whatsapp: whatsappToolDefinitions,
  email: emailToolDefinitions,
  business: businessToolDefinitions,
  analytics: analyticsToolDefinitions,
};

export function getToolNames() {
  return allToolDefinitions.map((t) => t.name);
}

export function getToolDefinition(name) {
  return allToolDefinitions.find((t) => t.name === name) || null;
}

export function getToolsByCategory(category) {
  return toolCategories[category] || [];
}
