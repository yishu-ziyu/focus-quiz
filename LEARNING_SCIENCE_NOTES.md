# Focus Quiz 的一点学习科学依据

这不是一份严格的文献综述，而是一份产品设计备忘：为什么 Focus Quiz 不做摘要，而是做有阻力的问题；为什么冷启动先用三道题；为什么后续应该进入自适应题量；为什么答错后要能回到原文。

## 1. 主动回忆比“再看一遍”更能暴露理解

很多阅读工具默认的方向是“帮我总结”。但总结容易制造一种熟悉感：我看到了重点，所以我以为自己理解了。

Focus Quiz 更接近 retrieval practice，也就是主动回忆。用户读完文章后，不是马上看答案，而是先被迫从脑中调取文章的逻辑。调取不出来，就说明文章还没有真正进入自己的理解结构。

这个方向有比较强的学习科学支持。Dunlosky 等人在 2013 年对常见学习方法做综述时，把 practice testing 评为高效学习技术之一。Roediger 和 Karpicke 关于 test-enhanced learning 的研究也说明，测试不只是测量记忆，它本身也能促进长期保持。

产品翻译：

- 不先总结。
- 先提问。
- 让用户先暴露“我以为我懂了”的断点。

## 2. 困难要有用，而不是单纯刁难

Focus Quiz 的题目不应该只是难，而应该是“必要难度”。Bjork 的 desirable difficulties 讲的是：有些学习活动会让当下表现变差、感觉更费力，但会带来更好的长期保持和迁移。

这里的关键是“desirable”。困难必须迫使用户做有价值的认知工作，比如重新回忆、解释、区分概念、迁移应用。如果困难只是文字游戏、冷知识、模型故意绕弯，那就不是有效负荷，而是挫败感。

产品翻译：

- 题目要有阻力，但不能为了刁难而刁难。
- 错误选项应该来自真实误解，而不是低质量陷阱。
- 解释要指出思维断裂点，而不是只说“正确答案是 A”。

## 3. 认知负荷理论提醒我们：题不能太多

读一篇复杂文章时，用户已经在处理大量概念、论证、例子和上下文。认知负荷理论强调，工作记忆容量有限；复杂材料中的元素交互越多，越容易让学习者过载。

所以 Focus Quiz 不能把“阅读后自测”做成一张完整试卷。那会让用户觉得：我本来只是想读篇文章，为什么突然被拉进考试？一旦额外负担超过收益，用户就会退出。

产品翻译：

- 问题数量要克制。
- 三道题是冷启动最小闭环，不是完整考试。
- 目标是完成一次短促但有效的理解检查。

## 4. 为什么冷启动是三道题

两道题不够，因为它通常只能覆盖“概念”和“推理”，缺少迁移。

四道、五道甚至更多题也可以更全面，但会提高启动成本。用户刚读完文章时，最重要的是让他愿意开始测试，而不是让他觉得这是另一项任务。

三道题刚好覆盖三个层次：

1. **概念陷阱**：你有没有误读核心概念？
2. **反事实推演**：你有没有理解条件和因果链？
3. **场景迁移**：你能不能离开原文使用这套逻辑？

这三道题构成一个最小闭环：概念、逻辑、迁移。

但这个结论只适合冷启动。系统还不了解用户时，需要用三道题建立第一轮诊断坐标。一旦系统开始知道用户在哪类题上容易断裂，题量就应该跟着变。

## 5. 为什么个性化后可以只出一道题

如果用户长期在“场景迁移”上不稳，而当前文章本身又是一个迁移性很强的概念文章，那么本轮最有价值的问题可能只有一个：一题迁移。

这不是偷懒，而是更精确的最小有效剂量。它有两个好处：

- 降低行动成本：用户更愿意开始。
- 提高命中率：题目正好打在薄弱维度上。

所以 Focus Quiz 的理想状态不是“永远三题”，而是“冷启动三题，成熟后自适应”。三题负责建立画像，一题或两题负责靶向训练。

## 6. 题目太多会降低行动意愿

这里还可以借一点行为科学的直觉。Iyengar 和 Lepper 关于 choice overload 的研究提醒我们：更多选择或任务不一定带来更多行动，反而可能让人犹豫、疲惫或放弃。

Focus Quiz 面对的是一个刚读完文章的人。这个人可能已经有点累了。如果立刻给他十道题，他会想：算了，我下次再做。三道题的优势是承诺感低，但诊断价值足够。

