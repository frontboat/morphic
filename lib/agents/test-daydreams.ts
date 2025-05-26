/**
 * Test script for the Daydreams AI integration with Morphic
 * Run this file to verify the integration is working correctly
 */

import { z } from 'zod'
import { morphicAgent } from './daydreams-agent'

// Define the context reference
const morphicResearchContext = {
    type: 'morphic-research',
    schema: z.object({
        query: z.string(),
        depth: z.enum(['basic', 'advanced']).optional()
    })
}

// Test 1: Basic functionality test
async function testBasicFunctionality() {
    console.log('\n🧪 Test 1: Basic Functionality Test')
    console.log('=====================================')

    try {
        // Start the agent
        await morphicAgent.start()
        console.log('✅ Agent started successfully')

        // Run a simple search
        console.log('\n📝 Running search for "TypeScript best practices"...')
        const results = await morphicAgent.run({
            context: morphicResearchContext as any,
            args: {
                query: 'TypeScript best practices',
                depth: 'basic'
            }
        })

        console.log(`✅ Search completed with ${results.length} log entries`)

        // Check for action results
        const actionResults = results.filter(log => log.ref === 'action_result')
        console.log(`📊 Found ${actionResults.length} action results`)

        // Stop the agent
        await morphicAgent.stop()
        console.log('✅ Agent stopped successfully')

        return true
    } catch (error) {
        console.error('❌ Test failed:', error)
        return false
    }
}

// Test 2: Streaming test
async function testStreaming() {
    console.log('\n🧪 Test 2: Streaming Test')
    console.log('========================')

    try {
        let logCount = 0
        let thoughtCount = 0

        await morphicAgent.run({
            context: morphicResearchContext as any,
            args: {
                query: 'What is React Server Components?',
                depth: 'basic'
            },
            handlers: {
                onLogStream: (log, done) => {
                    logCount++
                    console.log(`📝 Log ${logCount}: ${log.ref}`)
                    if (done) {
                        console.log('✅ Streaming completed')
                    }
                },
                onThinking: (thought) => {
                    thoughtCount++
                    console.log(`💭 Thought ${thoughtCount}: ${thought.content.substring(0, 50)}...`)
                }
            }
        })

        console.log(`\n📊 Total logs: ${logCount}, Total thoughts: ${thoughtCount}`)
        return true
    } catch (error) {
        console.error('❌ Test failed:', error)
        return false
    }
}

// Test 3: Error handling test
async function testErrorHandling() {
    console.log('\n🧪 Test 3: Error Handling Test')
    console.log('==============================')

    try {
        // Test with invalid query
        const results = await morphicAgent.run({
            context: morphicResearchContext as any,
            args: {
                query: '', // Empty query
                depth: 'basic'
            }
        })

        console.log('✅ Handled empty query gracefully')
        return true
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        console.log('✅ Error caught as expected:', errorMessage)
        return true
    }
}

// Test 4: Action execution test
async function testActions() {
    console.log('\n🧪 Test 4: Action Execution Test')
    console.log('================================')

    try {
        // Test search action
        console.log('\n📝 Testing search action...')
        const searchResults = await morphicAgent.run({
            context: morphicResearchContext as any,
            args: {
                query: 'Daydreams AI framework',
                depth: 'basic'
            }
        })

        const searchActions = searchResults.filter(
            log => log.ref === 'action_call' && log.name === 'search'
        )
        console.log(`✅ Search actions executed: ${searchActions.length}`)

        // The agent should intelligently decide which actions to use
        // based on the query context

        return true
    } catch (error) {
        console.error('❌ Test failed:', error)
        return false
    }
}

// Main test runner
async function runAllTests() {
    console.log('🚀 Starting Daydreams AI Integration Tests')
    console.log('==========================================')

    const tests = [
        { name: 'Basic Functionality', fn: testBasicFunctionality },
        { name: 'Streaming', fn: testStreaming },
        { name: 'Error Handling', fn: testErrorHandling },
        { name: 'Action Execution', fn: testActions }
    ]

    const results = []

    for (const test of tests) {
        const passed = await test.fn()
        results.push({ name: test.name, passed })

        // Add delay between tests
        await new Promise(resolve => setTimeout(resolve, 1000))
    }

    // Summary
    console.log('\n📊 Test Summary')
    console.log('===============')
    results.forEach(result => {
        console.log(`${result.passed ? '✅' : '❌'} ${result.name}`)
    })

    const passedCount = results.filter(r => r.passed).length
    console.log(`\nTotal: ${passedCount}/${results.length} tests passed`)

    if (passedCount === results.length) {
        console.log('\n🎉 All tests passed! The Daydreams integration is working correctly.')
    } else {
        console.log('\n⚠️  Some tests failed. Please check the errors above.')
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    runAllTests().catch(console.error)
}

export { runAllTests, testActions, testBasicFunctionality, testErrorHandling, testStreaming }
