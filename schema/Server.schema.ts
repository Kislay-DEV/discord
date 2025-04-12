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

// Member Schema
const memberSchema = z.object({
  user: objectIdSchema,
  roles: z.array(objectIdSchema).default([]),
  nickname: z.string().optional(),
  joinedAt: z.date().default(() => new Date())
});

// Invite Schema
const inviteSchema = z.object({
  code: z.string().min(1),
  creator: objectIdSchema,
  uses: z.number().nonnegative().default(0),
  maxUses: z.number().nonnegative().default(0),
  expiresAt: z.date().optional()
});

// Category Schema
const categorySchema = z.object({
  name: z.string().min(1).max(100),
  position: z.number().nonnegative().default(0),
  channels: z.array(objectIdSchema).default([])
});

// Server Settings Schema
const serverSettingsSchema = z.object({
  defaultPermissions: z.string().default("0"),
  verificationLevel: z.enum(["NONE", "LOW", "MEDIUM", "HIGH", "VERY_HIGH"]).default("NONE"),
  isPrivate: z.boolean().default(false)
});

// Server Schema
export const serverSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  imageUrl: z.string().url({
    message: "Invalid URL format for server image"
  }),
  owner: objectIdSchema,
  members: z.array(memberSchema).default([]),
  roles: z.array(objectIdSchema).default([]),
  channels: z.array(objectIdSchema).default([]),
  categories: z.array(categorySchema).default([]),
  invites: z.array(inviteSchema).optional(),
  settings: serverSettingsSchema.default({}),
  template: z.enum(["GAMING", "EDUCATION", "COMMUNITY", "CUSTOM"]).default("CUSTOM"),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});

// Create Server Input Schema (for API endpoints)
export const createServerSchema = serverSchema.omit({
  createdAt: true,
  updatedAt: true,
  invites: true
}).extend({
  name: z.string().min(3).max(100).trim(),
});

// Update Server Input Schema
export const updateServerSchema = serverSchema.partial().omit({
  createdAt: true,
  updatedAt: true,
  owner: true
});

// Server with ID schema (for responses)
export const serverWithIdSchema = serverSchema.extend({
  _id: objectIdSchema
});

// Type definitions
export type Server = z.infer<typeof serverSchema>;
export type CreateServer = z.infer<typeof createServerSchema>;
export type UpdateServer = z.infer<typeof updateServerSchema>;
export type ServerWithId = z.infer<typeof serverWithIdSchema>;