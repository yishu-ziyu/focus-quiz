// Learning profile engine for Focus Quiz.
// This is intentionally heuristic and explainable; it is not a clinical or
// psychometric assessment.

const FQ_EVENT_LIMIT = 500;
const FQ_COLD_START_ATTEMPTS = 6;
const FQ_DIMENSIONS = {
  trap: {
    id: 'concept_boundary',
    label: '概念边界',
    weakPrompt: '概念陷阱题需要降低抽象度，重点考察定义边界、相似概念混淆和常见望文生义。'
  },
  counterfactual: {
    id: 'causal_reasoning',
    label: '因果推演',
    weakPrompt: '反事实题需要保留变量变化，但先限定关键前提，避免一次改变太多条件。'
  },
  transfer: {
    id: 'transfer_ability',
    label: '迁移应用',
    weakPrompt: '场景迁移题需要先做近迁移，再做远迁移，避免直接跳到完全陌生领域。'
  }
};

function fqHashText(text) {
  let hash = 0;
  const input = String(text || '');
  for (let i = 0; i < input.length; i += 1) {
    hash = ((hash << 5) - hash) + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

function fqLatencyScore(ms) {
  if (!Number.isFinite(ms) || ms <= 0) return 50;
  const seconds = ms / 1000;
  if (seconds <= 10) return 100;
  if (seconds <= 25) return 75;
  if (seconds <= 45) return 55;
  if (seconds <= 75) return 35;
  return 20;
}

function fqMean(values) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function fqBuildProfile(events) {
  const recentEvents = Array.isArray(events) ? events.slice(-120) : [];
  const dimensions = {};

  Object.values(FQ_DIMENSIONS).forEach((dimension) => {
    const dimEvents = recentEvents.filter((event) => event.dimension === dimension.id).slice(-40);
    const attempts = dimEvents.length;

    if (attempts === 0) {
      dimensions[dimension.id] = {
        id: dimension.id,
        label: dimension.label,
        score: null,
        attempts: 0,
        accuracy: null,
        confidence: 'none'
      };
      return;
    }

    const correctRate = fqMean(dimEvents.map((event) => event.isCorrect ? 1 : 0));
    const correctLatencyScores = dimEvents
      .filter((event) => event.isCorrect)
      .map((event) => fqLatencyScore(event.latencyMs));
    const latency = correctLatencyScores.length ? fqMean(correctLatencyScores) : 20;
    const lastFive = dimEvents.slice(-5);
    const recentAccuracy = fqMean(lastFive.map((event) => event.isCorrect ? 1 : 0));
    const stability = Math.max(0, 100 - Math.abs(correctRate - recentAccuracy) * 100);
    const score = Math.round((correctRate * 70) + (latency * 0.15) + (stability * 0.15));

    dimensions[dimension.id] = {
      id: dimension.id,
      label: dimension.label,
      score: Math.max(0, Math.min(100, score)),
      attempts,
      accuracy: Math.round(correctRate * 100),
      confidence: attempts >= 10 ? 'high' : attempts >= 5 ? 'medium' : 'low'
    };
  });

  const scored = Object.values(dimensions).filter((dimension) => Number.isFinite(dimension.score));
  const overall = scored.length ? Math.round(fqMean(scored.map((dimension) => dimension.score))) : null;
  const weakest = scored.length
    ? scored.slice().sort((a, b) => a.score - b.score || b.attempts - a.attempts)[0]
    : null;
  const totalAttempts = recentEvents.length;
  const recentCorrect = fqMean(recentEvents.slice(-12).map((event) => event.isCorrect ? 1 : 0));
  const recentLatency = fqMean(recentEvents.slice(-12).map((event) => fqLatencyScore(event.latencyMs)));

  let targetDifficulty = 'medium';
  if (totalAttempts < FQ_COLD_START_ATTEMPTS) {
    targetDifficulty = 'medium';
  } else if (weakest && weakest.score < 50) {
    targetDifficulty = 'easy';
  } else if (recentCorrect >= 0.8 && recentLatency >= 70) {
    targetDifficulty = 'hard';
  }

  return {
    updatedAt: Date.now(),
    totalAttempts,
    overall,
    dimensions,
    weakestDimension: weakest?.id || null,
    weakestLabel: weakest?.label || null,
    targetDifficulty,
    enoughData: totalAttempts >= FQ_COLD_START_ATTEMPTS,
    summary: fqProfileSummary(overall, totalAttempts, weakest, targetDifficulty),
    advice: fqProfileAdvice(totalAttempts, weakest)
  };
}

function fqProfileSummary(overall, totalAttempts, weakest, targetDifficulty) {
  if (totalAttempts < 3) return '样本不足。先完成几轮测试，系统会开始判断你的理解结构。';
  if (totalAttempts < FQ_COLD_START_ATTEMPTS) return `正在冷启动。完成 ${FQ_COLD_START_ATTEMPTS} 道题后，系统会开始给出自适应判断。`;
  const difficultyText = {
    easy: '下一轮会降低抽象跨度，先稳住薄弱能力。',
    medium: '下一轮会保持必要难度，继续制造适度认知阻力。',
    hard: '下一轮会提高干扰项质量和迁移跨度。'
  }[targetDifficulty];
  if (!weakest) return difficultyText;
  return `当前最需要训练的是${weakest.label}。${difficultyText}`;
}

function fqProfileAdvice(totalAttempts, weakest) {
  if (totalAttempts < FQ_COLD_START_ATTEMPTS) {
    return '先完成冷启动，系统不会过早给你贴标签。';
  }
  const advice = {
    concept_boundary: '你不是读得少，而是概念边界还没有压实。',
    causal_reasoning: '你不是没看懂结论，而是条件一变，因果链就容易断。',
    transfer_ability: '你不是记不住，而是换场景后还不能重构概念。'
  };
  return advice[weakest?.id] || '当前没有明显单一短板，继续用少量题维持理解压力。';
}

function fqAdaptivePrompt(profile) {
  if (!profile || !profile.enoughData) {
    return [
      '# Adaptive Question Dose',
      '- 当前用户样本不足，使用冷启动策略：生成 3 道题。',
      '- 3 道题需要形成梯度：概念边界 -> 因果/反事实 -> 场景迁移。',
      '- strategy.questionCount 必须是 3。',
      '- 不要为了刁难而刁难，目标是制造恰到好处的认知阻力。'
    ].join('\n');
  }

  const weakEntry = Object.values(FQ_DIMENSIONS).find((dimension) => dimension.id === profile.weakestDimension);
  const difficultyRules = {
    easy: '降低抽象跨度，选项要清晰但仍包含一个高质量干扰项。',
    medium: '保持中等难度，干扰项要来自真实误解而不是明显错误。',
    hard: '提高难度，减少原文复述，要求用户重构因果链并完成远迁移。'
  };

  return [
    '# Adaptive Question Dose',
    `- 用户当前目标难度: ${profile.targetDifficulty}。${difficultyRules[profile.targetDifficulty]}`,
    weakEntry ? `- 用户当前薄弱维度: ${weakEntry.label}。${weakEntry.weakPrompt}` : '- 用户暂无明确薄弱维度。',
    '- 先判断文章的主要认知要求，再选择 1-3 道题，而不是机械固定三题。',
    '- 如果文章强烈命中用户薄弱维度，可以只生成 1 道高质量靶向题，降低启动成本并切中要害。',
    '- 如果文章同时涉及两个关键维度，生成 2 道题。',
    '- 如果文章结构复杂、维度不明确、或需要重新校准画像，生成 3 道题形成完整梯度。',
    '- strategy.questionCount 必须等于 questions.length，且只能是 1、2、3。',
    '- 题目必须有助于学习，不要制造无意义的文字游戏。'
  ].join('\n');
}

function fqDiagnoseSession(answers, profile, strategy = {}) {
  const answered = Array.isArray(answers) ? answers.filter(Boolean) : [];
  const total = answered.length;
  const correct = answered.filter((answer) => answer.isCorrect).length;
  const byType = Object.fromEntries(answered.map((answer) => [answer.type, answer]));
  const wrongTypes = answered.filter((answer) => !answer.isCorrect).map((answer) => answer.type);
  const weakLabels = wrongTypes.map((type) => FQ_DIMENSIONS[type]?.label).filter(Boolean);

  let status = '样本不足';
  let detail = '先完成本轮题目，系统会根据你的作答结构给出判断。';

  if (total === 1) {
    if (correct === 1) {
      status = '靶向通过';
      detail = '这轮只检查一个关键断点，你完成了这次最小剂量的主动回忆。';
    } else {
      status = '关键断点暴露';
      detail = '这轮题量很少，但正好命中一个薄弱环节。建议顺着错题回到原文，重读相关论证。';
    }
  } else if (total === 2) {
    if (correct === 2) {
      status = '双点通过';
      detail = '你通过了本轮两个关键维度的压力测试，说明这篇文章的核心逻辑已经比较稳。';
    } else if (correct === 1) {
      status = '局部断点';
      detail = '你在一个维度上站住了，但另一个维度仍然暴露理解缺口。';
    } else {
      status = '双点失守';
      detail = '这篇文章的关键逻辑还没有进入可检索状态，建议回到原文重新梳理定义和条件。';
    }
  } else if (total >= 3) {
    if (correct <= 1 || byType.trap?.isCorrect === false) {
      status = '表层读过';
      detail = '你可能保留了文章印象，但概念边界还没有稳住。建议先回到原文重看核心定义。';
    } else if (byType.trap?.isCorrect && (!byType.counterfactual?.isCorrect || !byType.transfer?.isCorrect)) {
      status = '局部理解';
      detail = '你能识别概念，但条件变化或迁移场景仍会暴露理解断点。';
    } else if (byType.trap?.isCorrect && byType.counterfactual?.isCorrect && !byType.transfer?.isCorrect) {
      status = '逻辑掌握';
      detail = '你理解了文章内部逻辑，但还没有稳定迁移到陌生情境。';
    } else if (correct === total) {
      status = '可迁移使用';
      detail = '你不仅读过文章，也能在反事实和新场景中重构它的逻辑。';
    }
  }

  const recommendation = weakLabels.length
    ? `下一轮优先训练：${Array.from(new Set(weakLabels)).join('、')}。`
    : (profile?.summary || '继续保持三类题目的梯度训练。');
  const strategyReason = typeof strategy?.reason === 'string' && strategy.reason.trim()
    ? `本轮出题策略：${strategy.reason.trim()}`
    : '';

  return {
    status,
    detail,
    recommendation: strategyReason ? `${recommendation} ${strategyReason}` : recommendation,
    correct,
    total,
    weakTypes: wrongTypes
  };
}

async function fqLoadLearningState() {
  const result = await chrome.storage.local.get(['answerEvents', 'learningProfile']);
  const events = Array.isArray(result.answerEvents) ? result.answerEvents : [];
  const profile = result.learningProfile || fqBuildProfile(events);
  return { events, profile };
}

async function fqRecordAnswerEvent(event) {
  const result = await chrome.storage.local.get(['answerEvents']);
  const events = Array.isArray(result.answerEvents) ? result.answerEvents : [];
  events.push({
    ...event,
    timestamp: event.timestamp || Date.now()
  });
  const trimmedEvents = events.slice(-FQ_EVENT_LIMIT);
  const learningProfile = fqBuildProfile(trimmedEvents);
  await chrome.storage.local.set({ answerEvents: trimmedEvents, learningProfile });
  return learningProfile;
}

globalThis.FocusQuizLearning = {
  dimensions: FQ_DIMENSIONS,
  hashText: fqHashText,
  loadLearningState: fqLoadLearningState,
  recordAnswerEvent: fqRecordAnswerEvent,
  buildProfile: fqBuildProfile,
  adaptivePrompt: fqAdaptivePrompt,
  diagnoseSession: fqDiagnoseSession
};
