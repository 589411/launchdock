---
title: "Article Media Guide: How to Insert Images, GIFs, and Videos"
description: "How to efficiently insert screenshots, animated GIFs, and YouTube videos in LaunchDock articles to make tutorials vivid and easy to follow."
contentType: "reference"
scene: "advanced"
difficulty: "beginner"
createdAt: "2026-02-24"
verifiedAt: "2026-02-24"
archived: true
archivedReason: "Internal editorial guide, not published for readers"
discussionUrl: "https://github.com/589411/launchdock/discussions"
order: 99
estimatedMinutes: 5
tags: ["LaunchDock", "圖片", "GIF"]
stuckOptions:
  "Image Hosting": ["Should images go on GitHub or a CDN?", "Do free image hosts have traffic limits?"]
  "Images": ["How do I compress oversized images?", "My Markdown image path is wrong"]
  "GIF Animations": ["GIF file is too large and exceeds limits", "What tool should I use to record GIFs?"]
  "Videos": ["How do I get the YouTube embed code?", "The video aspect ratio is distorted"]
---

## Why Do You Need Images and Videos?

The biggest problem with text-only tutorials is — when a reader sees "click the Settings button in the top-right corner," they're not sure which one you mean.

Adding screenshots, GIF animations, or demo videos can boost learning efficiency by 3-5x.

---

## Image Hosting: Where Should Images Go?

### Option 1: Project's public Folder (Recommended)

Place images directly in the project's `public/images/articles/` directory:

```
public/
└── images/
    └── articles/
        ├── deploy-cloud/
        │   ├── zeabur-signup.png
        │   ├── zeabur-deploy.gif
        │   └── zeabur-dashboard.png
        ├── skill/
        │   ├── skill-editor.png
        │   └── skill-run-demo.gif
        ├── agent/
        │   └── agent-loop.png
        └── soul/
            └── memory-diagram.png
```

**Pros:**
- Version controlled with Git
- No broken links (no external service dependency)
- Images visible during local development

**Cons:**
- Large files make the repo bigger (aim for < 500KB per image)

**Markdown reference:**

```markdown
![Zeabur signup page screenshot](/images/articles/deploy-cloud/zeabur-signup.png)
```

### Option 2: GitHub Issue Image Hosting (Quick)

The simplest free option:

1. Open an Issue on any GitHub repo
2. **Drag and drop** images into the Issue text box
3. GitHub automatically uploads and generates a URL
4. Copy the URL into your Markdown
5. The Issue doesn't need to be submitted (you can cancel)

```markdown
![Screenshot description](https://github.com/user-attachments/assets/xxxxxxxx.png)
```

**Pros:** Free, unlimited, CDN-accelerated
**Cons:** Depends on GitHub service

### Option 3: Cloudflare R2 / AWS S3 (Production)

Suitable for large volumes of images or when CDN acceleration is needed:

```bash
# Using Cloudflare R2 (free 10GB/month)
# Upload with rclone
rclone copy ./screenshots r2:launchdock-images/articles/
```

**Pros:** Professional, fast, custom domain support
**Cons:** Requires additional setup

### Recommended Strategy

| Scenario | Recommended Option |
|---|---|
| Early development, few articles | Option 1 (public folder) |
| Quick screenshots | Option 2 (GitHub Issue) |
| Production, large volume of images | Option 3 (Cloudflare R2) |

---

## Images: Static Screenshots

### Recommended Screenshot Tools

| Tool | Platform | Highlights |
|---|---|---|
| **CleanShot X** | macOS | Top recommendation, supports annotations, mosaic |
| **Shottr** | macOS | Free, lightweight |
| **ShareX** | Windows | Most feature-rich |
| **Flameshot** | Linux | Open-source and free |

### Screenshot Best Practices

