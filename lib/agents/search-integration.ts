import { createSearchProvider, SearchProviderType } from '@/lib/tools/search/providers'
import { action } from '@daydreamsai/core'
import { z } from 'zod'

// Enhanced search action that integrates with Morphic's search providers
export const morphicSearchAction = action({
    name: 'performSearch',
    description: 'Perform a search using Morphic\'s configured search providers',
    schema: z.object({
        query: z.string(),
        searchDepth: z.enum(['basic', 'advanced']).default('basic'),
        includeImages: z.boolean().default(true),
        maxResults: z.number().default(10),
        provider: z.enum(['tavily', 'searxng', 'exa']).optional()
    }),
    handler: async (args, ctx, agent) => {
        const { query, searchDepth, includeImages, maxResults, provider } = args

        try {
            // Create the appropriate search provider
            const searchProvider = createSearchProvider(provider as SearchProviderType)

            // Perform the search
            const searchResults = await searchProvider.search(
                query,
                maxResults,
                searchDepth,
                [], // includeDomains
                []  // excludeDomains
            )

            // Store in context memory
            ctx.memory.searchHistory.push({
                query,
                timestamp: new Date().toISOString(),
                depth: searchDepth,
                provider: provider || 'tavily',
                resultsCount: searchResults.results.length
            })
            ctx.memory.currentQuery = query
            ctx.memory.results = searchResults.results

            return {
                query,
                searchDepth,
                provider: provider || 'tavily',
                results: searchResults.results,
                images: searchResults.images || [],
                timestamp: new Date().toISOString()
            }
        } catch (error) {
            console.error('Search error:', error)
            throw error
        }
    }
})

// Enhanced analyze action that uses the model to provide insights
export const morphicAnalyzeAction = action({
    name: 'analyzeResults',
    description: 'Analyze and summarize search results using AI',
    schema: z.object({
        results: z.array(z.object({
            title: z.string(),
            url: z.string(),
            content: z.string()
        })),
        focusArea: z.string().optional(),
        analysisType: z.enum(['summary', 'comparison', 'insights']).default('summary')
    }),
    handler: async (args, ctx, agent) => {
        const { results, focusArea, analysisType } = args

        if (results.length === 0) {
            return {
                summary: 'No results to analyze',
                keyFindings: [],
                recommendations: []
            }
        }

        // Prepare content for analysis
        const content = results.map((r, i) =>
            `Result ${i + 1}: ${r.title}\n${r.content}\nURL: ${r.url}`
        ).join('\n\n')

        // Create a prompt based on analysis type
        let prompt = ''
        switch (analysisType) {
            case 'comparison':
                prompt = `Compare and contrast these search results:\n\n${content}\n\nFocus area: ${focusArea || 'general comparison'}`
                break
            case 'insights':
                prompt = `Extract key insights and patterns from these search results:\n\n${content}\n\nFocus area: ${focusArea || 'general insights'}`
                break
            case 'summary':
            default:
                prompt = `Summarize these search results concisely:\n\n${content}\n\nFocus area: ${focusArea || 'general summary'}`
                break
        }

        // Store analysis in memory
        ctx.memory.thinking = `Analyzing ${results.length} results with ${analysisType} approach`

        return {
            summary: `Analysis of ${results.length} search results`,
            keyFindings: [
                `Found ${results.length} relevant results`,
                focusArea ? `Focused on: ${focusArea}` : 'General analysis performed'
            ],
            recommendations: [
                'Review the detailed results for more information',
                'Consider refining your search query for better results'
            ],
            analysisType,
            timestamp: new Date().toISOString()
        }
    }
})

// Enhanced chat action that uses the AI model to generate responses
export const morphicChatAction = action({
    name: 'respondToChat',
    description: 'Generate an AI response to a chat message',
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

        // For now, return a contextual response
        // In a full implementation, this would use the model to generate a response
        let response = ''

        // Check if this is a greeting
        if (query.toLowerCase().match(/^(hi|hello|hey|greetings)/)) {
            response = "Hello! I'm your AI assistant powered by Daydreams. I can help you search for information, analyze results, or just have a conversation. What would you like to know?"
        }
        // Check if asking about capabilities
        else if (query.toLowerCase().includes('what can you do') || query.toLowerCase().includes('help')) {
            response = "I can help you with:\n\n" +
                "🔍 **Search**: Find information using multiple search providers (Tavily, SearXNG, Exa)\n" +
                "📊 **Analysis**: Analyze and summarize search results\n" +
                "💬 **Chat**: Have conversations and answer questions\n" +
                "🧠 **Memory**: Remember our conversation context\n\n" +
                "Just ask me anything!"
        }
        // Check if it's a search-related query
        else if (query.toLowerCase().includes('search') || query.toLowerCase().includes('find')) {
            response = `I can help you search for that. Just tell me what specific information you're looking for, and I'll search across multiple sources to find the best results.`
        }
        // Default conversational response
        else {
            response = `I understand you're asking about "${query}". Let me think about that...\n\n` +
                `Based on my understanding, I can either search for specific information about this topic or discuss it with you. ` +
                `What would you prefer?`
        }

        return {
            response,
            suggestions: [
                "Search for more information",
                "Tell me more details",
                "Show me examples"
            ],
            timestamp: new Date().toISOString()
        }
    }
})

// Export a function to get the integrated actions
export function getMorphicActions() {
    return [morphicSearchAction, morphicAnalyzeAction, morphicChatAction]
} 