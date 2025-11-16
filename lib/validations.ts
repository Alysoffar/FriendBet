import { z } from 'zod'

// User validation schemas
export const registerSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.string().email(),
  password: z.string().min(6),
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

// Bet validation schemas
export const createBetSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(10).max(1000),
  deadline: z.string().datetime(),
  category: z.enum(['FITNESS', 'STUDY', 'GAMING', 'SOCIAL', 'WORK', 'FOOD', 'CHALLENGE', 'OTHER']),
  proofRequired: z.enum(['NONE', 'IMAGE', 'VIDEO', 'TEXT']).default('NONE'),
})

export const voteBetSchema = z.object({
  choice: z.enum(['FOR', 'AGAINST']),
  stake: z.number().min(10).max(1000),
  punishment: z.string().min(5).max(500).optional(),
})

export const resolveBetSchema = z.object({
  result: z.enum(['WON', 'LOST']),
  proofUrl: z.string().url().optional(),
})

// Punishment validation schemas
export const createPunishmentSchema = z.object({
  description: z.string().min(5).max(500),
  type: z.enum(['NICKNAME', 'CHALLENGE', 'VIDEO', 'PHOTO', 'TASK', 'OTHER']),
})

// Chat validation schemas
export const sendMessageSchema = z.object({
  message: z.string().min(1).max(500),
  type: z.enum(['TEXT', 'PUNISHMENT_SUGGESTION', 'SYSTEM']).default('TEXT'),
})

// Export types
export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type CreateBetInput = z.infer<typeof createBetSchema>
export type VoteBetInput = z.infer<typeof voteBetSchema>
export type ResolveBetInput = z.infer<typeof resolveBetSchema>
export type CreatePunishmentInput = z.infer<typeof createPunishmentSchema>
export type SendMessageInput = z.infer<typeof sendMessageSchema>
