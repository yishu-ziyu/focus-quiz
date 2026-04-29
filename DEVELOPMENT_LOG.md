# Development Log

Auto-updated by git hooks. Each commit appends an entry under the corresponding date.

## 2026-02-25

- [manual-sync] Working snapshot
  - Time: 2026-02-25 13:34:39 +0800
  - Branch: main
  - Last commit: 979d0cd chore: add auto-synced development log workflow
  - Pending changes:
    -  M scripts/devlog_sync.sh
    - ?? assets/
    - ?? background.js
    - ?? eval_prd.md
    - ?? icon48.png
    - ?? manifest.json
    - ?? options.html
    - ?? options.js
    - ?? providers.js
    - ?? sidepanel.html
    - ?? sidepanel.js
    - ?? src/

- [1b5f7a6] feat: ship mature focus-quiz extension with robust ollama integration
  - Time: 2026-02-25 13:37:31 +0800
  - Stats: 21 files changed, 2217 insertions(+), 2 deletions(-)
  - Files:
    - DEVELOPMENT_LOG.md
    - README.md
    - assets/icons/icon128.png
    - assets/icons/icon16.png
    - assets/icons/icon48.png
    - background.js
    - eval_prd.md
    - icon48.png
    - manifest.json
    - options.html
    - options.js
    - providers.js
    - scripts/devlog_sync.sh
    - sidepanel.html
    - sidepanel.js
    - src/background/service-worker.js
    - src/lib/llm-client.js
    - src/options/options.html
    - src/options/options.js
    - src/sidepanel/index.html
    - src/sidepanel/index.js

- [de8c777] chore: keep development log synced within each commit
  - Time: 2026-02-25 13:38:38 +0800
  - Stats: 2 files changed, 40 insertions(+)
  - Files:
    - .githooks/post-commit
    - DEVELOPMENT_LOG.md

- [6b9608e] chore: stabilize post-commit development log sync
  - Time: 2026-02-25 13:40:24 +0800
  - Stats: 2 files changed, 15 insertions(+), 5 deletions(-)
  - Files:
    - .githooks/post-commit
    - DEVELOPMENT_LOG.md

- [febb65b] chore: add daily development log review helper
  - Time: 2026-02-25 13:42:35 +0800
  - Stats: 2 files changed, 18 insertions(+)
  - Files:
    - README.md
    - scripts/devlog_today.sh

- [e711b24] chore: clean bootstrap entries in development log
  - Time: 2026-02-25 13:43:57 +0800
  - Stats: 1 file changed, 28 deletions(-)
  - Files:
    - DEVELOPMENT_LOG.md

- Commit: chore: make devlog entries stable under auto-amend
  - Time: 2026-02-25 13:45:31 +0800
  - Stats: 2 files changed, 4 insertions(+), 5 deletions(-)
  - Files:
    - DEVELOPMENT_LOG.md
    - scripts/devlog_append.sh

- Commit: docs: Rewrite README with PM-driven product positioning and multi-model support details
  - Time: 2026-02-25 13:55:07 +0800
  - Stats: 1 file changed, 70 insertions(+), 19 deletions(-)
  - Files:
    - README.md

## 2026-04-25

- [manual-sync] Working snapshot
  - Time: 2026-04-25 13:53:33 +0800
  - Branch: main
  - Last commit: f458a69 docs: Rewrite README with PM-driven product positioning and multi-model support details
  - Pending changes:
    -  M README.md
    -  M assets/icons/icon128.png
    -  M assets/icons/icon16.png
    -  M assets/icons/icon48.png
    -  M background.js
    -  M eval_prd.md
    -  D icon48.png
    -  M manifest.json
    -  M providers.js
    -  M sidepanel.html
    -  M sidepanel.js
    -  D src/background/service-worker.js
    -  D src/lib/llm-client.js
    -  D src/options/options.html
    -  D src/options/options.js
    -  D src/sidepanel/index.html
    -  D src/sidepanel/index.js
    - ?? RELEASE_CHECKLIST.md

