import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

// Define an interface for the User model
export interface IUser extends Document {
  username: string;
  email: string;
  password?: string; // Make password optional for OAuth users
  googleId?: string; // Add Google ID field
  avatar: Buffer | string; // Allow string URLs for avatar
  isActive: boolean;
  servers: mongoose.Schema.Types.ObjectId;
  friends: mongoose.Schema.Types.ObjectId;
  friendRequests: mongoose.Schema.Types.ObjectId;
  friendRequestsSent: mongoose.Schema.Types.ObjectId;
}

// Create the User schema
const UserSchema: Schema<IUser> = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: false // Make password optional for OAuth users
  },
  googleId: { // Add Google ID field
    type: String,
    sparse: true // Allow undefined but enforce uniqueness when present
  },
  avatar: {
    type: Schema.Types.Mixed, // Allow both Buffer and String
  },
  isActive: {
    type: Boolean,
    default: false
  },
  servers: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Server'
  },
  friends: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  friendRequests: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  friendRequestsSent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

// Password hashing middleware
UserSchema.pre('save', async function (next) {
  try {
    // Only hash the password if it has been modified or is new
    if (!this.isModified('password') || !this.password) {
      return next();
    }
    
    console.log("Hashing password for user:", this.username);
    console.log("Original password:", this.password);
    
    // Generate salt using rounds=8 for consistency with existing passwords
    const salt = await bcrypt.genSalt(8);
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(this.password, salt);
    console.log("Hashed password:", hashedPassword);
    
    // Set the hashed password
    this.password = hashedPassword;
    
    next();
  } catch (error) {
    console.error("Error hashing password:", error);
    next(error instanceof Error ? error : new Error('Password hashing failed'));
  }
});

// Add a method to the schema for password comparison
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    if (!this.password) return false;
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    console.error("Error comparing passwords:", error);
    return false;
  }
};

// Create and export the User model
const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
export default User;