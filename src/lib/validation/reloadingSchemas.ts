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

// Reloading equipment schema
export const reloadingSchema = baseInventorySchema.extend({
  category: z.literal('reloading'),
  equipmentType: optionalString,
  caliber: optionalString,
  compatibility: optionalString
});

// Cases schema
export const casesSchema = baseInventorySchema.extend({
  category: z.literal('cases'),
  caliber: optionalString,
  caseType: optionalString,
  material: optionalString,
  primed: z.boolean().optional(),
  timesReloaded: optionalInteger,
  lotNumber: optionalString
});

// Primers schema
export const primersSchema = baseInventorySchema.extend({
  category: z.literal('primers'),
  primerType: optionalString,
  primerSize: optionalString,
  lotNumber: optionalString,
  quantity: optionalInteger
});

// Powder schema
export const powderSchema = baseInventorySchema.extend({
  category: z.literal('powder'),
  powderType: optionalString,
  weight: optionalString,
  weightValue: optionalNumber,
  weightUom: optionalString,
  lotNumber: optionalString
});

export type ReloadingFormData = z.infer<typeof reloadingSchema>;
export type CasesFormData = z.infer<typeof casesSchema>;
export type PrimersFormData = z.infer<typeof primersSchema>;
export type PowderFormData = z.infer<typeof powderSchema>;
