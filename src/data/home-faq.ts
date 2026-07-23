export interface HomeFaqItem {
  q: string;        // 問題
  a: string;        // 答案（純文字，schema 會直接用）
  href?: string;    // 內鏈到對應文章（可選）
  linkText?: string;// 連結文字（可選）
}

// 首頁常見問題（單一來源：畫面 FAQ + FAQ schema 都由此生成）
// ⚠️ 新增規則：新文章「回答高搜尋需求的新手問題」時才加一則；全表控制在 ~10 則內，
//    超過就汰換掉最弱的。一般關鍵字/問答放文章自己的 stuckOptions，不要塞進這裡。
const homeFaq: HomeFaqItem[] = [
  { q: '完全不會寫程式，也能動手做 AI 嗎？', a: '可以。藍鴨所有教學都假設你零基礎——每步有截圖、每個卡點能回報、每個問題有人接。', href: '/articles/cli-guide/', linkText: '從「CLI 是什麼」開始' },
  { q: '我是 Windows，能用 OpenClaw 嗎？', a: '能。裝了 WSL（Windows Subsystem for Linux）就有完整的 Linux 環境，體驗跟 Mac 幾乎一樣。', href: '/articles/windows-wsl-guide/', linkText: 'WSL 安裝教學' },
  { q: 'API Key 是什麼？哪裡拿免費的？', a: 'API Key 是一串像密碼的字串，讓程式用你的帳號呼叫 AI 模型。Google、Anthropic、OpenRouter 都有免費方案、不必綁卡。', href: '/articles/ai-api-key-guide/', linkText: 'API Key 怎麼申請（含免費方案）' },
  { q: '執行 ollama launch hermes 跳出 Error: unknown integration: hermes 怎麼辦？', a: '你的 Ollama 版本太舊——hermes 這個整合要 Ollama 夠新才有。更新 Ollama、完全重開、再跑一次即可。', href: '/articles/hermes-agent/', linkText: 'Hermes Agent 快速上手' },
  { q: '系統提示詞是什麼？', a: '系統提示詞是 AI 的「人設／設定檔」，決定它怎麼回應你——同一個 AI，換一段系統提示詞就像換了個人。', href: '/meetup/', linkText: '7/29 免費工作坊帶你寫一段' },
  { q: 'Mac 跑長任務跑到一半睡著、任務斷掉？', a: '用 macOS 內建的 caffeinate 讓電腦別睡，服務就不會中斷。', href: '/articles/caffeinate-keep-mac-awake/', linkText: 'caffeinate 是什麼' },
  { q: '要花錢嗎？會不會很貴？', a: '入門幾乎零成本：OpenClaw 免費，模型可用 Google／OpenRouter 的免費額度先玩，衝量前記得設花費上限。', href: '/articles/token-economics/', linkText: 'Token 計費怎麼算' },
  { q: '我卡住了、出現看不懂的錯誤怎麼辦？', a: '把「完整的錯誤訊息」原封不動複製下來，到下面的鴨聚或討論區貼給我們——別自己硬扛，貼上紅字最快解。' },
];

export default homeFaq;
