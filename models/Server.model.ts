import mongoose, { Schema, Document } from "mongoose";

export interface IMember {
  user: mongoose.Schema.Types.ObjectId;
  roles: mongoose.Schema.Types.ObjectId[];
  nickname?: string;
  joinedAt: Date;
}

export interface IInvite {
  code: string;
  creator: mongoose.Schema.Types.ObjectId;
  uses: number;
  maxUses: number;
  expiresAt?: Date;
}

export interface ICategory {
  name: string;
  position: number;
  channels: mongoose.Schema.Types.ObjectId[];
}

export interface IServerSettings {
  defaultPermissions: string;
  verificationLevel: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
  isPrivate: boolean;
}

export interface IServer extends Document {
  name: string;
  imageUrl: string;
  owner: mongoose.Schema.Types.ObjectId;
  members: IMember[];
  roles: mongoose.Schema.Types.ObjectId[];
  channels: mongoose.Schema.Types.ObjectId[];
  categories: ICategory[];
  invites: IInvite[];
  settings: IServerSettings;
  template: 'GAMING' | 'EDUCATION' | 'COMMUNITY' | 'CUSTOM';
  createdAt: Date;
  updatedAt: Date;
}

const MemberSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  roles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role'
  }],
  nickname: String,
  joinedAt: {
    type: Date,
    default: Date.now
  }
});

const InviteSchema = new Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    sparse: true // Add sparse index to allow multiple null values
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  uses: {
    type: Number,
    default: 0
  },
  maxUses: {
    type: Number,
    default: 0 // 0 means unlimited
  },
  expiresAt: Date
});

const CategorySchema = new Schema({
  name: { 
    type: String,
    required: true
  },
  position: {
    type: Number,
    default: 0
  },
  channels: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Channel'
  }]
});

const ServerSettingsSchema = new Schema({
  defaultPermissions: {
    type: String,
    default: '0' // Default permissions as a bit field
  },
  verificationLevel: {
    type: String,
    enum: ['NONE', 'LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH'],
    default: 'NONE'
  },
  isPrivate: {
    type: Boolean,
    default: false
  }
});

const ServerSchema: Schema<IServer> = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [MemberSchema],
  roles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role'
  }],
  channels: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Channel'
  }],
  categories: [CategorySchema],
  invites: {
    type: [InviteSchema],
    default: [] // Change to empty array default instead of undefined
  },
  settings: {
    type: ServerSettingsSchema,
    default: {}
  },
  template: {
    type: String,
    enum: ['GAMING', 'EDUCATION', 'COMMUNITY', 'CUSTOM'],
    default: 'CUSTOM'
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
  timestamps: true // This will automatically update the updatedAt field
});

// Create indexes for better performance
ServerSchema.index({ name: 1 });
ServerSchema.index({ owner: 1 });
ServerSchema.index({ "members.user": 1 });

// Virtual for getting member count
ServerSchema.virtual('memberCount').get(function() {
  return this.members.length;
});

// Method to check if a user is a member
ServerSchema.methods.isMember = function(userId: mongoose.Schema.Types.ObjectId): boolean {
  return this.members.some((member: IMember) => member.user.toString() === userId.toString());
};

// Method to check if a user is the owner
ServerSchema.methods.isOwner = function(userId: mongoose.Schema.Types.ObjectId): boolean {
  return this.owner.toString() === userId.toString();
};

// Method to add a new member
ServerSchema.methods.addMember = function(userId: mongoose.Schema.Types.ObjectId) {
  if (!this.isMember(userId)) {
    this.members.push({
      user: userId,
      roles: [],
      joinedAt: new Date()
    });
  }
  return this;
};

const Server = mongoose.models.Server || mongoose.model<IServer>("Server", ServerSchema);
export default Server;