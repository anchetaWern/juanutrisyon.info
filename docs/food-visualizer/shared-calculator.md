# Shared calculator maintenance

The app owns calculation source. This repo owns a versioned, generated delivery copy and tests its integrity/observable guards. Neither application needs new dependencies for this boundary. Use Node 22.22.0 for the recorded build; the app requires Node >=20. The system's default Node 14 is insufficient.

## Rebuild and verify in the app

From the `nuxt-juanutrisyon` checkout, after reviewing relevant changes:

```sh
npm run build:nutrition-core
```

That command rejects any uncommitted relevant source. For an intentional development export, use `npm run build:nutrition-core -- --allow-dirty-source`; the manifest records the actual content hashes and Git statuses. Unrelated working-tree changes do not affect this check. Generated `dist-nutrition-core/` is ignored by the app; existing app helper exports and behavior are unchanged.

Run full source/artifact parity with the explicit capture directory (replace the absolute paths for your checkout):

```sh
JN_NUTRITION_FIXTURES=/Users/wernancheta/projects/juanutrisyon-landing/tests/food-visualizer/fixtures/captured npm run test:nutrition-core
```

The test rebuilds the artifact, recording uncommitted inputs when needed. It checks every helper and deep-compares full calculation results with the existing source on frozen inputs. All **26 tests** must pass with **zero skips** for captured-data verification. Without `JN_NUTRITION_FIXTURES`, normal app tests run the synthetic cases and explicitly skip the seven capture cases; that is not sufficient for publishing an updated artifact.

Relevant app regressions:

```sh
npm test -- src/exports/nutrition-core.test.js src/helpers/calculation src/helpers/RecipeCalculation.test.js src/helpers/FoodServing.test.js src/helpers/RecipeIngredients.test.js src/helpers/RecipeIngredientOrder.test.js
```

Supply the same `JN_NUTRITION_FIXTURES` environment variable for the combined run. The Phase 3 run passed **245 tests in 11 files**.

For reproducibility, hash both `dist-nutrition-core/index.mjs` and `dist-nutrition-core/manifest.json`, rerun the same build command on the same unchanged source/toolchain, and compare both hashes. The manifest deliberately omits timestamps and absolute paths. Tool versions and dirty/clean source status are part of provenance, so a commit or toolchain change legitimately changes the manifest. Regenerate after committing the producer files to record the final clean commit.

## Update the landing copy explicitly

From the landing repo, after the producer parity checks pass:

```sh
node scripts/update-nutrition-core.mjs /Users/wernancheta/projects/juanutrisyon/nuxt-juanutrisyon/dist-nutrition-core
node scripts/update-nutrition-core.mjs --check /Users/wernancheta/projects/juanutrisyon/nuxt-juanutrisyon/dist-nutrition-core
npm run test:nutrition-core
python3 scripts/check-food-visualizer-fixtures.py
npm run build
```

The updater validates contract version, recorded source status/hashes, output hash/size, actual ESM syntax/exports and allowed dependency metadata before copying either file. It rejects imports/re-exports/dynamic imports, extra public exports and clinical-reference symbols. This is integrity checking of a reviewed local export, not a cryptographic signature or a sandbox for untrusted JavaScript. Review the producer diff and manifest; do not import arbitrary downloaded code.

`npm run check:nutrition-core` verifies the vendored copy without accessing the app. Production builds and these seven landing tests need only this repo and its installed dependencies. There is no automatic sibling lookup, package link, build-time API call or runtime reference to the app source. Keep the generated artifact and manifest together in source control.

## Result boundaries

Equality with the app establishes calculation parity, not independent nutritional source verification. Original FNRI/product-label review remains pending from Phase 1.

The captured Coke record contains both `total carbohydrate` and `total carbohydrates`; normalization makes them duplicate canonical parents. Its sugar result is unavailable with `duplicate_ancestor_path`, despite a stored 18-g sugar value. Preserve this behavior and resolve the catalog/source evidence before featuring that sugar example. The captured recipe's sugar, total fat, saturated fat and carbohydrates are partial and must not become exact visualizations.
