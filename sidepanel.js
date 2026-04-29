// BYOK (Bring Your Own Key) - API Key fetched from storage dynamically

// ========================
// DOM 元素
// ========================
const selectedTextDiv = document.getElementById('selectedText');
const loadingDiv = document.getElementById('loading');
const loadingQuote = document.getElementById('loadingQuote');
const errorDiv = document.getElementById('error');
const quizDiv = document.getElementById('quiz');
const streakBadge = document.getElementById('streakBadge');
const selectionModeBtn = document.getElementById('selectionModeBtn');
const fullPageModeBtn = document.getElementById('fullPageModeBtn');
const modeHelp = document.getElementById('modeHelp');
const mainView = document.getElementById('mainView');
const mistakeView = document.getElementById('mistakeView');
const mistakeList = document.getElementById('mistakeList');
const copyMistakesBtn = document.getElementById('copyMistakes');
const copyAnkiCsvBtn = document.getElementById('copyAnkiCsv');
const exportMistakesBtn = document.getElementById('exportMistakes');
const exportStatus = document.getElementById('exportStatus');
const profileSummary = document.getElementById('profileSummary');
const diagnosisDiv = document.getElementById('diagnosis');
const quizStrategyDiv = document.getElementById('quizStrategy');
const Learning = globalThis.FocusQuizLearning;
const SidepanelLogic = globalThis.FocusQuizSidepanelLogic;

let currentLearningProfile = null;
let currentQuizSession = null;
let lastQuizRequest = null;
let hintVisible = true;

// ========================
// Inquisitor 审问语录池 (Product Taste: Loading State)
// ========================
const INQUISITOR_QUOTES = [
  '正在寻找你认知中最脆弱的环节…',
  '准备粉碎你的舒适区…',
  '正在构建逻辑陷阱，请做好准备…',
  '扫描文本中的因果链漏洞…',
  '正在设计反事实推演场景…',
  '寻找你最可能"望文生义"的地方…',
  '准备将这段知识迁移到你想不到的领域…',
  '正在校验你的第一性原理是否站得住脚…',
];
let quoteInterval = null;

function startLoadingQuotes() {
  loadingQuote.textContent = INQUISITOR_QUOTES[Math.floor(Math.random() * INQUISITOR_QUOTES.length)];
  quoteInterval = setInterval(() => {
    loadingQuote.style.opacity = '0';
    setTimeout(() => {
      loadingQuote.textContent = INQUISITOR_QUOTES[Math.floor(Math.random() * INQUISITOR_QUOTES.length)];
      loadingQuote.style.opacity = '1';
    }, 300);
  }, 3000);
}

function stopLoadingQuotes() {
  if (quoteInterval) {
    clearInterval(quoteInterval);
    quoteInterval = null;
  }
}

// ========================
// Streak 连续天数系统 (Behavioral Design: Loss Aversion)
// ========================
async function loadStreak() {
  const result = await chrome.storage.local.get(['lastQuizDate', 'streakCount']);
  const streak = result.streakCount || 0;
  renderStreak(streak);
}

async function loadHintPreference() {
  const result = await chrome.storage.local.get(['hintVisible']);
  hintVisible = result.hintVisible !== false;
  applyHintVisibility();
}

async function setHintVisible(nextVisible) {
  hintVisible = Boolean(nextVisible);
  await chrome.storage.local.set({ hintVisible });
  applyHintVisibility();
}

function applyHintVisibility(scope = document) {
  scope.querySelectorAll?.('.hint').forEach((hint) => {
    hint.classList.toggle('hidden-hint', !hintVisible);
    const toggle = hint.querySelector('.hint-toggle');
    if (toggle) toggle.textContent = hintVisible ? '隐藏' : '显示';
  });
}

function setActiveMode(mode) {
  selectionModeBtn?.classList.toggle('active', mode === 'selection');
  fullPageModeBtn?.classList.toggle('active', mode === 'fullpage');
}

function showModeHelp(message) {
  if (!modeHelp) return;
  modeHelp.textContent = message;
  modeHelp.classList.remove('hidden');
}

async function startFullPageFromSidePanel() {
  setActiveMode('fullpage');
  showModeHelp('正在尝试抓取当前网页正文。若抓取失败，可以改用选区模式选中核心段落。');
  errorDiv.classList.add('hidden');
  try {
    const response = await chrome.runtime.sendMessage({ type: 'focusQuiz.startFullPage' });
    if (response && response.ok === false) {
      showError(response.error || '全文模式启动失败。请切回文章页后再试。');
    }
  } catch (err) {
    showError(`全文模式启动失败：${getErrorMessage(err)}`);
  }
}

function renderStreak(count) {
  if (count > 0) {
    streakBadge.textContent = `Day ${count}`;
    streakBadge.classList.remove('cold');
  } else {
    streakBadge.textContent = 'Day 0';
    streakBadge.classList.add('cold');
  }
}

async function updateStreak() {
  const result = await chrome.storage.local.get(['lastQuizDate', 'streakCount']);
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const lastDate = result.lastQuizDate;
  let streak = result.streakCount || 0;

  if (lastDate === today) {
    // 今天已经做过了，不重复计
    return;
  }

  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (lastDate === yesterday) {
    streak += 1; // 连续！
  } else {
    streak = 1; // 断了或首次
  }

  await chrome.storage.local.set({ lastQuizDate: today, streakCount: streak });
  renderStreak(streak);
}

// ========================
// 错题本系统 (Behavioral Design: Loss Aversion + Growth Loop)
// ========================
async function saveMistake(question, userChoiceIdx, correctIdx, explanation, options, evidenceQuote = '', sourceHint = '', evidenceLocator = '') {
  const result = await chrome.storage.local.get(['mistakeLog']);
  const log = result.mistakeLog || [];
  log.unshift({
    question: question,
    userChoice: options[userChoiceIdx],
    correctAnswer: options[correctIdx],
    explanation: explanation,
    evidenceQuote,
    sourceHint,
    evidenceLocator,
    timestamp: Date.now(),
    sourceUrl: currentQuizSession?.source?.url || '',
    sourceTitle: currentQuizSession?.source?.title || ''
  });
  // 最多保留 50 条
  if (log.length > 50) log.length = 50;
  await chrome.storage.local.set({ mistakeLog: log });
}

