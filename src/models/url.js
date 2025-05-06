import mongoose from 'mongoose';

const clickSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
  },
  country: {
    type: String,
    default: 'Unknown',
  },
  countryCode: {
    type: String,
    default: null,
  },
  city: {
    type: String,
    default: null,
  },
  region: {
    type: String,
    default: null,
  },
  latitude: {
    type: Number,
    default: null,
  },
  longitude: {
    type: Number,
    default: null,
  },
  ip: {
    type: String,
    default: 'Unknown',
  },
  userAgent: {
    type: String,
    default: 'Unknown',
  },
});

const urlSchema = new mongoose.Schema(
  {
    originalUrl: {
      type: String,
      required: true,
    },
    shortId: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: String,
      default: null,
    },
    isTemporary: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: '',
    },
    clicks: [clickSchema],
    clickCount: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(+new Date() + 365 * 24 * 60 * 60 * 1000), // Default 1 year expiry
    },
  },
  {
    timestamps: true,
  }
);

// Increment click count when a new click is added
urlSchema.pre('save', function (next) {
  if (this.isModified('clicks')) {
    this.clickCount = this.clicks.length;
  }
  next();
});

// Create the model only if it doesn't exist
export default mongoose.models.Url || mongoose.model('Url', urlSchema); 