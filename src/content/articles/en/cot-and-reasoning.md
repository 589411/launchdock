---
title: "AI Reasoning Techniques Explained: Chain-of-Thought, ReAct, and Tree of Thoughts"
description: "How did AI learn to 'think'? From Chain-of-Thought to Tree of Thoughts, discover the techniques that boost AI reasoning by 5x, and how OpenClaw uses them."
contentType: "guide"
scene: "advanced"
difficulty: "intermediate"
createdAt: "2026-02-27"
verifiedAt: "2026-02-27"
archived: false
order: 3
prerequisites: ["prompt-engineering"]
estimatedMinutes: 8
tags: ["LLM", "Prompt", "Agent", "OpenClaw"]
stuckOptions:
  "CoT basics": ["How is it different from regular prompts?", "When do I need CoT?", "Do I have to add 'think step by step' every time?"]
  "ReAct pattern": ["How is ReAct different from CoT?", "What is an Observation?", "I don't understand the Agent loop"]
  "Advanced techniques": ["What is Self-Consistency?", "Tree of Thoughts is too complicated", "Can I use these directly in OpenClaw?"]
  "Practical applications": ["How do I use reasoning techniques in Skills?", "What tasks don't need CoT?"]
---

## AI Can "Think Wrong" Too

Have you ever tried asking AI to solve a math problem?

```
You: Roger has 5 tennis balls. He buys 2 more cans, each containing 3 balls.
     How many tennis balls does he have now?
AI:  11
```

The answer is correct... but try a slightly more complex problem:

```
You: A classroom has 23 students. 5 students leave,
     then 3 new groups arrive, with 4 students in each group. How many students are there now?
AI:  26
```

Wrong. The answer should be 23 - 5 + (3×4) = 30 students.

When AI jumps straight to the answer, it tends to "skip the thinking" — just like a student who skips showing their work on an exam and writes an answer by gut feeling, often getting it wrong.

**The solution: Force AI to show its work.**

---

## Chain-of-Thought: Making AI Show Its Reasoning

### The Core Concept

In 2022, Google's research team discovered: **If you ask AI to "think step by step" in the prompt, its reasoning ability can improve by 3-5x.**

This technique is called **Chain-of-Thought (CoT)**.

### Side-by-Side Comparison

**❌ Standard prompt:**
```
A classroom has 23 students. 5 leave,
then 3 new groups of 4 students each arrive. How many students are there now?
```
AI answers: `26` (Wrong)

**✅ CoT prompt:**
```
A classroom has 23 students. 5 leave,
then 3 new groups of 4 students each arrive. How many students are there now?
Let's work through this step by step.
```
AI answers:
```
Let me calculate step by step:
1. Originally 23 students
2. 5 leave → 23 - 5 = 18 students
3. 3 groups arrive, 4 per group → 3 × 4 = 12 students
4. 18 + 12 = 30 students
The answer is 30 students.
```

✅ Correct.

### Why Does It Work?

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> Analogy: You ask a student to solve a math problem. They calculate in their head and blurt out "26." You ask them to write down their work, and at step two they catch their own mistake. **The written process itself is a self-correction mechanism.**

Technically, CoT works because:
- **Breaks down complex problems**: One big problem becomes multiple small ones, each step is a simple problem
- **Intermediate steps are checkable**: Errors can be caught at a specific step
- **Leverages the model's sequential generation**: Each generated token influences the next token

---

## Three Ways to Use CoT

### 1. Zero-shot CoT: The Simplest Approach

**No examples needed** — just add one sentence:

```
[Your question]
Let's think step by step.
```

That's it. Adding this one sentence boosted math and logic accuracy from **17.7%** to **78.7%** — that's from Google's paper, not made up.

### 2. Few-shot CoT: With Examples

Give AI 2-3 examples that include the reasoning process, so it learns the format:

```
Question: Mike has 3 apples. Jane gives him 5 more, and he eats 2. How many are left?
Reasoning:
- Started with 3
- Plus 5 → 3 + 5 = 8
- Ate 2 → 8 - 2 = 6
Answer: 6

Question: [Your new question]
Reasoning:
```

More stable than Zero-shot, especially when **you know the correct reasoning approach**.

### 3. Self-Consistency: Majority Vote

Ask the same question and have AI **answer 5 times using CoT**, then see which answer appears most often — **majority rules**.

```
Answer 1: 300 (reasoning path A)
Answer 2: 360 (reasoning path B)
Answer 3: 360 (reasoning path C)
Answer 4: 360 (reasoning path D)
Answer 5: 300 (reasoning path E)

Vote result: 360 (3/5 votes) → Use 360
```

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> Analogy: When you're unsure of the answer, ask 5 people and go with the majority. It's not guaranteed to be right, but chances are better than asking just 1 person.

---

## ReAct: Making AI Think and Act Simultaneously

