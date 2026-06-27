# STATUS — launchdock

> 單一真相。每次離開前更新（全域憲法收尾鐵律）。
**最後更新：** 2026-06-27
**整體狀態：** 🟢 進行中

## 一句話現況
旗艦教學站（Astro，47 篇文章，71 commits）。「Cloudflare Workers 當 LINE Bot 後端」
文章已於 06-19 提交完成。內容 loop 已導入（BACKLOG.md + 每週一排程監控）。

## 下一個具體動作 ⭐
`ai-agent-browsers`（中英）已 commit（含 concepts 登錄 + registry）。剩一件待你提供素材：
1. 補 2 張截圖（comet-browser、chatgpt-atlas）→ 截圖後跑
   `./scripts/add-image.sh ai-agent-browsers <圖>` → **機敏掃描** → commit。
   （目前 @img 是註解，沒圖也正常顯示，只是少兩張圖。）
之後從 `BACKLOG.md` 挑下一件內容任務。

## 怎麼驗證這一步成功
選定任務做完後 `npm run build` 成功、本地預覽正常、無機敏資訊、commit。

## 卡點 / 待你決定
- 待你提供 Comet、ChatGPT Atlas 兩張截圖以補完 `ai-agent-browsers` 配圖。
- 是否要把 loop 化（見 dev-harness/LAUNCHDOCK-CONTENT-LOOP.md，待建 BACKLOG.md）。

## 進度脈絡（新的在上）
- 2026-06-27 提交「AI 代理瀏覽器：Comet/Atlas/Computer Use」中英文 + 登錄 Computer Use 概念（截圖待補）
- 2026-06-19 導入內容 loop：建 BACKLOG.md、CLAUDE.md 加開場/收尾鐵律、掛每週一排程
- 2026-06-19 提交「Cloudflare Workers 當 LINE Bot 後端」教學文
- 2026-06-05 更新瓶頸段落內容

## 已知坑
- 任何圖片插入後**必須**跑機敏掃描（見 CLAUDE.md 安全規則）。
- sitemap 靠 build 自動產，push 即更新，不要手動改。
