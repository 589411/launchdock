# 任務範本:踩坑 → 文章 → 上課講義

> Joseph 把自己踩過的坑轉成 troubleshoot 文,同一篇文自動成為課程講義素材。
> 制度正本:`docs/EDITORIAL.md`(本檔只引用,不複製)。

## 輸入格式

- **症狀**:當時看到什麼(錯誤訊息、卡住的畫面——有截圖最好,記得機敏掃描)
- **根因**:後來發現是什麼
- **解法**:怎麼解的(指令、設定、步驟)
- **模組歸屬**:這個坑屬於哪個課程模組 M01–M13(不確定就對照 `launchdock-lab/data/modules.yaml` 的 goal 判斷)

## 文章結構(contentType: troubleshoot)

1. **症狀**——用讀者會 Google 的字眼寫標題與開頭(搜尋意圖優先)
2. **為什麼會這樣**——根因,配生活化比喻
3. **解法**——編號步驟;真實 UI 截圖用 @img,概念示意用生成 SVG(硬規則 H3)
4. **如何預防**——一條 checklist
5. **鴨編的話**——這個坑的教訓一句話(講課時的口播梗)

## frontmatter 要求

- `modules: [M0x]` **必填**——沒掛 module 的踩坑文進不了講義
- `tags` 含出錯的工具名,方便讀者搜尋

## 講義輸出

```bash
node scripts/generate-handout.mjs M03        # 產出 M03 模組講義(md)
node scripts/generate-handout.mjs M03 --list # 只列文章清單
```

講義 = 該 module 全部文章按 order 排序:標題 + 一句話摘要 + 文章 QR 連結 + 踩坑文的「如何預防」checklist 彙整。
上課前跑一次即可,不要手工維護講義副本(單一來源:文章本身)。

## 完成定義

同 `observation-to-article.md` 步驟 5–6(機械檢查 + 回報 + Joseph gate),外加:
`node scripts/generate-handout.mjs <module>` 能列出這篇新文,證明講義線接通。
