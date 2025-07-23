import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname } from 'path';
import { glob } from 'glob';

console.log('Processing JSON files...');

// Strip JSON comments and copy
const jsonFiles = glob.sync('src/**/*.json');
let processedCount = 0;

jsonFiles.forEach(file => {
  try {
    const content = readFileSync(file, 'utf8');
    
    // Strip comments using a more robust approach
    let stripped = content;
    
    // Remove /* */ style comments
    stripped = stripped.replace(/\/\*[\s\S]*?\*\//g, '');
    
    // Remove // style comments (but preserve URLs)
    stripped = stripped.replace(/(?<!:)\/\/.*$/gm, '');
    
    // Clean up extra whitespace but preserve structure
    stripped = stripped.replace(/\n\s*\n/g, '\n');
    
    // Fix the path replacement
    const destFile = file.replace(/^src[\/\\]/, 'dist/');
    const destDir = dirname(destFile);
    
    if (!existsSync(destDir)) {
      mkdirSync(destDir, { recursive: true });
    }
    
    writeFileSync(destFile, stripped);
    processedCount++;
    console.log(`Processed: ${file} -> ${destFile}`);
  } catch (error) {
    console.error(`Error processing ${file}:`, error.message);
  }
});

console.log(`Processed ${processedCount} JSON files.`);
