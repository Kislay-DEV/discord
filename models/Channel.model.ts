import mongoose, { Schema, Document } from "mongoose";

export interface IMessage {
  author: mongoose.Schema.Types.ObjectId;
  content: string;
  attachments: string[];
  embeds: any[];
  mentions: mongoose.Schema.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  isPinned: boolean;
  reactions: {
    emoji: string;
    users: mongoose.Schema.Types.ObjectId[];
  }[];
}

export interface IChannelPermissionOverride {
  id: mongoose.Schema.Types.ObjectId;
  type: 'role' | 'member';
  allow: string;
  deny: string;
}

export interface IChannel extends Document {
  name: string;
  server: mongoose.Schema.Types.ObjectId;
  type: 'TEXT' | 'VOICE' | 'ANNOUNCEMENT' | 'FORUM' | 'THREAD';
  topic?: string;
  position: number;
  isNSFW: boolean;
  parentId?: mongoose.Schema.Types.ObjectId;
  permissionOverrides: IChannelPermissionOverride[];
  slowMode: number; // Seconds between messages
  lastMessageAt?: Date;
  messages?: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  attachments: [{
    type: String
  }],
  embeds: [{
    type: Schema.Types.Mixed
  }],
  mentions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isPinned: {
    type: Boolean,
    default: false
  },
  reactions: [{
    emoji: String,
    users: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const PermissionOverrideSchema = new Schema({
  id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  type: {
    type: String,
    enum: ['role', 'member'],
    required: true
  },
  allow: {
    type: String,
    default: '0'
  },
  deny: {
    type: String,
    default: '0'
  }
});

const ChannelSchema: Schema<IChannel> = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  server: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Server',
    required: true
  },
  type: {
    type: String,
    enum: ['TEXT', 'AUDIO', 'VIDEO', 'FORUM', 'THREAD'],
    default: 'TEXT'
  },
  topic: {
    type: String,
    trim: true,
    maxlength: 1024
  },
  position: {
    type: Number,
    default: 0
  },
  isNSFW: {
    type: Boolean,
    default: false
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Channel'
  },
  permissionOverrides: [PermissionOverrideSchema],
  slowMode: {
    type: Number,
    default: 0
  },
  lastMessageAt: {
    type: Date
  },
  messages: {
    type: [MessageSchema],
    select: false // Don't return messages by default for performance
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create indexes for better performance
ChannelSchema.index({ server: 1, name: 1 });
ChannelSchema.index({ parentId: 1 });
ChannelSchema.index({ server: 1, position: 1 });

// Virtual for getting message count
ChannelSchema.virtual('messageCount').get(function() {
  return this.messages ? this.messages.length : 0;
});

// Method to add a new message
ChannelSchema.methods.addMessage = function(message: IMessage) {
  if (!this.messages) {
    this.messages = [];
  }
  this.messages.push(message);
  this.lastMessageAt = new Date();
  return this;
};

// Method to check permissions for a user
ChannelSchema.methods.checkPermissions = function(userId: mongoose.Schema.Types.ObjectId, userRoles: mongoose.Schema.Types.ObjectId[]) {
  // Implementation would check server permissions and then apply channel overrides
  // This is just a skeleton - actual implementation would be more complex
  const memberOverrides = this.permissionOverrides.find(
    (override: IChannelPermissionOverride) => 
      override.type === 'member' && override.id.toString() === userId.toString()
  );
  
  if (memberOverrides) {
    // Member specific overrides take precedence
    return {
      allow: memberOverrides.allow,
      deny: memberOverrides.deny
    };
  }
  
  // Apply role overrides
  // In a real implementation, you'd combine permissions from multiple roles
  
  return {
    allow: '0',
    deny: '0'
  };
};

const Channel = mongoose.models.Channel || mongoose.model<IChannel>("Channel", ChannelSchema);
export default Channel;