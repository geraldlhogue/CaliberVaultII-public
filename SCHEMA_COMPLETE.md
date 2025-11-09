# Complete Database Schema Documentation

## Overview
CaliberVault uses a normalized 3NF database design with a base inventory table and category-specific detail tables.

## Architecture Pattern
- **Base Table**: `inventory` - Universal fields for all items
- **Detail Tables**: Category-specific attributes (e.g., `firearm_details`, `ammunition_details`)
- **Reference Tables**: Lookup data (e.g., `calibers`, `manufacturers`)

---

## Core Tables

### 1. inventory (Base Table)
**Purpose**: Universal inventory data for all categories

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| user_id | UUID | FK → auth.users, NOT NULL | Owner |
| category_id | UUID | FK → categories | Item category |
| name | TEXT | NOT NULL | Item name |
| manufacturer_id | UUID | FK → manufacturers | Manufacturer |
| model | TEXT | | Model name |
| description | TEXT | | Description |
| quantity | INTEGER | DEFAULT 1 | Quantity |
| location_id | UUID | FK → locations | Storage location |
| purchase_price | NUMERIC(10,2) | | Purchase price |
| purchase_date | DATE | | Purchase date |
| current_value | NUMERIC(10,2) | | Current value |
| barcode | TEXT | | Barcode |
| upc | TEXT | | UPC code |
| photos | TEXT[] | | Photo URLs |
| notes | TEXT | | Notes |
| status | TEXT | DEFAULT 'active' | Status |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Created |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Updated |

**Indexes**: user_id, category_id, manufacturer_id, location_id, status, created_at

---

## Category Detail Tables

### 2. firearm_details
**Purpose**: Firearm-specific attributes

| Column | Type | FK Reference | Description |
|--------|------|--------------|-------------|
| id | UUID | PRIMARY KEY | Unique ID |
| inventory_id | UUID | FK → inventory (UNIQUE) | Base record |
| caliber_id | UUID | FK → calibers | Caliber |
| cartridge_id | UUID | FK → cartridges | Cartridge |
| serial_number | TEXT | | Serial number |
| barrel_length | NUMERIC(10,2) | | Barrel length |
| capacity | INTEGER | | Magazine capacity |
| action_id | UUID | FK → action_types | Action type |
| round_count | INTEGER | DEFAULT 0 | Rounds fired |

### 3. ammunition_details
**Purpose**: Ammunition-specific attributes

| Column | Type | FK Reference | Description |
|--------|------|--------------|-------------|
| id | UUID | PRIMARY KEY | Unique ID |
| inventory_id | UUID | FK → inventory (UNIQUE) | Base record |
| caliber_id | UUID | FK → calibers | Caliber |
| cartridge_id | UUID | FK → cartridges | Cartridge |
| bullet_type_id | UUID | FK → bullet_types | Bullet type |
| grain_weight | NUMERIC(10,2) | | Grain weight |
| round_count | INTEGER | | Round count |
| primer_type_id | UUID | FK → primer_types | Primer type |

### 4. optic_details
**Purpose**: Optics-specific attributes

| Column | Type | FK Reference | Description |
|--------|------|--------------|-------------|
| id | UUID | PRIMARY KEY | Unique ID |
| inventory_id | UUID | FK → inventory (UNIQUE) | Base record |
| magnification_id | UUID | FK → magnifications | Magnification |
| objective_diameter | NUMERIC(10,2) | | Objective size |
| reticle_type_id | UUID | FK → reticle_types | Reticle |
| turret_type_id | UUID | FK → turret_types | Turret type |

### 5. magazine_details
| Column | Type | FK Reference |
|--------|------|--------------|
| id | UUID | PRIMARY KEY |
| inventory_id | UUID | FK → inventory (UNIQUE) |
| caliber_id | UUID | FK → calibers |
| capacity | INTEGER | |
| material | TEXT | |

### 6. accessory_details
| Column | Type | FK Reference |
|--------|------|--------------|
| id | UUID | PRIMARY KEY |
| inventory_id | UUID | FK → inventory (UNIQUE) |
| accessory_type | TEXT | |
| compatibility | TEXT | |

### 7. suppressor_details
| Column | Type | FK Reference |
|--------|------|--------------|
| id | UUID | PRIMARY KEY |
| inventory_id | UUID | FK → inventory (UNIQUE) |
| caliber_id | UUID | FK → calibers |
| serial_number | TEXT | |
| length | NUMERIC(10,2) | |
| weight | NUMERIC(10,2) | |
| material_id | UUID | FK → suppressor_materials |

### 8-10. Reloading Tables
- **reloading_details**: Equipment
- **case_details**: Brass cases
- **primer_details**: Primers
- **powder_details**: Powder

---

## Reference Tables

### calibers
Caliber definitions (9mm, .45 ACP, etc.)

### cartridges
Cartridge types

### action_types
Firearm actions (Semi-Auto, Bolt, etc.)

### bullet_types
Bullet types (FMJ, HP, etc.)

### primer_types
Primer types (Small Pistol, Large Rifle, etc.)

### powder_types
Powder types

### manufacturers
Manufacturer list

### categories
Item categories (11 total)

---

## Relationships

```
inventory (1) ←→ (1) firearm_details
inventory (1) ←→ (1) ammunition_details
inventory (1) ←→ (1) optic_details
... (one-to-one for each category)

inventory (N) → (1) category
inventory (N) → (1) manufacturer
inventory (N) → (1) location

firearm_details (N) → (1) caliber
firearm_details (N) → (1) action_type
ammunition_details (N) → (1) bullet_type
... (many-to-one for reference data)
```

---

## 3NF Compliance

✅ **1NF**: All columns atomic, no repeating groups
✅ **2NF**: All non-key attributes depend on entire primary key
✅ **3NF**: No transitive dependencies

**Design Principles**:
- Base table contains universal fields
- Detail tables contain category-specific fields
- Reference tables eliminate redundancy
- Foreign keys enforce referential integrity
