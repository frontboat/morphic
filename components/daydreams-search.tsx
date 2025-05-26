'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useDaydreamsAgent } from '@/hooks/use-daydreams-agent'
import { Model } from '@/lib/types/models'
import { Brain, Loader2, Search } from 'lucide-react'
import { useState } from 'react'

interface DaydreamsSearchProps {
  model: Model
  sessionId: string
}

export function DaydreamsSearch({ model, sessionId }: DaydreamsSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])

  const {
    isReady,
    isProcessing,
    error,
    searchHistory,
    performSearch,
    analyzeResults
  } = useDaydreamsAgent({
    model,
    sessionId,
    searchMode: true
  })

  const handleSearch = async () => {
    if (!query.trim() || !isReady) return

    try {
      const logs = await performSearch(query, {
        searchDepth: 'advanced',
        includeImages: true,
        maxResults: 10
      })

      // Extract results from logs
      const searchResults = logs
        .filter(
          log => log.ref === 'action_result' && log.name === 'performSearch'
        )
        .map(log => (log as any).data)

      if (searchResults.length > 0) {
        setResults(searchResults[0].results || [])
      }
    } catch (err) {
      console.error('Search failed:', err)
    }
  }

  const handleAnalyze = async () => {
    if (results.length === 0) return

    try {
      const logs = await analyzeResults(results)

      // Extract analysis from logs
      const analysis = logs
        .filter(
          log => log.ref === 'action_result' && log.name === 'analyzeResults'
        )
        .map(log => (log as any).data)

      if (analysis.length > 0) {
        console.log('Analysis:', analysis[0])
      }
    } catch (err) {
      console.error('Analysis failed:', err)
    }
  }

  if (!isReady) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Initializing Daydreams agent...</span>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-500">Error: {error.message}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Daydreams AI Search
        </CardTitle>
        <CardDescription>
          Powered by autonomous agent with memory and context awareness
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Ask anything..."
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            disabled={isProcessing}
          />
          <Button
            onClick={handleSearch}
            disabled={isProcessing || !query.trim()}
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>

        {searchHistory.length > 0 && (
          <div className="text-sm text-muted-foreground">
            Search history: {searchHistory.length} searches in this session
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Results</h3>
              <Button
                size="sm"
                variant="outline"
                onClick={handleAnalyze}
                disabled={isProcessing}
              >
                Analyze Results
              </Button>
            </div>
            <div className="space-y-2">
              {results.map((result, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <h4 className="font-medium">{result.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {result.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Agent is thinking...</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
