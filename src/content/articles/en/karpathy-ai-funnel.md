---
title: "How the World Uses AI, as a Funnel: Where Do You Stand? (On Karpathy's New Post)"
description: "Karpathy describes how the world uses AI as a steep four-layer funnel, and says the gap he flagged in April is widening. This piece breaks down the four layers and three drivers in plain language, then shows how to climb one layer up."
contentType: "guide"
scene: "blog"
difficulty: "beginner"
createdAt: "2026-10-30"
verifiedAt: "2026-10-30"
archived: false
order: 9
prerequisites: []
estimatedMinutes: 7
tags: ["LLM", "Agent", "OpenAI", "Anthropic"]
stuckOptions:
  "What is the funnel?": ["Is the funnel a metaphor, or are there real headcounts?", "Why are the bottom layers so small?"]
  "What is jaggedness?": ["Does jaggedness mean AI breaks down?", "Why is math and code ahead of writing?"]
  "How do I climb up?": ["Do I have to pay for the premium plan?", "My job isn't technical, where would AI help?"]
---

## When you use AI, have you ever wondered how everyone else is using it?

You open ChatGPT, Claude, or Gemini every day, and it may feel like a search engine that chats a little better. Meanwhile, someone else has AI rewriting an entire project and changing a dozen files at once. Both of you say "I use AI," but you are not talking about the same thing.

On October 11, 2026 (US time; October 12 in Taipei), Andrej Karpathy posted a note that draws this gap as a steep funnel. Here I unpack it, then tell you where you probably sit and how to climb one layer tomorrow.

## Four layers: the higher you go, the fewer people

![全世界使用 AI 的程度像一個陡峭的漏斗：越往上人越少](/images/articles/karpathy-ai-funnel/ai-use-funnel.png)

Karpathy calls these "napkin math," his own term for a rough back-of-the-envelope estimate, not a census. From the bottom up, his numbers are:

1. **Layer 1: barely in contact with large language models (LLMs).** About 6 billion people, roughly 75% of the population.
2. **Layer 2: occasional users of free tiers.** About 1 to 2 billion people, roughly 20%. They use free ChatGPT-style products and see a slightly smarter search or writing helper, maybe something that books a flight. Karpathy notes that many professionals outside math and code, including executives, also sit here: they understand the topic, but mostly second-hand.
3. **Layer 3: professional use of frontier models for math and code.** About 20 million people, roughly 0.2%. They have seen firsthand that large, complex projects that used to take weeks or months can now be finished by agents from a single prompt.
4. **Layer 4: internal access to the most advanced systems.** About 5,000 people, roughly 0.00006%. The outside world has only seen a preview. By his account, internal systems can already have thousands of agents collaborating for weeks on large software projects.

The point is not the numbers but that all of this is happening at once. Most people have not really used these systems, and those who tried them met what looks like a clumsy chatbot. A small group of professionals is living through the vertigo of a curve that is getting very steep.

## Why the funnel has this shape: three drivers

Karpathy lists three factors. In my own words:

- **Ambition and problem size.** How much AI can do for you depends on whether you have a problem that is big, hard, and worth real time. Ask "how do I translate this sentence" and the system barely breaks a sweat. Hand it a task that needs hours of sustained work, and the gap opens up. This mainly drives the people axis: whether you move up at all.
- **Jaggedness (能力鋸齒).** AI capability does not rise evenly. It comes in peaks, concentrated in domains that are digital, verifiable, and economically valuable. One reason is that the capability comes from reinforcement learning on verifiable rewards: whether tests pass or a proof checks out can be judged clearly, so those domains train well. Writing a moving essay is much harder to score. Another reason is that those domains carry high business value, so companies put their resources there. This mainly drives the domain axis, which is why math and code have advanced furthest.
- **Access.** Free, paid, and internal tiers differ not only in price but in the level of model and tools. The same question can get answers from very different generations of systems.

## Back to April: the "speaking past each other" problem

Karpathy's October post is really dusting off an April post. The April argument was that one group had only tried free tiers, saw the models' odd quirks and hallucinations, and drew conclusions. Another group paid for the top agentic tools for programming and research and saw remarkable progress. Each group spoke past the other, and both had a point.

In October he says the gap is no longer just a failure to communicate. It has become **a steep funnel**. Each layer up holds far fewer people, and each sees a very different level of AI capability.

So if AI felt underwhelming to you in April, it may really have been underwhelming for your use case, but that does not mean it is underwhelming for everyone. And if you see someone claim AI can rewrite a whole system, you do not need to panic that you are hopelessly behind. The real question is: **which layer are you on?**

## Duck Editor's note: where are you, and how do you climb?

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **Duck Editor's note**: This is my own judgment, not a figure from Karpathy. From what I see, most non-technical professionals, such as admin staff, salespeople, teachers, and shop owners, are stuck on layer 2. It is not that they lack intelligence. They tend to use the free tier now and then, with no real big problem that forces the tool to work hard. The tool is not the bottleneck; you have not yet put it into a job that would stretch it.

To climb one layer, I would start with three moves:

1. **Give it a big problem you actually care about.** Do not stop at "write me an email." Spell out the context: "Next month I need to split my shop's member list into three promotion groups. The data is here. First, tell me what looks wrong and how to set the criteria." The problem should be large enough to have follow-up steps.
2. **Try a paid frontier model or agentic tool once.** The free tier is a taste test. To know whether it can do your work, let it run one complete real task. You do not need the most expensive plan on day one, but you should finish at least one full run.
3. **Start with tasks you can verify.** Pick work where you can see right or wrong: tidy up a messy spreadsheet into a summary table, have it write a small script and run it, check the numbers it calculated. If you can judge the output, you can judge whether it is trustworthy, and this is the steadiest path from layer 2 to layer 3.

If you want to sort out which tools are which, read [Is OpenClaw Right for You? Walk Through These Five Layers First](/en/articles/which-ai-tool-for-you/). If you want to see why you do not need to panic about tools, read [AI Using Tools On Its Own Is Becoming the Baseline—So You Don't Need to FOMO](/en/articles/dont-fomo-ai-tools/). And if you decide on step 3 to use Claude Code on your computer, start with [How to Install Claude Code on Windows and Mac: One Command, Login, First Launch](/en/articles/install-claude-code/).

## Closing: a funnel is not an ID card

Karpathy's picture shows where people are now, not your ceiling. But the gap really is widening, so I think "have you had AI do one real piece of work?" matters more right now than "do you understand the tech?"

## One thing you can do tomorrow

Pick a task you truly care about and that produces a result you can see. Write the brief in five lines or fewer: the background, the goal, the data you have, and the output you want. Run it once with the AI you normally use. If you have a paid plan, or access to the strongest model you can try, run the same brief there too, then compare the two results side by side. The difference tells you which layer you are on and where to climb next.

## Original source

- **Post 1** (Andrej Karpathy, on the four-layer funnel): 2026-10-11 US time, 2026-10-12 03:12 Taipei time. https://x.com/karpathy/status/2109361546505966046
- **Post 2** (Andrej Karpathy, on the April "speaking past each other" post): 2026-04-09 US time, 2026-04-10 04:10 Taipei time. https://x.com/karpathy/status/2042334451611693415

All headcounts and percentages above are Karpathy's own rough estimates, not census results.
