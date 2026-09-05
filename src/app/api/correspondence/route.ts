import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth'
import { apiError } from '@/lib/api-errors'
import { listMyCorrespondence } from '@/lib/db/correspondence'

/* A member's own correspondence with the Palace.
 *
 * Only ever their own. There is no way to ask for anybody else's — no id parameter that
 * selects a sender, no listing endpoint that takes a member, and nothing anywhere that
 * returns another person's letter. The rows come back as `SenderView`, which has no
 * `internal_note` and no `handled_by` field at all. */

export async function GET() {
  try {
    const { userId } = await requireUser()
    const correspondence = await listMyCorrespondence(userId)
    return NextResponse.json({ correspondence })
  } catch (err) {
    return apiError('Correspondence listing failed', err)
  }
}
