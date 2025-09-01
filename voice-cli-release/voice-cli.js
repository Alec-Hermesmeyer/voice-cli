#!/usr/bin/env node

/**
 * Voice Command CLI Tool
 * 
 * A standalone command-line tool that allows users to control their computer
 * using voice commands. No complex setup required - just install and speak!
 * 
 * Usage:
 *   voice-cli                    # Start voice listening mode
 *   voice-cli "open browser"     # Execute single command
 *   voice-cli --setup           # Initial configuration
 *   voice-cli --help            # Show all commands
 */

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// CLI Configuration
const CONFIG_FILE = path.join(os.homedir(), '.voice-cli-config.json');
const VERSION = '1.0.0';

// Available voice commands with cross-platform support
const VOICE_COMMANDS = {
    // Browser operations
    'open browser': {
        description: 'Opens your default web browser',
        execute: () => openBrowser()
    },
    'open google': {
        description: 'Opens Google in your browser',
        execute: () => openBrowser('https://google.com')
    },
    
    // System operations
    'open terminal': {
        description: 'Opens a new terminal window',
        execute: () => openTerminal()
    },
    'open command prompt': {
        description: 'Opens command prompt (Windows) or terminal (Mac/Linux)',
        execute: () => openTerminal()
    },
    
    // File operations
    'open downloads': {
        description: 'Opens your downloads folder',
        execute: () => openFolder(getDownloadsPath())
    },
    'open documents': {
        description: 'Opens your documents folder',
        execute: () => openFolder(getDocumentsPath())
    },
    'open desktop': {
        description: 'Opens your desktop folder',
        execute: () => openFolder(getDesktopPath())
    },
    
    // Application launching
    'open calculator': {
        description: 'Opens the calculator app',
        execute: () => openApplication('Calculator')
    },
    'open notepad': {
        description: 'Opens text editor (Notepad/TextEdit)',
        execute: () => openApplication(getTextEditor())
    },
    
    // System info
    'what time is it': {
        description: 'Shows current time',
        execute: () => showTime()
    },
    'system info': {
        description: 'Shows basic system information',
        execute: () => showSystemInfo()
    }
};

// Cross-platform utility functions
function getPlatform() {
    return process.platform;
}

function isWindows() {
    return getPlatform() === 'win32';
}

function isMac() {
    return getPlatform() === 'darwin';
}

function isLinux() {
    return getPlatform() === 'linux';
}

function getDownloadsPath() {
    return path.join(os.homedir(), 'Downloads');
}

function getDocumentsPath() {
    return path.join(os.homedir(), 'Documents');
}

function getDesktopPath() {
    return path.join(os.homedir(), 'Desktop');
}

function getTextEditor() {
    if (isWindows()) return 'notepad';
    if (isMac()) return 'TextEdit';
    return 'gedit'; // Linux default
}

// Command execution functions
async function openBrowser(url = '') {
    const command = isWindows() ? `start ${url}` : 
                   isMac() ? `open ${url}` : 
                   `xdg-open ${url}`;
    
    return executeCommand(command, `Browser opened${url ? ` to ${url}` : ''}`);
}

async function openTerminal(directory = os.homedir()) {
    let command;
    
    if (isWindows()) {
        command = `start cmd /k cd /d "${directory}"`;
    } else if (isMac()) {
        command = `open -a Terminal "${directory}"`;
    } else {
        command = `gnome-terminal --working-directory="${directory}"`;
    }
    
    return executeCommand(command, `Terminal opened in ${directory}`);
}

async function openFolder(folderPath) {
    if (!fs.existsSync(folderPath)) {
        console.log(`❌ Folder not found: ${folderPath}`);
        return false;
    }
    
    const command = isWindows() ? `explorer "${folderPath}"` :
                   isMac() ? `open "${folderPath}"` :
                   `xdg-open "${folderPath}"`;
    
    return executeCommand(command, `Opened folder: ${folderPath}`);
}

async function openApplication(appName) {
    let command;
    
    if (isWindows()) {
        command = `start "" "${appName}"`;
    } else if (isMac()) {
        command = `open -a "${appName}"`;
    } else {
        command = appName.toLowerCase();
    }
    
    return executeCommand(command, `Launched ${appName}`);
}

function showTime() {
    const now = new Date();
    console.log(`🕐 Current time: ${now.toLocaleString()}`);
    return true;
}

function showSystemInfo() {
    console.log(`💻 System Information:`);
    console.log(`   Platform: ${process.platform}`);
    console.log(`   Architecture: ${process.arch}`);
    console.log(`   Node.js: ${process.version}`);
    console.log(`   Home: ${os.homedir()}`);
    return true;
}

// Core execution function
function executeCommand(command, successMessage) {
    return new Promise((resolve) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.log(`❌ Error: ${error.message}`);
                resolve(false);
            } else {
                console.log(`✅ ${successMessage}`);
                resolve(true);
            }
        });
    });
}

