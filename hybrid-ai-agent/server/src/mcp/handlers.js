import {
  handleCreateConversation,
  handleSendMessage,
  handleGetMessages,
  handleListConversations,
  handleSearchUsers,
  handleMarkRead,
  handleAssignAgent,
} from './tools/chatTools.js';

import {
  handleGetCountries,
  handleGetCountryPlatforms,
  handleCreateLead,
  handleGetLeads,
  handleSearchLeads,
  handleGetLead,
  handleUpdateLead,
  handleAddLeadNote,
  handleLogLeadInteraction,
  handleAssignLead,
  handleImportLeads,
  handleGenerateLeads,
  handleGetLeadStats,
} from './tools/leadTools.js';

import {
  handleAiChat,
  handleGenerateEmail,
  handleAnalyzeLead,
  handleSuggestReply,
  handleSearchKnowledge,
  handleAddKnowledge,
  handleWebSearch,
} from './tools/aiTools.js';

import {
  handleWhatsappSendText,
  handleWhatsappSendMedia,
  handleWhatsappGetStatus,
  handleWhatsappGetConversations,
} from './tools/whatsappTools.js';

import {
  handleSendEmail,
  handleSendOtpEmail,
  handleSendBulkEmail,
  handleGenerateOutreachEmail,
} from './tools/emailTools.js';

import {
  handleGetBusiness,
  handleUpdateBusiness,
  handleGetWidgetConfig,
  handleUpdateWidgetConfig,
} from './tools/businessTools.js';

import {
  handleGetDashboardStats,
  handleGetLeadAnalytics,
  handleGetChatAnalytics,
  handleGetConversionFunnel,
} from './tools/analyticsTools.js';

const handlers = {
  create_conversation: handleCreateConversation,
  send_message: handleSendMessage,
  get_messages: handleGetMessages,
  list_conversations: handleListConversations,
  search_users: handleSearchUsers,
  mark_read: handleMarkRead,
  assign_agent: handleAssignAgent,

  get_countries: handleGetCountries,
  get_country_platforms: handleGetCountryPlatforms,
  create_lead: handleCreateLead,
  get_leads: handleGetLeads,
  search_leads: handleSearchLeads,
  get_lead: handleGetLead,
  update_lead: handleUpdateLead,
  add_lead_note: handleAddLeadNote,
  log_lead_interaction: handleLogLeadInteraction,
  assign_lead: handleAssignLead,
  import_leads: handleImportLeads,
  generate_leads: handleGenerateLeads,
  get_lead_stats: handleGetLeadStats,

  ai_chat: handleAiChat,
  generate_email: handleGenerateEmail,
  analyze_lead: handleAnalyzeLead,
  suggest_reply: handleSuggestReply,
  search_knowledge: handleSearchKnowledge,
  add_knowledge: handleAddKnowledge,
  web_search: handleWebSearch,

  whatsapp_send_text: handleWhatsappSendText,
  whatsapp_send_media: handleWhatsappSendMedia,
  whatsapp_get_status: handleWhatsappGetStatus,
  whatsapp_get_conversations: handleWhatsappGetConversations,

  send_email: handleSendEmail,
  send_otp_email: handleSendOtpEmail,
  send_bulk_email: handleSendBulkEmail,
  generate_outreach_email: handleGenerateOutreachEmail,

  get_business: handleGetBusiness,
  update_business: handleUpdateBusiness,
  get_widget_config: handleGetWidgetConfig,
  update_widget_config: handleUpdateWidgetConfig,

  get_dashboard_stats: handleGetDashboardStats,
  get_lead_analytics: handleGetLeadAnalytics,
  get_chat_analytics: handleGetChatAnalytics,
  get_conversion_funnel: handleGetConversionFunnel,
};

export function getToolHandler(toolName) {
  return handlers[toolName] || null;
}

export function hasToolHandler(toolName) {
  return toolName in handlers;
}

export async function executeTool(toolName, args) {
  const handler = handlers[toolName];
  if (!handler) {
    throw new Error(`Unknown tool: ${toolName}`);
  }
  return handler(args);
}
