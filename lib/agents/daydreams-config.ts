import { Model } from '@/lib/types/models'
import { anthropic } from '@ai-sdk/anthropic'
import { google } from '@ai-sdk/google'
import { groq } from '@ai-sdk/groq'
import { openai } from '@ai-sdk/openai'
import { action, context, createDreams, input, output } from '@daydreamsai/core'
import { z } from 'zod'

// Browser-compatible memory store using localStorage
export const createBrowserMemoryStore = () => {
    return {
        async get<T>(key: string): Promise<T | null> {
            if (typeof window === 'undefined') return null
            const item = localStorage.getItem(key)
            return item ? JSON.parse(item) : null
        },
        async set<T>(key: string, value: T): Promise<void> {
            if (typeof window === 'undefined') return
            localStorage.setItem(key, JSON.stringify(value))
        },
        async delete(key: string): Promise<void> {
            if (typeof window === 'undefined') return
            localStorage.removeItem(key)
        },
        async clear(): Promise<void> {
            if (typeof window === 'undefined') return
            localStorage.clear()
        },
        async keys(base?: string): Promise<string[]> {
            if (typeof window === 'undefined') return []
            const allKeys = Object.keys(localStorage)
            return base ? allKeys.filter(key => key.startsWith(base)) : allKeys
        }
    }
}

// Search context for managing search sessions
export const searchContext = context({
    type: 'morphic-search',
    schema: z.object({
        sessionId: z.string(),
        query: z.string().optional(),
        searchMode: z.boolean().default(true)
    }),
    create: async ({ args }) => ({
        searchHistory: [],
        currentQuery: args.query || '',
        results: [],
        thinking: '',
        searchMode: args.searchMode
    }),
    render: ({ memory }) => {
        return [
            `Current search query: ${memory.currentQuery}`,
            `Search history: ${memory.searchHistory.length} searches`,
            `Search mode: ${memory.searchMode ? 'enabled' : 'disabled'}`
        ]
    }
})

// Input handler for search requests
export const searchInput = input({
    description: 'Handle search requests',
    schema: z.object({
        query: z.string(),
        searchDepth: z.enum(['basic', 'advanced']).optional(),
        includeImages: z.boolean().optional(),
        maxResults: z.number().optional()
    }),
    handler: async (data, ctx, agent) => {
        // Return the input data to be processed by the agent
        return {
            data,
            params: {
                query: data.query
            }
        }
    }
})

// Input handler for analyze requests
export const analyzeInput = input({
    description: 'Handle analyze requests',
    schema: z.object({
        results: z.array(z.any()),
        focusArea: z.string().optional()
    }),
    handler: async (data, ctx, agent) => {
        // Return the input data to be processed by the agent
        return {
            data,
            params: {
                resultsCount: String(data.results.length)
            }
        }
    }
})

// Input handler for chat messages
export const chatInput = input({
    description: 'Handle general chat messages',
    schema: z.object({
        query: z.string(),
        searchMode: z.boolean().default(true),
        messages: z.array(z.object({
            role: z.string(),
            content: z.string()
        })).optional()
    }),
    handler: async (data, ctx, agent) => {
        // Determine if this is a search query or general chat
        const isSearchQuery = data.searchMode && (
            data.query.toLowerCase().includes('search') ||
            data.query.toLowerCase().includes('find') ||
            data.query.toLowerCase().includes('look for') ||
            data.query.toLowerCase().includes('what is') ||
            data.query.toLowerCase().includes('tell me about')
        )

        if (isSearchQuery) {
            // Convert to search input
            return {
                data: {
                    query: data.query,
                    searchDepth: 'basic',
                    maxResults: 10
                },
                params: {
                    type: 'search',
                    query: data.query
                }
            }
        }

        // For general chat, just return the message
        return {
            data,
            params: {
                type: 'chat',
                query: data.query
            }
        }
    }
})

