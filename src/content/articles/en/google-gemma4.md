---
title: "Google's Open-Source Powerhouse Gemma 4: Multimodal AI You Can Run Locally"
description: "Google open-sourced Gemma 4 in April 2025 — multimodal (text, image, audio), runs on consumer hardware, Apache 2.0 licensed. Free for commercial use. Here's what it means."
contentType: "guide"
scene: "blog"
difficulty: "beginner"
createdAt: "2026-04-23"
verifiedAt: "2026-04-23"
archived: false
order: 5
prerequisites: ["llm-guide"]
estimatedMinutes: 10
tags: ["LLM", "Ollama", "OpenClaw", "Google", "開源"]
stuckOptions:
  "Gemma 4 vs Gemini": ["Both are Google — what's the difference?", "Can Gemma 4 do everything Gemini can?"]
  "Can my computer run it": ["How much VRAM do I need?", "Will it run on a MacBook?", "No GPU — is that a problem?"]
  "What does Apache 2.0 mean": ["Can I use it commercially?", "Do I have to open-source my code?"]
---

> This is a first-hand take, not a pure tutorial. When Gemma 4 dropped, I pulled it locally the same day.

---

## Why Gemma 4 Matters

There's always been a clear divide in AI models:

- **Closed models:** GPT-4o, Claude 3.7, Gemini 2.0 Ultra — strong capability, but you pay per token, data goes to someone else's server
- **Open models:** Llama, Mistral, Gemma — you own the weights and can run locally, but capability lagged noticeably

Gemma 4 makes that line blurry.

In April 2025, Google pushed a set of commercially-viable, multimodal models into the Apache 2.0 license.

Plain English: **free, commercial-use allowed, runs locally, handles images and audio.**

---

## What Gemma 4 Actually Is

Gemma 4 is an open-weight model family from Google DeepMind.

"Open-weight" differs slightly from "fully open-source" — training data and training code aren't public, but **the model weights are fully public**: download them, run them locally, use commercially, fine-tune on your own data.

The underlying architecture is shared with Gemini 2.0, but optimized for efficient execution on consumer hardware.

---

## Four Variants, Four Use Cases

| Variant | Effective Params | Modalities | Best Deployment |
|---------|-----------------|-----------|----------------|
| **E2B** | 2.3B | Text, Image, **Audio** | High-end phones, edge devices |
| **E4B** | 4.5B | Text, Image, **Audio** | Consumer GPUs (under 12GB VRAM) |
| **26B A4B** (MoE) | 3.8B active / 25.2B total | Text, Image | Laptops, workstations |
| **31B** | 30.7B | Text, Image | Consumer GPU (24GB VRAM, e.g. RTX 4090) |

> The "E" in E2B/E4B stands for "Effective parameters." These small models use Per-Layer Embedding (PLE) — a technique that adds per-token, per-layer embeddings. Total parameter count looks large, but inference memory is dramatically smaller than that number suggests.

The "A" in 26B A4B stands for "Active parameters." This MoE model activates only ~3.8B parameters per inference step — making it nearly as fast as a 4B model while having far more total capacity.

---

## The Features That Impressed Me

### 1. Native Audio Support (E2B and E4B)

Running a voice pipeline previously required two models: an ASR model for speech-to-text, then an LLM for the answer.

Gemma 4's E2B and E4B collapse those two steps into one — audio goes in, text comes out.

Supports multilingual transcription and translation, up to 30 seconds of audio.

### 2. Built-in Thinking Mode

Every variant has configurable thinking — activate it by adding `<|think|>` to the system prompt. The model then produces internal reasoning before giving its final answer.

On math, coding, and logic tasks, enabling thinking mode makes a significant difference.

AIME 2026 math competition: the 31B variant scores **42.5%** — a result only achievable with thinking mode enabled.

### 3. Very Long Context Windows

- E2B / E4B: **128K tokens** (~90,000 words)
- 26B A4B / 31B: **256K tokens** (~180,000 words)

256K tokens is roughly:
- A 300-page book
- A medium-sized software project's full codebase
- Several months of meeting notes

### 4. Apache 2.0 License — This Is the Key Detail

Many "open" models come with meaningful restrictions. Apache 2.0 is one of the most permissive licenses available:

