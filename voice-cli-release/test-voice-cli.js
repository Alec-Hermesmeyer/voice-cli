#!/usr/bin/env node

/**
 * Test Suite for Voice CLI
 * Simple test runner to verify CLI functionality
 */

const { spawn } = require('child_process');
const path = require('path');

const CLI_PATH = './voice-cli.js';

// Test cases
const tests = [
    {
        name: 'Version Command',
        args: ['--version'],
        expectedOutput: 'Voice CLI v1.0.0',
        timeout: 5000
    },
    {
        name: 'Help Command',
        args: ['--help'],
        expectedOutput: 'USAGE:',
        timeout: 5000
    },
    {
        name: 'List Commands',
        args: ['--list'],
        expectedOutput: 'Available Voice Commands:',
        timeout: 5000
    },
    {
        name: 'System Info Command',
        args: ['system info'],
        expectedOutput: 'System Information:',
        timeout: 10000
    },
    {
        name: 'Time Command',
        args: ['what time is it'],
        expectedOutput: 'Current time:',
        timeout: 10000
    },
    {
        name: 'Unknown Command',
        args: ['unknown command'],
        expectedOutput: 'Unknown command:',
        timeout: 10000
    }
];

// Test runner
async function runTest(test) {
    return new Promise((resolve) => {
        console.log(`\n🧪 Testing: ${test.name}`);
        console.log(`   Command: node ${CLI_PATH} ${test.args.join(' ')}`);
        
        const child = spawn('node', [CLI_PATH, ...test.args], {
            stdio: 'pipe'
        });
        
        let output = '';
        let errorOutput = '';
        
        child.stdout.on('data', (data) => {
            output += data.toString();
        });
        
        child.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });
        
        child.on('close', (code) => {
            const success = output.includes(test.expectedOutput);
            
            if (success) {
                console.log(`   ✅ PASS: Found expected output`);
            } else {
                console.log(`   ❌ FAIL: Expected "${test.expectedOutput}"`);
                console.log(`   📝 Actual output: ${output.substring(0, 200)}...`);
            }
            
            if (errorOutput) {
                console.log(`   ⚠️  Error output: ${errorOutput}`);
            }
            
            resolve({ 
                name: test.name, 
                success, 
                output, 
                errorOutput,
                exitCode: code 
            });
        });
        
        // Timeout protection
        setTimeout(() => {
            child.kill();
            console.log(`   ⏰ TIMEOUT: Test exceeded ${test.timeout}ms`);
            resolve({ 
                name: test.name, 
                success: false, 
                output: 'TIMEOUT',
                errorOutput: '',
                exitCode: -1 
            });
        }, test.timeout);
    });
}

async function runAllTests() {
    console.log('🚀 Starting Voice CLI Test Suite\n');
    console.log('=' .repeat(50));
    
    const results = [];
    
    for (const test of tests) {
        const result = await runTest(test);
        results.push(result);
    }
    
    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 Test Results Summary\n');
    
    const passed = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📝 Total:  ${results.length}\n`);
    
    if (failed === 0) {
        console.log('🎉 All tests passed! Voice CLI is ready for distribution.');
    } else {
        console.log('🔧 Some tests failed. Review the output above for details.');
        
        console.log('\n📋 Failed Tests:');
        results.filter(r => !r.success).forEach(r => {
            console.log(`   - ${r.name}`);
        });
    }
    
    return failed === 0;
}

// Run tests if called directly
if (require.main === module) {
    runAllTests().then(success => {
        process.exit(success ? 0 : 1);
    }).catch(error => {
        console.error('❌ Test runner error:', error.message);
        process.exit(1);
    });
}

module.exports = { runAllTests, runTest };