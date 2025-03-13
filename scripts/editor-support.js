import {
  decorateBlock,
  decorateBlocks,
  decorateButtons,
  decorateIcons,
  decorateSections,
  loadBlock,
  loadSections,
} from './aem.js';
import { decorateRichtext } from './editor-support-rte.js';
import { decorateMain } from './scripts.js';

window.xwalk = window.xwalk || {};
window.xwalk.isAuthorEnv = true;
window.xwalk.previewSku = '24-MB03';
window.hlx.aemRoot = '/content/xwalk-commerce';

// set the filter for an UE editable
function setUEFilter(element, filter) {
  element.dataset.aueFilter = filter;
}

/**
 * See:
 * https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/implementing/developing/universal-editor/attributes-types#data-properties
 */
function updateUEInstrumentation() {
  const main = document.querySelector('main');
  const template = document.querySelector('meta[name="template"]')?.content;
  const sections = main.querySelectorAll('[data-aue-model$="section"]');
  const templates = ['order-details', 'enrichment', 'pdp', 'cart', 'mini-cart', 'plp',
    'checkout', 'search-order', 'search', 'login', 'forgot-password', 'create-account',
    'account', 'orders', 'address', 'returns', 'account-order-details', 'order-status',
    'create-return', 'return-details', 'confirm-account', 'create-password'];
  const columnTemplates = ['account', 'orders', 'address', 'returns', 'account-order-details'];

  // updated section filters according to the template
  if (templates.includes(template)) {
    // update section filters
    sections.forEach((section) => {
      setUEFilter(section, `${template}-section`);
    });
  }

  // templates with column design have additional section type
  if (columnTemplates.includes(template)) {
    setUEFilter(main, 'columns-main');
  }
}

async function applyChanges(event) {
  // redecorate default content and blocks on patches (in the properties rail)
  const { detail } = event;

  const resource = detail?.request?.target?.resource // update, patch components
    || detail?.request?.target?.container?.resource // update, patch, add to sections
    || detail?.request?.to?.container?.resource; // move in sections
  if (!resource) return false;
  const updates = detail?.response?.updates;
  if (!updates.length) return false;
  const { content } = updates[0];
  if (!content) return false;

  const parsedUpdate = new DOMParser().parseFromString(content, 'text/html');
  const element = document.querySelector(`[data-aue-resource="${resource}"]`);

  if (element) {
    if (element.matches('main')) {
      const newMain = parsedUpdate.querySelector(`[data-aue-resource="${resource}"]`);
      newMain.style.display = 'none';
      element.insertAdjacentElement('afterend', newMain);
      decorateMain(newMain);
      decorateRichtext(newMain);
      await loadSections(newMain);
      element.remove();
      newMain.style.display = null;
      // eslint-disable-next-line no-use-before-define
      attachEventListners(newMain);
      return true;
    }

    const block = element.parentElement?.closest('.block[data-aue-resource]') || element?.closest('.block[data-aue-resource]');
    if (block) {
      const blockResource = block.getAttribute('data-aue-resource');
      const newBlock = parsedUpdate.querySelector(`[data-aue-resource="${blockResource}"]`);
      if (newBlock) {
        newBlock.style.display = 'none';
        block.insertAdjacentElement('afterend', newBlock);
        decorateButtons(newBlock);
        decorateIcons(newBlock);
        decorateBlock(newBlock);
        decorateRichtext(newBlock);
        await loadBlock(newBlock);
        block.remove();
        newBlock.style.display = null;
        return true;
      }
    } else {
      // sections and default content, may be multiple in the case of richtext
      const newElements = parsedUpdate.querySelectorAll(`[data-aue-resource="${resource}"],[data-richtext-resource="${resource}"]`);
      if (newElements.length) {
        const { parentElement } = element;
        if (element.matches('.section')) {
          const [newSection] = newElements;
          newSection.style.display = 'none';
          element.insertAdjacentElement('afterend', newSection);
          decorateButtons(newSection);
          decorateIcons(newSection);
          decorateRichtext(newSection);
          decorateSections(parentElement);
          decorateBlocks(parentElement);
          await loadSections(parentElement);
          element.remove();
          newSection.style.display = null;
        } else {
          element.replaceWith(...newElements);
          decorateButtons(parentElement);
          decorateIcons(parentElement);
          decorateRichtext(parentElement);
        }
        return true;
      }
    }
  }

  return false;
}

function attachEventListners(main) {
  [
    'aue:content-patch',
    'aue:content-update',
    'aue:content-add',
    'aue:content-move',
    'aue:content-remove',
    'aue:content-copy',
  ].forEach((eventType) => main?.addEventListener(eventType, async (event) => {
    event.stopPropagation();
    const applied = await applyChanges(event);
    if (applied) {
      updateUEInstrumentation();
    } else {
      window.location.reload();
    }
  }));
}

attachEventListners(document.querySelector('main'));

// update UE component filters on page load
updateUEInstrumentation();
