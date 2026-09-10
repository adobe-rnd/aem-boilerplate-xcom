import { getRootPath } from '@dropins/tools/lib/aem/configs.js';

const RESOURCE_SUFFIX = '.resource';

export default function getSiteRootPath() {
  const configuredRoot = getRootPath();
  const codeBasePath = window.hlx?.codeBasePath || '';
  if (!codeBasePath.endsWith(RESOURCE_SUFFIX)) return configuredRoot;

  const authorRoot = codeBasePath.slice(0, -RESOURCE_SUFFIX.length).replace(/\/$/, '');
  const storeRoot = configuredRoot.replace(/^\/|\/$/g, '');
  return `${authorRoot}/${storeRoot}${storeRoot ? '/' : ''}`;
}
