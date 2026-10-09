---
title: "How to Set Up a Claude Team Plan: Payment, Inviting Members, and Allowing Gmail Addresses"
description: "Want two or more people at your company on Claude with one bill and no training on your content? This screenshot walkthrough covers the whole Claude Team signup: upgrading from the account menu, choosing seats and paying, creating the team, inviting members, adding gmail.com to allowed domains, turning off the invite link so strangers can't take your seats, and what members see when they join. Includes real Taiwan prices as of October 2026."
contentType: "tutorial"
scene: "env-setup"
difficulty: "beginner"
createdAt: "2026-10-10"
verifiedAt: "2026-10-10"
archived: false
order: 5
prerequisites: []
estimatedMinutes: 12
tags: ["Anthropic", "申請", "設定"]
modules: [M06]
stuckOptions:
  "Choosing a plan": ["How is Team different from Pro?", "Standard or Premium seat?", "Can one person open a Team plan?"]
  "Payment": ["Is the $ on checkout USD or local currency?", "Monthly or annual?", "Can I get an invoice or receipt?"]
  "Inviting members": ["The invite won't send", "Members on Gmail can't be invited", "Should I turn on the invite link?"]
  "Joining the team": ["My old chats disappeared after joining", "Should I cancel my personal Pro/Max?", "How do I switch back to my personal account?"]
---

> **In one line**: Claude Team is the company plan for **2–150 people** — account menu → **Upgrade plan** → switch to the **Team & Enterprise** tab → **Get Team plan**, name your team, pick seats, pay, done. The step most people trip on is inviting: **a member's email domain must be on the allowed-domains list**, so for coworkers on Gmail you first add `gmail.com`. After that, **turn off the invite link** — otherwise any Gmail user who gets hold of the link can join automatically and take a paid seat.

**Keywords**: Claude Team, Claude Team plan, Team plan signup, Standard seat, Premium seat, invite members, allowed email domains, gmail.com, invite link, organization settings, Keep both accounts

---

## Why Team instead of everyone buying their own Pro?

If two or three people at your company are already paying for Claude Pro on their own cards, sooner or later you hit these problems:

- **Messy expenses**: one receipt per person, separate renewals, and an ex-employee's subscription still charging.
- **Unclear data ownership**: coworkers handle company documents in personal accounts. When they leave, those conversations leave with them.
- **Nobody's in charge**: who can use it, how much, and which outside services it connects to is left to individual judgment.

The Team plan pulls all of that back to the organization: **one bill, centrally managed members, and by default your content isn't used to train models**. You only need 2 seats to start.

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **Duck's note**: Individual Pro is like every employee getting their own phone plan and expensing it. Team is like the company signing a business plan — the numbers belong to the company, and when someone leaves you just take the number back. With more people, the difference adds up fast.

---

## Before you start: have these three things ready

1. **An account to act as the owner** — ideally sign in to a separate Claude account with a **company-domain email** (e.g. `admin@yourcompany.com`) rather than an employee's personal account. This account becomes the team's Primary Owner and controls billing and members.
2. **A credit or debit card** (or Apple Pay).
3. **The list of member emails.** Check whether anyone uses Gmail or another non-company address — you'll need one extra step for them.

---

## Pricing first: what it actually cost in October 2026

Prices shown on screen during a real signup in Taiwan on 2026-10-09 (New Taiwan Dollars, including 5% VAT):

| Seat type | Annual (per month avg.) | Monthly | Who it's for |
|---|---|---|---|
| **Standard seat** | NT$630/mo (NT$7,560/yr) | NT$790/mo | Most people: everyday chat, writing, organizing information |
| **Premium seat** | NT$3,200/mo (NT$38,400/yr) | See checkout | Heavy users: 5× the usage of a Standard seat |

- Anthropic's official USD pricing: Standard seat **US$20** (annual) / **US$25** (monthly); Premium seat **US$100** / **US$125**.
- You can **mix seat types** in one team — e.g. one Premium seat for your heaviest user, Standard for everyone else.
- **Enterprise** is for 20+ users, with a seat fee plus usage-based billing. Not covered here.
- Prices change. **Trust what the checkout page shows on the day you pay.**

---

## Step 1: Sign in with the owner account

