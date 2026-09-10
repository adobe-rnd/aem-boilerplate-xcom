# Enrichment Block

Conditionally replaces a block with product-specific content loaded from a fragment. Used on Product Detail Pages (PDP) and Product List Pages (PLP) to inject targeted merchandising content based on the current product SKU or category URL.

## Configuration

| Option | Description |
|--------|-------------|
| `type` | The enrichment type (e.g., `pdp`, `plp`) |
| `position` | Placement position used to match enrichment fragments |

## Behavior

In the Universal Editor (author environment), the block renders as a placeholder and is not replaced with enrichment content. In the live site, the block fetches a matching fragment from the enrichment index and replaces itself with the fragment's content.
