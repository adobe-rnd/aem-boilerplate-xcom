# Validation and Release Checklist

Use this checklist after the model and runtime reconciliation is stable. Scale individual scenarios to the source delta, but do not omit a changed contract.

## Contents

1. Local xcom checks
2. Quick Site checks
3. AEM Cloud setup
4. Functional matrix
5. Known failure modes
6. PR and release closeout
7. Post-approval release

## 1. Local xcom Checks

Run the repository-supported generation and validation commands:

```bash
npm install
npm run prepare
npm run install:dropins
npm run build:json
npm run lint
```

Then:

- Confirm `git config --local --get core.hooksPath` points to the installed Husky dispatcher (currently `.husky/_`). Automatic hook setup is skipped by `ignore-scripts=true`, so `npm run prepare` is required on a fresh checkout; do not re-enable dependency lifecycle scripts.
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

### Targeted URL contract checks

For URL/root callers affected by the sync, use isolated fixtures before browser testing. These are migration-contract checks, not a general application or performance test sweep.

With Author root `/content/shop/en`, verify fragment fetch construction:

| Input | Expected request |
| --- | --- |
| `/footer` | `/content/shop/en/footer.plain.html` |
| `/content/shop/en/footer` | `/content/shop/en/footer.plain.html` |

- Repeat with an Author site root plus a localized configured store root, and keep delivery controls for `/` and `/de/`.
- Verify the root itself and real descendants are recognized at a segment boundary. `/content/shop/en-other/footer` must not count as a descendant of `/content/shop/en`.
- Check root-page `.html` URLs for link-building callers that accept them; retain protocol-relative/external URL handling and suffix behavior according to each caller's existing contract.
- Capture requested URLs without fetching real content. A working rendered page does not cover already-rooted or multistore inputs absent from that page.
- If a case fails, identify whether it regressed against the prior xcom baseline or was inherited from upstream. Record fixture evidence separately from deployed observations.

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

