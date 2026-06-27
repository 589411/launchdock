# STATUS — launchdock

> 單一真相。每次離開前更新（全域憲法收尾鐵律）。
**最後更新：** 2026-06-27
**整體狀態：** 🟢 進行中

## 一句話現況
旗艦教學站（Astro，47 篇文章，71 commits）。「Cloudflare Workers 當 LINE Bot 後端」
文章已於 06-19 提交完成。內容 loop 已導入（BACKLOG.md + 每週一排程監控）。

## 下一個具體動作 ⭐
**AI 能力測驗功能已做完並驗證通過，尚未 commit**（等 Joseph 授權）。
- 新檔：`src/data/quiz.ts`（題庫+策展推薦+計分）、`src/components/CapabilityQuiz.tsx`（雷達圖結果）、
  `src/pages/quiz.astro` + `en/quiz.astro`；改：Header 導覽、ui.ts、文章索引 CTA（中英）。
- 已驗證：production build 109 頁過、`scoreQuiz` 三邊界單元測過、preview 實際作答 → 缺口判定/雷達圖/推薦導流全對。
- 下一步：① 等授權 commit；② 可選優化見 BACKLOG（用途：講座暖場 / 體驗課評估）。

待補（更早任務，需 Joseph 素材）：`ai-agent-browsers` 補 2 張截圖
`./scripts/add-image.sh ai-agent-browsers <圖>` → **機敏掃描** → commit。

## 怎麼驗證這一步成功
選定任務做完後 `npm run build` 成功、本地預覽正常、無機敏資訊、commit。

## 卡點 / 待你決定
- 待你提供 Comet、ChatGPT Atlas 兩張截圖以補完 `ai-agent-browsers` 配圖。
- 是否要把 loop 化（見 dev-harness/LAUNCHDOCK-CONTENT-LOOP.md，待建 BACKLOG.md）。

## 進度脈絡（新的在上）
- 2026-06-27 新增「AI 能力測驗」功能（行為自評→缺口導向→雷達圖→推薦文章，中英），已驗證未 commit
- 2026-06-27 提交「AI 代理瀏覽器：Comet/Atlas/Computer Use」中英文 + 登錄 Computer Use 概念（截圖待補）
- 2026-06-19 導入內容 loop：建 BACKLOG.md、CLAUDE.md 加開場/收尾鐵律、掛每週一排程
- 2026-06-19 提交「Cloudflare Workers 當 LINE Bot 後端」教學文
- 2026-06-05 更新瓶頸段落內容

## 已知坑
- 任何圖片插入後**必須**跑機敏掃描（見 CLAUDE.md 安全規則）。
- sitemap 靠 build 自動產，push 即更新，不要手動改。
- React island 互動驗證要用 `npm run preview`（服務 dist），**不要用 `npm run dev`**：
  dev server 會出 `jsxDEV is not a function` 導致全站 hydration 壞掉（React19+Vite dev-only 問題，
  非程式 bug，連 SearchTrigger/AuthButton 都掛）。preview 用 production React 正常。
