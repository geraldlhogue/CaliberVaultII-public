# Entity Relationship Diagram (ERD)

## Visual ERD Generator

CaliberVault includes an interactive ERD generator component that visualizes the entire database schema.

### Access the ERD

Add to your admin dashboard or database tools:

```tsx
import { ERDGenerator } from '@/components/database/ERDGenerator';

<ERDGenerator />
```

### Features

- **Interactive SVG Diagram**: Pan and zoom to explore the schema
- **Color-Coded Tables**: Different colors for entity types
  - 🔵 Blue: Inventory tables (firearms, ammunition, optics, suppressors)
  - 🟢 Green: Reference data (calibers, manufacturers, categories)
  - 🟠 Orange: User/auth tables
  - 🟣 Purple: System tables
  - 🔴 Pink: Collaboration tables
- **Relationship Lines**: Visual connections showing foreign keys
- **Click to Highlight**: Click any table to highlight it
- **Download SVG**: Export the diagram for documentation
- **Primary Key Indicators**: 🔑 icon for primary keys
- **Foreign Key Indicators**: 🔗 icon for foreign keys

### Controls

- **Zoom In/Out**: Buttons to adjust zoom level (0.3x to 3x)
- **Download**: Export diagram as SVG file
- **Click Tables**: Select to highlight relationships

## Quick Reference

See `DATABASE_STRUCTURE_COMPLETE.md` for detailed table documentation.
