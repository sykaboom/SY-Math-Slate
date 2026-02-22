#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

budget_file="codex_tasks/workflow/large_file_budget.env"
if [[ ! -f "$budget_file" ]]; then
  echo "[check_v10_large_file_budget] FAIL: missing budget file: $budget_file"
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$budget_file"
set +a

validate_int() {
  local key="$1"
  local value="$2"
  if ! [[ "$value" =~ ^[0-9]+$ ]]; then
    echo "[check_v10_large_file_budget] FAIL: ${key} must be integer"
    exit 1
  fi
}

app_layout_max="${APP_LAYOUT_MAX:-0}"
ext_runtime_max="${EXTENSION_RUNTIME_BOOTSTRAP_MAX:-0}"
data_input_max="${DATA_INPUT_PANEL_MAX:-0}"
selectors_package_selection_max="${SELECTORS_PACKAGE_SELECTION_MAX:-0}"
selectors_toolbar_plan_max="${SELECTORS_TOOLBAR_PLAN_MAX:-0}"
guards_validate_definition_max="${GUARDS_VALIDATE_DEFINITION_MAX:-0}"
guards_resource_policy_max="${GUARDS_RESOURCE_POLICY_MAX:-0}"
registry_max="${REGISTRY_MAX:-0}"
guards_validate_definition_ui_resource_policy_max="${GUARDS_VALIDATE_DEFINITION_UI_RESOURCE_POLICY_MAX:-0}"
template_pack_adaptation_max="${TEMPLATE_PACK_ADAPTATION_MAX:-0}"
template_pack_toolbar_definition_max="${TEMPLATE_PACK_TOOLBAR_DEFINITION_MAX:-0}"
selectors_package_selection_sorting_active_max="${SELECTORS_PACKAGE_SELECTION_SORTING_ACTIVE_MAX:-0}"
selectors_package_selection_activation_mapping_max="${SELECTORS_PACKAGE_SELECTION_ACTIVATION_MAPPING_MAX:-0}"
guards_validate_definition_index_max="${GUARDS_VALIDATE_DEFINITION_INDEX_MAX:-0}"
guards_validate_definition_base_fields_max="${GUARDS_VALIDATE_DEFINITION_BASE_FIELDS_MAX:-0}"
selectors_toolbar_plan_provider_max="${SELECTORS_TOOLBAR_PLAN_PROVIDER_MAX:-0}"
selectors_toolbar_plan_surface_rules_max="${SELECTORS_TOOLBAR_PLAN_SURFACE_RULES_MAX:-0}"
selectors_toolbar_plan_plan_resolution_max="${SELECTORS_TOOLBAR_PLAN_PLAN_RESOLUTION_MAX:-0}"
guards_resource_policy_command_rules_max="${GUARDS_RESOURCE_POLICY_COMMAND_RULES_MAX:-0}"
guards_resource_policy_shortcut_rules_max="${GUARDS_RESOURCE_POLICY_SHORTCUT_RULES_MAX:-0}"
guards_resource_policy_input_behavior_rule_max="${GUARDS_RESOURCE_POLICY_INPUT_BEHAVIOR_RULE_MAX:-0}"
registry_class_max="${REGISTRY_CLASS_MAX:-0}"
registry_runtime_state_max="${REGISTRY_RUNTIME_STATE_MAX:-0}"
registry_resource_overrides_max="${REGISTRY_RESOURCE_OVERRIDES_MAX:-0}"
guards_validate_definition_ui_policy_max="${GUARDS_VALIDATE_DEFINITION_UI_POLICY_MAX:-0}"
guards_validate_definition_resource_policy_max="${GUARDS_VALIDATE_DEFINITION_RESOURCE_POLICY_MAX:-0}"

