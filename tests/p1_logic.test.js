const assert = require('node:assert/strict');
const test = require('node:test');

const {
  normalizeRegenerationIntent,
  normalizeP1Question,
  formatMistakesAsAnkiCsv
} = require('../sidepanel-logic.js');

test('normalizeRegenerationIntent maps supported controls to prompt constraints', () => {
  assert.deepEqual(normalizeRegenerationIntent('swap'), {
    id: 'swap',
    label: '换一道',
    answerMode: 'multiple_choice',
    targetType: null,
    difficulty: 'same'
  });

  assert.deepEqual(normalizeRegenerationIntent('easier'), {
    id: 'easier',
    label: '降低难度',
    answerMode: 'multiple_choice',
    targetType: null,
    difficulty: 'easier'
  });

  assert.deepEqual(normalizeRegenerationIntent('transfer'), {
    id: 'transfer',
    label: '只考迁移',
    answerMode: 'multiple_choice',
    targetType: 'transfer',
    difficulty: 'same'
  });

  assert.deepEqual(normalizeRegenerationIntent('open'), {
    id: 'open',
    label: '换成开放题',
    answerMode: 'open',
    targetType: null,
    difficulty: 'same'
  });
});

test('normalizeP1Question accepts open questions without fake choices', () => {
  const question = normalizeP1Question({
    type: 'transfer',
    answerMode: 'open',
    question: '把文章逻辑迁移到一个团队协作场景，应该先检查什么？',
    expectedAnswer: '应先检查关键前提是否仍然成立，再迁移结论。',
    rubric: '答案需要说明前提、因果链和迁移边界。',
    explanation: '开放题用于检查能否重构逻辑，而不是猜选项。',
    sourceHint: '回忆作者如何限定结论成立的条件。',
    evidenceQuote: '结论依赖于条件是否仍然成立',
    evidenceLocator: '第 4 段，条件讨论处'
  }, 0);

  assert.equal(question.answerMode, 'open');
  assert.equal(question.type, 'transfer');
  assert.equal(question.options.length, 0);
  assert.equal(question.correct, null);
  assert.equal(question.expectedAnswer, '应先检查关键前提是否仍然成立，再迁移结论。');
  assert.equal(question.evidenceLocator, '第 4 段，条件讨论处');
});

test('formatMistakesAsAnkiCsv escapes CSV and includes evidence context', () => {
  const csv = formatMistakesAsAnkiCsv([{
    question: '为什么作者说 "熟悉" 不等于理解？',
    userChoice: '因为读得不够多',
    correctAnswer: '因为没有完成主动检索',
    explanation: '把输入流畅度误当成可检索理解。',
    evidenceQuote: '熟悉感很容易被误认为理解',
    evidenceLocator: '动机部分第 2 段',
    sourceTitle: 'Focus Quiz Demo',
    sourceUrl: 'https://example.com/demo',
    timestamp: new Date('2026-04-29T08:00:00Z').getTime()
  }]);

  assert.match(csv, /^Front,Back,Source,Evidence,Tags\n/);
  assert.match(csv, /""熟悉"" 不等于理解/);
  assert.match(csv, /动机部分第 2 段/);
  assert.match(csv, /focus-quiz/);
});
