---
title: "The Missing Infrastructure of AI Memory: Why Stronger Models Make Agents More Likely to 'Run in Circles'"
description: "Memory isn't an add-on feature for AI — it's the core infrastructure that transforms an Agent from a 'tool' into a 'partner.' This article won't walk you through a paper; instead, it helps you think clearly: if you're designing an AI Agent, what problem is the memory layer actually solving?"
contentType: "guide"
scene: "advanced"
difficulty: "intermediate"
createdAt: "2026-03-02"
verifiedAt: "2026-03-02"
archived: false
order: 6
prerequisites: ["openclaw-agent"]
estimatedMinutes: 15
tags: ["Agent", "RAG", "LLM", "MCP"]
stuckOptions:
  "Memory vs. Other Concepts": ["How is Agent memory different from RAG?", "Doesn't Context Engineering count as memory?", "Why isn't the LLM's internal memory enough?"]
  "Three Forms of Memory": ["How do I choose data structures for Token-level memory?", "What's the cost of baking memory into the model?", "What is Latent memory?"]
  "Functional Categories of Memory": ["Which is more important — experiential or factual memory?", "Is Working Memory the same as context?"]
  "Keeping Memory Alive": ["When should memory be forgotten?", "How do multiple Agents share memory?", "What about security issues with memory systems?"]
  "Current State Assessment": ["Are current tools mature enough?", "Should I use an open-source framework or build my own?"]
---

## A Question That Made Me Stop and Think for a Long Time

Imagine you've built an AI Agent to help manage projects, write code, and track decision records.

After three months of use, has it become better at understanding you and your work habits?

In most cases, the answer is: **No.**

It's the same Agent every time. You have to re-explain your background, preferences, and the special rules of your project every session. Three months of interaction, wasted — from the system's perspective, you're still strangers.

This isn't because the model isn't powerful enough. GPT-4, Claude 3.5, Gemini 2.0 — these models have incredible reasoning capabilities. The problem lies at a different layer, one that most people overlook when designing systems: **memory**.

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> **Duck Editor's note:** In late 2025, a very solid survey paper (Hu, Yuyang et al., "Memory in the Age of AI Agents", arXiv:2512.13564, 102 pages) helped me think through this a lot more clearly. This article isn't a paper summary — it's what I found useful, organized from a system design perspective.

---

## First, Define the Problem Clearly: Which Layer of Memory Are You Solving?

In the AI world, "adding memory capabilities" can mean four completely different things. Mix them up, and you'll build something weird:

| Problem You're Solving | What You're Actually Doing | Technical Direction |
|------|------|------|
| "Let AI look up our documents" | Knowledge retrieval | **RAG** |
| "The conversation is too long, the model is forgetting earlier context" | Context management | **Context Engineering** |
| "Make the model instinctively know a domain" | Capability internalization | **Model fine-tuning / Architecture changes** |
| "Let the Agent accumulate and grow across conversations and tasks" | True agent memory | **Agent Memory** |

The first three are tools — very useful, but they're static. What you put in is what you get out; the system itself doesn't change because of its interactions with you.

**Agent Memory is different.** The paper defines it as: a persistent, self-evolving system that enables an Agent to maintain consistency and adaptability over time.

The key word is "evolving" — not just retrieval, but actively adjusting its memory store after every interaction, deciding what's worth keeping, how to update, and what to discard.

<!-- @img: ai-memory-layers-comparison | Comparison diagram of four memory concept layers -->

---

## Where Does Memory Live? Three Physical Forms

This is the core question of the paper's Forms dimension. The "medium" of memory determines its speed, cost, and maintainability:

### 📝 Stored as Text (Token-level)

The most intuitive approach: store information as human-readable text, JSON, or knowledge graphs in an external database.

This is the form most Agent memory systems choose, for a practical reason: **readable, editable, debuggable**. When something goes wrong, you can open the database and see exactly what messy data is stored inside.

The trade-off is that every use requires a search pass, and as data grows, retrieval recall rate drops.

In terms of architectural design, there's a common evolution path:
- **Flat list** → Simple but hard to express relationships
- **Graph / Tree structures** → Can express "A is related to B"
- **Multi-layered hierarchy** → Can query both global summaries and local details simultaneously

Systems like MemGPT and Mem0 primarily rely on this form.

### 🧠 Baked Into the Model (Parametric)

Writing information directly into the model's neural network weights. Technical paths include:
- LoRA fine-tuning (Efficient Fine-Tuning)
- Model editing techniques (ROME, MEMIT — can precisely modify what the model "believes" about specific facts)

