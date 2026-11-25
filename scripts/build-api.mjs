import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
const catalog=readFileSync('dist/catalogs.js','utf8');
writeFileSync('server/catalog.mjs',catalog+'\nexport {shopSlot,catalogForSlot};\n');
const source=readFileSync('server/domain.mjs','utf8')+'\n'+catalog+'\n'+readFileSync('server/worker.mjs','utf8').replace(/^import .*;\n/gm,'');
mkdirSync('dist/server',{recursive:true});writeFileSync('dist/server/index.js',source);
