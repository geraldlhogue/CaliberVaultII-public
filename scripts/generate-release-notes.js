#!/usr/bin/env node

/**
 * Generate Release Notes from CHANGES_LOG.md
 * 
 * This script parses the changes log and generates formatted release notes
 * for GitHub releases, changelog files, and deployment summaries.
 */

const fs = require('fs');
const path = require('path');

function generateReleaseNotes() {
  const changesLogPath = path.join(process.cwd(), 'CHANGES_LOG.md');
  
  if (!fs.existsSync(changesLogPath)) {
    console.error('❌ CHANGES_LOG.md not found');
    process.exit(1);
  }

  const content = fs.readFileSync(changesLogPath, 'utf-8');
  
  // Extract latest session
  const sessionMatch = content.match(/## Session: (.+?)\n([\s\S]+?)(?=\n## Session:|$)/);
  
  if (!sessionMatch) {
    console.error('❌ No sessions found in CHANGES_LOG.md');
    process.exit(1);
  }

  const [, sessionDate, sessionContent] = sessionMatch;
  
  // Extract changes
  const changes = {
    added: [],
    modified: [],
    fixed: [],
    removed: []
  };

  const lines = sessionContent.split('\n');
  let currentFile = '';
  
  for (const line of lines) {
    if (line.startsWith('### File:')) {
      currentFile = line.replace('### File:', '').trim();
    } else if (line.startsWith('- ')) {
      const change = line.substring(2).trim();
      if (change.toLowerCase().includes('created') || change.toLowerCase().includes('added')) {
        changes.added.push(change);
      } else if (change.toLowerCase().includes('fixed')) {
        changes.fixed.push(change);
      } else if (change.toLowerCase().includes('removed')) {
        changes.removed.push(change);
      } else {
        changes.modified.push(change);
      }
    }
  }

  // Generate release notes
  const version = `v${new Date().toISOString().split('T')[0].replace(/-/g, '.')}`;
  
  let releaseNotes = `# Release ${version}\n\n`;
  releaseNotes += `**Release Date**: ${sessionDate}\n\n`;
  
  if (changes.added.length > 0) {
    releaseNotes += `## ✨ New Features\n\n`;
    changes.added.forEach(change => {
      releaseNotes += `- ${change}\n`;
    });
    releaseNotes += '\n';
  }

  if (changes.modified.length > 0) {
    releaseNotes += `## 🔄 Changes\n\n`;
    changes.modified.forEach(change => {
      releaseNotes += `- ${change}\n`;
    });
    releaseNotes += '\n';
  }

  if (changes.fixed.length > 0) {
    releaseNotes += `## 🐛 Bug Fixes\n\n`;
    changes.fixed.forEach(change => {
      releaseNotes += `- ${change}\n`;
    });
    releaseNotes += '\n';
  }

  if (changes.removed.length > 0) {
    releaseNotes += `## 🗑️ Removed\n\n`;
    changes.removed.forEach(change => {
      releaseNotes += `- ${change}\n`;
    });
    releaseNotes += '\n';
  }

  // Write release notes
  const releaseNotesPath = path.join(process.cwd(), 'RELEASE_NOTES.md');
  fs.writeFileSync(releaseNotesPath, releaseNotes);
  
  console.log('✅ Release notes generated successfully!');
  console.log(`📝 File: ${releaseNotesPath}`);
  console.log('\n' + releaseNotes);
}

// Run if called directly
if (require.main === module) {
  generateReleaseNotes();
}

module.exports = { generateReleaseNotes };
