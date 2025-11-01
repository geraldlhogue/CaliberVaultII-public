# API Keys Setup Guide for CaliberVault Cloud Integrations

This guide provides step-by-step instructions for obtaining API keys and OAuth credentials for all cloud storage providers supported by CaliberVault.

---

## 1. Google Drive API Setup

### Step 1: Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Name: "CaliberVault" → Click "Create"

### Step 2: Enable Google Drive API
1. In the left sidebar, go to "APIs & Services" → "Library"
2. Search for "Google Drive API"
3. Click on it and press "Enable"

### Step 3: Create OAuth 2.0 Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. If prompted, configure OAuth consent screen:
   - User Type: External
   - App name: CaliberVault
   - User support email: your email
   - Developer contact: your email
   - Scopes: Add `https://www.googleapis.com/auth/drive.file`
4. Application type: "Web application"
5. Name: "CaliberVault Web Client"
6. Authorized redirect URIs: Add your Supabase function URL:
   - `https://YOUR_PROJECT_REF.supabase.co/functions/v1/oauth-callback`
7. Click "Create"
8. **Copy the Client ID and Client Secret**

### Step 4: Add to Supabase
1. Go to Supabase Dashboard → Project Settings → Edge Functions
2. Add secrets:
   - `GOOGLE_DRIVE_CLIENT_ID`: Your client ID
   - `GOOGLE_DRIVE_CLIENT_SECRET`: Your client secret

---

## 2. Dropbox API Setup

