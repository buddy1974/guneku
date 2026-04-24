import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File
  const type = (formData.get('type') as string) || 'avatar'

  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Images only' }, { status: 400 })
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'Max 5MB' }, { status: 400 })
  }

  const ext      = file.name.split('.').pop()
  const filename = `${userId}/${type}-${Date.now()}.${ext}`
  const buffer   = Buffer.from(await file.arrayBuffer())

  const { error } = await supabaseAdmin.storage
    .from('indigene-photos')
    .upload(filename, buffer, {
      contentType: file.type,
      upsert: true,
    })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: urlData } = supabaseAdmin.storage
    .from('indigene-photos')
    .getPublicUrl(filename)

  return NextResponse.json({ url: urlData.publicUrl })
}
