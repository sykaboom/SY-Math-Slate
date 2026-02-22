import {
  TEMPLATE_PACK_MANIFEST_VERSION,
  type TemplatePackManifest,
} from "../../schema/templatePack.types";
import { BASE_EDUCATION_LAYOUT } from "./layout";
import {
  BASE_EDUCATION_TOOLBAR_ACTION_CATALOG,
  BASE_EDUCATION_TOOLBAR_ACTION_SURFACE_RULES,
  BASE_EDUCATION_TOOLBAR_MODE_DEFINITIONS,
} from "./toolbarBaseDefinition";
import { BASE_EDUCATION_THEME } from "./theme";

const BASE_EDUCATION_TOOLBAR_DEFINITION = Object.freeze({
  modeDefinitions: BASE_EDUCATION_TOOLBAR_MODE_DEFINITIONS,
  actionCatalog: BASE_EDUCATION_TOOLBAR_ACTION_CATALOG,
  actionSurfaceRules: BASE_EDUCATION_TOOLBAR_ACTION_SURFACE_RULES,
});

const baseEducationTemplatePackWithToolbar = {
  manifestVersion: TEMPLATE_PACK_MANIFEST_VERSION,
  packId: "base-education",
  title: "Base Education Template",
  description: "Default education-focused toolbar/session composition.",
  kind: "base" as const,
  toolbar: BASE_EDUCATION_TOOLBAR_DEFINITION,
  layout: BASE_EDUCATION_LAYOUT,
  theme: BASE_EDUCATION_THEME,
  defaultEnabled: true,
};

export const BASE_EDUCATION_TEMPLATE_PACK: TemplatePackManifest =
  baseEducationTemplatePackWithToolbar;
