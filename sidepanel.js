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
const mainView = document.getElementById('mainView');
const mistakeView = document.getElementById('mistakeView');
const mistakeList = document.getElementById('mistakeList');
const profileSummary = document.getElementById('profileSummary');
const diagnosisDiv = document.getElementById('diagnosis');
const Learning = globalThis.FocusQuizLearning;

let currentLearningProfile = null;
let currentQuizSession = null;

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

function renderStreak(count) {
  if (count > 0) {
    streakBadge.textContent = `🔥 Day ${count}`;
    streakBadge.classList.remove('cold');
  } else {
    streakBadge.textContent = '🔥 Day 0';
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
async function saveMistake(question, userChoiceIdx, correctIdx, explanation, options) {
  const result = await chrome.storage.local.get(['mistakeLog']);
  const log = result.mistakeLog || [];
  log.unshift({
    question: question,
    userChoice: options[userChoiceIdx],
    correctAnswer: options[correctIdx],
    explanation: explanation,
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

function createQuizSession(text, questions, sourceMeta, providerMeta) {
  return {
    sessionId: `fq_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    startedAt: Date.now(),
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
      startedAt: Date.now()
    }))
  };
}

function renderSessionDiagnosis() {
  if (!diagnosisDiv || !Learning || !currentQuizSession) return;
  const totalQuestions = currentQuizSession.questions.length;
  if (currentQuizSession.answers.length < totalQuestions) return;

  const diagnosis = Learning.diagnoseSession(currentQuizSession.answers, currentLearningProfile);
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
    yourAns.textContent = `✗ 你的选择: ${item.userChoice}`;
    div.appendChild(yourAns);

    const correctAns = document.createElement('div');
    correctAns.className = 'mistake-correct-answer';
    correctAns.textContent = `✓ 正确答案: ${item.correctAnswer}`;
    div.appendChild(correctAns);

    const exp = document.createElement('div');
    exp.className = 'mistake-explain';
    exp.textContent = `⚠️ 思维断裂点: ${item.explanation}`;
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
        btn.textContent = '✅ 已复制';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.textContent = '📤 分享这道题';
          btn.classList.remove('copied');
        }, 2000);
      }
    });
  });
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
  loadingDiv.classList.remove('hidden');
  errorDiv.classList.add('hidden');
  diagnosisDiv.classList.add('hidden');
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
  "questions": [
    {
      "type": "trap",
      "question": "Q1 [概念陷阱题]: 题目内容",
      "options": ["选项A", "选项B", "选项C", "选项D"],
      "correct": 0,
      "explanation": "指出错误选项的思维陷阱：是因果倒置？偷换概念？还是忽略了前提？"
    },
    {
      "type": "counterfactual",
      "question": "Q2 [反事实推演]: 如果文中条件A变为非A，结论B会如何变化？",
      "options": ["变化描述A", "变化描述B", "变化描述C", "变化描述D"],
      "correct": 0,
      "explanation": "揭示变量之间的动态关系，而非静态事实"
    },
    {
      "type": "transfer",
      "question": "Q3 [场景迁移]: 在[完全不同的场景X]中，文中逻辑如何应用？",
      "options": ["做法A", "做法B", "做法C", "做法D"],
      "correct": 0,
      "explanation": "考察去语境化的迁移能力，指出深层逻辑"
    }
  ]
}

# Question Design Rules
- Q1 概念陷阱题：选项必须包含"合理的错误归因"或"常见的望文生义"。正确选项不能是原文简单改写，必须是原文逻辑的**推论**。干扰项要极具迷惑性。
- Q2 反事实推演：考察变量之间的**动态关系**，不是静态事实。
- Q3 场景迁移：将逻辑迁移到完全不同的领域，考察深层理解。

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

    const quizData = JSON.parse(content);
    const questions = renderQuiz(quizData);
    if (questions.length === 0) return;
    currentQuizSession = createQuizSession(text, questions, sourceMeta, providerMeta);

    // Streak: 成功生成 Quiz 后更新连续天数
    await updateStreak();
  } catch (err) {
    const errMsg = getErrorMessage(err);
    console.error('[Focus Quiz] Error:', errMsg, err);
    if (errMsg.includes('未配置') || errMsg.includes('missing')) {
      showSettingsError(errMsg);
    } else {
      showError(errMsg);
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

// ========================
// 渲染题目
// ========================
function renderQuiz(data) {
  quizDiv.replaceChildren();

  const questions = normalizeQuestions(data);
  if (questions.length === 0) {
    showError('没有生成可用题目。请换一段更完整的文本，或重试一次。');
    return [];
  }

  const typeLabels = {
    'trap': '概念陷阱',
    'counterfactual': '反事实推演',
    'transfer': '场景迁移'
  };

  questions.forEach((q, idx) => {
    const div = document.createElement('div');
    div.className = 'card question';
    div.style.animationDelay = `${idx * 0.1}s`;
    div.dataset.index = String(idx);
    div.dataset.type = q.type;
    div.dataset.startedAt = String(Date.now());

    if (q.type) {
      const typeTag = document.createElement('span');
      typeTag.className = `q-type ${q.type}`;
      typeTag.textContent = typeLabels[q.type] || q.type;
      div.appendChild(typeTag);
    }

    const title = document.createElement('div');
    title.className = 'q-text';
    title.textContent = q.question;
    div.appendChild(title);

    const optionsDiv = document.createElement('div');

    q.options.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.className = 'option';
      btn.textContent = opt;
      // 使用 addEventListener 代替 onclick 以符合 CSP 规范
      btn.addEventListener('click', () => handleAnswer(btn, i, q.correct, q.explanation, optionsDiv, q.question, q.options));
      optionsDiv.appendChild(btn);
    });

    div.appendChild(optionsDiv);
    quizDiv.appendChild(div);
  });

  return questions;
}

function normalizeQuestions(data) {
  const rawQuestions = Array.isArray(data?.questions) ? data.questions : [];
  return rawQuestions.map((q, idx) => {
    const options = Array.isArray(q?.options) ? q.options.map((opt) => String(opt)) : [];
    const rawCorrect = Number.isInteger(q?.correct) ? q.correct : q?.correctAnswer;
    const correct = Number.isInteger(rawCorrect) ? rawCorrect : Number.parseInt(rawCorrect, 10);
    return {
      type: q?.type || ['trap', 'counterfactual', 'transfer'][idx] || 'trap',
      question: String(q?.question || `Q${idx + 1}`),
      options,
      correct,
      explanation: String(q?.explanation || '模型未返回解析。')
    };
  }).filter((q) => q.options.length >= 2 && Number.isInteger(q.correct) && q.correct >= 0 && q.correct < q.options.length);
}

// ========================
// 处理答案
// ========================
async function handleAnswer(btn, chosenIdx, correctIdx, explanation, container, questionText, options) {
  const isCorrect = chosenIdx === correctIdx;
  const questionCard = container.closest('.question');
  const questionIndex = Number.parseInt(questionCard?.dataset.index || '-1', 10);
  const questionType = questionCard?.dataset.type || '';
  const questionStartedAt = Number.parseInt(questionCard?.dataset.startedAt || String(Date.now()), 10);

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
    await saveMistake(questionText, chosenIdx, correctIdx, explanation, options);
  }

  const latencyMs = Date.now() - questionStartedAt;
  const answerRecord = {
    type: questionType,
    dimension: Learning?.dimensions?.[questionType]?.id || questionType,
    questionText,
    correctIndex: correctIdx,
    chosenIndex: chosenIdx,
    isCorrect,
    latencyMs
  };
  if (currentQuizSession) {
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
    expDiv.textContent = `✓ ${explanation}`;
  } else {
    expDiv.append('⚠️ ');
    const label = document.createElement('strong');
    label.textContent = '思维断裂点：';
    expDiv.appendChild(label);
    expDiv.append(explanation);
  }

  // Growth Loop: 答错后追加分享按钮
  if (!isCorrect) {
    const shareBtn = document.createElement('button');
    shareBtn.className = 'share-btn';
    shareBtn.textContent = '📤 分享这道题';
    shareBtn.dataset.question = questionText;
    // 使用 addEventListener
    shareBtn.addEventListener('click', () => shareQuestion(questionText, explanation));
    expDiv.appendChild(document.createElement('br'));
    expDiv.appendChild(shareBtn);
  }

  container.parentElement.appendChild(expDiv);
  renderSessionDiagnosis();
}

// ========================
// 显示错误
// ========================
function showError(msg) {
  errorDiv.textContent = msg;
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
loadLearningProfile();
checkForText();

chrome.storage.onChanged.addListener((changes) => {
  if (changes.selectedText || changes.extractionError) {
    checkForText();
  }
});
