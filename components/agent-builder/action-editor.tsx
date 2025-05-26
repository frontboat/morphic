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
import { ChevronDown, ChevronUp, Code, Trash2 } from 'lucide-react'
import { useState } from 'react'

interface ActionEditorProps {
  action: {
    id: number
    name: string
    description: string
    schema?: string
    handler: string
  }
  onUpdate: (action: any) => void
  onDelete: (id: number) => void
}

export function ActionEditor({
  action,
  onUpdate,
  onDelete
}: ActionEditorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [localAction, setLocalAction] = useState(action)

  const handleUpdate = (field: string, value: string) => {
    const updated = { ...localAction, [field]: value }
    setLocalAction(updated)
    onUpdate(updated)
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4" />
              <CardTitle className="text-base">{localAction.name}</CardTitle>
              <Badge variant="secondary">Action</Badge>
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
                onClick={() => onDelete(action.id)}
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          </div>
          {localAction.description && (
            <CardDescription>{localAction.description}</CardDescription>
          )}
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor={`action-name-${action.id}`}>Action Name</Label>
              <Input
                id={`action-name-${action.id}`}
                value={localAction.name}
                onChange={e => handleUpdate('name', e.target.value)}
                placeholder="myAction"
              />
            </div>

            <div>
              <Label htmlFor={`action-desc-${action.id}`}>Description</Label>
              <Input
                id={`action-desc-${action.id}`}
                value={localAction.description}
                onChange={e => handleUpdate('description', e.target.value)}
                placeholder="What does this action do?"
              />
            </div>

            <div>
              <Label htmlFor={`action-schema-${action.id}`}>Schema (Zod)</Label>
              <Textarea
                id={`action-schema-${action.id}`}
                value={localAction.schema || ''}
                onChange={e => handleUpdate('schema', e.target.value)}
                placeholder={`z.object({
  query: z.string(),
  limit: z.number().optional()
})`}
                className="font-mono text-sm"
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor={`action-handler-${action.id}`}>
                Handler Function
              </Label>
              <Textarea
                id={`action-handler-${action.id}`}
                value={localAction.handler}
                onChange={e => handleUpdate('handler', e.target.value)}
                placeholder={`// Your action logic here
const result = await fetch(...)
return result`}
                className="font-mono text-sm"
                rows={6}
              />
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}
