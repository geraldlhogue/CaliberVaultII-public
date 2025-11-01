# MacBook Terminal Basics for Complete Beginners

## What is Terminal?
Terminal is a text-based application that lets you control your Mac using typed commands instead of clicking. Think of it like texting with your computer.

---

## Opening Terminal

### Method 1: Spotlight Search (Easiest)
1. Press `Command + Space` on your keyboard
2. Type: `terminal`
3. Press `Enter`

### Method 2: Finder
1. Open Finder
2. Click "Applications" in sidebar
3. Open "Utilities" folder
4. Double-click "Terminal"

---

## Understanding Your Terminal Window

When you open Terminal, you'll see something like:
```
MacBook-Pro:~ username$
```

This is called the "prompt" - it's waiting for you to type a command.

**What it means:**
- `MacBook-Pro` = Your computer's name
- `~` = You're in your home folder
- `username` = Your Mac username
- `$` = Ready for a command

---

## Basic Navigation Commands

### See Where You Are
```bash
pwd
```
**What it does**: Shows your current location (folder path)
**Example output**: `/Users/yourname`

### List Files in Current Folder
```bash
ls
```
**What it does**: Shows all files and folders where you are
**Example output**: `Desktop  Documents  Downloads  Pictures`

### List Files with Details
```bash
ls -la
```
**What it does**: Shows files with more information (size, date, permissions)

### Go to Desktop
```bash
cd Desktop
```
**What it does**: Changes to your Desktop folder
**Note**: After this, your prompt will show `~/Desktop$`

### Go to a Specific Folder
```bash
cd ~/Desktop/CaliberVault
```
**What it does**: Goes directly to CaliberVault folder on Desktop

### Go Up One Folder
```bash
cd ..
```
**What it does**: Moves up one level (like clicking "back" in Finder)

### Go to Home Folder
```bash
cd ~
```
**What it does**: Takes you to your home folder

---

## Working with CaliberVault

### Navigate to Your Project
```bash
cd ~/Desktop/CaliberVault
```
**Type this exactly** - it goes to CaliberVault on your Desktop

### Check You're in Right Place
```bash
pwd
```
**Should show**: `/Users/yourname/Desktop/CaliberVault`

### See Project Files
```bash
ls
```
**You should see**: `package.json`, `src`, `public`, etc.

---

## Running CaliberVault Commands

### Install Dependencies (First Time Only)
```bash
npm install
```
**What it does**: Downloads all required code libraries
**When to use**: First time setting up, or after pulling new code
**How long**: 2-5 minutes
**What you'll see**: Lots of text scrolling, then "added XXX packages"

### Start Development Server
```bash
npm run dev
```
**What it does**: Starts the app for testing
**When to use**: Every time you want to test the app
**What you'll see**: "Local: http://localhost:5173"
**How to stop**: Press `Control + C`

### Run Tests
```bash
npm test
```
**What it does**: Runs automated tests
**What you'll see**: Test results showing pass/fail

### Build for Production
```bash
npm run build
```
**What it does**: Creates optimized version for deployment
**When to use**: Before deploying to production
**How long**: 1-2 minutes

### Check Test Coverage
```bash
npm run test:coverage
```
**What it does**: Shows how much of your code is tested
**What you'll see**: Percentage coverage report

---

## Common Terminal Shortcuts

### Stop a Running Command
Press: `Control + C`
**Use when**: You want to stop the dev server or cancel a command

### Clear the Screen
```bash
clear
```
**Or press**: `Command + K`
**What it does**: Clears all text from Terminal window

### Previous Command
Press: `Up Arrow`
**What it does**: Shows the last command you typed
**Tip**: Keep pressing up to go through command history

### Auto-Complete
Start typing a command or folder name, then press `Tab`
**Example**: Type `cd Des` then press `Tab` → becomes `cd Desktop/`

### Cancel Current Line
Press: `Control + C`
**Use when**: You started typing wrong command

---

## Understanding File Paths

### Absolute Path (Full Address)
```bash
/Users/yourname/Desktop/CaliberVault
```
**Starts with `/`** = Full path from computer root

### Relative Path (From Current Location)
```bash
./src/components
```
**Starts with `./`** = From where you are now

### Home Directory Shortcut
```bash
~/Desktop
```
**`~` means** = Your home folder (`/Users/yourname`)

### Parent Directory
```bash
../
```
**`..` means** = One folder up

---

## Common Mistakes and Fixes

