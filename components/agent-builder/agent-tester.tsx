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
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import {
  AlertCircle,
  Brain,
  CheckCircle,
  Clock,
  Loader2,
  MessageSquare,
  Play,
  Zap
} from 'lucide-react'
import { useState } from 'react'

interface LogEntry {
  id: string
  type: 'thought' | 'action' | 'result' | 'output' | 'error' | 'info'
  content: string
  timestamp: Date
  metadata?: any
}

interface AgentTesterProps {
  agentConfig: {
    name: string
    model?: string
    instructions: string
    contexts: any[]
    actions: any[]
    personality?: any
  }
  onTest?: (query: string) => Promise<void>
}

export function AgentTester({ agentConfig, onTest }: AgentTesterProps) {
  const [query, setQuery] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [executionTime, setExecutionTime] = useState<number | null>(null)

  const addLog = (type: LogEntry['type'], content: string, metadata?: any) => {
    setLogs(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        type,
        content,
        timestamp: new Date(),
        metadata
      }
    ])
  }

  const handleTest = async () => {
    if (!query.trim()) return

    setIsRunning(true)
    setLogs([])
    setExecutionTime(null)
    const startTime = Date.now()

    try {
      // Log agent configuration
      addLog(
        'info',
        `Starting ${agentConfig.name} with model: ${
          agentConfig.model || 'default'
        }`
      )

      if (agentConfig.personality) {
        addLog('info', `Using personality: ${agentConfig.personality.name}`)
      }

      // Log available actions
      if (agentConfig.actions.length > 0) {
        addLog(
          'info',
          `Available actions: ${agentConfig.actions
            .map(a => a.name)
            .join(', ')}`
        )
      }

      // Simulate agent execution with more realistic flow
      addLog(
        'thought',
        'Analyzing the query and determining the best approach...'
      )

      await new Promise(resolve => setTimeout(resolve, 800))

      // Check if any actions match the query
      const relevantActions = agentConfig.actions.filter(
        action =>
          query.toLowerCase().includes(action.name.toLowerCase()) ||
          action.description?.toLowerCase().includes(query.toLowerCase())
      )

      if (relevantActions.length > 0) {
        for (const action of relevantActions) {
          addLog('action', `Calling ${action.name}`, {
            action: action.name,
            description: action.description,
            args: { query }
          })

          await new Promise(resolve => setTimeout(resolve, 1200))

          addLog('result', `${action.name} completed successfully`, {
            action: action.name,
            resultCount: Math.floor(Math.random() * 10) + 1
          })
        }
      } else if (agentConfig.actions.length > 0) {
        // Use a default action if available
        const defaultAction = agentConfig.actions[0]
        addLog('action', `Using default action: ${defaultAction.name}`, {
          action: defaultAction.name,
          args: { query }
        })

        await new Promise(resolve => setTimeout(resolve, 1000))

        addLog('result', 'Action completed')
      }

      await new Promise(resolve => setTimeout(resolve, 600))

      addLog('thought', 'Processing results and formulating response...')

      await new Promise(resolve => setTimeout(resolve, 1000))

      // Generate output based on personality if available
      let outputMessage = 'Based on my analysis, here is what I found...'
      if (
        agentConfig.personality &&
        agentConfig.personality.speechExamples.length > 0
      ) {
        const example =
          agentConfig.personality.speechExamples[
            Math.floor(
              Math.random() * agentConfig.personality.speechExamples.length
            )
          ]
        outputMessage = `${example} Here's what I found about "${query}"...`
      }

      addLog('output', outputMessage)

      // Call the actual test function if provided
      if (onTest) {
        await onTest(query)
      }

      const endTime = Date.now()
      setExecutionTime(endTime - startTime)

      addLog(
        'info',
        `Execution completed in ${((endTime - startTime) / 1000).toFixed(2)}s`
      )
    } catch (error) {
      addLog(
        'error',
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    } finally {
      setIsRunning(false)
    }
  }

  const getLogIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'thought':
        return <Brain className="w-4 h-4" />
      case 'action':
        return <Zap className="w-4 h-4" />
      case 'result':
        return <CheckCircle className="w-4 h-4" />
      case 'output':
        return <MessageSquare className="w-4 h-4" />
      case 'error':
        return <AlertCircle className="w-4 h-4" />
      case 'info':
        return <Clock className="w-4 h-4" />
    }
  }

  const getLogColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'thought':
        return 'text-blue-600 dark:text-blue-400'
      case 'action':
        return 'text-purple-600 dark:text-purple-400'
      case 'result':
        return 'text-green-600 dark:text-green-400'
      case 'output':
        return 'text-gray-900 dark:text-gray-100'
      case 'error':
        return 'text-red-600 dark:text-red-400'
      case 'info':
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Test Your Agent</CardTitle>
          <CardDescription>
            Enter a query to test how your agent responds
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Ask your agent something..."
            className="min-h-[100px]"
            disabled={isRunning}
          />
          <div className="flex items-center justify-between">
            <Button
              onClick={handleTest}
              disabled={isRunning || !query.trim()}
              className="min-w-[120px]"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Test Agent
                </>
              )}
            </Button>
            {executionTime !== null && (
              <span className="text-sm text-muted-foreground">
                Execution time: {(executionTime / 1000).toFixed(2)}s
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {logs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Execution Log</CardTitle>
            <CardDescription>
              Real-time view of your agent&apos;s thinking and actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] w-full pr-4">
              <div className="space-y-3">
                {logs.map(log => (
                  <div
                    key={log.id}
                    className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300"
                  >
                    <div className={cn('mt-0.5', getLogColor(log.type))}>
                      {getLogIcon(log.type)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {log.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {log.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className={cn('text-sm', getLogColor(log.type))}>
                        {log.content}
                      </p>
                      {log.metadata && (
                        <pre className="text-xs text-muted-foreground bg-muted p-2 rounded overflow-x-auto">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {logs.length === 0 && !isRunning && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground mb-2">No test results yet</p>
            <p className="text-sm text-muted-foreground">
              Enter a query above and click &quot;Test Agent&quot; to see how
              your agent responds
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