validate_int "APP_LAYOUT_MAX" "$app_layout_max"
validate_int "EXTENSION_RUNTIME_BOOTSTRAP_MAX" "$ext_runtime_max"
validate_int "DATA_INPUT_PANEL_MAX" "$data_input_max"
validate_int "SELECTORS_PACKAGE_SELECTION_MAX" "$selectors_package_selection_max"
validate_int "SELECTORS_TOOLBAR_PLAN_MAX" "$selectors_toolbar_plan_max"
validate_int "GUARDS_VALIDATE_DEFINITION_MAX" "$guards_validate_definition_max"
validate_int "GUARDS_RESOURCE_POLICY_MAX" "$guards_resource_policy_max"
validate_int "REGISTRY_MAX" "$registry_max"
validate_int "GUARDS_VALIDATE_DEFINITION_UI_RESOURCE_POLICY_MAX" "$guards_validate_definition_ui_resource_policy_max"
validate_int "TEMPLATE_PACK_ADAPTATION_MAX" "$template_pack_adaptation_max"
validate_int "TEMPLATE_PACK_TOOLBAR_DEFINITION_MAX" "$template_pack_toolbar_definition_max"
validate_int "SELECTORS_PACKAGE_SELECTION_SORTING_ACTIVE_MAX" "$selectors_package_selection_sorting_active_max"
validate_int "SELECTORS_PACKAGE_SELECTION_ACTIVATION_MAPPING_MAX" "$selectors_package_selection_activation_mapping_max"
validate_int "GUARDS_VALIDATE_DEFINITION_INDEX_MAX" "$guards_validate_definition_index_max"
validate_int "GUARDS_VALIDATE_DEFINITION_BASE_FIELDS_MAX" "$guards_validate_definition_base_fields_max"
validate_int "SELECTORS_TOOLBAR_PLAN_PROVIDER_MAX" "$selectors_toolbar_plan_provider_max"
validate_int "SELECTORS_TOOLBAR_PLAN_SURFACE_RULES_MAX" "$selectors_toolbar_plan_surface_rules_max"
validate_int "SELECTORS_TOOLBAR_PLAN_PLAN_RESOLUTION_MAX" "$selectors_toolbar_plan_plan_resolution_max"
validate_int "GUARDS_RESOURCE_POLICY_COMMAND_RULES_MAX" "$guards_resource_policy_command_rules_max"
validate_int "GUARDS_RESOURCE_POLICY_SHORTCUT_RULES_MAX" "$guards_resource_policy_shortcut_rules_max"
validate_int "GUARDS_RESOURCE_POLICY_INPUT_BEHAVIOR_RULE_MAX" "$guards_resource_policy_input_behavior_rule_max"
validate_int "REGISTRY_CLASS_MAX" "$registry_class_max"
validate_int "REGISTRY_RUNTIME_STATE_MAX" "$registry_runtime_state_max"
validate_int "REGISTRY_RESOURCE_OVERRIDES_MAX" "$registry_resource_overrides_max"
validate_int "GUARDS_VALIDATE_DEFINITION_UI_POLICY_MAX" "$guards_validate_definition_ui_policy_max"
validate_int "GUARDS_VALIDATE_DEFINITION_RESOURCE_POLICY_MAX" "$guards_validate_definition_resource_policy_max"

target_files=(
  "v10/src/features/chrome/layout/AppLayout.tsx"
  "v10/src/features/platform/extensions/ui/ExtensionRuntimeBootstrap.tsx"
  "v10/src/features/chrome/layout/DataInputPanel.tsx"
  "v10/src/core/runtime/modding/package/selectors/packageSelection.ts"
  "v10/src/core/runtime/modding/package/selectors/toolbarPlan.ts"
  "v10/src/core/runtime/modding/package/guards/validateDefinition.ts"
  "v10/src/core/runtime/modding/package/guards/resourcePolicy.ts"
  "v10/src/core/runtime/modding/package/registry.ts"
  "v10/src/core/runtime/modding/package/guards/validateDefinition/uiAndResourcePolicy.ts"
  "v10/src/core/runtime/modding/package/templatePackAdapter/adaptation.ts"
  "v10/src/core/runtime/modding/package/templatePackAdapter/toolbarDefinition.ts"
  "v10/src/core/runtime/modding/package/selectors/packageSelection/sortingAndActive.ts"
  "v10/src/core/runtime/modding/package/selectors/packageSelection/activationMapping.ts"
  "v10/src/core/runtime/modding/package/guards/validateDefinition/index.ts"
  "v10/src/core/runtime/modding/package/guards/validateDefinition/baseFields.ts"
  "v10/src/core/runtime/modding/package/selectors/toolbarPlan/provider.ts"
  "v10/src/core/runtime/modding/package/selectors/toolbarPlan/surfaceRules.ts"
  "v10/src/core/runtime/modding/package/selectors/toolbarPlan/planResolution.ts"
  "v10/src/core/runtime/modding/package/guards/resourcePolicy/commandRules.ts"
  "v10/src/core/runtime/modding/package/guards/resourcePolicy/shortcutRules.ts"
  "v10/src/core/runtime/modding/package/guards/resourcePolicy/inputBehaviorRule.ts"
  "v10/src/core/runtime/modding/package/registry/classRegistry.ts"
  "v10/src/core/runtime/modding/package/registry/runtimeRegistryState.ts"
  "v10/src/core/runtime/modding/package/registry/resourceOverrides.ts"
  "v10/src/core/runtime/modding/package/guards/validateDefinition/uiAndResourcePolicy/uiPolicy.ts"
  "v10/src/core/runtime/modding/package/guards/validateDefinition/uiAndResourcePolicy/resourcePolicy.ts"
)

