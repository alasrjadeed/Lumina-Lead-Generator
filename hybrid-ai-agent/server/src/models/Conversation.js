import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    type: {
      type: String,
      enum: ['direct', 'group', 'ai-support', 'whatsapp'],
      default: 'direct',
    },
    name: {
      type: String,
      trim: true,
      default: null,
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      default: null,
    },
    unreadCount: {
      type: Map,
      of: Number,
      default: {},
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
    channel: {
      type: String,
      enum: ['web', 'whatsapp', 'email', 'linkedin'],
      default: 'web',
    },
    assignedAgent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    status: {
      type: String,
      enum: ['active', 'closed', 'pending'],
      default: 'active',
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      default: null,
    },
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      default: null,
    },
    source: {
      type: String,
      default: null,
    },
    visitorInfo: {
      name: { type: String, default: null },
      email: { type: String, default: null },
      phone: { type: String, default: null },
    },
  },
  {
    timestamps: true,
  }
);

conversationSchema.index({ participants: 1 });
conversationSchema.index({ business: 1 });
conversationSchema.index({ assignedAgent: 1 });
conversationSchema.index({ status: 1 });

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;