// ========================
// 个性化认知画像
// ========================
async function loadLearningProfile() {
  if (!Learning) return;
  const state = await Learning.loadLearningState();
  currentLearningProfile = state.profile;
  renderLearningProfile(currentLearningProfile);
}

function renderLearningProfile(profile) {
  if (!profileSummary || !Learning) return;
  profileSummary.replaceChildren();

  const top = document.createElement('div');
  top.className = 'profile-top';

  const title = document.createElement('div');
  title.className = 'profile-title';
  title.textContent = '认知画像';
  top.appendChild(title);

  const meta = document.createElement('div');
  meta.className = 'profile-meta';
  meta.textContent = profile?.overall === null || profile?.overall === undefined
    ? '冷启动'
    : `综合 ${profile.overall}`;
  top.appendChild(meta);
  profileSummary.appendChild(top);

  const bars = document.createElement('div');
  bars.className = 'profile-bars';
  Object.values(profile?.dimensions || {}).forEach((dimension) => {
    const row = document.createElement('div');
    row.className = 'profile-row';

    const label = document.createElement('span');
    label.textContent = dimension.label;
    row.appendChild(label);

    const track = document.createElement('div');
    track.className = 'profile-track';
    const fill = document.createElement('div');
    fill.className = 'profile-fill';
    fill.style.width = `${Number.isFinite(dimension.score) ? dimension.score : 0}%`;
    track.appendChild(fill);
    row.appendChild(track);

    const score = document.createElement('span');
    score.textContent = Number.isFinite(dimension.score) ? String(dimension.score) : '--';
    row.appendChild(score);

    bars.appendChild(row);
  });
  profileSummary.appendChild(bars);

  const summary = document.createElement('div');
  summary.className = 'profile-summary';
  summary.textContent = profile?.summary || '样本不足。先完成几轮测试，系统会开始判断你的理解结构。';
  profileSummary.appendChild(summary);
}