产品翻译：

- 低启动成本。
- 快速完成。
- 完成后给出诊断，而不是制造作业感。

## 7. 为什么错题要链接回原文

用户愿意对某篇文章做题，说明这篇文章本来就对他有价值。做错题不是一个孤立事件，而是一个信号：这篇文章里有一段逻辑还没有被真正理解。

所以错题本不应该只保存题目。它应该保存回到原文的路径。复习错题时，用户可以重新打开那篇文章，再读一次原来的论证。这样错题不是一个失败记录，而是一个重新进入原文的入口。

产品翻译：

- 错题保存原文标题和 URL。
- 复习错题时可以回到文章现场。
- 让“犯错”变成“重读”的触发器。

## 8. 分享会上的一句话版本

Focus Quiz 的设计不是为了把阅读变成考试，而是为了在阅读结束后加一个很短的认知阻力。冷启动时，三道题分别检查概念、逻辑和迁移；积累画像后，它可以只出一道最命中你薄弱维度的题。答错之后还能回到原文，是因为这篇文章本来就是你选择认真读的东西，重读它本身就是学习的一部分。

## 9. 一篇最接近“三题”设计的研究

如果要找一篇非常贴近“题目数量”的论文，最接近的是 Pitt 和 Huebner 的 *Retrieval Practice Improves Exam Performance as a Function of Review Question Number and Format*。

这篇研究不是直接研究“读完一篇文章后做三道题是否最优”，所以不能被过度引用成“科学证明三题最好”。但它的研究问题非常接近：review question 的格式和数量会不会影响学习效果。

这项研究在物理治疗教育课程中做了随机对照设计，把考试题对应到不同复习条件：无复习、开放式复习题、以及不同数量的选择题复习题。结果显示，开放题和选择题复习都能提高考试表现；其中，提供超过一道选择题时，考试表现提升最大。作者也讨论到题量和效果之间可能不是无限线性增长，而可能存在收益饱和。

这给 Focus Quiz 的启发是：

- 一道题可能太少，只能触发一次局部回忆。
- 多于一道题可以形成更稳定的 retrieval practice。
- 但题目数量不是越多越好，题量增加会带来时间成本和认知负担。
- 冷启动三道题可以被解释为一个轻量产品选择：比一道题更可靠，又不把文章阅读变成完整考试。
- 个性化后的一题靶向训练可以被解释为另一种最小有效剂量：少做题，但做最该做的题。

分享会可以这样说：

> 我没有找到一篇论文严格证明“读完文章后三道题就是最优”。但有研究专门看 review question 的数量，发现超过一道选择题后学习收益明显增加，同时题量收益可能会饱和。我的产品选择是把这个证据和认知负荷理论结合起来：冷启动时用三道题建立概念、逻辑、迁移的最小闭环；个性化之后，再把题量压缩到最能命中用户薄弱点的一到两道题。

## References

- Pitt, J., & Huebner, B. (2025). *Retrieval Practice Improves Exam Performance as a Function of Review Question Number and Format*. Journal of Physical Therapy Education.  
  https://pubmed.ncbi.nlm.nih.gov/38838277/

- Dunlosky, J., Rawson, K. A., Marsh, E. J., Nathan, M. J., & Willingham, D. T. (2013). *Improving Students' Learning With Effective Learning Techniques*. Psychological Science in the Public Interest.  
  https://www.psychologicalscience.org/publications/journals/pspi/learning-techniques.html

- Roediger, H. L., & Karpicke, J. D. (2006). *Test-Enhanced Learning: Taking Memory Tests Improves Long-Term Retention*. Psychological Science.  
  https://journals.sagepub.com/doi/pdf/10.1111/j.1467-9280.2006.01693.x

- Bjork / desirable difficulties related discussion and review.  
  https://pmc.ncbi.nlm.nih.gov/articles/PMC12432286/

- Cognitive Load Theory and element interactivity.  
  https://link.springer.com/article/10.1007/s10648-023-09782-w

- Iyengar, S. S., & Lepper, M. R. (2000). *When Choice is Demotivating: Can One Desire Too Much of a Good Thing?*  
  https://www.decisionskills.com/uploads/5/1/6/0/5160560/iyengar_2000_when_choice_is_demotivating.pdf
