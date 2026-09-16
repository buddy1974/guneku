import Link from 'next/link'
import { pageMetadata } from '@/lib/seo'
import { PALACE_EMAIL } from '@/lib/palace-contact'
import { LegalDocument, LegalSection, LegalList } from '@/components/legal/LegalDocument'

/* The Fondom's privacy policy.
 *
 * ── Written from the implementation, not from a generator ────────────────────────────────
 *
 * The legacy Joomla site carried a 2023 TermsFeed document at `src/data/pages/
 * privacy-policy.json`. It called Guneku "the Company", defined "Affiliate" in terms of
 * share ownership, and described a service that does not exist. It predates Clerk, the
 * database, the directory, the assistant and the human check, so every concrete claim in it
 * is either wrong or unverifiable. It is inert — no route renders it — and it stays where it
 * is as migrated evidence, but nothing in this page comes from it.
 *
 * What is written here was read off the code: the middleware matcher, `src/lib/db/
 * migrations/*.sql`, the four public form routes, `src/lib/rate-limit.ts`,
 * `src/lib/turnstile.ts`, `src/app/api/indigenes/upload/route.ts`, `src/app/api/ask/route.ts`
 * and `package.json`. Where the code does not establish something — a retention period, a
 * deletion guarantee, a compliance certification — this page does not claim it.
 *
 * ── The two facts most worth keeping true ────────────────────────────────────────────────
 *
 * Reading Guneku requires no account. That is enforced by construction in `middleware.ts`,
 * whose matcher lists the only paths Clerk ever sees, and this page says so first because it
 * is the thing a villager most needs to know.
 *
 * An uploaded photograph is served from a public URL. `@vercel/blob` is called with
 * `access: 'public'`, so the link is unguessable but not private. Saying "your photo is
 * private" would have been the comfortable sentence and the false one.
 *
 * If any of that changes in the code, this page is wrong and must change with it. */

export const metadata = pageMetadata({
  title: 'Privacy Policy',
  description:
    'How Guneku Fondom handles information on guneku.org — what you give us when you write to the Palace or keep a member profile, what is shown publicly, who processes it, and how to ask us about your information.',
  path: '/privacy',
})

