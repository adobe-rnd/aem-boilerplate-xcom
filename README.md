# WIP: Crosswalk + Adobe Commerce Boilerplate
This project boilerplate is for AEM Authoring with Edge Delivery Services (aka Crosswalk) projects that integrate with Adobe Commerce.

## Documentation
https://experienceleague.adobe.com/developer/commerce/storefront/

## Environments
- Preview: https://main--{repo}--{owner}.aem.page/
- Live: https://main--{repo}--{owner}.aem.live/

## Pre-requisites

Out of the box, this project template uses a pre-configured Adobe Commerce environment. If you want to use your own Adobe Commerce environment, you'll need to update the `configuration` spreadsheet in your AEM site to have values that match your environment.

Additionally, you need to have the following modules and customizations installed on your environment:

1. adobe-commerce/storefront-compatibility: Contains changes to the Adobe Commerce GraphQL API that enable drop-ins functionality.
1. magento/module-data-services-graphql: Commerce module with the functionality necessary for adding context to events.
1. magento/module-page-builder-product-recommendations: Commerce module required for PRex Widget
1. magento/module-visual-product-recommendations: Commerce module required for PRex Widget
<!-- 1. TODO: Add further prereqs.  -->

## Documentation

Before using the boilerplate, we recommend you to go through the documentation on [WYSIWYG Content Authoring for Edge Delivery Services](https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/edge-delivery/) and more specifically:
1. [Developer Tutorial](https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/edge-delivery/wysiwyg-authoring/edge-dev-getting-started)
2. [Content Modeling](https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/edge-delivery/wysiwyg-authoring/content-modeling)
3. [Creating Blocks](https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/edge-delivery/wysiwyg-authoring/create-block)
4. [Spreadsheets](https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/edge-delivery/wysiwyg-authoring/tabular-data)
5. [Path Mapping](https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/edge-delivery/wysiwyg-authoring/path-mapping)
6. [Folder Mapping](https://www.aem.live/developer/folder-mapping)
## Installation

```sh
npm i 
```

## Updating Drop-in dependencies

You may need to update one of the drop-in components, or `@adobe/magento-storefront-event-collector` or `@adobe/magento-storefront-events-sdk` to a new version. Besides checking the release notes for any breaking changes, ensure you also execute the `postinstall` script so that the dependenices in your `scripts/__dropins__` directory are updated to the latest build. This should be run immediately after you update the component, for example:

```
npm install @dropins/storefront-cart@2.0. # Updates the storefront-cart dependency in node_modules/
npm run postinstall # Copies scripts from node_modules into scripts/__dropins__
```

This is a custom script which copies files out of `node_modules` and into a local directory which EDS can serve. You must manually run `postinstall` due to a design choice in `npm` which does not execute `postinstall` after you install a _specific_ package.

## Linting

```sh
npm run lint
```

## Setup

See also [Developer Tutorial](https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/edge-delivery/wysiwyg-authoring/edge-dev-getting-started)

1. Create a new repository based on the `aem-boilerplate-xwalk-commerce` template 
2. Install all dependencies using `npm i`.
3. Add the [AEM Code Sync GitHub App](https://github.com/apps/aem-code-sync) to the repository, so your code changes get synced with EDS.
5. [todo] create a new site in AEM using the site template XXX
4. Update the mountpoint in `fstab.yaml`
5. Update the path mappings in `paths.json`
6. Update your Adobe Commerce SaaS configuration in the `configuration` sheet in your AEM site.
