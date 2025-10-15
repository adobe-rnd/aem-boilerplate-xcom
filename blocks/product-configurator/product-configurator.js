import {
  InLineAlert,
  Icon,
  Button,
  provider as UI,
} from '@dropins/tools/components.js';
import { h } from '@dropins/tools/preact.js';
import { events } from '@dropins/tools/event-bus.js';
import { tryRenderAemAssetsImage } from '@dropins/tools/lib/aem/assets.js';
import * as pdpApi from '@dropins/storefront-pdp/api.js';
import { render as pdpRendered } from '@dropins/storefront-pdp/render.js';
import { render as wishlistRender } from '@dropins/storefront-wishlist/render.js';
import { getHeaders } from '@dropins/tools/lib/aem/configs.js';
import { initializers } from '@dropins/tools/initializer.js';

import { WishlistToggle } from '@dropins/storefront-wishlist/containers/WishlistToggle.js';
import { WishlistAlert } from '@dropins/storefront-wishlist/containers/WishlistAlert.js';

// Containers
import ProductHeader from '@dropins/storefront-pdp/containers/ProductHeader.js';
import ProductPrice from '@dropins/storefront-pdp/containers/ProductPrice.js';
import ProductShortDescription from '@dropins/storefront-pdp/containers/ProductShortDescription.js';
import ProductOptions from '@dropins/storefront-pdp/containers/ProductOptions.js';
import ProductQuantity from '@dropins/storefront-pdp/containers/ProductQuantity.js';
import ProductDescription from '@dropins/storefront-pdp/containers/ProductDescription.js';
import ProductAttributes from '@dropins/storefront-pdp/containers/ProductAttributes.js';
import ProductGallery from '@dropins/storefront-pdp/containers/ProductGallery.js';

// Libs
import {
  rootLink,
  setJsonLd,
  fetchPlaceholders,
  commerceEndpointWithQueryParams,
} from '../../scripts/commerce.js';

// Initializers - Import only cart and wishlist, not PDP (we handle PDP manually)
import '../../scripts/initializers/cart.js';
import '../../scripts/initializers/wishlist.js';

// Import PDP configs directly
export const IMAGES_SIZES = {
  width: 960,
  height: 1191,
};

// Function to update the Add to Cart button text
function updateAddToCartButtonText(addToCartInstance, inCart, labels) {
  const buttonText = inCart
    ? labels.Global?.UpdateProductInCart
    : labels.Global?.AddProductToCart;
  if (addToCartInstance) {
    addToCartInstance.setProps((prev) => ({
      ...prev,
      children: buttonText,
    }));
  }
}

function readBlockConfig(block) {
  const config = {};
  const rows = block.querySelectorAll(':scope > div');
  
  rows.forEach((row) => {
    const cols = row.querySelectorAll(':scope > div');
    if (cols.length >= 2) {
      const key = cols[0].textContent.trim().toLowerCase();
      const value = cols[1].textContent.trim();
      
      // Convert boolean strings
      if (value === 'true') config[key] = true;
      else if (value === 'false') config[key] = false;
      else config[key] = value;
    }
  });
  
  return config;
}

