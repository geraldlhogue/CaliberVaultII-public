# How to Find and Open Files on Your MacBook Pro

## Complete Beginner's Guide to File Navigation

---

## Understanding File Locations

### Where is CaliberVault?
Your CaliberVault project is on your Desktop in a folder called "CaliberVault"

**Full path:** `/Users/yourname/Desktop/CaliberVault`

---

## Method 1: Using Finder (Visual Way)

### Step-by-Step:

1. **Click on Desktop**
   - Look at your screen background
   - You should see a folder icon labeled "CaliberVault"

2. **Double-click the CaliberVault folder**
   - This opens the folder

3. **Navigate to Files**
   - You'll see folders like: `src`, `public`, `docs`
   - You'll see files like: `package.json`, `README.md`

4. **Open a File**
   - Double-click any file to open it in default editor
   - Or right-click → "Open With" → choose your editor

### Finding Specific Files:

#### To find `package.json`:
1. Open CaliberVault folder on Desktop
2. Scroll to find `package.json` (alphabetically sorted)
3. Double-click to open

#### To find files in `src` folder:
1. Open CaliberVault folder
2. Double-click `src` folder
3. Navigate through subfolders:
   - `src/components` = UI components
   - `src/pages` = Page files
   - `src/lib` = Utility files

---

## Method 2: Using Terminal (Command Way)

### Navigate to Project:
```bash
cd ~/Desktop/CaliberVault
```

### See All Files:
```bash
ls
```

### See Files with Details:
```bash
ls -la
```

### Open a File in Default Editor:
```bash
open package.json
```

### Open a File in Specific Editor:
```bash
# Open in VS Code
code package.json

# Open in TextEdit
open -a TextEdit package.json

# Open in Xcode
open -a Xcode package.json
```

### Navigate to Subdirectories:
```bash
# Go into src folder
cd src

# Go into components folder
cd components

# Go back up one level
cd ..

# Go back to project root
cd ~/Desktop/CaliberVault
```

---

## Method 3: Using Spotlight Search (Fastest)

### Search for Files:

1. **Press:** `Command + Space`
2. **Type:** Name of file (e.g., "package.json")
3. **Press:** `Enter` to open

### Tips:
- Spotlight searches your entire Mac
- Type partial names: "pack" will find "package.json"
- Shows recent files first

---

## Common File Locations in CaliberVault

### Root Directory Files (in main CaliberVault folder):
```
CaliberVault/
├── package.json          ← Project configuration
├── README.md            ← Project documentation
├── tsconfig.json        ← TypeScript configuration
├── vite.config.ts       ← Build configuration
└── tailwind.config.ts   ← Styling configuration
```

**How to access:** Open CaliberVault folder on Desktop

### Source Code Files (in src folder):
```
CaliberVault/src/
├── components/          ← UI components
├── pages/              ← Page files
├── lib/                ← Utility functions
├── hooks/              ← React hooks
├── types/              ← TypeScript types
└── services/           ← API services
```

**How to access:** 
- Finder: CaliberVault → src
- Terminal: `cd ~/Desktop/CaliberVault/src`

### Component Files (in src/components):
```
CaliberVault/src/components/
├── inventory/          ← Inventory components
├── auth/              ← Login/signup components
├── admin/             ← Admin components
├── testing/           ← Testing components
└── deployment/        ← Deployment components
```

**How to access:**
- Finder: CaliberVault → src → components
- Terminal: `cd ~/Desktop/CaliberVault/src/components`

### Documentation Files (in root and docs):
```
CaliberVault/
├── TESTING_GUIDE.md
├── MOBILE_DEPLOYMENT_GUIDE.md
├── MACBOOK_TERMINAL_BASICS.md
└── docs/
    └── [various documentation files]
```

**How to access:** Open CaliberVault folder on Desktop

---

## Opening Files with Different Editors

### TextEdit (Built-in Mac Editor)
```bash
open -a TextEdit filename.md
```

### VS Code (If Installed)
```bash
code filename.ts
```

### Xcode (For iOS Development)
```bash
open -a Xcode filename.swift
```

### Default Application
```bash
open filename.json
```

---

## Editing Files

### Using Finder:
1. Find the file
2. Right-click on file
3. Choose "Open With"
4. Select your editor (TextEdit, VS Code, etc.)
5. Make changes
6. Press `Command + S` to save
7. Close editor

### Using Terminal:
```bash
# Navigate to file location
cd ~/Desktop/CaliberVault

# Open file
open package.json

# Or open in specific editor
code package.json
```

---

## Understanding File Paths

### Absolute Path (Full Address)
```
/Users/yourname/Desktop/CaliberVault/src/components/AppLayout.tsx
```
- Starts from root of computer
- Always works from anywhere

### Relative Path (From Current Location)
```
./src/components/AppLayout.tsx
```
- Starts from where you are now
- Only works if you're in right folder

### Home Directory Path
```
~/Desktop/CaliberVault
```
- `~` means your home folder
- Shortcut for `/Users/yourname`

---

## Quick Reference: Opening Common Files

### Open package.json:
```bash
cd ~/Desktop/CaliberVault
open package.json
```

### Open AppLayout.tsx:
```bash
cd ~/Desktop/CaliberVault
open src/components/AppLayout.tsx
```

### Open Testing Guide:
```bash
cd ~/Desktop/CaliberVault
open TESTING_GUIDE.md
```

### Open Admin Testing Panel:
```bash
cd ~/Desktop/CaliberVault
open src/components/testing/AdminTestingPanel.tsx
```

---

## Troubleshooting

### "File not found"
**Problem:** Terminal can't find the file
**Fix:**
1. Check you're in right directory: `pwd`
2. List files to see what's there: `ls`
3. Check spelling (case-sensitive!)

### "Permission denied"
**Problem:** Don't have permission to open file
**Fix:**
```bash
# Check file permissions
ls -la filename

# Change permissions (if needed)
chmod +r filename
```

### "Application not found"
**Problem:** Trying to open with app that's not installed
**Fix:**
1. Use default: `open filename`
2. Or install the application first

---

## Tips for Beginners

1. **Use Tab Completion**
   - Type first few letters
   - Press Tab
   - Terminal completes the name

2. **Use Up Arrow**
   - Press Up Arrow to see previous commands
   - Saves retyping

3. **Copy File Paths**
   - Drag file into Terminal
   - Path appears automatically

4. **Use Finder for Browsing**
   - Terminal for commands
   - Finder for visual navigation

5. **Keep Terminal Open**
   - Don't close between commands
   - Saves time navigating

---

## Practice Exercise

Try finding and opening these files:

1. **Find package.json**
   ```bash
   cd ~/Desktop/CaliberVault
   ls
   open package.json
   ```

2. **Find AppLayout.tsx**
   ```bash
   cd ~/Desktop/CaliberVault/src/components
   ls
   open AppLayout.tsx
   ```

3. **Find Testing Guide**
   ```bash
   cd ~/Desktop/CaliberVault
   open TESTING_GUIDE.md
   ```

---

## Next Steps

Once comfortable finding files:
1. Read MACBOOK_TERMINAL_BASICS.md for more Terminal commands
2. Read TESTING_GUIDE.md for testing instructions
3. Read MOBILE_DEPLOYMENT_GUIDE.md for deployment process

---

**Remember:** 
- Finder = Visual way to find files
- Terminal = Command way to find files
- Spotlight = Search way to find files

Use whichever method feels most comfortable!
