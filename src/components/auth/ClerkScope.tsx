import { ClerkProvider } from '@clerk/nextjs'

/* ClerkProvider is deliberately NOT in the root layout.
 *
 * Guneku's 188 public pages are a village record that anyone may read without an account.
 * Mounting the provider at the root would put Clerk's runtime on every one of them —
 * including the homepage a reader opens on a mid-range Android over a throttled connection —
 * to serve a sign-in link they may never use. So the provider is scoped: only the three
 * subtrees that genuinely need a session mount it, and the public site stays account-free by
 * construction rather than by a setting someone could change without noticing.
 *
 * The consequence to remember: Clerk's <SignedIn> / <SignedOut> components do not work
 * outside these subtrees. Public navigation links to /sign-in as a plain link, which is the
 * right behaviour anyway — the header should not change shape depending on who is reading. */
export function ClerkScope({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      /* Signing out returns the reader to the village, not to a sign-in wall. In Clerk 7
         this belongs on the provider rather than on each UserButton. */
      afterSignOutUrl="/"
      /* ── The Fondom's own name on the Fondom's own sign-in ──────────────────────────────
       *
       * Clerk's widgets interpolate the *application name* set on the instance, and this
       * instance was never renamed after it was created: `clerk.guneku.org/v1/environment`
       * returns `display_config.application_name: "My Application"`. So a villager signing
       * in to their own village record was greeted with Clerk's factory default.
       *
       * These overrides are the supported way to set what the widgets say, and they are in
       * the repository where they can be reviewed. They do not reach everything: the name
       * on the instance also appears in the verification emails Clerk sends and on the
       * OAuth consent screen, and no amount of code changes those. Renaming the application
       * in the Clerk dashboard is the fix at the source, and it is Marcel's to make.
       *
       * Only the strings that carried the default are overridden. Clerk's own wording for
       * everything else is left alone — this is a defect fix, not a rewrite of somebody
       * else's copy. */
      localization={{
        signIn: {
          start: {
            title: 'Sign in to Guneku Fondom',
            titleCombined: 'Sign in to Guneku Fondom',
          },
        },
        signUp: {
          start: {
            title: 'Join Guneku Fondom',
            titleCombined: 'Join Guneku Fondom',
          },
        },
      }}
      appearance={{
        variables: {
          /* Clerk's own widgets, in Guneku's institutional palette rather than its default
             blue. Same family as the rest of the site: deep green, oxblood accent, paper. */
          colorPrimary:           'oklch(0.320 0.060 158)',
          colorPrimaryForeground: 'oklch(0.965 0.012 85)',
          colorBackground:        'oklch(0.985 0.006 85)',
          colorForeground:        'oklch(0.245 0.022 150)',
          colorMutedForeground:   'oklch(0.470 0.018 150)',
          colorDanger:            'oklch(0.400 0.120 25)',
          colorInput:             'oklch(0.995 0.003 85)',
          borderRadius:           '3px',
          fontFamily:             'var(--font-sans), Inter, system-ui, sans-serif',
        },
        elements: {
          card: 'shadow-none border border-[var(--rule)]',
          formButtonPrimary:
            'bg-[var(--royal-green)] hover:bg-[var(--royal-green)] text-[0.78rem] ' +
            'uppercase tracking-[0.09em] font-bold rounded-[3px] normal-case',
          footerActionLink: 'text-[var(--royal-green)]',
        },
      }}
    >
      {children}
    </ClerkProvider>
  )
}
