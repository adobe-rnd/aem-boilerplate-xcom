# Fragment Block

Includes reusable content from another page as a fragment. Supports content reuse across pages and templates.

## Configuration

| Option | Description |
|--------|-------------|
| Reference | An AEM content reference to the fragment page |

## Behavior

The block fetches the referenced page, decorates its main content sections, and injects them into the page in place of the fragment block. The fragment's sections inherit the styles and scripts of the containing page.
