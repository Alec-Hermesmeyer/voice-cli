#!/bin/bash

# Voice CLI Installation Script
# Simple script to install Voice CLI locally or globally

set -e

echo "🎤 Voice CLI Installation Script"
echo "================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed."
    echo "   Please install Node.js (version 14.0.0 or higher) from https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | sed 's/v//')
REQUIRED_VERSION="14.0.0"

if ! npx semver -r ">=$REQUIRED_VERSION" "$NODE_VERSION" &> /dev/null; then
    echo "❌ Error: Node.js version $NODE_VERSION is too old."
    echo "   Please upgrade to version $REQUIRED_VERSION or higher."
    exit 1
fi

echo "✅ Node.js $NODE_VERSION detected"

# Copy files to local directory or install globally
if [ "$1" = "--global" ]; then
    echo "📦 Installing Voice CLI globally..."
    
    # Use the package.json for global installation
    cp cli-package.json package.json
    npm install -g .
    rm package.json
    
    echo "✅ Voice CLI installed globally!"
    echo "   You can now use: voice-cli or voice"
    
else
    echo "📦 Setting up Voice CLI locally..."
    
    # Make the script executable
    chmod +x voice-cli.js
    
    echo "✅ Voice CLI set up locally!"
    echo "   You can now use: ./voice-cli.js or node voice-cli.js"
    echo "   To install globally, run: $0 --global"
fi

echo ""
echo "🚀 Try it out:"
echo "   voice-cli --help          # Show help"
echo "   voice-cli --list          # Show all commands"
echo "   voice-cli \"system info\"   # Execute a command"
echo ""
echo "📖 For full documentation, see CLI-README.md"