# 下架：AI agent 陪跑營（100 天陪跑營）

**狀態：已下架（2026-11-26）**。網站不再對外提供 `/camp/`、`/en/camp/`，不在 build 產物與 sitemap 內。檔案與程式碼都保留，方便之後恢復。

## 目前留在原處的檔案（不會被 build）
- `src/components/CampPage.astro`：頁面元件（中英共用，依 `lang` 切換）
- `src/data/camp.ts`：課程文字、12 週規劃、狀態（已確認／規劃中）

Astro 只會打包 `src/pages/` 底下的路由，以及被路由 import 的元件。這兩個檔案目前沒有任何路由引用，所以不會出現在 `dist/`。

## 這個資料夾放什麼
- `camp.astro`：原本的中文路由 `src/pages/camp.astro`
- `en-camp.astro`：原本的英文路由 `src/pages/en/camp.astro`

## 怎麼恢復
1. 把路由檔搬回原位：
   ```bash
   mv docs/archive/ai-100day-camp/camp.astro src/pages/camp.astro
   mv docs/archive/ai-100day-camp/en-camp.astro src/pages/en/camp.astro
   ```
2. 如果要把它再放回導覽列或首頁，自己加回連結即可。`src/data/camp.ts` 裡的 `CAMP_PAGE_HREF` 與 `CAMP_PAGE_HREF_EN` 仍指向 `/camp/` 與 `/en/camp/`。
3. `npm run build`，確認 `dist/camp/` 與 `dist/en/camp/` 產生，sitemap 也會自動收錄。
4. 若要回到「陪跑營為頂部橫幅」的版本，把 `src/components/CampTopBar.astro` 的 import 改回 `src/data/camp.ts`（目前已改為 `src/data/gemini-camp.ts`）。
