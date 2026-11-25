---
title: "AI Keywords Explained: LLM, Token, Agent, MCP, Skill, and More, From 2024 to Today"
description: "You keep hearing these words in the news, from friends, and in ads, but nobody tells you which era each one came from. This guide arranges two years of AI keywords by stage, gives each term one plain sentence and one everyday comparison, and points you to where to read more."
contentType: "guide"
scene: "intro"
difficulty: "beginner"
createdAt: "2026-11-25"
verifiedAt: "2026-11-25"
archived: false
estimatedMinutes: 15
tags: ["LLM", "Token", "Agent", "MCP", "Skill"]
---

Do you hear "Token," "Agent," or "MCP" in the news or in conversation, nod along, and at the end realize you have no idea what they mean?

That's not your fault. These words show up faster than anyone can explain them. You don't need to read any code here. Just keep one idea in mind: **AI has grown up quickly over the past two years, like a new employee. At each stage it picked up a new skill, and people gave each skill a new name.** Once you place the words on a timeline, they stop looking like a jumble.

> <img src="/images/dock_head_s.png" alt="Duck editor" width="24" style="vertical-align: middle;"> **A note from the duck editor**: Every word answers the same question: "What was AI stuck on at that time?" Once you know the answer, the word sticks.

## A map of the four stages

![The four stages of AI keywords: chatting, thinking, looking things up and acting, and taking on tasks](/images/articles/ai-keywords-glossary/ai-four-stages.svg)

Four stages. Each one fixed a weakness of the stage before it:

| Stage | Roughly when | What AI was bad at | Keywords that appeared |
|-------|--------------|--------------------|------------------------|
| 1. Chatting | Around 2024 | Could talk, but often made things up and couldn't hold much | LLM, Token, API, Prompt, Context Window, Hallucination |
| 2. Thinking | Late 2024 to 2025 | Answered in one breath, often wrong on hard questions | Reasoning model, CoT (Chain-of-Thought) |
| 3. Looking things up and acting | 2024 to 2025 | Could talk, but couldn't search your files or click buttons | RAG, Embedding, Function Calling, Computer Use, MCP |
| 4. Taking on tasks | 2025 to now | One sentence at a time, couldn't finish a whole job | Agent, ReAct, Skill, Loop, Harness, Context Engineering, Multi-Agent |

Each term below gets one plain sentence and one comparison. That's enough to follow the news. Links point to deeper articles when you want more.

## Stage 1: The chatting AI

**LLM (Large Language Model)**
The "brain" behind ChatGPT, Claude, and Gemini. It has read huge amounts of text, and its core skill is predicting the most likely next piece of text.
Comparison: a well-read friend who has read every book in the world but never lived any of it. To compare the plans, see [How to choose your AI brain](/en/articles/llm-guide/).

**Token**
The smallest unit a model uses to measure text, going in and coming out. It's roughly a word or a few characters. The more text goes in and comes out, the more Tokens you use, and the more you pay.
Comparison: a phone bill. The longer you talk, the bigger the bill. See [Token Economics](/en/articles/token-economics/).

**API and API Key**
An API is the ordering window between programs: your program sends a question, and the model sends the answer back. An API Key is the string that proves who you are when you use that window.
Comparison: the API is the restaurant's order window, and the API Key is your access card. Don't let the card leak. See [API Key setup guide](/en/articles/ai-api-key-guide/).

**Prompt**
The instructions you give the AI. This is the one thing you control directly.
Comparison: a menu order. The clearer you are, the more accurately the chef cooks. See [Prompt Engineering basics](/en/articles/prompt-engineering/).

**Context Window**
The range of text the AI can "see" at one time, including your question, the earlier conversation, and any material you pasted in.
Comparison: a desk. The desk is only so big. If you spread out too many pages, the ones at the very front get pushed off the edge, and the AI forgets them. Early models could take in only a few pages. Today some models can take in something close to a whole book at once, but even a big desk has a limit. See [The full timeline of AI tech](/en/articles/ai-tech-evolution/).

**Hallucination**
When the AI confidently states something wrong, in exactly the same tone it uses when it's right.
Comparison: a student who writes answers to questions they never studied. It isn't lying on purpose. It learned how to sound right, not how to check facts. That's the problem RAG tries to solve. See [RAG explained](/en/articles/rag-explained/).

## Stage 2: The thinking AI

**Reasoning Model**
Starting with OpenAI's o1 series in September 2024, "think for a round before answering" became a built-in ability of the model. Before replying, it works through the problem internally and then gives you the conclusion.
Comparison: working out a math problem on scratch paper before handing in the test, rather than writing the answer the moment you see the question. The trade-off is that it's slower and uses more Tokens.

**CoT (Chain-of-Thought)**
Getting the AI to write out its reasoning step by step. Early on, simply adding "think step by step" to a prompt often improved accuracy noticeably. Reasoning models built that behavior in.
Comparison: a math problem where you show the working, not just the final number. See [AI reasoning techniques explained](/en/articles/cot-and-reasoning/).

## Stage 3: The AI that looks things up and acts

**RAG (Retrieval-Augmented Generation)**
Before answering, the system searches a database you specify, finds the relevant passages, and answers based on what it found.
Comparison: an open-book exam where you flip straight to the right page instead of relying on memory.
**Embedding** is the foundation that lets a computer search by meaning. Each passage is placed on a map of meaning, so passages that mean similar things sit close together. RAG uses this to find the right page. See [RAG explained](/en/articles/rag-explained/).