### Step 1: Create Dropbox App
1. Go to [Dropbox App Console](https://www.dropbox.com/developers/apps)
2. Click "Create app"
3. Choose "Scoped access"
4. Choose "Full Dropbox" access
5. Name your app: "CaliberVault"
6. Click "Create app"

### Step 2: Configure Permissions
1. In the "Permissions" tab, enable:
   - `files.metadata.write`
   - `files.metadata.read`
   - `files.content.write`
   - `files.content.read`
2. Click "Submit"

### Step 3: Get Credentials
1. Go to "Settings" tab
2. **Copy the App key** (this is your Client ID)
3. **Copy the App secret** (this is your Client Secret)
4. Add OAuth2 Redirect URIs:
   - `https://YOUR_PROJECT_REF.supabase.co/functions/v1/oauth-callback`

### Step 4: Add to Supabase
1. Go to Supabase Dashboard → Project Settings → Edge Functions
2. Add secrets:
   - `DROPBOX_APP_KEY`: Your app key
   - `DROPBOX_APP_SECRET`: Your app secret

---

## 3. Microsoft OneDrive API Setup

### Step 1: Register Application
1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to "Azure Active Directory" → "App registrations"
3. Click "New registration"
4. Name: "CaliberVault"
5. Supported account types: "Accounts in any organizational directory and personal Microsoft accounts"
6. Redirect URI: Web → `https://YOUR_PROJECT_REF.supabase.co/functions/v1/oauth-callback`
7. Click "Register"

### Step 2: Get Credentials
1. On the app overview page, **copy the Application (client) ID**
2. Go to "Certificates & secrets"
3. Click "New client secret"
4. Description: "CaliberVault Secret"
5. Expires: Choose duration (24 months recommended)
6. Click "Add"
7. **Copy the secret Value immediately** (it won't be shown again)

### Step 3: Configure API Permissions
1. Go to "API permissions"
2. Click "Add a permission" → "Microsoft Graph"
3. Choose "Delegated permissions"
4. Add these permissions:
   - `Files.ReadWrite`
   - `Files.ReadWrite.All`
   - `User.Read`
5. Click "Add permissions"
6. Click "Grant admin consent" (if you have admin rights)

### Step 4: Add to Supabase
1. Go to Supabase Dashboard → Project Settings → Edge Functions
2. Add secrets:
   - `ONEDRIVE_CLIENT_ID`: Your application ID
   - `ONEDRIVE_CLIENT_SECRET`: Your client secret

---

## 4. Box API Setup

### Step 1: Create Box App
1. Go to [Box Developer Console](https://app.box.com/developers/console)
2. Click "Create New App"
3. Select "Custom App"
4. Authentication Method: "Standard OAuth 2.0 (User Authentication)"
5. Name: "CaliberVault"
6. Click "Create App"

### Step 2: Configure App
1. In "Configuration" tab:
2. **Copy the Client ID**
3. **Copy the Client Secret**
4. OAuth 2.0 Redirect URI: Add:
   - `https://YOUR_PROJECT_REF.supabase.co/functions/v1/oauth-callback`
5. Application Scopes: Enable:
   - Read and write all files and folders
   - Manage users
6. Click "Save Changes"

### Step 3: Add to Supabase
1. Go to Supabase Dashboard → Project Settings → Edge Functions
2. Add secrets:
   - `BOX_CLIENT_ID`: Your client ID
   - `BOX_CLIENT_SECRET`: Your client secret

---

## 5. AWS S3 Setup

### Step 1: Create IAM User
1. Go to [AWS IAM Console](https://console.aws.amazon.com/iam/)
2. Click "Users" → "Add users"
3. User name: "calibervault-s3-user"
4. Access type: "Programmatic access"
5. Click "Next: Permissions"

### Step 2: Set Permissions
1. Click "Attach existing policies directly"
2. Search and select "AmazonS3FullAccess" (or create custom policy)
3. Click "Next: Tags" → "Next: Review" → "Create user"

### Step 3: Get Credentials
1. **Copy the Access key ID**
2. **Copy the Secret access key** (shown only once)
3. Download the .csv file as backup

### Step 4: Create S3 Bucket
1. Go to [S3 Console](https://s3.console.aws.amazon.com/)
2. Click "Create bucket"
3. Bucket name: "calibervault-backups-YOUR_NAME"
4. Region: Choose closest to your users
5. Keep default settings or configure as needed
6. Click "Create bucket"

### Step 5: Configure CORS (Optional)
1. Select your bucket
2. Go to "Permissions" → "CORS"
3. Add CORS configuration:
```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": ["ETag"]
    }
]
```

### Step 6: Add to Supabase
1. Go to Supabase Dashboard → Project Settings → Edge Functions
2. Add secrets:
   - `AWS_ACCESS_KEY_ID`: Your access key ID
   - `AWS_SECRET_ACCESS_KEY`: Your secret access key
   - `AWS_S3_BUCKET_NAME`: Your bucket name
   - `AWS_S3_REGION`: Your bucket region (e.g., "us-east-1")

---

## 6. iCloud Drive Setup

**Note**: iCloud Drive does not provide a public API for third-party applications. Apple restricts iCloud access to apps distributed through the App Store with proper entitlements.

### Alternative Approaches:
1. **CloudKit**: Use Apple's CloudKit API (requires Apple Developer account - $99/year)
2. **Manual Sync**: Users can manually export/import files to iCloud Drive folder
3. **WebDAV**: Some users enable iCloud Drive via WebDAV (not officially supported)

### CloudKit Setup (If pursuing):
1. Join [Apple Developer Program](https://developer.apple.com/programs/) ($99/year)
2. Create App ID with CloudKit capability
3. Configure CloudKit dashboard
4. Implement CloudKit JS API

**Recommendation**: Focus on the 5 supported providers (Google Drive, Dropbox, OneDrive, Box, AWS S3) which cover 95%+ of users.

---

## Testing Your Setup

After adding all credentials to Supabase:

1. Go to CaliberVault → Integrations → Cloud Storage
2. Click "Connect" on any provider
3. You should be redirected to the provider's OAuth page
4. Grant permissions
5. You should be redirected back to CaliberVault with "Connected" status

### Troubleshooting:
- **"Invalid redirect URI"**: Ensure redirect URI in provider console matches your Supabase function URL exactly
- **"Invalid client"**: Double-check client ID and secret are correct
- **"Insufficient permissions"**: Ensure all required scopes/permissions are enabled
- **"CORS error"**: Check that your domain is whitelisted in provider settings

---

## Security Best Practices

1. **Never commit credentials to Git**
2. **Use environment variables/secrets management**
3. **Rotate secrets periodically** (every 6-12 months)
4. **Use least privilege principle** (only grant necessary permissions)
5. **Monitor API usage** for unusual activity
6. **Enable MFA** on all provider accounts
7. **Set token expiration** appropriately (refresh tokens)

---

## Rate Limits (as of 2024)

| Provider | Rate Limit | Notes |
|----------|------------|-------|
| Google Drive | 1,000 requests/100 seconds/user | Exponential backoff required |
| Dropbox | 500 requests/hour/app | Per-app limit |
| OneDrive | 10,000 requests/10 minutes/user | Per-user limit |
| Box | 10 requests/second/user | Burst allowed |
| AWS S3 | 3,500 PUT/5,500 GET per second/prefix | Very high limits |

**Implementation**: CaliberVault includes automatic rate limiting and exponential backoff in the cloud storage service.

---

## Support

If you encounter issues:
1. Check the browser console for detailed error messages
2. Verify all credentials are correct in Supabase Edge Functions secrets
3. Ensure redirect URIs match exactly (including https://)
4. Check provider-specific status pages for outages
5. Review the edge function logs in Supabase Dashboard

For provider-specific support:
- Google: https://support.google.com/cloud
- Dropbox: https://www.dropbox.com/developers/support
- Microsoft: https://docs.microsoft.com/en-us/graph/
- Box: https://developer.box.com/support/
- AWS: https://aws.amazon.com/support/
