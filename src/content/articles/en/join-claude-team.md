---
title: "How to Join a Claude Team You've Been Invited To: From the Invite Email to Shared Projects"
description: "A coworker or boss says \"I invited you to our Claude team.\" Now what? This screenshot walkthrough covers the member side: open the email and click Accept invite, check you're accepting with the right account, decide whether to keep your personal account, then see what the team gives you (organization skills, connectors, shared projects) and how to pin a shared project in your sidebar."
contentType: "tutorial"
scene: "env-setup"
difficulty: "beginner"
createdAt: "2026-10-15"
verifiedAt: "2026-10-15"
archived: false
order: 6
prerequisites: ["claude-team-setup"]
estimatedMinutes: 8
tags: ["Anthropic", "設定"]
modules: [M06]
stuckOptions:
  "Accepting the invite": ["I didn't get the invite email", "I clicked the link but used the wrong account", "Nothing happens after Accept invite"]
  "Personal account": ["Keep both accounts vs. team only?", "What happens to my personal Pro/Max if I choose team only?", "Can I switch back to my personal account?"]
  "After joining": ["Where do I find shared team projects?", "How do I pin a shared project?", "Can coworkers see my chats?"]
---

> **In one line**: Joining a Claude Team takes three things: **open the email and click Accept invite, check that the email after "Accepting as" is the one you want, then decide whether to keep your personal account** (if unsure, pick **Keep both accounts**). Once inside, projects your team shared with you live under **Projects → Shared with you**, and the pin icon at the top right puts one in your sidebar.

**Keywords**: join Claude Team, Claude team invite, Accept invite, Accepting as, Keep both accounts, Shared with you, shared projects, organization skills, connectors

---

## Who is this for?

This is the **member-side** follow-up to [How to Set Up a Claude Team Plan](/en/articles/claude-team-setup/). That article is for the **admin who creates the team** (payment, invites, allowed domains). This one is for **the person being invited**: you don't pay or configure domains, you just accept the invite and learn what's available once you're in.

If you're the admin, here is the screen you see on the **Members** page after clicking **Add member** (the screenshot's UI is in Chinese): enter the person's email, pick a role and seat tier, and click **Add 1 member**. They'll get an invite email.

![Admin side: the Add member dialog on the Members page, with email, role and seat tier](/images/articles/join-claude-team/admin-add-member-dialog.png)

> 💡 The invite goes to **the exact email the admin typed**. If you want to join with Gmail, the admin has to invite your Gmail address, and `gmail.com` must be on the team's allowed domains (the admin article covers this).

---

## Before you start

1. **Which inbox got the invite?** Look there for an email titled something like **You're invited to join (team name) on Claude**. Check spam if you don't see it.
2. **Which Claude account is your browser signed into?** The next step uses the account you're currently signed in with, and signing in with the wrong one is the most common slip.

---

## Step 1: Open the email and click "Accept invite"

The **Accept invite** button in the email takes you to a join page in your browser.

![Gmail showing the "You're invited to join … on Claude" email with an Accept invite button](/images/articles/claude-team-setup/invite-email-gmail.png)

If you need to sign in or a verification code appears, see the sign-in step in [How to Set Up a Claude Team Plan](/en/articles/claude-team-setup/).

---

## Step 2: Check "Accepting as", then click Accept invite

The join page shows **Join (team name)**, who invited you, and **the email after "Accepting as"**.

**Before you click, make sure that email is the one you want.** If it isn't (say you want to join with your work email but your browser is signed into a personal one), sign out, switch to the right account, and click the link in the invite email again.

If it looks right, click **Accept invite**. If you don't want to join, click **Decline** below it.

![Join page: Join team name, who invited you, Accepting as your signed-in email, with Accept invite and Decline](/images/articles/join-claude-team/accept-invite-page.png)

The fine print at the bottom is worth one read: continuing means you agree to join a Team plan **managed by your Admin** and acknowledge Anthropic's Privacy Policy.

---

## Step 3: Decide whether to keep your personal account

If you **already have a personal Claude account** (with the same email), a "You've joined (team name)!" dialog appears and asks you to choose:

- **Keep both accounts**: keep your personal and team accounts and **switch between them anytime**.
- **Use (team name) only**: your personal account closes. If you pay for a personal plan (Max in the screenshot), **it is refunded**, usually within about 24 hours, and you'll then choose what happens to your chats and projects.

Pick one and click **Continue**.

![The "You've joined" dialog: Keep both accounts selected by default, the other option is team only](/images/articles/join-claude-team/joined-keep-both-accounts.png)

**If you're unsure, keep the default, Keep both accounts.** It's the safe choice: nothing gets closed, and you can change your mind later.

