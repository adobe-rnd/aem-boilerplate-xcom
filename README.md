# Edge Delivery Services with AEM Authoring Boilerplate for Commerce

This project boilerplate is for AEM Authoring with Edge Delivery Services (aka Crosswalk) projects that integrate with Adobe Commerce.

## Documentation

Before using the boilerplate, we recommend you to go through the documentation on <https://experienceleague.adobe.com/developer/commerce/storefront/> and more specifically:

1. [Storefront Developer Tutorial](https://experienceleague.adobe.com/developer/commerce/storefront/get-started/)
1. [AEM Docs](https://www.aem.live/docs/)
1. [AEM Developer Tutorial](https://www.aem.live/developer/ue-tutorial)
1. [The Anatomy of an AEM Project](https://www.aem.live/developer/anatomy-of-a-project)
1. [Web Performance](https://www.aem.live/developer/keeping-it-100)
1. [Markup, Sections, Blocks, and Auto Blocking](https://www.aem.live/developer/markup-sections-blocks)

## Getting Started

<!--

## Documentation

Before using the boilerplate, we recommend you to go through the documentation on [WYSIWYG Content Authoring for Edge Delivery Services](https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/edge-delivery/) and more specifically:
1. [Developer Tutorial](https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/edge-delivery/wysiwyg-authoring/edge-dev-getting-started)
2. [Content Modeling](https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/edge-delivery/wysiwyg-authoring/content-modeling)
3. [Creating Blocks](https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/edge-delivery/wysiwyg-authoring/create-block)
4. [Spreadsheets](https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/edge-delivery/wysiwyg-authoring/tabular-data)
5. [Path Mapping](https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/edge-delivery/wysiwyg-authoring/path-mapping)
6. [Folder Mapping](https://www.aem.live/developer/folder-mapping)

Use the [Site Creator Tool](https://da.live/app/adobe-commerce/storefront-tools/tools/site-creator/site-creator) to quickly spin up your own copy of code and content.

-->

Alternatively, you can follow our [Guide](https://experienceleague.adobe.com/developer/commerce/storefront/get-started/) for a more detailed walkthrough.

## Updating Drop-in dependencies

You may need to update one of the drop-in components, or `@adobe/magento-storefront-event-collector` or `@adobe/magento-storefront-events-sdk` to a new version. Besides checking the release notes for any breaking changes, ensure you also execute the `postinstall` script so that the dependenices in your `scripts/__dropins__` directory are updated to the latest build. This should be run immediately after you update the component, for example:

```bash
npm install @dropins/storefront-cart@2.0. # Updates the storefront-cart dependency in node_modules/
npm run postinstall # Copies scripts from node_modules into scripts/__dropins__
```

This is a custom script which copies files out of `node_modules` and into a local directory which EDS can serve. You must manually run `postinstall` due to a design choice in `npm` which does not execute `postinstall` after you install a _specific_ package.

## Changelog

Major changes are described and documented as part of pull requests and tracked via the `changelog` tag. To keep your project up to date, please follow this list:

<https://github.com/hlxsites/aem-boilerplate-commerce/issues?q=label%3Achangelog+is%3Aclosed>
