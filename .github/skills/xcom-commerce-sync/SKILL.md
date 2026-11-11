---
name: xcom-commerce-sync
description: "Synchronize aem-boilerplate-xcom with Adobe Commerce and aem-boilerplate-xwalk main-branch updates while preserving Crosswalk/JCR models, AEM Author routing, Universal Editor behavior, and the sites-franklin Commerce Quick Site. Use for Commerce release syncs, Crosswalk upstream updates, Drop-in regeneration, DA-to-Xwalk model reconciliation, Quick Site alignment, cloud validation, paired PRs, or release preparation."
---

# Xcom Commerce Sync

Keep the persistent xcom delta limited to Crosswalk/JCR instrumentation and unavoidable AEM Author compatibility. Prefer removing a divergence or contributing it upstream over carrying unrelated custom behavior.

Read `AGENTS.md` in each repository before changing its files. Treat their instructions independently.

## Repositories

- [aem-boilerplate-commerce](https://github.com/hlxsites/aem-boilerplate-commerce): upstream Commerce blocks, Drop-ins, dependencies, and storefront runtime.
- [aem-boilerplate-xwalk](https://github.com/adobe-rnd/aem-boilerplate-xwalk): upstream AEM Sites authoring, Universal Editor, instrumentation, models, and shared runtime adaptations.
- [aem-boilerplate-xcom](https://github.com/adobe-rnd/aem-boilerplate-xcom): integration target for both upstreams; resolve their overlapping changes here.
- [sites-franklin](https://git.corp.adobe.com/CQ/sites-franklin): companion Commerce Quick Site content and persisted contracts.

Check both upstreams on every sync. A current Commerce baseline does not imply current Crosswalk support, and Commerce's removal of UE support does not replace the Crosswalk upstream.

## Required Inputs

Establish these values from Git and the user before merging:

- Jira issue and issue branch.
- xcom repository and Commerce upstream remote.
- Crosswalk upstream URL or remote, previous integrated source SHA, and selected `main` source SHA.
- Commerce source policy: B2C `main` only; no `integration`, B2B, or feature-branch sources.
- Exact Commerce `main` commit SHA and matching B2C release tag, if any.
- Previous Commerce source SHA already present in xcom.
- Merge status of the previous xcom and Quick Site PRs.
- `sites-franklin` checkout containing `content/sites-franklin-commerce`.
- AEM Cloud test environment and disposable Quick Site.
- Review and release owner.

Use only the `main` branch of each upstream. Fetch it, pin its exact commit SHA, and use that immutable SHA throughout the sync. Do not merge `integration`, `b2b`, `b2b-integration`, or feature branches. Integration history already promoted into `main` is expected and does not change this source policy.

Release tags are descriptive labels, not an alternative source-selection policy. Record a matching `b2c-*` tag when present; when Commerce `main` is ahead of the latest B2C tag, list the additional `main` commits explicitly. Do not substitute GitHub's repository-wide "Latest" label or `/releases/latest` redirect, which may point to a B2B release.

## Workflow

### 1. Establish the Delta

1. Verify the xcom and Quick Site worktrees are clean and establish the status of the previous paired PRs. When a previous sync is merged, start a new issue branch from current xcom `origin/main`. When it is pending, explicitly agree whether to consolidate the newer release into the existing branches and paired PRs, stack it, or supersede it. Consolidation preserves the earlier merge and adaptations as history and requires updated Jira scope, PR descriptions, source SHAs, and validation; do not require shipping the older release first or silently reuse the old issue branch.
2. Inspect remotes instead of assuming their names or hosts.
3. Fetch the xcom origin, Commerce upstream `main`, and Crosswalk upstream `main`. Fetch tags only to identify release labels for the selected commits.
4. Resolve both upstream `main` tips to immutable SHAs. Identify any matching B2C tag, additional post-tag `main` commits, and previous sync sources. Check whether each previous source is already an ancestor of xcom.
5. Record the exact selected source SHA in the plan and PR.
6. Classify the update:
	- **Routine:** dependency, generated Drop-in, and small block-config changes.
	- **Structural:** blocks, models, Checkout, Account, routing, or authoring contracts changed, including upstream removal of UE support or changes to PDP auto-blocking.

Start with commands equivalent to:

```bash
git status --short --branch
git remote -v
git fetch origin --prune
git fetch upstream main --tags
git rev-parse upstream/main
git tag --list 'b2c-*' --points-at upstream/main
git fetch <crosswalk-url-or-remote> main
git rev-parse FETCH_HEAD
git merge-base --is-ancestor <previous-source> HEAD
git log --first-parent --oneline <previous-source>..<selected-source>
git diff --name-status <previous-source> <selected-source>
```

Inspect the exact source-to-source tree diff, including deletions, rather than only changed model files or a three-dot diff that can hide release-track divergence. Record decisions to adopt, adapt, retain, or remove each affected Crosswalk contract.

Identify the last integrated Crosswalk source from merge parents, recorded source SHAs, or verified equivalent ports. Compare its history and tree with the selected Crosswalk source independently of the Commerce comparison. Check whether each candidate fix is already present or implemented equivalently in xcom before porting it. Record both selected upstream SHAs and unresolved Crosswalk changes in the plan and PR.

Reconcile overlapping shared files against both upstreams and their callers. Do not blindly overwrite Commerce runtime with the Crosswalk tree or discard Crosswalk authoring fixes in favor of Commerce. Keep `scripts/aem.js` vendored; adapt supported wrappers and call sites instead of adding local core-library patches.

Preserve upstream ancestry. Merge the selected Commerce source rather than copying its tree or squashing hundreds of upstream commits. This makes the next release merge and its reviewable delta smaller.

Keep the mechanical upstream merge distinguishable from later Crosswalk fixes. Record the sync merge/baseline SHA so reviewers can measure `<sync-baseline>...HEAD` separately from `origin/main...HEAD`.

#### Review Cumulative Compatibility

Review the full accumulated xcom-specific changes against the last merged xcom baseline, not just the latest upstream increment. Earlier unmerged sync commits are part of the review scope, not a proven baseline.

- Focus on maintained Author/UE adaptations and their callers, excluding generated assets and mechanical upstream changes.
- Check retained adaptations when upstream changes a contract they depend on, even if those adaptations merge cleanly.
- Preserve previously supported behavior unless an intentional change is documented and agreed.
- Use small, targeted local checks where behavior is uncertain. A default-store smoke test does not establish localized or Author-path compatibility.

This requires a focused compatibility review, not exhaustive application testing or a CI test for every issue.

### 2. Merge and Regenerate

1. Merge the exact selected Commerce source into the issue branch.
2. Resolve generic upstream files in favor of Commerce unless a verified Crosswalk contract requires an overlay.
3. Keep `scripts/aem.js` as vendored upstream code. Put Crosswalk behavior in supported wrappers or helpers.
4. Update dependencies using the repository package-manager workflow.
5. Run `npm install` when updating the lockfile, then explicitly run `npm run prepare` to activate the retained Husky/model-generation hooks. Keep `ignore-scripts=true`; explicit project hook setup does not re-enable dependency lifecycle scripts.
6. Run `npm run install:dropins` to regenerate `scripts/__dropins__`.
7. Mark generated Drop-ins and lockfiles in `.gitattributes` when upstream does so.
8. Never repair generated Drop-in files by hand; fix inputs and regenerate.

Use the pinned Commerce `main` commit's dependency versions rather than silently upgrading to npm `latest`. Review deleted build scripts, dependencies, hooks, and `.hlxignore` entries for xcom consumers before accepting their removal.

Review generated files separately from maintained source. Large generated diffs are expected, but unexplained maintained-source diffs are not.

### 3. Maintain Crosswalk Authoring Contracts

Diff changed block implementations, configuration parsing, READMEs, and authoring files since the previous source. Reconcile each changed contract instead of blindly retaining old Crosswalk JSON. When upstream no longer supplies models, derive field changes from the actual runtime consumers and documented configuration, not from nonexistent upstream partials.

Upstream removal of Universal Editor support for Document Authoring does not remove xcom's AEM Sites/Universal Editor requirement. Crosswalk models and their generation pipeline are xcom-owned contracts:

- Retain required block/model `_*.json` partials, `component-*.json` aggregates, and `xwalk.json` mappings.
- Retain `build:json*`, their build dependencies, and model-generation hooks while xcom consumes them, even when Commerce deletes its equivalents.
- Preserve authoring-file exclusions in `.hlxignore` unless repository policy explicitly changes.
- Resolve modify/delete conflicts by checking the live xcom contract. Remove a model only when its block or field is genuinely obsolete, and update filters, definitions, and Quick Site content together.
- Do not resurrect obsolete DA-only UE code when xcom's own editor support already supplies the behavior.

For each changed or new block:

- Translate remaining DA plugin metadata, or the runtime contract when metadata is absent, to the corresponding `plugins.xwalk` page/component contract.
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

For xcom-owned URL/root adaptations, check the callers as well as the shared helper. Changing from a delivery root to an Author-aware root can break previously accepted inputs even when the merge is conflict-free:

- Verify site-relative paths and already-rooted Author paths resolve without duplicating the site/store prefix. Cover default and localized roots, the root itself, and segment-boundary lookalikes.
- Preserve each caller's existing contract for absolute URLs, suffixes, query strings, and rejected inputs; do not broaden a root-prefix fix into unrelated URL cleanup.
- Prefer small local fixtures using the actual functions with a captured fetch or mocked location/configuration. Assert the resulting URL before considering additional cloud testing.
- Compare a failing fixture with the previous xcom baseline and pinned upstream before attributing it to the latest merge. Distinguish isolated reproduction from a deployed failure.
- Fix composition in the owning caller when the shared helper already returns the correct root. Do not patch vendored libraries or weaken root segment boundaries to accommodate one case.

When upstream changes SKU resolution or PDP auto-blocking:

- Read the selected source's precedence for metadata, authored `defaultSku`, and URL fallback; do not carry the old template-only rule forward without a verified Author requirement.
- Reconcile auto-blocking independently of SKU selection. Preserve authored product-details blocks and avoid creating duplicates; explicitly validate synthetic blocks in Author and UE before enabling that path there.
- Do not persist a runtime-created block or change Quick Site content architecture solely to accommodate auto-blocking without an agreed migration.
- Remove a hardcoded `previewSku` assignment only after confirming all its readers are gone and authored/metadata preview paths work.

### 5. Reconcile Universal Editor Behavior

Keep Universal Editor adaptations outside vendored `scripts/aem.js`. Reconcile removed upstream `ue.js`, `ue-utils.js`, and `IS_UE` call sites against xcom's actual editor support rather than retaining or deleting those files wholesale:

- Preserve `data-aue-*` and rich-text instrumentation across DOM rewrites.
- Serialize patch processing when concurrent edits can race.
- Redecorate only newly inserted sections and blocks.
- Handle `.richtext` wrappers.
- Convert `.section-metadata` into section classes and data attributes.
- Retain template-specific filters.
- Render editable placeholders for authenticated blocks when the editor is anonymous.
- Consume authored Columns metadata before block loading.

Remove an adaptation when the new Commerce code or shared AEM library now provides equivalent behavior.

For upstream changes that separate DA/Experience Workspace from UE, test each environment detector and initialization path independently. Do not equate loss of `IS_UE` upstream with loss of direct AEM Author support in xcom.

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
9. Execute the [post-approval release procedure](./references/validation.md#7-post-approval-release). Confirm the coordinated version, merge any version-only follow-up, verify the template artifacts, and publish only the approved release assets and channels.

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

Revise the estimate when the selected source includes substantial post-tag `main` work, major model changes, unavailable catalog fixtures, or environment/access delays.
