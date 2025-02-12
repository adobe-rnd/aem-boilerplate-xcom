import { getMetadata } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 *
 * @param {Element} block
 */
export default async function decorate(block) {
  const aemauthorurl = getMetadata('authorurl') || '';
  const aempublishurl = getMetadata('publishurl') || '';
  const persistedquery = '/graphql/execute.json/citisignal-marketing/offerByPath';
  const contentPath = block.querySelector(':scope div:nth-child(1) > div a')?.textContent?.trim();
  const variationname =
    block
      .querySelector(':scope div:nth-child(2) > div')
      ?.textContent?.trim()
      ?.toLowerCase()
      ?.replace(' ', '_') || 'master';
  block.innerHTML = '';
  const isAuthor = document.querySelector('*[data-aue-resource]') !== null;
  const url = window?.location?.origin?.includes('author')
    ? `${aemauthorurl}${persistedquery};path=${contentPath};variation=${variationname};ts=${
      Math.random() * 1000
    }`
    : `${aempublishurl}${persistedquery};path=${contentPath};variation=${variationname};ts=${
      Math.random() * 1000
    }`;
  const options = { credentials: 'include' };

  const cfReq = await fetch(url, options)
    .then((response) => response.json())
    .then((contentfragment) => {
      let offer = '';
      if (contentfragment.data) {
        offer = contentfragment.data[Object.keys(contentfragment.data)[0]].item;
      }
      return offer;
    });
  const itemId = `urn:aemconnection:${contentPath}/jcr:content/data/${variationname}`;
  block.setAttribute('data-aue-type', 'container');
  block.innerHTML = `
  <div class='banner-content block' data-aue-resource=${itemId} data-aue-label="offer content fragment" data-aue-type="reference" data-aue-filter="cf">
		<div class='banner-detail' style="background-image: linear-gradient(90deg,rgba(0,0,0,0.6), rgba(0,0,0,0.1) 80%) ,url(${
      aemauthorurl + cfReq.heroImage?._path
    });">
        <p data-aue-prop="headline" data-aue-label="headline" data-aue-type="text" class='pretitle'>${
          cfReq?.headline
        }</p>
        <p data-aue-prop="pretitle" data-aue-label="pretitle" data-aue-type="text" class='headline'>${
          cfReq?.pretitle
        }</p>
        <p data-aue-prop="detail" data-aue-label="detail" data-aue-type="richtext" class='detail'>${
          cfReq?.detail?.plaintext
        }</p>

      </div>
      <div class='banner-logo'>
      </div>
  </div>
	`;
  if (!isAuthor) {
    moveInstrumentation(block, null);
    block.querySelectorAll('*').forEach((elem) => moveInstrumentation(elem, null));
  }
}