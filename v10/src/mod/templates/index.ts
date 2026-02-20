import type { TemplatePackManifest } from "./_contracts/templatePack.types";
import { BASE_EDUCATION_TEMPLATE_PACK } from "./base-education/manifest";

const TEMPLATE_PACKS: readonly TemplatePackManifest[] = [
  BASE_EDUCATION_TEMPLATE_PACK,
] as const;

export const listTemplatePacks = (): readonly TemplatePackManifest[] =>
  TEMPLATE_PACKS;

export const listDefaultEnabledTemplatePacks = (): readonly TemplatePackManifest[] =>
  TEMPLATE_PACKS.filter((pack) => pack.defaultEnabled !== false);

