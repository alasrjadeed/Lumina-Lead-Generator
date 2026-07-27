import mongoose from 'mongoose';

const businessSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner is required'],
    },
    name: {
      type: String,
      required: [true, 'Business name is required'],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: null,
    },
    industry: {
      type: String,
      trim: true,
      default: null,
    },
    website: {
      type: String,
      trim: true,
      default: null,
    },
    logo: {
      type: String,
      default: null,
    },
    apiKeys: {
      type: Map,
      of: String,
      default: {},
    },
    settings: {
      aiModel: {
        type: String,
        default: 'gpt-4',
      },
      aiPrompt: {
        type: String,
        maxlength: 5000,
        default: '',
      },
      whatsappEnabled: {
        type: Boolean,
        default: false,
      },
      emailEnabled: {
        type: Boolean,
        default: false,
      },
      voiceEnabled: {
        type: Boolean,
        default: false,
      },
      autoReply: {
        type: Boolean,
        default: false,
      },
      aiEnabled: {
        type: Boolean,
        default: true,
      },
      workingHours: {
        start: {
          type: String,
          default: '09:00',
        },
        end: {
          type: String,
          default: '17:00',
        },
        timezone: {
          type: String,
          default: 'UTC',
        },
      },
    },
    subscription: {
      plan: {
        type: String,
        enum: ['free', 'starter', 'professional', 'enterprise'],
        default: 'free',
      },
      expiresAt: {
        type: Date,
        default: null,
      },
      features: [
        {
          type: String,
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

businessSchema.index({ owner: 1 });

const Business = mongoose.model('Business', businessSchema);

export default Business;
