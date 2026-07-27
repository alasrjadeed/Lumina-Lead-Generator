import Business from '../models/Business.js';
import KnowledgeBase from '../models/KnowledgeBase.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import Lead from '../models/Lead.js';

export const resourceDefinitions = [
  {
    uri: 'business://{businessId}/profile',
    name: 'Business Profile',
    description: 'Complete business profile information including settings, subscription, and configured channels.',
    mimeType: 'application/json',
  },
  {
    uri: 'business://{businessId}/knowledge',
    name: 'Knowledge Base',
    description: 'All knowledge base articles for the business used by AI for answering questions.',
    mimeType: 'application/json',
  },
  {
    uri: 'conversation://{conversationId}/messages',
    name: 'Conversation Messages',
    description: 'Full message history for a conversation including sender info and timestamps.',
    mimeType: 'application/json',
  },
  {
    uri: 'lead://{leadId}/profile',
    name: 'Lead Profile',
    description: 'Detailed lead profile including contact info, interactions, notes, and scoring data.',
    mimeType: 'application/json',
  },
];

export function parseResourceUri(uri) {
  const businessProfileMatch = uri.match(/^business:\/\/([^/]+)\/profile$/);
  if (businessProfileMatch) return { type: 'business_profile', businessId: businessProfileMatch[1] };

  const businessKnowledgeMatch = uri.match(/^business:\/\/([^/]+)\/knowledge$/);
  if (businessKnowledgeMatch) return { type: 'business_knowledge', businessId: businessKnowledgeMatch[1] };

  const conversationMatch = uri.match(/^conversation:\/\/([^/]+)\/messages$/);
  if (conversationMatch) return { type: 'conversation_messages', conversationId: conversationMatch[1] };

  const leadMatch = uri.match(/^lead:\/\/([^/]+)\/profile$/);
  if (leadMatch) return { type: 'lead_profile', leadId: leadMatch[1] };

  return null;
}

export async function readResource(uri) {
  const parsed = parseResourceUri(uri);
  if (!parsed) throw new Error(`Unknown resource URI: ${uri}`);

  switch (parsed.type) {
    case 'business_profile': {
      const business = await Business.findById(parsed.businessId)
        .select('-apiKeys')
        .populate('owner', 'name email')
        .lean();
      if (!business) throw new Error('Business not found');
      return { contents: [{ uri, mimeType: 'application/json', text: JSON.stringify(business, null, 2) }] };
    }

    case 'business_knowledge': {
      const articles = await KnowledgeBase.find({ businessId: parsed.businessId, isActive: true })
        .select('-embedding')
        .sort({ createdAt: -1 })
        .lean();
      return { contents: [{ uri, mimeType: 'application/json', text: JSON.stringify(articles, null, 2) }] };
    }

    case 'conversation_messages': {
      const messages = await Message.find({ conversation: parsed.conversationId, isDeleted: false })
        .sort({ createdAt: 1 })
        .populate('sender', 'name email avatar')
        .lean();
      const conversation = await Conversation.findById(parsed.conversationId)
        .populate('participants', 'name email')
        .lean();
      return { contents: [{ uri, mimeType: 'application/json', text: JSON.stringify({ conversation, messages }, null, 2) }] };
    }

    case 'lead_profile': {
      const lead = await Lead.findById(parsed.leadId)
        .populate('assignedAgent', 'name email')
        .lean();
      if (!lead) throw new Error('Lead not found');
      return { contents: [{ uri, mimeType: 'application/json', text: JSON.stringify(lead, null, 2) }] };
    }

    default:
      throw new Error(`Unknown resource type: ${parsed.type}`);
  }
}

export function listResources() {
  return resourceDefinitions;
}