export default function PrivacyPage() {
  return (
    <LegalDocument
      label="Guneku Fondom"
      title="Privacy Policy"
      subtitle="What this website collects, why, what it shows publicly, and how to ask us about your information."
      updated="16 September 2026"
    >
      <LegalSection id="who-we-are" heading="Who we are">
        <p>
          Guneku Fondom is a traditional institution in Mbengwi, Momo Division, North West
          Region, Cameroon. <strong>guneku.org</strong> is the Fondom&rsquo;s official
          website: a public record of the Fondom, its Palace, its quarters, its institutions
          and its people at home and in the diaspora. The site is maintained on the
          Fondom&rsquo;s behalf by MaxPromo Digital.
        </p>
        <p>
          In this policy, &ldquo;we&rdquo; means Guneku Fondom, acting through the Palace and
          those who maintain the site for it. If you want to ask anything about this page,
          write to{' '}
          <a href={`mailto:${PALACE_EMAIL}`} className="inst-link">{PALACE_EMAIL}</a> or use
          the <Link href="/contact" className="inst-link">contact page</Link>.
        </p>
      </LegalSection>

      <LegalSection id="reading" heading="Reading Guneku needs no account">
        <p>
          You can read every public page of this site &mdash; the Fondom, the Palace, the
          quarters, the registers, the news, the galleries and the films &mdash; without an
          account, without signing in, and without telling us who you are. This is built into
          the site rather than promised by it: only the member area, the moderation queues and
          a small number of member-only endpoints ever look for a session at all.
        </p>
        <p>
          An account exists so that a villager can take part &mdash; keep an entry in the
          indigenes register, claim an existing entry as their own, follow a project, put
          something forward for the record. It is never needed to read.
        </p>
      </LegalSection>

      <LegalSection id="what-you-give" heading="What you may give us">
        <p>Almost everything here is something you choose to type and send.</p>
        <LegalList>
          <li>
            <strong>Writing to the Palace.</strong> Through the contact form or the
            &ldquo;Talk to the Palace&rdquo; message, you give your name, a topic or subject,
            your message, and an email address or a telephone number so the Palace can reply.
            You are asked to confirm that we may use those details to answer you.
          </li>
          <li>
            <strong>Offering support.</strong> On the support page you give your name, which
            project you are interested in, how you would like to help, an optional message,
            and an email address or telephone number.
          </li>
          <li>
            <strong>Putting a name forward for the directory.</strong> You give details about
            the person being put forward and a way to reach you about the submission.
          </li>
          <li>
            <strong>Asking the assistant.</strong> If you use Ask Guneku, the question you
            type is sent to our assistant provider so an answer can be produced. Do not put
            anything confidential into it.
          </li>
          <li>
            <strong>Keeping a member profile.</strong> If you sign in and build an entry in
            the indigenes register, you choose what to fill in: a name and display name, a
            photograph and cover image, city and country, profession and employer, a short
            biography, your quarter, family lineage and family home, your generation, the
            year you left Guneku, and links to your own website or social accounts.
          </li>
          <li>
            <strong>Taking part as a member.</strong> Claiming an entry, putting a
            contribution forward for the record, following a project or a quarter, and
            corresponding with the Palace as a signed-in member each store what you submitted,
            when, and its status as it is reviewed.
          </li>
        </LegalList>
        <p>
          Please do not send us other people&rsquo;s personal details through these forms
          unless you have a good reason and their agreement.
        </p>
      </LegalSection>

      <LegalSection id="accounts" heading="Accounts and signing in">
        <p>
          Member accounts are handled for us by <strong>Clerk</strong>. When you create an
          account or sign in, Clerk verifies your identity and manages your session. We do not
          see or store your password.
        </p>
        <p>
          Where signing in with <strong>Google</strong> is offered, choosing it means Google
          confirms your identity to Clerk and passes on the basic account details you approve
          &mdash; typically your name and email address. We never receive your Google
          password, and we do not gain access to anything else in your Google account.
        </p>
        <p>
          What the Fondom&rsquo;s own database stores about your account is deliberately
          small: an identifier issued by Clerk, so that your profile, your claims, your
          contributions and what you follow can be recognised as yours, along with a display
          name, an email address, and your country, quarter or chapter where you have given
          them.
        </p>
      </LegalSection>

      <LegalSection id="technical" heading="Information collected in normal operation">
        <LegalList>
          <li>
            <strong>Your network address, for rate limiting.</strong> When you submit a form
            or ask the assistant, the site counts recent requests from your address so that no
            one can flood the Palace inbox or run up the Fondom&rsquo;s costs. These counts
            are held in the memory of the running server, are not written to the database, and
            are lost whenever the site is redeployed or the server restarts.
          </li>
          <li>
            <strong>The human check.</strong> Public forms may show a Cloudflare Turnstile
            challenge to tell a person from an automated script. Cloudflare receives what it
            needs to decide that and returns a pass or a fail. The result is all we act on.
          </li>
          <li>
            <strong>Audience and performance measurement.</strong> The site uses Vercel
            Analytics and Speed Insights to count page views and measure how quickly pages
            load. This is aggregate measurement &mdash; it is not used to build a profile of
            you, and it does not use cookies to identify you.
          </li>
          <li>
            <strong>Server logs.</strong> Our hosting keeps ordinary technical records of
            requests and errors, which is how faults get found and fixed.
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection id="cookies" heading="Cookies and what is stored in your browser">
        <p>
          This site sets <strong>no advertising and no tracking cookies</strong>, and it does
          not sell or share data with advertising networks.
        </p>
        <p>
          The one cookie that matters is the sign-in session cookie set by Clerk when you sign
          in, which is what keeps you signed in as you move between member pages. If you never
          sign in, you never receive it. The site stores nothing else in your browser for its
          own purposes.
        </p>
      </LegalSection>

      <LegalSection id="how-we-use" heading="How we use what you give us">
        <LegalList>
          <li>To read, answer and keep track of correspondence sent to the Palace.</li>
          <li>To respond to an offer of support and to discuss a project with you.</li>
          <li>To consider a name put forward for the indigenes register.</li>
          <li>To show your entry in the register, as you have chosen to show it.</li>
          <li>
            To review claims and contributions, so that what enters the Fondom&rsquo;s record
            has been checked by a person.
          </li>
          <li>To keep the site working, to keep it secure, and to prevent abuse.</li>
          <li>To understand, in aggregate, which parts of the record people use.</li>
        </LegalList>
        <p>
          We do not sell your information. We do not use it for advertising. We do not use
          what you send the Palace as material for anything other than answering you and
          keeping the Palace&rsquo;s own record of the correspondence.
        </p>
      </LegalSection>

      <LegalSection id="public-private" heading="What is public and what is not">
        <p>
          This distinction matters more here than almost anywhere else on the site, so it is
          worth being exact.
        </p>
        <p><strong>Public &mdash; visible to anyone on the internet:</strong></p>
        <LegalList>
          <li>
            The entry you build in the indigenes register, if it is marked as publicly
            visible. This is the point of the register, and a profile is publicly visible by
            default &mdash; you can change that yourself at any time from your profile page.
          </li>
          <li>
            Any photograph or cover image you upload. Images are stored with our hosting
            provider and served from a public web address. The address is not guessable, but
            it is not protected: anybody who has the link can open the image, and it may stay
            reachable after you replace it. Please do not upload anything you would not put on
            a public noticeboard.
          </li>
          <li>Anything of yours that the Palace reviews and publishes into the record.</li>
        </LegalList>
        <p><strong>Not public &mdash; seen by the Palace and those who help it:</strong></p>
        <LegalList>
          <li>
            Everything you write through the contact form, the Palace message, a support offer
            or a directory submission, together with the email address or telephone number you
            gave for a reply.
          </li>
          <li>
            Your email address and telephone number generally. These are not displayed on your
            public entry.
          </li>
          <li>
            Your community member record, which starts <em>not</em> publicly visible, does not
            show your quarter unless you ask it to, and does not mark you as contactable
            unless you choose that.
          </li>
          <li>
            A claim or a contribution while it is being reviewed, and the reviewer&rsquo;s
            notes on it.
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection id="providers" heading="Who else handles this information">
        <p>
          The site is built on services that process information on our behalf. These are the
          ones actually in use:
        </p>
        <LegalList>
          <li><strong>Vercel</strong> &mdash; hosting, image and file storage, audience and performance measurement.</li>
          <li><strong>Clerk</strong> &mdash; member accounts, sign-in and sessions.</li>
          <li><strong>Neon</strong> &mdash; the database holding profiles, claims, contributions, follows and Palace correspondence.</li>
          <li><strong>Resend</strong> &mdash; delivering form submissions and notifications by email.</li>
          <li><strong>Cloudflare</strong> &mdash; the Turnstile human check on public forms.</li>
          <li><strong>Anthropic</strong> &mdash; producing answers for the Ask Guneku assistant.</li>
          <li><strong>Google</strong> &mdash; only where you choose to sign in with a Google account.</li>
        </LegalList>
        <p>
          Each is used for that purpose and no other. We may also disclose information where
          the law requires it, or where it is necessary to protect the Fondom, the site or
          the people who use it.
        </p>
      </LegalSection>

      <LegalSection id="international" heading="Where information is processed">
        <p>
          Guneku is in Cameroon and its community is spread across many countries. The
          services listed above operate internationally, so information you send through this
          site is likely to be processed on servers outside Cameroon, including in Europe and
          the United States. If that matters to you, the contact page and the Palace telephone
          number remain open to you and neither goes through this website.
        </p>
      </LegalSection>

      <LegalSection id="retention" heading="How long information is kept">
        <p>
          We will be plain rather than precise here, because inventing a timetable we do not
          operate would be worse than admitting we have not set one.
        </p>
        <LegalList>
          <li>
            <strong>Correspondence with the Palace</strong> is kept while it is being handled
            and afterwards as part of the Palace&rsquo;s own record of who wrote and what was
            answered.
          </li>
          <li>
            <strong>Your member profile</strong> is kept for as long as you keep it. You can
            change or clear its fields yourself, and clearing a field removes that value.
          </li>
          <li>
            <strong>Claims and contributions</strong> are kept with their outcome, so that the
            record shows how something entered it and who checked it.
          </li>
          <li>
            <strong>Rate-limiting counts</strong> are not retained at all, as described above.
          </li>
        </LegalList>
        <p>
          We have not set fixed deletion periods for the categories above. If you want
          something removed, ask us and we will deal with it.
        </p>
      </LegalSection>

      <LegalSection id="security" heading="Security">
        <p>
          Pages are served over an encrypted connection. Member actions are checked on the
          server, not merely hidden in the browser, and a member can only reach their own
          records. Moderation pages check the reviewer&rsquo;s role on the server before
          showing anything. Public forms carry a hidden trap for automated submissions, a rate
          limit, and the human check. Keys and secrets stay on the server and are never sent
          to your browser.
        </p>
        <p>
          No website can promise perfect security, and we do not. If you believe something
          about this site is unsafe, please tell us at{' '}
          <a href={`mailto:${PALACE_EMAIL}`} className="inst-link">{PALACE_EMAIL}</a> before
          telling anyone else, and we will act on it.
        </p>
      </LegalSection>

      <LegalSection id="your-choices" heading="Your choices, and how to make a request">
        <p>Some of this you can do yourself, signed in:</p>
        <LegalList>
          <li>Edit any field of your profile, or clear it.</li>
          <li>Change whether your entry is publicly visible.</li>
          <li>Change whether you are shown as open to connect or willing to mentor.</li>
          <li>Withdraw a claim or a contribution you have put forward.</li>
          <li>Stop following a project, a quarter or a topic.</li>
        </LegalList>
        <p>
          For anything else &mdash; a copy of what we hold about you, a correction, removal of
          your entry or of correspondence, or a question about any of this &mdash; write to{' '}
          <a href={`mailto:${PALACE_EMAIL}`} className="inst-link">{PALACE_EMAIL}</a>. Tell us
          what you are asking for and how to recognise your records. There is no automated
          account-deletion button on this site; removal is done by asking us, and we will
          confirm when it is done.
        </p>
        <p>
          Depending on where you live, local law may give you further rights over your
          information. We will honour a reasonable request of that kind whether or not a
          particular law applies to us.
        </p>
      </LegalSection>

      <LegalSection id="children" heading="Children">
        <p>
          The Guneku record is written for the whole community and is open to any reader,
          including children. Member accounts, however, are meant for adults and for older
          young people acting with their family&rsquo;s knowledge, and we do not set out to
          collect information from young children.
        </p>
        <p>
          If you are a parent or guardian and believe a child has given us information through
          this site, write to{' '}
          <a href={`mailto:${PALACE_EMAIL}`} className="inst-link">{PALACE_EMAIL}</a> and we
          will remove it.
        </p>
      </LegalSection>

      <LegalSection id="changes" heading="Changes to this policy">
        <p>
          The site changes as the Fondom builds it, and this page changes with it. When it
          does, the date at the top changes too. If a change materially affects what happens
          to information you have already given us, we will say so on the site rather than
          leave you to notice.
        </p>
      </LegalSection>

      <LegalSection id="contact" heading="Contact">
        <p>
          Guneku Fondom &mdash; The Palace, Guneku, Mbengwi, Momo Division, North West Region,
          Cameroon.
        </p>
        <p>
          Email <a href={`mailto:${PALACE_EMAIL}`} className="inst-link">{PALACE_EMAIL}</a>,
          or use the <Link href="/contact" className="inst-link">contact page</Link>, where the
          Palace telephone number is also published. See also our{' '}
          <Link href="/terms" className="inst-link">Terms of Service</Link>.
        </p>
      </LegalSection>
    </LegalDocument>
  )
}
