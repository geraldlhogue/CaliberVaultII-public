# Database-Code Discrepancies - Part 2

## Reference Tables Status

### ✅ Complete Reference Tables (All have Admin UI + Code Integration)

| Table | Admin Component | Records | Integration Status |
|-------|----------------|---------|-------------------|
| optic_types | ReferenceDataManager | 5 | ✅ Used in optics |
| reticle_types | ReticleTypeManager | 11 | ✅ Used in optics |
| magnifications | ReferenceDataManager | 18 | ✅ Used in optics |
| turret_types | TurretTypeManager | 5 | ✅ Used in optics |
| mounting_types | MountingTypeManager | 8 | ✅ Used in optics |
| suppressor_materials | SuppressorMaterialManager | 5 | ✅ Used in suppressors |
| firearm_types | ReferenceDataManager | 5 | ✅ Used in firearms |
| bullet_types | BulletTypeManager | 21 | ✅ Used in ammunition |
| powder_types | PowderTypeManager | 10+ | ✅ Used in ammunition |
| primer_types | PrimerTypeManager | 10+ | ✅ Used in ammunition |
| calibers | CaliberManager | Many | ✅ Used in firearms/ammo |
| cartridges | CartridgeManager | Many | ✅ Used in ammunition |
| field_of_view_ranges | FieldOfViewManager | 17 | ✅ NEW - Reference data |

### 🟡 Duplicate/Inconsistent Tables

**actions vs firearm_actions**
- Both exist with similar purpose
- Different data counts (12 vs 8)
- Different column structures
- **Action Required**: Consolidate to single table

---

## Feature Tables Integration Status

### 1. test_quality_scores ✅ FULLY INTEGRATED
- **Purpose**: Track test quality metrics for CI/CD
- **Code Integration**: 
  - AdminTestingPanel.tsx (displays data)
  - TeamQualityDashboard.tsx (analytics)
  - quality-gate-check edge function (writes data)
- **GitHub Integration**: .github/workflows/quality-gate.yml
- **Status**: Production ready

### 2. quality_gate_config ✅ FULLY INTEGRATED
- **Purpose**: Configure quality thresholds per user
- **Code Integration**:
  - QualityGateConfig.tsx (CRUD UI)
  - quality-gate-check edge function (reads config)
- **Status**: Production ready

### 3. stock_alert_rules ✅ FULLY INTEGRATED
- **Purpose**: Automated inventory alerts
- **Code Integration**:
  - AlertRulesModal.tsx (CRUD UI)
  - StockAlertDashboard.tsx (displays alerts)
  - check-stock-alerts edge function (processes rules)
- **Status**: Production ready
