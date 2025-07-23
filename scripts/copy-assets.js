import { copyFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { glob } from 'glob';

console.log('Copying static assets...');

// Copy non-TS/SCSS/JSON files
const patterns = [
  'src/**/*.html',
  'src/**/*.svg', 
  'src/**/*.png',
  'src/**/*.js',
  'src/**/*.css',
  'src/**/*.db'
];

let copiedCount = 0;

patterns.forEach(pattern => {
  const files = glob.sync(pattern);
  files.forEach(file => {
    // Fix the path replacement
    const destFile = file.replace(/^src[\/\\]/, 'dist/');
    const destDir = dirname(destFile);
    
    if (!existsSync(destDir)) {
      mkdirSync(destDir, { recursive: true });
    }
    
    copyFileSync(file, destFile);
    copiedCount++;
    console.log(`Copied: ${file} -> ${destFile}`);
  });
});

console.log(`Copied ${copiedCount} static files.`);
