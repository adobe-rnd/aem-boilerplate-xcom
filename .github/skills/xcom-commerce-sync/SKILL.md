---
name: xcom-commerce-sync
description: "Synchronize aem-boilerplate-xcom with a tagged or integration Adobe Commerce boilerplate release while preserving Crosswalk/JCR models, AEM Author routing, Universal Editor behavior, and the sites-franklin Commerce Quick Site. Use for Commerce release syncs, upstream merges, Drop-in regeneration, DA-to-Xwalk model reconciliation, Quick Site alignment, cloud validation, paired PRs, or release preparation."
---

# Xcom Commerce Sync

Keep the persistent xcom delta limited to Crosswalk/JCR instrumentation and unavoidable AEM Author compatibility. Prefer removing a divergence or contributing it upstream over carrying unrelated custom behavior.

Read `AGENTS.md` in both repositories before changing files. Treat their instructions independently.

## Required Inputs

Establish these values from Git and the user before merging:

- Jira issue and issue branch.
- xcom repository and Commerce upstream remote.
- Exact Commerce source tag, branch, and commit SHA.
- Previous Commerce source SHA already present in xcom.
- `sites-franklin` checkout containing `content/sites-franklin-commerce`.
- AEM Cloud test environment and disposable Quick Site.
- Review and release owner.

Do not describe a source as "latest" when it is only the latest tagged release. List newer untagged `main` or `integration` commits and confirm whether to include them.

## Workflow

### 1. Establish the Delta

1. Verify both worktrees are clean and neither repository is on `main` for implementation.
2. Inspect remotes instead of assuming their names or hosts.
3. Fetch the xcom origin, Commerce upstream branches, and tags.
4. Identify the latest tag, pending `integration` release, post-tag hotfixes, and previous sync source.
5. Record the exact selected source SHA in the plan and PR.
6. Classify the update:
	- **Routine:** dependency, generated Drop-in, and small block-config changes.
	- **Structural:** blocks, models, Checkout, Account, routing, or authoring contracts changed.

Start with commands equivalent to:

```bash
git status --short --branch
git remote -v
git fetch origin --prune
git fetch upstream --tags --prune
git tag --merged upstream/main --sort=-creatordate
git log --first-parent --oneline <previous-source>..<selected-source>
git diff --name-status <previous-source>...<selected-source>
```

Preserve upstream ancestry. Merge the selected Commerce source rather than copying its tree or squashing hundreds of upstream commits. This makes the next release merge and its reviewable delta smaller.

Keep the mechanical upstream merge distinguishable from later Crosswalk fixes. Record the sync merge/baseline SHA so reviewers can measure `<sync-baseline>...HEAD` separately from `origin/main...HEAD`.

### 2. Merge and Regenerate

1. Merge the exact selected Commerce source into the issue branch.
2. Resolve generic upstream files in favor of Commerce unless a verified Crosswalk contract requires an overlay.
3. Keep `scripts/aem.js` as vendored upstream code. Put Crosswalk behavior in supported wrappers or helpers.
4. Update dependencies using the repository package-manager workflow.
5. Run `npm install` when updating the lockfile.
6. Run `npm run install:dropins` to regenerate `scripts/__dropins__`.
7. Mark generated Drop-ins and lockfiles in `.gitattributes` when upstream does so.
8. Never repair generated Drop-in files by hand; fix inputs and regenerate.

Review generated files separately from maintained source. Large generated diffs are expected, but unexplained maintained-source diffs are not.

### 3. Translate Commerce Models to Crosswalk

Diff only model, definition, and filter files changed by Commerce since the previous source. Reconcile each changed contract instead of blindly retaining old Crosswalk JSON.

For each changed or new block:

- Translate DA plugin metadata to the corresponding `plugins.xwalk` page/component contract.
- Preserve Sling resource types, model names, key-value behavior, and authored defaults.
- Use AEM-compatible field types such as `aem-content`, `number`, and `boolean` where required.
- Represent every value that must survive AEM serialization.
- Update template page metadata and template-specific section filters.
- Keep Columns section modeling separate where layout metadata is authored on the section.
- Update composite multi-field handling in `xwalk.json`.
- Remove stale fields and filters that Commerce no longer consumes.

