# Voice CLI - Control Your Computer with Voice Commands

A simple, powerful command-line tool that lets you control your computer using voice commands. No complex setup required - just install and speak!

## 🚀 Quick Start

### Installation

```bash
# Install globally via npm (when published)
npm install -g voice-cli

# Or run directly with Node.js
node voice-cli.js
```

### Basic Usage

```bash
# Start interactive voice mode
voice-cli

# Execute a single voice command
voice-cli "open browser"

# Show all available commands
voice-cli --list

# Get help
voice-cli --help
```

## 🎤 Available Voice Commands

### Browser & Web
- `"open browser"` - Opens your default web browser
- `"open google"` - Opens Google in your browser

### System Operations
- `"open terminal"` - Opens a new terminal/command prompt
- `"open command prompt"` - Opens command prompt (Windows) or terminal (Mac/Linux)

### File Management
- `"open downloads"` - Opens your downloads folder
- `"open documents"` - Opens your documents folder
- `"open desktop"` - Opens your desktop folder

### Applications
- `"open calculator"` - Opens the calculator app
- `"open notepad"` - Opens text editor (Notepad/TextEdit/gedit)

### System Information
- `"what time is it"` - Shows current time
- `"system info"` - Shows basic system information

## 🖥️ Cross-Platform Support

Voice CLI works on:
- **macOS** (Darwin)
- **Windows** (win32)
- **Linux**

Commands automatically adapt to your operating system.

## 📖 Usage Examples

### Interactive Mode
```bash
$ voice-cli
🎤 Voice CLI v1.0.0 - Interactive Mode
💡 Type voice commands or 'quit' to exit

🎤 Listening... (Type your voice command): open browser
🗣️  Voice command: "open browser"
📋 Opens your default web browser
✅ Browser opened
🎉 Command completed successfully!

🎤 Listening... (Type your voice command): quit
👋 Goodbye!
```

### Single Command Mode
```bash
$ voice-cli "open downloads"
🗣️  Voice command: "open downloads"
📋 Opens your downloads folder
✅ Opened folder: /Users/username/Downloads
🎉 Command completed successfully!
```

### List Available Commands
```bash
$ voice-cli --list

🎙️  Available Voice Commands:

   "open browser" - Opens your default web browser
   "open google" - Opens Google in your browser
   "open terminal" - Opens a new terminal window
   "open command prompt" - Opens command prompt (Windows) or terminal (Mac/Linux)
   "open downloads" - Opens your downloads folder
   "open documents" - Opens your documents folder
   "open desktop" - Opens your desktop folder
   "open calculator" - Opens the calculator app
   "open notepad" - Opens text editor (Notepad/TextEdit)
   "what time is it" - Shows current time
   "system info" - Shows basic system information

💡 Tip: Commands are case-insensitive
```

## ⚙️ Configuration

Run the setup command to create initial configuration:

```bash
voice-cli --setup
```

This creates a `.voice-cli-config.json` file in your home directory with basic preferences.

## 🔧 Requirements

- **Node.js**: Version 14.0.0 or higher
- **Operating System**: macOS, Windows, or Linux

## 🚧 Current Limitations

- **Voice Recognition**: Currently uses text input simulation. Real speech-to-text integration can be added.
- **Command Set**: Limited to basic system operations. More commands can be added based on feedback.

## 🛣️ Roadmap

- [ ] Real voice recognition integration
- [ ] Custom command mapping
- [ ] Plugin system for extended functionality
- [ ] Voice training for better accuracy
- [ ] Web-based configuration interface

## 🤝 Contributing

This is an early release designed to gather user feedback. Please try it out and let us know:

- What commands would be most useful for your workflow?
- What operating systems are you using?
- Any issues or suggestions for improvement?

## 📝 License

MIT License - see LICENSE file for details.

## 🆘 Troubleshooting

### Common Issues

**Command not found**
- Make sure the command is exactly as listed (case-insensitive)
- Try `voice-cli --list` to see all available commands

**Permission errors on Linux/Mac**
- Some commands may require additional permissions
- Try running with appropriate system permissions

**Application won't open**
- Ensure the target application is installed on your system
- Different Linux distributions may use different default applications

### Getting Help

- Run `voice-cli --help` for usage information
- Check the available commands with `voice-cli --list`
- Report issues at: [GitHub Issues](https://github.com/yourcompany/voice-cli/issues)

---

**Made with ❤️ by the Voice Backend Team**