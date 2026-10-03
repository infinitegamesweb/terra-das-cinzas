import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const dir = 'D:/Game/maps-titles-assets/novo';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jpg'));

// Group by prefix
const groups = {};
for (const f of files) {
  const prefix = f.replace(/_\d{8,}.*$/, '').replace(/_\d\.jpg$/, '');
  if (!groups[prefix]) groups[prefix] = [];
  groups[prefix].push(f);
}

console.log('Detected asset groups in novo:');
for (const [k, v] of Object.entries(groups)) {
  console.log(`- ${k} (${v.length} files):`);
  for (const item of v) console.log(`    ${item}`);
}