// Voice recognition simulation (for now - can be enhanced with real speech recognition)
function simulateVoiceRecognition() {
    return new Promise((resolve) => {
        process.stdout.write('🎤 Listening... (Type your voice command): ');
        
        process.stdin.once('data', (data) => {
            const input = data.toString().trim().toLowerCase();
            resolve(input);
        });
    });
}

// Main CLI functions
async function executeVoiceCommand(commandText) {
    const normalizedCommand = commandText.toLowerCase().trim();
    
    console.log(`🗣️  Voice command: "${commandText}"`);
    
    // Find matching command
    const command = VOICE_COMMANDS[normalizedCommand];
    
    if (command) {
        console.log(`📋 ${command.description}`);
        const success = await command.execute();
        
        if (success) {
            console.log(`🎉 Command completed successfully!`);
        }
        return success;
    } else {
        console.log(`❓ Unknown command: "${commandText}"`);
        console.log(`💡 Try one of these commands:`);
        showAvailableCommands();
        return false;
    }
}

function showAvailableCommands() {
    console.log(`\n🎙️  Available Voice Commands:\n`);
    
    Object.entries(VOICE_COMMANDS).forEach(([command, info]) => {
        console.log(`   "${command}" - ${info.description}`);
    });
    
    console.log(`\n💡 Tip: Commands are case-insensitive`);
}

function showHelp() {
    console.log(`
🎤 Voice CLI v${VERSION} - Control your computer with voice commands

USAGE:
  voice-cli                    Start interactive voice mode
  voice-cli "open browser"     Execute a single voice command
  voice-cli --list            Show all available commands
  voice-cli --setup           Initial setup and configuration
  voice-cli --help            Show this help message

EXAMPLES:
  voice-cli "open terminal"
  voice-cli "open downloads"
  voice-cli "what time is it"

For more information, visit: https://github.com/yourcompany/voice-cli
`);
}

async function interactiveMode() {
    console.log(`🎤 Voice CLI v${VERSION} - Interactive Mode`);
    console.log(`💡 Type voice commands or 'quit' to exit\n`);
    
    while (true) {
        try {
            const command = await simulateVoiceRecognition();
            
            if (command === 'quit' || command === 'exit' || command === 'stop') {
                console.log(`👋 Goodbye!`);
                break;
            }
            
            if (command === 'help' || command === 'list') {
                showAvailableCommands();
                continue;
            }
            
            await executeVoiceCommand(command);
            console.log(); // Empty line for readability
            
        } catch (error) {
            console.log(`❌ Error: ${error.message}`);
        }
    }
}

// Configuration management
function loadConfig() {
    try {
        if (fs.existsSync(CONFIG_FILE)) {
            return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
        }
    } catch (error) {
        console.log(`⚠️  Could not load config: ${error.message}`);
    }
    return {};
}

function saveConfig(config) {
    try {
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
        console.log(`✅ Configuration saved to ${CONFIG_FILE}`);
    } catch (error) {
        console.log(`❌ Could not save config: ${error.message}`);
    }
}

function setupConfiguration() {
    console.log(`🔧 Voice CLI Setup`);
    console.log(`⚠️  Note: This is a basic version. Advanced features like real voice recognition`);
    console.log(`   can be added later with speech-to-text services.`);
    
    const config = {
        version: VERSION,
        platform: process.platform,
        setupDate: new Date().toISOString(),
        preferences: {
            autoStart: false,
            verboseOutput: true
        }
    };
    
    saveConfig(config);
    console.log(`✅ Setup complete! Try: voice-cli "open browser"`);
}

// Main CLI entry point
async function main() {
    const args = process.argv.slice(2);
    
    // Handle command line arguments
    if (args.length === 0) {
        // Interactive mode
        await interactiveMode();
        return;
    }
    
    const firstArg = args[0];
    
    switch (firstArg) {
        case '--help':
        case '-h':
            showHelp();
            break;
            
        case '--setup':
            setupConfiguration();
            break;
            
        case '--list':
        case '--commands':
            showAvailableCommands();
            break;
            
        case '--version':
        case '-v':
            console.log(`Voice CLI v${VERSION}`);
            break;
            
        default:
            // Execute single command
            const command = args.join(' ');
            await executeVoiceCommand(command);
            break;
    }
}

// Error handling
process.on('uncaughtException', (error) => {
    console.log(`❌ Unexpected error: ${error.message}`);
    process.exit(1);
});

process.on('SIGINT', () => {
    console.log(`\n👋 Goodbye!`);
    process.exit(0);
});

// Make stdin interactive for input
if (process.stdin.isTTY) {
    process.stdin.setRawMode(false);
}

// Run the CLI
if (require.main === module) {
    main().catch(error => {
        console.log(`❌ Error: ${error.message}`);
        process.exit(1);
    });
}

module.exports = {
    executeVoiceCommand,
    VOICE_COMMANDS,
    VERSION
};