---
title: "Let AI Use Websites for You: Installing and Setting Permissions for the Claude, ChatGPT, and Gemini Chrome Extensions (Plus the New Cloud Computers)"
description: "To have AI read pages, click buttons, and fill in forms for you, the first step is getting its extension running in Chrome. This guide covers Claude in Chrome, the ChatGPT extension, and Gemini in Chrome: how to install each, which plans qualify, and how to set permissions safely. It ends with the next stage, where each AI gets its own cloud computer and cloud browser."
contentType: "tutorial"
scene: "integration"
difficulty: "beginner"
createdAt: "2026-11-24"
verifiedAt: "2026-11-24"
archived: false
order: 1
prerequisites: ["ai-agent-browsers"]
estimatedMinutes: 14
tags: ["Agent", "Anthropic", "OpenAI", "Google", "Chrome", "安全"]
stuckOptions:
  "Claude in Chrome": ["Does the free plan work?", "Can I install it in Edge or Brave?", "Which permission mode should I pick?"]
  "ChatGPT extension": ["What's the difference between Chat and Work?", "What is @Chrome?", "There are many ChatGPT extensions. Which one is official?"]
  "Gemini in Chrome": ["I can't find the Ask Gemini button", "Is auto browse available in Taiwan?", "Why doesn't my work account work?"]
  "Cloud computers": ["How is an extension different from a cloud browser?", "How does a cloud browser log in to my accounts?"]
---

> **In one line**: The easiest way to let AI read web pages and click around for you is to set up its extension in Chrome. **Claude in Chrome** needs a paid plan and works only in Chrome. The **ChatGPT** extension can be installed on any plan and has two modes: Chat reads your tabs, Work acts in them. **Gemini in Chrome** is built in, with nothing to install, but in Taiwan it can currently only chat and summarize. **Auto browse isn't available there yet.** After installing, the most important step is **permissions**: start with "ask me before every action."

**Keywords**: Claude in Chrome, ChatGPT Chrome extension, ChatGPT Work, Gemini in Chrome, auto browse, AI browser automation, Computer Use, cloud browser, Cowork, Tasks in Gemini, Gemini Spark

---

## Why does AI need a Chrome extension?

You're probably used to copying a page into ChatGPT and copying its answer back out. That works, but the AI only ever sees **the snippet you pasted**, and it can't press a single button for you.

An extension **brings the AI into your browser**:

| Without an extension | With an extension |
|---------|-------|
| You copy page content into the AI | The AI reads your open tabs directly |
| The AI tells you to click the top-right button | The AI moves the cursor and clicks it |
| You type every form field yourself | The AI fills it in from the data you gave it |

This ability to operate a screen is called **Computer Use**. The concept is covered in [AI Can Now Browse for You](/en/articles/ai-agent-browsers/). This guide does one thing: **install the three extensions and set their permissions correctly**.

> <img src="/images/dock_head_s.png" alt="Blue Duck" width="24" style="vertical-align: middle;"> **Duck's note**: An extension is like seating an assistant next to you who works **on your computer, using the accounts you're already logged in to**. It's convenient, but it also means the AI can reach your Gmail and your banking tab. That's why this guide spends more time on permissions than on installation.

---

## Before you start: check three things

1. **Use desktop Google Chrome** (Mac or Windows). Mobile works differently and isn't covered here.
2. **Update Chrome**: ⋮ menu → Help → About Google Chrome.
3. **Create a practice Chrome profile** (strongly recommended): profile icon → Add → sign in with an unimportant Gmail account. The first few times you let AI take actions, do it in that profile, **not in the one with your bank and work email**.

Here's the overview. Then jump to the one you want:

| | Claude in Chrome | ChatGPT extension | Gemini in Chrome |
|---|---|---|---|
| Separate install? | Yes, Chrome Web Store | Yes, Chrome Web Store | No, built into Chrome |
| Free plan? | ❌ Needs Pro / Max / Ultra / Team / Enterprise | ✅ The extension installs on every plan | ✅ Chat and summaries |
| Can it click on pages? | ✅ | ✅ (Work mode) | Not in Taiwan yet ❌ (auto browse is US-only, with Google AI Ultra / Pro / Plus) |
| Browsers | Chrome only | Chrome, Edge, Brave, Opera, Vivaldi | Chrome only |