1. **Crop to the relevant area:** Don't capture the full screen — just the relevant portion
2. **Add annotations:** Use arrows or boxes to highlight key areas
3. **Consistent sizing:** Recommended width 800-1200px
4. **Compress:** Use [TinyPNG](https://tinypng.com) to compress, target < 300KB

### Markdown Syntax

```markdown
<!-- Basic image -->
![Zeabur deployment workflow screenshot](/images/articles/deploy-cloud/zeabur-deploy.png)

<!-- Image with caption (using HTML figure) -->
<figure>
  <img src="/images/articles/deploy-cloud/zeabur-deploy.png" alt="Zeabur deployment workflow screenshot" />
  <figcaption>Figure: Zeabur deployment workflow — click the Deploy button to begin</figcaption>
</figure>

<!-- Control image size -->
<img src="/images/articles/deploy-cloud/zeabur-logo.png" alt="Zeabur Logo" width="200" />
```

---

## GIF Animations: Step-by-Step Demos

GIFs are perfect for demonstrating "multi-step operations" — readers understand at a glance.

### GIF Recording Tools

| Tool | Platform | Highlights |
|---|---|---|
| **CleanShot X** | macOS | Record + convert to GIF in one flow |
| **Kap** | macOS | Open-source, free, simple to use |
| **LICEcap** | macOS/Win | Ultra-lightweight, records directly to GIF |
| **ScreenToGif** | Windows | Built-in editor |
| **Peek** | Linux | Simple and fast |

### GIF Best Practices

1. **Control duration:** 3-10 seconds is ideal; over 10 seconds, consider using video
2. **Lower frame rate:** 15fps is enough (no need for 30fps)
3. **Compress:** Use [ezgif.com](https://ezgif.com/optimize) to compress
4. **Target file size:** < 2MB (over 5MB loads too slowly)
5. **Add cursor highlighting:** So readers can see where the mouse is

### Markdown Syntax

```markdown
<!-- GIFs use the same img syntax as images -->
![Skill creation steps](/images/articles/skill/skill-create-demo.gif)

<!-- GIF with caption -->
<figure>
  <img src="/images/articles/skill/skill-create-demo.gif" alt="Steps to create your first Skill" />
  <figcaption>Animation: Creating your first Skill takes just 3 steps</figcaption>
</figure>
```

---

## Videos: YouTube / External

Suitable for longer operation demos or concept explanations (> 30 seconds).

### YouTube Embed

```markdown
<!-- Embed YouTube in Markdown using HTML -->
<div class="video-wrapper">
  <iframe 
    src="https://www.youtube.com/embed/VIDEO_ID" 
    title="Video title"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
    allowfullscreen>
  </iframe>
</div>
```

Replace `VIDEO_ID` with the YouTube video ID (the string after `v=` in the URL).

### Local Videos (MP4)

For self-recorded short videos:

```markdown
<video controls width="100%">
  <source src="/videos/articles/skill-demo.mp4" type="video/mp4" />
  Your browser does not support video playback.
</video>
```

> ⚠️ Local video files are not recommended for Git repos (too large). Upload to YouTube or Cloudflare Stream instead.

### Loom Embed

Great for quickly recording demo videos:

```markdown
<div class="video-wrapper">
  <iframe 
    src="https://www.loom.com/embed/VIDEO_ID" 
    title="Operation demo"
    allowfullscreen>
  </iframe>
</div>
```

---

## Efficient Editing Workflow

### Recommended Writing Process

```
1. Write the entire article in plain text first
2. Mark positions that need screenshots (with HTML comments)
3. Record all screenshots and GIFs in one batch
4. Compress all images
5. Place into the appropriate folders and replace placeholders
```

### Quick Screenshot Marking Method

While writing, use HTML comments to mark where screenshots are needed:

```markdown
At this step, you need to click the "Settings" button in the top-right corner.

<!-- 📸 Screenshot: Settings button location, highlight top-right corner -->

Then fill in your API Key on the settings page.

<!-- 📸 Screenshot: API Key input field -->
<!-- 🎬 GIF: Process of filling in the API Key and clicking Save -->
```

After the article structure is finalized, add all screenshots in one batch. This is the most efficient approach.

### Recommended VS Code Extensions

- **Paste Image:** `Ctrl/Cmd + Alt + V` to paste clipboard screenshots directly into Markdown
- **Markdown Preview Enhanced:** Live preview of Markdown with images
- **Image Preview:** Shows a preview when hovering over image paths

---

## Naming Conventions

```
public/images/articles/
└── {article-slug}/
    ├── {step-number}-{description}.png    # Screenshots
    ├── {step-number}-{description}.gif    # GIFs
    └── cover.png                          # Article cover (optional)

Example:
└── deploy-cloud/
    ├── 01-zeabur-signup.png
    ├── 02-create-project.png
    ├── 03-deploy-service.gif
    ├── 04-set-env-vars.png
    └── 05-generate-domain.png
```

Key points:
- Use numeric prefixes to maintain order
- Name in English, kebab-case
- Descriptions should be specific enough

---

## Image Compression Quick Reference

| Type | Target Size | Recommended Tool |
|---|---|---|
| Screenshot PNG | < 300KB | TinyPNG |
| GIF (3-10 sec) | < 2MB | ezgif.com |
| Cover image | < 200KB | Squoosh.app |
| Video thumbnail | < 100KB | TinyPNG |

---

## Summary

| Media Type | Best For | Syntax |
|---|---|---|
| Static screenshot | UI location reference | `![alt](/images/...)` |
| GIF animation | Multi-step operation demo | `![alt](/images/....gif)` |
| YouTube video | Long-form tutorials (>30s) | `<div class="video-wrapper"><iframe>` |
| Local video | Short operation demo | `<video>` |

Remember: **Write all the text first, then add images.** That's the most efficient approach.
