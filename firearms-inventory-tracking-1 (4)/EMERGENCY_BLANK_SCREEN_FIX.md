# 🚨 EMERGENCY BLANK SCREEN FIX

## Problem
App shows blank white screen with no sign-in page.

## Immediate Actions Taken

### 1. ✅ Fixed AdminDashboard Component
**File:** `src/components/admin/AdminDashboard.tsx`
- Made SimpleDatabaseTest lazy-loaded to prevent blocking app startup
- Wrapped in Suspense boundary with fallback
- Fixed missing UnitOfMeasureManager import
- Only loads diagnostic tools when "Test" button is clicked

### 2. ✅ Created Diagnostic Screen
**File:** `src/components/DiagnosticScreen.tsx`
- Tests React rendering
- Checks environment variables
- Tests Supabase connection
- Checks authentication status

### 3. ✅ Completed RLS Migration
**File:** `supabase/migrations/020_comprehensive_rls_fix.sql`
- Complete RLS policies for all tables
- Ready to run via Supabase dashboard

### 4. ✅ Fixed Missing Cartridge Columns
**File:** `supabase/migrations/021_add_cartridge_columns.sql`
- Adds case_length, oal, primer_size columns
- Fixes PGRST204 error

## Troubleshooting Steps

### Step 1: Clear Cache and Reload
```bash
# Hard refresh in browser
Ctrl+Shift+R (Windows/Linux)
Cmd+Shift+R (Mac)

# Or clear all browser cache
```

### Step 2: Check Browser Console
1. Open DevTools (F12)
2. Go to Console tab
3. Look for RED error messages
4. **Share the full error text**

### Step 3: Verify Environment Variables
Check your `.env` file has:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Step 4: Test with Diagnostic Screen
Temporarily modify `src/pages/Index.tsx`:
```typescript
import { DiagnosticScreen } from '@/components/DiagnosticScreen';

const Index = () => {
  return <DiagnosticScreen />;
};
```

### Step 5: Run Database Migrations
In Supabase SQL Editor, run:
1. `020_comprehensive_rls_fix.sql`
2. `021_add_cartridge_columns.sql`

## Common Causes

### 1. Build/Bundle Errors
- Check terminal for build errors
- Try: `npm run build` to see if build succeeds

### 2. Import Errors
- All imports have been verified
- SimpleDatabaseTest is now lazy-loaded

### 3. Supabase Connection
- Verify Supabase project is active
- Check API keys are correct
- Test connection in Supabase dashboard

### 4. Browser Issues
- Try different browser
- Try incognito/private mode
- Disable browser extensions

## If Still Blank

### Option A: Safe Mode
Comment out AdminDashboard in `src/components/AppLayout.tsx`:
```typescript
// Line ~806
<TabsContent value="admin">
  {/* <AdminDashboard /> */}
  <div>Admin temporarily disabled</div>
</TabsContent>
```

### Option B: Minimal Test
Replace `src/App.tsx` content with:
```typescript
function App() {
  return <div className="p-8 bg-slate-900 text-white min-h-screen">
    <h1 className="text-3xl">App is loading!</h1>
  </div>;
}
export default App;
```

If this shows, the issue is in a component. If not, it's a build/env issue.

## Report Back
Please share:
1. Browser console errors (screenshot or text)
2. Which step above worked or failed
3. Any error messages from terminal
4. Browser and OS you're using
