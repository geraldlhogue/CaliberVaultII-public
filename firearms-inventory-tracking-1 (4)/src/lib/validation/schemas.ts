import { z } from 'zod';

// Common validation patterns
const positiveNumber = z.number().positive('Must be a positive number');
const optionalPositiveNumber = z.number().positive().optional().or(z.literal(0));
const nonEmptyString = z.string().min(1, 'This field is required');

// Universal fields schema - simplified to avoid discriminated union issues
export const universalFieldsSchema = z.object({
  name: nonEmptyString,
  category: nonEmptyString,
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  serial_number: z.string().optional(),
  purchase_date: z.string().optional(),
  purchase_price: optionalPositiveNumber,
  current_value: optionalPositiveNumber,
  condition: z.string().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
  // Optional category-specific fields
  caliber: z.string().optional(),
  barrel_length: z.number().optional(),
  action_type: z.string().optional(),
  finish: z.string().optional(),
  quantity: z.number().optional(),
  grain_weight: z.number().optional(),
  bullet_type: z.string().optional(),
}).passthrough();

// Simplified add item schema - no discriminated union
export const addItemSchema = universalFieldsSchema;

export type AddItemFormData = z.infer<typeof addItemSchema>;
export type UniversalFieldsData = z.infer<typeof universalFieldsSchema>;
