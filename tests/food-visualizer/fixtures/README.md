# Phase 1 public evidence fixtures

Captured 2026-10-23 from anonymous public HTTPS requests. `manifest.json` records URL, method, UTC response date, status, allowlisted response headers, identity/basis and sanitized SHA-256 for each capture. The request Origin was `https://juanutrisyon.info` except the source-report/app-config reads. The preflight also requested method GET; the missing-food read requested JSON.

`captured/` contains **sanitized captured responses**, not hand-written sample nutrition. The capture script keeps source basis, numeric strings, null/omitted nodes, nutrient nesting, serving-profile identities/defaults/provenance and recipe calculation inputs. It removes author/user identifiers, procedures, unrelated editorial/health fields, private/raw import payloads, response infrastructure identifiers and error stack details. These are calculation-input projections of full public responses, not byte-identical wire bodies. The full response's API key set should not be inferred from these projections.

`captured/app-config.json` retains only the publicly configured API base. `captured/source-rice.json` records the unavailable source-report page, not rice nutrition. `captured/preflight.json` is null because the response had no body. `captured/not-found.json` retains only the real error message; UI must still show a generic error, not that internal model message.

`synthetic/rate-limited.json` is explicitly synthetic. No real 429 was triggered. Its retry message/duration are test inputs, not production observations. Include readable-header and unexposed-header branches in later client tests.

Run offline integrity/data-boundary checks:

```sh
python3 scripts/check-food-visualizer-fixtures.py
```

To reproduce sanitization from previously downloaded files (no network):

```sh
python3 scripts/capture-food-visualizer-fixtures.py /private/tmp
```

Raw files follow `jn-visualizer-<key>.json` / `jn-visualizer-<key>-headers.txt`; source/app reads use `.html`, and preflight has no required body. Raw files stay outside the repo. Refreshes must review contract differences, update evidence timestamps/hashes, and update affected snapshot assertions deliberately. Passing these checks does not prove shared-calculator parity or clear the failed source-review gate.
