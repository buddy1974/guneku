import Link from 'next/link'
import { pageMetadata } from '@/lib/seo'
import { PALACE_EMAIL } from '@/lib/palace-contact'
import { LegalDocument, LegalSection, LegalList } from '@/components/legal/LegalDocument'

/* The Fondom's terms of service.
 *
 * ── What this document refuses to invent ─────────────────────────────────────────────────
 *
 * The legacy Joomla terms at `src/data/pages/terms.json` were 2023 boilerplate. They spoke of
 * "the Company", of "acceptance and consideration of payment", and of law "of cm" — a
 * generator's placeholder for a country code. Guneku charges nobody for anything on this
 * site, is not a company, and has not settled a governing jurisdiction or a dispute
 * procedure. So none of that appears here.
 *
 * What is absent is therefore deliberate: no subscription or payment terms, no warranty
 * beyond the disclaimer, no arbitration clause, no named court, no corporate entity. If the
 * Fondom later establishes any of those, they belong here — written from the decision, not
 * from a template.
 *
 * ── Two things this site genuinely has to say ────────────────────────────────────────────
 *
 * That the record is evidence, and is corrected rather than quietly rewritten. The archive
 * carries migrated material with dates and attributions and has spent real effort not
 * falsifying it, so the accuracy clause promises correction, not perfection.
 *
 * That moderation exists and is human. Claims and contributions carry a status and a
 * reviewer, which is a fact about the schema, so the moderation clause describes what the
 * code actually does rather than reserving rights nobody exercises. */

export const metadata = pageMetadata({
  title: 'Terms of Service',
  description:
    'The terms for using guneku.org — what the site is for, how member accounts and contributions work, what is expected of visitors, and how the Guneku Fondom record is corrected and maintained.',
  path: '/terms',
})

