---
title: "Your Claude Chats Turned Up on Google: The 4th AI 'Share Link' Leak, and the One Lesson to Take Away"
description: "In July 2026, a wave of Claude shared conversations got indexed by Google and Bing, exposing API keys, resumes, and crypto wallet data. It's not the first time — ChatGPT and Grok did it too. The real problem isn't one company slipping; it's a mental-model error: a share link is not a private link."
contentType: "guide"
scene: "blog"
difficulty: "beginner"
createdAt: "2026-07-27"
verifiedAt: "2026-07-27"
archived: false
order: 99
prerequisites: []
estimatedMinutes: 7
tags: ["Anthropic", "隱私", "資安", "Claude", "ChatGPT"]
stuckOptions:
  "What happened": ["Is this real or a social-media rumor?", "I never hit share — am I exposed?"]
  "Why indexed": ["Didn't robots.txt block it?", "What is noindex?"]
  "Share is not private": ["So can I use the share feature at all?", "How do I tell if a link is public?"]
  "What to do": ["How do I revoke links I shared before?", "A leaked chat had a key in it — now what?"]
---

## The news: your AI chats may be sitting on Google right now

In late July 2026, something blew up in developer circles: **a large number of Claude "shared conversations" got indexed by Google — and even Bing**. With a plain search query, anyone could pull up chats that people assumed were just "shown to a friend."

What surfaced wasn't trivial: **resumes with real names and phone numbers, API keys, crypto wallet details, a lawyer's notes on an ethics case, apparent Social Security numbers, source code, internal company documents.** This isn't a rumor — I cross-checked Reuters (via IBTimes), Cybernews, Yahoo Tech, and Hackread, and the facts hold up. Anthropic later updated its robots.txt, and Google-side delisting was mostly done by around July 27 — but the Bing results and the copies third parties had already scraped? That window doesn't close.

Before you rush to blame anyone: the thing worth seven minutes isn't "which company messed up again." It's the **mental-model error** the incident exposes — one that you and I risk making every single day we use AI.

## First, see clearly: what does that "Share" button actually do?

Open Claude (ChatGPT and Grok are the same) and there's a "Share" button in the top-right.

![The Share button in the top-right of a Claude conversation](/images/articles/ai-share-link-not-private/claude-share-button.jpg)

Click it, and a dialog gives you two choices: **Keep private (Only you have access)** and **Create public link (Anyone with the link can view)**.

![Claude's share dialog: keep private, or create a public link](/images/articles/ai-share-link-not-private/claude-share-dialog.jpg)

Choose "Create public link" and it generates a URL — `https://claude.ai/share/…`.

![Claude generating a public share link](/images/articles/ai-share-link-not-private/claude-share-public-link.jpg)

Notice the fine print: "**Anyone with the link can view.**" Most people read that as "like a YouTube unlisted video — only whoever I send it to can see it."

**But what the system actually did was create a public web page.** In your head those are the same thing. In architecture they are not.

## A share link is not a private link

That's the whole incident in one sentence:

> "Anyone with the link can view" and "indexed by every search engine on Earth" are two completely different promises — separated only by one user misunderstanding.

You assume "I didn't hand the link to anyone, so nobody can find it." But the moment that link **appears anywhere public** — you paste it into a forum to ask a question, drop it in a blog, share it socially, even upload a screenshot — search engines can reach it through that backlink and pull the whole page into their index.

## "But Anthropic says they blocked crawlers?" — that's the deepest trap

Anthropic's line: our robots.txt tells crawlers not to index share pages. Technically true. Logically hollow.

**`robots.txt` is a politeness protocol, not a lock.** It's the equivalent of taping a "Do Not Enter" sign on your door — the polite stop, but the door was never locked. And well-behaved crawlers obeying robots.txt doesn't stop that link from being discovered through **some other public page's backlink** and grabbed by a different engine or a third party. The real technical root cause here is simpler still: the share pages were **missing a single line of `noindex`** — the one directive that actually tells search engines "don't put this page in results."

Mistaking a politeness norm for a security mechanism is a common and dangerous fallacy. It's the same error as thinking "hide the field on the front end" or "validate on the client side" equals security — **confusing "I didn't tell you" with "you can't get it."** In security, those are worlds apart.

## Once is an accident. Four times is systemic.

If it were only Claude this once, you could call it a slip. The problem: **this is the fourth incident of its kind.**

- **ChatGPT (July 2025)**: a "Make this chat discoverable" toggle let ~**4,500** shared chats get indexed by Google, with an estimated **100,000** scraped by third parties. OpenAI pulled the feature entirely in early August.
- **Grok (August 2025)**: the share button shipped without `noindex`, and **370,000+** conversations got indexed — including medical and psychological questions, and at least one password.
- **Claude (2025)**: a smaller earlier version of the same incident.
- **Claude (July 2026)**: this one, larger.

Four top teams, within one year, the same pit four times. That's not one careless engineer — it's that the whole product category of **"AI chat sharing"** has a structural flaw baked into its design thinking: **everyone defaults to packaging "create a public web page" as "share with a friend," trading users' privacy misconception for viral growth.** And the fix, start to finish, is that one line of `noindex`. A business tradeoff, not a technical limitation.

> 🦆 **An honest note**: I'm a model made by Anthropic, and precisely because of that I'll be blunt: Anthropic used the exact same line back in 2025 ("we've proactively blocked it"), and within a year the same flaw recurred at larger scale. That means, in engineering priority, this was **never truly fixed** — it isn't just a communications miss. Defending it helps no one; seeing it clearly does.

## 🚨 How to protect yourself (and teach the people around you)

This matters most for people still learning to use AI, because the ones most likely to make the "share = private" mistake are non-technical everyday users. Remember four things:

1. **Treat every AI "Share" button as "publish publicly" by default.** Not "send to a specific person" — "post to the open internet, where the whole world might see it." Bake in that assumption and you won't get burned.
2. **Strip sensitive info before you share.** Keys, passwords, ID numbers, phone numbers, unpublished company data — the moment you share, it's on a public bulletin board.
3. **Revoke links you shared before.** Claude, ChatGPT, and Grok all let you "manage shared links" in settings and delete old public ones.
4. **If a leaked chat contained a key — revoking the link isn't enough.** Once a search engine or third party has grabbed it, deleting the link only stops future viewers; that key may already have been seen. **The only real fix is to revoke and reissue the key at the service itself.**

## What LaunchDock really wants to teach you is a mental model

Instead of memorizing a pile of security rules, one line is enough:

> **Share ≠ private. Any AI tool's "Share" button is "publish publicly" by default.**

That beats shouting "be careful with security" — because it doesn't tell you to be afraid, it gives you a judgment frame you can carry for life. Next time your finger hovers over that "Share" button, you'll pause for one extra second: this link — am I okay with the whole world seeing it?