- ✅ Commercial use allowed — no licensing fees
- ✅ Fine-tuning allowed — you can keep the result private
- ✅ No copyleft — you don't need to open-source your own code
- ✅ Patent grant included — matters for enterprise adoption

This means you can build a commercial product on Gemma 4, charge customers, and owe Google nothing.

---

## What Hardware Do You Need?

| Your Computer | What You Can Run |
|--------------|-----------------|
| High-end Android phone | E2B (Google-optimized) |
| MacBook (Apple Silicon) | E4B easily; 26B A4B depends on RAM |
| Desktop with RTX 3060 (12GB) | E4B runs smoothly |
| Desktop with RTX 4090 (24GB) | 31B runs well |
| Laptop, CPU only | E2B is theoretically possible, but slow |

**Easiest path: Ollama**

```bash
# Pull Gemma 4 E4B
ollama pull gemma4:4b

# Run it
ollama run gemma4:4b
```

If you already have Ollama installed, that's it.

---

## Benchmark Performance: Honest Assessment

### Strengths

| Benchmark | 31B Score | Notes |
|-----------|-----------|-------|
| MMLU Pro (broad knowledge) | 69.4% | Competitive with open models in its class |
| AIME 2026 (math olympiad) | 42.5% | Thinking mode enabled |
| LiveCodeBench v6 (coding) | 52.0% | Strong code generation |
| MMMU Pro (visual understanding) | 52.6% | Strong multimodal |

### The Honest Limitation

Gemma 4 is not at the absolute frontier. GPT-4o, Claude 3.7, and Gemini 2.0 Ultra still outperform it on the most demanding reasoning and agentic tasks. If you need state-of-the-art performance on hard benchmarks, closed models still have the edge.

But for most practical applications, the gap is smaller than you expect.

---

## When Does Gemma 4 Make Sense?

### 1. Sensitive Data Processing
Legal contracts, medical records, financial documents — these can't go to external APIs. Gemma 4 runs on-device; data never leaves your machine.

### 2. Local RAG Systems
Pair with a private knowledge base for fully offline document Q&A.

### 3. Commercial Fine-Tuning
Apache 2.0 + your proprietary data = a custom domain model, zero licensing fees.

### 4. Audio Processing Pipelines
E2B/E4B accept audio natively — no separate ASR model needed, simpler architecture.

### 5. Local OpenClaw Agent Backbone
This is the use case I find most interesting. OpenClaw + local Gemma 4 + MCP tools = a fully cloud-independent AI Agent.

---

## Gemma 4 vs. Llama 4

Both landed in early 2025:

| Comparison | Gemma 4 | Llama 4 |
|-----------|---------|---------|
| Architecture | Dense + MoE | Hybrid MoE |
| Audio support | ✅ (E2B/E4B) | ❌ |
| License | Apache 2.0 | Custom license (has restrictions) |
| Small model quality | E4B is excellent | Competitive |
| Best for | Local deployment, multimodal | Large-scale services |

Llama 4's custom license has more commercial restrictions than Apache 2.0. For businesses, Gemma 4 is cleaner.

---

## Where to Get It

- **Hugging Face:** [huggingface.co/google](https://huggingface.co/google) (accept terms of use)
- **Google AI Studio:** Try in browser, no download needed
- **Ollama:** `ollama pull gemma4:4b`
- **Vertex AI:** Managed API, enterprise-grade

---

## The Bottom Line

Gemma 4 pushes the boundary of what you can run locally another significant step forward.

It's not going to replace GPT-4o or Claude for the hardest tasks. But it does something important: **it turns a capable-enough model into something that's freely licensed, locally runnable, and multimodal.**

For private data applications, cutting API costs, or building AI Agents that don't depend on cloud infrastructure — Gemma 4 is now a top-tier option.

---

## Further Reading

| Topic | Article |
|-------|---------|
| Running open models locally | [Ollama + OpenClaw (macOS)](/articles/ollama-openclaw-mac) |
| Local Agent architecture | [AI Tool Landscape](/articles/ai-tool-landscape) |
| What is RAG | [RAG Explained](/articles/rag-explained) |
| Choosing the right model | [LLM Guide](/articles/llm-guide) |
