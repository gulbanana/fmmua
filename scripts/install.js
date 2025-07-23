import { existsSync, rmSync, cpSync } from 'fs';
import { join } from 'path';

console.log('Installing to Foundry VTT...');

let dataPath = "";
if (process.env.FOUNDRY_VTT_DATA_PATH && existsSync(process.env.FOUNDRY_VTT_DATA_PATH)) {
    dataPath = process.env.FOUNDRY_VTT_DATA_PATH;
} else if (process.env.LOCALAPPDATA && existsSync(process.env.LOCALAPPDATA)) {
    dataPath = join(process.env.LOCALAPPDATA, 'FoundryVTT');
} else if (process.env.HOME && existsSync(join(process.env.HOME, 'Library', 'Application Support'))) {
    dataPath = join(process.env.HOME, 'Library', 'Application Support', 'FoundryVTT');
} else {
    throw new Error("FOUNDRY_VTT_DATA_PATH not set and default paths not found");
}

const deployPath = join(dataPath, 'Data', 'systems', 'fmmua');

try {
    // Clean existing installation
    if (existsSync(deployPath)) {
        console.log(`Cleaning existing installation at: ${deployPath}`);
        rmSync(deployPath, { recursive: true, force: true });
    }

    // Copy new build
    console.log(`Copying dist to: ${deployPath}`);
    cpSync('dist', deployPath, { recursive: true });
    
    console.log('Installation complete!');
} catch (error) {
    console.error('Installation failed:', error.message);
    process.exit(1);
}
