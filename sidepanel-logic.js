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
  formatMistakesAsAnkiCsv
};

globalThis.FocusQuizSidepanelLogic = FocusQuizSidepanelLogic;

if (typeof module !== 'undefined' && module.exports) {
  module.exports = FocusQuizSidepanelLogic;
}
