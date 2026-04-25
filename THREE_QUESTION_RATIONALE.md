# 为什么 Focus Quiz 只设计三道题

## 产品判断

Focus Quiz 的目标不是把文章变成一套完整试卷，而是在用户读完文章后，用最小的额外动作判断“我是真的理解了，还是只是看过了”。

如果题目太少，测不出结构性理解；如果题目太多，用户会觉得自己本来只是想读一篇文章，却被迫进入考试状态，最终可能直接放弃。所以三道题是一个折中：足够形成梯度，又不至于压垮阅读后的行动意愿。

## 三道题对应三种认知操作

1. **概念陷阱**：检查概念边界是否清楚。
   - 典型失败：望文生义、把相似概念混为一谈、抓住词语但没抓住定义。

2. **反事实推演**：检查因果链和条件关系是否清楚。
   - 典型失败：知道作者结论，但不知道结论依赖哪些前提。

3. **场景迁移**：检查能否离开原文语境重新使用这套逻辑。
   - 典型失败：在原文里看懂了，一换场景就不会用了。

这三题不是并列的三道阅读理解题，而是从“识别概念”到“重构关系”再到“迁移应用”的梯度。

## 为什么不是更多题

从认知负荷理论看，阅读一篇文章后，用户的工作记忆已经处理了大量信息。此时如果继续追加很多题，题目本身会成为额外任务负担。额外负担不一定带来学习收益，反而可能让用户退出。

从“必要难度 / desirable difficulty”的角度看，好的困难应该迫使用户进行有价值的回忆、推理和重构；但困难必须仍然可承受。三道题的设计意图是制造有效负荷，而不是制造挫败感。

从行为设计看，用户不是来考试的，而是来确认自己是否读懂了。过多题目会提高启动成本，类似选择过载：选择或任务越多，不一定越能促进行动，反而可能降低完成率。

## 为什么不是两道题

两道题可以覆盖“概念 + 反事实”，但会缺少迁移应用。没有迁移题，产品就容易退化成普通阅读理解：用户可能知道文章说了什么，却不知道这套逻辑能不能离开原文使用。

第三题是 Focus Quiz 和普通 quiz 的分界线：它要求用户把文章逻辑从原语境中剥离出来，放进新场景里重新推导。这正是“读懂”和“可用”的区别。

## 研究依据

- 最接近“三题数量”这个问题的是 Pitt 和 Huebner 的研究。它不是文章阅读场景，也没有证明“三题严格最优”，但它直接研究 review question 的数量与效果：超过一道选择题时，学习表现提升最大，同时也提示题量收益可能存在饱和。这可以支持“三题是最小有效剂量”的产品解释。
- Dunlosky 等人在 2013 年对常见学习技术的综述中，将 practice testing / retrieval practice 评为高效学习技术之一；这支持 Focus Quiz 用主动回忆替代重复阅读。
- Roediger 与 Karpicke 的 test-enhanced learning 研究支持“测试本身能增强长期保持”，这对应产品中的三题压力测试。
- Bjork 的 desirable difficulties 框架说明：适度增加学习难度可以提升长期保持和迁移，但困难必须是有益且可承受的。
- Cognitive Load Theory 强调工作记忆容量有限，复杂材料中元素交互过多会导致过载；这支持题量克制，不把文章阅读后体验变成完整考试。
- Iyengar 与 Lepper 的 choice overload 研究提醒：更多选项或任务不总是提高行动，过多选择可能降低完成意愿；这支持短而明确的题组设计。

参考：

- Pitt & Huebner (2025), Retrieval Practice Improves Exam Performance as a Function of Review Question Number and Format: https://pubmed.ncbi.nlm.nih.gov/38838277/
- Dunlosky et al. (2013), Improving Students' Learning With Effective Learning Techniques: https://www.psychologicalscience.org/publications/journals/pspi/learning-techniques.html
- Roediger & Karpicke (2006), Test-Enhanced Learning: https://journals.sagepub.com/doi/pdf/10.1111/j.1467-9280.2006.01693.x
- Desirable difficulty discussion and recent review: https://pmc.ncbi.nlm.nih.gov/articles/PMC12432286/
- Cognitive Load Theory and element interactivity: https://link.springer.com/article/10.1007/s10648-023-09782-w
- Iyengar & Lepper (2000), When Choice is Demotivating: https://www.decisionskills.com/uploads/5/1/6/0/5160560/iyengar_2000_when_choice_is_demotivating.pdf

## 分享会表达版本

我没有把它设计成十道题，是因为这不是考试软件。用户刚读完一篇文章，认知资源已经被占用了。如果再让他做一整套题，他很可能直接放弃。

所以我选择三道题：第一题看概念有没有误读，第二题看因果关系能不能被反事实检验，第三题看能不能迁移到新场景。三道题刚好构成一个最小闭环：概念、逻辑、迁移。它给用户一点认知阻力，但不会把阅读体验变成负担。

更口语化的分享会补充材料见 [LEARNING_SCIENCE_NOTES.md](./LEARNING_SCIENCE_NOTES.md)。
