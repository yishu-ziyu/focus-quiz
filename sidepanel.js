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
    sourceUrl: '' // 可以后续从 tab 获取
  });
  // 最多保留 50 条
  if (log.length > 50) log.length = 50;
  await chrome.storage.local.set({ mistakeLog: log });
}

async function renderMistakeLog() {
  const result = await chrome.storage.local.get(['mistakeLog']);
  const log = result.mistakeLog || [];
  mistakeList.innerHTML = '';

  if (log.length === 0) {
    mistakeList.innerHTML = '<div class="empty-state">暂无错题记录。<br/>去做几道题，有意识地犯点错吧 🧠</div>';
    return;
  }

  log.forEach((item) => {
    const div = document.createElement('div');
    div.className = 'mistake-item';

    const meta = document.createElement('div');
    meta.className = 'mistake-meta';
    meta.textContent = new Date(item.timestamp).toLocaleString('zh-CN');
    div.appendChild(meta);

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
  const result = await chrome.storage.local.get(['selectedText', 'timestamp']);

  if (result.selectedText && result.timestamp) {
    if (Date.now() - result.timestamp < 300000) {
      selectedTextDiv.textContent = `"${result.selectedText.substring(0, 150)}${result.selectedText.length > 150 ? '...' : ''}"`;
      selectedTextDiv.classList.remove('hidden');

      generateQuiz(result.selectedText);

      chrome.storage.local.remove(['selectedText', 'timestamp']);
    }
  }
}

// ========================
// 生成 Quiz
// ========================
async function generateQuiz(text) {
  loadingDiv.classList.remove('hidden');
  errorDiv.classList.add('hidden');
  quizDiv.innerHTML = '';
  startLoadingQuotes();

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

文本内容: ${text}`;

  try {
    // 使用 providers.js 的统一抽象层
    const content = await callLLM(prompt);
    console.log('[Focus Quiz] Response:', content);

    const quizData = JSON.parse(content);
    renderQuiz(quizData);

    // Streak: 成功生成 Quiz 后更新连续天数
    await updateStreak();
  } catch (err) {
    const errMsg = getErrorMessage(err);
    console.error('[Focus Quiz] Error:', errMsg, err);
    if (errMsg.includes('未配置') || errMsg.includes('missing')) {
      errorDiv.innerHTML = `${errMsg} <br/><button id="errorSettingsBtn" style="margin-top:8px;padding:4px 8px;font-size:12px;cursor:pointer;background:#b91c1c;color:white;border:none;border-radius:4px;">前往设置</button>`;
      
      // 添加事件监听而不是行内 onclick 以符合 CSP
      setTimeout(() => {
        const btn = document.getElementById('errorSettingsBtn');
        if (btn) btn.addEventListener('click', () => chrome.runtime.openOptionsPage());
      }, 0);
      
      errorDiv.classList.remove('hidden');
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
  quizDiv.innerHTML = '';

  if (!data.questions || data.questions.length === 0) {
    showError('No questions generated');
    return;
  }

  const typeLabels = {
    'trap': '概念陷阱',
    'counterfactual': '反事实推演',
    'transfer': '场景迁移'
  };

  data.questions.forEach((q, idx) => {
    const div = document.createElement('div');
    div.className = 'card question';
    div.style.animationDelay = `${idx * 0.1}s`;

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
}

// ========================
// 处理答案
// ========================
function handleAnswer(btn, chosenIdx, correctIdx, explanation, container, questionText, options) {
  const isCorrect = chosenIdx === correctIdx;

  // 禁用所有按钮
  const buttons = container.querySelectorAll('.option');
  buttons.forEach((b, i) => {
    b.classList.add('disabled');
    b.onclick = null;
    if (i === correctIdx) {
      b.classList.add('correct');
    }
  });

  if (!isCorrect) {
    btn.classList.add('wrong');
    // 错题沉淀到本地
    saveMistake(questionText, chosenIdx, correctIdx, explanation, options);
  }

  // 显示解释
  const expDiv = document.createElement('div');
  expDiv.className = isCorrect ? 'explain correct-exp' : 'explain';
  expDiv.innerHTML = isCorrect
    ? `✓ ${explanation}`
    : `⚠️ <strong>思维断裂点：</strong>${explanation}`;

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
}

// ========================
// 显示错误
// ========================
function showError(msg) {
  errorDiv.textContent = msg;
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
checkForText();

chrome.storage.onChanged.addListener((changes) => {
  if (changes.selectedText) {
    checkForText();
  }
});
