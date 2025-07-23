import { copyFileSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname } from 'path';
import { glob } from 'glob';

console.log('Copying static assets...');
let copiedCount = 0;

// Process all files except TS, SCSS, and JSON
const allFiles = glob.sync('src/**/*', { nodir: true });
const excludedExtensions = ['.ts', '.scss', '.json'];

allFiles.forEach(file => {
  const fileExtension = file.substring(file.lastIndexOf('.'));
  
  // Skip files with excluded extensions
  if (excludedExtensions.includes(fileExtension)) {
    return;
  }
  
  // Fix the path replacement
  const destFile = file.replace(/^src[\/\\]/, 'dist/');
  const destDir = dirname(destFile);
  
  if (!existsSync(destDir)) {
    mkdirSync(destDir, { recursive: true });
  }
  
  copyFileSync(file, destFile);
  copiedCount++;
  console.log(`Processed: ${file} -> ${destFile}`);
});

// Process JSON files with comment stripping
const jsonFiles = glob.sync('src/**/*.json');

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
    copiedCount++;
    console.log(`Processed: ${file} -> ${destFile}`);
  } catch (error) {
    console.error(`Error processing ${file}:`, error.message);
  }
});

console.log(`Processed ${copiedCount} static files.`);