For publication after approval, continue with [Post-Approval Release](#7-post-approval-release).

## 7. Post-Approval Release

### 7.1 Agree Versions and Pin Sources

Confirm the release owner, version, publishing permission, and distribution channels before creating tags or publishing assets. Review approval is not automatically release authorization. Required GitHub reviews and CI still apply; Slack approval does not satisfy a protected PR's approval gate. Do not approve your own PR, use an admin override, or bypass a failing gate.

For a coordinated Commerce release, use the same approved version for the xcom GitHub release/tag and the Commerce Quick Site module/templates. Keep xcom's npm package version at the pinned upstream Commerce version. For example, release `0.8.0` used Commerce npm version `12.0.0`; those are separate version schemes. Inspect prior releases and agree the next number rather than copying this example.

Only `content/sites-franklin-commerce` is in the Quick Site release scope. Do not blanket-release Franklin bundles, `sites-franklin-content`, or Quickstart, and do not infer a Maven deployment from approval to publish a GitHub template ZIP.

Prerequisites: authenticated `gh` access to both GitHub hosts, Git, the repository-supported Maven/JDK setup, Python 3, `unzip`, `sha256sum`, and `curl`. Read both repositories' instructions, verify their remotes, and require clean worktrees; do not discard or automatically stash another person's changes. Replace the angle-bracket values below with the agreed inputs. The examples use Bash.

```bash
VERSION='<approved-release-version>'
XCOM_DIR='<path-to-aem-boilerplate-xcom>'
QUICK_SITE_DIR='<path-to-sites-franklin>'
NOTES_FILE='<path-to-prepared-public-release-notes.md>'
XCOM_REPO='adobe-rnd/aem-boilerplate-xcom'

git -C "$XCOM_DIR" fetch origin main
git -C "$QUICK_SITE_DIR" fetch origin main
XCOM_SHA=$(git -C "$XCOM_DIR" rev-parse origin/main)
QUICK_SITE_SHA=$(git -C "$QUICK_SITE_DIR" rev-parse origin/main)
GH_HOST=github.com gh release list --repo "$XCOM_REPO" --limit 5
git -C "$XCOM_DIR" ls-remote --tags origin "refs/tags/$VERSION" "refs/tags/$VERSION^{}"
```

Confirm these pinned commits contain the approved PRs, merged xcom first with a merge commit to preserve upstream ancestry, then Quick Site. Record the selected Commerce and Crosswalk source SHAs from the sync; do not silently incorporate newer upstream code during packaging. If the release version is already published, stop and ask the owner. Never move an existing tag, delete a release, or replace published assets to retry a release.

### 7.2 Merge the Quick Site Version Change

Inspect the version in `content/sites-franklin-commerce/pom.xml` on merged `main`. If it differs from `VERSION`, change only that module's project version on the repository's issue branch. Do not bulk-update other modules or manually change the source template's placeholder `package.json` version: the build stamps the generated manifests from Maven's project version.

If the content PR is already merged, open a version-only follow-up PR with the same Jira link and merge it through normal review and CI. A blocked approval gate requires a maintainer handoff, not an override. The xcom release may be prepared as a draft while this PR is pending, but must not be published yet.

After the version PR merges, fetch Quick Site `main` again and refresh `QUICK_SITE_SHA`. Build from a committed checkout whose Commerce module matches that SHA:

```bash
git -C "$QUICK_SITE_DIR" fetch origin main
QUICK_SITE_SHA=$(git -C "$QUICK_SITE_DIR" rev-parse origin/main)
git -C "$QUICK_SITE_DIR" diff --exit-code "$QUICK_SITE_SHA" -- content/sites-franklin-commerce
BUILD_SHA=$(git -C "$QUICK_SITE_DIR" rev-parse HEAD)
mvn -B -q -f "$QUICK_SITE_DIR/content/sites-franklin-commerce/pom.xml" help:evaluate -Dexpression=project.version -DforceStdout
```

Require the evaluated version to equal `VERSION`. If artifacts were built before the merge, compare `BUILD_SHA` with the merged `QUICK_SITE_SHA` for the whole Commerce module before reusing them; record both commits. Rebuild if that module differs. A one-field version change needs packaging/version verification, not another broad storefront or performance sweep. Retain the agreed functional evidence, explicit waivers, and required repository gates without reinstating waived checks.

### 7.3 Build and Verify Both Templates

```bash
npm_config_ignore_scripts=true npm_config_audit=false npm_config_fund=false \
	mvn -B -ntp -f "$QUICK_SITE_DIR/content/sites-franklin-commerce/pom.xml" clean install

TARGET_DIR="$QUICK_SITE_DIR/content/sites-franklin-commerce/target"
STANDARD_ZIP="$TARGET_DIR/template/aem-sites-commerce-with-edge-delivery-services-template-$VERSION.zip"
PLG_ZIP="$TARGET_DIR/template-plg/aem-sites-commerce-with-edge-delivery-services-template-plg-$VERSION.zip"
sha256sum "$STANDARD_ZIP" "$PLG_ZIP"
```

Require Maven `BUILD SUCCESS`. The standard and PLG template ZIPs contain `package.json`, previews, and `site.zip`; the ordinary `sites-franklin-commerce-$VERSION.zip` is a FileVault content package, not the Sites creation template. Use the versioned template files, not a stale `-latest.zip` from an earlier build.

Verify the actual archives, not just their filenames:

```bash
python3 - "$VERSION" "$STANDARD_ZIP" "$PLG_ZIP" <<'PY'
import io
import json
from pathlib import Path
import sys
import xml.etree.ElementTree as ET
from zipfile import ZipFile

version = sys.argv[1]
names = [
		'aem-sites-commerce-with-edge-delivery-services-template',
		'aem-sites-commerce-with-edge-delivery-services-template-plg',
]
for path, name in zip(sys.argv[2:], names):
		with ZipFile(path) as archive:
				assert archive.testzip() is None, path
				manifest = json.loads(archive.read('package.json'))
				assert manifest['version'] == version, manifest
				assert manifest['name'] == name, manifest
				with ZipFile(io.BytesIO(archive.read('site.zip'))) as site_archive:
						assert site_archive.testzip() is None, path
		print(f'PASS: {name} {version}')
content_zip = Path(sys.argv[2]).parent.parent / f'sites-franklin-commerce-{version}.zip'
with ZipFile(content_zip) as archive:
		assert archive.testzip() is None, str(content_zip)
		properties = ET.fromstring(archive.read('META-INF/vault/properties.xml'))
		assert properties.find("entry[@key='version']").text == version
print('PASS: FileVault package version')
PY
```

Inspect Maven artifact classifiers before any separately authorized deployment. The current Commerce POM attaches both template variants with classifier `template`, so the installed Maven coordinate can contain the PLG ZIP instead of the standard ZIP. Select the public standard template directly from `target/template`; do not deploy both variants under one coordinate or assume the Maven-installed artifact is the standard template.

### 7.4 Prepare the GitHub Draft

Use the standard template as the public asset unless the owner explicitly agrees otherwise. Earlier public releases did not establish PLG as a public asset. Confirm PLG's destination, visibility, consumers, and publication authority separately; building PLG does not authorize uploading it to GitHub or Artifactory.

Prepare public release notes covering the Commerce release label and pinned SHA, Crosswalk adaptations, authoring/content changes, the xcom and Quick Site build/merged SHAs, template version, standard ZIP SHA-256, and migration limitations. Existing forks and AEM sites do not inherit code or template seed content automatically. Include placeholder migration CSVs only when the current changes require them, not by copying old release assets. Keep internal-only URLs, test-customer data, and credentials out of public notes and assets.

Inspect any existing release/tag for `VERSION` before creating a draft. Resume only a matching unpublished draft after verifying its target and assets. Do not create duplicates or use `--clobber` as a retry strategy.

```bash
GH_HOST=github.com gh release create "$VERSION" "$STANDARD_ZIP" \
	--repo "$XCOM_REPO" --draft --target "$XCOM_SHA" \
	--title "Edge Delivery Services with AEM Authoring for Commerce $VERSION" \
	--notes-file "$NOTES_FILE"

GH_HOST=github.com gh release view "$VERSION" --repo "$XCOM_REPO" \
	--json tagName,isDraft,isPrerelease,targetCommitish,assets,url
```

Require the draft target to equal `XCOM_SHA`, the intended asset set only, and the uploaded standard ZIP's size and SHA-256 to match the local artifact. Use the release assets API's `digest` when available; otherwise download the uploaded asset and hash it. Do not publish while any source/version PR, required check, release permission, or asset verification is unresolved.

### 7.5 Publish and Verify the Public Release

Recheck the draft and merged sources immediately before publication. For an owner-approved stable release that should become latest:

```bash
GH_HOST=github.com gh release edit "$VERSION" --repo "$XCOM_REPO" --draft=false --latest
GH_HOST=github.com gh release view "$VERSION" --repo "$XCOM_REPO" \
	--json tagName,isDraft,isPrerelease,publishedAt,url,assets
GH_HOST=github.com gh api "repos/$XCOM_REPO/releases/latest" --jq .tag_name
git -C "$XCOM_DIR" fetch origin "refs/tags/$VERSION:refs/tags/$VERSION"
[[ "$(git -C "$XCOM_DIR" rev-parse "refs/tags/$VERSION^{commit}")" == "$XCOM_SHA" ]]

PUBLIC_ZIP="$(mktemp -d)/$(basename "$STANDARD_ZIP")"
curl --fail --location --output "$PUBLIC_ZIP" \
	"https://github.com/$XCOM_REPO/releases/download/$VERSION/$(basename "$STANDARD_ZIP")"
unzip -tqq "$PUBLIC_ZIP"
cmp "$STANDARD_ZIP" "$PUBLIC_ZIP"
sha256sum "$PUBLIC_ZIP"
```

Require a non-draft, non-prerelease release, the expected latest tag, and a tag that resolves to the pinned xcom commit, including annotated-tag dereferencing. The unauthenticated public ZIP download must match the validated archive byte for byte, which also verifies its previously checked manifest version. Stop and report any failure; do not silently replace a published tag or asset. For a prerelease or a release that must not become latest, agree the flags and corresponding checks with the owner instead of using this stable/latest example.

### 7.6 Record the Closeout

Update Jira with the merged PRs/SHAs, release and download URLs, module/template version, artifact checksum, validation evidence, accepted gaps, and any unpublished PLG work. Change Jira status only with the owner's approval. Report publication separately from deployment: consuming forks, existing AEM sites, Live content, and Quickstart are unchanged unless their updates were separately authorized. Do not delete the disposable test site automatically.