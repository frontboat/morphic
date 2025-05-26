'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
import { Info } from 'lucide-react'
import { useState } from 'react'

export interface PersonalityTraits {
  aggression: number
  agreeability: number
  openness: number
  conscientiousness: number
  extraversion: number
  neuroticism: number
  empathy: number
  confidence: number
  adaptability: number
  impulsivity: number
}

export interface PersonalityConfig {
  name: string
  traits: PersonalityTraits
  speechExamples: string[]
}

interface PersonalityBuilderProps {
  personality?: PersonalityConfig
  onChange: (personality: PersonalityConfig) => void
}

const traitDescriptions: Record<
  keyof PersonalityTraits,
  { low: string; high: string }
> = {
  aggression: {
    low: 'peaceful, avoids conflict, gentle, accommodating',
    high: 'confrontational, quick to challenge others, assertive, competitive'
  },
  agreeability: {
    low: "competitive, self-focused, skeptical of others' motives",
    high: 'cooperative, helpful, compassionate, team-oriented'
  },
  openness: {
    low: 'conventional, practical, prefers routine and familiarity',
    high: 'curious, creative, enjoys novelty, intellectually exploratory'
  },
  conscientiousness: {
    low: 'spontaneous, flexible, sometimes careless or impulsive',
    high: 'organized, responsible, detail-oriented, plans ahead'
  },
  extraversion: {
    low: 'reserved, prefers solitude, quiet, internally focused',
    high: 'outgoing, energized by social interaction, talkative, attention-seeking'
  },
  neuroticism: {
    low: 'emotionally stable, calm under pressure, resilient',
    high: 'sensitive to stress, prone to worry/anxiety, emotionally reactive'
  },
  empathy: {
    low: "detached, difficulty relating to others' feelings, logical over emotional",
    high: "understanding of others' emotions, compassionate, good listener"
  },
  confidence: {
    low: 'hesitant, self-doubting, seeks validation from others',
    high: 'self-assured, decisive, believes in own abilities'
  },
  adaptability: {
    low: 'rigid, resistant to change, needs structure and routine',
    high: 'flexible in new situations, embraces change, quick to adjust'
  },
  impulsivity: {
    low: 'deliberate, carefully considers consequences, methodical',
    high: 'acts on instinct, spontaneous decisions, thrill-seeking'
  }
}

const defaultPersonality: PersonalityConfig = {
  name: 'Balanced Assistant',
  traits: {
    aggression: 5,
    agreeability: 7,
    openness: 6,
    conscientiousness: 7,
    extraversion: 5,
    neuroticism: 3,
    empathy: 8,
    confidence: 6,
    adaptability: 7,
    impulsivity: 4
  },
  speechExamples: []
}

export function PersonalityBuilder({
  personality = defaultPersonality,
  onChange
}: PersonalityBuilderProps) {
  const [localPersonality, setLocalPersonality] =
    useState<PersonalityConfig>(personality)
  const [speechExamplesText, setSpeechExamplesText] = useState(
    personality.speechExamples.join('\n')
  )

  const handleTraitChange = (
    trait: keyof PersonalityTraits,
    value: number[]
  ) => {
    const updated = {
      ...localPersonality,
      traits: {
        ...localPersonality.traits,
        [trait]: value[0]
      }
    }
    setLocalPersonality(updated)
    onChange(updated)
  }

  const handleNameChange = (name: string) => {
    const updated = { ...localPersonality, name }
    setLocalPersonality(updated)
    onChange(updated)
  }

  const handleSpeechExamplesChange = (text: string) => {
    setSpeechExamplesText(text)
    const examples = text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
    const updated = { ...localPersonality, speechExamples: examples }
    setLocalPersonality(updated)
    onChange(updated)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Personality Configuration</CardTitle>
          <CardDescription>
            Define your agents personality traits and communication style
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="personality-name">Personality Name</Label>
            <input
              id="personality-name"
              type="text"
              value={localPersonality.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleNameChange(e.target.value)
              }
              placeholder="e.g., Friendly Assistant, Analytical Expert"
            />
          </div>

          <div>
            <Label>Personality Traits</Label>
            <p className="text-sm text-muted-foreground mb-4">
              Adjust the sliders to define personality characteristics (1-10
              scale)
            </p>

            <div className="space-y-6">
              {(
                Object.keys(localPersonality.traits) as Array<
                  keyof PersonalityTraits
                >
              ).map(trait => (
                <div key={trait} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="capitalize">
                      {trait.replace(/([A-Z])/g, ' $1').trim()}
                    </Label>
                    <span className="text-sm font-medium">
                      {localPersonality.traits[trait]}
                    </span>
                  </div>
                  <Slider
                    value={[localPersonality.traits[trait]]}
                    onValueChange={value => handleTraitChange(trait, value)}
                    min={1}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Info className="w-3 h-3" />
                      Low: {traitDescriptions[trait].low}
                    </span>
                    <span className="text-right">
                      High: {traitDescriptions[trait].high}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="speech-examples">Speech Examples</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Provide example phrases that demonstrate how this personality
              speaks (one per line)
            </p>
            <Textarea
              id="speech-examples"
              value={speechExamplesText}
              onChange={e => handleSpeechExamplesChange(e.target.value)}
              placeholder={`"Let me help you with that right away!"
"I understand this might be frustrating..."
"Here's what I found after analyzing the data..."
"That's an interesting perspective to consider..."`}
              rows={6}
              className="font-mono text-sm"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Personality Preview</CardTitle>
          <CardDescription>
            How your agents personality will be interpreted
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Dominant Traits:</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(localPersonality.traits)
                  .filter(([_, value]) => value >= 7)
                  .map(([trait, value]) => (
                    <span
                      key={trait}
                      className="px-2 py-1 bg-primary/10 text-primary rounded-md text-sm"
                    >
                      {trait.replace(/([A-Z])/g, ' $1').trim()} ({value}/10)
                    </span>
                  ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Personality Summary:</h4>
              <p className="text-sm text-muted-foreground">
                {generatePersonalitySummary(localPersonality.traits)}
              </p>
            </div>

            {localPersonality.speechExamples.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Example Responses:</h4>
                <ul className="space-y-1">
                  {localPersonality.speechExamples
                    .slice(0, 3)
                    .map((example, i) => (
                      <li
                        key={i}
                        className="text-sm text-muted-foreground italic"
                      >
                        &quot;{example}&quot;
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function generatePersonalitySummary(traits: PersonalityTraits): string {
  const summaryParts: string[] = []

  if (traits.extraversion >= 7) {
    summaryParts.push('outgoing and sociable')
  } else if (traits.extraversion <= 3) {
    summaryParts.push('reserved and introspective')
  }

  if (traits.agreeability >= 7) {
    summaryParts.push('cooperative and helpful')
  } else if (traits.agreeability <= 3) {
    summaryParts.push('independent and competitive')
  }

  if (traits.conscientiousness >= 7) {
    summaryParts.push('organized and detail-oriented')
  } else if (traits.conscientiousness <= 3) {
    summaryParts.push('flexible and spontaneous')
  }

  if (traits.empathy >= 7) {
    summaryParts.push('empathetic and understanding')
  }

  if (traits.confidence >= 7) {
    summaryParts.push('confident and decisive')
  }

  if (traits.openness >= 7) {
    summaryParts.push('creative and curious')
  }

  if (summaryParts.length === 0) {
    return 'A balanced personality with moderate traits across all dimensions.'
  }

  return `This agent is ${summaryParts.join(
    ', '
  )}, creating a unique interaction style that adapts to various situations.`
}
