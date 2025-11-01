# Automated Backup System Guide

## Overview
CaliberVault includes a comprehensive automated backup system that protects your inventory data with scheduled backups, multiple backup strategies, and easy restoration.

## Features

### 1. Backup Strategies
- **Full Backup**: Complete snapshot of all data
- **Incremental Backup**: Only changes since last backup
- **Scheduled Backups**: Automatic backups on a schedule
- **Manual Backups**: On-demand backup creation

### 2. Backup Schedule Options
- **Hourly**: For critical data changes
- **Daily**: Recommended for most users
- **Weekly**: For stable inventories
- **Monthly**: For archival purposes

### 3. Backup Contents
All backups include:
- Inventory items (all categories)
- Firearm details
- Optics details
- Suppressor details
- Ammunition details
- User preferences
- Custom fields

## Usage

### Access the Backup System
1. Navigate to Admin → Backup & Recovery
2. Click "Automated Backup" tab

### Configure Backup Schedule
1. Select backup frequency (hourly, daily, weekly, monthly)
2. Click "Enable Schedule"
3. System will automatically backup at specified intervals

### Run Manual Backup
1. Click "Run Full Backup" for complete backup
2. Click "Run Incremental Backup" for changes only
3. Backup file downloads automatically

### Restore from Backup
1. Go to Backup History
2. Find the backup you want to restore
3. Click "Restore" button
4. Confirm restoration
5. System restores all data from backup

## Backup File Format
Backups are stored as JSON files:
```json
{
  "inventory": [...],
  "firearms": [...],
  "optics": [...],
  "suppressors": [...],
  "ammunition": [...],
  "metadata": {
    "timestamp": "2025-10-30T17:21:00Z",
    "type": "full",
    "version": "1.0"
  }
}
```

## Cloud Backup Integration

### Supabase Storage
```typescript
import { supabase } from '@/lib/supabase';

async function uploadBackup(backupData: any) {
  const blob = new Blob([JSON.stringify(backupData)], { type: 'application/json' });
  const fileName = `backup-${Date.now()}.json`;
  
  const { error } = await supabase.storage
    .from('backups')
    .upload(fileName, blob);
    
  if (error) throw error;
}
```

### Google Drive Integration
```typescript
// Configure in Admin → Integrations → Cloud Storage
// Backups automatically sync to Google Drive
```

## Best Practices

1. **Regular Backups**: Enable daily backups minimum
2. **Test Restores**: Periodically test backup restoration
3. **Multiple Locations**: Store backups in multiple locations
4. **Retention Policy**: Keep at least 30 days of backups
5. **Verify Backups**: Check backup file integrity regularly

## Backup Verification

### Automatic Verification
The system automatically verifies:
- Backup file integrity
- Data completeness
- JSON structure validity
- Required fields present

### Manual Verification
```typescript
async function verifyBackup(backupFile: File) {
  const text = await backupFile.text();
  const data = JSON.parse(text);
  
  // Check required tables
  const required = ['inventory', 'firearms', 'optics'];
  for (const table of required) {
    if (!data[table]) throw new Error(`Missing ${table} data`);
  }
  
  return true;
}
```

## Troubleshooting

### Backup Failed
- Check database connection
- Verify sufficient storage space
- Review error logs in console
- Try manual backup first

### Restore Failed
- Verify backup file integrity
- Check file format (must be JSON)
- Ensure backup is from compatible version
- Contact support if issue persists

### Large Backup Files
- Use incremental backups
- Compress backup files
- Clean up old/unused data
- Archive historical data separately

## Automation Scripts

### Cron Job (Linux/Mac)
```bash
# Daily backup at 2 AM
0 2 * * * curl -X POST https://your-app.com/api/backup
```

### Windows Task Scheduler
1. Open Task Scheduler
2. Create Basic Task
3. Set trigger (daily at 2 AM)
4. Action: Start a program
5. Program: curl.exe
6. Arguments: -X POST https://your-app.com/api/backup

## Files
- `src/components/backup/AutomatedBackupScheduler.tsx` - Backup scheduler UI
- `src/components/backup/BackupRecovery.tsx` - Restore functionality
- `src/components/backup/EnhancedBackupSystem.tsx` - Advanced backup features