1. Go to [claude.ai](https://claude.ai)
2. Sign in with Google, Apple, or email. We recommend typing your **company email** and clicking "Continue with email"

![Claude sign-in page with Google, Apple, or email options](/images/articles/claude-team-setup/claude-login-email.png)

If you sign in with email, you'll get a sign-in message. If you open its link in a **different browser or device** (e.g. your phone), the page shows a verification code instead — type that code back into **the browser where you started signing in**.

![Claude showing "Continue with verification code" — enter this code where you first tried to sign in](/images/articles/claude-team-setup/magic-link-code.png)

---

## Step 2: Click "Upgrade plan" in the account menu

Once signed in, click your account name in the bottom-left corner, then choose **Upgrade plan**.

![The "Upgrade plan" option in the bottom-left account menu](/images/articles/claude-team-setup/account-menu-upgrade.png)

---

## Step 3: Switch to the "Team & Enterprise" tab

The upgrade page opens on **Individual plans** (Free / Pro / Max). Team isn't there — click the **Team & Enterprise** tab at the top.

![Plans page defaults to individual plans; an arrow points to the "Team & Enterprise" tab](/images/articles/claude-team-setup/pricing-personal-plans.png)

---

## Step 4: Pick Team and click "Get Team plan"

The **Team** card on the left is the one you want (2–150 users). Toggle "Monthly / Annual" at the top to compare prices, then click **Get Team plan** at the bottom.

![Team vs. Enterprise comparison, with the "Get Team plan" button circled](/images/articles/claude-team-setup/team-enterprise-plans.png)

Highlights of the Team plan: Claude Code and Cowork, Claude Design, Microsoft 365 and other integrations, single sign-on (SSO), central billing and administration, and **no model training on your content by default**.

---

## Step 5: Name the team and keep your personal account separate

1. Enter your company or department name under "Team name" — **members will see this name on their invitation**, so pick something they'll recognize
2. **Leave "Keep your personal account separate" checked**: Claude creates a new workspace for the team, and this account's existing chats and projects stay in your personal account instead of mixing with the company's
3. Click **Continue**

![The "Create your team" page with a team name and "Keep your personal account separate" checked](/images/articles/claude-team-setup/create-team-name.png)

---

## Step 6: Choose seats and payment

1. Pick **Monthly** or **Annual** (annual saves 20%)
2. Team needs at least **2 seats**; click **Adjust seat count** for more
3. Scroll down and fill in payment details: full name, country or region, postal code, then **Card** or **Apple Pay**
4. Check the "Total due today" and complete payment

![Choose seats and plan: monthly or annual, order details for 2 Standard seats, and the payment form below](/images/articles/claude-team-setup/checkout-seats-payment.png)

In this example: 2 Standard seats billed monthly, subtotal 1,504.76 + VAT 75.24, **1,580 due today**. (On a Taiwan checkout, the `$` is New Taiwan Dollars.) That works out to NT$790 per seat per month.

---

## Step 7: Invite members (you can skip this for now)

After payment you land on "Invite members to your team". You can:

- Type emails into the "Standard seats" box, pressing Enter after each one, or upload a CSV
- Click **Copy invite link**
- Or click **Skip, continue without inviting** and invite people later from settings

![Invite members to your team: enter emails, copy an invite link, or skip and continue](/images/articles/claude-team-setup/onboarding-invite-members.png)

Note the line in the description: **all invitations must use your company's email domain**. If someone you want to invite uses Gmail, the invite won't go through here. Skip for now, follow Step 9 to allow Gmail, then come back.

---

## Step 8: Get to know the "Organization and access" page

Inside the team, open **Settings** from the bottom-left account menu. The left sidebar now has a whole set of **organization settings**. The one you'll use most is **Organization and access**:

- **Team overview**: allowed email domains, total seats (e.g. "2 (1 available)"), and total members
- **Get your team using Claude**: a starter checklist — add another owner, invite members, verify your domain, set up SSO
- **Organization instructions**: guidance for Claude that applies to every conversation in your organization (answer format, data-handling rules, and so on). Changes can take up to an hour to apply

![Organization and access page, with "Invite your members" circled and an arrow pointing to its Start button](/images/articles/claude-team-setup/org-settings-invite-members.png)

Click **Start** next to "Invite your members", or go to **Members** in the sidebar → **Add member** in the top right. This dialog appears:

![The "Add member" dialog: email addresses, role, and seat tier](/images/articles/claude-team-setup/add-member-dialog.png)

- **Email**: paste several at once, separated by commas or line breaks
- **Role**: "User" for regular coworkers
- **Seat tier**: "Standard" or "Premium"
- The dialog says it plainly: **new members are billed pro rata from the date they join**

> 💡 Add at least one more **owner** (the first item on the checklist). If there's only one owner and that person leaves or loses access, nobody can manage billing.

---

## Step 9: Coworkers on Gmail? Add gmail.com to allowed domains

This is where most people get stuck. By default the team only accepts emails **on the owner's own domain**. Look at **Allowed email domains** in the team overview:

![Team overview with the "Allowed email domains" field circled](/images/articles/claude-team-setup/allowed-email-domains.png)

1. On Organization and access, scroll down to the **Domains** section
2. Click **Add or edit domains**

![The "Add or edit domains" link under the Domains section](/images/articles/claude-team-setup/add-edit-domain.png)

3. In the "Update organization email domains" dialog, type `gmail.com`, click **+**, then **Save**
4. Back in the domain list, `gmail.com` now appears

![gmail.com in the domain list, with Discoverable showing "Not allowed"](/images/articles/claude-team-setup/gmail-domain-added.png)

Public email domains like `gmail.com` show "Discoverable: Not allowed" — meaning random Gmail users **can't find** your team by searching. That's expected.

---

## Step 10: 🔴 After adding Gmail, turn off the invite link

Skipping this won't cause an error, but it can cost you money.

Scroll down to **User provisioning** and you'll find two switches:

- **Invite link**: "anyone who joins via the link is automatically approved" — as long as their email domain is on the allowed list
- **Member invites**: lets regular members invite other people

Now connect that to the previous step: **`gmail.com` on the allowed list + invite link on = any Gmail user in the world who gets this link can join automatically and occupy a paid seat.** One forward and it's out of your hands.

So unless you have a specific need, **turn both off** and have an owner invite people one by one by email:

![Under User provisioning, both "Invite link" and "Member invites" switched off](/images/articles/claude-team-setup/invite-link-toggles.png)

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **Duck's note**: An invite link is like posting the office door code in a group chat. With only your company domain allowed, that's survivable. Once `gmail.com` is on the list, it means "anyone with a Gmail address who knows the code walks in and gets an employee badge automatically." If you want someone in, invite them yourself.

---

## Step 11: Members get the email and accept

Invited coworkers receive an email titled **You're invited to join (team name) on Claude**. They click **Accept invite**:

![Gmail showing the "You're invited to join … on Claude" email with an Accept invite button](/images/articles/claude-team-setup/invite-email-gmail.png)

The browser opens the join page. **Before clicking, check the email after "Accepting as"** — if the browser is signed in to a different Claude account, sign out and switch first, or they'll join under the wrong identity.

![Claude join page showing who invited you, the "Accepting as" account, and the Accept invite button](/images/articles/claude-team-setup/accept-invite.png)

---

## Step 12: Decide whether to keep the personal account

If the coworker already had a personal Claude account, a "You've joined …" dialog appears with two choices:

- **Keep both accounts**: switch between the personal account and the team at any time. **Most people pick this.**
- **Use (team name) only**: the personal account closes and its paid individual plan (in this screenshot, Max) **is refunded**, usually within about 24 hours. You then choose what happens to old chats and projects.

![The "You've joined" dialog: Keep both accounts, or use the team account only](/images/articles/claude-team-setup/joined-keep-both-accounts.png)

There's also a banner at the top — "Bring chats and projects from your personal account into …". To move work-related chats and projects into the team, use **See options**.

> 💡 If a coworker was paying for Pro or Max personally just for work, choosing "use the team only" gets that money back and stops the double payment. But it **closes the personal account**, so make sure there's nothing private in it they want to keep.

---

## 🚨 Common problems and fixes

### The invite won't send / the button stays grayed out

Almost always: **the email domain isn't on the allowed list**. Go back to Step 9, add their domain (e.g. `gmail.com`, or a partner company's domain) to allowed email domains, and invite again.

