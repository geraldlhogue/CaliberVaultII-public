# Database Analysis Part 4: Action Plan & Recommendations

## 🎯 COMPREHENSIVE ACTION PLAN

### PHASE 1: Critical Database Fixes (Week 1)
**Priority**: 🔴 CRITICAL - App is broken without these

#### Task 1.1: Create Missing Reference Tables
**File**: `supabase/migrations/023_create_missing_reference_tables.sql`

**Tables to Create**:
1. `optic_types` (Scope, Red Dot, Holographic, Magnifier, Iron Sights)
2. `reticle_types` (Crosshair, Mil-Dot, BDC, Illuminated, etc)
3. `magnifications` (1x, 3-9x, 5-25x, Variable, etc)
4. `turret_types` (Capped, Exposed, Zero-Stop, Locking)
5. `mounting_types` (Picatinny, M-LOK, KeyMod, Direct Thread, QD)
6. `suppressor_materials` (Titanium, Stainless Steel, Aluminum, Inconel)
7. `field_of_view_ranges` (FOV data for different magnifications)
8. `firearm_actions` (Rename from 'actions' for clarity, or create alias)

**Estimated Time**: 4 hours  
**Risk**: LOW - Standard CRUD tables  
**Impact**: HIGH - Fixes optics/suppressor add functionality

#### Task 1.2: Create Quality Gate Tables
**File**: `supabase/migrations/024_create_quality_gate_tables.sql`

```sql
CREATE TABLE test_quality_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  overall_score INTEGER CHECK (overall_score BETWEEN 0 AND 100),
  coverage_score INTEGER,
  edge_case_score INTEGER,
  mock_quality_score INTEGER,
  assertion_score INTEGER,
  best_practices_score INTEGER,
  strengths JSONB DEFAULT '[]',
  improvements JSONB DEFAULT '[]',
  recommendations JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE quality_gate_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  config_name TEXT NOT NULL,
  min_overall_score INTEGER DEFAULT 70,
  min_coverage_score INTEGER DEFAULT 70,
  min_edge_case_score INTEGER DEFAULT 60,
  min_mock_quality_score INTEGER DEFAULT 70,
  min_assertion_score INTEGER DEFAULT 80,
  min_best_practices_score INTEGER DEFAULT 75,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, config_name)
);
```

**Estimated Time**: 2 hours  
**Risk**: LOW  
**Impact**: MEDIUM - Enables new testing features

#### Task 1.3: Create Stock Alert Tables
**File**: `supabase/migrations/025_create_stock_alert_tables.sql`

```sql
CREATE TABLE stock_alert_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  item_type TEXT NOT NULL,
  item_id UUID,
  alert_type TEXT CHECK (alert_type IN ('low_stock', 'out_of_stock', 'expiring')),
  threshold INTEGER,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Estimated Time**: 1 hour  
**Risk**: LOW  
**Impact**: MEDIUM

---

### PHASE 2: Pricing Tier Implementation (Weeks 2-3)
**Priority**: 🟡 HIGH - Revenue generation

#### Task 2.1: Database Schema
**File**: `supabase/migrations/026_create_subscription_tables.sql`

Create tables:
- `subscriptions`
- `usage_tracking`
- `feature_flags`
- `payment_history`

**Estimated Time**: 8 hours  
**Risk**: MEDIUM - Financial data requires careful design

