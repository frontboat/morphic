import { createMorphicAgent } from '@/lib/agents/daydreams-config'
import { Model } from '@/lib/types/models'
import { Agent } from '@daydreamsai/core'
import { useCallback, useEffect, useRef, useState } from 'react'

interface UseDaydreamsAgentOptions {
    model: Model
    sessionId: string
    searchMode?: boolean
}

interface AgentState {
    isReady: boolean
    isProcessing: boolean
    error: Error | null
    searchHistory: any[]
    currentQuery: string
}

export function useDaydreamsAgent({ model, sessionId, searchMode = true }: UseDaydreamsAgentOptions) {
    const [state, setState] = useState<AgentState>({
        isReady: false,
        isProcessing: false,
        error: null,
        searchHistory: [],
        currentQuery: ''
    })

    const agentRef = useRef<Agent | null>(null)
    const contextIdRef = useRef<string | null>(null)

    // Initialize agent
    useEffect(() => {
        const initAgent = async () => {
            try {
                const agent = createMorphicAgent(model)
                await agent.start()
                agentRef.current = agent

                // Get context ID for this session
                const contextId = agent.getContextId({
                    context: (await import('@/lib/agents/daydreams-config')).searchContext,
                    args: { sessionId, searchMode }
                })
                contextIdRef.current = contextId

                setState(prev => ({ ...prev, isReady: true, error: null }))
            } catch (error) {
                setState(prev => ({ ...prev, error: error as Error, isReady: false }))
            }
        }

        initAgent()

        return () => {
            if (agentRef.current) {
                agentRef.current.stop()
            }
        }
    }, [model, sessionId, searchMode])

    // Perform search
    const performSearch = useCallback(async (query: string, options?: {
        searchDepth?: 'basic' | 'advanced'
        includeImages?: boolean
        maxResults?: number
    }) => {
        if (!agentRef.current || !contextIdRef.current) {
            throw new Error('Agent not initialized')
        }

        setState(prev => ({ ...prev, isProcessing: true, currentQuery: query }))

        try {
            const logs = await agentRef.current.send({
                context: (await import('@/lib/agents/daydreams-config')).searchContext,
                args: { sessionId, query, searchMode },
                input: {
                    type: 'search',
                    data: {
                        query,
                        ...options
                    }
                },
                handlers: {
                    onLogStream: (log, done) => {
                        // Handle streaming logs
                        if (log.ref === 'action_result' && log.name === 'performSearch') {
                            setState(prev => ({
                                ...prev,
                                searchHistory: [...prev.searchHistory, log.data]
                            }))
                        }
                    },
                    onThinking: (thought) => {
                        // Handle agent thinking
                        console.log('Agent thinking:', thought.content)
                    }
                }
            })

            setState(prev => ({ ...prev, isProcessing: false }))
            return logs
        } catch (error) {
            setState(prev => ({
                ...prev,
                isProcessing: false,
                error: error as Error
            }))
            throw error
        }
    }, [sessionId, searchMode])

    // Analyze results
    const analyzeResults = useCallback(async (results: any[], focusArea?: string) => {
        if (!agentRef.current || !contextIdRef.current) {
            throw new Error('Agent not initialized')
        }

        setState(prev => ({ ...prev, isProcessing: true }))

        try {
            const logs = await agentRef.current.send({
                context: (await import('@/lib/agents/daydreams-config')).searchContext,
                args: { sessionId, searchMode },
                input: {
                    type: 'analyze',
                    data: {
                        results,
                        focusArea
                    }
                }
            })

            setState(prev => ({ ...prev, isProcessing: false }))
            return logs
        } catch (error) {
            setState(prev => ({
                ...prev,
                isProcessing: false,
                error: error as Error
            }))
            throw error
        }
    }, [sessionId, searchMode])

    // Get context state
    const getContextState = useCallback(async () => {
        if (!agentRef.current || !contextIdRef.current) {
            return null
        }

        return await agentRef.current.getContextById(contextIdRef.current)
    }, [])

    // Subscribe to context updates
    useEffect(() => {
        if (!agentRef.current || !contextIdRef.current) return

        const unsubscribe = agentRef.current.subscribeContext(
            contextIdRef.current,
            (log, done) => {
                // Update state based on logs
                if (log.ref === 'output' && log.type === 'searchResults') {
                    setState(prev => ({
                        ...prev,
                        searchHistory: [...prev.searchHistory, log.data]
                    }))
                }
            }
        )

        return unsubscribe
    }, [state.isReady])

    return {
        ...state,
        performSearch,
        analyzeResults,
        getContextState
    }
} 