- Commit: chore: prepare focus quiz for release testing
  - Time: 2026-04-25 14:39:38 +0800
  - Stats: 19 files changed, 230 insertions(+), 686 deletions(-)
  - Files:
    - DEVELOPMENT_LOG.md
    - README.md
    - RELEASE_CHECKLIST.md
    - assets/icons/icon128.png
    - assets/icons/icon16.png
    - assets/icons/icon48.png
    - background.js
    - eval_prd.md
    - icon48.png
    - manifest.json
    - providers.js
    - sidepanel.html
    - sidepanel.js
    - src/background/service-worker.js
    - src/lib/llm-client.js
    - src/options/options.html
    - src/options/options.js
    - src/sidepanel/index.html
    - src/sidepanel/index.js

- [manual-sync] Working snapshot
  - Time: 2026-04-25 20:32:18 +0800
  - Branch: main
  - Last commit: d97071e chore: prepare focus quiz for release testing
  - Pending changes:
    -  M README.md
    -  M RELEASE_CHECKLIST.md
    -  M eval_prd.md
    -  M manifest.json
    -  M options.html
    -  M options.js
    -  M providers.js
    -  M sidepanel.html
    - ?? provider-presets.js

- Commit: feat: add provider registry and custom model gateways
  - Time: 2026-04-25 20:32:44 +0800
  - Stats: 10 files changed, 602 insertions(+), 415 deletions(-)
  - Files:
    - DEVELOPMENT_LOG.md
    - README.md
    - RELEASE_CHECKLIST.md
    - eval_prd.md
    - manifest.json
    - options.html
    - options.js
    - provider-presets.js
    - providers.js
    - sidepanel.html

- [manual-sync] Working snapshot
  - Time: 2026-04-25 21:23:43 +0800
  - Branch: main
  - Last commit: c80afee feat: add provider registry and custom model gateways
  - Pending changes:
    -  M README.md
    -  M RELEASE_CHECKLIST.md
    -  M background.js
    -  M eval_prd.md
    -  M sidepanel.html
    -  M sidepanel.js
    - ?? learning-profile.js

- Commit: feat: add adaptive learning profile
  - Time: 2026-04-25 21:23:50 +0800
  - Stats: 8 files changed, 450 insertions(+), 10 deletions(-)
  - Files:
    - DEVELOPMENT_LOG.md
    - README.md
    - RELEASE_CHECKLIST.md
    - background.js
    - eval_prd.md
    - learning-profile.js
    - sidepanel.html
    - sidepanel.js

- [manual-sync] Working snapshot
  - Time: 2026-04-25 21:44:40 +0800
  - Branch: main
  - Last commit: 533d18d feat: add adaptive learning profile
  - Pending changes:
    -  M README.md
    -  M RELEASE_CHECKLIST.md
    -  M background.js
    -  M manifest.json
    -  M sidepanel.html
    -  M sidepanel.js
    - ?? THREE_QUESTION_RATIONALE.md

- Commit: feat: add full-page quiz and source backlinks
  - Time: 2026-04-25 21:45:17 +0800
  - Stats: 8 files changed, 199 insertions(+), 6 deletions(-)
  - Files:
    - DEVELOPMENT_LOG.md
    - README.md
    - RELEASE_CHECKLIST.md
    - THREE_QUESTION_RATIONALE.md
    - background.js
    - manifest.json
    - sidepanel.html
    - sidepanel.js

- [manual-sync] Working snapshot
  - Time: 2026-04-25 21:54:56 +0800
  - Branch: main
  - Last commit: 74d91a1 feat: add full-page quiz and source backlinks
  - Pending changes:
    -  M README.md
    -  M THREE_QUESTION_RATIONALE.md
    - ?? LEARNING_SCIENCE_NOTES.md

- Commit: docs: add learning science notes
  - Time: 2026-04-25 21:54:56 +0800
  - Stats: 4 files changed, 136 insertions(+)
  - Files:
    - DEVELOPMENT_LOG.md
    - LEARNING_SCIENCE_NOTES.md
    - README.md
    - THREE_QUESTION_RATIONALE.md

- [manual-sync] Working snapshot
  - Time: 2026-04-25 22:11:29 +0800
  - Branch: main
  - Last commit: 255848e docs: add learning science notes
  - Pending changes:
    -  M LEARNING_SCIENCE_NOTES.md
    -  M README.md
    -  M RELEASE_CHECKLIST.md
    -  M THREE_QUESTION_RATIONALE.md
    -  M learning-profile.js
    -  M sidepanel.html
    -  M sidepanel.js
    - ?? SHARE_TALK_DRAFT.md