function createQuizSession(text, questions, sourceMeta, providerMeta, strategy = {}) {
  return {
    sessionId: `fq_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    startedAt: Date.now(),
    strategy,
    source: {
      mode: sourceMeta?.mode || 'selection',
      url: sourceMeta?.url || '',
      title: sourceMeta?.title || '',
      textLength: text.length,
      textHash: Learning ? Learning.hashText(text) : ''
    },
    provider: providerMeta || {},
    answers: [],
    questions: questions.map((q, idx) => ({
      index: idx,
      type: q.type,
      answerMode: q.answerMode || 'multiple_choice',
      startedAt: Date.now(),
      completed: false
    }))
  };
}

function renderSessionDiagnosis() {
  if (!diagnosisDiv || !Learning || !currentQuizSession) return;
  const totalQuestions = currentQuizSession.questions.length;
  const completedQuestions = currentQuizSession.questions.filter((question) => question.completed).length;
  if (completedQuestions < totalQuestions) return;

  const scoredAnswers = currentQuizSession.answers.filter((answer) => answer.isScored !== false);
  if (scoredAnswers.length === 0) {
    diagnosisDiv.replaceChildren();
    const title = document.createElement('div');
    title.className = 'diagnosis-title';
    title.textContent = '本轮诊断：开放自检完成';
    diagnosisDiv.appendChild(title);
    const body = document.createElement('div');
    body.className = 'diagnosis-body';
    body.textContent = '这轮只做开放题自检，不计入正确率画像。请对照参考答案和 Evidence 回到原文校正。';
    diagnosisDiv.appendChild(body);
    diagnosisDiv.classList.remove('hidden');
    return;
  }

  const diagnosis = Learning.diagnoseSession(scoredAnswers, currentLearningProfile, currentQuizSession.strategy);
  diagnosisDiv.replaceChildren();

  const title = document.createElement('div');
  title.className = 'diagnosis-title';
  title.textContent = `本轮诊断：${diagnosis.status}`;
  diagnosisDiv.appendChild(title);

  const body = document.createElement('div');
  body.className = 'diagnosis-body';
  body.append(
    `答对 ${diagnosis.correct}/${diagnosis.total}。`,
    document.createElement('br'),
    diagnosis.detail,
    document.createElement('br'),
    diagnosis.recommendation
  );
  diagnosisDiv.appendChild(body);
  diagnosisDiv.classList.remove('hidden');
}

async function getProviderMeta() {
  const result = await chrome.storage.local.get(['activeProvider', 'providerConfigs']);
  const provider = result.activeProvider || 'gemini';
  return {
    provider,
    model: result.providerConfigs?.[provider]?.model || ''
  };
}

async function renderMistakeLog() {
  const result = await chrome.storage.local.get(['mistakeLog']);
  const log = result.mistakeLog || [];
  mistakeList.replaceChildren();
  if (exportStatus) exportStatus.textContent = '';
  if (copyMistakesBtn) copyMistakesBtn.disabled = log.length === 0;
  if (copyAnkiCsvBtn) copyAnkiCsvBtn.disabled = log.length === 0;
  if (exportMistakesBtn) exportMistakesBtn.disabled = log.length === 0;

  if (log.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.append('暂无错题记录。', document.createElement('br'), '去做几道题，有意识地犯点错吧。');
    mistakeList.appendChild(empty);
    return;
  }

  log.forEach((item) => {
    const div = document.createElement('div');
    div.className = 'mistake-item';

    const meta = document.createElement('div');
    meta.className = 'mistake-meta';
    meta.textContent = new Date(item.timestamp).toLocaleString('zh-CN');
    div.appendChild(meta);

    if (item.sourceUrl) {
      const source = document.createElement('div');
      source.className = 'mistake-source';
      const link = document.createElement('a');
      link.href = item.sourceUrl;
      link.target = '_blank';
      link.rel = 'noreferrer';
      link.textContent = item.sourceTitle ? `回到原文：${item.sourceTitle}` : '回到原文';
      source.appendChild(link);
      div.appendChild(source);
    }

    const q = document.createElement('div');
    q.className = 'q-text';
    q.textContent = item.question;
    div.appendChild(q);

    const yourAns = document.createElement('div');
    yourAns.className = 'mistake-your-answer';
    yourAns.textContent = `你的选择: ${item.userChoice}`;
    div.appendChild(yourAns);

    const correctAns = document.createElement('div');
    correctAns.className = 'mistake-correct-answer';
    correctAns.textContent = `正确答案: ${item.correctAnswer}`;
    div.appendChild(correctAns);

    const evidenceText = item.evidenceQuote || item.sourceHint;
    if (evidenceText) {
      const evidence = document.createElement('div');
      evidence.className = 'mistake-evidence';
      const locator = item.evidenceLocator ? `（${item.evidenceLocator}）` : '';
      evidence.textContent = `证据片段${locator}: ${evidenceText}`;
      div.appendChild(evidence);
    }

    const exp = document.createElement('div');
    exp.className = 'mistake-explain';
    exp.textContent = `思维断裂点: ${item.explanation}`;
    div.appendChild(exp);

    mistakeList.appendChild(div);
  });
}

// ========================
// 分享功能 (Growth Loop: 自然分享时刻)
// ========================
function shareQuestion(questionText, explanation) {
  const shareText = `【Focus Quiz · 认知压力测试】\n\n题目: ${questionText}\n\n⚠️ 思维断裂点: ${explanation}\n\n你能答对吗？`;

  navigator.clipboard.writeText(shareText).then(() => {
    // 找到刚点击的按钮并更新状态
    const btns = document.querySelectorAll('.share-btn');
    btns.forEach(btn => {
      if (btn.dataset.question === questionText) {
        btn.textContent = '已复制';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.textContent = '分享这道题';
          btn.classList.remove('copied');
        }, 2000);
      }
    });
  });
}

function cleanMarkdown(value) {
  return SidepanelLogic?.cleanText
    ? SidepanelLogic.cleanText(value)
    : String(value || '').replace(/\r?\n/g, ' ').replace(/\s+/g, ' ').trim();
}

function formatMistakesAsMarkdown(log) {
  const exportedAt = new Date().toLocaleString('zh-CN');
  const lines = [
    '# Focus Quiz 错题导出',
    '',
    `导出时间：${exportedAt}`,
    ''
  ];

  log.forEach((item, idx) => {
    const sourceTitle = cleanMarkdown(item.sourceTitle || '原文');
    const sourceUrl = cleanMarkdown(item.sourceUrl);
    const evidence = cleanMarkdown(item.evidenceQuote || item.sourceHint);
    const locator = cleanMarkdown(item.evidenceLocator);

    lines.push(`## ${idx + 1}. ${cleanMarkdown(item.question)}`);
    lines.push('');
    lines.push(`- 时间：${new Date(item.timestamp).toLocaleString('zh-CN')}`);
    if (sourceUrl) lines.push(`- 原文：[${sourceTitle}](${sourceUrl})`);
    lines.push(`- 我的选择：${cleanMarkdown(item.userChoice)}`);
    lines.push(`- 正确答案：${cleanMarkdown(item.correctAnswer)}`);
    lines.push(`- 思维断裂点：${cleanMarkdown(item.explanation)}`);
    if (evidence) {
      lines.push('');
      lines.push('> 证据片段' + (locator ? `（${locator}）` : '') + '：' + evidence);
    }
    lines.push('');
  });

  return lines.join('\n');
}

function formatMistakesAsAnkiCsv(log) {
  if (SidepanelLogic?.formatMistakesAsAnkiCsv) {
    return SidepanelLogic.formatMistakesAsAnkiCsv(log);
  }
  return 'Front,Back,Source,Evidence,Tags';
}

function formatExportFileStamp(date = new Date()) {
  const pad = (value) => String(value).padStart(2, '0');
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate())
  ].join('') + '-' + [
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds())
  ].join('');
}

function getMistakeExportFilename() {
  return `focus-quiz-mistakes-${formatExportFileStamp()}.md`;
}

async function getMistakeMarkdown() {
  const result = await chrome.storage.local.get(['mistakeLog']);
  const log = Array.isArray(result.mistakeLog) ? result.mistakeLog : [];
  if (!log.length) {
    if (exportStatus) exportStatus.textContent = '暂无错题可导出。';
    return null;
  }

  return {
    markdown: formatMistakesAsMarkdown(log),
    count: log.length
  };
}

async function copyMistakesAsMarkdown() {
  const exportData = await getMistakeMarkdown();
  if (!exportData) return;

  try {
    await navigator.clipboard.writeText(exportData.markdown);
    if (exportStatus) exportStatus.textContent = `已复制 ${exportData.count} 条错题为 Markdown。`;
  } catch (err) {
    if (exportStatus) exportStatus.textContent = `复制失败：${getErrorMessage(err)}`;
  }
}

async function copyMistakesAsAnkiCsv() {
  const result = await chrome.storage.local.get(['mistakeLog']);
  const log = Array.isArray(result.mistakeLog) ? result.mistakeLog : [];
  if (!log.length) {
    if (exportStatus) exportStatus.textContent = '暂无错题可导出。';
    return;
  }

  try {
    await navigator.clipboard.writeText(formatMistakesAsAnkiCsv(log));
    if (exportStatus) exportStatus.textContent = `已复制 ${log.length} 条错题为 Anki CSV。`;
  } catch (err) {
    if (exportStatus) exportStatus.textContent = `复制失败：${getErrorMessage(err)}`;
  }
}

