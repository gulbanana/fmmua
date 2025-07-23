import { existsSync, mkdirSync } from 'fs';
import { execSync } from 'child_process';
import { resolve } from 'path';

console.log('Creating release package...');

const releaseDir = 'rel';

try {
    // Ensure release directory exists
    if (!existsSync(releaseDir)) {
        mkdirSync(releaseDir);
    }
    
    const distPath = resolve('dist');
    const zipPath = resolve('rel', 'fmmua.zip');
    
    // Use PowerShell Compress-Archive for cross-platform compatibility
    const command = `powershell -Command "Compress-Archive -Path '${distPath}\\*' -DestinationPath '${zipPath}' -Force"`;
    execSync(command, { stdio: 'inherit' });
    
    console.log('✓ Release package created: rel/fmmua.zip');
} catch (error) {
    console.error('❌ Release packaging failed:', error.message);
    console.log('Note: This script requires PowerShell on Windows');
    process.exit(1);
}
