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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Brain, ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import { useState } from 'react'

interface ContextEditorProps {
  context: {
    id: number
    name: string
    type: string
    description: string
    schema?: string
    instructions?: string
    selectedActions?: string[]
  }
  availableActions: Array<{ id: number; name: string }>
  onUpdate: (context: any) => void
  onDelete: (id: number) => void
}

export function ContextEditor({
  context,
  availableActions,
  onUpdate,
  onDelete
}: ContextEditorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [localContext, setLocalContext] = useState(context)

  const handleUpdate = (field: string, value: any) => {
    const updated = { ...localContext, [field]: value }
    setLocalContext(updated)
    onUpdate(updated)
  }

  const toggleAction = (actionName: string) => {
    const currentActions = localContext.selectedActions || []
    const updated = currentActions.includes(actionName)
      ? currentActions.filter(a => a !== actionName)
      : [...currentActions, actionName]
    handleUpdate('selectedActions', updated)
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              <CardTitle className="text-base">{localContext.name}</CardTitle>
              <Badge variant="secondary">Context</Badge>
            </div>
            <div className="flex items-center gap-2">
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(!isOpen)}
                >
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(context.id)}
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          </div>
          {localContext.description && (
            <CardDescription>{localContext.description}</CardDescription>
          )}
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor={`context-name-${context.id}`}>Context Name</Label>
              <Input
                id={`context-name-${context.id}`}
                value={localContext.name}
                onChange={e => handleUpdate('name', e.target.value)}
                placeholder="My Context"
              />
            </div>

            <div>
              <Label htmlFor={`context-type-${context.id}`}>
                Type Identifier
              </Label>
              <Input
                id={`context-type-${context.id}`}
                value={localContext.type}
                onChange={e => handleUpdate('type', e.target.value)}
                placeholder="my-context"
                pattern="[a-z0-9-]+"
              />
            </div>

            <div>
              <Label htmlFor={`context-desc-${context.id}`}>Description</Label>
              <Input
                id={`context-desc-${context.id}`}
                value={localContext.description}
                onChange={e => handleUpdate('description', e.target.value)}
                placeholder="What is this context for?"
              />
            </div>

            <div>
              <Label htmlFor={`context-instructions-${context.id}`}>
                Instructions
              </Label>
              <Textarea
                id={`context-instructions-${context.id}`}
                value={localContext.instructions || ''}
                onChange={e => handleUpdate('instructions', e.target.value)}
                placeholder="You are an AI assistant that helps with..."
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor={`context-schema-${context.id}`}>
                Schema (Zod)
              </Label>
              <Textarea
                id={`context-schema-${context.id}`}
                value={localContext.schema || ''}
                onChange={e => handleUpdate('schema', e.target.value)}
                placeholder={`z.object({
  topic: z.string(),
  depth: z.enum(['shallow', 'deep']).optional()
})`}
                className="font-mono text-sm"
                rows={4}
              />
            </div>

            <div>
              <Label>Available Actions</Label>
              <div className="mt-2 space-y-2">
                {availableActions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No actions defined yet
                  </p>
                ) : (
                  availableActions.map(action => (
                    <label
                      key={action.id}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={(localContext.selectedActions || []).includes(
                          action.name
                        )}
                        onChange={() => toggleAction(action.name)}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">{action.name}</span>
                    </label>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}
