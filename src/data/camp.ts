/** Headlines only: change these two if Joseph picks 「新年新希望」. */
export const CAMP_HOOK_TITLE_ZH = '新年新禮物，2027 年 1 月開跑';
export const CAMP_HOOK_TITLE_EN = 'A New Year gift — we start in January 2027';

export const CAMP_NAV_LABEL_ZH = '藍鴨陪跑營';
export const CAMP_NAV_LABEL_EN = 'Blue Duck Coaching Camp';

export const CAMP_PAGE_HREF = '/camp/';
export const CAMP_PAGE_HREF_EN = '/en/camp/';

export type CampWeekStatus = 'confirmed' | 'draft';
export type CampWeekPhase = 'prep' | 'week';

export interface CampWeek {
  week: number;
  phase: CampWeekPhase;
  status: CampWeekStatus;
  title: string;
  body: string;
}

/**
 * Week 0 is pre-camp prep (confirmed). The 12-week plan is Week 1–12.
 * Week 1–2 are confirmed with 藍鴨課程助理. Week 3–12 are drafts
 * rewritten around building a personal AI assistant / agent (Joseph 2026-11-24).
 */
export const CAMP_WEEKS_ZH: CampWeek[] = [
  {
    week: 0,
    phase: 'prep',
    status: 'confirmed',
    title: '寫出屬於自己的 system prompt',
    body: '先分析自己過去的 AI 對話，找出使用模式，寫出屬於自己的 system prompt。',
  },
  {
    week: 1,
    phase: 'week',
    status: 'confirmed',
    title: '讓 AI 讀信箱、日曆和雲端硬碟',
    body: '讓 AI 用唯讀方式讀 Gmail、日曆、雲端硬碟，把待回信、行程衝突、檔案數字整理成一份一週簡報。',
  },
  {
    week: 2,
    phase: 'week',
    status: 'confirmed',
    title: '接上 Notion，建立「我的 100 天」任務板',
    body: '接上 Notion，建立自己的「我的 100 天」任務板，請 AI 寫週回顧、幫忙排優先順序。',
  },
  {
    week: 3,
    phase: 'week',
    status: 'draft',
    title: '搞懂什麼是 Agent，定下助理的角色與規則',
    body: '寫出助理的角色、權限邊界，以及「什麼情況必須停下來問你」的規則，並說明它如何靠模型、工具、記憶和指令循環運作。這不是再寫一句提示詞，而是一份可執行的規則。',
  },
  {
    week: 4,
    phase: 'week',
    status: 'draft',
    title: '給助理加上權限與安全關卡',
    body: '為助理設好分級權限（例如預設唯讀、先存草稿、需你確認才能送出或修改），並用一件真實工作跑通「起草 → 你確認 → 才可執行」。',
  },
  {
    week: 5,
    phase: 'week',
    status: 'draft',
    title: '把反覆在做的做法，封裝成可重用的 Skill',
    body: '做成至少一個可重用的 Skill，寫清適用時機、步驟和驗收標準，換一個新對話也能照著跑完同一件事。',
  },
  {
    week: 6,
    phase: 'week',
    status: 'draft',
    title: '為助理建立可查詢的記憶與知識庫',
    body: '整理一份工作知識庫（規則、常見做法、不可做的事），並驗證助理會先查庫再行動，而不是只靠當下對話裡的印象。',
  },
  {
    week: 7,
    phase: 'week',
    status: 'draft',
    title: '再接工作工具，並寫清每條連接的權限',
    body: '在信件和任務板之外，再為助理接上至少一種你工作上會用到的工具或資料來源，並寫明每條連接能讀什麼、不能擅自寫什麼。可用各家連接器或 MCP，不限定單一廠商。',
  },
  {
    week: 8,
    phase: 'week',
    status: 'draft',
    title: '把多個步驟串成一條工作流，並處理中途出錯',
    body: '設計並跑通一條至少三步的工作流，寫明某一步失敗時要怎麼停、怎麼回報、怎麼重試，不能只靠當場再下一個指令。',
  },
  {
    week: 9,
    phase: 'week',
    status: 'draft',
    title: '讓工作流自己啟動：定時或事件觸發',
    body: '建好一條會自動啟動的流程（例如每週固定時間整理待辦，或符合條件的新信件先起草草稿等你確認；可用排程或自動化工具，不限定廠商），並實際跑過至少一次，留下觸發紀錄與結果。',
  },
  {
    week: 10,
    phase: 'week',
    status: 'draft',
    title: '讓兩個以上的助理分工，再把結果交回給你',
    body: '設定至少兩個職責清楚的助理（例如一個只負責蒐集整理，一個只負責起草），並跑通一次「分工 → 交接 → 匯總 → 你確認」的流程。',
  },
  {
    week: 11,
    phase: 'week',
    status: 'draft',
    title: '用真實例子評估助理可不可靠、成本高不高',
    body: '用一組真實工作例子測試助理，記錄成功、失敗、需要你介入的次數和大概花費，並據此改一輪規則或流程。',
  },
  {
    week: 12,
    phase: 'week',
    status: 'draft',
    title: '結業：展示自己的個人 AI 助理在真實工作中跑起來',
    body: '用一件真實工作，完整展示助理從接到任務、使用工具與記憶、經過你的確認關卡，到交出結果的過程。',
  },
];

