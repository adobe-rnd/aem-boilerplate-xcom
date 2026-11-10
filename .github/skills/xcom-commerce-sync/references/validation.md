# Validation and Release Checklist

Use this checklist after the model and runtime reconciliation is stable. Scale individual scenarios to the source delta, but do not omit a changed contract.

## Contents

1. Local xcom checks
2. Quick Site checks
3. AEM Cloud setup
4. Functional matrix
5. Known failure modes
6. PR and release closeout

## 1. Local xcom Checks

Run the repository-supported generation and validation commands:

```bash
npm install
npm run install:dropins
npm run build:json
npm run lint
```

Then:

- Confirm both pinned upstream SHAs were selected from their respective `main` branches. Identify matching B2C release labels and any post-tag `main` commits; do not introduce separate `integration`, B2B, or feature-branch sources.
- Run `npm run build:json` again and confirm it produces no new diff.
- Compare the selected Crosswalk source with xcom for UE event serialization, formatted-link buttons, rich-text handling, section metadata, path mapping, and multi-field configuration. Distinguish missing behavior from equivalent fixes already ported without shared commit ancestry.
- If upstream removed UE instrumentation, confirm xcom still has its required model partials, aggregate JSON, generation scripts/dependencies, and model-generation hook. Validate new field definitions against current block configuration consumers.
- Confirm generated Drop-ins match their package versions.
- Confirm `scripts/aem.js` contains no Crosswalk-only customization.
- Run relevant unit/E2E tests for changed Commerce blocks.
- Start `aem up` and inspect changed pages locally.
- Inspect source markup with `.plain.html` or `.hlx.json` before assuming its structure.
- Verify the worktree contains no accidental generated or formatting churn.

## 2. Quick Site Checks

From `sites-franklin`, build the standalone package:

```bash
mvn -f content/sites-franklin-commerce/pom.xml clean install
```

Also:

- Run tests corresponding to any Java class changed while updating or merging `sites-franklin`.
- Treat existing FileVault informational notices separately from new validation failures.
- Inspect the final diff for only intended Quick Site content.
- Confirm the branch contains current `origin/main` and is clean before pushing.

## 3. AEM Cloud Setup

1. Create a disposable Quick Site from the updated package.
2. Configure it against a known Commerce catalog.
3. Push xcom code to a slash-free validation branch such as `issue-sites-12345`.
4. Verify AEM Code Sync serves that branch.
5. Open the site in direct AEM Author and Universal Editor.
6. Record the AEM Sites console, Feature Preview, and representative page URLs.
7. Keep Live untouched unless explicitly approved.

Use both Author and Feature Preview. A Preview-only test does not exercise `.resource`, `/content/{site}`, or `.html` handling.

## 4. Functional Matrix

### Homepage and authoring

- Render the homepage in direct Author and Universal Editor.
- Select representative components and confirm their property models open.
- Make one harmless edit, save it, verify JCR/rendering, restore it, and verify restoration.
- Publish the restored page to Preview and confirm Live timestamps do not change.

### Generated PDP

- Test a generated real-SKU page at `/products/{url-key}/{sku}`.
- Test the default/fallback PDP template on direct Author.
- Verify product details, gallery/options, recommendations, enrichment, and add-to-cart behavior.
- Verify Author product links include the site root and `.html`.
- Verify Preview links remain clean.
- Confirm temporary recommendation or fallback edits are restored in JCR immediately.

When SKU resolution or PDP auto-blocking changed upstream, also test:

- Metadata SKU and authored `defaultSku` with different values, checking the selected source's precedence.
- An authored product-details block with only `defaultSku`, on both a template and a non-template Author page.
- A real-SKU URL without SKU metadata, including required Author `.html` handling.
- SKU metadata without an authored product-details block, checking intended Preview behavior and explicitly agreed Author/UE behavior for synthetic blocks.
- An existing authored product-details block, confirming auto-blocking does not duplicate it and UE selection/editing still works.
- A page with neither SKU metadata nor a product-details block, confirming it does not gain an unintended PDP.
- The absence of remaining readers before removing any static `previewSku` assignment. Do not retain obsolete template-only detection as the sole preview path if upstream widened the contract.

