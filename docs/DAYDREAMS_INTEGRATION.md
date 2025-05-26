# Daydreams AI Integration Guide

This guide explains how Daydreams AI has been integrated into Morphic to provide autonomous agent capabilities with memory and context awareness.

## Overview

Daydreams AI is a lightweight TypeScript agent framework that enables:

- **Autonomous agents** with memory and context management
- **Browser-compatible** execution (no server required)
- **Persistent memory** using localStorage/IndexedDB
- **Action-based architecture** for modular functionality
- **Streaming responses** for real-time interaction

## Integration Status

### ✅ Main Chat Integration

The main Morphic chat interface now uses the Daydreams agent for all interactions. This means:

- **Conversational AI**: The chat can handle both general conversations and search queries
- **Context Awareness**: The agent remembers conversation history within a session
- **Smart Routing**: Automatically determines whether to search or chat based on the query
- **Unified Experience**: All chat interactions go through the same agent pipeline

### How It Works

1. **User sends a message** → The chat interface sends it to `/api/chat`
2. **Daydreams processes** → The agent analyzes the message and determines the appropriate action
3. **Actions execute** → Search, chat, or analysis actions run based on the query
4. **Streaming response** → Results stream back to the UI in real-time

## Architecture

### Core Components

1. **Agent Configuration** (`lib/agents/daydreams-config.ts`)

   - Defines the search context for managing sessions
   - Implements browser-compatible memory storage
   - Configures actions and inputs for search functionality
   - Includes chat input handler for general conversations

2. **React Hook** (`hooks/use-daydreams-agent.ts`)

   - Provides easy integration with React components
   - Manages agent lifecycle and state
   - Handles search and analysis operations

3. **Search Integration** (`lib/agents/search-integration.ts`)

   - Bridges Daydreams actions with Morphic's search providers
   - Supports Tavily, SearXNG, and Exa search backends
   - Provides AI-powered result analysis
   - Includes chat action for conversational responses

4. **Streaming Handler** (`lib/streaming/create-daydreams-stream.ts`)

   - Handles real-time streaming of agent responses
   - Formats different types of outputs (chat, search, analysis)
   - Integrates with the main chat API route

5. **UI Component** (`components/daydreams-search.tsx`)
   - Demonstrates standalone agent usage
   - Shows real-time search with memory persistence
   - Displays agent thinking and processing states

## Usage

### Main Chat Interface

The main chat now automatically uses Daydreams:

```typescript
// In the chat API route
return createDaydreamsStreamResponse({
  messages,
  model: selectedModel,
  chatId,
  searchMode,
  userId
})
```

### Query Types

The agent intelligently handles different query types:

1. **Search Queries**: "Search for AI agents", "Find information about quantum computing"
2. **General Chat**: "Hello", "What can you do?", "Tell me a joke"
3. **Analysis Requests**: "Analyze these results", "Compare X and Y"

### Memory Persistence

The agent automatically persists:

- Search history across sessions
- Current query state
- Analysis results
- Agent thinking/reasoning
- Conversation context

Data is stored in localStorage and survives page refreshes.

### Actions

#### Search Action

```typescript
performSearch(query: string, options?: {
  searchDepth?: 'basic' | 'advanced'
  includeImages?: boolean
  maxResults?: number
  provider?: 'tavily' | 'searxng' | 'exa'
})
```

#### Chat Action

```typescript
respondToChat(query: string, context?: Message[])
```

#### Analyze Action

```typescript
analyzeResults(results: any[], focusArea?: string)
```

## Integration Points

### With Existing Search Tools

The integration reuses Morphic's existing search providers:

- `TavilySearchProvider`
- `SearXNGSearchProvider`
- `ExaSearchProvider`

### With AI Models

Supports all models configured in Morphic:

- OpenAI
- Anthropic
- Google AI
- Groq
- Local models via Ollama

### With UI Components

The main chat interface now uses Daydreams by default. You can also use the standalone component:

```tsx
<DaydreamsSearch model={selectedModel} sessionId={chatId} />
```

## Advanced Features

### Custom Actions

Add new actions to extend functionality:

```typescript
const customAction = action({
  name: 'summarize',
  description: 'Summarize content',
  schema: z.object({
    content: z.string(),
    style: z.enum(['brief', 'detailed'])
  }),
  handler: async (args, ctx, agent) => {
    // Implementation
    return { summary: '...' }
  }
})
```

### Context Extensions

Create new contexts for different use cases:

```typescript
const chatContext = context({
  type: 'chat',
  schema: z.object({
    userId: z.string(),
    topic: z.string()
  }),
  create: async ({ args }) => ({
    messages: [],
    topic: args.topic
  })
})
```

### Memory Stores

Implement custom memory stores:

```typescript
const customStore = {
  async get(key: string) {
    // Custom retrieval logic
  },
  async set(key: string, value: any) {
    // Custom storage logic
  }
}
```

## Benefits

1. **Unified Experience**: All chat interactions go through the same intelligent agent
2. **Context Awareness**: Maintains conversation context and history
3. **Smart Routing**: Automatically determines the best action for each query
4. **Browser-First**: No backend required for basic functionality
5. **Extensible**: Easy to add new actions and capabilities
6. **Type-Safe**: Full TypeScript support with type inference

## Future Enhancements

- Vector embeddings for semantic memory
- Multi-agent collaboration
- Advanced reasoning chains
- Integration with more Morphic features
- Export training data for model fine-tuning
- Enhanced natural language understanding

## Troubleshooting

### Agent Not Initializing

- Check browser console for errors
- Ensure localStorage is enabled
- Verify API keys are set

### Search Not Working

- Confirm search provider API keys
- Check network connectivity
- Verify search provider configuration

### Memory Not Persisting

- Check localStorage quota
- Clear browser cache if needed
- Ensure cookies are enabled

### Chat Not Responding

- Verify the model is properly configured
- Check for streaming errors in the console
- Ensure the agent has started successfully

## Resources

- [Daydreams AI Documentation](https://github.com/daydreamsai/daydreams)
- [Morphic Documentation](../README.md)
- [API Reference](./API_REFERENCE.md)
