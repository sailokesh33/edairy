import { Redis } from '@upstash/redis'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const kv = new Redis({
      url:   process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })

    const { token, medications } = await req.json()
    if (!token) return NextResponse.json({ error: 'No token' }, { status: 400 })

    await kv.set(`fcm:${token}`, JSON.stringify({
      token,
      medications,
      updatedAt: new Date().toISOString(),
    }))

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Subscribe error:', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}