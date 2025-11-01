# CaliberVault - Complete Beginner's Guide

## 👋 Welcome!

This guide is for someone who has **ZERO experience with Terminal or coding**. We'll walk through everything step-by-step.

---

## 📦 What You Have

You have a folder called **CaliberVault** somewhere on your MacBook Pro. This folder contains all the code for your firearms inventory app.

**Common locations:**
- Desktop (most likely)
- Documents folder
- Downloads folder

---

## 🎯 What You Need to Do

There are 4 main tasks you'll do regularly:

1. **Run the app locally** (to test on your computer)
2. **Run tests** (to make sure nothing is broken)
3. **Deploy to web** (to test on your iPhone/Android)
4. **Create releases** (to save versions)

---

## 🚀 Getting Started (One-Time Setup)

### Step 1: Install Node.js

1. Open Safari
2. Go to: https://nodejs.org/
3. Click the big green button that says "Download"
4. Open the downloaded file
5. Follow the installer (click "Continue" and "Install")
6. Enter your Mac password when asked

### Step 2: Open Terminal

**Method 1 (Easiest):**
1. Press `Command (⌘) + Space` on your keyboard
2. Type: `terminal`
3. Press `Enter`

**Method 2:**
1. Open Finder
2. Go to Applications → Utilities
3. Double-click Terminal

### Step 3: Find Your Project

In Terminal, type these commands one at a time:

**If CaliberVault is on your Desktop:**
```bash
cd ~/Desktop/CaliberVault
```

**If CaliberVault is in Documents:**
```bash
cd ~/Documents/CaliberVault
```

**If CaliberVault is in Downloads:**
```bash
cd ~/Downloads/CaliberVault
```

**To verify you're in the right place:**
```bash
ls
```

You should see files like: `package.json`, `src`, `public`

### Step 4: Install Dependencies (One Time Only)

```bash
npm install
```

This takes 2-3 minutes. Wait for it to finish.

---

## 💻 Running the App Locally

### Every time you want to test the app on your computer:

1. **Open Terminal** (Command + Space, type "terminal")

2. **Go to your project:**
   ```bash
   cd ~/Desktop/CaliberVault
   ```
   (Or wherever your project is)

3. **Start the app:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   - Terminal will show a URL like: `http://localhost:5173`
   - Press `Command (⌘)` and click the URL
   - Or open Safari and go to: `http://localhost:5173`

5. **Test your app!**

6. **When done, stop the app:**
   - Go back to Terminal
   - Press `Control (⌃) + C`

---

## 🧪 Running Tests

### Before deploying to your phone, always run tests:

1. **Open Terminal**

2. **Go to your project:**
   ```bash
   cd ~/Desktop/CaliberVault
   ```

3. **Run tests:**
   ```bash
   npm test
   ```

