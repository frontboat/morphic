import { createMorphicAgent, searchContext } from '@/lib/agents/daydreams-config'
import { getMorphicActions } from '@/lib/agents/search-integration'
import { Model } from '@/lib/types/models'
import { CoreMessage } from 'ai'

interface CreateDaydreamsStreamOptions {
    messages: CoreMessage[]
    model: Model
    chatId: string
    searchMode: boolean
    userId?: string
}

function extractTextFromContent(content: any): string {
    if (typeof content === 'string') return content
    if (Array.isArray(content)) {
        const textPart = content.find(part => part.type === 'text')
        return textPart?.text || ''
    }
    return ''
}

export async function createDaydreamsStreamResponse({
    messages,
    model,
    chatId,
    searchMode,
    userId
}: CreateDaydreamsStreamOptions) {
    const encoder = new TextEncoder()
    const stream = new TransformStream()
    const writer = stream.writable.getWriter()

        // Run the Daydreams agent in the background
        ; (async () => {
            try {
                // Create the agent with the selected model
                const agent = createMorphicAgent(model)
                await agent.start()

                // Get the latest user message
                const lastMessage = messages[messages.length - 1]
                if (!lastMessage || lastMessage.role !== 'user') {
                    await writer.write(encoder.encode(`3:${JSON.stringify("No user message found")}\n`))
                    await writer.close()
                    return
                }

                const userQuery = extractTextFromContent(lastMessage.content)

                // Track the current message content for streaming
                let currentContent = ''
                let hasStartedStreaming = false

                // Send the message to the agent
                const logs = await agent.send({
                    context: searchContext,
                    args: {
                        sessionId: chatId,
                        query: userQuery,
                        searchMode
                    },
                    input: {
                        type: 'chat',
                        data: {
                            query: userQuery,
                            searchMode,
                            messages: messages.map(m => ({
                                role: m.role,
                                content: extractTextFromContent(m.content)
                            }))
                        }
                    },
                    actions: getMorphicActions(),
                    handlers: {
                        onLogStream: async (log, done) => {
                            // Handle different log types
                            if (log.ref === 'thought') {
                                // Skip streaming individual thought characters
                                // We'll handle complete thoughts in the action results
                                return
                            } else if (log.ref === 'action_result') {
                                // Handle action results
                                if (log.name === 'respondToChat') {
                                    const chatData = (log as any).data
                                    if (chatData.response) {
                                        // Stream the chat response
                                        const responseText = chatData.response
                                        await writer.write(encoder.encode(`0:${JSON.stringify(responseText)}\n`))
                                        currentContent += responseText

                                        // Add suggestions if available
                                        if (chatData.suggestions && chatData.suggestions.length > 0) {
                                            const suggestionsText = '\n\n💡 **Suggestions:**\n' +
                                                chatData.suggestions.map((s: string) => `- ${s}`).join('\n')
                                            await writer.write(encoder.encode(`0:${JSON.stringify(suggestionsText)}\n`))
                                            currentContent += suggestionsText
                                        }
                                    }
                                } else if (log.name === 'performSearch') {
                                    const searchData = (log as any).data
                                    if (searchData?.results) {
                                        // Format search results
                                        let searchText = '🔍 **Search Results:**\n\n'
                                        searchData.results.forEach((result: any, index: number) => {
                                            searchText += `**${index + 1}. ${result.title}**\n`
                                            searchText += `${result.content}\n`
                                            searchText += `[${result.url}](${result.url})\n\n`
                                        })
                                        await writer.write(encoder.encode(`0:${JSON.stringify(searchText)}\n`))
                                        currentContent += searchText
                                    }
                                }
                            } else if (log.ref === 'output') {
                                // Skip output streaming - we're handling everything in action_result
                                return
                            }
                        },
                        onThinking: async (thought) => {
                            // Skip thinking updates - they're too granular
                            return
                        }
                    }
                })

                // If no content was streamed, provide a default response
                if (!currentContent) {
                    const defaultMessage = "I'm not sure how to respond to that. Could you please rephrase your question?"
                    await writer.write(encoder.encode(`0:${JSON.stringify(defaultMessage)}\n`))
                }

                // Send finish message with metadata
                await writer.write(encoder.encode(`d:${JSON.stringify({ finishReason: "stop", usage: { promptTokens: 0, completionTokens: 0 } })}\n`))

                await writer.close()
            } catch (error) {
                console.error('Daydreams agent error:', error)
                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
                await writer.write(encoder.encode(`3:${JSON.stringify(errorMessage)}\n`))
                await writer.close()
            }
        })()

    return new Response(stream.readable, {
        headers: {
            'Content-Type': 'text/event-stream; charset=utf-8',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no'
        }
    })
} 