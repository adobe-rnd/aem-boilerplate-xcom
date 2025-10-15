# Product Configurator Block

The Product Configurator block is designed to display complex/configurable products with options (like color variants) and allows users to select different configurations while dynamically updating the product image and details.

## Features

- **Complex Product Support**: Works with GraphQL queries for configurable products
- **Color Swatches**: Displays color options as visual swatches with actual color values
- **Dynamic Image Switching**: Changes product image when color options are selected
- **Stock Status**: Shows availability for each option variant
- **Add to Cart**: Supports adding configured products to cart with selected options
- **Wishlist Integration**: Allows adding configured products to wishlist
- **Responsive Design**: Works across different screen sizes
- **Accessibility**: Full keyboard navigation and screen reader support

## Usage

### Basic Usage

```html
<div class="product-configurator">
  <div>sku</div>
  <div>COMPLEX_PRODUCT_SKU</div>
</div>
```

### Advanced Configuration

```html
<div class="product-configurator">
  <div>sku</div>
  <div>COMPLEX_PRODUCT_SKU</div>
  <div>layout</div>
  <div>horizontal</div>
  <div>showprice</div>
  <div>true</div>
  <div>showaddtocart</div>
  <div>true</div>
  <div>showwishlist</div>
  <div>true</div>
  <div>showstock</div>
  <div>true</div>
</div>
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `sku` | string | required | SKU of the complex/configurable product |
| `layout` | string | `card` | Layout style: `card`, `horizontal`, `compact` |
| `showprice` | boolean | `true` | Display product price range |
| `showaddtocart` | boolean | `true` | Show add to cart button |
| `showwishlist` | boolean | `false` | Show wishlist toggle |
| `showstock` | boolean | `true` | Display stock status |

## Layout Options

### Card Layout (Default)
- Vertical layout with image on top
- Full-width content area below
- Ideal for product grids

### Horizontal Layout
- Side-by-side image and content
- Compact presentation
- Good for product lists

### Compact Layout
- Smaller dimensions
- Reduced padding and spacing
- Perfect for related products or recommendations

## Color Swatch Behavior

The block automatically detects color options in the product data and renders them as:

1. **Color Swatches**: For `ProductViewOptionValueSwatch` with color values
   - Displays actual color using CSS `background-color`
   - Supports hex values (#FF0000), RGB values, and CSS color names
   - Shows selection state with border styling
   - Indicates out-of-stock with strikethrough overlay

2. **Text Options**: For other option types
   - Displays as clickable text buttons
   - Shows selection and stock states

## Image Switching Logic

When a color option is selected:

1. Searches for product images with matching color in:
   - Image `label` field
   - Image `roles` array
2. Falls back to main product image if no color-specific image found
3. Smoothly transitions between images with loading states

## GraphQL Integration

The block uses the existing PDP (Product Detail Page) GraphQL infrastructure:

- Fetches complex product data via `pdpApi.fetchProductData(sku)`
- Uses `PRODUCT_OPTION_FRAGMENT` for option data
- Supports `ProductViewOptionValueSwatch` for color swatches
- Integrates with cart and wishlist APIs

## Events

The block emits the following events for analytics:

### Option Selection
```javascript
events.emit('product-configurator/option-selected', {
  productSku: 'PRODUCT_SKU',
  optionId: 'color',
  optionTitle: 'Color',
  valueId: 'red',
  valueTitle: 'Red',
  selectedOptions: { color: 'red', size: 'large' }
});
```

### Add to Cart
```javascript
events.emit('cart/add', {
  sku: 'PRODUCT_SKU',
  name: 'Product Name',
  quantity: 1,
  selectedOptions: { color: 'red', size: 'large' }
});
```

### Product View Navigation
```javascript
events.emit('product/view', {
  sku: 'PRODUCT_SKU',
  name: 'Product Name',
  source: 'product-configurator',
  selectedOptions: { color: 'red', size: 'large' }
});
```

## Styling Customization

The block uses CSS custom properties that can be overridden:

```css
.product-configurator {
  --swatch-size: 32px;
  --swatch-border-width: 2px;
  --selected-border-color: var(--color-brand-500);
}
```

## Error Handling

The block handles various error scenarios:

- **Invalid SKU**: Shows error message if product not found
- **Non-configurable Product**: Displays error for simple products
- **Network Errors**: Graceful fallback with error display
- **Add to Cart Errors**: Shows temporary error state on button

## Accessibility

- Full keyboard navigation support
- ARIA labels and roles
- Focus management
- Screen reader announcements
- High contrast mode support
- Reduced motion respect

## Browser Support

- Modern browsers with ES6+ support
- CSS Grid and Flexbox support required
- Async/await JavaScript support required

## Example Product Types

This block works best with:
- Configurable products with color variants
- Products with multiple images per color
- Complex products with size and color options
- Any product with `ProductViewOptionValueSwatch` options
