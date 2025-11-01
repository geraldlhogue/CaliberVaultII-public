# Bug Report Template

Use this template when reporting bugs to ensure efficient debugging.

---

## Bug Report Format

```
TITLE: [Component] Brief description

PRIORITY: Critical / High / Medium / Low

ENVIRONMENT:
- Browser: [Chrome 120 / Firefox 121 / Safari 17 / etc.]
- Device: [Desktop / iPhone 14 / Android / iPad]
- OS: [Windows 11 / macOS 14 / iOS 17 / Android 13]
- Screen size: [1920x1080 / Mobile]

CURRENT BEHAVIOR:
[What actually happens - be specific]

EXPECTED BEHAVIOR:
[What should happen]

STEPS TO REPRODUCE:
1. Go to Dashboard
2. Click "Add Item"
3. Select "Firearms"
4. Fill in fields...
5. Click "Save"
6. Error appears

ERROR MESSAGE (if any):
```
Copy exact error from console (F12)
```

SCREENSHOTS:
[Attach screenshots if visual issue]

CONSOLE LOGS:
```
Paste relevant console errors (F12 → Console tab)
```

DATABASE STATE (if relevant):
- User ID: [from profile]
- Item ID: [if specific item]
- Table affected: [firearms/bullets/etc.]

ADDITIONAL CONTEXT:
[Any other relevant info]
```

---

## Example Bug Report

```
TITLE: [Dashboard] Category counts showing 0 despite data in database

PRIORITY: High

ENVIRONMENT:
- Browser: Chrome 120
- Device: Desktop
- OS: Windows 11
- Screen size: 1920x1080

CURRENT BEHAVIOR:
Dashboard category cards show "0" for Optics, Ammunition, Magazines, and Accessories even though Database Tools shows records exist.

EXPECTED BEHAVIOR:
Category cards should show actual count from database (Firearms: 30, Ammunition: 12, Optics: 1, Suppressors: 0)

STEPS TO REPRODUCE:
1. Login to CaliberVault
2. View Dashboard
3. Observe category counts
4. Navigate to Database Tools
5. See actual counts differ

ERROR MESSAGE: None

CONSOLE LOGS: None

DATABASE STATE:
- firearms table: 30 records
- bullets table: 12 records
- optics table: 1 record
- suppressors table: 0 records

ADDITIONAL CONTEXT:
Suppressors category is also missing from dashboard entirely.
```

---

## Change Request Format

```
TITLE: [Feature] Brief description

TYPE: New Feature / Enhancement / UI Improvement

CURRENT STATE:
[What exists now]

PROPOSED CHANGE:
[What you want changed]

RATIONALE:
[Why this change is needed]

USER IMPACT:
[Who benefits and how]

PRIORITY: Critical / High / Medium / Low

IMPLEMENTATION NOTES:
[Technical details if you have them]
```

---

## Quick Reference

### Priority Levels
- **Critical**: App broken, data loss, security issue
- **High**: Major feature broken, affects many users
- **Medium**: Minor feature broken, workaround exists
- **Low**: Cosmetic, nice-to-have

### Common Issues & Solutions

**Issue**: Dashboard counts are 0
**Check**: AppContext loading, database connection, RLS policies

**Issue**: Photos not uploading
**Check**: Storage bucket permissions, file size, CORS

**Issue**: Items not saving
**Check**: Console errors, network tab, RLS policies, required fields

**Issue**: Search not working
**Check**: Search query state, filter logic, case sensitivity

**Issue**: Database viewer blank
**Check**: Table names, RLS policies, auth session