async function saveMarkdownFile(markdown, filename) {
  if (typeof window.showSaveFilePicker === 'function') {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: filename,
        types: [{
          description: 'Markdown',
          accept: { 'text/markdown': ['.md'] }
        }]
      });
      const writable = await handle.createWritable();
      await writable.write(markdown);
      await writable.close();
      return 'picker';
    } catch (err) {
      if (err?.name === 'AbortError') throw err;
    }
  }

  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.rel = 'noreferrer';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return 'download';
}

async function exportMistakesAsMarkdownFile() {
  const exportData = await getMistakeMarkdown();
  if (!exportData) return;

  const filename = getMistakeExportFilename();
  try {
    await saveMarkdownFile(exportData.markdown, filename);
    if (exportStatus) exportStatus.textContent = `已导出 ${exportData.count} 条错题：${filename}`;
  } catch (err) {
    if (err?.name === 'AbortError') {
      if (exportStatus) exportStatus.textContent = '已取消保存。';
      return;
    }
    if (exportStatus) exportStatus.textContent = `保存失败：${getErrorMessage(err)}`;
  }
}

// ========================
// 检查待处理文本
// ========================
async function checkForText() {
  const result = await chrome.storage.local.get(['selectedText', 'timestamp', 'sourceMode', 'sourceUrl', 'sourceTitle', 'extractionError']);

  if (result.extractionError && result.timestamp && Date.now() - result.timestamp < 300000) {
    showError(result.extractionError);
    chrome.storage.local.remove(['extractionError', 'timestamp']);
    return;
  }

  if (result.selectedText && result.timestamp) {
    if (Date.now() - result.timestamp < 300000) {
      const mode = result.sourceMode || 'selection';
      const label = mode === 'fullpage' ? '全文模式' : '选区模式';
      const title = result.sourceTitle ? ` · ${result.sourceTitle}` : '';
      setActiveMode(mode);
      if (modeHelp) modeHelp.classList.add('hidden');
      selectedTextDiv.replaceChildren();
      const sourceLabel = document.createElement('div');
      sourceLabel.className = 'source-label';
      sourceLabel.textContent = `${label}${title}`;
      selectedTextDiv.appendChild(sourceLabel);
      selectedTextDiv.append(
        `"${result.selectedText.substring(0, 180)}${result.selectedText.length > 180 ? '...' : ''}"`
      );
      selectedTextDiv.classList.remove('hidden');

      generateQuiz(result.selectedText, {
        mode: result.sourceMode || 'selection',
        url: result.sourceUrl || '',
        title: result.sourceTitle || ''
      });

      chrome.storage.local.remove(['selectedText', 'timestamp', 'sourceMode', 'sourceUrl', 'sourceTitle']);
    }
  }
}

// ========================
// 生成 Quiz
// ========================
async function generateQuiz(text, sourceMeta = {}) {
  lastQuizRequest = { text, sourceMeta };
  loadingDiv.classList.remove('hidden');
  errorDiv.classList.add('hidden');
  diagnosisDiv.classList.add('hidden');
  quizStrategyDiv?.classList.add('hidden');
  quizStrategyDiv?.replaceChildren();
  quizDiv.replaceChildren();
  startLoadingQuotes();
  await loadLearningProfile();
  const adaptivePrompt = Learning ? Learning.adaptivePrompt(currentLearningProfile) : '';

  const prompt = `# Role
你是我极其严苛、极度注重逻辑闭环的学术导师（The Inquisitor）。你的目标不是让我"记住"文本，而是要**粉碎**我脑中那些似是而非的认知，直到我能通过第一性原理重构知识。

# Goal
对我提供的文本进行"深度压力测试"。不要做总结，不要做复述。直接发起攻击。

# Output Format
严格返回以下 JSON 格式，不要有任何其他内容：
{
  "strategy": {
    "questionCount": 3,
    "articleType": "conceptual_argument",
    "focus": ["trap", "counterfactual", "transfer"],
    "reason": "为什么本轮选择这个题量和题型组合"
  },
  "questions": [
    {
      "type": "trap",
      "answerMode": "multiple_choice",
      "question": "Q1 [概念陷阱题]: 题目内容",
      "options": ["选项A", "选项B", "选项C", "选项D"],
      "correct": 0,
      "explanation": "指出错误选项的思维陷阱：是因果倒置？偷换概念？还是忽略了前提？",
      "sourceHint": "作答前可显示的弱提示，不能泄露答案，只提示需要回忆哪类关系",
      "evidenceQuote": "作答后才显示的原文证据短句",
      "evidenceLocator": "证据在原文中的粗略位置，例如第几段或小标题"
    },
    {
      "type": "counterfactual",
      "answerMode": "multiple_choice",
      "question": "Q2 [反事实推演]: 如果文中条件A变为非A，结论B会如何变化？",
      "options": ["变化描述A", "变化描述B", "变化描述C", "变化描述D"],
      "correct": 0,
      "explanation": "揭示变量之间的动态关系，而非静态事实",
      "sourceHint": "作答前可显示的弱提示，不能泄露答案，只提示需要回忆哪类关系",
      "evidenceQuote": "作答后才显示的原文证据短句",
      "evidenceLocator": "证据在原文中的粗略位置，例如第几段或小标题"
    },
    {
      "type": "transfer",
      "answerMode": "multiple_choice",
      "question": "Q3 [场景迁移]: 在[完全不同的场景X]中，文中逻辑如何应用？",
      "options": ["做法A", "做法B", "做法C", "做法D"],
      "correct": 0,
      "explanation": "考察去语境化的迁移能力，指出深层逻辑",
      "sourceHint": "作答前可显示的弱提示，不能泄露答案，只提示需要回忆哪类关系",
      "evidenceQuote": "作答后才显示的原文证据短句",
      "evidenceLocator": "证据在原文中的粗略位置，例如第几段或小标题"
    }
  ]
}

# Question Design Rules
- questions.length 必须等于 strategy.questionCount，数量只能是 1、2、3。
- 允许的 type 只有 trap、counterfactual、transfer。
- 默认 answerMode 必须是 multiple_choice；只有用户点击“换成开放题”时才生成 open。
- trap 概念陷阱题：选项必须包含"合理的错误归因"或"常见的望文生义"。正确选项不能是原文简单改写，必须是原文逻辑的**推论**。干扰项要极具迷惑性。
- counterfactual 反事实推演：考察变量之间的**动态关系**，不是静态事实。
- transfer 场景迁移：将逻辑迁移到完全不同的领域，考察深层理解。
- 冷启动时优先生成 3 道题，形成概念 -> 反事实 -> 迁移的完整梯度。
- 已有用户画像时，先判断文章最需要检验的能力；如果文章强烈命中用户薄弱维度，可以只生成 1 道靶向题。
- 每道题必须同时返回 sourceHint 和 evidenceQuote。
- sourceHint 会在作答前展示，必须是弱提示，不能包含正确答案、关键选项词、可直接定位答案的原文短句；只提示用户应该回忆哪类关系、概念边界或推理方向。
- evidenceQuote 会在作答后才展示，应该短而具体，尽量原样引用原文中的关键短句，避免大段复制原文。
- evidenceLocator 是证据的粗略定位，例如“第 3 段”“方法部分”“小标题 X 下第一段”；不要编造精确页码。

# Explanation Rules
- 如果选错，必须指出思维模型在哪里断裂（因果倒置？偷换概念？忽略前提？）
- 解释要精准、犀利，不要废话

${adaptivePrompt}

文本内容: ${text}`;

  try {
    // 使用 providers.js 的统一抽象层
    const providerMeta = await getProviderMeta();
    const content = await callLLM(prompt);
    console.info('[Focus Quiz] Quiz generated');

    const quizData = parseQuizJSON(content);
    const questions = renderQuiz(quizData);
    if (questions.length === 0) {
      showRetryError('模型返回了空题目或题目字段不完整。请重试生成，或换一个更稳定的模型。');
      return;
    }
    const strategy = normalizeStrategy(quizData?.strategy, questions);
    renderQuizStrategy(strategy, questions.length);
    currentQuizSession = createQuizSession(text, questions, sourceMeta, providerMeta, strategy);

    // Streak: 成功生成 Quiz 后更新连续天数
    await updateStreak();
  } catch (err) {
    const errMsg = getErrorMessage(err);
    console.error('[Focus Quiz] Error:', errMsg, err);
    if (errMsg.includes('未配置') || errMsg.includes('missing')) {
      showSettingsError(errMsg);
    } else {
      showRetryError(toFriendlyGenerationError(errMsg));
    }
  } finally {
    loadingDiv.classList.add('hidden');
    stopLoadingQuotes();
  }
}

