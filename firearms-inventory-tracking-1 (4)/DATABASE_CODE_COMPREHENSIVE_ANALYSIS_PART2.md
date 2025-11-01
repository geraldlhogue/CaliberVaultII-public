# Database Analysis Part 2: Missing Tables & Discrepancies

## ❌ CRITICAL: TABLES REFERENCED IN CODE BUT DON'T EXIST

### Missing Reference Tables (Priority: HIGH)
These tables are actively queried in production code but don't exist in migrations:

| Table Name | Referenced In | Usage Count | Impact |
|------------|---------------|-------------|---------|
| `optic_types` | AttributeFields.tsx, AppContext.tsx | 15+ | 🔴 CRITICAL |
| `reticle_types` | AttributeFields.tsx, ReticleTypeManager.tsx | 12+ | 🔴 CRITICAL |
| `magnifications` | AttributeFields.tsx, AppContext.tsx | 10+ | 🔴 CRITICAL |
| `turret_types` | AttributeFields.tsx, TurretTypeManager.tsx | 8+ | 🔴 CRITICAL |
| `mounting_types` | MountingTypeManager.tsx, AppContext.tsx | 8+ | 🔴 CRITICAL |
| `suppressor_materials` | SuppressorMaterialManager.tsx | 6+ | 🔴 CRITICAL |
| `field_of_view_ranges` | FieldOfViewManager.tsx | 4+ | 🟡 HIGH |
| `firearm_actions` | ActionManager.tsx | 4+ | 🟡 HIGH |

**Impact**: These queries will fail with "relation does not exist" errors. Users cannot add optics or suppressors properly.

**Why They're Missing**: 
- Migrations 010-012 reference these tables in foreign key constraints
- But no CREATE TABLE statements exist
- Likely intended for future migration that was never created

**Solution Required**: Create migration 023 with all 8 missing reference tables

---

### Missing Feature Tables (Priority: MEDIUM)

| Table Name | Referenced In | Purpose | Status |
|------------|---------------|---------|---------|
| `stock_alert_rules` | AlertRulesModal.tsx | Inventory alerts | 🟡 Feature incomplete |
| `test_quality_scores` | TeamQualityDashboard.tsx | Test quality tracking | 🟡 New feature |
| `quality_gate_config` | QualityGateConfig.tsx | CI/CD quality gates | 🟡 New feature |

**Impact**: These features will not work until tables are created

**Solution Required**: Create migration 024 for quality gate tables

---

## ⚠️ TABLES THAT EXIST BUT ARE UNDERUTILIZED

### Orphaned/Unused Tables

| Table | Created | Issue | Recommendation |
|-------|---------|-------|----------------|
| `inventory_items` | Migration 001 | Replaced by category tables | Mark as deprecated, plan removal |
| `model_descriptions` | Migration 001 | Rarely used | Consider merging into manufacturers |

---

## 🔍 PSEUDO CODE VS ACTUAL IMPLEMENTATIONS

### Areas with Placeholder/Incomplete Code

#### 1. **Barcode Lookup Service** (PSEUDO)
**File**: `supabase/functions/barcode-lookup/index.ts`
**Status**: Returns mock data, no real API integration
```typescript
// TODO: Integrate with real barcode API
return { data: mockData }
```
**Fix Required**: Integrate with UPC Database API or similar

#### 2. **AI Valuation Service** (PARTIAL)
**File**: `src/services/ai/AIService.ts`
**Status**: Uses OpenAI but needs pricing data integration
**Missing**: Real market data, historical pricing
**Fix Required**: Integrate with GunBroker or similar API

#### 3. **Insurance Integration** (PSEUDO)
**File**: `src/components/integrations/InsuranceManager.tsx`
**Status**: UI only, no backend integration
**Missing**: Actual insurance provider APIs
**Fix Required**: Partner with insurance companies or remove feature

