# SEO 基準快照（before）— 2026-07-27

> 目的：SEO 改動（2026-07-23～07-25 上線：Hero 換臉、7+1 篇文章標題/description/FAQ、
> 首頁資料驅動 FAQ+schema）成效的**對照基準**。約 **2 週後（~08-10）**再撈一次 after 比對。
> 資料源：Google Search Console，資源 `sc-domain:launchdock.app`（Joseph 的 GSC 帳號）。

## ⚠️ 判讀前提
- 本快照 GSC 視窗 **2026-04-26 ～ 2026-07-25（近 3 個月）**，**99% 落在改動之前**＝乾淨的 before。
- GSC 資料延遲 ~2–3 天（今天 07-27，最新只到 07-25）。
- 標題/description 改字要看的是**「已有曝光的頁」CTR 上升**（最快，~1–2 週）；FAQ schema ~2–4 週；新關鍵字排名數週～數月。

## 總覽（近 3 個月，2026-04-26～07-25）
| 指標 | 值 | 對比 07-23 你給的近 90 天 |
|---|---|---|
| 總點擊 | **656** | 585 |
| 曝光總數 | **40,100** | 33,100 |
| 平均點閱率 CTR | **1.6%** | 1.8% |
| 平均排序 | **14.1** | 14.2 |
（註：視窗不同+累積，數字上升不等於改版成效；CTR 微降因分母曝光變大。真正要比的是下方「逐查詢 CTR」。）

## 依點擊排序 前 10（今天撈，2026-07-25 為止）
| # | 查詢 | 點擊 | 曝光 |
|---|---|---|---|
| 1 | 藍鴨（品牌） | 15 | 171 |
| 2 | launchdock（品牌） | 14 | 50 |
| 3 | ollama hermes | 8 | 73 |
| 4 | **cli** | 7 | **1,345** |
| 5 | **openrouter** | 5 | **624** |
| 6 | ollama launch hermes error: unknown integration: hermes | 3 | 55 |
| 7 | error: unknown integration: hermes | 3 | 39 |
| 8 | ollama error: unknown integration: hermes | 3 | 20 |
| 9 | hermes ollama | 2 | 19 |
| 10 | caffeinate mac | 2 | 15 |

## 依曝光排序（改動前基準，來源＝Joseph 2026-07-23 貼的近 90 天）
| 查詢 | 點擊 | 曝光 | 對應優化 |
|---|---|---|---|
| cli | 5 | 861 | cli-guide 標題改「CLI 是什麼」 |
| github developer settings | 0 | 444 | github-developer-settings-tokens 標題改「在哪」 |
| cli 是什麼 | 1 | 342 | cli-guide |
| cli是什麼 | 1 | 323 | cli-guide |
| 藍鴨 | 15 | 156 | 品牌 |
| api key | 0 | 154 | ai-api-key-guide 標題加「怎麼申請+免費」 |
| google api key | 0 | 146 | google-api-key-guide 開頭 OAuth vs AIzaSy 分流 |
| ollama launch hermes | 1 | 80 | hermes-agent |
| chain of thought vs tree of thoughts vs react… | 0 | 80 | — |
| ollama hermes | 8 | 65 | hermes-agent |

## 📊 成效計分卡（08-10 回撈時逐列比 CTR）
這些是「Google 已把人帶到門口、但 CTR 近 0」的頁＝改標題最該見效的：
| 優化頁 | 目標查詢 | before 曝光 | before 點擊 | before CTR | after（08-10 填） |
|---|---|---|---|---|---|
| cli-guide | cli / cli是什麼 | ~1,345 / 665 | 7 / ~2 | ~0.5% / ~0.3% | |
| github-developer-settings-tokens | github developer settings | 444 | 0 | 0% | |
| ai-api-key-guide | api key | 154 | 0 | 0% | |
| google-api-key-guide | google api key | 146 | 0 | 0% | |
| hermes-agent | ollama hermes / hermes error 串 | 65+55+39+20 | 8+3+3+3 | 高意圖已在點 | |
| caffeinate-keep-mac-awake | caffeinate mac | 15 | 2 | ~13% | |

## 回撈方法（~2026-08-10，已排程 cloud agent `trig_01S94FvRh8HvBgV7wRfgAeSQ` 產對照草稿）
1. GSC 成效報表，日期選 **「最近 28 天」**（那時 ~7/13–8/10，一半以上是改版後）。
2. 逐查詢比上表 CTR（尤其 cli / github developer settings / api key / google api key 有沒有從 0 開始有點擊）。
3. 首頁 FAQ：查詢裡有沒有出現 FAQ 題目相關詞、或首頁拿到 FAQ 複合式結果版位。
4. 也看「網頁」分頁：改過的那幾個 URL 的曝光/點擊趨勢。

## 🧭 怎麼判讀 after ＝ 有進步，還是該再修正
對照時，每個計分卡的頁落在哪一格，就對應一個下一步：

| after 相對 before | 判讀 | 下一步（再修正的依據） |
|---|---|---|
| **曝光持平、CTR ↑、開始有點擊** | ✅ **改標題/description 有效** | 把同一套「是什麼/怎麼做/在哪」標題公式，套到還沒改的高曝光低點擊頁 |
| **曝光 ↑、CTR 也 ↑** | ✅✅ 標題有效 + 排名也在爬 | 加碼：補內文深度、內鏈，鞏固上升的關鍵字 |
| **曝光 ↑、但 CTR 持平/更低** | ⚠️ 排到了但標題不夠誘人 | **再改一次標題/description 文案**（更痛點、更具體、加數字/免費字樣） |
| **曝光持平、CTR 也持平** | ⚠️ Google 還沒重爬，或改動沒被認可 | 到 GSC「網址審查」對該頁按「要求建立索引」催爬；等下一輪再看 |
| **曝光 ↓** | 🔻 排名掉了（未必和本次改動有關） | 檢查有沒有改壞（標題離題、關鍵字被稀釋）、或只是季節/競爭波動，觀察不急著動 |

FAQ／schema：查詢出現 FAQ 題目相關詞、或首頁拿到 FAQ 複合式結果版位 = FAQ 策略見效，可再擴充 `home-faq.ts`（守 ~10 則上限、汰弱補強）。

> 一句話：**看的是「Google 已把人帶到門口（曝光）」的頁，門有沒有被打開（CTR）。**
> 門開了→複製到更多頁；門沒開但有人到→改門面（文案）；沒人到→催爬或換槓桿（內容/內鏈）。

## 變更清單（本次要驗成效的改動，供歸因）
- Hero 中英換臉（情緒導向、Hermes 排 OpenClaw 前）— `46b66eb`
- 7 篇文章 SEO（標題/description/開頭/FAQ + 錯誤碼文字化）— `2b268d3`
- caffeinate 文章 SEO（第 8 篇）— `b8e56ea`
- 首頁討論區 → 資料驅動 FAQ + FAQPage schema — `bb39e8f` → `89af33d`
- meetup 招牌對齊 — `0978b9f`
