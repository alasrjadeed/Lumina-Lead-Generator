import Conversation from '../../models/Conversation.js';
import Message from '../../models/Message.js';
import User from '../../models/User.js';

export const chatToolDefinitions = [
  {
    name: 'create_conversation',
    description: 'Create a new conversation between users. Supports direct, group, ai-support, and whatsapp conversation types.',
    inputSchema: {
      type: 'object',
      properties: {
        participantIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of user IDs to include in the conversation',
        },
        type: {
          type: 'string',
          enum: ['direct', 'group', 'ai-support', 'whatsapp'],
          description: 'Conversation type',
          default: 'direct',
        },
        name: {
          type: 'string',
          description: 'Optional conversation name (for group chats)',
        },
        channel: {
          type: 'string',
          enum: ['web', 'whatsapp', 'email', 'linkedin'],
          description: 'Channel source of the conversation',
          default: 'web',
        },
      },
      required: ['participantIds'],
    },
  },
  {
    name: 'send_message',
    description: 'Send a message to an existing conversation. Supports text, image, file, voice, video, and system message types.',
    inputSchema: {
      type: 'object',
      properties: {
        conversationId: {
          type: 'string',
          description: 'ID of the conversation to send the message to',
        },
        senderId: {
          type: 'string',
          description: 'ID of the user sending the message',
        },
        content: {
          type: 'string',
          description: 'Message content text',
        },
        type: {
          type: 'string',
          enum: ['text', 'image', 'file', 'voice', 'video', 'system'],
          description: 'Message type',
          default: 'text',
        },
        mediaUrl: {
          type: 'string',
          description: 'URL of media attachment (for image/file/voice/video types)',
        },
      },
      required: ['conversationId', 'senderId', 'content'],
    },
  },
  {
    name: 'get_messages',
    description: 'Retrieve messages from a conversation with pagination. Returns messages in chronological order.',
    inputSchema: {
      type: 'object',
      properties: {
        conversationId: {
          type: 'string',
          description: 'ID of the conversation to get messages from',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of messages to return',
          default: 50,
          minimum: 1,
          maximum: 200,
        },
        before: {
          type: 'string',
          description: 'Message ID to get messages before (for pagination)',
        },
      },
      required: ['conversationId'],
    },
  },
  {
    name: 'list_conversations',
    description: 'List conversations with optional filters. Supports filtering by user, status, and channel.',
    inputSchema: {
      type: 'object',
      properties: {
        userId: {
          type: 'string',
          description: 'Filter conversations that include this user as a participant',
        },
        status: {
          type: 'string',
          enum: ['active', 'closed', 'pending'],
          description: 'Filter by conversation status',
        },
        channel: {
          type: 'string',
          enum: ['web', 'whatsapp', 'email', 'linkedin'],
          description: 'Filter by channel',
        },
        page: {
          type: 'number',
          description: 'Page number for pagination',
          default: 1,
          minimum: 1,
        },
        limit: {
          type: 'number',
          description: 'Number of conversations per page',
          default: 20,
          minimum: 1,
          maximum: 100,
        },
      },
    },
  },
  {
    name: 'search_users',
    description: 'Search for users by name or email. Returns matching user profiles.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query matching against user name or email',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results',
          default: 10,
          minimum: 1,
          maximum: 50,
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'mark_read',
    description: 'Mark all messages in a conversation as read by a specific user.',
    inputSchema: {
      type: 'object',
      properties: {
        conversationId: {
          type: 'string',
          description: 'ID of the conversation to mark as read',
        },
        userId: {
          type: 'string',
          description: 'ID of the user who read the messages',
        },
      },
      required: ['conversationId', 'userId'],
    },
  },
  {
    name: 'assign_agent',
    description: 'Assign a support agent to a conversation for handling customer interactions.',
    inputSchema: {
      type: 'object',
      properties: {
        conversationId: {
          type: 'string',
          description: 'ID of the conversation to assign',
        },
        agentId: {
          type: 'string',
          description: 'ID of the agent to assign to the conversation',
        },
      },
      required: ['conversationId', 'agentId'],
    },
  },
];

export async function handleCreateConversation(args) {
  const conversation = await Conversation.create({
    participants: args.participantIds,
    type: args.type || 'direct',
    name: args.name || null,
    channel: args.channel || 'web',
  });
  return { conversationId: conversation._id.toString(), type: conversation.type, status: conversation.status };
}

export async function handleSendMessage(args) {
  const message = await Message.create({
    conversation: args.conversationId,
    sender: args.senderId,
    content: args.content,
    type: args.type || 'text',
    mediaUrl: args.mediaUrl || null,
  });

  await Conversation.findByIdAndUpdate(args.conversationId, {
    lastMessage: message._id,
    $inc: { [`unreadCount.${args.senderId}`]: 1 },
  });

  return { messageId: message._id.toString(), conversationId: args.conversationId, createdAt: message.createdAt };
}

export async function handleGetMessages(args) {
  const query = { conversation: args.conversationId, isDeleted: false };
  if (args.before) {
    query.createdAt = { $lt: (await Message.findById(args.before))?.createdAt || new Date() };
  }

  const messages = await Message.find(query)
    .sort({ createdAt: -1 })
    .limit(args.limit || 50)
    .populate('sender', 'name email avatar')
    .lean();

  return { messages: messages.reverse(), count: messages.length };
}

export async function handleListConversations(args) {
  const query = {};
  if (args.userId) query.participants = args.userId;
  if (args.status) query.status = args.status;
  if (args.channel) query.channel = args.channel;

  const page = args.page || 1;
  const limit = args.limit || 20;
  const skip = (page - 1) * limit;

  const [conversations, total] = await Promise.all([
    Conversation.find(query)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('participants', 'name email avatar')
      .populate('lastMessage')
      .populate('assignedAgent', 'name email')
      .lean(),
    Conversation.countDocuments(query),
  ]);

  return { conversations, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function handleSearchUsers(args) {
  const regex = new RegExp(args.query, 'i');
  const users = await User.find({
    $or: [{ name: regex }, { email: regex }],
    status: 'active',
  })
    .select('name email avatar role')
    .limit(args.limit || 10)
    .lean();

  return { users, count: users.length };
}

export async function handleMarkRead(args) {
  await Message.updateMany(
    { conversation: args.conversationId, 'readBy.user': { $ne: args.userId } },
    { $push: { readBy: { user: args.userId, readAt: new Date() } } }
  );

  await Conversation.findByIdAndUpdate(args.conversationId, {
    $set: { [`unreadCount.${args.userId}`]: 0 },
  });

  return { success: true, conversationId: args.conversationId };
}

export async function handleAssignAgent(args) {
  const conversation = await Conversation.findByIdAndUpdate(
    args.conversationId,
    { assignedAgent: args.agentId },
    { new: true }
  ).populate('assignedAgent', 'name email');

  if (!conversation) throw new Error('Conversation not found');
  return { conversationId: conversation._id.toString(), assignedAgent: conversation.assignedAgent };
}
