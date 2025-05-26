'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Check, Code, Database, Globe, Plus, Search, Zap } from 'lucide-react'
import { useState } from 'react'

export interface Extension {
  id: string
  name: string
  description: string
  icon: string
  category: 'search' | 'data' | 'automation' | 'integration'
  actions: Array<{
    name: string
    description: string
    schema?: string
    handler: string
  }>
  contexts?: Array<{
    name: string
    type: string
    description: string
    schema?: string
    instructions?: string
  }>
}

const availableExtensions: Extension[] = [
  {
    id: 'morphic-search',
    name: 'Morphic Search',
    description: 'Advanced web search capabilities powered by Morphic',
    icon: 'Search',
    category: 'search',
    actions: [
      {
        name: 'morphicSearch',
        description: 'Search the web using Morphic',
        schema: `z.object({
  query: z.string(),
  maxResults: z.number().optional().default(10),
  searchDepth: z.enum(['basic', 'advanced']).optional()
})`,
        handler: `const results = await search(args.query, args.maxResults, args.searchDepth)
return results`
      },
      {
        name: 'morphicRetrieve',
        description: 'Retrieve content from URLs',
        schema: `z.object({ url: z.string().url() })`,
        handler: `const content = await retrieve(args.url)
return { content }`
      }
    ]
  },
  {
    id: 'web-scraper',
    name: 'Web Scraper',
    description: 'Extract structured data from websites',
    icon: 'Globe',
    category: 'data',
    actions: [
      {
        name: 'scrapeWebsite',
        description: 'Scrape content from a website',
        schema: `z.object({
  url: z.string().url(),
  selector: z.string().optional(),
  format: z.enum(['text', 'html', 'json']).optional()
})`,
        handler: `const data = await scrapeWebsite(args.url, args.selector, args.format)
return { data }`
      }
    ]
  },
  {
    id: 'database-query',
    name: 'Database Query',
    description: 'Query and manipulate database data',
    icon: 'Database',
    category: 'data',
    actions: [
      {
        name: 'queryDatabase',
        description: 'Execute a database query',
        schema: `z.object({
  query: z.string(),
  params: z.array(z.any()).optional()
})`,
        handler: `const results = await db.query(args.query, args.params)
return { results }`
      },
      {
        name: 'insertData',
        description: 'Insert data into database',
        schema: `z.object({
  table: z.string(),
  data: z.record(z.any())
})`,
        handler: `const result = await db.insert(args.table, args.data)
return { id: result.id }`
      }
    ]
  },
  {
    id: 'api-integration',
    name: 'API Integration',
    description: 'Connect to external APIs and services',
    icon: 'Zap',
    category: 'integration',
    actions: [
      {
        name: 'callAPI',
        description: 'Make HTTP API calls',
        schema: `z.object({
  url: z.string().url(),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE']).optional(),
  headers: z.record(z.string()).optional(),
  body: z.any().optional()
})`,
        handler: `const response = await fetch(args.url, {
  method: args.method || 'GET',
  headers: args.headers,
  body: args.body ? JSON.stringify(args.body) : undefined
})
const data = await response.json()
return { data }`
      }
    ]
  },
  {
    id: 'code-executor',
    name: 'Code Executor',
    description: 'Execute code snippets in various languages',
    icon: 'Code',
    category: 'automation',
    actions: [
      {
        name: 'executeCode',
        description: 'Execute code in a sandboxed environment',
        schema: `z.object({
  language: z.enum(['javascript', 'python', 'typescript']),
  code: z.string()
})`,
        handler: `const result = await executeInSandbox(args.language, args.code)
return { output: result.output, error: result.error }`
      }
    ]
  }
]

interface ExtensionManagerProps {
  installedExtensions: string[]
  onInstall: (extension: Extension) => void
  onUninstall: (extensionId: string) => void
}

export function ExtensionManager({
  installedExtensions,
  onInstall,
  onUninstall
}: ExtensionManagerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredExtensions = availableExtensions.filter(ext => {
    const matchesCategory =
      selectedCategory === 'all' || ext.category === selectedCategory
    const matchesSearch =
      ext.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ext.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const getIcon = (icon: string) => {
    switch (icon) {
      case 'Search':
        return <Search className="w-5 h-5" />
      case 'Globe':
        return <Globe className="w-5 h-5" />
      case 'Database':
        return <Database className="w-5 h-5" />
      case 'Zap':
        return <Zap className="w-5 h-5" />
      case 'Code':
        return <Code className="w-5 h-5" />
      default:
        return <Zap className="w-5 h-5" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'search':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'data':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'automation':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'integration':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Browse Extensions
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Extension Marketplace</DialogTitle>
          <DialogDescription>
            Add pre-built actions and contexts to enhance your agent
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Search extensions..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="search">Search</SelectItem>
                <SelectItem value="data">Data</SelectItem>
                <SelectItem value="automation">Automation</SelectItem>
                <SelectItem value="integration">Integration</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {filteredExtensions.map(extension => {
                const isInstalled = installedExtensions.includes(extension.id)

                return (
                  <Card key={extension.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-muted rounded-lg">
                            {getIcon(extension.icon)}
                          </div>
                          <div>
                            <CardTitle className="text-lg">
                              {extension.name}
                            </CardTitle>
                            <CardDescription>
                              {extension.description}
                            </CardDescription>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge
                                className={getCategoryColor(extension.category)}
                              >
                                {extension.category}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {extension.actions.length} actions
                                {extension.contexts &&
                                  `, ${extension.contexts.length} contexts`}
                              </span>
                            </div>
                          </div>
                        </div>
                        {isInstalled ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onUninstall(extension.id)}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Installed
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => onInstall(extension)}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Install
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">
                          Available Actions:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {extension.actions.map(action => (
                            <Badge key={action.name} variant="secondary">
                              {action.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
