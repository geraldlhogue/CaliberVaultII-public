import fs from 'fs';
const p = JSON.parse(fs.readFileSync('./tsconfig.json','utf8'));
p.compilerOptions = p.compilerOptions || {};
p.compilerOptions.baseUrl = p.compilerOptions.baseUrl || '.';
p.compilerOptions.paths = p.compilerOptions.paths || {};
p.compilerOptions.paths['@/*'] = ['src/*'];
fs.writeFileSync('./tsconfig.json', JSON.stringify(p,null,2));
console.log('tsconfig.json patched with baseUrl and @/* paths');
