import whatsappClient from '../../services/whatsapp/whatsappClient.js';

export const whatsappToolDefinitions = [
  {
    name: 'whatsapp_send_text',
    description: 'Send a text message via WhatsApp to a phone number. Requires WhatsApp client to be connected.',
    inputSchema: {
      type: 'object',
      properties: {
        phone: { type: 'string', description: 'Phone number with country code (e.g., +1234567890)' },
        message: { type: 'string', description: 'Text message to send' },
      },
      required: ['phone', 'message'],
    },
  },
  {
    name: 'whatsapp_send_media',
    description: 'Send a media file (image, video, document) via WhatsApp with an optional caption.',
    inputSchema: {
      type: 'object',
      properties: {
        phone: { type: 'string', description: 'Phone number with country code' },
        mediaUrl: { type: 'string', description: 'URL of the media file to send' },
        caption: { type: 'string', description: 'Optional caption for the media', default: '' },
      },
      required: ['phone', 'mediaUrl'],
    },
  },
  {
    name: 'whatsapp_get_status',
    description: 'Get the current WhatsApp connection status including connection state and device info.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'whatsapp_get_conversations',
    description: 'Get recent WhatsApp conversations and messages from the connected device.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Maximum number of conversations to retrieve', default: 20, minimum: 1, maximum: 100 },
      },
    },
  },
];

export async function handleWhatsappSendText(args) {
  const result = await whatsappClient.sendMessage(args.phone, args.message);
  return { success: true, phone: args.phone, messageId: result.id?.id || null, timestamp: result.timestamp };
}

export async function handleWhatsappSendMedia(args) {
  const result = await whatsappClient.sendMedia(args.phone, args.mediaUrl, args.caption || '');
  return { success: true, phone: args.phone, messageId: result.id?.id || null, timestamp: result.timestamp };
}

export async function handleWhatsappGetStatus() {
  const status = whatsappClient.getStatus();
  return { status: status.status, info: status.info };
}

export async function handleWhatsappGetConversations(args) {
  if (whatsappClient.status !== 'connected') {
    throw new Error('WhatsApp client is not connected');
  }

  const chats = await whatsappClient.client.getChats();
  const conversations = chats.slice(0, args.limit || 20).map((chat) => ({
    id: chat.id._serialized,
    name: chat.name,
    isGroup: chat.isGroup,
    unreadCount: chat.unreadCount,
    lastMessage: chat.lastMessage ? { body: chat.lastMessage.body, from: chat.lastMessage.from, timestamp: chat.lastMessage.timestamp } : null,
    timestamp: chat.timestamp,
  }));

  return { conversations, count: conversations.length };
}
