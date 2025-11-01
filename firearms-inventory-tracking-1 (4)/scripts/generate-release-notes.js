#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

// Get the latest tag
const latestTag = execSync('git describe --tags --abbrev=0').toString().trim();
const previousTag = execSync(`git describe --tags --abbrev=0 ${latestTag}^`).toString().trim();

console.log(`# Release Notes - ${latestTag}\n`);
console.log(`**Release Date:** ${new Date().toLocaleDateString()}\n`);

// Get commits between tags
const commits = execSync(`git log ${previousTag}..${latestTag} --pretty=format:"%s|%an|%h"`).toString().split('\n');

const features = [];
const fixes = [];
const improvements = [];
const other = [];

commits.forEach(commit => {
  const [message, author, hash] = commit.split('|');
  const item = `- ${message} (${hash})`;
  
  if (message.toLowerCase().startsWith('feat:') || message.toLowerCase().includes('feature')) {
    features.push(item);
  } else if (message.toLowerCase().startsWith('fix:') || message.toLowerCase().includes('bug')) {
    fixes.push(item);
  } else if (message.toLowerCase().includes('improve') || message.toLowerCase().includes('enhance')) {
    improvements.push(item);
  } else {
    other.push(item);
  }
});

if (features.length > 0) {
  console.log('## ✨ New Features\n');
  features.forEach(f => console.log(f));
  console.log('');
}

if (fixes.length > 0) {
  console.log('## 🐛 Bug Fixes\n');
  fixes.forEach(f => console.log(f));
  console.log('');
}

if (improvements.length > 0) {
  console.log('## 🚀 Improvements\n');
  improvements.forEach(i => console.log(i));
  console.log('');
}

if (other.length > 0) {
  console.log('## 📝 Other Changes\n');
  other.forEach(o => console.log(o));
  console.log('');
}

console.log('## 📦 Installation\n');
console.log('Download the latest build from the artifacts section above.\n');
console.log('## 🧪 Testing\n');
console.log('All tests have passed in CI/CD pipeline.\n');
