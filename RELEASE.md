# Sync and Release

## 1. Check Out the Repositories

Clone these repositories next to each other, then enter xcom:

```bash
git clone https://github.com/adobe-rnd/aem-boilerplate-xcom.git
git clone https://git.corp.adobe.com/CQ/sites-franklin.git
cd aem-boilerplate-xcom
```

If you already have the checkouts, start with clean working trees and current `main` branches.

## 2. Check Access

You need the following access:

- Branch/PR access to both repositories and read access to the [Commerce](https://github.com/hlxsites/aem-boilerplate-commerce) and [Crosswalk](https://github.com/adobe-rnd/aem-boilerplate-xwalk) upstreams.
- Permission to merge PRs in both repositories and create tags and publish releases in xcom.
- Access to Jira and an issue for the task. Create one if it does not exist.

## 3. Start the Assistant

From the xcom checkout, start a coding assistant with file and terminal access to both repositories. Give it this prompt, replacing the placeholders:

```text
Use the xcom-commerce-sync skill to guide me through the next sync and release.
Read .github/skills/xcom-commerce-sync/SKILL.md and its linked checklist.

Jira: <issue>
Quick Site checkout: ../sites-franklin

Check both upstream main branches and pin the source commits.
Guide me through implementation, validation, PRs, and release preparation.
Agree the validation scope with me; AEM test-site validation is optional.
Ask before committing, pushing, merging, or publishing.
```

The assistant follows the [sync skill](.github/skills/xcom-commerce-sync/SKILL.md) and [validation/release checklist](.github/skills/xcom-commerce-sync/references/validation.md). It checks the setup, compares upstream changes, resolves integration changes, regenerates assets/models, updates Quick Site content, and runs the agreed checks.

## 4. Validate the Test Site (Optional)

Decide with the assistant whether this sync needs cloud validation. You can skip this step for a small sync delta or if no AEM test environment is available. Still run the agreed local checks, builds, and required CI, and record any unverified flows or accepted gaps.

If you run this step, you need:

- Permission to create a test repository and grant the AEM Code Sync GitHub app access to it.
- An AEM Cloud test environment with Author and Universal Editor access, template upload, site creation/configuration, and Preview publication permissions.
- Helix Admin configuration access for the test site. An [example Commerce setup](.github/skills/xcom-commerce-sync/references/validation.md#example-commerce-configuration) is provided in the checklist.

Give the assistant the AEM Author URL, then follow its guidance to create a test repository from the xcom template and deploy the candidate code there. Upload the updated Quick Site template ZIP in AEM, create a disposable site, and configure its repository, branch, and Commerce endpoints. The [setup checklist](.github/skills/xcom-commerce-sync/references/validation.md#3-aem-cloud-setup) gives the exact steps.

The assistant builds the packages and helps with deployment and testing where its tools allow. Complete sign-ins yourself, perform any browser steps it cannot automate, and validate the agreed flows in Author, Universal Editor, and Preview. Review the results before proceeding. Keep Live untouched; authorize any sandbox test order separately.

## 5. Review, Merge, and Release

1. Authorize the assistant to commit, push, and open the linked PRs. Get review if needed and address any feedback; required repository approvals and checks still apply.
2. Once required checks and approvals are satisfied, authorize merging xcom first with a merge commit, not squash, then the dependent Quick Site PR.
3. Agree the release version. The assistant prepares any required Quick Site version-bump PR, builds and verifies the templates, and creates a release draft. The xcom release/tag and Quick Site template versions match; xcom's npm version stays at the selected upstream Commerce version.
4. After all required PRs are merged, authorize publication. The assistant publishes the approved standard template, verifies the public tag/download/checksum, and records the release in Jira.

PLG publication requires a separately agreed destination and approval. This process does not release Franklin runtime bundles or Quickstart, or automatically update existing forks and AEM sites.