> 📅 Checked on 2026-11-24. All three change fast, plan limits especially, so check each official page before installing.

---

## 1. Claude in Chrome (Anthropic)

### Who can use it

Claude's **paid plans**: Pro, Max, Ultra, Team, and Enterprise. The free plan isn't included. Anthropic says it supports **Google Chrome only**. Other Chromium browsers such as Edge and Brave aren't supported, and neither are phones.

### Step 1: Install from the store

1. In Chrome, open the Chrome Web Store and search for "Claude".
2. **Check that the developer is Anthropic.** There are lots of look-alike third-party extensions.
3. Click "Add to Chrome".

<!-- @img: claude-chrome-webstore | The Claude extension page in the Chrome Web Store, published by Anthropic -->

### Step 2: Sign in and pin it

1. Sign in with your Claude account.
2. Click the **puzzle-piece icon** next to the address bar and press the **pin** next to "Claude". After that, one click opens the side panel.
3. Grant the permissions it asks for.

<!-- @img: claude-chrome-pin | Pinning Claude to the toolbar from the puzzle-piece menu -->

> 💡 **Why so many permissions?** Anthropic documents each one. `debugger` lets Claude click, type, and take screenshots. `scripting` lets it read page text. `tabs` lets it open and close tabs, and it **groups its own tabs separately** from yours. `downloads` lets it download files. The list looks alarming because operating a browser on your behalf really does need all of it.

### Step 3: Pick a permission mode (the important part)

A drop-down next to the side panel's input box offers three modes:

| Mode | What it does | Who it's for |
|------|-----------|-------|
| **Manually approve** | Asks you to Allow or Deny every action | **Beginners and first runs. Start here.** |
| **Automatically approve** | Claude reviews each action, blocks unsafe ones, and asks when needed (the default) | Experienced users doing low-risk tasks |
| **Skip all approvals** | Never pauses, with no automatic checks | ⛔ Not recommended for most people |

<!-- @img: claude-chrome-permission-mode | The permission-mode drop-down next to the Claude in Chrome input box -->

When a site needs extra permission, a "New permissions required" prompt offers **Allow this action**, **Always allow actions on this site**, or **Decline**. You can review and revoke approved sites on the Permissions page in the extension's settings.

**In any mode**, Claude asks before entering potentially sensitive information, granting authorizations, deleting things permanently (emptying the trash, deleting email), or changing permission settings. **Purchases, creating accounts, handling card or ID data, and following instructions found in web pages or email** are blocked outright.

### Step 4: Your first task

Open a page you want summarized, such as a long article, and type in the side panel:

```
Summarize this page in 5 bullet points, 20 words max each
```

Start with tasks that only read. Once you have a prompt you like, save it as a **shortcut** and call it up by typing `/`. The **clock icon** in the panel can also run a shortcut on a schedule.

> 💡 **Use the Claude desktop app or Claude Code?** In the desktop app, go to Settings → Customize → Connectors, find Claude in Chrome, and click Configure to turn it on, so desktop Claude can drive your Chrome too. The connector is **off by default in each chat**, so turn it on in the chat where you need it.

---

## 2. ChatGPT extension (OpenAI)

### Who can use it

OpenAI's official extension **installs on every ChatGPT plan**. Since the October 2026 update it has two modes:

| Mode | What it does |
|------|---------|
| **Chat** | Reads your open tabs to answer questions, such as comparing products across three tabs |
| **Work** | Takes action: fills in forms, sends messages, downloads files, and groups tabs |

Besides Chrome, it supports Edge, Brave, Opera, and Vivaldi. Opera has no side chat.

> ⚠️ **Whether free accounts can use Work mode to take actions** isn't clear. Press reports disagree, and we couldn't find a definitive statement from OpenAI, so we won't guess. After installing, check whether your interface shows a Work option. (Also note: OpenAI has retired the standalone ChatGPT Atlas browser. The official [release notes](https://help.openai.com/en/articles/6825453-chatgpt-release-notes) announced this on 2026-07-09 and said Atlas was "scheduled to stop working on August 9, 2026"; the [help center](https://help.openai.com/en/articles/20001371-chatgpt-atlas-retirement) now says it has been retired. Use this extension or the ChatGPT desktop app instead. See the correction in [AI Now Operates the Web for You](/articles/ai-agent-browsers/).)