"Team only" makes sense when your personal subscription was only for work and the company now pays, so you don't want to pay twice. But it **closes your personal account**, so check first that there's nothing private in it you want to keep.

> <img src="/images/dock_head_s.png" alt="鴨編" width="24" style="vertical-align: middle;"> **Duck's note**: Think of it as having your own phone number and then getting a work phone from the company. "Keep both" means carrying both; "team only" means canceling your personal number and keeping just the work phone. Decide what happens to your old messages before you tap.

---

## Step 4: "You're here!" means you're in

You land on the familiar Claude home page, now headed **You're here!**, and a notice appears at the bottom right:

> Your accounts will stay separate. Switch between them anytime.

Your personal and team accounts stay **separate**, and you can switch whenever you like, so chats don't get mixed. The switcher is in the account area at the bottom left.

![Home page after joining, headed "You're here!", with the "Your accounts will stay separate" notice circled](/images/articles/join-claude-team/joined-welcome-toast.png)

> 💡 If your old chats seem to have vanished after joining, relax. You're probably in the team account. Switch back to personal and they're there (as long as you chose Keep both accounts).

---

## After joining: what does the team give you?

In the left sidebar, **Customize** and **Projects** are where the team's value shows up.

### Customize: skills and connectors

Click **Customize** and you'll see three tabs: **Skills**, **Connectors**, **Plugins**.

**Connectors** let Claude reach services like Google Drive, Gmail, Google Calendar, Notion, and Microsoft 365. A check mark means connected; "+" means not yet.

![The Connectors tab in Customize: 1 click Customize, 2 click Connectors, 3 connector cards circled](/images/articles/join-claude-team/customize-connectors.png)

On the **Skills** tab, besides Anthropic's own, you may see a **From your organization** section marked **pre-installed by your organization**. These are skills **your admin installed for the whole team**, ready to use without you finding or installing anything.

![The Skills tab in Customize: the red box is "From your organization", skills pre-installed by the org](/images/articles/join-claude-team/customize-skills-org.png)

> ⚠️ Connectors let Claude read data in the services you connect (emails, Drive files). Before connecting, ask yourself: **is this a work account or a personal one?** Connect work content with your work account.

### Projects: yours, the organization's, and shared with you

Click **Projects** and you'll see three tabs:

| Tab | What's in it |
|---|---|
| **Your projects** | Projects you created |
| **Organization** | Projects shared across the whole organization |
| **Shared with you** | Projects a coworker shared with you directly |

![The Projects page: arrows pointing at the Your projects, Organization, and Shared with you tabs](/images/articles/join-claude-team/projects-tabs.png)

When a coworker shares a project with you, it shows up under **Shared with you**, with who created it and when.

![The Shared with you tab in Projects, listing a project a coworker shared](/images/articles/join-claude-team/projects-shared-with-you.png)

---

## Pin a shared project in your sidebar

If you use a shared project often, going through Projects each time gets old. Once you're on the project page:

1. Click the **pin** icon at the top right
2. Look at the left sidebar: the project now appears under **Pinned**, one click away from then on

![Project page: 1 pin icon at top right, 2 project title area, 3 the project now under Pinned in the sidebar](/images/articles/join-claude-team/pin-shared-project.png)

The right side of the project page also shows **Instructions**, **Files**, **Memory**, and **Schedule**. The project page also carries a small note worth remembering:

> Shared · Created by …　All sessions are private unless shared · Memory is private to you

In plain terms: **the project is shared, but the chats you start in it are private unless you share them, and memory is yours alone.** Coworkers don't see what you asked just because you're in the same project.

---

## 🚨 Common problems and fixes

### I didn't get the invite email

Check spam and other tabs (Promotions, Social). Still nothing? Ask the admin to confirm **the email they invited is spelled correctly**.

### I clicked Accept invite and joined with the wrong account

The email after "Accepting as" is the account you join with. Sign out of Claude, switch to the right account, and click the link in the invite email again.

### The link says "Invalid invite link"

The link is no longer valid. Ask the admin to send you a new invite.

### My old chats disappeared after joining

They didn't. You're in the **team account**. Switch back to personal from the bottom left.

### I chose "team only" and regret it

That option closes your personal account, and **before** you click is the best time to decide. If you've already chosen it, contact Anthropic support about restoring it. We haven't tested this case and won't promise anything here.

---

## What you can do now

- Read the invite email and join page, and know to check "Accepting as" first
- Choose between **Keep both accounts** and team-only without regret
- Find what the team gives you: org-installed skills, connectors, shared projects
- Pin a frequently used shared project in your sidebar

**Next step**: if your admin hasn't set organization instructions yet, see [How to Set a System Prompt in ChatGPT, Claude, Gemini & Grok](/en/articles/set-system-prompt/). You can use the same idea to give your own projects instructions so every chat starts from the same rules.
