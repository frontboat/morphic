/**
 * Example of how to use the Daydreams agent within Morphic
 * 
 * This demonstrates how a Daydreams agent can be integrated to provide
 * autonomous research capabilities using Morphic's search tools.
 */

import { z } from 'zod'
import { morphicAgent } from './daydreams-agent'

// Define the context reference properly
const morphicResearchContext = {
    type: 'morphic-research',
    schema: z.object({
        query: z.string(),
        depth: z.enum(['basic', 'advanced']).optional()
    })
}

// Example 1: Running the agent with a research query
export async function runResearchExample() {
    try {
        // Start the agent
        await morphicAgent.start()

        // Run a research task
        const results = await morphicAgent.run({
            context: morphicResearchContext as any,
            args: {
                query: 'What are the latest developments in AI agents?',
                depth: 'advanced'
            }
        })

        console.log('Research completed:', results)

        // Stop the agent when done
        await morphicAgent.stop()
    } catch (error) {
        console.error('Error running research:', error)
    }
}

// Example 2: Using the agent in a streaming context (for integration with Morphic's UI)
export async function streamingResearchExample(query: string) {
    const logs: any[] = []

    await morphicAgent.run({
        context: morphicResearchContext as any,
        args: {
            query,
            depth: 'basic'
        },
        handlers: {
            onLogStream: (log, done) => {
                logs.push(log)
                // This could be connected to Morphic's streaming UI
                console.log('Log:', log)
                if (done) {
                    console.log('Research complete')
                }
            },
            onThinking: (thought) => {
                // Display agent's reasoning in the UI
                console.log('Agent thinking:', thought.content)
            }
        }
    })

    return logs
}

// Example 3: Integrating with Morphic's chat interface
export function createDaydreamsToolForMorphic() {
    return {
        name: 'daydreams_research',
        description: 'Use an autonomous AI agent to perform in-depth research',
        parameters: {
            query: {
                type: 'string',
                description: 'The research query or topic'
            },
            depth: {
                type: 'string',
                enum: ['basic', 'advanced'],
                description: 'The depth of research to perform'
            }
        },
        execute: async ({ query, depth }: { query: string; depth: 'basic' | 'advanced' }) => {
            const results = await morphicAgent.run({
                context: morphicResearchContext as any,
                args: { query, depth }
            })

            // Extract the final results from the agent's logs
            const outputs = results.filter(log => log.ref === 'output')
            const searchResults = results.filter(log => log.ref === 'action_result' && log.name === 'search')

            return {
                summary: outputs.map(o => o.content).join('\n'),
                searchResults: searchResults.map(r => (r as any).data),
                logs: results
            }
        }
    }
}

// Example 4: Using the agent for multi-step research
export async function multiStepResearch(topic: string, subtopics: string[]) {
    const allResults = []

    // Initial broad research
    const mainResults = await morphicAgent.run({
        context: morphicResearchContext as any,
        args: {
            query: topic,
            depth: 'basic'
        }
    })
    allResults.push({ topic, results: mainResults })

    // Deep dive into subtopics
    for (const subtopic of subtopics) {
        const subtopicResults = await morphicAgent.run({
            context: morphicResearchContext as any,
            args: {
                query: `${topic}: ${subtopic}`,
                depth: 'advanced'
            }
        })
        allResults.push({ topic: subtopic, results: subtopicResults })
    }

    return allResults
} 