import chokidar from 'chokidar';
import { execSync } from 'child_process';

console.log('Starting file watcher...');
console.log('Watching src/ directory for changes...');
console.log('Press Ctrl+C to stop watching');

let isBuilding = false;

const watcher = chokidar.watch('src/**/*', {
  ignored: /(^|[\/\\])\../, // ignore dotfiles
  persistent: true,
  ignoreInitial: true
});

function rebuild() {
  if (isBuilding) {
    console.log('Build already in progress, skipping...');
    return;
  }
  
  isBuilding = true;
  console.log('\n🔨 Changes detected, rebuilding...');
  
  try {
    execSync('npm run dev', { stdio: 'inherit' });
    console.log('✅ Build and install complete!\n');
  } catch (error) {
    console.error('❌ Build failed:', error.message);
  } finally {
    isBuilding = false;
  }
}

watcher
  .on('change', path => {
    console.log(`Changed: ${path}`);
    rebuild();
  })
  .on('add', path => {
    console.log(`Added: ${path}`);
    rebuild();
  })
  .on('unlink', path => {
    console.log(`Removed: ${path}`);
    rebuild();
  });
