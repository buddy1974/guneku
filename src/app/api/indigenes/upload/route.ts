import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { requireUser, authErrorResponse } from '@/lib/auth'
import { rateLimited, senderKey, RATE_LIMIT_MESSAGE } from '@/lib/rate-limit'

/* Profile image upload. Part of closing R-023, and the more exposed half of it.
 *
 * This route previously had no session check and wrote every file under
 * `indigenes/demo-user/`, which made it an open door: anyone could put arbitrary images into
 * the project's blob store, without limit, and have them served from Guneku's own hosting.
 * Storage cost was the smaller problem; hosting a stranger's content under the Fondom's name
 * was the larger one.
 *
 * Now: a Clerk session is required, the path is scoped to that session's own user id, and
 * the upload is rate limited. The extension is derived from the verified content type rather
 * than from the client-supplied filename, so a name like `photo.html` cannot decide how the
 * file is served. */

const MAX_BYTES = 5 * 1024 * 1024

/* Only formats a browser will render as an image, mapped from the sniffed content type. An
   SVG is deliberately absent: it can carry script, and it would be served from our origin. */
const EXT_FOR_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png':  'png',
  'image/webp': 'webp',
  'image/gif':  'gif',
  'image/avif': 'avif',
}

const TYPES = new Set(['avatar', 'cover'])

export async function POST(req: NextRequest) {
  try {
    const { userId } = await requireUser()

    if (rateLimited('indigene-upload', senderKey(req))) {
      return NextResponse.json({ error: RATE_LIMIT_MESSAGE }, { status: 429 })
    }

    const formData = await req.formData()
    const file     = formData.get('file')
    const rawType  = formData.get('type')
    const type     = typeof rawType === 'string' && TYPES.has(rawType) ? rawType : 'avatar'

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 })
    }

    const ext = EXT_FOR_TYPE[file.type]
    if (!ext) {
      return NextResponse.json(
        { error: 'Please upload a JPEG, PNG, WebP, GIF or AVIF image.' },
        { status: 400 },
      )
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'That image is larger than 5MB.' }, { status: 400 })
    }

    /* Scoped to the session's own id. A caller cannot write into another member's folder,
       because they never get to say whose folder it is. */
    const filename = `indigenes/${userId}/${type}-${Date.now()}.${ext}`

    const blob = await put(filename, file, {
      access:      'public',
      contentType: file.type,
    })

    return NextResponse.json({ url: blob.url })
  } catch (err) {
    const { body, status } = authErrorResponse(err)
    return NextResponse.json(body, { status })
  }
}
