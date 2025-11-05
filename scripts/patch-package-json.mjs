import fs from 'fs';
const pkgPath = './package.json';
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts = pkg.scripts || {};
const add = (k, v) => { if (!pkg.scripts[k]) pkg.scripts[k] = v; };

add('test', 'vitest run');
add('test:ci', 'vitest run --reporter=verbose --pool=threads');
add('test:unit', 'vitest run');
add('test:watch', 'vitest --pool=threads');
add('test:coverage', 'vitest run --coverage --pool=threads');
add('typecheck', 'tsc --noEmit');
add('lint', 'eslint .');
add('lint:fix', 'eslint . --fix');
if (!pkg.scripts['build']) pkg.scripts['build'] = 'vite build';

pkg.engines = pkg.engines || {};
pkg.engines.node = '>=22 <26';

fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
console.log('package.json updated');
