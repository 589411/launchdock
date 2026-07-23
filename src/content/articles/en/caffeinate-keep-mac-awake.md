---
title: "What Is caffeinate? Keep Your Mac Awake So AI Agents Don't Drop All Night (and How to Stop It)"
description: "caffeinate is a built-in macOS command that prevents your Mac from sleeping, so long-running AI Agents like OpenClaw and Hermes don't drop when the computer sleeps. This article explains in plain words what caffeinate is, what each of the five -dimsu flags does, common patterns, how to stop it with killall caffeinate, and the traps people fall into."
contentType: "troubleshoot"
scene: "basics"
difficulty: "beginner"
createdAt: "2026-07-10"
verifiedAt: "2026-07-10"
archived: false
order: 20
prerequisites: []
estimatedMinutes: 8
tags: ["OpenClaw", "Hermes", "macOS", "CLI", "設定"]
modules: [M01]
stuckOptions:
  "How to use the command": ["What am I supposed to put after caffeinate?", "I pressed Ctrl+C and it stopped—is that normal?", "Do I have to type all five letters in -dimsu?"]
  "It still sleeps": ["The command is running but it still slept when I closed the lid?", "Why doesn't -s work even though I'm plugged in?", "Does caffeinate die when I close the terminal?"]
  "Do I keep it on": ["Do I really need my Mac awake 24/7?", "Is there a better way than caffeinate for keeping something running long-term?"]
---

> **In one line**: **`caffeinate` is a built-in macOS command whose job is to prevent your Mac from sleeping—to keep it awake.** Put it in front of your Agent's startup command (`caffeinate -dimsu your-command`) and the computer won't sleep from being idle, the connection won't drop, and a long task won't stop halfway. To stop it: `killall caffeinate` (details below).

**Keywords**: caffeinate, what is caffeinate, caffeinate usage, keep Mac awake, prevent Mac from sleeping, stop Mac sleeping, killall caffeinate, `caffeinate -dimsu`, `-i` `-t` `-w`, keep Mac running unattended

---

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> This one comes from a very real pain: you give an Agent a job that takes a few hours, step away for a coffee, and come back to find your Mac asleep, the task stopped halfway, and Telegram unable to wake it. Today I'll show you a built-in macOS fix that takes a single line—caffeinate.

## The symptom: it runs halfway, the Mac sleeps, and the Agent "blacks out"

You've probably seen one of these:

- You leave the OpenClaw Gateway running to receive Telegram/Discord messages. You step away, come back, and the messages never arrived.
- You hand Hermes a big task—organizing a batch of files, running a long analysis, maybe an hour or two. You come back and it's stopped partway.
- You queue an automation overnight to run quietly, and in the morning nothing happened.

These all share one thing: **the moment your Mac goes to sleep, the network connection drops, background programs are suspended, and the Agent effectively blacks out.**

## Why it happens: your computer defaults to "idle means sleep"

To save power, laptops ship with a default of "sleep automatically after a while with no activity." That's good for everyday use, but for an AI Agent that needs to stay on standby or run for a long time, it's exactly the enemy.

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **Duck Editor's take**: Agents keep getting stronger, and we keep handing them jobs that take a long time. But your laptop defaults to "idle means sleep"—those two things are naturally at odds. The command below is what resolves that conflict.

## First, get one thing straight: caffeinate keeps it awake, it doesn't put it to sleep

Let me nail down the point most people get backwards:

**caffeinate's job is to prevent your Mac from sleeping—to keep it awake.** Just like a person who's had caffeine can't sleep—which is exactly where the name comes from.

Get the direction wrong and the whole thing stops making sense. What we want is this chain: **computer stays awake → connection doesn't drop → the Agent's service doesn't get interrupted.**

## The fix: one line to keep your Mac awake

Open Terminal and type:

```bash
caffeinate
```

That's it. As long as this command is running (the window is open and you haven't pressed `Ctrl + C`), your Mac won't sleep from being idle. To stop it, press `Ctrl + C` or close that terminal tab.

But that's a bit clumsy—you have to babysit a window. Here are the more practical versions.

### Breaking down the five -dimsu flags

You may have seen `caffeinate -dimsu`. That turns on all five switches. One by one:

| Flag | What it does | In plain words |
|------|--------------|----------------|
| `-d` | Prevent the **display** from sleeping | Screen stays on |
| `-i` | Prevent **system idle** sleep | Won't sleep even with no activity (the most used one) |
| `-m` | Prevent the **disk** from idle sleep | Disk won't spin down |
| `-s` | Prevent **system** sleep | Only works **on AC power** |
| `-u` | Declare the **user is active** | Pretends you're using the computer |

A few details you must know:

