// Pure helpers shared by the side panel UI and Node regression tests.

const FQ_REGENERATION_INTENTS = {
  swap: {
    id: 'swap',
    label: '换一道',
    answerMode: 'multiple_choice',
    targetType: null,
    difficulty: 'same'
  },
  easier: {
    id: 'easier',
    label: '降低难度',
    answerMode: 'multiple_choice',
    targetType: null,
    difficulty: 'easier'
  },
  transfer: {
    id: 'transfer',
    label: '只考迁移',
    answerMode: 'multiple_choice',
    targetType: 'transfer',
    difficulty: 'same'
  },
  open: {
    id: 'open',
    label: '换成开放题',
    answerMode: 'open',
    targetType: null,
    difficulty: 'same'
  }
};

function fqCleanText(value) {
  return String(value || '').replace(/\r?\n/g, ' ').replace(/\s+/g, ' ').trim();
}

function countMatches(text, keywords) {
  return keywords.reduce((count, keyword) => count + (text.includes(keyword) ? 1 : 0), 0);
}

const FQ_ARTICLE_TYPES = [
  {
    id: 'paper',
    label: '论文型',
    primaryDemand: 'counterfactual',
    keywords: ['摘要', '本文研究', '方法', '样本', '变量', '回归', '模型', '稳健性', '异质性', '结果', 'hypothesis', 'regression', 'robustness']
  },
  {
    id: 'tutorial',
    label: '教程型',
    primaryDemand: 'transfer',
    keywords: ['第一步', '第二步', '步骤', '安装', '配置', '教程', '操作', 'how to', 'step', 'setup']
  },
  {
    id: 'method',
    label: '方法型',
    primaryDemand: 'transfer',
    keywords: ['方法', '框架', '流程', '原则', '策略', '路径', '复盘', '适用边界', 'framework', 'method']
  },
  {
    id: 'case',
    label: '案例型',
    primaryDemand: 'transfer',
    keywords: ['案例', '公司', '客户', '故事', '例如', '场景', '实践', 'case', 'example']
  },
  {
    id: 'argumentative',
    label: '论证型',
    primaryDemand: 'counterfactual',
    keywords: ['因此', '然而', '但是', '因为', '所以', '论证', '观点', '反驳', '前提', '结论', 'however', 'therefore']
  },
  {
    id: 'conceptual_definition',
    label: '概念定义型',
    primaryDemand: 'trap',
    keywords: ['定义', '概念', '区别', '边界', '本质', '是什么', '不是', 'definition', 'concept']
  }
];

const FQ_DIMENSION_TO_TYPE = {
  concept_boundary: 'trap',
  causal_reasoning: 'counterfactual',
  transfer_ability: 'transfer'
};

function classifyArticleForP2(text) {
  const normalized = fqCleanText(text).toLowerCase();
  const scored = FQ_ARTICLE_TYPES.map((type) => {
    const score = countMatches(normalized, type.keywords.map((keyword) => keyword.toLowerCase()));
    return {
      ...type,
      score,
      signals: type.keywords.filter((keyword) => normalized.includes(keyword.toLowerCase())).slice(0, 4)
    };
  }).sort((a, b) => b.score - a.score);

  const winner = scored[0]?.score > 0 ? scored[0] : FQ_ARTICLE_TYPES.find((type) => type.id === 'argumentative');
  return {
    id: winner.id,
    label: winner.label,
    primaryDemand: winner.primaryDemand,
    signals: winner.signals.length ? winner.signals : ['未命中强信号，按论证型处理']
  };
}

function p2AdviceForWeakness(weakestDimension) {
  const advice = {
    concept_boundary: '你不是读得少，而是概念边界还没有压实。',
    causal_reasoning: '你不是没看懂结论，而是条件一变，因果链就容易断。',
    transfer_ability: '你不是记不住，而是换场景后还不能重构概念。'
  };
  return advice[weakestDimension] || '先用少量题暴露理解断点，再回到原文校正。';
}

function buildP2QuestionPlan(profile, articleAnalysis) {
  const article = articleAnalysis || classifyArticleForP2('');
  const weakType = FQ_DIMENSION_TO_TYPE[profile?.weakestDimension] || null;
  const enoughData = Boolean(profile?.enoughData);
  const personalizationLine = enoughData
    ? p2AdviceForWeakness(profile?.weakestDimension)
    : '样本不足时先用三题建立画像，不急着假装个性化。';

  if (!enoughData) {
    return {
      articleType: article.id,
      articleTypeLabel: article.label,
      questionCount: 3,
      focus: ['trap', 'counterfactual', 'transfer'],
      targetDifficulty: 'medium',
      personalizationLine,
      reason: `冷启动阶段先用三题建立画像；当前文章像${article.label}，会额外观察${article.primaryDemand}能力。`
    };
  }

  if (weakType && weakType === article.primaryDemand) {
    return {
      articleType: article.id,
      articleTypeLabel: article.label,
      questionCount: 1,
      focus: [weakType],
      targetDifficulty: profile.targetDifficulty || 'medium',
      personalizationLine,
      reason: `当前文章像${article.label}，正好命中你的薄弱维度${profile.weakestLabel || '当前薄弱维度'}，本轮只出 1 道靶向题。`
    };
  }

  const focus = Array.from(new Set([article.primaryDemand, weakType].filter(Boolean)));
  return {
    articleType: article.id,
    articleTypeLabel: article.label,
    questionCount: focus.length || 2,
    focus: focus.length ? focus : ['trap', 'counterfactual'],
    targetDifficulty: profile?.targetDifficulty || 'medium',
    personalizationLine,
    reason: `当前文章像${article.label}，主要需要${article.primaryDemand}检验；同时保留你的薄弱维度${profile?.weakestLabel || '画像校准'}。`
  };
}

