# CaliberVault Database Structure - Complete Documentation

## Overview
CaliberVault uses PostgreSQL (Supabase) with a multi-tenant design where each user owns their data.

## Cardinality Explained (Plain English)

- **One-to-Many (1:N)**: One parent can have many children. Example: One user owns many firearms.
- **Many-to-One (N:1)**: Many children belong to one parent. Example: Many firearms belong to one manufacturer.
- **One-to-One (1:1)**: One record relates to exactly one other. Example: One user has one profile.
- **Many-to-Many (N:M)**: Many records relate to many others (requires junction table).

## Core Entity Tables

### 1. **firearms** - Firearm Inventory
```
id                    UUID PRIMARY KEY
user_id              UUID → auth.users (OWNER)
name                 TEXT
manufacturer_id      UUID → manufacturers (OPTIONAL)
model                TEXT
model_number         TEXT
serial_number        TEXT
caliber_id          UUID → calibers (OPTIONAL)
action_id           UUID → action_types (OPTIONAL)
firearm_type_id     UUID → firearm_types (OPTIONAL)
barrel_length       DECIMAL(5,2)
storage_location_id UUID → locations (OPTIONAL)
purchase_price      DECIMAL(10,2)
current_value       DECIMAL(10,2)
purchase_date       DATE
quantity            INTEGER (default: 1)
image_url           TEXT
notes               TEXT
created_at          TIMESTAMPTZ
updated_at          TIMESTAMPTZ
```
**Relationships:**
- User owns many firearms (1:N)
- Manufacturer makes many firearms (1:N)
- Caliber used by many firearms (1:N)
- Location stores many firearms (1:N)

### 2. **optics** - Optics/Scopes Inventory
```
id                    UUID PRIMARY KEY
user_id              UUID → auth.users
manufacturer_id      UUID → manufacturers
model                TEXT
serial_number        TEXT
optic_type_id       UUID → optic_types
magnification_id    UUID → magnifications
objective_lens      DECIMAL(5,1)
reticle_type_id     UUID → reticle_types
turret_type_id      UUID → turret_types
field_of_view       TEXT
storage_location_id UUID → locations
purchase_price      DECIMAL(10,2)
mounted_on_firearm_id UUID → firearms (OPTIONAL)
```
**Relationships:**
- Can be mounted on one firearm (N:1)

### 3. **bullets** - Ammunition Inventory
```
id                  UUID PRIMARY KEY
user_id            UUID → auth.users
manufacturer_id    UUID → manufacturers
caliber_id        UUID → calibers
bullet_type_id    UUID → bullet_types
grain_weight      DECIMAL(6,2)
round_count       INTEGER
lot_number        TEXT
case_type         TEXT
primer_type       TEXT
powder_type       TEXT
powder_charge     DECIMAL(5,2)
storage_location_id UUID → locations
```

### 4. **suppressors** - Suppressor Inventory
```
id                  UUID PRIMARY KEY
user_id            UUID → auth.users
manufacturer_id    UUID → manufacturers
caliber_id        UUID → calibers
mounting_type_id  UUID → mounting_types
thread_pitch      TEXT
length            DECIMAL(5,2)
weight            DECIMAL(6,2)
material_id       UUID → suppressor_materials
sound_reduction   TEXT
full_auto_rated   BOOLEAN
modular           BOOLEAN
```

## Reference Tables (Lookup Data)

### manufacturers, calibers, locations, categories
- Each has: id, user_id, name, description
- User owns many of each (1:N)

### firearm_types, action_types, bullet_types
- Standardized types for categorization
- Shared across users or user-specific

### optic_types, reticle_types, magnifications, turret_types
- Optics-specific reference data

### mounting_types, suppressor_materials
- Suppressor-specific reference data

### powder_types, primer_types, ammo_types, cartridges
- Ammunition component reference data

## Supporting Tables

### maintenance_records
- Tracks cleaning, repairs, upgrades
- Links to firearms/optics/suppressors via item_id + item_type

### range_sessions
- Tracks shooting sessions
- Links to specific firearm_id

### compliance_documents
- ATF forms, permits, licenses
- Links to items or general documents

### activity_feed
- Audit trail of user actions
- Tracks create/update/delete operations

### item_comments
- User notes/comments on items
- Supports threaded comments (parent_id)

## Key Design Patterns

1. **Multi-tenancy**: Every table has user_id for data isolation
2. **Soft References**: Most FKs use ON DELETE SET NULL (preserve data)
3. **Hard References**: Type tables use ON DELETE RESTRICT (prevent orphans)
4. **Cascading Deletes**: User deletion removes all their data
5. **Row Level Security**: Users only see their own data
6. **Realtime Enabled**: Changes sync across devices instantly
