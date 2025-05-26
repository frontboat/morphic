'use client'

import { ActionEditor } from '@/components/agent-builder/action-editor'
import { AgentTester } from '@/components/agent-builder/agent-tester'
import { ContextEditor } from '@/components/agent-builder/context-editor'
import {
  Extension,
  ExtensionManager
} from '@/components/agent-builder/extension-manager'
import {
  PersonalityBuilder,
  PersonalityConfig
} from '@/components/agent-builder/personality-builder'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { agentTemplates, getTemplateById } from '@/lib/agents/templates'
import { Model } from '@/lib/types/models'
import {
  Brain,
  Code,
  Download,
  Plus,
  Save,
  Search,
  Settings,
  Sparkles,
  User,
  Zap
} from 'lucide-react'
import { useEffect, useState } from 'react'

export default function AgentBuilderPage() {
  const [agentName, setAgentName] = useState('My Agent')
  const [selectedModel, setSelectedModel] = useState<Model | null>(null)
  const [instructions, setInstructions] = useState('')
  const [contexts, setContexts] = useState<any[]>([])
  const [actions, setActions] = useState<any[]>([])
  const [models, setModels] = useState<Model[]>([])
  const [personality, setPersonality] = useState<
    PersonalityConfig | undefined
  >()
  const [installedExtensions, setInstalledExtensions] = useState<string[]>([])

  useEffect(() => {
    fetch('/api/models')
      .then(res => res.json())
      .then(data => setModels(data.models || []))
      .catch(error => {
        console.error('Error fetching models:', error)
        setModels([])
      })
  }, [])

  const handleAddContext = () => {
    setContexts([
      ...contexts,
      {
        id: Date.now(),
        name: 'New Context',
        type: 'custom-context',
        description: '',
        schema: '',
        instructions: '',
        selectedActions: []
      }
    ])
  }

  const handleAddAction = () => {
    setActions([
      ...actions,
      {
        id: Date.now(),
        name: 'newAction',
        description: '',
        schema: '',
        handler: ''
      }
    ])
  }

  const handleUpdateAction = (updatedAction: any) => {
    setActions(
      actions.map(a => (a.id === updatedAction.id ? updatedAction : a))
    )
  }

  const handleDeleteAction = (id: number) => {
    setActions(actions.filter(a => a.id !== id))
  }

  const handleUpdateContext = (updatedContext: any) => {
    setContexts(
      contexts.map(c => (c.id === updatedContext.id ? updatedContext : c))
    )
  }

  const handleDeleteContext = (id: number) => {
    setContexts(contexts.filter(c => c.id !== id))
  }

  const handleInstallExtension = (extension: Extension) => {
    // Add extension actions to the actions list
    const newActions = extension.actions.map((action, index) => ({
      id: Date.now() + index,
      ...action,
      fromExtension: extension.id
    }))
    setActions([...actions, ...newActions])

    // Add extension contexts if any
    if (extension.contexts) {
      const newContexts = extension.contexts.map((context, index) => ({
        id: Date.now() + index + 1000,
        ...context,
        fromExtension: extension.id
      }))
      setContexts([...contexts, ...newContexts])
    }

    setInstalledExtensions([...installedExtensions, extension.id])
  }

  const handleUninstallExtension = (extensionId: string) => {
    // Remove actions from this extension
    setActions(actions.filter(a => a.fromExtension !== extensionId))

    // Remove contexts from this extension
    setContexts(contexts.filter(c => c.fromExtension !== extensionId))

    setInstalledExtensions(installedExtensions.filter(id => id !== extensionId))
  }

  const handleApplyTemplate = (templateId: string) => {
    const template = getTemplateById(templateId)
    if (!template) return

    setAgentName(template.config.name)
    setInstructions(template.config.instructions)

    // Convert template actions to the format expected by the editor
    const templateActions = template.config.actions.map((action, index) => ({
      id: Date.now() + index,
      ...action
    }))
    setActions(templateActions)

    // Convert template contexts to the format expected by the editor
    const templateContexts = template.config.contexts.map((context, index) => ({
      id: Date.now() + index + 1000,
      ...context
    }))
    setContexts(templateContexts)

    // Set model if specified in template
    if (template.config.model) {
      const [providerId, ...idParts] = template.config.model.split(':')
      const modelId = idParts.join(':')
      const model = models.find(
        m => m.providerId === providerId && m.id === modelId
      )
      if (model) setSelectedModel(model)
    }
  }

  const handleExportCode = () => {
    const code = generateAgentCode()
    const blob = new Blob([code], { type: 'text/typescript' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${agentName.toLowerCase().replace(/\s+/g, '-')}-agent.ts`
    a.click()
    URL.revokeObjectURL(url)
  }

  const generateAgentCode = () => {
    const hasPersonality = personality && personality.traits

    return `import { createDreams, context, action, render } from '@daydreamsai/core'
import { z } from 'zod'

${
  hasPersonality
    ? `// Personality configuration
const character = {
  name: "${personality.name}",
  traits: ${JSON.stringify(personality.traits, null, 2)},
  speechExamples: ${JSON.stringify(personality.speechExamples, null, 2)}
}

const personalityTemplate = \`${instructions}\`
`
    : ''
}

// Define actions
${actions
  .map(
    a => `const ${a.name} = action({
  name: '${a.name}',
  description: '${a.description}',
  ${a.schema ? `schema: ${a.schema},` : ''}
  handler: async (args) => {
    ${a.handler || '// TODO: Implement handler'}
  }
})`
  )
  .join('\n\n')}

// Define contexts
${contexts
  .map(
    c => `const ${c.type.replace(/-/g, '_')} = context({
  type: '${c.type}',
  description: '${c.description}',
  ${c.schema ? `schema: ${c.schema},` : ''}
  instructions: ${
    hasPersonality
      ? 'render(personalityTemplate, character)'
      : `\`${c.instructions || instructions}\``
  },
  actions: [${(c.selectedActions || []).join(', ')}],
  create: async ({ args }) => {
    return {
      // Initialize context state
    }
  }
})`
  )
  .join('\n\n')}

// Create agent
export const ${agentName.toLowerCase().replace(/\s+/g, '')} = createDreams({
  model: ${
    selectedModel
      ? `'${selectedModel.providerId}:${selectedModel.id}'`
      : 'undefined'
  },
  contexts: [${contexts.map(c => c.type.replace(/-/g, '_')).join(', ')}],
  actions: [${actions.map(a => a.name).join(', ')}]
})`
  }

  const agentConfig = {
    name: agentName,
    model: selectedModel
      ? `${selectedModel.providerId}:${selectedModel.id}`
      : undefined,
    instructions,
    contexts,
    actions,
    personality
  }

  const getTemplateIcon = (icon: string) => {
    switch (icon) {
      case 'Brain':
        return <Brain className="w-4 h-4 mr-2" />
      case 'Zap':
        return <Zap className="w-4 h-4 mr-2" />
      case 'Sparkles':
        return <Sparkles className="w-4 h-4 mr-2" />
      case 'Search':
        return <Search className="w-4 h-4 mr-2" />
      default:
        return <Code className="w-4 h-4 mr-2" />
    }
  }

  return (
    <div className="h-screen overflow-hidden flex flex-col">
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-primary" />
              Daydreams Agent Builder
            </h1>
            <p className="text-muted-foreground">
              Build and customize autonomous AI agents with visual tools
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportCode}>
              <Download className="w-4 h-4 mr-2" />
              Export Code
            </Button>
            <Button>
              <Save className="w-4 h-4 mr-2" />
              Save Agent
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Panel - Configuration */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Agent Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="agent-name">Agent Name</Label>
                    <Input
                      id="agent-name"
                      value={agentName}
                      onChange={e => setAgentName(e.target.value)}
                      placeholder="My Research Agent"
                    />
                  </div>

                  <div>
                    <Label>Model</Label>
                    <div className="mt-2">
                      <Select
                        value={
                          selectedModel
                            ? `${selectedModel.providerId}:${selectedModel.id}`
                            : ''
                        }
                        onValueChange={(value: string) => {
                          const [providerId, ...idParts] = value.split(':')
                          const modelId = idParts.join(':')
                          const model = models.find(
                            m => m.providerId === providerId && m.id === modelId
                          )
                          if (model) setSelectedModel(model)
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a model" />
                        </SelectTrigger>
                        <SelectContent>
                          {models
                            .filter(m => m.enabled)
                            .map(model => (
                              <SelectItem
                                key={`${model.providerId}:${model.id}`}
                                value={`${model.providerId}:${model.id}`}
                              >
                                {model.name} ({model.provider})
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="instructions">Default Instructions</Label>
                    <Textarea
                      id="instructions"
                      value={instructions}
                      onChange={e => setInstructions(e.target.value)}
                      placeholder="You are a helpful assistant that..."
                      className="min-h-[100px]"
                    />
                  </div>
                </CardContent>
              </Card>

              <Tabs defaultValue="contexts" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="contexts">
                    <Brain className="w-4 h-4 mr-2" />
                    Contexts
                  </TabsTrigger>
                  <TabsTrigger value="actions">
                    <Zap className="w-4 h-4 mr-2" />
                    Actions
                  </TabsTrigger>
                  <TabsTrigger value="personality">
                    <User className="w-4 h-4 mr-2" />
                    Personality
                  </TabsTrigger>
                  <TabsTrigger value="test">
                    <Settings className="w-4 h-4 mr-2" />
                    Test
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="contexts" className="space-y-4">
                  {contexts.length === 0 ? (
                    <Card>
                      <CardContent className="text-center py-8">
                        <p className="text-muted-foreground mb-4">
                          No contexts defined yet
                        </p>
                        <Button onClick={handleAddContext}>
                          <Plus className="w-4 h-4 mr-2" />
                          Add First Context
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <>
                      {contexts.map(ctx => (
                        <ContextEditor
                          key={ctx.id}
                          context={ctx}
                          availableActions={actions}
                          onUpdate={handleUpdateContext}
                          onDelete={handleDeleteContext}
                        />
                      ))}
                      <Button
                        onClick={handleAddContext}
                        className="w-full"
                        variant="outline"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Another Context
                      </Button>
                    </>
                  )}
                </TabsContent>

                <TabsContent value="actions" className="space-y-4">
                  {actions.length === 0 ? (
                    <Card>
                      <CardContent className="text-center py-8">
                        <p className="text-muted-foreground mb-4">
                          No actions defined yet
                        </p>
                        <Button onClick={handleAddAction}>
                          <Plus className="w-4 h-4 mr-2" />
                          Add First Action
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <>
                      {actions.map(action => (
                        <ActionEditor
                          key={action.id}
                          action={action}
                          onUpdate={handleUpdateAction}
                          onDelete={handleDeleteAction}
                        />
                      ))}
                      <Button
                        onClick={handleAddAction}
                        className="w-full"
                        variant="outline"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Another Action
                      </Button>
                    </>
                  )}
                </TabsContent>

                <TabsContent value="personality" className="space-y-4">
                  <PersonalityBuilder
                    personality={personality}
                    onChange={setPersonality}
                  />
                </TabsContent>

                <TabsContent value="test" className="space-y-4">
                  <AgentTester agentConfig={agentConfig} />
                </TabsContent>
              </Tabs>
            </div>

            {/* Right Panel - Quick Actions & Templates */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Start Templates</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {agentTemplates.map(template => (
                    <Button
                      key={template.id}
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => handleApplyTemplate(template.id)}
                    >
                      {getTemplateIcon(template.icon)}
                      {template.name}
                    </Button>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Extensions</CardTitle>
                  <CardDescription>
                    Enhance your agent with pre-built capabilities
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <ExtensionManager
                    installedExtensions={installedExtensions}
                    onInstall={handleInstallExtension}
                    onUninstall={handleUninstallExtension}
                  />
                  {installedExtensions.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        Installed: {installedExtensions.length}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Resources</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="ghost" className="w-full justify-start">
                    View Documentation
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    Browse Examples
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    Join Community
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
