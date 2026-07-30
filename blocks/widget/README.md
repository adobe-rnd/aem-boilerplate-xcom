# Widget Block

## Overview

The Widget block is an auto-block (not directly authored) that turns any link pointing at `/widgets/...` into a self-contained HTML/CSS/JS fragment loaded from that path. It lets authors embed a reusable, independently-versioned widget by pasting a single link, similar to the `fragment` auto-block but for standalone assets rather than page content.

## Usage

Authoring a link such as `/widgets/promo/banner.html` (or a URL with query parameters) is automatically converted into a `widget` block by `buildWidgetAutoBlocks()` in `scripts/scripts.js` during eager loading. No manual block authoring or UE model is provided for this block.

## Integration

### Behavior

- The block resolves the link's pathname into a widget path/name pair (everything after `/widgets/` up to the file name, minus its extension)
- It fetches and inlines `{widgetPath}/{widgetName}.html`, loads `{widgetPath}/{widgetName}.css` via `loadCSS`, and dynamically imports `{widgetPath}/{widgetName}.js`, running the module's default export (if present) against the block element
- After decoration, the block element and its wrapper/container elements are renamed from `widget`/`widget-wrapper`/`widget-container` to `{widgetName}`/`{widgetName}-wrapper`/`{widgetName}-container`, and the `widget` class is removed from the block element
- Query parameters on the original link are copied onto the block element as `data-*` attributes (e.g. `?variant=dark` becomes `data-variant="dark"`)
- The original link's `href` is preserved on the block as `data-source`

### Error Handling

- If the widget's HTML/CSS/JS fails to load, the fetch/import rejection is caught and logged via `console.error`; the block is left without decoration rather than throwing
