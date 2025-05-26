import { search } from '@/lib/tools/search'
import { getModel } from '@/lib/utils/registry'
import { action, context, createDreams, extension } from '@daydreamsai/core'
import { z } from 'zod'

// Define the search action that wraps Morphic's search functionality
const searchAction = action({
    name: 'search',
    description: 'Search the web for information',
    schema: z.object({
        query: z.string().describe('The search query'),
        maxResults: z.number().optional().default(10),
        searchDepth: z.enum(['basic', 'advanced']).optional().default('basic'),
        includeDomains: z.array(z.string()).optional().default([]),
        excludeDomains: z.array(z.string()).optional().default([])
    }),
    handler: async (args) => {
        const results = await search(
            args.query,
            args.maxResults,
            args.searchDepth,
            args.includeDomains,
            args.excludeDomains
        )
        return results
    }
})

// Define the retrieve action for getting content from URLs
const retrieveAction = action({
    name: 'retrieve',
    description: 'Retrieve and extract content from a specific URL',
    schema: z.object({
        url: z.string().describe('The URL to retrieve content from')
    }),
    handler: async (args) => {
        // For now, we'll use the search function to retrieve content
        // In a full implementation, we'd extract the retrieve logic
        const results = await search(args.url, 1, 'basic', [], [])
        return { results: results.results || null }
    }
})

// Define the video search action
const videoSearchAction = action({
    name: 'videoSearch',
    description: 'Search for videos on YouTube',
    schema: z.object({
        query: z.string().describe('The search query for videos')
    }),
    handler: async (args) => {
        // For video search, we'll need to implement a direct call to the Serper API
        // or extract the video search logic from the tool
        try {
            const response = await fetch('https://google.serper.dev/videos', {
                method: 'POST',
                headers: {
                    'X-API-KEY': process.env.SERPER_API_KEY || '',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ q: args.query })
            })

            if (!response.ok) {
                throw new Error('Network response was not ok')
            }

            const data = await response.json()
            return { videos: data.videos || [] }
        } catch (error) {
            console.error('Video Search API error:', error)
            return { videos: [] }
        }
    }
})

// Create the Morphic Research Context
const morphicResearchContext = context({
    type: 'morphic-research',
    description: 'A context for performing web research using Morphic tools',
    schema: z.object({
        query: z.string().describe('The research query or topic'),
        depth: z.enum(['basic', 'advanced']).optional().default('basic')
    }),
    actions: [searchAction, retrieveAction, videoSearchAction],
    instructions: `You are a research assistant with access to Morphic's powerful search and retrieval capabilities.
    
Your available actions are:
- search: Search the web for information
- retrieve: Extract content from specific URLs
- videoSearch: Search for videos on YouTube

Use these tools to help answer questions and gather information for the user.`,
    create: async ({ args }) => {
        return {
            query: args.query,
            depth: args.depth,
            searchHistory: [],
            retrievedUrls: []
        }
    }
})

// Create the Daydreams agent that uses Morphic
export function createMorphicAgent() {
    // Get the default model from Morphic's registry
    // Use the proper format: providerId:modelId
    const defaultModel = getModel('openai:gpt-4o-mini')

    const agent = createDreams({
        model: defaultModel, // Use Morphic's default model
        contexts: [morphicResearchContext],
        actions: [searchAction, retrieveAction, videoSearchAction]
    })

    return agent
}

// Export a singleton instance
export const morphicAgent = createMorphicAgent()

export const morphic = extension({
    name: "morphic",
    actions: [searchAction, retrieveAction, videoSearchAction],
});