function getErrorMessage(err) {
  if (!err) return 'Unknown error';
  if (typeof err === 'string') return err;
  if (typeof err.message === 'string' && err.message.trim()) return err.message.trim();
  try {
    return JSON.stringify(err);
  } catch (_jsonErr) {
    return String(err);
  }
}

function parseQuizJSON(content) {
  const text = String(content || '').trim();
  if (!text) throw new Error('模型返回为空。请重试生成，或换一个更稳定的模型。');
  try {
    return JSON.parse(text);
  } catch (_directErr) {
    const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
    const candidate = fenced?.[1]?.trim() || text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1);
    if (candidate && candidate.startsWith('{') && candidate.endsWith('}')) {
      try {
        return JSON.parse(candidate);
      } catch (_candidateErr) {
        // Fall through to the user-facing error below.
      }
    }
    throw new Error('模型返回的题目结构不是有效 JSON。请重试生成，或换一个更稳定的模型。');
  }
}

function toFriendlyGenerationError(message) {
  const raw = String(message || '生成失败。');
  const lower = raw.toLowerCase();
  const hints = [];
  if (/json|返回的内容|valid/.test(lower)) {
    hints.push('模型没有严格返回 JSON，可以直接重试，或换用更遵守格式的模型。');
  }
  if (/token|context|length|too long|maximum|413|文本|超长|上下文/.test(lower)) {
    hints.push('如果这是全文模式，建议先改用选区模式，或选择更长上下文的模型。');
  }
  if (/timeout|network|failed to fetch|超时|网络/.test(lower)) {
    hints.push('这更像网络或 Provider 临时失败，可以稍后重试。');
  }
  return hints.length ? `${raw}\n\n建议：${hints.join(' ')}` : raw;
}

// ========================
// 渲染题目
// ========================
function renderQuiz(data) {
  quizDiv.replaceChildren();
  errorDiv.classList.add('hidden');

  const questions = normalizeQuestions(data);
  if (questions.length === 0) {
    showError('没有生成可用题目。请换一段更完整的文本，或重试一次。');
    return [];
  }

  questions.forEach((q, idx) => {
    quizDiv.appendChild(renderQuestionCard(q, idx));
  });

  return questions;
}

