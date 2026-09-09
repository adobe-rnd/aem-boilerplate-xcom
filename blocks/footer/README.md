# Footer Block

## Overview

The Footer block loads the configured footer fragment and decorates its content. On multistore sites it also provides a store-view switcher backed by the store-switcher fragment.

## Configuration

The block reads the `footer` metadata value for the footer fragment path. When it is not set, it loads `/footer`.

## Behavior

- Loads and renders the footer fragment.
- Resolves store links against the current site root.
- Renders the store-view switcher when multistore mode is enabled.
- Supports keyboard and pointer interaction for store-region expansion.
- Opens store selection in a modal.

## Dependencies

- `fragment/fragment.js` for fragment loading.
- `scripts/site-root.js` for site-root-aware links.
- Commerce drop-in components for the store switcher button.
- The store-switcher fragment when multistore mode is enabled.

## Error Handling

If the store-switcher fragment cannot be loaded, the store switcher is skipped and the error is logged. The footer fragment continues to render when available.
