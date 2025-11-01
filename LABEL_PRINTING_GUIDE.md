# Label Printing & Location Tracking System

## Overview
CaliberVault now includes a comprehensive label printing and location tracking system that allows you to:
- Generate and print custom barcode labels for inventory items
- Create location labels with QR codes
- Match items to locations via barcode scanning
- Automatically combine items into builds
- Export labels to PDF for label printers

## Features

### 1. Enhanced Label Printing
**Location:** Inventory Dashboard → "Print Labels" button

**Supported Barcode Types:**
- QR Code - Best for storing detailed item information
- CODE128 - Industry standard linear barcode
- CODE39 - Alphanumeric barcode format
- EAN13 - European Article Number (13 digits)
- UPC - Universal Product Code

**Label Formats:**
- Avery 5160 - 1" x 2-5/8" Address Labels (30 per sheet)
- Avery 5163 - 2" x 4" Shipping Labels (10 per sheet)
- Avery 5167 - 1/2" x 1-3/4" Return Address (80 per sheet)
- DYMO 30334 - 2-1/4" x 1-1/4" Name Badge
- Custom Large - 3" x 2" Asset Labels

**How to Use:**
1. Click "Print Labels" button in the inventory dashboard
2. Select label format from dropdown
3. Choose barcode type (QR, CODE128, etc.)
4. Switch between "Item Labels" and "Location Labels" tabs
5. Click "Print" for direct printing or "Export PDF" for label printers

**PDF Export:**
- Labels are exported as PDF files
- Compatible with thermal label printers
- Includes all item information and barcodes
- Optimized for standard label sizes

### 2. Location Barcode Scanner
**Location:** Item Detail Modal → "Scan Location" button

**Features:**
- Scan location QR codes to assign items to locations
- Verify location exists in database before assignment
- Visual feedback for successful scans
- Manual entry option for locations without codes

**How to Use:**
1. Open any item detail modal
2. Click "Scan Location" button
3. Scan a location QR code or barcode
4. System verifies location and displays details
5. Click "Assign Location" to save

**Location QR Code Data Format:**
```json
{
  "id": "location-uuid",
  "name": "Safe A - Shelf 2",
  "type": "safe"
}
```

### 3. Auto Build Configurator
**Location:** Inventory Dashboard → "Builds" stat card

**Features:**
- Automatically detect component categories from item names
- Select multiple items to combine into a build
- AI-powered category detection
- Save and load builds

**Auto-Detection Keywords:**
- Upper Receiver: "upper"
- Lower Receiver: "lower"
- Barrel: "barrel"
- Bolt Carrier Group: "bcg", "bolt"
- Trigger: "trigger"
- Stock: "stock"
- Handguard: "handguard", "rail"
- Muzzle Device: "muzzle", "brake"
- Optic: "optic", "scope"
- Sights: "sight"
- Light: "light", "flashlight"
- Sling: "sling"
- Magazine: "magazine", "mag"
- Grip: "grip"

**How to Use:**
1. Click on "Builds" stat card
2. Enter a build name
3. Select items from your inventory
4. Click "Auto-Detect Components"
5. Review and adjust detected categories
6. Click "Save Build"

## Workflow Examples

### Example 1: Labeling New Inventory
1. Add items to inventory via "Add Item" or batch import
2. Click "Print Labels" button
3. Select Avery 5163 format (2" x 4" labels)
4. Choose CODE128 barcode type
5. Export to PDF
6. Print labels on label printer
7. Apply labels to physical items

### Example 2: Organizing by Location
1. Create location labels with QR codes
2. Print and attach labels to storage locations
3. Open item detail modal
4. Click "Scan Location"
5. Scan location QR code
6. Confirm assignment
7. Item now tracked to specific location

### Example 3: Building a Custom Firearm
1. Add all components to inventory
2. Click "Builds" stat card
3. Name your build (e.g., "AR-15 Custom Build")
4. Select components from list
5. Click "Auto-Detect Components"
6. System categorizes each part
7. Save build for tracking

## Technical Details

### Barcode Generation
- Uses JsBarcode library for linear barcodes
- Uses QRCode library for QR codes
- Canvas-based rendering for high quality
- Supports multiple barcode formats

### PDF Export
- Uses jsPDF library
- Generates print-ready PDF files
- Maintains label dimensions
- Supports batch printing

### Database Integration
- Location assignments stored in `inventory_items.location_id`
- Builds stored in `firearm_builds` table
- Transfer history tracked in `inventory_transfers`
- Real-time sync with Supabase

## Best Practices

### Label Printing
- Use QR codes for items with detailed information
- Use CODE128 for simple serial number tracking
- Print test page before full batch
- Use high-quality label stock for durability

### Location Tracking
- Create hierarchical location structure (Building → Room → Container)
- Use consistent naming conventions
- Print backup location codes
- Regular location audits

### Build Management
- Use descriptive build names
- Document build specifications
- Track component costs
- Save multiple configurations

## Troubleshooting

### Labels Not Printing
- Check printer connection and drivers
- Verify label format matches physical labels
- Try PDF export instead of direct print
- Ensure browser has print permissions

### Barcode Scanning Issues
- Ensure good lighting conditions
- Clean camera lens
- Hold steady when scanning
- Try manual entry if scan fails

### Location Assignment Errors
- Verify location exists in database
- Check user permissions
- Ensure valid location QR code format
- Contact admin if location is missing

## Future Enhancements
- Bulk location assignment
- Location capacity tracking
- Build cost calculator
- Label design customization
- NFC tag support
- Mobile app integration