### PLP

- Verify category URL resolution and expected product count.
- Test sorting and confirm URL state plus actual visible ordering.
- Test at least one facet and confirm every result satisfies it.
- Clear filters and test pagination, active-page state, and changed products.
- Verify all generated PDP links are Author-safe.

### Search

- Enter a query and inspect suggestions without submitting.
- Verify suggested products, prices, and Author-safe links.
- Open "View all" and verify the query survives in the Search URL.
- Confirm result count, products, and pagination.
- Return to edit mode and verify the Product List Page model fields.

### Account, Checkout, and authenticated flows

- Verify anonymous Account placeholders are editable in Universal Editor.
- Test sign-in, account navigation, and sign-out with a disposable account.
- Exercise cart and checkout far enough to validate updated placeholder keys and routing.
- Verify Account/Checkout links and website cookies use the correct site root.
- Do not store credentials in source, logs, comments, or skill files.

### Release-specific behavior

- If the selected release changes SEO, asset preloading, consent, or customer-group context, verify the affected output and flows rather than restoring removed client-side behavior automatically.
- When DA/Experience Workspace code and xcom UE code coexist, verify their initialization paths do not both run on an Author/UE page or create duplicate headers, footers, or event handlers.

### Content endpoints

- Inspect representative `.plain.html`, `.hlx.json`, and `.resource` requests.
- Confirm placeholder values are populated and no obsolete `?sheet=data` selector is used.
- Confirm section metadata becomes the expected classes/data attributes.
- Confirm composite multi-fields survive publish serialization.

## 5. Known Failure Modes

- **Slash branch names:** EDS model/code URLs may break. Use a slash-free validation branch.
- **Concrete PDP 404:** Expected when the generated product page does not exist. Do not replace generated-page architecture with client-side routing to hide it.
- **Expanded `modelFields`:** AEM may persist the complete typed model after an edit. Validate against the component model before reverting it.
- **Wrong temporary field:** Verify JCR after every authoring probe and restore the exact field immediately.
- **Deleted-block README warning:** The README workflow may inspect deleted JS/CSS paths and then report the removed directory as missing a README. Verify deletion against upstream; do not recreate the block.
- **Optional metadata image:** A missing optional default metadata image can produce a harmless 404/CORS warning. Record it separately from release regressions.
- **Initial Drop-in preload failures:** Reload and verify final rendering before classifying transient module preload errors.
- **Universal Editor overlays:** Prefer user-driven clicks plus automated read-only verification when React/Spectrum overlays make automation brittle.
- **Performance regressions:** Record PSI/Lighthouse results and ownership. Do not silently waive a failure; document explicit acceptance when it is inherited from Commerce.

## 6. PR and Release Closeout

For the xcom PR:

- Put the Jira link first.
- Name the pinned Commerce `main` SHA and matching B2C release tag, if any; identify additional post-tag `main` changes.
- Name the selected Crosswalk source SHA and summarize changes adopted, already implemented equivalently, or deliberately deferred.
- Distinguish the full diff from the post-sync Crosswalk delta.
- Mark generated artifacts as generated and direct review to maintained files.
- Include before/after Feature Preview URLs and representative PDP/PLP paths.
- Summarize local, Author, Universal Editor, authenticated, and Preview validation.

For the Quick Site PR:

- Put the Jira link first.
- Link the xcom PR.
- Describe model fields, template metadata, fixtures, section properties, and placeholder changes.
- Include the Maven/FileVault build result and cloud validation.

Finally:

- Link the Quick Site PR back from xcom.
- Add both PRs and the validation summary to Jira.
- Check CI on both hosts.
- Merge xcom first, then the Quick Site package.
- Confirm who owns merge and release now; obtain approval rather than assuming historical ownership.
- Keep the disposable AEM site until review is complete, then remove it according to team policy.