### Step 1: Install from the store

1. Search the Chrome Web Store for "ChatGPT".
2. ⚠️ **This is where people go wrong.** Results such as "ChatGPT Sidebar" and "X for ChatGPT" come from **third parties**. Check that the **developer is OpenAI** before clicking "Add to Chrome".
3. Chrome lists the permissions it needs (such as reading and changing site data). Read them, then click "Add extension".

<!-- @img: chatgpt-chrome-webstore | The ChatGPT extension page in the Chrome Web Store, published by OpenAI -->

### Step 2: Sign in and open side chat

1. Sign in to your ChatGPT account. Pinning it to the toolbar is a good idea here too.
2. On any page, click the ChatGPT icon to open **side chat** beside the page. Ask "what is this page about?" or select some text and ask about it.

<!-- @img: chatgpt-chrome-sidechat | ChatGPT side chat open next to a web page -->

### Step 3: Target a tab with @Chrome

In the chatgpt.com chat box, type **`@Chrome`** or choose a tab from the **+** menu, and ChatGPT can read that tab or act in it. You'll see an access prompt the first time. **Check which account and which site it's about to touch** before you allow it.

<!-- @img: chatgpt-at-chrome | Typing @Chrome in the ChatGPT chat box to pick a tab -->

> <img src="/images/dock_head_s.png" alt="Blue Duck" width="24" style="vertical-align: middle;"> **Duck's warning**: Work mode uses **the accounts already logged in to your browser**: your Gmail, LinkedIn, and company dashboards. Security researchers worry most about **prompt injection**, where a web page or email hides instructions meant for the AI and tricks it into doing something you never asked for. While you're practicing, stay in the practice profile and keep important tabs closed.

---

## 3. Gemini in Chrome (Google)

### Who can use it

Gemini in Chrome is **built into Chrome, with no extension to install**. Google's requirements:

