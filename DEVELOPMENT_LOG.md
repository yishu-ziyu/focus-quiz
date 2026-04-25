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