for file in "${target_files[@]}"; do
  if [[ ! -f "$file" ]]; then
    echo "[check_v10_large_file_budget] FAIL: missing target file: $file"
    exit 1
  fi
done

app_layout_lines="$(wc -l < "${target_files[0]}")"
ext_runtime_lines="$(wc -l < "${target_files[1]}")"
data_input_lines="$(wc -l < "${target_files[2]}")"
selectors_package_selection_lines="$(wc -l < "${target_files[3]}")"
selectors_toolbar_plan_lines="$(wc -l < "${target_files[4]}")"
guards_validate_definition_lines="$(wc -l < "${target_files[5]}")"
guards_resource_policy_lines="$(wc -l < "${target_files[6]}")"
registry_lines="$(wc -l < "${target_files[7]}")"
guards_validate_definition_ui_resource_policy_lines="$(wc -l < "${target_files[8]}")"
template_pack_adaptation_lines="$(wc -l < "${target_files[9]}")"
template_pack_toolbar_definition_lines="$(wc -l < "${target_files[10]}")"
selectors_package_selection_sorting_active_lines="$(wc -l < "${target_files[11]}")"
selectors_package_selection_activation_mapping_lines="$(wc -l < "${target_files[12]}")"
guards_validate_definition_index_lines="$(wc -l < "${target_files[13]}")"
guards_validate_definition_base_fields_lines="$(wc -l < "${target_files[14]}")"
selectors_toolbar_plan_provider_lines="$(wc -l < "${target_files[15]}")"
selectors_toolbar_plan_surface_rules_lines="$(wc -l < "${target_files[16]}")"
selectors_toolbar_plan_plan_resolution_lines="$(wc -l < "${target_files[17]}")"
guards_resource_policy_command_rules_lines="$(wc -l < "${target_files[18]}")"
guards_resource_policy_shortcut_rules_lines="$(wc -l < "${target_files[19]}")"
guards_resource_policy_input_behavior_rule_lines="$(wc -l < "${target_files[20]}")"
registry_class_lines="$(wc -l < "${target_files[21]}")"
registry_runtime_state_lines="$(wc -l < "${target_files[22]}")"
registry_resource_overrides_lines="$(wc -l < "${target_files[23]}")"
guards_validate_definition_ui_policy_lines="$(wc -l < "${target_files[24]}")"
guards_validate_definition_resource_policy_lines="$(wc -l < "${target_files[25]}")"

