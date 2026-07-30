# Modal Block

## Overview

The Modal block is a programmatic dialog helper used by other blocks (for example the mini-PDP edit flow) to render arbitrary content in a native `<dialog>` overlay. It is not authored directly in content; blocks call `createModal(contentNodes)` to build and control an instance.

## Integration

### API

`createModal(contentNodes)` returns:

| Member | Type | Description |
|--------|------|--------------|
| `block` | `Element` | The `.modal` block element appended to `main` |
| `showModal()` | function | Opens the dialog, resets scroll position, and focuses the first input once content renders |
| `removeModal()` | function | Closes the dialog and unmounts any drop-in containers inside it |

### Events

#### Event Emitters

- `close` - Dispatched on the block element when the dialog closes, with `detail.reason` set to `'button'`, `'backdrop'`, or `''` depending on how the dialog was dismissed

## Behavior Patterns

### User Interaction Flows

1. **Open**: Caller invokes `showModal()`; the dialog is shown and `modal-open` is added to `document.body`
2. **Close via button**: Clicking the close button closes the dialog with reason `'button'`
3. **Close via backdrop**: A mouse click (not touch) outside the dialog bounds closes it with reason `'backdrop'`
4. **Close cleanup**: On close, `modal-open` is removed from `document.body`, any `[data-dropin-container]` elements inside the dialog are unmounted via `Render.unmount`, and the block element is removed from the DOM

### Error Handling

- Backdrop-close detection is gated on `event.pointerType !== 'mouse'` so touch taps that merely scroll content don't unintentionally dismiss the dialog
- Focus-on-open uses a `MutationObserver` that disconnects itself once the first input is found, avoiding leaked observers when content has no inputs
