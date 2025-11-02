# Toast Migration Guide - Nov 1, 2024

## Problem
50+ files still using old `useToast` hook causing React Error #306

## Solution
Migrate all files to use `toast` from 'sonner'

## Migration Pattern

### OLD (❌ Remove):
```typescript
import { useToast } from '@/hooks/use-toast';

function MyComponent() {
  const { toast } = useToast();
  
  toast({
    title: "Success",
    description: "Item saved"
  });
}
```

### NEW (✅ Use):
```typescript
import { toast } from 'sonner';

function MyComponent() {
  toast.success("Item saved");
  // or
  toast.error("Failed to save");
  // or
  toast.info("Processing...");
}
```

## Files That Need Migration

### Admin Components:
- FieldOfViewManager.tsx
- ManufacturerManager.tsx
- PowderTypeManager.tsx
- PrimerTypeManager.tsx
- ReticleTypeManager.tsx
- StorageLocationManager.tsx
- TierLimitsManager.tsx
- UnitOfMeasureManager.tsx

### Auth Components:
- LoginModal.tsx
- SignupModal.tsx

### Other Components:
- FirearmImageRecognition.tsx
- BackupRestore.tsx
- ComplianceDocuments.tsx
- And 40+ more...

## Testing After Migration
Run these commands:
```bash
npm test
npm run test:e2e
```
