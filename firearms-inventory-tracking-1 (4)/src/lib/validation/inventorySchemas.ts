import { z } from 'zod';

// Base inventory schema
export const baseInventorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  location: z.string().optional(),
  quantity: z.number().min(0, 'Quantity must be positive').default(1),
  value: z.number().min(0, 'Value must be positive').optional(),
  purchase_date: z.string().optional(),
  purchase_price: z.number().min(0).optional(),
  condition: z.enum(['new', 'like_new', 'good', 'fair', 'poor']).optional(),
  notes: z.string().optional(),
  images: z.array(z.string()).optional()
});

// Firearm-specific schema
export const firearmSchema = baseInventorySchema.extend({
  category: z.literal('firearms'),
  serial_number: z.string().min(1, 'Serial number is required'),
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  caliber: z.string().min(1, 'Caliber is required'),
  barrel_length: z.number().positive().optional(),
  action_type: z.string().optional(),
  firearm_type: z.string().optional(),
  purchase_from: z.string().optional(),
  ffl_number: z.string().optional(),
  nfa_item: z.boolean().default(false),
  threaded_barrel: z.boolean().default(false)
});

// Ammunition-specific schema
export const ammunitionSchema = baseInventorySchema.extend({
  category: z.literal('ammunition'),
  caliber: z.string().min(1, 'Caliber is required'),
  brand: z.string().min(1, 'Brand is required'),
  grain: z.number().positive('Grain must be positive'),
  bullet_type: z.string().optional(),
  rounds_per_box: z.number().positive().optional(),
  rounds_total: z.number().positive('Total rounds required'),
  cost_per_round: z.number().positive().optional(),
  lot_number: z.string().optional(),
  is_defense: z.boolean().default(false),
  is_tracer: z.boolean().default(false)
});

// Optics-specific schema
export const opticsSchema = baseInventorySchema.extend({
  category: z.literal('optics'),
  brand: z.string().min(1, 'Brand is required'),
  model: z.string().min(1, 'Model is required'),
  magnification_low: z.number().positive().optional(),
  magnification_high: z.number().positive().optional(),
  objective_diameter: z.number().positive().optional(),
  tube_diameter: z.number().positive().optional(),
  reticle_type: z.string().optional(),
  focal_plane: z.enum(['first', 'second']).optional(),
  illuminated: z.boolean().default(false),
  night_vision_compatible: z.boolean().default(false)
});

// Suppressor-specific schema
export const suppressorSchema = baseInventorySchema.extend({
  category: z.literal('suppressors'),
  serial_number: z.string().min(1, 'Serial number is required'),
  brand: z.string().min(1, 'Brand is required'),
  model: z.string().min(1, 'Model is required'),
  caliber: z.string().min(1, 'Caliber is required'),
  material: z.string().optional(),
  length: z.number().positive().optional(),
  diameter: z.number().positive().optional(),
  weight: z.number().positive().optional(),
  tax_stamp: z.string().optional(),
  purchase_from: z.string().optional(),
  nfa_item: z.boolean().default(true)
});

// Magazine-specific schema
export const magazineSchema = baseInventorySchema.extend({
  category: z.literal('magazines'),
  brand: z.string().min(1, 'Brand is required'),
  model_fit: z.string().min(1, 'Model fit is required'),
  caliber: z.string().min(1, 'Caliber is required'),
  capacity: z.number().positive('Capacity is required'),
  material: z.string().optional(),
  color: z.string().optional()
});

// Accessories schema
export const accessoriesSchema = baseInventorySchema.extend({
  category: z.literal('accessories'),
  brand: z.string().optional(),
  model: z.string().optional(),
  type: z.string().min(1, 'Type is required'),
  compatible_with: z.string().optional(),
  mount_type: z.string().optional()
});

// Cases schema
export const casesSchema = baseInventorySchema.extend({
  category: z.literal('cases'),
  brand: z.string().optional(),
  caliber: z.string().min(1, 'Caliber is required'),
  quantity_per_bag: z.number().positive().optional(),
  times_fired: z.number().min(0).default(0),
  cleaned: z.boolean().default(false),
  annealed: z.boolean().default(false)
});

// Bullets schema
export const bulletsSchema = baseInventorySchema.extend({
  category: z.literal('bullets'),
  brand: z.string().min(1, 'Brand is required'),
  caliber: z.string().min(1, 'Caliber is required'),
  grain: z.number().positive('Grain is required'),
  bullet_type: z.string().optional(),
  quantity_per_box: z.number().positive().optional(),
  ballistic_coefficient: z.number().positive().optional()
});

// Powder schema
export const powderSchema = baseInventorySchema.extend({
  category: z.literal('powder'),
  brand: z.string().min(1, 'Brand is required'),
  type: z.string().min(1, 'Type is required'),
  weight_pounds: z.number().positive('Weight is required'),
  burn_rate: z.string().optional(),
  unopened: z.boolean().default(true)
});

// Primers schema
export const primersSchema = baseInventorySchema.extend({
  category: z.literal('primers'),
  brand: z.string().min(1, 'Brand is required'),
  type: z.string().min(1, 'Type is required'),
  size: z.enum(['small', 'large']),
  quantity_per_box: z.number().positive().optional(),
  total_quantity: z.number().positive('Total quantity is required')
});

// Reloading schema
export const reloadingSchema = baseInventorySchema.extend({
  category: z.literal('reloading'),
  brand: z.string().optional(),
  model: z.string().optional(),
  type: z.string().min(1, 'Type is required'),
  caliber_compatibility: z.string().optional()
});

// Master validation function
export function validateInventoryItem(data: any) {
  const category = data.category?.toLowerCase();
  
  switch (category) {
    case 'firearms':
      return firearmSchema.safeParse(data);
    case 'ammunition':
      return ammunitionSchema.safeParse(data);
    case 'optics':
      return opticsSchema.safeParse(data);
    case 'suppressors':
      return suppressorSchema.safeParse(data);
    case 'magazines':
      return magazineSchema.safeParse(data);
    case 'accessories':
      return accessoriesSchema.safeParse(data);
    case 'cases':
      return casesSchema.safeParse(data);
    case 'bullets':
      return bulletsSchema.safeParse(data);
    case 'powder':
      return powderSchema.safeParse(data);
    case 'primers':
      return primersSchema.safeParse(data);
    case 'reloading':
      return reloadingSchema.safeParse(data);
    default:
      return baseInventorySchema.safeParse(data);
  }
}

// Export all schemas
export const inventorySchemas = {
  base: baseInventorySchema,
  firearms: firearmSchema,
  ammunition: ammunitionSchema,
  optics: opticsSchema,
  suppressors: suppressorSchema,
  magazines: magazineSchema,
  accessories: accessoriesSchema,
  cases: casesSchema,
  bullets: bulletsSchema,
  powder: powderSchema,
  primers: primersSchema,
  reloading: reloadingSchema
};