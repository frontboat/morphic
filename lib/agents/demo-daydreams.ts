/**
 * Demo script showing the Daydreams agent in action
 * Run this to see how the agent performs research tasks
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

async function runDemo() {
    console.log('🚀 Daydreams AI + Morphic Demo')
    console.log('==============================\n')

    try {
        // Start the agent
        await morphicAgent.start()
        console.log('✅ Agent initialized\n')

        // Demo 1: Basic search
        console.log('📝 Demo 1: Basic Search')
        console.log('Query: "What is Daydreams AI?"')
        console.log('------------------------')

        const results1 = await morphicAgent.run({
            context: morphicResearchContext as any,
            args: {
                query: 'What is Daydreams AI?',
                depth: 'basic'
            },
            handlers: {
                onThinking: (thought) => {
                    console.log(`💭 Thinking: ${thought.content}`)
                },
                onLogStream: (log, done) => {
                    if (log.ref === 'action_call') {
                        console.log(`🔧 Action: ${log.name} - ${JSON.stringify((log as any).data)}`)
                    }
                    if (log.ref === 'action_result') {
                        console.log(`✅ Result: ${log.name} completed`)
                    }
                    if (log.ref === 'output') {
                        console.log(`📤 Output: ${(log as any).content}`)
                    }
                }
            }
        })

        console.log('\n✅ Demo 1 completed\n')

        // Demo 2: Advanced search with specific requirements
        console.log('📝 Demo 2: Advanced Search')
        console.log('Query: "Compare React Server Components vs traditional React"')
        console.log('------------------------')

        const results2 = await morphicAgent.run({
            context: morphicResearchContext as any,
            args: {
                query: 'Compare React Server Components vs traditional React',
                depth: 'advanced'
            },
            handlers: {
                onThinking: (thought) => {
                    // Only show first 100 chars of thoughts
                    const preview = thought.content.substring(0, 100)
                    console.log(`💭 ${preview}${thought.content.length > 100 ? '...' : ''}`)
                }
            }
        })

        // Extract and display results
        const outputs = results2.filter(log => log.ref === 'output')
        const actions = results2.filter(log => log.ref === 'action_result')

        console.log(`\n📊 Summary:`)
        console.log(`- Total logs: ${results2.length}`)
        console.log(`- Actions performed: ${actions.length}`)
        console.log(`- Outputs generated: ${outputs.length}`)

        console.log('\n✅ Demo 2 completed\n')

        // Stop the agent
        await morphicAgent.stop()
        console.log('✅ Agent stopped')

    } catch (error) {
        console.error('❌ Demo failed:', error)
    }
}

// Run the demo
if (require.main === module) {
    runDemo().catch(console.error)
}

export { runDemo }