- Commit: feat: add adaptive question dose
  - Time: 2026-04-25 22:12:16 +0800
  - Stats: 9 files changed, 281 insertions(+), 36 deletions(-)
  - Files:
    - DEVELOPMENT_LOG.md
    - LEARNING_SCIENCE_NOTES.md
    - README.md
    - RELEASE_CHECKLIST.md
    - SHARE_TALK_DRAFT.md
    - THREE_QUESTION_RATIONALE.md
    - learning-profile.js
    - sidepanel.html
    - sidepanel.js

- [manual-sync] Working snapshot
  - Time: 2026-04-25 23:55:29 +0800
  - Branch: main
  - Last commit: 19316c7 feat: add adaptive question dose
  - Pending changes:
    -  M options.html
    -  M options.js
    -  M sidepanel.html
    -  M sidepanel.js

- Commit: style: refine academic paper interface
  - Time: 2026-04-25 23:55:42 +0800
  - Stats: 5 files changed, 222 insertions(+), 112 deletions(-)
  - Files:
    - DEVELOPMENT_LOG.md
    - options.html
    - options.js
    - sidepanel.html
    - sidepanel.js

- [manual-sync] Working snapshot
  - Time: 2026-04-25 23:59:57 +0800
  - Branch: main
  - Last commit: 1f58239 style: refine academic paper interface
  - Pending changes:
    -  M README.md
    - ?? PRODUCT_STRATEGY_NEXT.md

- Commit: docs: add product strategy roadmap
  - Time: 2026-04-25 23:59:58 +0800
  - Stats: 3 files changed, 231 insertions(+)
  - Files:
    - DEVELOPMENT_LOG.md
    - PRODUCT_STRATEGY_NEXT.md
    - README.md

## 2026-04-26

- [manual-sync] Working snapshot
  - Time: 2026-04-26 00:06:38 +0800
  - Branch: main
  - Last commit: e645942 docs: add product strategy roadmap
  - Pending changes:
    -  M README.md
    -  M RELEASE_CHECKLIST.md
    -  M sidepanel.html
    -  M sidepanel.js
    - ?? RELEASE_EXECUTION_PLAN.md

- Commit: feat: add evidence-backed mistakes export
  - Time: 2026-04-26 00:06:50 +0800
  - Stats: 6 files changed, 272 insertions(+), 16 deletions(-)
  - Files:
    - DEVELOPMENT_LOG.md
    - README.md
    - RELEASE_CHECKLIST.md
    - RELEASE_EXECUTION_PLAN.md
    - sidepanel.html
    - sidepanel.js

- [manual-sync] Working snapshot
  - Time: 2026-04-26 01:14:16 +0800
  - Branch: main
  - Last commit: 571840c feat: add evidence-backed mistakes export
  - Pending changes:
    -  M PRODUCT_STRATEGY_NEXT.md
    -  M README.md
    -  M RELEASE_CHECKLIST.md
    -  M RELEASE_EXECUTION_PLAN.md
    -  M sidepanel.html
    -  M sidepanel.js

- Commit: fix: hide evidence until answer reveal
  - Time: 2026-04-26 01:14:16 +0800
  - Stats: 7 files changed, 58 insertions(+), 29 deletions(-)
  - Files:
    - DEVELOPMENT_LOG.md
    - PRODUCT_STRATEGY_NEXT.md
    - README.md
    - RELEASE_CHECKLIST.md
    - RELEASE_EXECUTION_PLAN.md
    - sidepanel.html
    - sidepanel.js

- [manual-sync] Working snapshot
  - Time: 2026-04-26 01:22:56 +0800
  - Branch: main
  - Last commit: 8e7bfb2 fix: hide evidence until answer reveal
  - Pending changes:
    -  M PRODUCT_STRATEGY_NEXT.md
    -  M README.md
    -  M RELEASE_CHECKLIST.md
    -  M RELEASE_EXECUTION_PLAN.md
    -  M background.js
    -  M learning-profile.js
    -  M sidepanel.html
    -  M sidepanel.js

- Commit: feat: improve quiz mode controls and hint preferences
  - Time: 2026-04-26 01:23:47 +0800
  - Stats: 9 files changed, 154 insertions(+), 15 deletions(-)
  - Files:
    - DEVELOPMENT_LOG.md
    - PRODUCT_STRATEGY_NEXT.md
    - README.md
    - RELEASE_CHECKLIST.md
    - RELEASE_EXECUTION_PLAN.md
    - background.js
    - learning-profile.js
    - sidepanel.html
    - sidepanel.js