// Action for performing searches
export const searchAction = action({
    name: 'performSearch',
    description: 'Perform a search using the configured search provider',
    schema: z.object({
        query: z.string(),
        searchDepth: z.enum(['basic', 'advanced']).default('basic'),
        includeImages: z.boolean().default(true),
        maxResults: z.number().default(10)
    }),
    handler: async (args, ctx, agent) => {
        // This will integrate with existing search tools
        const { query, searchDepth, includeImages, maxResults } = args

        // Store in context memory
        ctx.memory.searchHistory.push({
            query,
            timestamp: new Date().toISOString(),
            depth: searchDepth
        })
        ctx.memory.currentQuery = query

        return {
            query,
            searchDepth,
            results: [], // Will be populated by search integration
            timestamp: new Date().toISOString()
        }
    }
})

// Action for analyzing search results
export const analyzeResultsAction = action({
    name: 'analyzeResults',
    description: 'Analyze and summarize search results',
    schema: z.object({
        results: z.array(z.any()),
        focusArea: z.string().optional()
    }),
    handler: async (args, ctx, agent) => {
        const { results, focusArea } = args

        // This will use the AI model to analyze results
        return {
            summary: 'Analysis pending',
            keyFindings: [],
            recommendations: []
        }
    }
})

// Action for general chat responses
export const chatAction = action({
    name: 'respondToChat',
    description: 'Generate a response to a chat message',
    schema: z.object({
        query: z.string(),
        context: z.array(z.object({
            role: z.string(),
            content: z.string()
        })).optional()
    }),
    handler: async (args, ctx, agent) => {
        const { query, context } = args

        // Store in context memory
        ctx.memory.searchHistory.push({
            query,
            timestamp: new Date().toISOString(),
            type: 'chat'
        })

        // Generate a response based on the query
        return {
            response: `I understand you're asking about: "${query}". As an AI assistant integrated with Morphic, I can help you search for information or have a conversation. How can I assist you today?`,
            timestamp: new Date().toISOString()
        }
    }
})

// Output for search results
export const searchResultsOutput = output({
    description: 'Display search results in the UI',
    schema: z.object({
        results: z.array(z.any()),
        summary: z.string().optional()
    }),
    handler: async (data, ctx, agent) => {
        return {
            data: {
                results: data.results,
                summary: data.summary,
                timestamp: new Date().toISOString()
            }
        }
    }
})

// Output for chat responses
export const chatOutput = output({
    description: 'Display chat responses in the UI',
    schema: z.object({
        response: z.string(),
        suggestions: z.array(z.string()).optional()
    }),
    handler: async (data, ctx, agent) => {
        return {
            data: {
                response: data.response,
                suggestions: data.suggestions || [],
                timestamp: new Date().toISOString()
            }
        }
    }
})

// Create agent factory
export const createMorphicAgent = (model: Model) => {
    // Map model provider to AI SDK provider
    const getModelProvider = () => {
        switch (model.providerId) {
            case 'openai':
                return openai(model.id)
            case 'anthropic':
                return anthropic(model.id)
            case 'google':
                return google(model.id)
            case 'groq':
                return groq(model.id)
            default:
                return openai('gpt-4o-mini') // fallback
        }
    }

    const memoryStore = createBrowserMemoryStore()
    const vectorStore = {
        async upsert(contextId: string, data: any): Promise<void> {
            // Simple in-memory vector store for browser
        },
        async query(contextId: string, query: string): Promise<any[]> {
            return []
        },
        async createIndex(indexName: string): Promise<void> { },
        async deleteIndex(indexName: string): Promise<void> { }
    }

    return createDreams({
        model: getModelProvider(),
        memory: {
            store: memoryStore,
            vector: vectorStore
        },
        contexts: [searchContext],
        actions: [searchAction, analyzeResultsAction, chatAction],
        inputs: {
            search: searchInput,
            analyze: analyzeInput,
            chat: chatInput
        },
        outputs: {
            searchResults: searchResultsOutput,
            chat: chatOutput
        },
        streaming: true
    })
} 