export const CAMP_WEEKS_EN: CampWeek[] = [
  {
    week: 0,
    phase: 'prep',
    status: 'confirmed',
    title: 'Write a system prompt that is yours',
    body: 'Review your past AI conversations, find your own usage patterns, and write a system prompt that is yours.',
  },
  {
    week: 1,
    phase: 'week',
    status: 'confirmed',
    title: 'Let your AI read mail, calendar, and Drive',
    body: 'Let your AI read Gmail, Calendar, and Drive in read-only mode, and turn unreplied mail, schedule conflicts, and file figures into a weekly briefing.',
  },
  {
    week: 2,
    phase: 'week',
    status: 'confirmed',
    title: 'Connect Notion and build a “My 100 Days” board',
    body: 'Connect Notion, build your own “My 100 Days” task board, and have the AI write a weekly review and help you set priorities.',
  },
  {
    week: 3,
    phase: 'week',
    status: 'draft',
    title: 'Understand what an agent is, and set the assistant’s role and rules',
    body: 'Write the assistant’s role, its limits, and the cases where it must stop and ask you. Also explain how it works as a loop of model, tools, memory, and instructions. This is an executable rule set, not another one-line prompt.',
  },
  {
    week: 4,
    phase: 'week',
    status: 'draft',
    title: 'Add permissions and safety gates',
    body: 'Set graded permissions for the assistant (for example, read-only by default, save a draft first, and only act after you approve). Then run one real work task through “draft → your review → then execute”.',
  },
  {
    week: 5,
    phase: 'week',
    status: 'draft',
    title: 'Turn a method you keep repeating into a reusable Skill',
    body: 'Package at least one reusable Skill, with when to use it, the steps, and a checklist. A new conversation should be able to run the same task by following it.',
  },
  {
    week: 6,
    phase: 'week',
    status: 'draft',
    title: 'Give the assistant a searchable memory and knowledge base',
    body: 'Build a work knowledge base of rules, usual practices, and things it must not do, and verify that the assistant checks the base before acting, instead of relying only on the current chat.',
  },
  {
    week: 7,
    phase: 'week',
    status: 'draft',
    title: 'Connect more work tools, and write down what each one may do',
    body: 'Beyond mail and the task board, connect at least one more tool or data source you actually use at work, and write down what each connection may read and must not change on its own. Use any vendor’s connectors or MCP; do not lock to one product.',
  },
  {
    week: 8,
    phase: 'week',
    status: 'draft',
    title: 'Chain several steps into one workflow, and handle failures along the way',
    body: 'Design and run a workflow of at least three steps, and write what to do when a step fails: when to stop, how to report it, and how to retry. It should not depend on you typing a new instruction on the spot.',
  },
  {
    week: 9,
    phase: 'week',
    status: 'draft',
    title: 'Let a workflow start itself: schedules or events',
    body: 'Build one flow that starts on its own (for example, a weekly review of open tasks, or a draft prepared when a matching email arrives, waiting for your approval). Use a scheduler or an automation tool; the vendor is up to you. Run it at least once and keep the trigger log and the result.',
  },
  {
    week: 10,
    phase: 'week',
    status: 'draft',
    title: 'Split the work across two or more assistants, then hand it back to you',
    body: 'Set up at least two assistants with clear jobs (for example, one only gathers and organizes, another only drafts), and run a full pass of “split the work → hand off → combine → your review”.',
  },
  {
    week: 11,
    phase: 'week',
    status: 'draft',
    title: 'Evaluate the assistant with real examples: is it reliable, and what does it cost?',
    body: 'Test the assistant against a set of real work examples. Record successes, failures, how often you had to step in, and the approximate cost, then revise the rules or the workflow once from those results.',
  },
  {
    week: 12,
    phase: 'week',
    status: 'draft',
    title: 'Graduation: show your personal AI assistant running on real work',
    body: 'Take one real work task and show the full path: the assistant receiving the job, using tools and memory, passing your approval gates, and delivering the result.',
  },
];