The advantage is zero latency — the model "just knows" without needing to search.

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> But this form has a fatal problem called **Catastrophic Forgetting** — when you bake in new knowledge, the model might forget what it previously learned. This isn't a bug; it's a fundamental characteristic of neural networks. If you need frequently updated memory, this path is very costly.

### 💧 Compressed Into Vectors (Latent)

A middle ground between the two: compress information into continuous numerical vectors, stored in KV Cache or intermediate layer states. High information density, fast for machines to process, but you can't directly "read" it — debugging is very difficult.

---

## What Is Memory For? Three Functions, Different Importance Levels

This is the paper's Functions dimension. The traditional "short-term/long-term memory" division is too crude. Categorizing by purpose has more engineering value:

### Factual Memory: Keeping Behavior Consistent

"This user is named Xiaoming, prefers Traditional Chinese, and usually works at night."

"This project's API Key expires in March, with a daily usage limit of 10K requests."

The purpose of factual memory is to ensure the Agent doesn't forget basic context across different sessions and conversations. Most implementations include this — it's the easiest part to start with.

### Working Memory: Transient State During Tasks

Like scratch paper when solving a math problem — clean it up when the task is done, no need for permanent storage. This is usually managed automatically by the framework, so developers rarely need to design it explicitly.

### Experiential Memory: Making the Agent Actually "Learn"

This is the truly interesting part of memory systems, and also the least implemented:

| Type | What It Stores | Example |
|------|------|------|
| **Case-based** | Complete raw interaction traces | "The conversation log from debugging the user's issue last time" |
| **Strategy-based** | Abstracted workflows and insights | "When encountering this type of API error, try X first, then Y" |
| **Skill-based** | Executable code or tool invocations | "A script to automatically generate weekly reports" |

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> Put simply, factual memory updates the "business card," while experiential memory updates the "skill tree." **Most Agent systems only have the business card, not the skill tree.** An Agent that's the same after three months as it was on day one doesn't lack a brain — it lacks a mechanism for accumulating capabilities.

---

## How Does Memory Stay Alive? The Lifecycle Is the Real Challenge

Once you've figured out form and function, the hardest part to design is actually the paper's Dynamics layer: how does memory come into being, grow, and die?

### Formation: What's Worth Remembering?

Memory isn't about dumping entire conversation logs into a database — it's about actively "distilling":

- Compress linear conversations into core semantic summaries
- Parse interactions into nodes and edges in a knowledge graph
- Detect "key events" (when you state an important preference, or when the Agent makes a meaningful mistake)

<!-- @img: memory-formation-flow | Memory formation flow: raw conversation → distillation → structured storage -->

### Evolution: The Tug-of-War Between Stability and Plasticity

Once memory is stored, it can't be static. There are several sub-problems:

**Consolidation:** Merging scattered fragments into meaningful patterns. You don't need to remember "every word from yesterday," but "the user's four habitual preferences" are worth keeping.

**Updating:** What happens when new information conflicts with old memory? "The user said they prefer Chinese" but later said "English for code is fine" — who overwrites whom, or do both coexist?

**Forgetting:** Actively deleting low-value information.

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> Forgetting is a first-class citizen of memory systems, not a patch. An Agent that never forgets will eventually be undermined by its own misjudgments from three months ago. The blind spot of most current implementations isn't "not storing enough" — it's "never having designed deletion logic."

### Retrieval: Not Just Search, but Active Decision-Making

Traditional RAG retrieval is passive: "Whatever the user asks, search for that."

Agent memory retrieval needs to be more proactive:

- **When** should memory be invoked? (Not every question requires it)
- **What** should be retrieved to help current reasoning, rather than just the most similar fragment?

One emerging trend the paper mentions is **Generative Retrieval** — instead of querying a database, let the model directly "synthesize" the most applicable memory context for the moment. This direction has great potential but is still in its early stages.

---

## Five Frontier Directions Emerging Right Now

This is the most forward-looking part of the original paper, and the least discussed:

### 1. Memory Automation

Most current systems rely on manual rules for memory management: "Summarize when exceeding X entries," "Delete after N days."

The next step is using reinforcement learning to let the Agent learn on its own when to remember, what format to use, and when to forget — making memory management itself an optimizable strategy.

### 2. Multimodal Memory

Text-based memory already has established approaches, but real-world Agents handle more than just text.

UI states in screenshots, emotional cues in voice conversations, operational workflows in videos — these are all memory. "How to store and retrieve memory across modalities" is a question that still has no standard answer.

### 3. Multi-Agent Shared Memory

When your system isn't one Agent but ten Agents collaborating, how do you share memory?