- [manual-sync] Working snapshot
  - Time: 2026-04-26 13:23:09 +0800
  - Branch: main
  - Last commit: 293ab4f feat: improve quiz mode controls and hint preferences
  - Pending changes:
    -  M PRODUCT_STRATEGY_NEXT.md
    -  M README.md
    -  M RELEASE_CHECKLIST.md
    -  M RELEASE_EXECUTION_PLAN.md
    -  M sidepanel.html
    -  M sidepanel.js

- [manual-sync] Working snapshot
  - Time: 2026-04-26 13:26:49 +0800
  - Branch: main
  - Last commit: 293ab4f feat: improve quiz mode controls and hint preferences
  - Pending changes:
    -  M DEVELOPMENT_LOG.md
    -  M PRODUCT_STRATEGY_NEXT.md
    -  M README.md
    -  M RELEASE_CHECKLIST.md
    -  M RELEASE_EXECUTION_PLAN.md
    -  M sidepanel.html
    -  M sidepanel.js

- Commit: feat: add markdown file export for mistakes
  - Time: 2026-04-26 13:27:03 +0800
  - Stats: 7 files changed, 124 insertions(+), 17 deletions(-)
  - Files:
    - DEVELOPMENT_LOG.md
    - PRODUCT_STRATEGY_NEXT.md
    - README.md
    - RELEASE_CHECKLIST.md
    - RELEASE_EXECUTION_PLAN.md
    - sidepanel.html
    - sidepanel.js

## 2026-04-29

- [manual-sync] Working snapshot
  - Time: 2026-04-29 17:08:37 +0800
  - Branch: main
  - Last commit: 5f89674 feat: add markdown file export for mistakes
  - Pending changes:
    -  M sidepanel.html
    -  M sidepanel.js
    - ?? SHARE_20MIN_PRESENTATION_SCRIPT.md
    - ?? sidepanel-logic.js
    - ?? tests/

- P1 development snapshot: question regeneration controls and export extension
  - Added per-question controls for swap, easier, transfer-only, and open-ended self-check regeneration.
  - Added Evidence locator support across prompt, answer reveal, mistake log, Markdown export, and Anki CSV copy.
  - Added `sidepanel-logic.js` pure helper surface plus Node regression tests for P1 normalization and CSV escaping.

- Commit: Make Focus Quiz questions adjustable without breaking the learning loop
  - Time: 2026-04-29 17:30:06 +0800
  - Stats: 6 files changed, 744 insertions(+), 66 deletions(-)
  - Files:
    - DEVELOPMENT_LOG.md
    - sidepanel-logic.js
    - sidepanel.html
    - sidepanel.js
    - tests/fixtures/sidepanel-p1-harness.html
    - tests/p1_logic.test.js

- [manual-sync] Working snapshot
  - Time: 2026-04-29 17:39:41 +0800
  - Branch: main
  - Last commit: 10ca1b9 Make Focus Quiz questions adjustable without breaking the learning loop
  - Pending changes:
    -  M learning-profile.js
    -  M sidepanel-logic.js
    -  M sidepanel.html
    -  M sidepanel.js
    - ?? SHARE_20MIN_PRESENTATION_SCRIPT.md
    - ?? tests/fixtures/sidepanel-p2-harness.html
    - ?? tests/p2_personalization.test.js

- P2 development snapshot: explainable personalization
  - Product philosophy: personalization should reduce wasteful questions, not increase quiz volume; the user should see why this article and this profile produce this round.
  - Added local article type signals for conceptual definition, argumentative, method, case, paper, and tutorial articles.
  - Added a P2 question plan that intersects article demand with the user's weakest learning dimension while keeping the 1-3 question rule.
  - Added natural-language profile advice such as "你不是记不住，而是换场景后还不能重构概念。"
  - Added Node regression tests and a real Chrome sidepanel harness for the P2 personalized path.

- Commit: Make personalization explain why Focus Quiz asks less
  - Time: 2026-04-29 17:41:38 +0800
  - Stats: 7 files changed, 400 insertions(+), 5 deletions(-)
  - Files:
    - DEVELOPMENT_LOG.md
    - learning-profile.js
    - sidepanel-logic.js
    - sidepanel.html
    - sidepanel.js
    - tests/fixtures/sidepanel-p2-harness.html
    - tests/p2_personalization.test.js