- A **Mac, Windows PC, or Chromebook Plus** running the latest Chrome
- **Signed in to Chrome** (it doesn't work in Incognito)
- A supported region and age: **Taiwan is on the list, for users 18 and over**
- Work or school Google accounts need **admin approval**

### Step 1: Find the Ask Gemini button

If you qualify, an **Ask Gemini** button appears **at the top of the Chrome window**. Click it to open Gemini beside the page.

<!-- @img: gemini-in-chrome-button | The Ask Gemini button at the top of Chrome and the open Gemini panel -->

If you can't find it, check that Chrome is up to date, that you're signed in, and that you're not in Incognito. Google also says the feature "is not available to all users at this time," so you may have to wait.

### Step 2: Start by having it read pages

In Taiwan, what works today is the reading side: summarizing pages and YouTube videos, finding answers on long pages, comparing reviews, and checking your Google Calendar. Save prompts you reuse as **Skills**.

### What about auto browse?

The feature that lets Gemini click through pages is called **auto browse**. It can fill a cart or book a reservation. As of 2026-11-24, [Google's help page](https://support.google.com/gemini/answer/16821166?hl=en) says you must be 18 or over, located in the US, have your device language set to English, sign in with a **personal** Google Account, and have **Google AI Ultra, Pro, or Plus**. It's still rolling out, so not everyone who meets those conditions will see it yet. **It isn't available in Taiwan right now**, even if you subscribe. For Google's background "do it for me" option, see Tasks in Gemini below.

---

## Extensions are one stage. The next is AI with its own cloud computer

Once the extension is installed, you'll notice the catch: **the AI is using your computer**. Your computer and Chrome have to stay on while it works, and closing the laptop stops it. It can also reach every account you're logged in to.

So in 2026 every vendor took the next step: **giving the AI its own computer**, running in the cloud.

![Three stages of AI using the web: copy-paste, Chrome extension, cloud computer](/images/articles/chrome-ai-extensions/three-stages.svg)

| | Chrome extension | Cloud computer / cloud browser |
|---|---|---|
| Where it runs | Your computer, your Chrome | The AI company's cloud machines |
| When you close the laptop | It stops | It keeps going |
| Whose logins | Accounts already logged in to your browser | Separate logins (an isolated environment that can't see your tabs or passwords) |
| Biggest plus | No re-login, and it sees what you see | Separated from your computer, so you can leave it running |
| Biggest minus | It can reach all your accounts | Some sites block bots, so you may have to finish the last step |

### Where each vendor stands

- **ChatGPT: Work's cloud browser.** Start a Work task on the ChatGPT website or app, and it opens **a browser on a remote computer** when it needs one. You don't choose this manually. When a site needs a login, it pauses so you can type your credentials into **a secure form the model can't see**, and if it gets stuck you can **take over** from your phone or computer. Settings → Cloud browser controls site access (Always ask / Auto approve / Always allow, and OpenAI doesn't recommend the last one). Per [OpenAI's help page](https://help.openai.com/en/articles/20001280-using-cloud-browser-in-chatgpt), **it's on paid plans only; Free and Go don't have it**, and availability can still vary by region and workspace settings.
- **Claude: Cowork.** Cowork runs on web, desktop, and mobile, and a task started from your phone **keeps working in the cloud even with your laptop closed**. Its side panel has a **built-in browser** that's separate from your own browser, logins, and tabs. Per [Anthropic's help page](https://support.claude.com/en/articles/15520349-use-claude-cowork-on-web-desktop-and-mobile), it's included in Pro, Max, Ultra, Team, and Enterprise (Anthropic notes that Cowork uses up limits faster than chat).
- **Gemini: Tasks in Gemini** (often still called Gemini Spark in earlier articles and press). Google's always-on agent can open **a remote browser** when needed and keep working with your laptop closed. As of 2026-11-24, [Google's help page](https://support.google.com/gemini/answer/17094507?hl=en) says you must be 18 or over and signed in with a **personal** Google Account (work or school accounts aren't supported yet). In the US, Canada, India, Japan, South Korea, and Australia, it is currently available **without a Google AI subscription**. Everywhere else Gemini Apps are supported, you need **Google AI Pro or Ultra**, except in the **EEA, the UK, Switzerland, and Nigeria**.

> <img src="/images/dock_head_s.png" alt="Blue Duck" width="24" style="vertical-align: middle;"> **Duck's take**: Neither replaces the other. **If the work needs systems you're already logged in to (a company dashboard, your Gmail) and you're at your desk**, use the extension. **If you can leave it running and it's working on public sites or services you're willing to log in to separately**, use the cloud version. For beginners, flip the usual order and **start with the cloud version**. It's isolated from your real accounts, so mistakes cost less.

---

## 🚨 Common snags

### 🚨 The Claude extension installed but won't work

It's usually the plan: **the free plan isn't supported**. Also make sure you're in Chrome itself, not Edge, Brave, or Arc. On Team or Enterprise, your admin may not have enabled it yet, or may have blocklisted the site.

### 🚨 Installed a fake ChatGPT extension

The store is full of extensions with "ChatGPT" in the name. Check that the **developer field says OpenAI**. If it doesn't, remove it (puzzle icon → Manage extensions → Remove).

### 🚨 No Ask Gemini button

Check these in order: Chrome is up to date, you're signed in to Chrome, you're not in Incognito, and the account is a personal account for someone 18 or older (work accounts need admin approval). If all of those check out, it just hasn't reached you yet. Use gemini.google.com in the meantime.

### 🚨 The AI stopped halfway to ask me something

That's **normal, and a good thing**. All three are built to make you confirm, or take over, before passwords, payments, deletions, or authorizations. **Don't paste your password into the chat to save time.** OpenAI explicitly says not to.

---

## Next: one thing you can do tomorrow

1. Create a **practice Chrome profile** signed in to an unimportant Gmail account.
2. Install one based on your plan: Claude in Chrome if you pay for Claude, the ChatGPT extension if you only have free ChatGPT, or Gemini in Chrome if you have neither.
3. Choose "**ask me before every action**" and give it a read-only task: "Put the product specs from these three tabs into one table."
4. Once that feels comfortable, try a cloud version (ChatGPT Work, Claude Cowork, or Tasks in Gemini) and see what it's like when the work continues after you close the laptop.

For an overview of AI browsers, see [AI Can Now Browse for You](/en/articles/ai-agent-browsers/). To connect AI to more outside tools, read [Which MCP Servers Should You Install?](/en/articles/mcp-servers-picks/).