### I can't find the Team plan

The upgrade page opens on the "Individual plans" tab. Team is next to it, under **Team & Enterprise** (Step 3).

### The checkout total doesn't match the plans page

The plans page shows prices **including tax**, usually on **annual** billing as a monthly average. Checkout lists a **pre-tax subtotal** plus VAT, and defaults to **monthly**. Monthly costs about 20% more than annual, so a mismatch is expected.

### My old chats disappeared after joining

They're still there — you're just in the **team workspace**. Click your account name in the bottom-left to switch back to your personal account (if you chose Keep both accounts in Step 12).

### Can one person open a Team plan?

No. Team requires at least 2 seats, and you're billed for at least 2. If it's just you, individual Pro or Max is the better deal.

---

## What you can do now

- Upgrade from the account menu and find the Team plan on the second tab
- Understand the price gap between Standard and Premium seats, and choose monthly or annual
- Invite members and handle outside domains like Gmail
- Know to **turn off the invite link after adding `gmail.com`**, so strangers can't take your seats
- Help coworkers decide what to do with their personal accounts

**Next step**: once the team is set up, the most valuable thing to do first is write your **organization instructions**, so Claude answers in the same voice and follows the same rules for everyone. For how to write them, see [How to Set a System Prompt in ChatGPT, Claude, Gemini & Grok](/en/articles/set-system-prompt/). The idea is identical; the scope just grows from you to your whole team.