The problem is very concrete: if Agent A learns a trick, should Agent B automatically know about it? If Agent B later discovers that trick doesn't work in certain scenarios, should this "correction" sync back? There's no good answer to this yet.

<!-- @img: multi-agent-memory-sharing | Architecture diagram of multi-agent shared memory -->

### 4. From Vector Piles to Knowledge Graphs

This is the clearest current technical trend. Pure vector RAG works fine for "single-hop questions" (looking up one thing directly), but struggles with "multi-hop relationships" (A depends on B, B depends on C, now ask about the relationship between A and C).

Work currently receiving attention:

| System | Direction |
|------|------|
| **GraphRAG** | Organizes documents with graph structures, supports community-level summaries |
| **HippoRAG 2** | Mimics hippocampal structure, combining semantic search with graph indexing |
| **AriGraph** | Lets Agents build and maintain their own knowledge graphs during use |

The common logic: **Memory needs structure, not just a pile of vectors.**

### 5. Memory Trustworthiness

Almost no one is seriously discussing this, but it will become increasingly important:

- **Privacy:** Agent memory may contain the user's sensitive information — who can read it? Who can delete it?
- **Hallucination poisoning:** If the Agent remembers a false "fact" it made up, every future interaction will be influenced by this false memory
- **Explainability:** "Why did you give me this answer today?" — can we trace which memory influenced this decision?

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> The hallucination poisoning issue feels especially worth taking seriously. If a person believes and remembers a rumor, you can explain and correct it. If an AI Agent's memory is contaminated by false information, cleanup is much less straightforward — especially when that false memory has already influenced several rounds of decisions.

---

## Where Is the Current Ceiling?

### Paper Numbers vs. Real-World Performance

"Models now support 100K token context" — this statement contains a huge amount of water.

The **Lost-in-the-middle effect** is a well-documented phenomenon: placing critical information in the middle of a long context significantly degrades the model's answer quality. The advertised 100K has an effective working range far smaller than that number.

### What Benchmarks Tell You

MemoryAgentBench data shows that when test context increases from 6K to 32K, existing system performance drops dramatically. Memory consistency, temporal reasoning, and conflict updating all become highly unstable as context grows longer.

### But There's One Concrete Hopeful Number

MemGPT improved accuracy on cross-session memory retrieval tasks from a baseline of 32–39% to **67–93%**.

This isn't a small improvement — it's a fundamental difference. It proves that "external structured memory architecture is worth investing in" isn't just theory; there are already concrete results to compare.

<!-- @img: memory-benchmark-comparison | Memory architecture benchmark performance comparison -->

---

## If You Need to Make a Decision Right Now

### Ask the Right Question Before Choosing Tools

It's not "which framework is best" but "which layer of memory am I trying to solve":

- Need AI to look up document knowledge → **RAG is enough**, choose mature tools
- Need cross-session retention of user personal info → **External Token-level memory**, MemGPT / Mem0 are starting points
- Need the Agent to learn approaches from past tasks → **Experiential Memory**, you'll need to design your own storage and retrieval logic
- Need the model to instinctively master a domain → **Fine-tuning**, but be prepared to accept the cost of difficult updates

### Two Things Most Often Overlooked

**One, forgetting mechanisms:** Most implementations spend extensive time on "how to store" and almost zero on "when to delete." But a memory system without deletion logic becomes a noise pile after a few months.

**Two, memory structure:** The difference between storing fragments with vector embeddings and storing related nodes in a knowledge graph is massive when querying complex questions. If your Agent needs cross-topic reasoning, a flat vector store will eventually become a bottleneck.

---

## Finally, a Shift in Perspective

Many people treat AI's memory problem as "feature iteration" — first make the model stronger, deal with memory later.

But the paper proposes a framework worth serious thought: **Memory should be first-class infrastructure in Agent design, not an add-on feature.**

Just as you wouldn't design a database application by saying "let's build the UI first, we'll add the database later" — architectural decisions about the memory layer determine how far the entire system can go.

This field is still in its early stages, with many questions still lacking standard answers. But precisely because of this, thinking clearly about this layer now is far cheaper than trying to retrofit it later.

---

## Further Reading

- Original paper: [Memory in the Age of AI Agents (arXiv:2512.13564)](https://arxiv.org/abs/2512.13564)
- Paper list: [Shichun-Liu/Agent-Memory-Paper-List](https://github.com/Shichun-Liu/Agent-Memory-Paper-List)
- Want to learn about OpenClaw's memory mechanism design? See [the Soul System](/articles/openclaw-soul)
