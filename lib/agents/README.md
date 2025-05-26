# Daydreams AI Integration with Morphic

This directory contains the integration between Morphic and the Daydreams AI framework, enabling autonomous AI agents to use Morphic's powerful search and retrieval capabilities.

## Overview

The Daydreams integration allows you to:

- Create autonomous AI agents that can perform web research
- Use Morphic's search tools within a Daydreams agent context
- Build multi-step research workflows
- Stream agent thoughts and actions to Morphic's UI

## Files

- `daydreams-agent.ts` - The main Daydreams agent implementation that wraps Morphic's tools
- `daydreams-example.ts` - Examples of how to use the Daydreams agent
- `researcher.ts` - Original Morphic researcher implementation
- `manual-researcher.ts` - Manual tool calling researcher
- `generate-related-questions.ts` - Related questions generation

## Usage

### Basic Research

```typescript
import { morphicAgent } from './daydreams-agent'

// Run a simple research task
const results = await morphicAgent.run({
  context: morphicResearchContext,
  args: {
    query: 'What is quantum computing?',
    depth: 'basic'
  }
})
```

### Streaming Integration

```typescript
// Stream agent logs for real-time UI updates
await morphicAgent.run({
  context: morphicResearchContext,
  args: { query, depth: 'advanced' },
  handlers: {
    onLogStream: (log, done) => {
      // Update UI with agent's progress
      updateUI(log)
    },
    onThinking: thought => {
      // Show agent's reasoning
      showThought(thought.content)
    }
  }
})
```

### Available Actions

The Daydreams agent has access to three main actions:

1. **search** - Web search with customizable parameters

   - `query`: Search query
   - `maxResults`: Number of results (default: 10)
   - `searchDepth`: 'basic' or 'advanced'
   - `includeDomains`: Array of domains to include
   - `excludeDomains`: Array of domains to exclude

2. **retrieve** - Extract content from specific URLs

   - `url`: The URL to retrieve content from

3. **videoSearch** - Search for YouTube videos
   - `query`: Video search query

## Architecture

The integration works by:

1. Wrapping Morphic's search functions as Daydreams actions
2. Creating a research context that manages the agent's state
3. Providing handlers for streaming updates to the UI
4. Enabling multi-step research workflows

## Benefits

- **Autonomous Research**: The agent can plan and execute complex research tasks
- **Memory Management**: Built-in episodic and working memory
- **Extensibility**: Easy to add new actions and contexts
- **Streaming Support**: Real-time updates for UI integration
- **Type Safety**: Full TypeScript support with Zod schemas

## Future Enhancements

- Integration with Morphic's UI components for agent visualization
- Support for more Morphic tools (e.g., code search, documentation lookup)
- Agent collaboration for complex research tasks
- Training data export for improving agent performance