Run `npm run build:json` after partial model changes. Re-run it and confirm no new diff to prove aggregate generation is deterministic.

### 4. Reconcile AEM Runtime Behavior

Test every path assumption changed upstream. Preserve these Crosswalk behaviors only where still required:

- Detect direct AEM Author and Universal Editor environments.
- Derive the site root from the `.resource` code path.
- Load configuration relative to `window.hlx.codeBasePath`.
- Load Author placeholders through `.hlx.json`, without obsolete spreadsheet selectors.
- Add `/content/{site}` and `.html` to internal Author links where required.
- Keep clean Edge Delivery Services URLs on Preview and Live.
- Normalize `.html` suffixes and trailing slashes for PDP template matching.
- Keep valid fallback-SKU template pages from redirecting to `/notfound` on Author.
- Apply site-root handling consistently to products, fragments, footer, Account, Checkout, and Drop-in website cookies.
- Accept both arrays and serialized JSON where AEM may serialize enrichment values differently.

### 5. Reconcile Universal Editor Behavior

Keep Universal Editor adaptations outside vendored `scripts/aem.js`:

- Preserve `data-aue-*` and rich-text instrumentation across DOM rewrites.
- Serialize patch processing when concurrent edits can race.
- Redecorate only newly inserted sections and blocks.
- Handle `.richtext` wrappers.
- Convert `.section-metadata` into section classes and data attributes.
- Retain template-specific filters.
- Render editable placeholders for authenticated blocks when the editor is anonymous.
- Consume authored Columns metadata before block loading.

Remove an adaptation when the new Commerce code or shared AEM library now provides equivalent behavior.

### 6. Align the Commerce Quick Site

Stabilize the xcom models before editing `sites-franklin`.

1. Create or update the same Jira issue branch in `sites-franklin`.
2. Merge current `origin/main` according to that repository's instructions.
3. Update only `content/sites-franklin-commerce` contracts affected by xcom:
	- Persisted `modelFields`.
	- PDP, PLP, Search, and Account-family template metadata.
	- Product Details `defaultSku` and generated PDP fixtures.
	- Product Recommendations `recid` and serialized fields.
	- Section `column-width`, `gap`, and template properties.
	- Account and Checkout placeholder keys.
4. Confirm fixture SKUs and recommendation identifiers exist in the configured catalog.
5. Do not treat AEM-expanded typed `modelFields` as corruption; compare them with the current component model.

### 7. Validate End to End

Read and execute [the validation and release checklist](./references/validation.md). Do not consider lint or a local page load sufficient for a structural update.

Use a slash-free EDS validation branch even when the Git branch contains `/`. Publish only to Preview unless Live is explicitly approved.

### 8. Review and Deliver

1. Quantify both diffs:
	- Full PR against xcom `main`.
	- Crosswalk adaptations against the recorded sync baseline.
2. Separate generated/lock files from maintained files in the PR summary.
3. Explain the reviewable areas: models, runtime, Universal Editor, and Quick Site contracts.
4. Open the xcom PR first with Jira and before/after test URLs.
5. Open the `sites-franklin` PR second and cross-link both PRs.
6. Update Jira with both links, validation, and known accepted gaps.
7. Merge xcom before the dependent Quick Site PR.
8. Confirm release ownership before merging or releasing; do not infer it from past ownership.
9. Follow the repository release skill/process after approval.

When a README workflow flags a deleted block, verify the base and source branches. Do not add documentation for a block intentionally removed by Commerce upstream.

## Estimates

Use these planning ranges after inspecting the actual source delta:

- **Routine release:** 1-2 engineer days.
  - Merge and regenerate: 2-4 hours.
  - Reconcile overlays and local checks: 2-4 hours.
  - Cloud functional testing: about half a day.
- **Structural release:** 3-5 engineer days.
  - Model translation: 1-2 days.
  - Runtime reconciliation: 0.5-1 day.
  - Local AEM and Universal Editor validation: 0.5-1 day.
  - Cloud Commerce flow testing: 0.5-1 day.

Revise the estimate when the selected source includes untagged integration work, major model changes, unavailable catalog fixtures, or environment/access delays.
