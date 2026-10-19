// 英文版內容（以 id 對應 checkup.ts；沒填的項目會退回中文）
export interface CheckupEn {
  stages?: Record<number, { name: string; blurb: string }>;
  dimensions?: Record<string, { name: string; short: string; intro: string }>;
  questions?: Record<string, { text: string; options: string[] }>;
  /** key = `${dimensionKey}.${stageLevel}` */
  advice?: Record<string, { diagnosis: string; next: string }>;
  warnings?: Record<string, { headline: string; detail: string }>;
}

export const en: CheckupEn = {
  stages: {
    1: {
      name: 'Wait-and-see',
      blurb: 'Not started yet, or only just hearing about it. AI has not touched your day-to-day work.',
    },
    2: {
      name: 'Individual experiments',
      blurb: 'Staff use AI on their own to chat and look things up (people asking AI). The company has no shared agreement or management of it.',
    },
    3: {
      name: 'Process adoption',
      blurb: 'A few recurring tasks are handed to AI to run through, with a clear owner, templates, and someone who checks the results.',
    },
    4: {
      name: 'Institutionalized',
      blurb: 'AI can run on its own, with metrics and rules, and it is built into decisions and daily management.',
    },
  },
  dimensions: {
    strategy: {
      short: 'Strategy',
      name: 'AI direction and strategy',
      intro: 'First, see where the company stands: does leadership agree, is it investing, and can you explain the difference between "people asking AI" and "AI doing the work itself"?',
    },
    data: {
      short: 'Data',
      name: 'Data and reporting automation',
      intro: 'When the owner wants to see the numbers, does someone have to pull them together first, or are they ready to open?',
    },
    process: {
      short: 'Process',
      name: 'Operations pain points and workflows',
      intro: 'Where time and money leak out: work done over and over, work that waits on one person, and skills only senior staff have.',
    },
    decision: {
      short: 'Decisions',
      name: 'Decisions and validating new opportunities',
      intro: 'Turning "I think we should do this" into "I am sure we should do this." Here AI is not the ghostwriter; it is the sparring partner.',
    },
    people: {
      short: 'People',
      name: 'People, tools, and data security',
      intro: 'What staff are using, where the data goes, and which tasks must never be handed to AI.',
    },
  },
  questions: {
    strategy_consensus: {
      text: 'Do the owner and senior managers agree on what the company should use AI for?',
      options: [
        'Never discussed it',
        'Each has ideas, but we have never sat down to talk them through',
        'We have talked it through and have a few directions to try',
        'We have clear goals and a named owner, and we review progress regularly',
      ],
    },
    strategy_budget: {
      text: 'How does the company handle its spending on AI?',
      options: [
        'No spending at all',
        'Staff pay out of their own pocket, or use free versions',
        'The company pays for one or two subscriptions',
        'There is an annual budget, and we check what the spending has delivered',
      ],
    },
    strategy_position: {
      text: 'Can you say which things at the company are "people asking AI" today and which are "AI doing the work itself"?',
      options: [
        'I cannot say',
        'Yes: right now it\'s all people asking AI (chatting, looking things up)',
        'One or two tasks already run through a fixed process where AI does the first pass and a person checks it',
        'Several tasks already start with AI, and we have mapped out what to hand over next',
      ],
    },
    data_report: {
      text: 'How are the company\'s weekly or monthly reports produced?',
      options: [
        'Everything is compiled by hand in Excel',
        'Mostly manual, with occasional help from AI to tidy the data or write formulas',
        'Some reports use templates or tools and are partly automated',
        'Reports update automatically, with no manual work needed',
      ],
    },
    data_view: {
      text: 'When the owner wants to see operating numbers, how do they usually get them?',
      options: [
        'They ask someone and wait until the numbers are compiled',
        'The numbers exist, but they are scattered across different files or systems',
        'There is a fixed summary sheet or dashboard, but someone has to update it',
        'The latest numbers are there whenever I open it, updated automatically',
      ],
    },
    data_external: {
      text: 'How does the company keep track of competitor moves and market news?',
      options: [
        'Nobody is watching it',
        'We read whatever we happen to come across',
        'AI or a tool gathers it regularly, and a person reads the summary',
        'It is gathered and organized automatically, and sent to the right people on a schedule',
      ],
    },
    process_repeat: {
      text: 'Have you listed the repetitive work (quoting, reconciling, replying to emails, record-keeping, and so on)?',
      options: [
        'No',
        'We roughly know, but it is not written down',
        'We have a list, and have tried AI on a few items',
        'We have a prioritized list, and some items are already handed to AI',
      ],
    },
    process_wait: {
      text: 'Some work can only move when a specific person is available (it is stuck on one person or one step). How do you handle this?',
      options: [
        'We are not sure where it gets stuck',
        'We know it happens, but have not changed anything',
        'We found it and started using templates or AI to cut the waiting',
        'We changed it into a process that can run without waiting for a specific person',
      ],
    },
    process_know: {
      text: 'Are the methods that only senior staff know written down?',
      options: [
        'It is all in one person\'s head',
        'Handovers happen occasionally, by word of mouth',
        'Written up as documents or SOPs, but not kept up to date',
        'Someone maintains them, and AI can read them to help new staff when needed',
      ],
    },
    decision_basis: {
      text: 'For major decisions (investments, new products, hiring), what do you usually base them on?',
      options: [
        'The owner\'s gut feeling and experience',
        'Mostly gut feeling, with an occasional look at the data',
        'We gather data and do a simple analysis first',
        'We have fixed criteria and metrics, and we test before deciding',
      ],
    },
    decision_sparring: {
      text: 'When you come up with a new idea, do you let AI act as your sparring partner? (challenging you, poking holes, spotting blind spots, not just writing for you)',
      options: [
        'No',
        'Occasionally, for brainstorming or drafting copy',
        'Yes, I ask it for objections and to find weaknesses',
        'It is a fixed step: every idea is challenged by AI before we discuss it',
      ],
    },
    decision_test: {
      text: 'Before you commit to a new idea (a product or service), how do you test it?',
      options: [
        'We do it as soon as we think of it',
        'We talk it over with a few people',
        'We write a one-page brief and try it on a small scale',
        'We have a fixed, lightweight test, and we scale up only when it meets the target',
      ],
    },
    people_rule: {
      text: 'Does the company have clear rules for staff using AI?',
      options: [
        'No rules, and we are not sure who is using it',
        'A verbal reminder to "be careful"',
        'Written rules that say which data must not be pasted in',
        'Rules, training, and regular checks are all in place',
      ],
    },
    people_tools: {
      text: 'How are the AI tools and accounts that staff use managed?',
      options: [
        'We do not know which tools people use',
        'Everyone uses their own personal account',
        'The company has chosen tools and accounts to standardize on',
        'Accounts and permissions are managed centrally, and access is revoked when someone leaves',
      ],
    },
    people_line: {
      text: 'Has the company drawn a line between work that "can go to AI" and work that always needs a person to check it (for example, replying to customers, quoting, HR decisions)?',
      options: [
        'We have never thought about it',
        'We have a feeling about it, but it is not spelled out',
        'There is a line (for example, customer replies and quotes must always be reviewed by a person)',
        'The line is written as rules and graded by risk',
      ],
    },
  },
  advice: {
    'strategy.1': {
      diagnosis: 'For your company, AI is still "someone else\'s thing." Nobody has yet considered how it relates to your business.',
      next: 'This week, do just one thing: list the three tasks that take the most time, and ask yourself, "If an assistant could do this, what would it be worth?"',
    },
    'strategy.2': {
      diagnosis: 'Staff are each using AI on their own, but the company has no shared goal, so results depend entirely on the individual.',
      next: 'Hold one 30-minute meeting where everyone shares "what I did with AI," then pick one task to turn into a company-wide effort.',
    },
    'strategy.3': {
      diagnosis: 'A few tasks already use AI, but no one is accountable for the results, and there is no yardstick for measuring them.',
      next: 'Name one owner, set a number for the most successful task (time saved, fewer errors), and review it once a month.',
    },
    'strategy.4': {
      diagnosis: 'Your strategy and spending are on track, and the gains keep compounding.',
      next: 'The risk now is complacency. Each quarter, review which parts of the work AI could still take over, and drop the spending that is not paying off.',
    },
    'data.1': {
      diagnosis: 'Numbers are compiled by hand, so the owner has to wait for someone whenever they want to see them.',
      next: 'Pick one report you produce every week, and ask AI to help set up its columns and formulas. That alone saves your first hour.',
    },
    'data.2': {
      diagnosis: 'You sometimes use AI to help tidy the data, but the numbers are still scattered and updates depend on people.',
      next: 'Bring the three numbers you check most often into one summary sheet with fixed columns. This lays the groundwork for automation.',
    },
    'data.3': {
      diagnosis: 'You have a fixed summary sheet or dashboard, but it still needs people to update it.',
      next: 'Find the most time-consuming step in the update and automate it (data import or scheduled cleanup). The goal is no manual updating at all.',
    },
    'data.4': {
      diagnosis: 'Numbers update automatically and are always available. Only a few companies have this foundation.',
      next: 'Move from "looking at the numbers" to "being alerted": set up notifications for anomalies, so the numbers come find people instead of people having to go find the numbers.',
    },
    'process.1': {
      diagnosis: 'Repetitive work has not been made visible yet, so it has not been improved either.',
      next: 'Keep a log for one week. After each task, label it "repetitive," "waiting on someone," or "only one person knows how." At the end of the week, you will have a list.',
    },
    'process.2': {
      diagnosis: 'You know where things are slow, but you are still going on instinct and have not tackled them systematically.',
      next: 'Pick the simplest, most repetitive task from your list, have AI produce a first template for it, and use that template for one week.',
    },
    'process.3': {
      diagnosis: 'Some workflows already get help from AI, but they still rely on a few people to hold them up.',
      next: 'Write these methods up as an SOP and a set of prompt templates so a second person can follow them. That way the workflow is not tied to one individual.',
    },
    'process.4': {
      diagnosis: 'Workflows can run without relying on specific people, and the knowledge is preserved.',
      next: 'Pick your next bottleneck: which step still needs someone watching it? Assess whether AI can chain it automatically, with people responsible only for checking the output.',
    },
    'decision.1': {
      diagnosis: 'Decisions rely mainly on gut feeling, with little in place to test ideas beforehand.',
      next: 'Next time you have a new idea, write down on one page: who it is for, what problem it solves, and how you will know it works. If you cannot write it, do not start it yet.',
    },
    'decision.2': {
      diagnosis: 'You gather data, but your ideas have not yet been seriously challenged.',
      next: 'Give your idea to AI and explicitly ask it to "act as the toughest customer and list five reasons it would fail," then revise your plan.',
    },
    'decision.3': {
      diagnosis: 'Validation has a rough form, but it is not yet reliable and has no fixed process.',
      next: 'Set one standard template: a one-page brief, passing criteria, and a deadline. Every new idea goes through the same process.',
    },
    'decision.4': {
      diagnosis: 'Ideas are challenged first, then validated, so decisions rest on evidence.',
      next: 'Look back: for the ideas you have already validated, how far did the results differ from your predictions at the time? Use the answer to calibrate your judgment criteria.',
    },
    'people.1': {
      diagnosis: 'No rules is the biggest risk: staff may already be pasting customer data into tools the company does not know about.',
      next: 'Do two things today: ask everyone once which tools they are using, and state clearly that customer personal data, contracts, and financial statements may not be pasted into AI.',
    },
    'people.2': {
      diagnosis: 'There are reminders or basic rules, but tools and accounts are still scattered, which makes them hard to manage.',
      next: 'Choose one or two approved tools and accounts for the company, and write up on one page which data can be shared and which cannot.',
    },
    'people.3': {
      diagnosis: 'Rules and tools are in place. The next step is making sure they are actually followed.',
      next: 'Turn the rules into routine: include them in new-hire training, check compliance regularly, and classify data by risk.',
    },
    'people.4': {
      diagnosis: 'Governance is complete, so AI can be expanded with confidence within safe boundaries.',
      next: 'Loosen restrictions responsibly: assess which parts of the workflow AI could take on more of, without adding risk.',
    },
  },
  warnings: {
    shadow_ai: {
      headline: 'People are using AI, but there are no rules',
      detail: 'Other areas already use AI, but "people, tools, and data security" is still at the very beginning. This is the most common risk for small and medium businesses: data may already be leaving the company without you knowing. We recommend fixing this area first.',
    },
    data_no_decision: {
      headline: 'You have the numbers, but they are not yet feeding decisions',
      detail: '"Data and reporting automation" is ahead, but "decisions and validating new opportunities" still runs mostly on gut feeling. Using the numbers to test your ideas is where automated reporting really pays off.',
    },
    say_not_do: {
      headline: 'Lots of talk, little action',
      detail: '"AI direction and strategy" already has ideas, but "operations pain points and workflows" has not gotten moving yet. Pick one of the smallest repetitive tasks and get a first result from it. That is how strategy becomes real.',
    },
    uneven: {
      headline: 'Uneven progress',
      detail: 'The "{hi}" and "{lo}" areas are two or more stages apart. When the gap is that wide, the faster area is often held back by the slower one. Start with "{lo}," and the whole company can move forward together.',
    },
  },
};
