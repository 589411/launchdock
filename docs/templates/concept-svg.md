# 範本:概念圖 SVG 生成

> 硬規則 H3(EDITORIAL.md):概念圖/示意圖/流程圖一律 AI 生成 SVG,不留人工截圖債。
> 本檔是生成時的固定 prompt 範本,可直接丟給 subagent 平行處理多張。

## 觸發時機

文章中的 @img 標記若描述的是「對比圖、流程圖、架構示意、路線圖、評估表」——即**不是真實軟體 UI 畫面**——就用本範本生成,並直接把標記替換成圖片引用。

## 固定 Prompt(【】內代入)

```
為 launchdock.app 的文章生成一張概念圖 SVG。

主題:【@img 標記的 alt 文字】
文章脈絡:【貼上該標記前後各兩段的內文,SVG 內容必須與內文一致,不可自行發明分類或數據】

規格(不可違反):
- 純 SVG,viewBox="0 0 800 <依內容 450–600>",無外部字體、無 script、無 bitmap
- 自帶淺色底卡:背景 #f8fafc、圓角 12、邊框 #d0d7de(網站有深淺兩色主題,圖要自帶底色才兩邊都清楚)
- 主色 #0f3460、輔色 #1976d2、成功 #2e7d32、警示 #d32f2f;文字主色 #24292f
- 文字一律繁體中文,font-family="system-ui, -apple-system, 'Noto Sans TC', sans-serif"
- 最小字級 13px;標題 20–24px bold
- 左下或右下角落款:fill #8b949e、12px、文字「launchdock.app」
- 資訊密度:一張圖講一件事,元素 ≤ 9 個;塞不下就建議拆兩張,不要縮字

存檔:public/images/articles/【slug】/【檔名】.svg
替換文章標記:把 <!-- @img: 檔名 | alt --> 該行改成 ![alt](/images/articles/【slug】/【檔名】.svg)
(中英兩版文章都要替換;英文版 alt 用英文,圖檔共用。)

自我檢查:xmllint --noout 過、瀏覽器可渲染、文字無溢出邊界、內容對照內文無捏造。
```

## 驗收

- SVG 通過 xmllint、中英文章標記都已替換、`npm run build` 過。
- 圖的內容和文章敘述一致(數據、分類名稱逐字對照)。