### "Command not found"
**Problem**: Terminal doesn't recognize the command
**Fix**: 
1. Check spelling (commands are case-sensitive)
2. Make sure you're in the right folder
3. For npm commands, run `npm install` first

### "No such file or directory"
**Problem**: Trying to go to a folder that doesn't exist
**Fix**:
1. Use `ls` to see what folders exist
2. Check spelling (case-sensitive!)
3. Use `pwd` to see where you are

### Can't Stop a Running Command
**Problem**: Command keeps running
**Fix**: Press `Control + C` (not Command!)

### Terminal Frozen
**Problem**: Nothing happens when you type
**Fix**: Press `Control + C` then try again

---

## Step-by-Step: First Time Setup

### 1. Open Terminal
- Press `Command + Space`
- Type `terminal`
- Press `Enter`

### 2. Navigate to Project
```bash
cd ~/Desktop/CaliberVault
```
**Press Enter after typing**

### 3. Verify Location
```bash
pwd
```
**Should show your CaliberVault path**

### 4. Install Dependencies
```bash
npm install
```
**Wait for it to finish (2-5 minutes)**

### 5. Start Development Server
```bash
npm run dev
```
**Look for the localhost URL**

### 6. Open in Browser
- Open browser
- Go to: `http://localhost:5173`
- You should see CaliberVault!

---

## Step-by-Step: Daily Development

### Every Time You Work on CaliberVault:

1. **Open Terminal**
   ```bash
   Command + Space → type "terminal" → Enter
   ```

2. **Go to Project**
   ```bash
   cd ~/Desktop/CaliberVault
   ```

3. **Start Dev Server**
   ```bash
   npm run dev
   ```

4. **Open Browser**
   - Go to `http://localhost:5173`

5. **When Done**
   - Press `Control + C` in Terminal
   - Type `exit` to close Terminal

---

## Step-by-Step: Running Tests

### Before Deploying:

1. **Open Terminal and Navigate**
   ```bash
   cd ~/Desktop/CaliberVault
   ```

2. **Run Tests**
   ```bash
   npm test
   ```

3. **Check Coverage**
   ```bash
   npm run test:coverage
   ```

4. **If Tests Pass**
   ```bash
   npm run build
   ```

---

## Copy-Paste Commands

You can copy commands from this guide and paste into Terminal:
- **Copy**: Select text, press `Command + C`
- **Paste in Terminal**: Press `Command + V`
- **Press Enter** to run the command

---

## Terminal Cheat Sheet

### Navigation
| Command | What It Does |
|---------|-------------|
| `pwd` | Show current location |
| `ls` | List files here |
| `cd Desktop` | Go to Desktop |
| `cd ..` | Go up one folder |
| `cd ~` | Go to home folder |

### CaliberVault Commands
| Command | What It Does |
|---------|-------------|
| `npm install` | Install dependencies |
| `npm run dev` | Start dev server |
| `npm test` | Run tests |
| `npm run build` | Build for production |
| `npm run test:coverage` | Check test coverage |

### Terminal Control
| Shortcut | What It Does |
|----------|-------------|
| `Control + C` | Stop current command |
| `Command + K` | Clear screen |
| `Up Arrow` | Previous command |
| `Tab` | Auto-complete |

---

## Practice Exercise

Try these commands in order to practice:

1. Open Terminal
2. Type: `pwd` (see where you are)
3. Type: `ls` (see what's here)
4. Type: `cd Desktop` (go to Desktop)
5. Type: `ls` (see Desktop files)
6. Type: `cd ..` (go back)
7. Type: `clear` (clear screen)

**Congratulations!** You now know basic Terminal commands!

---

## Getting Help

### In Terminal
```bash
man ls
```
**What it does**: Shows manual (help) for `ls` command
**To exit**: Press `q`

### Command Help
```bash
npm --help
```
**What it does**: Shows all npm commands

---

## Important Notes

1. **Case Sensitive**: `Desktop` and `desktop` are different!
2. **Spaces Matter**: Use exact spacing in commands
3. **Press Enter**: Commands don't run until you press Enter
4. **Control vs Command**: Terminal uses `Control`, not `Command`
5. **Can't Undo**: Terminal commands can't be undone - be careful!

---

## Next Steps

Once comfortable with these basics:
1. Read TESTING_GUIDE.md for testing instructions
2. Read MOBILE_DEPLOYMENT_GUIDE.md for deployment
3. Read FEATURE_LOCATION_GUIDE.md to find features

---

**Remember**: Everyone starts as a beginner! Practice these commands and they'll become second nature. Keep this guide open while you work!
