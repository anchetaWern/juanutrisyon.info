# Phase 3 report — shared calculator export and parity

Date: 2026-10-23 (Asia/Manila). **Gate: PASS for Phase 3.** Completed at the user's explicit instruction using the captured, source-review-pending fixtures. Phase 1 source/label review remains unresolved; this is not release approval. Phase 4 has not started.

Recommended execution in the plan: GPT-6 Astra / High. No executing-model switch is claimed.

## Delivered

The app now exposes a narrow ESM entry through `src/exports/nutrition-core.js`, `vite.nutrition-core.config.js` and `scripts/build-nutrition-core.mjs`. It exports the nine agreed helpers directly from existing calculation source. Rollup removes unused interpretation/reference dependencies; no calculator refactor, replacement scaling formula, API change or app UI change was necessary.

The landing site contains the generated [artifact](../../src/vendor/jn-nutrition-core/index.mjs) and [manifest](../../src/vendor/jn-nutrition-core/manifest.json), an explicit [update/verification script](../../scripts/update-nutrition-core.mjs), and seven standalone [contract tests](../../tests/food-visualizer/nutrition-core.test.mjs). The app has 26 new parity/guard tests in `src/exports/nutrition-core.test.js`. Package scripts expose these commands; app `.gitignore` excludes its generated distribution. Dependencies and lockfiles are unchanged.

See [maintenance instructions](shared-calculator.md) for exact rebuild, fixture-environment, update and validation commands. Generated files are not hand-edited or automatically refreshed during landing builds.

## Provenance and distribution evidence

| Item | Verified value |
| --- | --- |
| Contract | `jn-nutrition-core-1`, ES2022 |
| App source HEAD | `22f81d7eedd82c1567d32e2c65817efae637e29a` |
| Relevant source state | Uncommitted producer additions/scripts; `dirty: true`, `dirty_source_recorded: true` with exact hashes/statuses. Existing calculator helper files are clean. |
| Build tools | Node 22.22.0; Vite 6.4.1; Rollup 4.60.1; Vite-resolved esbuild 0.25.12 |
| Recorded source/build inputs | 19; every current file's SHA-256 verified against the manifest |
| Runtime modules | 10 calculation modules, including `RecipeCooking.js`; no external or dynamic imports |
| Artifact size | 31,253 bytes, unminified |
| Artifact SHA-256 | `a39b6b16161f355bcb97789dcef3f7fe28823af0c759ebd165a9138307745e5a` |
| Manifest SHA-256 | `28e6fa1e789bd76eb37b115ee72e7dbeac9e68f3d040c6bcfdaa32e9559af5c2` |

The source list includes the interpretation/reference modules and JSON snapshot traversed by the bundler. They contribute no rendered runtime code or reference data. The renderer allowlist, actual output checks and nine-export contract exclude Vue/Nuxt/Vuetify, clinical classifiers, daily targets and planner/diary interfaces. Relevant dirty-source builds without the explicit flag fail before writing output; verified that the prior artifact and manifest remain byte-identical after this rejection.

Two builds on unchanged final source/toolchain produced byte-identical artifact **and** manifest. The manifest records uncommitted additions rather than pretending they belong to HEAD. Regenerate after producer changes are committed to capture a clean commit. Existing unrelated app static-route edits and untracked files were left untouched. No Git commit or deployment was performed.

## Validation actually run

| Check | Result |
| --- | --- |
| Source/artifact parity | **26 passed, zero skips** with `JN_NUTRITION_FIXTURES` set to the seven Phase 1 captures |
| App calculator/recipe/serving regressions, including new parity suite | **245 passed in 11 files** |
| Final build-metadata correction | Parity rerun: **26 passed**; reproducibility, dirty-source rejection and all 19 source hashes reverified |
| Landing contract/integrity/guard tests | **7 passed**, including corrupted artifact, injected imports and invalid provenance rejection |
| Original captured-fixture evidence checks | **7 passed**; captures and hashes unchanged |
| Landing vendor versus explicit app export | Byte-equal artifact and manifest; integrity check passed |
| Isolated landing copy | Vendor integrity + all seven standalone tests passed; production SSG build rendered **20 pages** successfully |

Parity deep-compares entire results at full floating-point precision, including states, coverage, reasons, source metadata and recipe lineage. Inputs are frozen and compared before/after. Captured tests cover source portions, zero, fractional/multiple portions, supplied household gram weights and volume/unsupported selections. Synthetic tests cover nested partial recipes, unavailable structure/cycles, retained zero ingredients, explicit zero/null/omissions, duplicate nutrient paths, unverified USDA zeros and matching/mismatched normalization evidence, Open Food Facts basis uncertainty, density/count conversions and every public helper.

The isolated build ran in `/private/tmp/jn-phase3-standalone-977z_dly`, containing landing tracked files plus the new artifact/validator/tests. It used only the existing **landing** `node_modules` via symlink (landing Vite 6.3.2), with no sibling-app source or dependency link. No fresh dependency download was performed. The production pages do not yet import the calculator because the visualizer UI starts in Phase 4; the isolated Node tests independently import and exercise the delivered artifact. This verifies both standalone artifact consumption and the unchanged site's production build, not visualizer browser integration.

## New data finding and limits

The captured Coke food `1597` includes both `total carbohydrate` and `total carbohydrates`. The core normalizes these to the same canonical nutrient and rejects the duplicate parent. Its nested sugar therefore has `value: null`, `state: invalid`, `coverage: unavailable`, reason `duplicate_ancestor_path`. Both source and exported core agree. The initial standalone test's expected 9 g at 120 mL was incorrect; after inspecting the canonical result, it was replaced with explicit duplicate-guard assertions. Volume scaling is verified separately using Coke sodium (12.5 mg at 120 mL) and gata saturated fat (8.75 g at 50 mL). No API fixture, calculator behavior or guard was changed to obtain a numeric sugar result.

At the captured recipe's 377-g selection, sugar, saturated fat, total fat and carbohydrates remain partial; sodium is complete. `exactValue()` returns null for partial nodes even when `amount`/`known_subtotal` is numeric. The later portion/lens implementation must use this exact-value boundary.

Phase 1's unavailable FNRI source report and localhost product-label URLs still block independent source review and featured-example promotion. The Coke sugar example additionally needs its duplicate catalog data resolved or another reviewed record chosen. No source claim is certified by these numerical parity tests. Existing backend baseline test failures were outside this app-only phase; no backend suite, browser parity or Food Details presentation/default comparison was rerun or claimed.

## Next phase

Phase 4 can proceed on the user's next instruction: public page shell, API client and food selection. Its UI must consume this artifact and respect unavailable/partial results. Phase 5 remains responsible for portion controls and comparison with Food Details at the same selection; later source/example phases retain the unresolved evidence gates.
