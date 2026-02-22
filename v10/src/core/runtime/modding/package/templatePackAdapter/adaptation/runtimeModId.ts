const RUNTIME_TEMPLATE_PACK_MOD_ID_PREFIX = "template-pack.runtime";

export const buildTemplatePackRuntimeModId = (packId: string): string =>
  `${RUNTIME_TEMPLATE_PACK_MOD_ID_PREFIX}.${packId}`;
