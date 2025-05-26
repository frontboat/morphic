import { getModels } from '@/lib/config/models'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const models = await getModels()
        return NextResponse.json({ models })
    } catch (error) {
        console.error('Error fetching models:', error)
        return NextResponse.json({ models: [] }, { status: 500 })
    }
} 