**Function Calling / Tool Use**
The AI itself can't browse the web, open files, or click buttons. But it can make a request, such as "please check the weather for me," and your program carries it out and returns the result.
Comparison: you don't drive the car yourself, but you tell the driver where to go. This is the turning point where AI went from "only talks" to "gets things done." See [Tool calling is the real skill](/en/articles/llm-tool-calling-era/).

**Computer Use**
In October 2024, Anthropic introduced a way for Claude to look at a screen and operate a computer with a mouse and keyboard. Browsers that can operate websites on their own followed.
Comparison: an assistant sitting at your computer, clicking buttons and filling in forms for you. See [AI can now operate websites on its own](/en/articles/ai-agent-browsers/).

**MCP (Model Context Protocol)**
A standard that defines how AI connects to outside tools such as Notion, Gmail, or a database. Anthropic made it public in November 2024. Before, every tool needed its own custom connection. With a standard, you plug in and it works, like USB.
Comparison: an office internal phone system that lets people in different departments talk through one shared setup. See [MCP protocol](/en/articles/mcp-protocol/), and for choosing MCP servers, see [Which MCP servers to install](/en/articles/mcp-servers-picks/).

## Stage 4: The Agent that takes on tasks

**Agent (AI Agent)**
An AI that doesn't just answer questions. Given a goal, it breaks the job into steps, uses tools, checks the results, and adjusts. From 2025 on, you'll run into agents in many tools.
Comparison: a trained intern who follows the SOP and makes their own calls when something unexpected happens. See [OpenClaw's agent explained](/en/articles/openclaw-agent/).

**ReAct**
A common way an agent works: think one step, act one step, look at the result, then think about the next step.
Comparison: searching for something while judging as you go: "not in this drawer, so I'll try the next one." See [AI reasoning techniques explained](/en/articles/cot-and-reasoning/).

**Loop**
The rhythm in which an agent finishes a big job one round at a time: do a round, check the result, then decide the next round, instead of one question and one answer.
Comparison: processing 200 receipts one by one, rather than handing the whole stack to an intern at once. See [Prompt, Context, Loop, and Harness explained](/en/articles/ai-agent-jargon/).

**Skill**
A reusable instruction set for one kind of work, plus small tools, which the agent loads only when needed. In October 2025, Anthropic introduced Agent Skills, and in December 2025 it published them as an open standard. More and more tools now support them.
Comparison: a specialty the intern has learned. Say one phrase and they carry out a whole routine. See [OpenClaw Skill basics](/en/articles/openclaw-skill/) and [From prompts to skills](/en/articles/from-prompt-to-skill/).

**Harness**
The set of rules and checks wrapped around the model: it sets boundaries, verifies results, and recovers when something goes wrong.
Comparison: a company's quality control and supervision system. With the same model, a good Harness can make a big difference in how reliable the result is. See [Anatomy of an AI agent](/en/articles/ai-agent-anatomy/).

**Context Engineering**
The skill of deciding which material the AI sees for each request: what goes on the desk, what gets put away, and in what order.
Comparison: laying out the documents the intern actually needs, instead of pushing the whole filing cabinet over to them. See [The infrastructure AI memory needs](/en/articles/ai-agent-memory-guide/).

**Multi-Agent**
Several agents dividing up the work: one looks up information, one drafts, and one checks.
Comparison: a team of interns splitting up a project. See [Multi-agent systems and swarm intelligence](/en/articles/multi-agent-swarm/).

## Quick reference

When you run into a word you've forgotten in the news, come back to this table:

| Keyword | One line | Comparison |
|---------|----------|------------|
| LLM | The AI's brain | A well-read friend |
| Token | The unit for measuring and billing | A phone bill |
| API Key | Your credential for using a service | An access card |
| Prompt | Your instructions to the AI | A menu order |
| Context Window | How much the AI can see at once | A desk |
| Hallucination | Confidently saying something wrong | A student who writes answers without checking |
| Reasoning model | Thinks a round before answering | Working it out on scratch paper first |
| RAG | Looks things up before answering | Open-book exam |
| Function calling | The AI asks for an action, and a program does it | Telling the driver where to go |
| MCP | A standard for connecting AI to outside tools | The office internal phone |
| Agent | An AI that breaks down and does tasks itself | An intern |
| Skill | A reusable specialty | A learned routine |
| Harness | Rules and checks that keep an agent in line | The quality control system |

## The duck editor's note: why are there so many terms?

Every time AI gets stuck somewhere, someone invents a fix and gives it a name. More names don't mean AI has become more complicated. Each layer of trouble just got split out and labeled. You don't need to memorize all of them. Remember that "each term patches one problem" and you're most of the way there.

Also, the same word can mean different things to different people. "Agent," for example, sometimes means a chatbot and sometimes a program that runs a workflow on its own. When you hit this, just ask, "Which kind do you mean?" That works far better than guessing.

## One thing you can do tomorrow

Open the AI tool you use most and look through its settings. See whether it has options like "system prompt," "connectors," or "Skills." Pick one and open it to see what it says. You'll notice that these abstract words are already built into tools you use.

## 🔗 Further reading

- [The full timeline of AI tech, from Transformer to swarm intelligence](/en/articles/ai-tech-evolution/): the complete historical arc
- [Token Economics](/en/articles/token-economics/): Token details and controlling your bill
- [MCP protocol](/en/articles/mcp-protocol/): how MCP works
- [Anatomy of an AI agent: Skill, tools, and Harness](/en/articles/ai-agent-anatomy/): the three layers of an agent
