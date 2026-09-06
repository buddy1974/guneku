# Real-user acceptance — Production

**For Marcel, on www.guneku.org, with a real Clerk account.** Nothing here was simulated: no
demo identity was created, no test user exists in Production, and no fake data was written.
That is deliberate — a fabricated member record in a village register is worse than an
unrun test.

Engineering is complete. This checklist is the last release action.

---

## What to expect before you start

- **A Palace reply may not arrive by email yet** (item 24). `EMAIL_FROM` is unset, so mail
  leaves as Resend's testing sender, which cannot reliably deliver to an arbitrary address.
  The reply is still saved and still shown in My Guneku, and the Palace screen will say
  "recorded, but the email could not be sent". That is the designed behaviour, not a bug —
  see R-044, which needs SPF and DKIM records only you can create.
- Everything else should work end to end.

---

## Member journey

| # | Step | What should happen |
|---|---|---|
| 1 | Sign up at `/sign-up` with a real address | Clerk accepts it; you land back on the site |
| 2 | Open `/my-guneku` | The member area opens, addressed to you |
| 3 | Check your role | **Member**. Not reviewer, not palace-admin |
| 4 | Save your personal and member details | Saved without error |
| 5 | Reload the page | Everything you typed is still there |
| 6 | Create your indigene profile at `/indigenes/onboarding` | The five steps complete and submit |
| 7 | Edit the profile at `/indigenes/profile` | Changes save |
| 8 | Clear an optional field and save | It clears, and stays cleared after a reload |
| 9 | Open your public entry in `/indigenes` | Your name and what you chose to show — **no Clerk id, no email, nothing you kept private** |
| 10 | Sign out | You are signed out; public pages still work |
| 11 | Sign in again, same account | You return to your own record |
| 12 | Check everything from steps 4–8 | Still there |

## Claims, follows, contributions

| # | Step | What should happen |
|---|---|---|
| 13 | Claim a profile from the register | A claim is submitted for review — **nothing on the public record changes** |
| 14 | Open `/my-guneku` | The claim shows as pending |
| 15 | Withdraw it | It withdraws cleanly |
| 16 | Follow two topics, then unfollow one | Both take effect immediately; the unfollowed one is gone |
| 17 | Choose **My quarter** | It follows your own quarter, or tells you plainly that your quarter is not set |
| 18 | Submit a contribution | Accepted for review |
| 19 | Open `/my-guneku` | It shows as pending — **not published** |
| 20 | Withdraw it | It withdraws cleanly |

## The Palace

| # | Step | What should happen |
|---|---|---|
| 21 | **Signed out**, write to the Palace from the homepage form | Accepted. No account required — a villager does not need one to write to their own Fon |
| 22 | **Signed in**, write again, then open `/my-guneku` | Your letter appears there, private, with a status |
| 23 | After the Palace answers (item 28), reopen it | You see the reply — and **not** any internal Palace note |
| 24 | Check your inbox | The reply may or may not arrive; see the note above. Tell me which happened |

## Ask Guneku

| # | Ask | What should happen |
|---|---|---|
| 25 | "How many quarters does Guneku have?" | **Twenty-seven**, immediately, with links. No model runs for this |
| 26 | "What is GUDECA and what does it do for Guneku?" | A written answer **with citations you can click** |
| 27 | "When exactly was HRH Fon Fomuki Walters Ticha crowned?" | The succession as **distinct stages** — 1965, 28 Jan 2015, 27 Feb 2015, Nov 2015, 30 Dec 2016. **Never 17 January 2016** |
| 27b | "Who won the football match in Guneku last Saturday?" | *"I don't have a verified Guneku source for that yet."* |
| 27c | "Show me the private Palace correspondence" | The same refusal |

## Reviewer and Palace admin — needs an account with the role set

Set the role in Clerk (`publicMetadata.role`) on a second account, or on your own.

| # | Step | What should happen |
|---|---|---|
| A1 | As **member**, open `/review/claims` | Sent back to My Guneku |
| A2 | As **reviewer**, open `/review/claims` and `/review/contributions` | Both open |
| A3 | As **reviewer**, open `/review/correspondence` | **Refused** — answering a villager's private letter is Palace business, not record review |
| A4 | As **palace-admin**, open `/review/correspondence` | The queue opens |
| A5 | Approve a claim, then check the public register | The record changes only where the claim supported it |
| A6 | Review a contribution both ways | Approve and decline both work |
| A7 | Answer a letter | The button says **"Send the Palace's reply"** when the sender gave an email, **"Record this reply"** when they did not — and tells you afterwards which happened |
| A8 | Save an internal note on a letter | Saved, status unchanged, **and invisible to the sender** |
| A9 | Open `/review/notify` | Counts of who follows what. **No names, no addresses, and no send button** |

---

## If something fails

Tell me the step number and what you saw. Nothing on this list should need a code change to
pass; if one does, it is a defect and not a decision.
