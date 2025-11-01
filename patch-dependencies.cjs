const fs = require('fs');
const path = require('path');

const patchDependencies = () => {
  const jspdfPackage = path.join(__dirname, 'node_modules/jspdf/package.json');
  const vitePackage = path.join(__dirname, 'node_modules/vite/package.json');

  // Patch jspdf to use dompurify@3.3.0
  if (fs.existsSync(jspdfPackage)) {
    const jspdfJson = JSON.parse(fs.readFileSync(jspdfPackage));
    jspdfJson.dependencies['dompurify'] = '^3.3.0';
    fs.writeFileSync(jspdfPackage, JSON.stringify(jspdfJson, null, 2));
    console.log('Patched jspdf to use dompurify@3.3.0');
  }

  // Patch vite to use esbuild@0.24.2
  if (fs.existsSync(vitePackage)) {
    const viteJson = JSON.parse(fs.readFileSync(vitePackage));
    viteJson.dependencies['esbuild'] = '^0.24.2';
    fs.writeFileSync(vitePackage, JSON.stringify(viteJson, null, 2));
    console.log('Patched vite to use esbuild@0.24.2');
  }
};

patchDependencies();
