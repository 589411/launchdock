# STATUS — launchdock

> 單一真相。每次離開前更新（全域憲法收尾鐵律）。
**最後更新：** 2026-06-19
**整體狀態：** 🟢 進行中

## 一句話現況
旗艦教學站（Astro，47 篇文章，71 commits）。「Cloudflare Workers 當 LINE Bot 後端」
文章已於 06-19 提交完成。內容 loop 已導入（BACKLOG.md + 每週一排程監控）。

## 下一個具體動作 ⭐
從 `BACKLOG.md` 挑下一件內容任務（每週一排程會自動更新待辦並給 Top 3）。
目前 BACKLOG「來自規劃」區有：為 lab demo 寫對應教學文、盤點需重拍截圖的舊文。

## 怎麼驗證這一步成功
選定任務做完後 `npm run build` 成功、本地預覽正常、無機敏資訊、commit。

## 卡點 / 待你決定
- 這篇英文版要不要同步發布，還是先發中文。
- 是否要把 loop 化（見 dev-harness/LAUNCHDOCK-CONTENT-LOOP.md，待建 BACKLOG.md）。

## 進度脈絡（新的在上）
- 2026-06-19 導入內容 loop：建 BACKLOG.md、CLAUDE.md 加開場/收尾鐵律、掛每週一排程
- 2026-06-19 提交「Cloudflare Workers 當 LINE Bot 後端」教學文
- 2026-06-05 更新瓶頸段落內容

## 已知坑
- 任何圖片插入後**必須**跑機敏掃描（見 CLAUDE.md 安全規則）。
- sitemap 靠 build 自動產，push 即更新，不要手動改。
