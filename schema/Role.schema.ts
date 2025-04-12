import { z } from "zod";
import { Types } from "mongoose";

// Helper function to validate MongoDB ObjectId strings
const isValidObjectId = (value: string) => {
  return Types.ObjectId.isValid(value);
};

// Custom ObjectId validator
const objectIdSchema = z.string().refine(isValidObjectId, {
  message: "Invalid ObjectId format"
});

// Hex color validation regex
const hexColorRegex = /^#([0-9a-f]{3}){1,2}$/i;

// Permission Overwrite Schema
const permissionOverwriteSchema = z.object({
  id: objectIdSchema,
  type: z.enum(["USER", "ROLE"]),
  allow: z.string().default("0"),
  deny: z.string().default("0")
});

// Role Schema
export const roleSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  server: objectIdSchema,
  color: z.string()
    .regex(hexColorRegex, { message: "Invalid hex color format" })
    .default("#99aab5"),
  permissions: z.string().default("0"),
  position: z.number().int().nonnegative(),
  hoist: z.boolean().default(false),
  mentionable: z.boolean().default(false),
  overwrites: z.array(permissionOverwriteSchema).default([]),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});

// Create Role Input Schema (for API endpoints)
export const createRoleSchema = roleSchema.omit({
  createdAt: true,
  updatedAt: true
});

// Update Role Input Schema
export const updateRoleSchema = roleSchema.partial().omit({
  createdAt: true,
  updatedAt: true,
  server: true
});

// Role with ID schema (for responses)
export const roleWithIdSchema = roleSchema.extend({
  _id: objectIdSchema
});

// Type definitions
export type Role = z.infer<typeof roleSchema>;
export type CreateRole = z.infer<typeof createRoleSchema>;
export type UpdateRole = z.infer<typeof updateRoleSchema>;
export type RoleWithId = z.infer<typeof roleWithIdSchema>;

// Optional: Permission constants for use with the role schema
export const Permissions = {
  // General permissions
  ADMINISTRATOR: BigInt("8"),
  VIEW_CHANNELS: BigInt("1024"),
  MANAGE_CHANNELS: BigInt("16"),
  MANAGE_ROLES: BigInt("268435456"),
  MANAGE_SERVER: BigInt("32"),
  
  // Member permissions
  KICK_MEMBERS: BigInt("2"),
  BAN_MEMBERS: BigInt("4"),
  TIMEOUT_MEMBERS: BigInt("1099511627776"),
  
  // Message permissions
  SEND_MESSAGES: BigInt("2048"),
  EMBED_LINKS: BigInt("16384"),
  ATTACH_FILES: BigInt("32768"),
  READ_MESSAGE_HISTORY: BigInt("65536"),
  MENTION_EVERYONE: BigInt("131072"),
  USE_EXTERNAL_EMOJIS: BigInt("262144"),
  MANAGE_MESSAGES: BigInt("8192"),
  
  // Voice permissions
  CONNECT: BigInt("1048576"),
  SPEAK: BigInt("2097152"),
  STREAM: BigInt("512"),
  MUTE_MEMBERS: BigInt("4194304"),
  DEAFEN_MEMBERS: BigInt("8388608"),
  MOVE_MEMBERS: BigInt("16777216"),
  PRIORITY_SPEAKER: BigInt("256")
};

// Helper function to convert permission bits to string for storage
export const permissionsToString = (permissionBits: bigint): string => {
  return permissionBits.toString();
};

// Helper function to check if a permission string includes a specific permission
export const hasPermission = (permissionString: string, permission: bigint): boolean => {
  try {
    const permissionBits = BigInt(permissionString);
    return (permissionBits & permission) === permission;
  } catch {
    return false;
  }
};

// Helper function to add permissions
export const addPermissions = (permissionString: string, ...permissions: bigint[]): string => {
  try {
    let permissionBits = BigInt(permissionString);
    for (const permission of permissions) {
      permissionBits |= permission;
    }
    return permissionBits.toString();
  } catch {
    return "0";
  }
};

// Helper function to remove permissions
export const removePermissions = (permissionString: string, ...permissions: bigint[]): string => {
  try {
    let permissionBits = BigInt(permissionString);
    for (const permission of permissions) {
      permissionBits &= ~permission;
    }
    return permissionBits.toString();
  } catch {
    return "0";
  }
};