import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { put }  from '@vercel/blob'

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File
  const type = (formData.get('type') as string) || 'avatar'

  if (!file)                         return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  if (!file.type.startsWith('image/')) return NextResponse.json({ error: 'Images only' },      { status: 400 })
  if (file.size > 5 * 1024 * 1024)  return NextResponse.json({ error: 'Max 5MB' },            { status: 400 })

  const ext      = file.name.split('.').pop() || 'jpg'
  const filename = `indigenes/${userId}/${type}-${Date.now()}.${ext}`

  const blob = await put(filename, file, {
    access:      'public',
    contentType: file.type,
  })

  return NextResponse.json({ url: blob.url })
}