function renderQuestionCard(q, idx) {
  const typeLabels = {
    'trap': '概念陷阱',
    'counterfactual': '反事实推演',
    'transfer': '场景迁移'
  };

  const div = document.createElement('div');
  div.className = 'card question';
  div.style.animationDelay = `${idx * 0.1}s`;
  div.dataset.index = String(idx);
  div.dataset.type = q.type;
  div.dataset.answerMode = q.answerMode || 'multiple_choice';
  div.dataset.startedAt = String(Date.now());
  div.dataset.evidenceQuote = q.evidenceQuote || '';
  div.dataset.evidenceLocator = q.evidenceLocator || '';
  div.dataset.sourceHint = q.sourceHint || '';

  if (q.type) {
    const typeTag = document.createElement('span');
    typeTag.className = `q-type ${q.type}`;
    typeTag.textContent = q.answerMode === 'open'
      ? `${typeLabels[q.type] || q.type} · 开放题`
      : (typeLabels[q.type] || q.type);
    div.appendChild(typeTag);
  }

  const title = document.createElement('div');
  title.className = 'q-text';
  title.textContent = q.question;
  div.appendChild(title);

  div.appendChild(renderQuestionActions(idx));

  if (q.sourceHint) {
    div.appendChild(renderHint(q.sourceHint));
  }

  if (q.answerMode === 'open') {
    div.appendChild(renderOpenAnswer(q, idx));
    return div;
  }

  const optionsDiv = document.createElement('div');
  q.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'option';
    btn.textContent = opt;
    btn.addEventListener('click', () => handleAnswer(
      btn,
      i,
      q.correct,
      q.explanation,
      optionsDiv,
      q.question,
      q.options,
      q.evidenceQuote,
      q.sourceHint,
      q.evidenceLocator
    ));
    optionsDiv.appendChild(btn);
  });

  div.appendChild(optionsDiv);
  return div;
}

function renderQuestionActions(idx) {
  const actions = document.createElement('div');
  actions.className = 'question-actions';
  const intents = SidepanelLogic?.regenerationIntents || {};
  ['swap', 'easier', 'transfer', 'open'].forEach((intentId) => {
    const intent = intents[intentId] || { label: intentId };
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'regen-btn';
    btn.textContent = intent.label;
    btn.addEventListener('click', () => regenerateQuestion(idx, intentId));
    actions.appendChild(btn);
  });
  return actions;
}

function renderOpenAnswer(q, idx) {
  const wrapper = document.createElement('div');
  const textarea = document.createElement('textarea');
  textarea.className = 'open-answer';
  textarea.placeholder = '先用自己的话回答，再对照参考答案。';
  wrapper.appendChild(textarea);

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'open-submit';
  btn.textContent = '提交并看参考答案';
  btn.addEventListener('click', () => handleOpenAnswer(btn, textarea, q, idx));
  wrapper.appendChild(btn);
  return wrapper;
}

function renderHint(sourceHint) {
  const hint = document.createElement('div');
  hint.className = 'hint';
  hint.classList.toggle('hidden-hint', !hintVisible);
  const label = document.createElement('span');
  label.className = 'hint-label';
  label.textContent = 'Hint';
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'hint-toggle';
  toggle.textContent = hintVisible ? '隐藏' : '显示';
  toggle.addEventListener('click', () => setHintVisible(!hintVisible));
  hint.appendChild(toggle);
  hint.appendChild(label);
  const content = document.createElement('span');
  content.className = 'hint-content';
  content.textContent = sourceHint;
  hint.appendChild(content);
  return hint;
}

function renderEvidenceBlock(evidenceQuote, sourceHint, evidenceLocator = '') {
  const text = evidenceQuote || sourceHint;
  if (!text) return document.createDocumentFragment();
  const evidence = document.createElement('div');
  evidence.className = 'evidence';
  const label = document.createElement('span');
  label.className = 'evidence-label';
  label.textContent = evidenceQuote ? 'Evidence' : 'Source Hint';
  evidence.appendChild(label);
  evidence.append(evidenceLocator ? `${evidenceLocator}: ${text}` : text);
  return evidence;
}

function buildRegenerationPrompt(text, currentQuestion, intent) {
  const typeRule = intent.targetType
    ? `- 这次必须生成 ${intent.targetType} 类型。`
    : `- 优先避开当前题目的问法，但可以保持 ${currentQuestion?.type || 'trap'} 类型。`;
  const difficultyRule = intent.difficulty === 'easier'
    ? '- 降低难度：缩小抽象跨度，只改变一个关键前提，干扰项仍要有迷惑性。'
    : '- 保持必要难度：不要简单复述原文，继续检查真实理解断点。';
  const modeRule = intent.answerMode === 'open'
    ? [
        '- 生成开放题，answerMode 必须是 open。',
        '- 不要返回 options/correct；必须返回 expectedAnswer 和 rubric。',
        '- 开放题要让用户用自己的话重构逻辑，而不是背诵原文。'
      ].join('\n')
    : [
        '- 生成选择题，answerMode 必须是 multiple_choice。',
        '- 必须返回 4 个 options 和 correct，correct 是 0-3 的整数。'
      ].join('\n');

  return `# Role
你是 Focus Quiz 的严苛学术导师。用户正在对单题进行局部重生成，不要改变整轮学习闭环。

# Regeneration Intent
- 控制项：${intent.label}
${typeRule}
${difficultyRule}
${modeRule}

# Current Question To Replace
${JSON.stringify(currentQuestion || {}, null, 2)}

# Output Format
严格只返回 JSON：
{
  "question": {
    "type": "trap | counterfactual | transfer",
    "answerMode": "${intent.answerMode}",
    "question": "新题目",
    "options": ["A", "B", "C", "D"],
    "correct": 0,
    "expectedAnswer": "开放题参考答案，选择题可留空",
    "rubric": "开放题评分要点，选择题可留空",
    "explanation": "指出这道题暴露的理解断点",
    "sourceHint": "作答前弱提示，不能剧透答案",
    "evidenceQuote": "作答后显示的原文关键短句",
    "evidenceLocator": "证据粗略位置，例如第几段或小标题"
  }
}

# Evidence Rules
- sourceHint 不能包含正确答案、关键选项词、可直接定位答案的原文短句。
- evidenceQuote 必须短而具体，尽量原样引用原文中的关键短句。
- evidenceLocator 只能给粗略位置，不要编造页码或不存在的小标题。

文本内容：${text}`;
}

