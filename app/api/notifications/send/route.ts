import { Redis } from '@upstash/redis'
const kv = new Redis({
  url:   process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})
import { getAdminMessaging } from '@/lib/firebase-admin'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const keys = await kv.keys('fcm:*')
    if (!keys.length) return NextResponse.json({ sent: 0 })

    const now = new Date()
    const currentTime = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`

    let sent = 0

    for (const key of keys) {
      const data = await kv.get<{ token: string; medications: any[] }>(key)
      if (!data) continue

      for (const med of data.medications) {
        if (!med.active || !med.times) continue
        for (const time of med.times) {
          if (time === currentTime) {
            try {
              await getAdminMessaging().send({
                token: data.token,
                notification: {
                  title: 'Medication reminder 💊',
                  body:  `Time to take ${med.name} ${med.dose}`,
                },
                webpush: {
                  notification: {
                    icon:               '/icons/icon-192.png',
                    badge:              '/icons/icon-192.png',
                    requireInteraction: true,
                    silent:             false,
                    vibrate:            [200, 100, 200, 100, 200],
                  },
                  fcmOptions: {
                    link: 'https://edairy.vercel.app/medications',
                  },
                },
              })
              sent++
            } catch (e) {
              console.error('Send error:', e)
            }
          }
        }
      }
    }

    return NextResponse.json({ sent })
  } catch (err) {
    console.error('Cron error:', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}