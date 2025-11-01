import { z } from 'zod';

const optionalString = z.string().optional().nullable().transform(val => val || undefined);
const optionalNumber = z.union([
  z.number(),
  z.string().transform(val => {
    if (!val || val === '') return undefined;
    const num = parseFloat(val);
    return isNaN(num) ? undefined : num;
  }),
  z.null(),
  z.undefined()
]).optional();

const optionalInteger = z.union([
  z.number().int(),
  z.string().transform(val => {
    if (!val || val === '') return undefined;
    const num = parseInt(val, 10);
    return isNaN(num) ? undefined : num;
  }),
  z.null(),
  z.undefined()
]).optional();

const baseInventorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  manufacturer: optionalString,
  model: optionalString,
  modelNumber: optionalString,
  serialNumber: optionalString,
  storageLocation: optionalString,
  purchasePrice: optionalNumber,
  currentValue: optionalNumber,
  purchaseDate: optionalString,
  quantity: optionalInteger,
  description: optionalString,
  notes: optionalString,
  barcode: optionalString,
  upc: optionalString,
  images: z.array(z.string()).default([])
});

// Magazines schema
export const magazinesSchema = baseInventorySchema.extend({
  category: z.literal('magazines'),
  caliber: optionalString,
  capacity: optionalInteger,
  material: optionalString,
  compatibility: optionalString
});

// Accessories schema
export const accessoriesSchema = baseInventorySchema.extend({
  category: z.literal('accessories'),
  componentType: optionalString,
  compatibility: optionalString,
  material: optionalString
});

// Suppressors schema
export const suppressorsSchema = baseInventorySchema.extend({
  category: z.literal('suppressors'),
  caliber: optionalString,
  material: optionalString,
  length: optionalString,
  lengthValue: optionalNumber,
  lengthUom: optionalString,
  diameter: optionalString,
  diameterValue: optionalNumber,
  diameterUom: optionalString,
  weight: optionalString,
  weightValue: optionalNumber,
  weightUom: optionalString,
  dbReduction: optionalNumber
});