async function regenerateQuestion(idx, intentId) {
  if (!currentQuizSession || !lastQuizRequest?.text) {
    showRetryError('当前没有可重生成的题目。请先生成一轮问题。');
    return;
  }

  const card = quizDiv.querySelector(`.question[data-index="${idx}"]`);
  if (!card || card.classList.contains('answered')) return;

  const intent = SidepanelLogic?.normalizeRegenerationIntent
    ? SidepanelLogic.normalizeRegenerationIntent(intentId)
    : { id: intentId, label: intentId, answerMode: 'multiple_choice', targetType: null, difficulty: 'same' };
  const controls = card.querySelectorAll('button');
  controls.forEach((button) => { button.disabled = true; });
  showModeHelp(`正在${intent.label}，会保留当前文章和本轮策略。`);

  try {
    const currentQuestion = {
      type: card.dataset.type,
      answerMode: card.dataset.answerMode,
      question: card.querySelector('.q-text')?.textContent || '',
      sourceHint: card.dataset.sourceHint || '',
      evidenceQuote: card.dataset.evidenceQuote || '',
      evidenceLocator: card.dataset.evidenceLocator || ''
    };
    const prompt = buildRegenerationPrompt(lastQuizRequest.text, currentQuestion, intent);
    const content = await callLLM(prompt);
    const data = parseQuizJSON(content);
    const rawQuestion = data?.question || data?.questions?.[0];
    const normalized = normalizeQuestions({ questions: [rawQuestion] })[0];
    if (!normalized) {
      showRetryError('模型没有返回可用的新题。请再次重试，或换一个更稳定的模型。');
      return;
    }
    if (intent.targetType) normalized.type = intent.targetType;

    const replacement = renderQuestionCard(normalized, idx);
    card.replaceWith(replacement);
    currentQuizSession.questions[idx] = {
      index: idx,
      type: normalized.type,
      answerMode: normalized.answerMode,
      startedAt: Date.now(),
      completed: false,
      regeneratedBy: intent.id
    };
  } catch (err) {
    showRetryError(toFriendlyGenerationError(getErrorMessage(err)));
    controls.forEach((button) => { button.disabled = false; });
  }
}

function normalizeStrategy(strategy, questions) {
  const focus = Array.isArray(strategy?.focus)
    ? strategy.focus.filter((type) => ['trap', 'counterfactual', 'transfer'].includes(type))
    : questions.map((question) => question.type).filter(Boolean);
  const count = questions.length;
  return {
    questionCount: count,
    articleType: String(strategy?.articleType || 'adaptive_dose'),
    focus: Array.from(new Set(focus.length ? focus : questions.map((question) => question.type))),
    reason: String(strategy?.reason || (count === 3
      ? '冷启动或完整校准，本轮保留三题梯度。'
      : '根据文章结构和本地画像，本轮降低题量并进行靶向检验。'))
  };
}

function renderQuizStrategy(strategy, actualCount) {
  if (!quizStrategyDiv) return;
  quizStrategyDiv.replaceChildren();

  const typeLabels = {
    trap: '概念边界',
    counterfactual: '因果/反事实',
    transfer: '场景迁移'
  };

  const title = document.createElement('div');
  title.className = 'strategy-title';
  title.textContent = `本轮策略：${actualCount}题 · ${strategy.articleType}`;
  quizStrategyDiv.appendChild(title);

  const body = document.createElement('div');
  body.className = 'strategy-body';
  body.textContent = strategy.reason;
  quizStrategyDiv.appendChild(body);

  if (strategy.focus.length) {
    const tags = document.createElement('div');
    tags.className = 'strategy-tags';
    strategy.focus.forEach((type) => {
      const tag = document.createElement('span');
      tag.className = 'strategy-tag';
      tag.textContent = typeLabels[type] || type;
      tags.appendChild(tag);
    });
    quizStrategyDiv.appendChild(tags);
  }

  quizStrategyDiv.classList.remove('hidden');
}

function normalizeQuestions(data) {
  const rawQuestions = Array.isArray(data?.questions) ? data.questions : [];
  return rawQuestions.slice(0, 3).map((q, idx) => {
    if (SidepanelLogic?.normalizeP1Question) return SidepanelLogic.normalizeP1Question(q, idx);
    return q;
  }).filter((q) => {
    if (!q || !q.question) return false;
    if (q.answerMode === 'open') return Boolean(q.expectedAnswer || q.rubric || q.explanation);
    return q.options.length >= 2 && Number.isInteger(q.correct) && q.correct >= 0 && q.correct < q.options.length;
  });
}

// ========================
// 处理答案
// ========================
async function handleAnswer(btn, chosenIdx, correctIdx, explanation, container, questionText, options, evidenceQuote = '', sourceHint = '', evidenceLocator = '') {
  const isCorrect = chosenIdx === correctIdx;
  const questionCard = container.closest('.question');
  const questionType = questionCard?.dataset.type || '';
  const questionIndex = Number.parseInt(questionCard?.dataset.index || '-1', 10);
  const questionStartedAt = Number.parseInt(questionCard?.dataset.startedAt || String(Date.now()), 10);
  questionCard?.classList.add('answered');
  questionCard?.querySelectorAll('.regen-btn').forEach((regenBtn) => { regenBtn.disabled = true; });

  // 禁用所有按钮
  const buttons = container.querySelectorAll('.option');
  buttons.forEach((b, i) => {
    b.classList.add('disabled');
    b.disabled = true;
    if (i === correctIdx) {
      b.classList.add('correct');
    }
  });

  if (!isCorrect) {
    btn.classList.add('wrong');
    // 错题沉淀到本地
    await saveMistake(questionText, chosenIdx, correctIdx, explanation, options, evidenceQuote, sourceHint, evidenceLocator);
  }

  const latencyMs = Date.now() - questionStartedAt;
  const answerRecord = {
    type: questionType,
    dimension: Learning?.dimensions?.[questionType]?.id || questionType,
    questionText,
    correctIndex: correctIdx,
    chosenIndex: chosenIdx,
    isCorrect,
    evidenceQuote,
    sourceHint,
    evidenceLocator,
    latencyMs
  };
  if (currentQuizSession) {
    if (currentQuizSession.questions[questionIndex]) {
      currentQuizSession.questions[questionIndex].completed = true;
    }
    currentQuizSession.answers.push(answerRecord);
  }
  if (Learning && currentQuizSession) {
    currentLearningProfile = await Learning.recordAnswerEvent({
      sessionId: currentQuizSession.sessionId,
      source: currentQuizSession.source,
      provider: currentQuizSession.provider,
      timestamp: Date.now(),
      ...answerRecord
    });
    renderLearningProfile(currentLearningProfile);
  }

  // 显示解释
  const expDiv = document.createElement('div');
  expDiv.className = isCorrect ? 'explain correct-exp' : 'explain';
  if (isCorrect) {
    expDiv.textContent = explanation;
  } else {
    const label = document.createElement('strong');
    label.textContent = '思维断裂点：';
    expDiv.appendChild(label);
    expDiv.append(explanation);
  }
  if (evidenceQuote || sourceHint) {
    expDiv.appendChild(renderEvidenceBlock(evidenceQuote, sourceHint, evidenceLocator));
  }

  // Growth Loop: 答错后追加分享按钮
  if (!isCorrect) {
    const shareBtn = document.createElement('button');
    shareBtn.className = 'share-btn';
    shareBtn.textContent = '分享这道题';
    shareBtn.dataset.question = questionText;
    // 使用 addEventListener
    shareBtn.addEventListener('click', () => shareQuestion(questionText, explanation));
    expDiv.appendChild(document.createElement('br'));
    expDiv.appendChild(shareBtn);
  }

  container.parentElement.appendChild(expDiv);
  renderSessionDiagnosis();
}

