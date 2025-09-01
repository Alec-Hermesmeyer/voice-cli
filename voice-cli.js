#!/usr/bin/env node

/**
 * Voice Command CLI Tool with ElevenLabs Voice Responses
 * 
 * A standalone command-line tool that allows users to control their computer
 * using voice commands AND responds back with a pleasant AI voice!
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
const https = require('https');

// CLI Configuration
const CONFIG_FILE = path.join(os.homedir(), '.voice-cli-config.json');
const VERSION = '1.0.1';

// ElevenLabs Configuration
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1/text-to-speech/';
const DEFAULT_VOICE_ID = '21m00Tcm4TlvDq8ikWAM'; // Rachel - Professional female voice
const CACHE_DIR = path.join(os.homedir(), '.voice-cli-cache');

// Available voice commands with cross-platform support
const VOICE_COMMANDS = {
    // Browser operations
    'open browser': {
        description: 'Opens your default web browser',
        response: 'Opening your browser now!',
        execute: () => openBrowser()
    },
    'open google': {
        description: 'Opens Google in your browser',
        response: 'Taking you to Google!',
        execute: () => openBrowser('https://google.com')
    },
    
    // System operations
    'open terminal': {
        description: 'Opens a new terminal window',
        response: 'Opening a new terminal for you!',
        execute: () => openTerminal()
    },
    'open command prompt': {
        description: 'Opens command prompt (Windows) or terminal (Mac/Linux)',
        response: 'Opening command prompt!',
        execute: () => openTerminal()
    },
    
    // File operations
    'open downloads': {
        description: 'Opens your downloads folder',
        response: 'Opening your downloads folder!',
        execute: () => openFolder(getDownloadsPath())
    },
    'open documents': {
        description: 'Opens your documents folder',
        response: 'Opening your documents folder!',
        execute: () => openFolder(getDocumentsPath())
    },
    'open desktop': {
        description: 'Opens your desktop folder',
        response: 'Opening your desktop!',
        execute: () => openFolder(getDesktopPath())
    },
    
    // Application launching
    'open calculator': {
        description: 'Opens the calculator app',
        response: 'Opening calculator for you!',
        execute: () => openApplication('Calculator')
    },
    'open notepad': {
        description: 'Opens text editor (Notepad/TextEdit)',
        response: 'Opening your text editor!',
        execute: () => openApplication(getTextEditor())
    },
    
    // System info
    'what time is it': {
        description: 'Shows current time',
        response: `It's ${new Date().toLocaleTimeString()}`,
        execute: () => showTime()
    },
    'system info': {
        description: 'Shows basic system information',
        response: 'Here is your system information',
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

// Voice Response System
async function speakResponse(text, config = {}) {
    try {
        // Skip voice if disabled in config
        if (config.voiceEnabled === false) {
            console.log(`🔇 Voice disabled: "${text}"`);
            return;
        }

        const elevenLabsApiKey = config.elevenLabsApiKey;
        if (!elevenLabsApiKey || elevenLabsApiKey === 'your-api-key-here') {
            console.log(`💬 "${text}"`);
            console.log(`ℹ️  Add ElevenLabs API key for voice responses: voice-cli --setup`);
            return;
        }

        console.log(`🗣️  "${text}"`);
        
        // Create cache directory if it doesn't exist
        if (!fs.existsSync(CACHE_DIR)) {
            fs.mkdirSync(CACHE_DIR, { recursive: true });
        }

        // Check cache first
        const cacheKey = require('crypto').createHash('md5').update(text).digest('hex').substring(0, 10);
        const cachePath = path.join(CACHE_DIR, `${cacheKey}.mp3`);
        
        if (fs.existsSync(cachePath)) {
            console.log(`🎧 Playing cached response...`);
            return playAudio(cachePath);
        }

        console.log(`🎤 Generating voice response...`);

        // Make request to ElevenLabs
        const audioData = await getElevenLabsAudio(text, elevenLabsApiKey, config.voiceId || DEFAULT_VOICE_ID);
        
        // Cache the response
        fs.writeFileSync(cachePath, audioData);
        
        // Play the audio
        return playAudio(cachePath);
        
    } catch (error) {
        console.log(`❌ Voice response error: ${error.message}`);
        console.log(`💬 "${text}"`); // Fallback to text
    }
}

function getElevenLabsAudio(text, apiKey, voiceId) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({ 
            text: text,
            model_id: "eleven_monolingual_v1",
            voice_settings: {
                stability: 0.5,
                similarity_boost: 0.8
            }
        });

        const options = {
            hostname: 'api.elevenlabs.io',
            port: 443,
            path: `/v1/text-to-speech/${voiceId}`,
            method: 'POST',
            headers: {
                'xi-api-key': apiKey,
                'accept': 'audio/mpeg',
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = https.request(options, (res) => {
            const chunks = [];
            
            res.on('data', (chunk) => {
                chunks.push(chunk);
            });
            
            res.on('end', () => {
                if (res.statusCode === 200) {
                    resolve(Buffer.concat(chunks));
                } else {
                    reject(new Error(`ElevenLabs API error: ${res.statusCode}`));
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.write(postData);
        req.end();
    });
}

function playAudio(filePath) {
    return new Promise((resolve) => {
        let command;
        
        if (isMac()) {
            command = `afplay "${filePath}"`;
        } else if (isWindows()) {
            // Windows Media Player or built-in player
            command = `powershell -c "(New-Object Media.SoundPlayer '${filePath}').PlaySync()"`;
        } else {
            // Linux - try multiple players
            command = `which mpg123 > /dev/null 2>&1 && mpg123 -q "${filePath}" || which aplay > /dev/null 2>&1 && aplay "${filePath}" || which paplay > /dev/null 2>&1 && paplay "${filePath}"`;
        }

        exec(command, (error) => {
            if (error) {
                console.log(`🔇 Audio playback not available on this system`);
            }
            resolve();
        });
    });
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
async function executeVoiceCommand(commandText, config = {}) {
    const normalizedCommand = commandText.toLowerCase().trim();
    
    console.log(`🗣️  Voice command: "${commandText}"`);
    
    // Find matching command
    const command = VOICE_COMMANDS[normalizedCommand];
    
    if (command) {
        console.log(`📋 ${command.description}`);
        
        // Speak the response
        await speakResponse(command.response, config);
        
        const success = await command.execute();
        
        if (success) {
            console.log(`🎉 Command completed successfully!`);
            await speakResponse("Done!", config);
        } else {
            await speakResponse("Sorry, there was an error with that command.", config);
        }
        return success;
    } else {
        console.log(`❓ Unknown command: "${commandText}"`);
        await speakResponse("I didn't understand that command. Try asking for help.", config);
        console.log(`💡 Try one of these commands:`);
        showAvailableCommands();
        return false;
    }
}

function showAvailableCommands() {
    console.log(`\\n🎙️  Available Voice Commands:\\n`);
    
    Object.entries(VOICE_COMMANDS).forEach(([command, info]) => {
        console.log(`   "${command}" - ${info.description}`);
    });
    
    console.log(`\\n💡 Tip: Commands are case-insensitive`);
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

VOICE RESPONSES:
  Add your ElevenLabs API key during setup for AI voice responses!
  Without API key, responses will be text-only.

For more information, visit: https://github.com/Alec-Hermesmeyer/voice-cli
`);
}

async function interactiveMode() {
    const config = loadConfig();
    
    console.log(`🎤 Voice CLI v${VERSION} - Interactive Mode`);
    console.log(`💡 Type voice commands or 'quit' to exit`);
    if (config.voiceEnabled && config.elevenLabsApiKey && config.elevenLabsApiKey !== 'your-api-key-here') {
        console.log(`🗣️  AI voice responses enabled!\\n`);
        await speakResponse("Voice CLI ready! What would you like me to do?", config);
    } else {
        console.log(`🔇 Voice responses disabled. Run 'voice-cli --setup' to enable.\\n`);
    }
    
    while (true) {
        try {
            const command = await simulateVoiceRecognition();
            
            if (command === 'quit' || command === 'exit' || command === 'stop') {
                await speakResponse("Goodbye!", config);
                console.log(`👋 Goodbye!`);
                break;
            }
            
            if (command === 'help' || command === 'list') {
                showAvailableCommands();
                await speakResponse("Here are the available commands", config);
                continue;
            }
            
            await executeVoiceCommand(command, config);
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
    return {
        voiceEnabled: false,
        elevenLabsApiKey: 'your-api-key-here',
        voiceId: DEFAULT_VOICE_ID
    };
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
    console.log(`🔧 Voice CLI Setup - Enable AI Voice Responses`);
    console.log(`\n🎤 To enable voice responses, you'll need an ElevenLabs API key:`);
    console.log(`   1. Sign up at https://elevenlabs.io (free tier available)`);
    console.log(`   2. Go to your profile and copy your API key`);
    console.log(`   3. Run this setup again with your API key\n`);
    
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    rl.question('Enter your ElevenLabs API key (or press Enter to skip): ', (apiKey) => {
        const config = {
            version: VERSION,
            platform: process.platform,
            setupDate: new Date().toISOString(),
            voiceEnabled: apiKey && apiKey.trim() !== '',
            elevenLabsApiKey: apiKey.trim() || 'your-api-key-here',
            voiceId: DEFAULT_VOICE_ID,
            preferences: {
                autoStart: false,
                verboseOutput: true
            }
        };
        
        saveConfig(config);
        
        if (config.voiceEnabled) {
            console.log(`✅ Voice responses enabled! Try: voice-cli "open browser"`);
        } else {
            console.log(`✅ Setup complete! Voice responses disabled (text-only mode)`);
            console.log(`   Run setup again anytime to add voice responses.`);
        }
        
        rl.close();
    });
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
    const config = loadConfig();
    
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
            await executeVoiceCommand(command, config);
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