#!/bin/bash

# CaliberVault Test Directory Update Script
# This script automates downloading, cleaning, and updating your test directory

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  CaliberVault Test Directory Updater  ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Get test directory path
read -p "Enter your test directory path (e.g., ~/Desktop/calibervault-test): " TEST_DIR
TEST_DIR="${TEST_DIR/#\~/$HOME}"  # Expand ~ to home directory

if [ ! -d "$TEST_DIR" ]; then
    echo -e "${RED}Error: Directory $TEST_DIR does not exist!${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Test directory found: $TEST_DIR${NC}"
echo ""

# Get download ZIP path
read -p "Enter path to downloaded ZIP file: " ZIP_FILE
ZIP_FILE="${ZIP_FILE/#\~/$HOME}"

if [ ! -f "$ZIP_FILE" ]; then
    echo -e "${RED}Error: ZIP file $ZIP_FILE not found!${NC}"
    exit 1
fi

echo -e "${GREEN}✓ ZIP file found${NC}"
echo ""

# Create temp directory
TEMP_DIR=$(mktemp -d)
echo -e "${YELLOW}Creating temporary directory: $TEMP_DIR${NC}"
echo ""

# Step 1: Unzip
echo -e "${BLUE}Step 1: Extracting ZIP file...${NC}"
read -p "Continue? (y/n): " confirm
if [ "$confirm" != "y" ]; then
    echo "Cancelled."
    rm -rf "$TEMP_DIR"
    exit 0
fi

unzip -q "$ZIP_FILE" -d "$TEMP_DIR"
EXTRACTED_DIR=$(find "$TEMP_DIR" -mindepth 1 -maxdepth 1 -type d | head -n 1)
echo -e "${GREEN}✓ Extracted to: $EXTRACTED_DIR${NC}"
echo ""

# Step 2: Clean unwanted files
echo -e "${BLUE}Step 2: Removing unwanted files from extracted code...${NC}"
read -p "Continue? (y/n): " confirm
if [ "$confirm" != "y" ]; then
    echo "Cancelled."
    rm -rf "$TEMP_DIR"
    exit 0
fi

cd "$EXTRACTED_DIR"
rm -rf node_modules dist coverage .DS_Store *.log .env .env.local .env.*.local
echo -e "${GREEN}✓ Cleaned unwanted files${NC}"
echo ""

# Step 3: Backup important files
echo -e "${BLUE}Step 3: Backing up .env and node_modules...${NC}"
read -p "Continue? (y/n): " confirm
if [ "$confirm" != "y" ]; then
    echo "Cancelled."
    rm -rf "$TEMP_DIR"
    exit 0
fi

BACKUP_DIR="$TEST_DIR/.backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

if [ -f "$TEST_DIR/.env" ]; then
    cp "$TEST_DIR/.env" "$BACKUP_DIR/.env"
    echo -e "${GREEN}✓ Backed up .env${NC}"
fi

if [ -d "$TEST_DIR/node_modules" ]; then
    echo -e "${YELLOW}Moving node_modules (this may take a moment)...${NC}"
    mv "$TEST_DIR/node_modules" "$BACKUP_DIR/node_modules"
    echo -e "${GREEN}✓ Backed up node_modules${NC}"
fi
echo ""

# Step 4: Copy new files
echo -e "${BLUE}Step 4: Copying new files to test directory...${NC}"
read -p "Continue? (y/n): " confirm
if [ "$confirm" != "y" ]; then
    echo "Cancelled. Restoring backups..."
    if [ -f "$BACKUP_DIR/.env" ]; then
        cp "$BACKUP_DIR/.env" "$TEST_DIR/.env"
    fi
    if [ -d "$BACKUP_DIR/node_modules" ]; then
        mv "$BACKUP_DIR/node_modules" "$TEST_DIR/node_modules"
    fi
    rm -rf "$TEMP_DIR"
    exit 0
fi

rsync -av --exclude='.git' "$EXTRACTED_DIR/" "$TEST_DIR/"
echo -e "${GREEN}✓ Files copied${NC}"
echo ""

# Step 5: Restore .env
if [ -f "$BACKUP_DIR/.env" ]; then
    echo -e "${BLUE}Step 5: Restoring .env file...${NC}"
    cp "$BACKUP_DIR/.env" "$TEST_DIR/.env"
    echo -e "${GREEN}✓ .env restored${NC}"
    echo ""
fi

# Step 6: Restore or reinstall node_modules
echo -e "${BLUE}Step 6: Node modules...${NC}"
echo "Choose an option:"
echo "1) Restore backed up node_modules (faster)"
echo "2) Run fresh npm install (recommended if package.json changed)"
read -p "Enter choice (1 or 2): " choice

cd "$TEST_DIR"

if [ "$choice" = "1" ] && [ -d "$BACKUP_DIR/node_modules" ]; then
    echo -e "${YELLOW}Restoring node_modules...${NC}"
    mv "$BACKUP_DIR/node_modules" "$TEST_DIR/node_modules"
    echo -e "${GREEN}✓ node_modules restored${NC}"
elif [ "$choice" = "2" ] || [ ! -d "$BACKUP_DIR/node_modules" ]; then
    echo -e "${YELLOW}Running npm install...${NC}"
    npm install
    echo -e "${GREEN}✓ npm install complete${NC}"
else
    echo -e "${RED}Invalid choice${NC}"
fi
echo ""

# Cleanup
echo -e "${BLUE}Step 7: Cleanup...${NC}"
read -p "Delete temporary files and backup? (y/n): " confirm
if [ "$confirm" = "y" ]; then
    rm -rf "$TEMP_DIR"
    rm -rf "$BACKUP_DIR"
    echo -e "${GREEN}✓ Cleanup complete${NC}"
else
    echo -e "${YELLOW}Backup kept at: $BACKUP_DIR${NC}"
    rm -rf "$TEMP_DIR"
fi
echo ""

# Final summary
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║         Update Complete! 🎉            ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. cd $TEST_DIR"
echo "2. npm run test"
echo ""
