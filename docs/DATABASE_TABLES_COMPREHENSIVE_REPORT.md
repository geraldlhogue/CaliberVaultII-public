# Comprehensive Database Tables Report

## Table of Contents
1. [Core Inventory Tables](#core-inventory-tables)
2. [Category Detail Tables](#category-detail-tables)
3. [Reference/Lookup Tables](#reference-lookup-tables)
4. [User & Auth Tables](#user-auth-tables)
5. [Feature Tables](#feature-tables)
6. [Relationships Diagram](#relationships-diagram)

---

## Core Inventory Tables

### inventory
**Primary inventory table - all items start here**

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | UUID | PK | Unique identifier |
| user_id | UUID | FK→auth.users, NOT NULL | Owner |
| category_id | UUID | FK→categories | Item category |
| name | TEXT | NOT NULL | Display name |
| manufacturer_id | UUID | FK→manufacturers | Manufacturer |
| model | TEXT | | Model number/name |
| description | TEXT | | Description |
| quantity | INTEGER | DEFAULT 1 | Quantity owned |
| location_id | UUID | FK→locations | Storage location |
| purchase_price | NUMERIC(10,2) | | Purchase price |
| purchase_date | DATE | | Purchase date |
| current_value | NUMERIC(10,2) | | Current value |
| barcode | TEXT | | Barcode |
| upc | TEXT | | UPC code |
| photos | TEXT[] | | Photo URLs array |
| notes | TEXT | | User notes |
| status | TEXT | DEFAULT 'active' | Status |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Created timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Updated timestamp |

**Indexes**: user_id, category_id, manufacturer_id, location_id, status, created_at
**RLS**: Enabled - users see only their own items

---

## Category Detail Tables

### firearm_details
| Column | Type | FK | Description |
|--------|------|-----|-------------|
| id | UUID | PK | |
| inventory_id | UUID | FK→inventory (UNIQUE) | Parent item |
| caliber_id | UUID | FK→calibers | Caliber |
| cartridge_id | UUID | FK→cartridges | Cartridge |
| serial_number | TEXT | | Serial number |
| barrel_length | NUMERIC(10,2) | | Barrel length (inches) |
| capacity | INTEGER | | Magazine capacity |
| action_id | UUID | FK→action_types | Action type |
| round_count | INTEGER | DEFAULT 0 | Rounds fired |

### ammunition_details
| Column | Type | FK | Description |
|--------|------|-----|-------------|
| id | UUID | PK | |
| inventory_id | UUID | FK→inventory (UNIQUE) | Parent item |
| caliber_id | UUID | FK→calibers | Caliber |
| cartridge_id | UUID | FK→cartridges | Cartridge |
| bullet_type_id | UUID | FK→bullet_types | Bullet type |
| grain_weight | NUMERIC(10,2) | | Grain weight |
| round_count | INTEGER | | Number of rounds |
| primer_type_id | UUID | FK→primer_types | Primer type |

### optic_details
| Column | Type | FK | Description |
|--------|------|-----|-------------|
| id | UUID | PK | |
| inventory_id | UUID | FK→inventory (UNIQUE) | Parent item |
| magnification_id | UUID | FK→magnifications | Magnification |
| objective_diameter | NUMERIC(10,2) | | Objective lens (mm) |
| reticle_type_id | UUID | FK→reticle_types | Reticle type |
| turret_type_id | UUID | FK→turret_types | Turret type |

### magazine_details
| Column | Type | FK | Description |
|--------|------|-----|-------------|
| id | UUID | PK | |
| inventory_id | UUID | FK→inventory (UNIQUE) | Parent item |
| caliber_id | UUID | FK→calibers | Caliber |
| capacity | INTEGER | | Round capacity |
| material | TEXT | | Material |

### accessory_details
| Column | Type | FK | Description |
|--------|------|-----|-------------|
| id | UUID | PK | |
| inventory_id | UUID | FK→inventory (UNIQUE) | Parent item |
| accessory_type | TEXT | | Type of accessory |
| compatibility | TEXT | | Compatible with |

### suppressor_details
| Column | Type | FK | Description |
|--------|------|-----|-------------|
| id | UUID | PK | |
| inventory_id | UUID | FK→inventory (UNIQUE) | Parent item |
| caliber_id | UUID | FK→calibers | Caliber |
| serial_number | TEXT | | Serial number |
| length | NUMERIC(10,2) | | Length (inches) |
| weight | NUMERIC(10,2) | | Weight (oz) |
| material_id | UUID | FK→suppressor_materials | Material |

### reloading_details
| Column | Type | FK | Description |
|--------|------|-----|-------------|
| id | UUID | PK | |
| inventory_id | UUID | FK→inventory (UNIQUE) | Parent item |
| equipment_type | TEXT | | Equipment type |
| compatibility | TEXT | | Compatible calibers |

### case_details
| Column | Type | FK | Description |
|--------|------|-----|-------------|
| id | UUID | PK | |
| inventory_id | UUID | FK→inventory (UNIQUE) | Parent item |
| caliber_id | UUID | FK→calibers | Caliber |
| quantity | INTEGER | | Number of cases |
| condition | TEXT | | Condition |

### primer_details
| Column | Type | FK | Description |
|--------|------|-----|-------------|
| id | UUID | PK | |
| inventory_id | UUID | FK→inventory (UNIQUE) | Parent item |
| primer_type_id | UUID | FK→primer_types | Primer type |
| quantity | INTEGER | | Quantity |
| size | TEXT | | Size |

### powder_details
| Column | Type | FK | Description |
|--------|------|-----|-------------|
| id | UUID | PK | |
| inventory_id | UUID | FK→inventory (UNIQUE) | Parent item |
| powder_type_id | UUID | FK→powder_types | Powder type |
| weight | NUMERIC(10,2) | | Weight (lbs) |
| burn_rate | TEXT | | Burn rate |

---

## Reference/Lookup Tables

### manufacturers
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | PK |
| name | TEXT | Manufacturer name |
| is_system | BOOLEAN | System-provided |

### categories
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | PK |
| name | TEXT | Category name |
| description | TEXT | Description |

**Standard Categories**: Firearms, Ammunition, Optics, Magazines, Accessories, Suppressors, Reloading Equipment, Cases, Primers, Powder

### calibers
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | PK |
| name | TEXT | Caliber name (e.g., 9mm, .45 ACP) |

### cartridges
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | PK |
| cartridge | TEXT | Cartridge name |

### action_types
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | PK |
| name | TEXT | Action type (Semi-Auto, Bolt, etc.) |

### bullet_types
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | PK |
| name | TEXT | Bullet type (FMJ, HP, etc.) |

### primer_types
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | PK |
| name | TEXT | Primer type |

### powder_types
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | PK |
| name | TEXT | Powder type |

### magnifications
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | PK |
| name | TEXT | Magnification range |

### reticle_types
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | PK |
| name | TEXT | Reticle type |

### turret_types
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | PK |
| name | TEXT | Turret type |

### suppressor_materials
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | PK |
| name | TEXT | Material type |

### locations
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | FK→auth.users |
| name | TEXT | Location name |
| description | TEXT | Description |

---

## User & Auth Tables

### user_profiles
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | PK, FK→auth.users |
| email | TEXT | Email |
| full_name | TEXT | Full name |
| subscription_tier | TEXT | Tier (free/basic/pro) |

### user_permissions
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | FK→auth.users |
| permission | TEXT | Permission name |
| granted_at | TIMESTAMPTZ | When granted |

---

## Feature Tables

### audit_logs
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | FK→auth.users |
| action | TEXT | Action performed |
| table_name | TEXT | Affected table |
| record_id | UUID | Affected record |
| changes | JSONB | Changes made |
| timestamp | TIMESTAMPTZ | When |

### maintenance_records
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | PK |
| item_id | UUID | FK→inventory |
| maintenance_date | DATE | Date |
| description | TEXT | Work performed |
| cost | NUMERIC(10,2) | Cost |

### range_sessions
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | PK |
| session_date | TIMESTAMPTZ | Session date |
| location | TEXT | Range location |
| notes | TEXT | Notes |

### compliance_documents
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | PK |
| item_id | UUID | FK→inventory |
| document_type | TEXT | Type |
| document_url | TEXT | URL |
| expiration_date | DATE | Expiration |

### activity_feed
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | FK→auth.users |
| action | TEXT | Action |
| details | JSONB | Details |
| timestamp | TIMESTAMPTZ | When |

### item_comments
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | FK→auth.users |
| item_id | UUID | FK→inventory |
| comment | TEXT | Comment text |
| created_at | TIMESTAMPTZ | When |

### valuation_history
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | FK→auth.users |
| item_id | UUID | FK→inventory |
| valuation_amount | NUMERIC(10,2) | Value |
| valuation_date | TIMESTAMPTZ | When |
| source | TEXT | Source (AI/Manual) |

---

## Relationships Diagram

```
auth.users (1) ─┬─→ (N) inventory
                ├─→ (N) locations
                ├─→ (N) manufacturers (custom)
                └─→ (1) user_profiles

inventory (1) ─┬─→ (1) firearm_details
               ├─→ (1) ammunition_details
               ├─→ (1) optic_details
               ├─→ (1) magazine_details
               ├─→ (1) accessory_details
               ├─→ (1) suppressor_details
               ├─→ (1) reloading_details
               ├─→ (1) case_details
               ├─→ (1) primer_details
               ├─→ (1) powder_details
               ├─→ (N) maintenance_records
               ├─→ (N) item_comments
               └─→ (N) valuation_history

inventory (N) ─┬─→ (1) categories
               ├─→ (1) manufacturers
               └─→ (1) locations

firearm_details (N) ─┬─→ (1) calibers
                     ├─→ (1) cartridges
                     └─→ (1) action_types

ammunition_details (N) ─┬─→ (1) calibers
                        ├─→ (1) cartridges
                        ├─→ (1) bullet_types
                        └─→ (1) primer_types

optic_details (N) ─┬─→ (1) magnifications
                   ├─→ (1) reticle_types
                   └─→ (1) turret_types
```

---

## Total Table Count: 40+

**Core**: 11 (inventory + 10 detail tables)
**Reference**: 15+ (calibers, manufacturers, etc.)
**User/Auth**: 2
**Features**: 12+ (audit, maintenance, etc.)