- **`-s` only works on AC power.** On battery it won't block sleep—that's Apple's design.
- **`-u` on its own defaults to just 5 seconds** (unless paired with `-t`), so it's more of a "nudge the screen on" than a lasting effect.
- Most people don't need all five. **For running an Agent in the background, the key one is `-i` (block idle sleep)**; add `-d` if you also want the screen on to watch progress.

### Three genuinely useful patterns

**Pattern one: run a command to completion, then release (recommended).** caffeinate can take a command right after it, and it ends the instant that command finishes—cleaning up for you:

```bash
caffeinate -dimsu your-startup-command
```

The computer stays awake exactly as long as the task runs; when the task ends, caffeinate exits too and your Mac can sleep normally again. No need to remember to turn it off.

**Pattern two: hold out for a fixed time.** Use `-t` to specify seconds—for example, 2 hours (7200 seconds):

```bash
caffeinate -i -t 7200
```

**Pattern three: watch a process that's already running.** If the Agent is already running in the background, use `-w` to "wait" on its process ID (PID); it releases the moment that process ends:

```bash
caffeinate -i -w $(pgrep -f openclaw)
```

`pgrep -f openclaw` finds OpenClaw's PID for you, and `-w` keeps an eye on it.

### 🚨 Common mistakes

**Closing the terminal window = stopping the caffeine.** caffeinate lives with that terminal window; close the window or restart the computer and it's gone. To hold out in the background long-term, append `&` to push it to the background, or use `nohup` or `tmux` so it doesn't die with the window. **But once it's in the background you can't stop it with `Ctrl + C`**—to kill it, run `killall caffeinate`, which ends every caffeinate still running at once.

**Close the laptop lid and it'll usually still sleep.** This is the most common misunderstanding. caffeinate blocks *idle* sleep, but sleep triggered by *closing the lid* is a separate thing—under normal conditions the computer still sleeps when you close the lid even with caffeinate running (unless you meet specific conditions like AC power plus an external display). To run it for a long time, keep the screen on and don't close the lid.

**`-s` does nothing on battery.** Mentioned above, worth repeating: to rely on `-s` to keep the whole system awake, stay plugged in.

**It can't fix the network itself dropping.** caffeinate only keeps the computer awake. Flaky Wi-Fi, a router reboot, or your ISP hiccupping are separate problems—don't blame those on it.

## Prevention: first decide whether you truly need 24/7 awake

This trick is handy, but don't blindly max it out. Keeping a Mac awake day and night has real costs: power draw, heat, battery wear, and a machine that's always spinning. Here's a checklist:

1. **Occasional long tasks**—use pattern one so it releases automatically when done; don't leave it running forever.
2. **Every day, staying on to receive messages / run schedules**—this is the moment to think one level ahead: shouldn't the Agent live on a machine that's already on 24/7? A cheap VPS, an old computer, even a Raspberry Pi beats forcing your main laptop to tough it out.
3. **Remember what caffeinate is for**—it's a "keep it awake temporarily" tool, not the right answer for "stand up a stable always-on service." For genuinely long-running services, `pmset`, `launchd`, or just running on a server will be steadier than a single line of caffeinate.

## FAQ

### What is caffeinate?

`caffeinate` is a built-in macOS command whose job is to **prevent your Mac from sleeping**—to keep it awake. The name comes from "caffeine"—just like a person who's had coffee can't sleep. It's most often used to keep long-running programs (AI Agents, long analyses, overnight schedules) from being interrupted when the computer sleeps.

### How do I stop / turn off caffeinate?

It depends how you started it: if it's running in the foreground of a terminal, press `Ctrl + C`; if you pushed it to the background with `&`, or ran it via `nohup`/`tmux`, run **`killall caffeinate`** to end every caffeinate still running at once. Also, with "pattern one" (`caffeinate your-command`), it exits on its own the moment the command it wraps finishes—no manual stop needed.

### What's the difference between caffeinate and pmset?

`caffeinate` keeps your Mac awake "temporarily, tied to a task or a window," and things return to normal as soon as the task ends; `pmset` is a tool for changing the "system power-management settings," better suited to long-term, global tweaks to sleep behavior. Use caffeinate for a one-off long task; for a machine that stays on long-term, `pmset`/`launchd` or simply running on a server is steadier.

### Does caffeinate work on battery?

Partly. `-i` (block idle sleep) still works on battery, but `-s` (block system sleep) **only works on AC power**—that's Apple's design. To rely on caffeinate through the night, stay plugged in.

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **Duck Editor's take**: matching the tool to the situation matters most. caffeinate is the fastest fix you can use tonight for "don't let this long task get cut off"—and it does that beautifully. But if your need slowly becomes "I want an Agent that's always online," that's no longer a stay-up-with-coffee problem—it's time to find it a real bed (a machine that's always on). Next time you hand a long task to OpenClaw or Hermes, wrap it with `caffeinate -dimsu your-startup-command` and go get your coffee in peace.
