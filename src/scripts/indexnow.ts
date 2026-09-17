import { submitUrls, MAX_URLS } from '@/lib/indexnow'

/* Announce that specific pages changed.
 *
 *   npm run indexnow -- /updates/some-new-post /updates
 *
 * Takes the paths on the command line and nothing else. There is no flag that means "all of
 * it": announcing three hundred unchanged pages is a claim that three hundred pages changed,
 * and the protocol's own guidance is that a host which does that stops being listened to.
 * When a rebuild really has changed everything, the sitemap is the thing that says so.
 *
 * Run by a person, after a deploy, when there is something to say. Not wired into the build. */
async function main() {
  const paths = process.argv.slice(2).filter(a => !a.startsWith('-'))
  if (paths.length === 0) {
    console.error('usage: npm run indexnow -- /path [/path ...]')
    console.error(`       at most ${MAX_URLS} at a time; use the sitemap for anything larger`)
    process.exit(2)
  }

  const result = await submitUrls(paths)
  if (!result.ok) {
    console.error(`not submitted: ${result.reason}`)
    process.exit(1)
  }
  console.log(`submitted ${result.submitted.length} URL(s), status ${result.status}:`)
  for (const u of result.submitted) console.log(`  ${u}`)
}

main().catch(err => { console.error(err); process.exit(1) })