### CoT's Limitation

CoT teaches AI to reason, but it can only think "in its head" — when it needs to look up data or use tools, it falls short.

> "Will it rain in Taipei tomorrow?"
> AI can reason with CoT, but without weather data, it can only guess.

### ReAct = Reasoning + Acting

The 2022 ReAct paper merged **reasoning** and **acting**:

```
Thought → Action → Observation → Thought...
```

Full workflow:

```
User: "Will it rain in Taipei tomorrow? Help me decide whether to bring an umbrella."

[Thought] User is asking about Taipei weather. I need to check the forecast for an accurate answer.
[Action]  Call weather.get_forecast(city="Taipei", day="tomorrow")
[Observation] API returns: 80% chance of rain, 18-22°C, northeast wind
[Thought] 80% chance of rain is high — I should recommend an umbrella.
          Temperature is on the cool side, I can suggest a jacket too.
[Answer]  Tomorrow in Taipei there's an 80% chance of rain — bring an umbrella!
          Temperature 18-22°C with northeast winds, so a light jacket would help too.
```

### This Is the Core of OpenClaw's Agent

**OpenClaw's Agent mode is an implementation of the ReAct loop:**

1. **Perceive** (receive your instruction)
2. **Think** (analyze which Skills are needed)
3. **Act** (call a Skill / tool)
4. **Observe** (receive the tool's result)
5. **Back to Think** (determine if the task is complete)

```
You: "Organize my to-do list for today and send it to Telegram"

Agent thinks: Needs two steps — get to-dos + send message
Agent acts: Calls Todoist Skill → Gets today's to-dos
Agent observes: Received 5 to-do items
Agent thinks: Format and send to Telegram
Agent acts: Calls Telegram Skill → Sends formatted list
Agent observes: Sent successfully
Agent replies: "I've sent your 5 to-do items to your Telegram!"
```

> See [Agent Complete Guide](/en/articles/openclaw-agent) for details.

---

## Advanced: Tree of Thoughts

### From Chain to Tree

CoT is a **linear** thinking path — from A → B → C → answer.

But some problems don't have a clear next step and require **exploring multiple paths**:

```
Chain-of-Thought (chain):
A → B → C → answer

Tree of Thoughts (tree):
         A
       / | \
      B  C  D
     /|    / \
    E  F  G   H
    ✅     ✅
  (Found two viable paths, pick the best one)
```

### When Do You Need Tree of Thoughts?

| Problem Type     | CoT Is Enough | Needs Tree of Thoughts |
| ---------------- | ------------- | ---------------------- |
| Math calculation  | ✅           |                        |
| Translation       | ✅           |                        |
| Creative writing  |              | ✅ (need to try different styles) |
| Strategic planning|              | ✅ (need to compare multiple plans) |
| Debugging code    |              | ✅ (need to hypothesize multiple causes) |

> <img src="/images/dock_head_s.png" alt="Duck Editor" width="24" style="vertical-align: middle;"> OpenClaw's swarm intelligence mode is like an automated Tree of Thoughts — multiple Agents each explore different paths, then vote on the best result. See [Multi-Agent Collaboration](/en/articles/multi-agent-swarm) for details.

---

## Reasoning Technique Comparison Table

| Technique | Core Concept | Best For | OpenClaw Application |
| --------- | ------------ | -------- | -------------------- |
| **Zero-shot CoT** | Add "think step by step" | Everyday questions | Prompt in Skills |
| **Few-shot CoT** | Provide 2-3 examples | Specific domains | SOUL.md examples |
| **Self-Consistency** | Multiple answers, majority vote | Important decisions | Multiple runs + comparison |
| **ReAct** | Reasoning + action loop | Tasks requiring tools | Agent core loop |
| **Tree of Thoughts** | Explore multiple paths | Creative/strategy | Swarm intelligence |

---

## Practical Recommendations: When to Use What

### Daily Use (80% of Cases)
Just add "Let's think step by step" at the end of your prompt. That's usually enough. Don't overthink it.

### Complex Tasks
Let OpenClaw's Agent mode handle it automatically — it has a built-in ReAct loop, so you don't have to manage it manually.

### Important Decisions
Design workflows in your Skills that run multiple times and compare results — that's the Self-Consistency approach in action.

---

## Further Reading

- 📝 [Prompt Engineering Complete Guide](/en/articles/prompt-engineering) — The foundation for reasoning techniques
- 🤖 [Agent Complete Guide](/en/articles/openclaw-agent) — ReAct implemented in OpenClaw
- 🧠 [AI Technology Evolution Overview](/en/articles/ai-tech-evolution) — Where reasoning techniques fit in AI's development
- 🐝 [Multi-Agent Collaboration and Swarm Intelligence](/en/articles/multi-agent-swarm) — The group version of Tree of Thoughts
