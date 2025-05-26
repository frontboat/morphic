export interface AgentTemplate {
    id: string
    name: string
    description: string
    icon: string
    config: {
        name: string
        model?: string
        instructions: string
        contexts: Array<{
            name: string
            type: string
            description: string
            schema?: string
            instructions?: string
            selectedActions?: string[]
        }>
        actions: Array<{
            name: string
            description: string
            schema?: string
            handler: string
        }>
    }
}

export const agentTemplates: AgentTemplate[] = [
    {
        id: 'research-agent',
        name: 'Research Agent',
        description: 'An agent specialized in web research and information gathering',
        icon: 'Brain',
        config: {
            name: 'Research Assistant',
            model: 'openai:gpt-4o-mini',
            instructions: 'You are a helpful research assistant that excels at finding and synthesizing information from the web.',
            contexts: [
                {
                    name: 'Research Context',
                    type: 'research-context',
                    description: 'Context for managing research queries and results',
                    schema: `z.object({
  topic: z.string().describe('The research topic'),
  depth: z.enum(['shallow', 'deep']).optional().default('shallow'),
  maxSources: z.number().optional().default(5)
})`,
                    instructions: 'Focus on finding accurate, relevant, and up-to-date information. Always cite your sources.',
                    selectedActions: ['webSearch', 'extractContent', 'summarize']
                }
            ],
            actions: [
                {
                    name: 'webSearch',
                    description: 'Search the web for information',
                    schema: `z.object({
  query: z.string(),
  maxResults: z.number().optional().default(10)
})`,
                    handler: `const results = await search(args.query, args.maxResults)
return { results }`
                },
                {
                    name: 'extractContent',
                    description: 'Extract content from a URL',
                    schema: `z.object({
  url: z.string().url()
})`,
                    handler: `// Extract content from URL
const content = await fetchAndExtract(args.url)
return { content }`
                },
                {
                    name: 'summarize',
                    description: 'Summarize text content',
                    schema: `z.object({
  text: z.string(),
  maxLength: z.number().optional().default(200)
})`,
                    handler: `// Summarize the text
const summary = await summarizeText(args.text, args.maxLength)
return { summary }`
                }
            ]
        }
    },
    {
        id: 'task-automation',
        name: 'Task Automation Agent',
        description: 'An agent that helps automate repetitive tasks and workflows',
        icon: 'Zap',
        config: {
            name: 'Task Automator',
            model: 'openai:gpt-4o-mini',
            instructions: 'You are a task automation specialist that helps users streamline their workflows and automate repetitive tasks.',
            contexts: [
                {
                    name: 'Automation Context',
                    type: 'automation-context',
                    description: 'Context for managing automated tasks and workflows',
                    schema: `z.object({
  taskName: z.string(),
  schedule: z.string().optional(),
  parameters: z.record(z.any()).optional()
})`,
                    instructions: 'Help users identify automation opportunities and implement efficient solutions.',
                    selectedActions: ['createTask', 'scheduleTask', 'executeTask', 'checkStatus']
                }
            ],
            actions: [
                {
                    name: 'createTask',
                    description: 'Create a new automated task',
                    schema: `z.object({
  name: z.string(),
  steps: z.array(z.string()),
  parameters: z.record(z.any()).optional()
})`,
                    handler: `// Create a new task
const task = await createAutomatedTask(args)
return { taskId: task.id, status: 'created' }`
                },
                {
                    name: 'scheduleTask',
                    description: 'Schedule a task to run at specific times',
                    schema: `z.object({
  taskId: z.string(),
  schedule: z.string() // cron expression
})`,
                    handler: `// Schedule the task
const scheduled = await scheduleTask(args.taskId, args.schedule)
return { scheduled }`
                },
                {
                    name: 'executeTask',
                    description: 'Execute a task immediately',
                    schema: `z.object({
  taskId: z.string(),
  parameters: z.record(z.any()).optional()
})`,
                    handler: `// Execute the task
const result = await executeTask(args.taskId, args.parameters)
return { result }`
                },
                {
                    name: 'checkStatus',
                    description: 'Check the status of a task',
                    schema: `z.object({
  taskId: z.string()
})`,
                    handler: `// Check task status
const status = await getTaskStatus(args.taskId)
return { status }`
                }
            ]
        }
    },
    {
        id: 'creative-writer',
        name: 'Creative Writer Agent',
        description: 'An agent with personality traits for creative writing and storytelling',
        icon: 'Sparkles',
        config: {
            name: 'Creative Writer',
            model: 'anthropic:claude-3-sonnet-20240229',
            instructions: 'You are a creative writer with a unique personality and writing style.',
            contexts: [
                {
                    name: 'Writing Context',
                    type: 'writing-context',
                    description: 'Context for creative writing with personality traits',
                    schema: `z.object({
  genre: z.enum(['fiction', 'poetry', 'screenplay', 'blog']),
  tone: z.enum(['humorous', 'serious', 'dramatic', 'casual']),
  length: z.enum(['short', 'medium', 'long'])
})`,
                    instructions: `You have the following personality traits:
- Creativity: 9/10 (highly imaginative and original)
- Empathy: 8/10 (deeply understanding of emotions)
- Humor: 7/10 (witty and playful when appropriate)
- Detail-oriented: 6/10 (balanced between detail and flow)

Use these traits to inform your writing style.`,
                    selectedActions: ['generateIdeas', 'writeContent', 'editContent', 'generateTitle']
                }
            ],
            actions: [
                {
                    name: 'generateIdeas',
                    description: 'Generate creative ideas for writing',
                    schema: `z.object({
  topic: z.string(),
  count: z.number().optional().default(5)
})`,
                    handler: `// Generate creative ideas
const ideas = await generateWritingIdeas(args.topic, args.count)
return { ideas }`
                },
                {
                    name: 'writeContent',
                    description: 'Write creative content',
                    schema: `z.object({
  prompt: z.string(),
  style: z.string().optional(),
  wordCount: z.number().optional()
})`,
                    handler: `// Write creative content
const content = await writeCreativeContent(args)
return { content }`
                },
                {
                    name: 'editContent',
                    description: 'Edit and improve existing content',
                    schema: `z.object({
  content: z.string(),
  focus: z.enum(['grammar', 'style', 'clarity', 'all']).optional()
})`,
                    handler: `// Edit content
const edited = await editContent(args.content, args.focus)
return { edited }`
                },
                {
                    name: 'generateTitle',
                    description: 'Generate catchy titles',
                    schema: `z.object({
  content: z.string(),
  count: z.number().optional().default(3)
})`,
                    handler: `// Generate titles
const titles = await generateTitles(args.content, args.count)
return { titles }`
                }
            ]
        }
    },
    {
        id: 'morphic-search',
        name: 'Morphic Search Agent',
        description: 'An agent that leverages Morphic\'s powerful search capabilities',
        icon: 'Search',
        config: {
            name: 'Morphic Search Assistant',
            model: 'openai:gpt-4o-mini',
            instructions: 'You are a search specialist using Morphic\'s advanced search tools to find and analyze information.',
            contexts: [
                {
                    name: 'Morphic Search Context',
                    type: 'morphic-search',
                    description: 'Context for using Morphic search tools',
                    schema: `z.object({
  query: z.string(),
  searchDepth: z.enum(['basic', 'advanced']).optional().default('basic'),
  includeDomains: z.array(z.string()).optional(),
  excludeDomains: z.array(z.string()).optional()
})`,
                    instructions: 'Use Morphic\'s search capabilities to find accurate and relevant information. Always verify sources and provide citations.',
                    selectedActions: ['morphicSearch', 'morphicRetrieve', 'morphicVideoSearch']
                }
            ],
            actions: [
                {
                    name: 'morphicSearch',
                    description: 'Search using Morphic\'s search engine',
                    schema: `z.object({
  query: z.string(),
  maxResults: z.number().optional().default(10),
  searchDepth: z.enum(['basic', 'advanced']).optional().default('basic')
})`,
                    handler: `// Use Morphic's search
const results = await search(
  args.query,
  args.maxResults,
  args.searchDepth
)
return results`
                },
                {
                    name: 'morphicRetrieve',
                    description: 'Retrieve content from a specific URL',
                    schema: `z.object({
  url: z.string().url()
})`,
                    handler: `// Retrieve content from URL
const content = await retrieve(args.url)
return { content }`
                },
                {
                    name: 'morphicVideoSearch',
                    description: 'Search for videos',
                    schema: `z.object({
  query: z.string()
})`,
                    handler: `// Search for videos
const videos = await videoSearch(args.query)
return { videos }`
                }
            ]
        }
    }
]

export function getTemplateById(id: string): AgentTemplate | undefined {
    return agentTemplates.find(template => template.id === id)
}

export function getTemplatesByCategory(category: string): AgentTemplate[] {
    // In the future, we can add categories to templates
    return agentTemplates
} 