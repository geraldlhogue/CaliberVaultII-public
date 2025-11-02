#!/usr/bin/env node

/**
 * Git Auto-Commit Script
 * Reads CHANGES_LOG.md and creates organized Git commits
 */

const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const CHANGES_LOG_PATH = path.join(__dirname, '..', 'CHANGES_LOG.md');

function parseChangesLog() {
  const content = fs.readFileSync(CHANGES_LOG_PATH, 'utf-8');
  const sessions = [];
  let currentSession = null;

  const lines = content.split('\n');
  
  for (const line of lines) {
    if (line.startsWith('## Session:')) {
      if (currentSession) sessions.push(currentSession);
      currentSession = {
        date: line.split('Session:')[1].trim(),
        changes: [],
        description: ''
      };
    } else if (line.startsWith('**Description:**') && currentSession) {
      currentSession.description = line.split('**Description:**')[1].trim();
    } else if (line.match(/^\d+\.\s+`(.+?)`/) && currentSession) {
      const match = line.match(/`(.+?)`\s+-\s+(.+)/);
      if (match) {
        currentSession.changes.push({
          file: match[1],
          description: match[2]
        });
      }
    }
  }
  
  if (currentSession) sessions.push(currentSession);
  return sessions;
}

function gitCommit(session) {
  console.log(`\n📝 Creating commit for session: ${session.date}`);
  
  // Add all changed files
  session.changes.forEach(change => {
    try {
      execSync(`git add "${change.file}"`, { stdio: 'inherit' });
      console.log(`  ✓ Added: ${change.file}`);
    } catch (error) {
      console.log(`  ⚠ Warning: Could not add ${change.file}`);
    }
  });

  // Create commit message
  const commitMsg = `${session.description}

Changes:
${session.changes.map(c => `- ${c.file}: ${c.description}`).join('\n')}

Session: ${session.date}`;

  // Commit
  try {
    execSync(`git commit -m "${commitMsg.replace(/"/g, '\\"')}"`, { stdio: 'inherit' });
    console.log(`  ✓ Commit created successfully`);
    return true;
  } catch (error) {
    console.log(`  ⚠ No changes to commit or commit failed`);
    return false;
  }
}

function main() {
  console.log('🚀 Git Auto-Commit Script\n');
  
  if (!fs.existsSync(CHANGES_LOG_PATH)) {
    console.error('❌ CHANGES_LOG.md not found');
    process.exit(1);
  }

  const sessions = parseChangesLog();
  console.log(`Found ${sessions.length} session(s) to commit\n`);

  let committed = 0;
  sessions.forEach(session => {
    if (gitCommit(session)) committed++;
  });

  console.log(`\n✅ Complete! ${committed} commit(s) created`);
  console.log('\nRun: git push origin main');
}

main();