export default function TermsPage() {
  return (
    <LegalDocument
      label="Guneku Fondom"
      title="Terms of Service"
      subtitle="What this website is for, what you may do here, and what the Fondom undertakes in return."
      updated="16 September 2026"
    >
      <LegalSection id="about" heading="About these terms">
        <p>
          <strong>guneku.org</strong> is the official website of Guneku Fondom &mdash; Mbengwi,
          Momo Division, North West Region, Cameroon. By using the site you accept these
          terms. If you do not accept them, please do not use the site.
        </p>
        <p>
          They are written plainly because the people they are written for are villagers,
          indigenes and friends of Guneku rather than lawyers. Nothing here is charged for:
          the site is provided free, by the Fondom, for the community.
        </p>
      </LegalSection>

      <LegalSection id="purpose" heading="What the site is for">
        <p>
          The site is a public record of the Fondom and a meeting place for its people. It
          publishes the history and institutions of Guneku, the Palace and its offices, the
          quarters, development projects, education, news, photographs and films, and a
          register of Guneku indigenes at home and across the diaspora.
        </p>
        <p>
          It is a community and cultural platform. It is not a government service, not a legal
          registry, and not a substitute for the Palace itself. Reading it requires no account.
        </p>
      </LegalSection>

      <LegalSection id="accounts" heading="Member accounts">
        <p>
          You may create an account to take part &mdash; to keep an entry in the indigenes
          register, claim an existing entry as yours, follow a project or a quarter, or put
          something forward for the record. Accounts are handled by our sign-in provider, and
          how account information is treated is set out in our{' '}
          <Link href="/privacy" className="inst-link">Privacy Policy</Link>.
        </p>
        <LegalList>
          <li>Give accurate information about yourself, and keep it accurate.</li>
          <li>Do not create an account in somebody else&rsquo;s name or claim an entry that is not yours.</li>
          <li>Your account is yours; do not let others use it, and tell us if you think it has been misused.</li>
          <li>One person, one account.</li>
        </LegalList>
        <p>
          You are responsible for what is done through your account. You may stop using it at
          any time, and you may ask us to remove it.
        </p>
      </LegalSection>

      <LegalSection id="acceptable-use" heading="Acceptable use">
        <p>Use the site as you would conduct yourself at the Palace. Do not:</p>
        <LegalList>
          <li>Post anything unlawful, abusive, threatening, defamatory or deliberately false.</li>
          <li>Post material that insults the Fon, the Palace, a quarter, a family or a person, or that is intended to inflame division within the community.</li>
          <li>Publish another person&rsquo;s private details &mdash; an address, a telephone number, a photograph &mdash; without their agreement.</li>
          <li>Impersonate anybody, or misrepresent your connection to Guneku, a family or an institution.</li>
          <li>Upload anything containing malicious code.</li>
          <li>Attempt to break, overload, probe or gain unauthorised access to the site or the accounts of others.</li>
          <li>Harvest addresses or personal details from the site, by hand or by machine, or scrape it in bulk.</li>
          <li>Use the site, its content or its register for advertising, political campaigning or unsolicited messaging.</li>
        </LegalList>
      </LegalSection>

      <LegalSection id="your-content" heading="What you submit">
        <p>
          Anything you submit &mdash; a profile entry, a photograph, a contribution to the
          record, a name put forward for the register, a message to the Palace &mdash; remains
          yours. By submitting it you confirm that it is yours to submit, or that you have
          permission, and you give the Fondom permission to store it, and to publish it on
          this site where publication is the point of that submission.
        </p>
        <p>
          A profile entry, a photograph you attach to it, and a contribution accepted into the
          record are meant to be published. A message to the Palace is not: it is
          correspondence, and it is treated as correspondence.
        </p>
        <p>
          You can edit or clear your own profile at any time, and you can withdraw a claim or
          a contribution before or after it has been reviewed. Where something has already
          been published into the record, ask us and we will deal with it.
        </p>
      </LegalSection>

      <LegalSection id="moderation" heading="Review and moderation">
        <p>
          Claims and contributions are reviewed by a person before they change the
          Fondom&rsquo;s record. Each carries a status &mdash; awaiting review, accepted,
          rejected or withdrawn &mdash; and the outcome is kept with it, so that the record
          shows how something entered it.
        </p>
        <p>
          We may decline, edit for clarity, or remove material that breaks these terms, that
          cannot be substantiated, or that would do harm. We may suspend or close an account
          that is used to do any of those things. Where we act on something you submitted and
          you disagree, write to us and we will look at it again.
        </p>
      </LegalSection>

      <LegalSection id="correspondence" heading="Writing to the Palace">
        <p>
          The contact form, the Palace message and the support form deliver to the Palace. We
          read what arrives and the Palace answers what it can, but we cannot promise a reply
          to everything, nor a reply within any particular time.
        </p>
        <p>
          Please do not use these forms for emergencies, and do not send confidential or
          sensitive material through them. For anything urgent, the Palace telephone number is
          published on the <Link href="/contact" className="inst-link">contact page</Link>.
        </p>
      </LegalSection>

      <LegalSection id="accuracy" heading="Accuracy of the record">
        <p>
          A great deal of what this site publishes is history: dates, lineages, offices,
          events and photographs, much of it recovered from older records and from the memory
          of the community. It is assembled carefully and attributed where its source is
          known, but it is a community record and not an authenticated archive. Some of it
          will be incomplete, and some of it will be wrong.
        </p>
        <p>
          Where the record is wrong, we correct it rather than quietly rewrite it. Where
          something is somebody else&rsquo;s word &mdash; a tribute, a quoted document, a title
          given by whoever published it &mdash; it stays as it was recorded, because editing
          evidence to suit the present would destroy the thing the archive exists to keep.
        </p>
        <p>
          If you know something here to be inaccurate, please tell us at{' '}
          <a href={`mailto:${PALACE_EMAIL}`} className="inst-link">{PALACE_EMAIL}</a>. A
          correction from the community is the best way this record improves.
        </p>
      </LegalSection>

      <LegalSection id="intellectual-property" heading="The Fondom&rsquo;s material and yours">
        <p>
          The site&rsquo;s text, design, arrangement, emblems and the collected record are the
          Fondom&rsquo;s, except where they belong to somebody else. Photographs, films and
          documents contributed by members, families or institutions remain theirs, and
          material recovered from other sources remains its owner&rsquo;s and is used as part
          of the Fondom&rsquo;s own record with attribution where the source is known.
        </p>
        <p>
          You may read, link to, quote and share what is published here for personal,
          educational, cultural and community purposes, with attribution to Guneku Fondom.
          Republishing the record wholesale, or using it commercially, needs our permission
          first &mdash; please ask.
        </p>
        <p>
          If you believe something published here infringes your rights, write to{' '}
          <a href={`mailto:${PALACE_EMAIL}`} className="inst-link">{PALACE_EMAIL}</a> with
          enough detail to identify the material, and we will look into it and act where we
          should.
        </p>
      </LegalSection>

      <LegalSection id="external" heading="Links and outside services">
        <p>
          The site links to other places &mdash; social channels, institutions, partner
          organisations and the people who built it. We do not control those sites and are not
          responsible for their content or their handling of your information. Their terms and
          their privacy practices are theirs.
        </p>
        <p>
          The site also depends on outside services for hosting, sign-in, email, security and
          the assistant. They are listed in our{' '}
          <Link href="/privacy" className="inst-link">Privacy Policy</Link>.
        </p>
      </LegalSection>

      <LegalSection id="assistant" heading="Ask Guneku">
        <p>
          The site offers an assistant that answers questions about Guneku from what the site
          publishes. It answers from the record where the record has an answer and declines
          where it does not. It can still be incomplete or mistaken, and it is not the voice of
          the Palace. For anything that matters, check the page it came from or write to the
          Palace.
        </p>
      </LegalSection>

      <LegalSection id="availability" heading="Availability and change">
        <p>
          We aim to keep the site available and current, but it is provided as it is. It may be
          unavailable for maintenance, for a fault, or for reasons outside our control. We may
          add, change, move or withdraw pages and features as the Fondom develops the site, and
          we may change these terms; when we do, the date at the top of this page changes.
          Continuing to use the site after a change means you accept the revised terms.
        </p>
      </LegalSection>

      <LegalSection id="disclaimer" heading="Limits">
        <p>
          The site and everything on it are provided without any guarantee that they are
          complete, accurate, uninterrupted or fit for a particular purpose. Nothing here is
          legal, financial, medical or professional advice, and nothing here creates an
          obligation on the Fondom to any person.
        </p>
        <p>
          To the extent the law allows, Guneku Fondom and those who maintain this site for it
          are not liable for loss or damage arising from your use of the site, from reliance on
          what it publishes, or from its being unavailable. Nothing in these terms limits any
          liability that cannot lawfully be limited.
        </p>
      </LegalSection>

      <LegalSection id="contact" heading="Contact">
        <p>
          Guneku Fondom &mdash; The Palace, Guneku, Mbengwi, Momo Division, North West Region,
          Cameroon.
        </p>
        <p>
          Email <a href={`mailto:${PALACE_EMAIL}`} className="inst-link">{PALACE_EMAIL}</a>, or
          use the <Link href="/contact" className="inst-link">contact page</Link>. See also our{' '}
          <Link href="/privacy" className="inst-link">Privacy Policy</Link>.
        </p>
      </LegalSection>
    </LegalDocument>
  )
}
