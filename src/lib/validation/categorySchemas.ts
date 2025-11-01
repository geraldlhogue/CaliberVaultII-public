import { z } from 'zod';

// Reusable field validators
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

// Base schema for all inventory items
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

// Firearms schema
export const firearmsSchema = baseInventorySchema.extend({
  category: z.literal('firearms'),
  firearmSubcategory: optionalString,
  caliber: optionalString,
  cartridge: optionalString,
  action: optionalString,
  barrelLength: optionalString,
  barrelLengthValue: optionalNumber,
  barrelLengthUom: optionalString,
  capacity: optionalInteger
});

// Ammunition schema
export const ammunitionSchema = baseInventorySchema.extend({
  category: z.literal('ammunition'),
  caliber: optionalString,
  cartridge: optionalString,
  ammoType: optionalString,
  bulletType: optionalString,
  grainWeight: optionalString,
  grainWeightValue: optionalNumber,
  grainWeightUom: optionalString,
  roundCount: optionalInteger,
  lotNumber: optionalString
});

// Optics schema
export const opticsSchema = baseInventorySchema.extend({
  category: z.literal('optics'),
  magnification: optionalString,
  objectiveLens: optionalString,
  objectiveLensValue: optionalNumber,
  objectiveLensUom: optionalString,
  reticleType: optionalString,
  turretType: optionalString,
  mountingType: optionalString,
  fieldOfView: optionalString
});