printf '[check_v10_large_file_budget] budget_wave=%s app_layout=%s/%s extension_runtime_bootstrap=%s/%s data_input_panel=%s/%s selectors_package_selection=%s/%s selectors_toolbar_plan=%s/%s guards_validate_definition=%s/%s guards_resource_policy=%s/%s registry=%s/%s guards_validate_definition_ui_resource_policy=%s/%s template_pack_adaptation=%s/%s template_pack_toolbar_definition=%s/%s selectors_package_selection_sorting_active=%s/%s selectors_package_selection_activation_mapping=%s/%s guards_validate_definition_index=%s/%s guards_validate_definition_base_fields=%s/%s selectors_toolbar_plan_provider=%s/%s selectors_toolbar_plan_surface_rules=%s/%s selectors_toolbar_plan_plan_resolution=%s/%s guards_resource_policy_command_rules=%s/%s guards_resource_policy_shortcut_rules=%s/%s guards_resource_policy_input_behavior_rule=%s/%s registry_class=%s/%s registry_runtime_state=%s/%s registry_resource_overrides=%s/%s guards_validate_definition_ui_policy=%s/%s guards_validate_definition_resource_policy=%s/%s\n' \
  "${BUDGET_WAVE:-unknown}" \
  "$app_layout_lines" "$app_layout_max" \
  "$ext_runtime_lines" "$ext_runtime_max" \
  "$data_input_lines" "$data_input_max" \
  "$selectors_package_selection_lines" "$selectors_package_selection_max" \
  "$selectors_toolbar_plan_lines" "$selectors_toolbar_plan_max" \
  "$guards_validate_definition_lines" "$guards_validate_definition_max" \
  "$guards_resource_policy_lines" "$guards_resource_policy_max" \
  "$registry_lines" "$registry_max" \
  "$guards_validate_definition_ui_resource_policy_lines" "$guards_validate_definition_ui_resource_policy_max" \
  "$template_pack_adaptation_lines" "$template_pack_adaptation_max" \
  "$template_pack_toolbar_definition_lines" "$template_pack_toolbar_definition_max" \
  "$selectors_package_selection_sorting_active_lines" "$selectors_package_selection_sorting_active_max" \
  "$selectors_package_selection_activation_mapping_lines" "$selectors_package_selection_activation_mapping_max" \
  "$guards_validate_definition_index_lines" "$guards_validate_definition_index_max" \
  "$guards_validate_definition_base_fields_lines" "$guards_validate_definition_base_fields_max" \
  "$selectors_toolbar_plan_provider_lines" "$selectors_toolbar_plan_provider_max" \
  "$selectors_toolbar_plan_surface_rules_lines" "$selectors_toolbar_plan_surface_rules_max" \
  "$selectors_toolbar_plan_plan_resolution_lines" "$selectors_toolbar_plan_plan_resolution_max" \
  "$guards_resource_policy_command_rules_lines" "$guards_resource_policy_command_rules_max" \
  "$guards_resource_policy_shortcut_rules_lines" "$guards_resource_policy_shortcut_rules_max" \
  "$guards_resource_policy_input_behavior_rule_lines" "$guards_resource_policy_input_behavior_rule_max" \
  "$registry_class_lines" "$registry_class_max" \
  "$registry_runtime_state_lines" "$registry_runtime_state_max" \
  "$registry_resource_overrides_lines" "$registry_resource_overrides_max" \
  "$guards_validate_definition_ui_policy_lines" "$guards_validate_definition_ui_policy_max" \
  "$guards_validate_definition_resource_policy_lines" "$guards_validate_definition_resource_policy_max"

if (( app_layout_lines > app_layout_max )); then
  echo "[check_v10_large_file_budget] FAIL: AppLayout.tsx exceeded budget"
  exit 1
fi

if (( ext_runtime_lines > ext_runtime_max )); then
  echo "[check_v10_large_file_budget] FAIL: ExtensionRuntimeBootstrap.tsx exceeded budget"
  exit 1
fi

if (( data_input_lines > data_input_max )); then
  echo "[check_v10_large_file_budget] FAIL: DataInputPanel.tsx exceeded budget"
  exit 1
fi

if (( selectors_package_selection_lines > selectors_package_selection_max )); then
  echo "[check_v10_large_file_budget] FAIL: selectors/packageSelection.ts exceeded budget"
  exit 1
fi

if (( selectors_toolbar_plan_lines > selectors_toolbar_plan_max )); then
  echo "[check_v10_large_file_budget] FAIL: selectors/toolbarPlan.ts exceeded budget"
  exit 1
fi

if (( guards_validate_definition_lines > guards_validate_definition_max )); then
  echo "[check_v10_large_file_budget] FAIL: guards/validateDefinition.ts exceeded budget"
  exit 1
fi

if (( guards_resource_policy_lines > guards_resource_policy_max )); then
  echo "[check_v10_large_file_budget] FAIL: guards/resourcePolicy.ts exceeded budget"
  exit 1
fi

if (( registry_lines > registry_max )); then
  echo "[check_v10_large_file_budget] FAIL: package/registry.ts exceeded budget"
  exit 1
fi