function buildP2PromptGuidance(plan, articleAnalysis) {
  const focusLabels = {
    trap: '概念边界',
    counterfactual: '因果/反事实',
    transfer: '场景迁移'
  };
  return [
    '# P2 Personalization',
    `- 本地文章类型判断：${articleAnalysis.label}；信号：${articleAnalysis.signals.join('、')}。`,
    `- 本轮题量建议：${plan.questionCount}。题型聚焦：${plan.focus.map((type) => focusLabels[type] || type).join('、')}。`,
    `- 个性化判断：${plan.personalizationLine}`,
    `- 出题理由：${plan.reason}`,
    '- 如果模型判断与文本明显冲突，可以修正 articleType，但必须在 strategy.reason 里解释。',
    '- 个性化的目标是减少无效题量，不是制造更多题。'
  ].join('\n');
}

function normalizeRegenerationIntent(intentId) {
  const intent = FQ_REGENERATION_INTENTS[intentId] || FQ_REGENERATION_INTENTS.swap;
  return { ...intent };
}

function normalizeP1Question(rawQuestion, idx = 0) {
  const allowedTypes = ['trap', 'counterfactual', 'transfer'];
  const type = allowedTypes.includes(rawQuestion?.type)
    ? rawQuestion.type
    : (allowedTypes[idx] || 'trap');
  const answerMode = rawQuestion?.answerMode === 'open' ? 'open' : 'multiple_choice';

  if (answerMode === 'open') {
    return {
      type,
      answerMode,
      question: String(rawQuestion?.question || `Q${idx + 1}`),
      options: [],
      correct: null,
      explanation: String(rawQuestion?.explanation || rawQuestion?.rubric || '模型未返回解析。'),
      expectedAnswer: String(rawQuestion?.expectedAnswer || '').trim(),
      rubric: String(rawQuestion?.rubric || '').trim(),
      evidenceQuote: String(rawQuestion?.evidenceQuote || '').trim(),
      evidenceLocator: String(rawQuestion?.evidenceLocator || '').trim(),
      sourceHint: String(rawQuestion?.sourceHint || '').trim()
    };
  }

  const options = Array.isArray(rawQuestion?.options) ? rawQuestion.options.map((opt) => String(opt)) : [];
  const rawCorrect = Number.isInteger(rawQuestion?.correct) ? rawQuestion.correct : rawQuestion?.correctAnswer;
  const correct = Number.isInteger(rawCorrect) ? rawCorrect : Number.parseInt(rawCorrect, 10);
  return {
    type,
    answerMode,
    question: String(rawQuestion?.question || `Q${idx + 1}`),
    options,
    correct,
    explanation: String(rawQuestion?.explanation || '模型未返回解析。'),
    expectedAnswer: '',
    rubric: '',
    evidenceQuote: String(rawQuestion?.evidenceQuote || '').trim(),
    evidenceLocator: String(rawQuestion?.evidenceLocator || '').trim(),
    sourceHint: String(rawQuestion?.sourceHint || '').trim()
  };
}

function csvCell(value) {
  const text = fqCleanText(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function formatMistakesAsAnkiCsv(log) {
  const lines = ['Front,Back,Source,Evidence,Tags'];
  (Array.isArray(log) ? log : []).forEach((item) => {
    const sourceTitle = fqCleanText(item.sourceTitle || '原文');
    const sourceUrl = fqCleanText(item.sourceUrl);
    const evidence = [item.evidenceQuote, item.evidenceLocator].map(fqCleanText).filter(Boolean).join(' | ');
    const front = fqCleanText(item.question);
    const backParts = [
      item.correctAnswer ? `正确答案：${fqCleanText(item.correctAnswer)}` : '',
      item.userChoice ? `我的选择：${fqCleanText(item.userChoice)}` : '',
      item.explanation ? `思维断裂点：${fqCleanText(item.explanation)}` : ''
    ].filter(Boolean);
    const source = sourceUrl ? `${sourceTitle} ${sourceUrl}` : sourceTitle;
    lines.push([
      csvCell(front),
      csvCell(backParts.join('；')),
      csvCell(source),
      csvCell(evidence),
      csvCell('focus-quiz')
    ].join(','));
  });
  return lines.join('\n');
}

const FocusQuizSidepanelLogic = {
  regenerationIntents: FQ_REGENERATION_INTENTS,
  cleanText: fqCleanText,
  normalizeRegenerationIntent,
  normalizeP1Question,
  classifyArticleForP2,
  buildP2QuestionPlan,
  buildP2PromptGuidance,
  p2AdviceForWeakness,
  formatMistakesAsAnkiCsv
};

globalThis.FocusQuizSidepanelLogic = FocusQuizSidepanelLogic;

if (typeof module !== 'undefined' && module.exports) {
  module.exports = FocusQuizSidepanelLogic;
}
