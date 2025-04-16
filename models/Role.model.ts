import mongoose, { Schema, Document } from "mongoose";

export interface IPermissionOverwrite {
  id: mongoose.Schema.Types.ObjectId; // Can reference User or Role
  type: 'USER' | 'ROLE';
  allow: string; // Permission bitfield (as string)
  deny: string;  // Permission bitfield (as string)
}

export interface IRole extends Document {
  user: mongoose.Schema.Types.ObjectId;
  name: string;
  server: mongoose.Schema.Types.ObjectId;
  color: string;
  permissions: string; // Bitfield as string
  position: number;
  hoist: boolean; // Whether to display separately in member list
  mentionable: boolean;
  overwrites: IPermissionOverwrite[];
  createdAt: Date;
  updatedAt: Date;
}

const PermissionOverwriteSchema = new Schema({
  id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'overwrites.type'
  },
  type: {
    type: String,
    required: true,
    enum: ['USER', 'ROLE']
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

const RoleSchema: Schema<IRole> = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  server: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Server',
    required: true
  },
  color: {
    type: String,
    default: '#99aab5', // Default Discord-like gray
    validate: {
      validator: (v: string) => /^#([0-9a-f]{3}){1,2}$/i.test(v),
      message: props => `${props.value} is not a valid hex color!`
    }
  },
  permissions: {
    type: String,
    default: '0', // Default no permissions
    required: true
  },
  position: {
    type: Number,
    required: true,
    min: 0
  },
  hoist: {
    type: Boolean,
    default: false
  },
  mentionable: {
    type: Boolean,
    default: false
  },
  overwrites: [PermissionOverwriteSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
RoleSchema.index({ server: 1, position: -1 });
RoleSchema.index({ server: 1, name: 1 }, { unique: true });

// Virtual for formatted permissions
RoleSchema.virtual('permissionsBits').get(function() {
  return BigInt(this.permissions);
});

// Method to check if role has a specific permission
RoleSchema.methods.hasPermission = function(permissionBit: bigint): boolean {
  const rolePerms = BigInt(this.permissions);
  return (rolePerms & permissionBit) === permissionBit;
};

// Method to add permissions to role
RoleSchema.methods.addPermissions = function(permissionBits: bigint) {
  const current = BigInt(this.permissions);
  this.permissions = (current | permissionBits).toString();
  return this;
};

// Method to remove permissions from role
RoleSchema.methods.removePermissions = function(permissionBits: bigint) {
  const current = BigInt(this.permissions);
  this.permissions = (current & ~permissionBits).toString();
  return this;
};

// Pre-save hook to ensure position is unique within server
RoleSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('position')) {
    const existing = await Role.find({ server: this.server, position: this.position });
    if (existing.length > 0) {
      // Increment positions of roles that are >= this role's position
      await Role.updateMany(
        { server: this.server, position: { $gte: this.position } },
        { $inc: { position: 1 } }
      );
    }
  }
  next();
});

const Role = mongoose.models.Role || mongoose.model<IRole>("Role", RoleSchema);
export default Role;