if (( guards_validate_definition_ui_resource_policy_lines > guards_validate_definition_ui_resource_policy_max )); then
  echo "[check_v10_large_file_budget] FAIL: validateDefinition/uiAndResourcePolicy.ts exceeded budget"
  exit 1
fi

if (( template_pack_adaptation_lines > template_pack_adaptation_max )); then
  echo "[check_v10_large_file_budget] FAIL: templatePackAdapter/adaptation.ts exceeded budget"
  exit 1
fi

if (( template_pack_toolbar_definition_lines > template_pack_toolbar_definition_max )); then
  echo "[check_v10_large_file_budget] FAIL: templatePackAdapter/toolbarDefinition.ts exceeded budget"
  exit 1
fi

if (( selectors_package_selection_sorting_active_lines > selectors_package_selection_sorting_active_max )); then
  echo "[check_v10_large_file_budget] FAIL: packageSelection/sortingAndActive.ts exceeded budget"
  exit 1
fi

if (( selectors_package_selection_activation_mapping_lines > selectors_package_selection_activation_mapping_max )); then
  echo "[check_v10_large_file_budget] FAIL: packageSelection/activationMapping.ts exceeded budget"
  exit 1
fi

if (( guards_validate_definition_index_lines > guards_validate_definition_index_max )); then
  echo "[check_v10_large_file_budget] FAIL: validateDefinition/index.ts exceeded budget"
  exit 1
fi

if (( guards_validate_definition_base_fields_lines > guards_validate_definition_base_fields_max )); then
  echo "[check_v10_large_file_budget] FAIL: validateDefinition/baseFields.ts exceeded budget"
  exit 1
fi

if (( selectors_toolbar_plan_provider_lines > selectors_toolbar_plan_provider_max )); then
  echo "[check_v10_large_file_budget] FAIL: toolbarPlan/provider.ts exceeded budget"
  exit 1
fi

if (( selectors_toolbar_plan_surface_rules_lines > selectors_toolbar_plan_surface_rules_max )); then
  echo "[check_v10_large_file_budget] FAIL: toolbarPlan/surfaceRules.ts exceeded budget"
  exit 1
fi

if (( selectors_toolbar_plan_plan_resolution_lines > selectors_toolbar_plan_plan_resolution_max )); then
  echo "[check_v10_large_file_budget] FAIL: toolbarPlan/planResolution.ts exceeded budget"
  exit 1
fi

if (( guards_resource_policy_command_rules_lines > guards_resource_policy_command_rules_max )); then
  echo "[check_v10_large_file_budget] FAIL: resourcePolicy/commandRules.ts exceeded budget"
  exit 1
fi

if (( guards_resource_policy_shortcut_rules_lines > guards_resource_policy_shortcut_rules_max )); then
  echo "[check_v10_large_file_budget] FAIL: resourcePolicy/shortcutRules.ts exceeded budget"
  exit 1
fi

if (( guards_resource_policy_input_behavior_rule_lines > guards_resource_policy_input_behavior_rule_max )); then
  echo "[check_v10_large_file_budget] FAIL: resourcePolicy/inputBehaviorRule.ts exceeded budget"
  exit 1
fi

if (( registry_class_lines > registry_class_max )); then
  echo "[check_v10_large_file_budget] FAIL: registry/classRegistry.ts exceeded budget"
  exit 1
fi

if (( registry_runtime_state_lines > registry_runtime_state_max )); then
  echo "[check_v10_large_file_budget] FAIL: registry/runtimeRegistryState.ts exceeded budget"
  exit 1
fi

if (( registry_resource_overrides_lines > registry_resource_overrides_max )); then
  echo "[check_v10_large_file_budget] FAIL: registry/resourceOverrides.ts exceeded budget"
  exit 1
fi

if (( guards_validate_definition_ui_policy_lines > guards_validate_definition_ui_policy_max )); then
  echo "[check_v10_large_file_budget] FAIL: uiAndResourcePolicy/uiPolicy.ts exceeded budget"
  exit 1
fi

if (( guards_validate_definition_resource_policy_lines > guards_validate_definition_resource_policy_max )); then
  echo "[check_v10_large_file_budget] FAIL: uiAndResourcePolicy/resourcePolicy.ts exceeded budget"
  exit 1
fi

echo "[check_v10_large_file_budget] PASS"
