import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Lead name is required'],
      trim: true,
      maxlength: 200,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: null,
    },
    phone: {
      type: String,
      trim: true,
      default: null,
    },
    company: {
      type: String,
      trim: true,
      default: null,
    },
    source: {
      type: String,
      enum: [
        'website',
        'manual',
        'scraping',
        'api',
        'email',
        'widget',
        'google_maps',
        'google_business',
        'linkedin',
        'instagram',
        'facebook',
        'classifieds',
      ],
      default: 'manual',
    },
    status: {
      type: String,
      enum: ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'],
      default: 'new',
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    notes: [
      {
        content: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
        by: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      },
    ],
    interactions: [
      {
        channel: {
          type: String,
          required: true,
        },
        content: {
          type: String,
          default: '',
        },
        direction: {
          type: String,
          enum: ['inbound', 'outbound'],
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    assignedAgent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: [true, 'Business ID is required'],
    },
    lastContactedAt: {
      type: Date,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

leadSchema.index({ businessId: 1 });
leadSchema.index({ businessId: 1, isDeleted: 1 });
leadSchema.index({ assignedAgent: 1 });
leadSchema.index({ status: 1 });
leadSchema.index({ email: 1, businessId: 1 }, { unique: true, partialFilterExpression: { email: { $ne: null } } });

const Lead = mongoose.model('Lead', leadSchema);

export default Lead;