function handleOpenAnswer(btn, textarea, q, idx) {
  const questionCard = btn.closest('.question');
  questionCard?.classList.add('answered');
  questionCard?.querySelectorAll('.regen-btn').forEach((regenBtn) => { regenBtn.disabled = true; });
  textarea.disabled = true;
  btn.disabled = true;

  const answerRecord = {
    type: q.type,
    dimension: Learning?.dimensions?.[q.type]?.id || q.type,
    questionText: q.question,
    userAnswer: textarea.value.trim(),
    expectedAnswer: q.expectedAnswer,
    isCorrect: null,
    isScored: false,
    evidenceQuote: q.evidenceQuote,
    sourceHint: q.sourceHint,
    evidenceLocator: q.evidenceLocator,
    latencyMs: Date.now() - Number.parseInt(questionCard?.dataset.startedAt || String(Date.now()), 10)
  };

  if (currentQuizSession) {
    if (currentQuizSession.questions[idx]) {
      currentQuizSession.questions[idx].completed = true;
    }
    currentQuizSession.answers.push(answerRecord);
  }

  const expDiv = document.createElement('div');
  expDiv.className = 'explain correct-exp';
  if (q.expectedAnswer) {
    const answerLabel = document.createElement('strong');
    answerLabel.textContent = '参考答案：';
    expDiv.appendChild(answerLabel);
    expDiv.append(q.expectedAnswer);
  }
  if (q.rubric) {
    expDiv.appendChild(document.createElement('br'));
    const rubricLabel = document.createElement('strong');
    rubricLabel.textContent = '检查要点：';
    expDiv.appendChild(rubricLabel);
    expDiv.append(q.rubric);
  }
  if (q.explanation) {
    expDiv.appendChild(document.createElement('br'));
    expDiv.append(q.explanation);
  }
  if (q.evidenceQuote || q.sourceHint) {
    expDiv.appendChild(renderEvidenceBlock(q.evidenceQuote, q.sourceHint, q.evidenceLocator));
  }

  questionCard.appendChild(expDiv);
  renderSessionDiagnosis();
}

// ========================
// 显示错误
// ========================
function showError(msg) {
  errorDiv.textContent = msg;
  errorDiv.classList.remove('hidden');
}

function showRetryError(msg) {
  errorDiv.textContent = '';
  const text = document.createElement('div');
  text.textContent = msg;
  errorDiv.appendChild(text);

  if (lastQuizRequest?.text) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = '重试生成';
    btn.addEventListener('click', () => generateQuiz(lastQuizRequest.text, lastQuizRequest.sourceMeta));
    errorDiv.appendChild(btn);
  }

  errorDiv.classList.remove('hidden');
}

function showSettingsError(msg) {
  errorDiv.textContent = '';
  errorDiv.append(msg, document.createElement('br'));
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.textContent = '前往设置';
  btn.addEventListener('click', () => chrome.runtime.openOptionsPage());
  errorDiv.appendChild(btn);
  errorDiv.classList.remove('hidden');
}

// ========================
// 视图切换
// ========================
document.getElementById('openMistakes').addEventListener('click', () => {
  mainView.classList.add('hidden');
  mistakeView.classList.remove('hidden');
  renderMistakeLog();
});

selectionModeBtn?.addEventListener('click', () => {
  setActiveMode('selection');
  showModeHelp('选中网页里最想检验理解的段落，然后右键选择 “Focus Quiz: 审问选中文本”。选区模式更适合局部精读。');
});

fullPageModeBtn?.addEventListener('click', () => {
  startFullPageFromSidePanel();
});

copyMistakesBtn?.addEventListener('click', () => {
  copyMistakesAsMarkdown();
});

copyAnkiCsvBtn?.addEventListener('click', () => {
  copyMistakesAsAnkiCsv();
});

exportMistakesBtn?.addEventListener('click', () => {
  exportMistakesAsMarkdownFile();
});

document.getElementById('backToQuiz').addEventListener('click', () => {
  mistakeView.classList.add('hidden');
  mainView.classList.remove('hidden');
});

document.getElementById('openSettings').addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

// ========================
// 启动
// ========================
loadStreak();
loadHintPreference();
loadLearningProfile();
checkForText();

chrome.storage.onChanged.addListener((changes) => {
  if (changes.selectedText || changes.extractionError) {
    checkForText();
  }
});
