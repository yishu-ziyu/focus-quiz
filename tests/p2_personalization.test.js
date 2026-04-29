const assert = require('node:assert/strict');
const test = require('node:test');

const {
  classifyArticleForP2,
  buildP2QuestionPlan
} = require('../sidepanel-logic.js');

require('../learning-profile.js');
const Learning = globalThis.FocusQuizLearning;

test('classifyArticleForP2 returns explainable article type signals', () => {
  const analysis = classifyArticleForP2(`
    摘要：本文研究平台算法对劳动者匹配效率的影响。
    方法部分使用双重差分模型，并报告样本、变量、稳健性检验和异质性结果。
  `);

  assert.equal(analysis.id, 'paper');
  assert.equal(analysis.label, '论文型');
  assert.equal(analysis.primaryDemand, 'counterfactual');
  assert.ok(analysis.signals.some((signal) => signal.includes('方法')));
});

test('buildP2QuestionPlan targets the overlap between article demand and weak dimension', () => {
  const profile = {
    enoughData: true,
    weakestDimension: 'transfer_ability',
    weakestLabel: '迁移应用',
    targetDifficulty: 'easy'
  };
  const article = classifyArticleForP2('这是一个方法型教程：第一步建立框架，第二步迁移到具体项目，最后复盘适用边界。');

  const plan = buildP2QuestionPlan(profile, article);

  assert.equal(plan.questionCount, 1);
  assert.deepEqual(plan.focus, ['transfer']);
  assert.match(plan.reason, /迁移应用/);
  assert.match(plan.personalizationLine, /换场景/);
});

test('learning profile exposes natural language advice after cold start', () => {
  const events = [
    { dimension: 'transfer_ability', isCorrect: false, latencyMs: 43000 },
    { dimension: 'transfer_ability', isCorrect: false, latencyMs: 39000 },
    { dimension: 'transfer_ability', isCorrect: true, latencyMs: 62000 },
    { dimension: 'concept_boundary', isCorrect: true, latencyMs: 12000 },
    { dimension: 'concept_boundary', isCorrect: true, latencyMs: 14000 },
    { dimension: 'causal_reasoning', isCorrect: true, latencyMs: 16000 }
  ];

  const profile = Learning.buildProfile(events);

  assert.equal(profile.enoughData, true);
  assert.equal(profile.weakestDimension, 'transfer_ability');
  assert.match(profile.advice, /换场景/);
});