4. **Wait for results:**
   - Green text = Tests passed ✅
   - Red text = Tests failed ❌ (don't deploy yet)

---

## 📱 Deploying to iPhone/Android

### Complete process:

1. **Update version number:**
   - Open `package.json` in a text editor
   - Find: `"version": "1.0.0"`
   - Change to: `"version": "1.0.1"` (or next number)
   - Save the file

2. **Run tests:**
   ```bash
   npm test
   ```

3. **Build the app:**
   ```bash
   npm run build
   ```

4. **Deploy to hosting:**
   ```bash
   git add .
   git commit -m "Version 1.0.1 - [describe what changed]"
   git push
   ```

5. **Wait 2-3 minutes** for automatic deployment

6. **Test on iPhone:**
   - Open Safari
   - Go to your app URL
   - Tap Share → Add to Home Screen

7. **Test on Android:**
   - Open Chrome
   - Go to your app URL
   - Tap Menu → Add to Home screen

**See MOBILE_DEPLOYMENT_GUIDE.md for detailed instructions**

---

## 📝 Creating a Release

### When you want to save a version:

1. **Make sure version is updated** in package.json

2. **Commit your changes:**
   ```bash
   git add .
   git commit -m "chore: Bump version to 1.2.0"
   ```

3. **Create a tag:**
   ```bash
   git tag v1.2.0
   ```

4. **Push the tag:**
   ```bash
   git push origin v1.2.0
   ```

5. **Check GitHub:**
   - Go to your repository on GitHub.com
   - Click "Actions" to see it building
   - Click "Releases" to see the final release

---

## 🗂️ Understanding the File Structure

```
CaliberVault/
├── src/                    ← Your app code
│   ├── components/         ← UI components
│   ├── pages/             ← Different pages
│   └── services/          ← Backend logic
├── public/                ← Static files
├── .github/workflows/     ← Automated testing
├── package.json           ← Project info & version
└── README.md             ← Project documentation
```

**Files you'll edit most:**
- `package.json` - To update version
- `public/manifest.json` - To update version
- Files in `src/` - When adding features

---

## 📚 Documentation Quick Reference

### For Complete Beginners:
- **MACBOOK_TERMINAL_BASICS.md** - Terminal basics
- **NEW_USER_ONBOARDING_GUIDE.md** - This file

### For Testing:
- **TERMINAL_COMMANDS_GUIDE.md** - All commands
- **TESTING_GUIDE.md** - How to test
- **AUTOMATED_TESTING_GUIDE.md** - Automated testing
- **TESTING_NEW_SYSTEMS.md** - Testing new features

### For Deployment:
- **MOBILE_DEPLOYMENT_GUIDE.md** - iPhone/Android deployment
- **BUILD_INSTRUCTIONS.md** - Building the app

### For Features:
- **FEATURE_LOCATION_GUIDE.md** - Where everything is
- **QUICK_REFERENCE.md** - Quick tips
- **USER_GUIDE.md** - Using the app

---

## 🆘 Common Problems & Solutions

### "Command not found: npm"
**Problem:** Node.js not installed
**Solution:** Install Node.js from https://nodejs.org/

### "No such file or directory"
**Problem:** You're not in the right folder
**Solution:**
```bash
pwd  # See where you are
cd ~/Desktop/CaliberVault  # Go to project
```

### "Port 5173 already in use"
**Problem:** App is already running
**Solution:**
```bash
# Stop the running app
Control + C

# Or kill the process
killall node

# Then start again
npm run dev
```

### "Tests are failing"
**Problem:** Code has errors
**Solution:**
1. Read the error message
2. Check what file has the problem
3. Fix the issue
4. Run tests again

### "App not updating on phone"
**Problem:** Cache not cleared
**Solution:**
1. Delete app from home screen
2. Clear browser cache
3. Re-add app from browser

---

## ✅ Daily Workflow Checklist

### When starting work:
- [ ] Open Terminal
- [ ] Navigate to project: `cd ~/Desktop/CaliberVault`
- [ ] Start app: `npm run dev`
- [ ] Open browser to localhost:5173

### When making changes:
- [ ] Make your changes in code
- [ ] Save files
- [ ] Check browser (auto-refreshes)
- [ ] Test the feature

### When done for the day:
- [ ] Run tests: `npm test`
- [ ] Stop app: Control + C
- [ ] Commit changes: `git add . && git commit -m "description"`
- [ ] Push to GitHub: `git push`

### Before deploying to phone:
- [ ] Update version in package.json
- [ ] Run tests: `npm test`
- [ ] Build: `npm run build`
- [ ] Push to GitHub: `git push`
- [ ] Wait for deployment
- [ ] Test on iPhone
- [ ] Test on Android
- [ ] Log results

---

## 🎓 Learning Resources

### Terminal Basics:
- **MACBOOK_TERMINAL_BASICS.md** - Start here!

### Git Basics:
- Commit: Save your changes
- Push: Upload to GitHub
- Pull: Download from GitHub
- Tag: Mark a version

### Version Numbers:
- **1.0.0** → **1.0.1** = Bug fix
- **1.0.0** → **1.1.0** = New feature
- **1.0.0** → **2.0.0** = Major change

---

## 💡 Pro Tips

### Terminal Shortcuts:
- `Command + K` - Clear screen
- `Control + C` - Stop current command
- `Tab` - Auto-complete file/folder names
- `↑` (Up arrow) - Previous command

### Faster Navigation:
Save this in a file called `shortcuts.sh`:
```bash
alias cv="cd ~/Desktop/CaliberVault"
alias start="npm run dev"
alias test="npm test"
```

Then you can just type: `cv` to go to your project!

### Keep Notes:
Create a file called `WORK_LOG.md` and track:
- What you changed
- What version
- What date
- Any issues

---

## 🎉 You're Ready!

You now know how to:
- ✅ Open Terminal
- ✅ Navigate to your project
- ✅ Run the app locally
- ✅ Run tests
- ✅ Deploy to your phone
- ✅ Create releases

**Next steps:**
1. Read MACBOOK_TERMINAL_BASICS.md
2. Try running the app locally
3. Make a small change and test it
4. Deploy to your phone

**You've got this! 🚀**