export default async function decorate(block) {
  // PRODUCT CONFIGURATOR - Exact copy of product-details with SKU from Universal Editor
  
  // Get configuration from block authoring
  const config = readBlockConfig(block);
  const { sku } = config;

  // Clear the original configuration divs from Universal Editor
  block.innerHTML = '';

  if (!sku) {
    block.innerHTML = `
      <div class="product-configurator__error">
        <p>Product SKU is required. Please configure it in the Universal Editor.</p>
        <p><small>Enter a valid product SKU to load the product configurator.</small></p>
      </div>
    `;
    return Promise.resolve();
  }

  try {
    // Initialize PDP API manually (without URL dependency)
    await initializePDPForConfigurator();
    
    // Fetch product data using the configured SKU
    const product = await pdpApi.fetchProductData(sku);
    
    if (!product) {
      throw new Error(`Product with SKU ${sku} not found`);
    }

    // Initialize dropins with our specific product data
    await initializePDPDropins(sku, product);

    // Set product data in global state for dropins components
    events.emit('pdp/data', product);
    events.emit('pdp/product-selection', { sku: product.sku });

    // Continue with exact same logic as product-details
    const labels = await fetchPlaceholders();

    // Read itemUid from URL
    const urlParams = new URLSearchParams(window.location.search);
    const itemUidFromUrl = urlParams.get('itemUid');

    // State to track if we are in update mode
    let isUpdateMode = false;

    // Layout - same as product-details but with product-configurator classes
    const fragment = document.createRange().createContextualFragment(`
      <div class="product-configurator__alert"></div>
      <div class="product-configurator__wrapper">
        <div class="product-configurator__left-column">
          <div class="product-configurator__gallery"></div>
        </div>
        <div class="product-configurator__right-column">
          <div class="product-configurator__header"></div>
          <div class="product-configurator__price"></div>
          <div class="product-configurator__gallery"></div>
          <div class="product-configurator__short-description"></div>
          <div class="product-configurator__configuration">
            <div class="product-configurator__options"></div>
            <div class="product-configurator__quantity"></div>
            <div class="product-configurator__buttons">
              <div class="product-configurator__buttons__add-to-cart"></div>
              <div class="product-configurator__buttons__add-to-wishlist"></div>
            </div>
          </div>
          <div class="product-configurator__description"></div>
          <div class="product-configurator__attributes"></div>
        </div>
      </div>
    `);

    const $alert = fragment.querySelector('.product-configurator__alert');
    const $gallery = fragment.querySelector('.product-configurator__gallery');
    const $header = fragment.querySelector('.product-configurator__header');
    const $price = fragment.querySelector('.product-configurator__price');
    const $galleryMobile = fragment.querySelector('.product-configurator__right-column .product-configurator__gallery');
    const $shortDescription = fragment.querySelector('.product-configurator__short-description');
    const $options = fragment.querySelector('.product-configurator__options');
    const $quantity = fragment.querySelector('.product-configurator__quantity');
    const $addToCart = fragment.querySelector('.product-configurator__buttons__add-to-cart');
    const $wishlistToggleBtn = fragment.querySelector('.product-configurator__buttons__add-to-wishlist');
    const $description = fragment.querySelector('.product-configurator__description');
    const $attributes = fragment.querySelector('.product-configurator__attributes');

    block.appendChild(fragment);

    const gallerySlots = {
      CarouselThumbnail: (ctx) => {
        tryRenderAemAssetsImage(ctx, {
          ...imageSlotConfig(ctx),
          wrapper: document.createElement('span'),
        });
      },

      CarouselMainImage: (ctx) => {
        tryRenderAemAssetsImage(ctx, {
          ...imageSlotConfig(ctx),
        });
      },
    };

    // Alert
    let inlineAlert = null;
    const routeToWishlist = '/wishlist';

    const [
      _galleryMobile,
      _gallery,
      _header,
      _price,
      _shortDescription,
      _options,
      _quantity,
      _description,
      _attributes,
      wishlistToggleBtn,
    ] = await Promise.all([
      // Gallery (Mobile)
      pdpRendered.render(ProductGallery, {
        controls: 'dots',
        arrows: true,
        peak: false,
        gap: 'small',
        loop: false,
        imageParams: {
          ...IMAGES_SIZES,
        },

        slots: gallerySlots,
      })($galleryMobile),

      // Gallery (Desktop)
      pdpRendered.render(ProductGallery, {
        controls: 'thumbnailsColumn',
        arrows: true,
        peak: true,
        gap: 'small',
        loop: false,
        imageParams: {
          ...IMAGES_SIZES,
        },

        slots: gallerySlots,
      })($gallery),

      // Header
      pdpRendered.render(ProductHeader, {})($header),

      // Price
      pdpRendered.render(ProductPrice, {})($price),

      // Short Description
      pdpRendered.render(ProductShortDescription, {})($shortDescription),

      // Configuration - Swatches
      pdpRendered.render(ProductOptions, {
        hideSelectedValue: false,
        slots: {
          SwatchImage: (ctx) => {
            tryRenderAemAssetsImage(ctx, {
              ...imageSlotConfig(ctx),
              wrapper: document.createElement('span'),
            });
          },
        },
      })($options),

      // Configuration  Quantity
      pdpRendered.render(ProductQuantity, {})($quantity),

      // Description
      pdpRendered.render(ProductDescription, {})($description),

      // Attributes
      pdpRendered.render(ProductAttributes, {})($attributes),

      // Wishlist button - WishlistToggle Container
      wishlistRender.render(WishlistToggle, {
        product,
      })($wishlistToggleBtn),
    ]);

    // Configuration – Button - Add to Cart
    const addToCart = await UI.render(Button, {
      children: labels.Global?.AddProductToCart,
      icon: h(Icon, { source: 'Cart' }),
      onClick: async () => {
        const buttonActionText = isUpdateMode
          ? labels.Global?.UpdatingInCart
          : labels.Global?.AddingToCart;
        try {
          addToCart.setProps((prev) => ({
            ...prev,
            children: buttonActionText,
            disabled: true,
          }));

          // get the current selection values
          const values = pdpApi.getProductConfigurationValues();
          const valid = pdpApi.isProductConfigurationValid();

          // add or update the product in the cart
          if (valid) {
            if (isUpdateMode) {
              // --- Update existing item ---
              const { updateProductsFromCart } = await import(
                '@dropins/storefront-cart/api.js'
              );

              await updateProductsFromCart([{ ...values, uid: itemUidFromUrl }]);

              // --- START REDIRECT ON UPDATE ---
              const updatedSku = values?.sku;
              if (updatedSku) {
                const cartRedirectUrl = new URL(
                  rootLink('/cart'),
                  window.location.origin,
                );
                cartRedirectUrl.searchParams.set('itemUid', itemUidFromUrl);
                window.location.href = cartRedirectUrl.toString();
              } else {
                // Fallback if SKU is somehow missing (shouldn't happen in normal flow)
                console.warn(
                  'Could not retrieve SKU for updated item. Redirecting to cart without parameter.',
                );
                window.location.href = rootLink('/cart');
              }
              return;
            }
            // --- Add new item ---
            const { addProductsToCart } = await import(
              '@dropins/storefront-cart/api.js'
            );
            await addProductsToCart([{ ...values }]);
          }

          // reset any previous alerts if successful
          inlineAlert?.remove();
        } catch (error) {
          // add alert message
          inlineAlert = await UI.render(InLineAlert, {
            heading: 'Error',
            description: error.message,
            icon: h(Icon, { source: 'Warning' }),
            'aria-live': 'assertive',
            role: 'alert',
            onDismiss: () => {
              inlineAlert.remove();
            },
          })($alert);

          // Scroll the alertWrapper into view
          $alert.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        } finally {
          // Reset button text using the helper function which respects the current mode
          updateAddToCartButtonText(addToCart, isUpdateMode, labels);
          // Re-enable button
          addToCart.setProps((prev) => ({
            ...prev,
            disabled: false,
          }));
        }
      },
    })($addToCart);

    // Lifecycle Events
    events.on('pdp/valid', (valid) => {
      // update add to cart button disabled state based on product selection validity
      addToCart.setProps((prev) => ({ ...prev, disabled: !valid }));
    }, { eager: true });

    // Handle option changes
    events.on('pdp/values', () => {
      if (wishlistToggleBtn) {
        const configValues = pdpApi.getProductConfigurationValues();

        // Check URL parameter for empty optionsUIDs
        const urlOptionsUIDs = urlParams.get('optionsUIDs');

        // If URL has empty optionsUIDs parameter, treat as base product (no options)
        const optionUIDs = urlOptionsUIDs === '' ? undefined : (configValues?.optionsUIDs || undefined);

        wishlistToggleBtn.setProps((prev) => ({
          ...prev,
          product: {
            ...product,
            optionUIDs,
          },
        }));
      }
    }, { eager: true });

    events.on('wishlist/alert', ({ action, item }) => {
      wishlistRender.render(WishlistAlert, {
        action,
        item,
        routeToWishlist,
      })($alert);

      setTimeout(() => {
        $alert.innerHTML = '';
      }, 5000);

      setTimeout(() => {
        $alert.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 0);
    });

    // --- Add new event listener for cart/data ---
    events.on(
      'cart/data',
      (cartData) => {
        let itemIsInCart = false;
        if (itemUidFromUrl && cartData?.items) {
          itemIsInCart = cartData.items.some(
            (item) => item.uid === itemUidFromUrl,
          );
        }
        // Set the update mode state
        isUpdateMode = itemIsInCart;

        // Update button text based on whether the item is in the cart
        updateAddToCartButtonText(addToCart, itemIsInCart, labels);
      },
      { eager: true },
    );

    // Set JSON-LD and Meta Tags - only if no product-details component exists
    events.on('aem/lcp', () => {
      if (product) {
        const productDetailsExists = document.querySelector('.product-details');
        if (!productDetailsExists) {
          setJsonLdProduct(product);
          setMetaTags(product);
          document.title = product.name;
        }
      }
    }, { eager: true });

    return Promise.resolve();
    
  } catch (error) {
    console.error('Error loading product configurator:', error);
    block.innerHTML = `
      <div class="product-configurator__error">
        <p>Error loading product: ${error.message}</p>
        <p><small>Please check that the SKU "${sku}" is valid and available.</small></p>
      </div>
    `;
    return Promise.resolve();
  }
}

async function setJsonLdProduct(product) {
  const {
    name,
    inStock,
    description,
    sku,
    urlKey,
    price,
    priceRange,
    images,
    attributes,
  } = product;
  const amount = priceRange?.minimum?.final?.amount || price?.final?.amount;
  const brand = attributes.find((attr) => attr.name === 'brand');

  // get variants
  const { data } = await pdpApi.fetchGraphQl(`
    query GET_PRODUCT_VARIANTS($sku: String!) {
      variants(sku: $sku) {
        variants {
          product {
            sku
            name
            inStock
            images(roles: ["image"]) {
              url
            }
            ...on SimpleProductView {
              price {
                final { amount { currency value } }
              }
            }
          }
        }
      }
    }
  `, {
    method: 'GET',
    variables: { sku },
  });

  const variants = data?.variants?.variants || [];

  const ldJson = {
    '@context': 'http://schema.org',
    '@type': 'Product',
    name,
    description,
    image: images[0]?.url,
    offers: [],
    productID: sku,
    brand: {
      '@type': 'Brand',
      name: brand?.value,
    },
    url: new URL(rootLink(`/products/${urlKey}/${sku}`), window.location),
    sku,
    '@id': new URL(rootLink(`/products/${urlKey}/${sku}`), window.location),
  };

  if (variants.length > 1) {
    ldJson.offers.push(...variants.map((variant) => ({
      '@type': 'Offer',
      name: variant.product.name,
      image: variant.product.images[0]?.url,
      price: variant.product.price.final.amount.value,
      priceCurrency: variant.product.price.final.amount.currency,
      availability: variant.product.inStock ? 'http://schema.org/InStock' : 'http://schema.org/OutOfStock',
      sku: variant.product.sku,
    })));
  } else {
    ldJson.offers.push({
      '@type': 'Offer',
      price: amount?.value,
      priceCurrency: amount?.currency,
      availability: inStock ? 'http://schema.org/InStock' : 'http://schema.org/OutOfStock',
    });
  }

  setJsonLd(ldJson, 'product');
}

function createMetaTag(property, content, type) {
  if (!property || !type) {
    return;
  }
  let meta = document.head.querySelector(`meta[${type}="${property}"]`);
  if (meta) {
    if (!content) {
      meta.remove();
      return;
    }
    meta.setAttribute(type, property);
    meta.setAttribute('content', content);
    return;
  }
  if (!content) {
    return;
  }
  meta = document.createElement('meta');
  meta.setAttribute(type, property);
  meta.setAttribute('content', content);
  document.head.appendChild(meta);
}

function setMetaTags(product) {
  if (!product) {
    return;
  }

  const price = product.prices.final.minimumAmount ?? product.prices.final.amount;

  createMetaTag('title', product.metaTitle || product.name, 'name');
  createMetaTag('description', product.metaDescription, 'name');
  createMetaTag('keywords', product.metaKeyword, 'name');

  createMetaTag('og:type', 'product', 'property');
  createMetaTag('og:description', product.shortDescription, 'property');
  createMetaTag('og:title', product.metaTitle || product.name, 'property');
  createMetaTag('og:url', window.location.href, 'property');
  const mainImage = product?.images?.filter((image) => image.roles.includes('thumbnail'))[0];
  const metaImage = mainImage?.url || product?.images[0]?.url;
  createMetaTag('og:image', metaImage, 'property');
  createMetaTag('og:image:secure_url', metaImage, 'property');
  createMetaTag('product:price:amount', price.value, 'property');
  createMetaTag('product:price:currency', price.currency, 'property');
}

/**
 * Initialize PDP API without URL dependency
 */
async function initializePDPForConfigurator() {
  try {
    // Set Fetch Endpoint (Service) - only if not already set
    const currentEndpoint = pdpApi.getEndpoint?.();
    if (!currentEndpoint) {
      pdpApi.setEndpoint(await commerceEndpointWithQueryParams());
    }

    // Set Fetch Headers (Service)
    pdpApi.setFetchGraphQlHeaders((prev) => ({ ...prev, ...getHeaders('cs') }));
  } catch (error) {
    console.warn('PDP API already initialized, skipping configurator initialization');
  }
}

/**
 * Initialize PDP Dropins with specific product data
 */
async function initializePDPDropins(sku, product) {
  const labels = await fetchPlaceholders('placeholders/pdp.json');

  const langDefinitions = {
    default: {
      ...labels,
    },
  };

  const models = {
    ProductDetails: {
      initialData: { ...product },
    },
  };

  // Initialize Dropins with our specific product data
  return initializers.mountImmediately(pdpApi.initialize, {
    sku,
    optionsUIDs: [], // No URL-based options for configurator
    langDefinitions,
    models,
    acdl: true,
    persistURLParams: false, // Don't persist URL params for configurator
  });
}

/**
 * Returns the configuration for an image slot.
 * @param ctx - The context of the slot.
 * @returns The configuration for the image slot.
 */
function imageSlotConfig(ctx) {
  const { data, defaultImageProps } = ctx;
  return {
    alias: data.sku,
    imageProps: defaultImageProps,

    params: {
      width: defaultImageProps.width,
      height: defaultImageProps.height,
    },
  };
}