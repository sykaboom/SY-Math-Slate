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
selectors_resource_item_merge_max="${SELECTORS_RESOURCE_ITEM_MERGE_MAX:-0}"
selectors_resource_command_merge_max="${SELECTORS_RESOURCE_COMMAND_MERGE_MAX:-0}"
template_pack_toolbar_definition_guards_max="${TEMPLATE_PACK_TOOLBAR_DEFINITION_GUARDS_MAX:-0}"
template_pack_toolbar_definition_parsers_max="${TEMPLATE_PACK_TOOLBAR_DEFINITION_PARSERS_MAX:-0}"
template_pack_toolbar_definition_selector_max="${TEMPLATE_PACK_TOOLBAR_DEFINITION_SELECTOR_MAX:-0}"
selectors_resource_item_merge_model_max="${SELECTORS_RESOURCE_ITEM_MERGE_MODEL_MAX:-0}"
selectors_resource_item_merge_helpers_max="${SELECTORS_RESOURCE_ITEM_MERGE_HELPERS_MAX:-0}"
selectors_resource_item_merge_merge_max="${SELECTORS_RESOURCE_ITEM_MERGE_MERGE_MAX:-0}"
selectors_resource_command_merge_helpers_max="${SELECTORS_RESOURCE_COMMAND_MERGE_HELPERS_MAX:-0}"
selectors_resource_command_merge_merge_max="${SELECTORS_RESOURCE_COMMAND_MERGE_MERGE_MAX:-0}"
package_types_facade_max="${PACKAGE_TYPES_FACADE_MAX:-0}"
package_types_index_max="${PACKAGE_TYPES_INDEX_MAX:-0}"
package_types_modes_max="${PACKAGE_TYPES_MODES_MAX:-0}"
package_types_resource_policy_max="${PACKAGE_TYPES_RESOURCE_POLICY_MAX:-0}"
package_types_toolbar_plan_max="${PACKAGE_TYPES_TOOLBAR_PLAN_MAX:-0}"
package_types_definition_max="${PACKAGE_TYPES_DEFINITION_MAX:-0}"
package_types_ui_policy_max="${PACKAGE_TYPES_UI_POLICY_MAX:-0}"
selectors_resource_policy_merge_facade_max="${SELECTORS_RESOURCE_POLICY_MERGE_FACADE_MAX:-0}"
selectors_resource_policy_merge_helpers_max="${SELECTORS_RESOURCE_POLICY_MERGE_HELPERS_MAX:-0}"
selectors_resource_policy_merge_merge_max="${SELECTORS_RESOURCE_POLICY_MERGE_MERGE_MAX:-0}"
selectors_resource_shortcut_merge_facade_max="${SELECTORS_RESOURCE_SHORTCUT_MERGE_FACADE_MAX:-0}"
selectors_resource_shortcut_merge_helpers_max="${SELECTORS_RESOURCE_SHORTCUT_MERGE_HELPERS_MAX:-0}"
selectors_resource_shortcut_merge_merge_max="${SELECTORS_RESOURCE_SHORTCUT_MERGE_MERGE_MAX:-0}"
selectors_resource_input_behavior_merge_facade_max="${SELECTORS_RESOURCE_INPUT_BEHAVIOR_MERGE_FACADE_MAX:-0}"
selectors_resource_input_behavior_merge_helpers_max="${SELECTORS_RESOURCE_INPUT_BEHAVIOR_MERGE_HELPERS_MAX:-0}"
selectors_resource_input_behavior_merge_merge_max="${SELECTORS_RESOURCE_INPUT_BEHAVIOR_MERGE_MERGE_MAX:-0}"
selectors_package_selection_activation_mapping_base_max="${SELECTORS_PACKAGE_SELECTION_ACTIVATION_MAPPING_BASE_MAX:-0}"
selectors_package_selection_activation_mapping_active_max="${SELECTORS_PACKAGE_SELECTION_ACTIVATION_MAPPING_ACTIVE_MAX:-0}"
selectors_package_selection_activation_mapping_reverse_max="${SELECTORS_PACKAGE_SELECTION_ACTIVATION_MAPPING_REVERSE_MAX:-0}"
selectors_toolbar_plan_provider_base_provider_max="${SELECTORS_TOOLBAR_PLAN_PROVIDER_BASE_PROVIDER_MAX:-0}"
selectors_toolbar_plan_provider_constants_max="${SELECTORS_TOOLBAR_PLAN_PROVIDER_CONSTANTS_MAX:-0}"
selectors_toolbar_plan_provider_plan_max="${SELECTORS_TOOLBAR_PLAN_PROVIDER_PLAN_MAX:-0}"
guards_ui_policy_parse_max="${GUARDS_UI_POLICY_PARSE_MAX:-0}"
guards_validate_definition_base_fields_parse_max="${GUARDS_VALIDATE_DEFINITION_BASE_FIELDS_PARSE_MAX:-0}"
registry_class_comparators_max="${REGISTRY_CLASS_COMPARATORS_MAX:-0}"
registry_class_types_max="${REGISTRY_CLASS_TYPES_MAX:-0}"
registry_class_registry_class_max="${REGISTRY_CLASS_REGISTRY_CLASS_MAX:-0}"
selectors_resource_command_merge_operations_max="${SELECTORS_RESOURCE_COMMAND_MERGE_OPERATIONS_MAX:-0}"
selectors_resource_command_merge_run_max="${SELECTORS_RESOURCE_COMMAND_MERGE_RUN_MAX:-0}"
selectors_resource_item_merge_operations_max="${SELECTORS_RESOURCE_ITEM_MERGE_OPERATIONS_MAX:-0}"
selectors_resource_item_merge_run_max="${SELECTORS_RESOURCE_ITEM_MERGE_RUN_MAX:-0}"
guards_resource_policy_input_behavior_rule_normalize_max="${GUARDS_RESOURCE_POLICY_INPUT_BEHAVIOR_RULE_NORMALIZE_MAX:-0}"
guards_resource_policy_input_behavior_rule_parse_max="${GUARDS_RESOURCE_POLICY_INPUT_BEHAVIOR_RULE_PARSE_MAX:-0}"
guards_ui_policy_parse_validators_max="${GUARDS_UI_POLICY_PARSE_VALIDATORS_MAX:-0}"
guards_ui_policy_parse_parse_max="${GUARDS_UI_POLICY_PARSE_PARSE_MAX:-0}"
guards_validate_definition_base_fields_parse_root_fields_max="${GUARDS_VALIDATE_DEFINITION_BASE_FIELDS_PARSE_ROOT_FIELDS_MAX:-0}"
guards_validate_definition_base_fields_parse_mod_ids_max="${GUARDS_VALIDATE_DEFINITION_BASE_FIELDS_PARSE_MOD_IDS_MAX:-0}"
guards_validate_definition_base_fields_parse_activation_max="${GUARDS_VALIDATE_DEFINITION_BASE_FIELDS_PARSE_ACTIVATION_MAX:-0}"
guards_validate_definition_base_fields_parse_parse_max="${GUARDS_VALIDATE_DEFINITION_BASE_FIELDS_PARSE_PARSE_MAX:-0}"

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
validate_int "SELECTORS_RESOURCE_ITEM_MERGE_MAX" "$selectors_resource_item_merge_max"
validate_int "SELECTORS_RESOURCE_COMMAND_MERGE_MAX" "$selectors_resource_command_merge_max"
validate_int "TEMPLATE_PACK_TOOLBAR_DEFINITION_GUARDS_MAX" "$template_pack_toolbar_definition_guards_max"
validate_int "TEMPLATE_PACK_TOOLBAR_DEFINITION_PARSERS_MAX" "$template_pack_toolbar_definition_parsers_max"
validate_int "TEMPLATE_PACK_TOOLBAR_DEFINITION_SELECTOR_MAX" "$template_pack_toolbar_definition_selector_max"
validate_int "SELECTORS_RESOURCE_ITEM_MERGE_MODEL_MAX" "$selectors_resource_item_merge_model_max"
validate_int "SELECTORS_RESOURCE_ITEM_MERGE_HELPERS_MAX" "$selectors_resource_item_merge_helpers_max"
validate_int "SELECTORS_RESOURCE_ITEM_MERGE_MERGE_MAX" "$selectors_resource_item_merge_merge_max"
validate_int "SELECTORS_RESOURCE_COMMAND_MERGE_HELPERS_MAX" "$selectors_resource_command_merge_helpers_max"
validate_int "SELECTORS_RESOURCE_COMMAND_MERGE_MERGE_MAX" "$selectors_resource_command_merge_merge_max"
validate_int "PACKAGE_TYPES_FACADE_MAX" "$package_types_facade_max"
validate_int "PACKAGE_TYPES_INDEX_MAX" "$package_types_index_max"
validate_int "PACKAGE_TYPES_MODES_MAX" "$package_types_modes_max"
validate_int "PACKAGE_TYPES_RESOURCE_POLICY_MAX" "$package_types_resource_policy_max"
validate_int "PACKAGE_TYPES_TOOLBAR_PLAN_MAX" "$package_types_toolbar_plan_max"
validate_int "PACKAGE_TYPES_DEFINITION_MAX" "$package_types_definition_max"
validate_int "PACKAGE_TYPES_UI_POLICY_MAX" "$package_types_ui_policy_max"
validate_int "SELECTORS_RESOURCE_POLICY_MERGE_FACADE_MAX" "$selectors_resource_policy_merge_facade_max"
validate_int "SELECTORS_RESOURCE_POLICY_MERGE_HELPERS_MAX" "$selectors_resource_policy_merge_helpers_max"
validate_int "SELECTORS_RESOURCE_POLICY_MERGE_MERGE_MAX" "$selectors_resource_policy_merge_merge_max"
validate_int "SELECTORS_RESOURCE_SHORTCUT_MERGE_FACADE_MAX" "$selectors_resource_shortcut_merge_facade_max"
validate_int "SELECTORS_RESOURCE_SHORTCUT_MERGE_HELPERS_MAX" "$selectors_resource_shortcut_merge_helpers_max"
validate_int "SELECTORS_RESOURCE_SHORTCUT_MERGE_MERGE_MAX" "$selectors_resource_shortcut_merge_merge_max"
validate_int "SELECTORS_RESOURCE_INPUT_BEHAVIOR_MERGE_FACADE_MAX" "$selectors_resource_input_behavior_merge_facade_max"
validate_int "SELECTORS_RESOURCE_INPUT_BEHAVIOR_MERGE_HELPERS_MAX" "$selectors_resource_input_behavior_merge_helpers_max"
validate_int "SELECTORS_RESOURCE_INPUT_BEHAVIOR_MERGE_MERGE_MAX" "$selectors_resource_input_behavior_merge_merge_max"
validate_int "SELECTORS_PACKAGE_SELECTION_ACTIVATION_MAPPING_BASE_MAX" "$selectors_package_selection_activation_mapping_base_max"
validate_int "SELECTORS_PACKAGE_SELECTION_ACTIVATION_MAPPING_ACTIVE_MAX" "$selectors_package_selection_activation_mapping_active_max"
validate_int "SELECTORS_PACKAGE_SELECTION_ACTIVATION_MAPPING_REVERSE_MAX" "$selectors_package_selection_activation_mapping_reverse_max"
validate_int "SELECTORS_TOOLBAR_PLAN_PROVIDER_BASE_PROVIDER_MAX" "$selectors_toolbar_plan_provider_base_provider_max"
validate_int "SELECTORS_TOOLBAR_PLAN_PROVIDER_CONSTANTS_MAX" "$selectors_toolbar_plan_provider_constants_max"
validate_int "SELECTORS_TOOLBAR_PLAN_PROVIDER_PLAN_MAX" "$selectors_toolbar_plan_provider_plan_max"
validate_int "GUARDS_UI_POLICY_PARSE_MAX" "$guards_ui_policy_parse_max"
validate_int "GUARDS_VALIDATE_DEFINITION_BASE_FIELDS_PARSE_MAX" "$guards_validate_definition_base_fields_parse_max"
validate_int "REGISTRY_CLASS_COMPARATORS_MAX" "$registry_class_comparators_max"
validate_int "REGISTRY_CLASS_TYPES_MAX" "$registry_class_types_max"
validate_int "REGISTRY_CLASS_REGISTRY_CLASS_MAX" "$registry_class_registry_class_max"
validate_int "SELECTORS_RESOURCE_COMMAND_MERGE_OPERATIONS_MAX" "$selectors_resource_command_merge_operations_max"
validate_int "SELECTORS_RESOURCE_COMMAND_MERGE_RUN_MAX" "$selectors_resource_command_merge_run_max"
validate_int "SELECTORS_RESOURCE_ITEM_MERGE_OPERATIONS_MAX" "$selectors_resource_item_merge_operations_max"
validate_int "SELECTORS_RESOURCE_ITEM_MERGE_RUN_MAX" "$selectors_resource_item_merge_run_max"
validate_int "GUARDS_RESOURCE_POLICY_INPUT_BEHAVIOR_RULE_NORMALIZE_MAX" "$guards_resource_policy_input_behavior_rule_normalize_max"
validate_int "GUARDS_RESOURCE_POLICY_INPUT_BEHAVIOR_RULE_PARSE_MAX" "$guards_resource_policy_input_behavior_rule_parse_max"
validate_int "GUARDS_UI_POLICY_PARSE_VALIDATORS_MAX" "$guards_ui_policy_parse_validators_max"
validate_int "GUARDS_UI_POLICY_PARSE_PARSE_MAX" "$guards_ui_policy_parse_parse_max"
validate_int "GUARDS_VALIDATE_DEFINITION_BASE_FIELDS_PARSE_ROOT_FIELDS_MAX" "$guards_validate_definition_base_fields_parse_root_fields_max"
validate_int "GUARDS_VALIDATE_DEFINITION_BASE_FIELDS_PARSE_MOD_IDS_MAX" "$guards_validate_definition_base_fields_parse_mod_ids_max"
validate_int "GUARDS_VALIDATE_DEFINITION_BASE_FIELDS_PARSE_ACTIVATION_MAX" "$guards_validate_definition_base_fields_parse_activation_max"
validate_int "GUARDS_VALIDATE_DEFINITION_BASE_FIELDS_PARSE_PARSE_MAX" "$guards_validate_definition_base_fields_parse_parse_max"

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

extra_target_files=(
  "v10/src/core/runtime/modding/package/selectors/resourceItemMerge.ts"
  "v10/src/core/runtime/modding/package/selectors/resourceCommandMerge.ts"
  "v10/src/core/runtime/modding/package/templatePackAdapter/toolbarDefinition/guards.ts"
  "v10/src/core/runtime/modding/package/templatePackAdapter/toolbarDefinition/parsers.ts"
  "v10/src/core/runtime/modding/package/templatePackAdapter/toolbarDefinition/selector.ts"
  "v10/src/core/runtime/modding/package/selectors/resourceItemMerge/model.ts"
  "v10/src/core/runtime/modding/package/selectors/resourceItemMerge/helpers.ts"
  "v10/src/core/runtime/modding/package/selectors/resourceItemMerge/merge.ts"
  "v10/src/core/runtime/modding/package/selectors/resourceCommandMerge/helpers.ts"
  "v10/src/core/runtime/modding/package/selectors/resourceCommandMerge/merge.ts"
  "v10/src/core/runtime/modding/package/types.ts"
  "v10/src/core/runtime/modding/package/types/index.ts"
  "v10/src/core/runtime/modding/package/types/modes.ts"
  "v10/src/core/runtime/modding/package/types/resourcePolicy.ts"
  "v10/src/core/runtime/modding/package/types/toolbarPlan.ts"
  "v10/src/core/runtime/modding/package/types/definition.ts"
  "v10/src/core/runtime/modding/package/types/uiPolicy.ts"
  "v10/src/core/runtime/modding/package/selectors/resourcePolicyMerge.ts"
  "v10/src/core/runtime/modding/package/selectors/resourcePolicyMerge/helpers.ts"
  "v10/src/core/runtime/modding/package/selectors/resourcePolicyMerge/merge.ts"
  "v10/src/core/runtime/modding/package/selectors/resourceShortcutMerge.ts"
  "v10/src/core/runtime/modding/package/selectors/resourceShortcutMerge/helpers.ts"
  "v10/src/core/runtime/modding/package/selectors/resourceShortcutMerge/merge.ts"
  "v10/src/core/runtime/modding/package/selectors/resourceInputBehaviorMerge.ts"
  "v10/src/core/runtime/modding/package/selectors/resourceInputBehaviorMerge/helpers.ts"
  "v10/src/core/runtime/modding/package/selectors/resourceInputBehaviorMerge/merge.ts"
  "v10/src/core/runtime/modding/package/selectors/packageSelection/activationMapping/base.ts"
  "v10/src/core/runtime/modding/package/selectors/packageSelection/activationMapping/active.ts"
  "v10/src/core/runtime/modding/package/selectors/packageSelection/activationMapping/reverse.ts"
  "v10/src/core/runtime/modding/package/selectors/toolbarPlan/provider/baseProvider.ts"
  "v10/src/core/runtime/modding/package/selectors/toolbarPlan/provider/constants.ts"
  "v10/src/core/runtime/modding/package/selectors/toolbarPlan/provider/plan.ts"
  "v10/src/core/runtime/modding/package/guards/uiPolicy/parseUIItemRules.ts"
  "v10/src/core/runtime/modding/package/guards/validateDefinition/baseFields/parse.ts"
  "v10/src/core/runtime/modding/package/registry/classRegistry/comparators.ts"
  "v10/src/core/runtime/modding/package/registry/classRegistry/types.ts"
  "v10/src/core/runtime/modding/package/registry/classRegistry/registryClass.ts"
  "v10/src/core/runtime/modding/package/selectors/resourceCommandMerge/merge/operations.ts"
  "v10/src/core/runtime/modding/package/selectors/resourceCommandMerge/merge/run.ts"
  "v10/src/core/runtime/modding/package/selectors/resourceItemMerge/merge/operations.ts"
  "v10/src/core/runtime/modding/package/selectors/resourceItemMerge/merge/run.ts"
  "v10/src/core/runtime/modding/package/guards/resourcePolicy/inputBehaviorRule/normalize.ts"
  "v10/src/core/runtime/modding/package/guards/resourcePolicy/inputBehaviorRule/parse.ts"
  "v10/src/core/runtime/modding/package/guards/uiPolicy/parseUIItemRules/validators.ts"
  "v10/src/core/runtime/modding/package/guards/uiPolicy/parseUIItemRules/parse.ts"
  "v10/src/core/runtime/modding/package/guards/validateDefinition/baseFields/parse/rootFields.ts"
  "v10/src/core/runtime/modding/package/guards/validateDefinition/baseFields/parse/modIds.ts"
  "v10/src/core/runtime/modding/package/guards/validateDefinition/baseFields/parse/activation.ts"
  "v10/src/core/runtime/modding/package/guards/validateDefinition/baseFields/parse/parse.ts"
)

for file in "${extra_target_files[@]}"; do
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
selectors_resource_item_merge_lines="$(wc -l < "${extra_target_files[0]}")"
selectors_resource_command_merge_lines="$(wc -l < "${extra_target_files[1]}")"
template_pack_toolbar_definition_guards_lines="$(wc -l < "${extra_target_files[2]}")"
template_pack_toolbar_definition_parsers_lines="$(wc -l < "${extra_target_files[3]}")"
template_pack_toolbar_definition_selector_lines="$(wc -l < "${extra_target_files[4]}")"
selectors_resource_item_merge_model_lines="$(wc -l < "${extra_target_files[5]}")"
selectors_resource_item_merge_helpers_lines="$(wc -l < "${extra_target_files[6]}")"
selectors_resource_item_merge_merge_lines="$(wc -l < "${extra_target_files[7]}")"
selectors_resource_command_merge_helpers_lines="$(wc -l < "${extra_target_files[8]}")"
selectors_resource_command_merge_merge_lines="$(wc -l < "${extra_target_files[9]}")"
package_types_facade_lines="$(wc -l < "${extra_target_files[10]}")"
package_types_index_lines="$(wc -l < "${extra_target_files[11]}")"
package_types_modes_lines="$(wc -l < "${extra_target_files[12]}")"
package_types_resource_policy_lines="$(wc -l < "${extra_target_files[13]}")"
package_types_toolbar_plan_lines="$(wc -l < "${extra_target_files[14]}")"
package_types_definition_lines="$(wc -l < "${extra_target_files[15]}")"
package_types_ui_policy_lines="$(wc -l < "${extra_target_files[16]}")"
selectors_resource_policy_merge_facade_lines="$(wc -l < "${extra_target_files[17]}")"
selectors_resource_policy_merge_helpers_lines="$(wc -l < "${extra_target_files[18]}")"
selectors_resource_policy_merge_merge_lines="$(wc -l < "${extra_target_files[19]}")"
selectors_resource_shortcut_merge_facade_lines="$(wc -l < "${extra_target_files[20]}")"
selectors_resource_shortcut_merge_helpers_lines="$(wc -l < "${extra_target_files[21]}")"
selectors_resource_shortcut_merge_merge_lines="$(wc -l < "${extra_target_files[22]}")"
selectors_resource_input_behavior_merge_facade_lines="$(wc -l < "${extra_target_files[23]}")"
selectors_resource_input_behavior_merge_helpers_lines="$(wc -l < "${extra_target_files[24]}")"
selectors_resource_input_behavior_merge_merge_lines="$(wc -l < "${extra_target_files[25]}")"
selectors_package_selection_activation_mapping_base_lines="$(wc -l < "${extra_target_files[26]}")"
selectors_package_selection_activation_mapping_active_lines="$(wc -l < "${extra_target_files[27]}")"
selectors_package_selection_activation_mapping_reverse_lines="$(wc -l < "${extra_target_files[28]}")"
selectors_toolbar_plan_provider_base_provider_lines="$(wc -l < "${extra_target_files[29]}")"
selectors_toolbar_plan_provider_constants_lines="$(wc -l < "${extra_target_files[30]}")"
selectors_toolbar_plan_provider_plan_lines="$(wc -l < "${extra_target_files[31]}")"
guards_ui_policy_parse_lines="$(wc -l < "${extra_target_files[32]}")"
guards_validate_definition_base_fields_parse_lines="$(wc -l < "${extra_target_files[33]}")"
registry_class_comparators_lines="$(wc -l < "${extra_target_files[34]}")"
registry_class_types_lines="$(wc -l < "${extra_target_files[35]}")"
registry_class_registry_class_lines="$(wc -l < "${extra_target_files[36]}")"
selectors_resource_command_merge_operations_lines="$(wc -l < "${extra_target_files[37]}")"
selectors_resource_command_merge_run_lines="$(wc -l < "${extra_target_files[38]}")"
selectors_resource_item_merge_operations_lines="$(wc -l < "${extra_target_files[39]}")"
selectors_resource_item_merge_run_lines="$(wc -l < "${extra_target_files[40]}")"
guards_resource_policy_input_behavior_rule_normalize_lines="$(wc -l < "${extra_target_files[41]}")"
guards_resource_policy_input_behavior_rule_parse_lines="$(wc -l < "${extra_target_files[42]}")"
guards_ui_policy_parse_validators_lines="$(wc -l < "${extra_target_files[43]}")"
guards_ui_policy_parse_parse_lines="$(wc -l < "${extra_target_files[44]}")"
guards_validate_definition_base_fields_parse_root_fields_lines="$(wc -l < "${extra_target_files[45]}")"
guards_validate_definition_base_fields_parse_mod_ids_lines="$(wc -l < "${extra_target_files[46]}")"
guards_validate_definition_base_fields_parse_activation_lines="$(wc -l < "${extra_target_files[47]}")"
guards_validate_definition_base_fields_parse_parse_lines="$(wc -l < "${extra_target_files[48]}")"

printf '[check_v10_large_file_budget] budget_wave=%s app_layout=%s/%s extension_runtime_bootstrap=%s/%s data_input_panel=%s/%s selectors_package_selection=%s/%s selectors_toolbar_plan=%s/%s guards_validate_definition=%s/%s guards_resource_policy=%s/%s registry=%s/%s guards_validate_definition_ui_resource_policy=%s/%s template_pack_adaptation=%s/%s template_pack_toolbar_definition=%s/%s selectors_package_selection_sorting_active=%s/%s selectors_package_selection_activation_mapping=%s/%s guards_validate_definition_index=%s/%s guards_validate_definition_base_fields=%s/%s selectors_toolbar_plan_provider=%s/%s selectors_toolbar_plan_surface_rules=%s/%s selectors_toolbar_plan_plan_resolution=%s/%s guards_resource_policy_command_rules=%s/%s guards_resource_policy_shortcut_rules=%s/%s guards_resource_policy_input_behavior_rule=%s/%s registry_class=%s/%s registry_runtime_state=%s/%s registry_resource_overrides=%s/%s guards_validate_definition_ui_policy=%s/%s guards_validate_definition_resource_policy=%s/%s types_facade=%s/%s types_toolbar_plan=%s/%s resource_policy_merge=%s/%s resource_shortcut_merge=%s/%s resource_input_behavior_merge=%s/%s activation_mapping_base=%s/%s provider_base=%s/%s ui_policy_parse=%s/%s base_fields_parse=%s/%s registry_class_comparators=%s/%s registry_class_types=%s/%s registry_class_core=%s/%s command_merge_operations=%s/%s command_merge_run=%s/%s item_merge_operations=%s/%s item_merge_run=%s/%s input_behavior_normalize=%s/%s input_behavior_parse=%s/%s ui_policy_validators=%s/%s ui_policy_parser=%s/%s base_root_fields=%s/%s base_mod_ids=%s/%s base_activation=%s/%s base_parse=%s/%s\n' \
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
  "$guards_validate_definition_resource_policy_lines" "$guards_validate_definition_resource_policy_max" \
  "$package_types_facade_lines" "$package_types_facade_max" \
  "$package_types_toolbar_plan_lines" "$package_types_toolbar_plan_max" \
  "$selectors_resource_policy_merge_merge_lines" "$selectors_resource_policy_merge_merge_max" \
  "$selectors_resource_shortcut_merge_merge_lines" "$selectors_resource_shortcut_merge_merge_max" \
  "$selectors_resource_input_behavior_merge_merge_lines" "$selectors_resource_input_behavior_merge_merge_max" \
  "$selectors_package_selection_activation_mapping_base_lines" "$selectors_package_selection_activation_mapping_base_max" \
  "$selectors_toolbar_plan_provider_base_provider_lines" "$selectors_toolbar_plan_provider_base_provider_max" \
  "$guards_ui_policy_parse_lines" "$guards_ui_policy_parse_max" \
  "$guards_validate_definition_base_fields_parse_lines" "$guards_validate_definition_base_fields_parse_max" \
  "$registry_class_comparators_lines" "$registry_class_comparators_max" \
  "$registry_class_types_lines" "$registry_class_types_max" \
  "$registry_class_registry_class_lines" "$registry_class_registry_class_max" \
  "$selectors_resource_command_merge_operations_lines" "$selectors_resource_command_merge_operations_max" \
  "$selectors_resource_command_merge_run_lines" "$selectors_resource_command_merge_run_max" \
  "$selectors_resource_item_merge_operations_lines" "$selectors_resource_item_merge_operations_max" \
  "$selectors_resource_item_merge_run_lines" "$selectors_resource_item_merge_run_max" \
  "$guards_resource_policy_input_behavior_rule_normalize_lines" "$guards_resource_policy_input_behavior_rule_normalize_max" \
  "$guards_resource_policy_input_behavior_rule_parse_lines" "$guards_resource_policy_input_behavior_rule_parse_max" \
  "$guards_ui_policy_parse_validators_lines" "$guards_ui_policy_parse_validators_max" \
  "$guards_ui_policy_parse_parse_lines" "$guards_ui_policy_parse_parse_max" \
  "$guards_validate_definition_base_fields_parse_root_fields_lines" "$guards_validate_definition_base_fields_parse_root_fields_max" \
  "$guards_validate_definition_base_fields_parse_mod_ids_lines" "$guards_validate_definition_base_fields_parse_mod_ids_max" \
  "$guards_validate_definition_base_fields_parse_activation_lines" "$guards_validate_definition_base_fields_parse_activation_max" \
  "$guards_validate_definition_base_fields_parse_parse_lines" "$guards_validate_definition_base_fields_parse_parse_max"

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

if (( selectors_resource_item_merge_lines > selectors_resource_item_merge_max )); then
  echo "[check_v10_large_file_budget] FAIL: selectors/resourceItemMerge.ts exceeded budget"
  exit 1
fi

if (( selectors_resource_command_merge_lines > selectors_resource_command_merge_max )); then
  echo "[check_v10_large_file_budget] FAIL: selectors/resourceCommandMerge.ts exceeded budget"
  exit 1
fi

if (( template_pack_toolbar_definition_guards_lines > template_pack_toolbar_definition_guards_max )); then
  echo "[check_v10_large_file_budget] FAIL: templatePackAdapter/toolbarDefinition/guards.ts exceeded budget"
  exit 1
fi

if (( template_pack_toolbar_definition_parsers_lines > template_pack_toolbar_definition_parsers_max )); then
  echo "[check_v10_large_file_budget] FAIL: templatePackAdapter/toolbarDefinition/parsers.ts exceeded budget"
  exit 1
fi

if (( template_pack_toolbar_definition_selector_lines > template_pack_toolbar_definition_selector_max )); then
  echo "[check_v10_large_file_budget] FAIL: templatePackAdapter/toolbarDefinition/selector.ts exceeded budget"
  exit 1
fi

if (( selectors_resource_item_merge_model_lines > selectors_resource_item_merge_model_max )); then
  echo "[check_v10_large_file_budget] FAIL: resourceItemMerge/model.ts exceeded budget"
  exit 1
fi

if (( selectors_resource_item_merge_helpers_lines > selectors_resource_item_merge_helpers_max )); then
  echo "[check_v10_large_file_budget] FAIL: resourceItemMerge/helpers.ts exceeded budget"
  exit 1
fi

if (( selectors_resource_item_merge_merge_lines > selectors_resource_item_merge_merge_max )); then
  echo "[check_v10_large_file_budget] FAIL: resourceItemMerge/merge.ts exceeded budget"
  exit 1
fi

if (( selectors_resource_command_merge_helpers_lines > selectors_resource_command_merge_helpers_max )); then
  echo "[check_v10_large_file_budget] FAIL: resourceCommandMerge/helpers.ts exceeded budget"
  exit 1
fi

if (( selectors_resource_command_merge_merge_lines > selectors_resource_command_merge_merge_max )); then
  echo "[check_v10_large_file_budget] FAIL: resourceCommandMerge/merge.ts exceeded budget"
  exit 1
fi

if (( package_types_facade_lines > package_types_facade_max )); then
  echo "[check_v10_large_file_budget] FAIL: package/types.ts exceeded budget"
  exit 1
fi

if (( package_types_index_lines > package_types_index_max )); then
  echo "[check_v10_large_file_budget] FAIL: package/types/index.ts exceeded budget"
  exit 1
fi

if (( package_types_modes_lines > package_types_modes_max )); then
  echo "[check_v10_large_file_budget] FAIL: package/types/modes.ts exceeded budget"
  exit 1
fi

if (( package_types_resource_policy_lines > package_types_resource_policy_max )); then
  echo "[check_v10_large_file_budget] FAIL: package/types/resourcePolicy.ts exceeded budget"
  exit 1
fi

if (( package_types_toolbar_plan_lines > package_types_toolbar_plan_max )); then
  echo "[check_v10_large_file_budget] FAIL: package/types/toolbarPlan.ts exceeded budget"
  exit 1
fi

if (( package_types_definition_lines > package_types_definition_max )); then
  echo "[check_v10_large_file_budget] FAIL: package/types/definition.ts exceeded budget"
  exit 1
fi

if (( package_types_ui_policy_lines > package_types_ui_policy_max )); then
  echo "[check_v10_large_file_budget] FAIL: package/types/uiPolicy.ts exceeded budget"
  exit 1
fi

if (( selectors_resource_policy_merge_facade_lines > selectors_resource_policy_merge_facade_max )); then
  echo "[check_v10_large_file_budget] FAIL: selectors/resourcePolicyMerge.ts exceeded budget"
  exit 1
fi

if (( selectors_resource_policy_merge_helpers_lines > selectors_resource_policy_merge_helpers_max )); then
  echo "[check_v10_large_file_budget] FAIL: selectors/resourcePolicyMerge/helpers.ts exceeded budget"
  exit 1
fi

if (( selectors_resource_policy_merge_merge_lines > selectors_resource_policy_merge_merge_max )); then
  echo "[check_v10_large_file_budget] FAIL: selectors/resourcePolicyMerge/merge.ts exceeded budget"
  exit 1
fi

if (( selectors_resource_shortcut_merge_facade_lines > selectors_resource_shortcut_merge_facade_max )); then
  echo "[check_v10_large_file_budget] FAIL: selectors/resourceShortcutMerge.ts exceeded budget"
  exit 1
fi

if (( selectors_resource_shortcut_merge_helpers_lines > selectors_resource_shortcut_merge_helpers_max )); then
  echo "[check_v10_large_file_budget] FAIL: selectors/resourceShortcutMerge/helpers.ts exceeded budget"
  exit 1
fi

if (( selectors_resource_shortcut_merge_merge_lines > selectors_resource_shortcut_merge_merge_max )); then
  echo "[check_v10_large_file_budget] FAIL: selectors/resourceShortcutMerge/merge.ts exceeded budget"
  exit 1
fi

if (( selectors_resource_input_behavior_merge_facade_lines > selectors_resource_input_behavior_merge_facade_max )); then
  echo "[check_v10_large_file_budget] FAIL: selectors/resourceInputBehaviorMerge.ts exceeded budget"
  exit 1
fi

if (( selectors_resource_input_behavior_merge_helpers_lines > selectors_resource_input_behavior_merge_helpers_max )); then
  echo "[check_v10_large_file_budget] FAIL: selectors/resourceInputBehaviorMerge/helpers.ts exceeded budget"
  exit 1
fi

if (( selectors_resource_input_behavior_merge_merge_lines > selectors_resource_input_behavior_merge_merge_max )); then
  echo "[check_v10_large_file_budget] FAIL: selectors/resourceInputBehaviorMerge/merge.ts exceeded budget"
  exit 1
fi

if (( selectors_package_selection_activation_mapping_base_lines > selectors_package_selection_activation_mapping_base_max )); then
  echo "[check_v10_large_file_budget] FAIL: packageSelection/activationMapping/base.ts exceeded budget"
  exit 1
fi

if (( selectors_package_selection_activation_mapping_active_lines > selectors_package_selection_activation_mapping_active_max )); then
  echo "[check_v10_large_file_budget] FAIL: packageSelection/activationMapping/active.ts exceeded budget"
  exit 1
fi

if (( selectors_package_selection_activation_mapping_reverse_lines > selectors_package_selection_activation_mapping_reverse_max )); then
  echo "[check_v10_large_file_budget] FAIL: packageSelection/activationMapping/reverse.ts exceeded budget"
  exit 1
fi

if (( selectors_toolbar_plan_provider_base_provider_lines > selectors_toolbar_plan_provider_base_provider_max )); then
  echo "[check_v10_large_file_budget] FAIL: toolbarPlan/provider/baseProvider.ts exceeded budget"
  exit 1
fi

if (( selectors_toolbar_plan_provider_constants_lines > selectors_toolbar_plan_provider_constants_max )); then
  echo "[check_v10_large_file_budget] FAIL: toolbarPlan/provider/constants.ts exceeded budget"
  exit 1
fi

if (( selectors_toolbar_plan_provider_plan_lines > selectors_toolbar_plan_provider_plan_max )); then
  echo "[check_v10_large_file_budget] FAIL: toolbarPlan/provider/plan.ts exceeded budget"
  exit 1
fi

if (( guards_ui_policy_parse_lines > guards_ui_policy_parse_max )); then
  echo "[check_v10_large_file_budget] FAIL: guards/uiPolicy/parseUIItemRules.ts exceeded budget"
  exit 1
fi

if (( guards_validate_definition_base_fields_parse_lines > guards_validate_definition_base_fields_parse_max )); then
  echo "[check_v10_large_file_budget] FAIL: validateDefinition/baseFields/parse.ts exceeded budget"
  exit 1
fi

if (( registry_class_comparators_lines > registry_class_comparators_max )); then
  echo "[check_v10_large_file_budget] FAIL: registry/classRegistry/comparators.ts exceeded budget"
  exit 1
fi

if (( registry_class_types_lines > registry_class_types_max )); then
  echo "[check_v10_large_file_budget] FAIL: registry/classRegistry/types.ts exceeded budget"
  exit 1
fi

if (( registry_class_registry_class_lines > registry_class_registry_class_max )); then
  echo "[check_v10_large_file_budget] FAIL: registry/classRegistry/registryClass.ts exceeded budget"
  exit 1
fi

if (( selectors_resource_command_merge_operations_lines > selectors_resource_command_merge_operations_max )); then
  echo "[check_v10_large_file_budget] FAIL: resourceCommandMerge/merge/operations.ts exceeded budget"
  exit 1
fi

if (( selectors_resource_command_merge_run_lines > selectors_resource_command_merge_run_max )); then
  echo "[check_v10_large_file_budget] FAIL: resourceCommandMerge/merge/run.ts exceeded budget"
  exit 1
fi

if (( selectors_resource_item_merge_operations_lines > selectors_resource_item_merge_operations_max )); then
  echo "[check_v10_large_file_budget] FAIL: resourceItemMerge/merge/operations.ts exceeded budget"
  exit 1
fi

if (( selectors_resource_item_merge_run_lines > selectors_resource_item_merge_run_max )); then
  echo "[check_v10_large_file_budget] FAIL: resourceItemMerge/merge/run.ts exceeded budget"
  exit 1
fi

if (( guards_resource_policy_input_behavior_rule_normalize_lines > guards_resource_policy_input_behavior_rule_normalize_max )); then
  echo "[check_v10_large_file_budget] FAIL: resourcePolicy/inputBehaviorRule/normalize.ts exceeded budget"
  exit 1
fi

if (( guards_resource_policy_input_behavior_rule_parse_lines > guards_resource_policy_input_behavior_rule_parse_max )); then
  echo "[check_v10_large_file_budget] FAIL: resourcePolicy/inputBehaviorRule/parse.ts exceeded budget"
  exit 1
fi

if (( guards_ui_policy_parse_validators_lines > guards_ui_policy_parse_validators_max )); then
  echo "[check_v10_large_file_budget] FAIL: uiPolicy/parseUIItemRules/validators.ts exceeded budget"
  exit 1
fi

if (( guards_ui_policy_parse_parse_lines > guards_ui_policy_parse_parse_max )); then
  echo "[check_v10_large_file_budget] FAIL: uiPolicy/parseUIItemRules/parse.ts exceeded budget"
  exit 1
fi

if (( guards_validate_definition_base_fields_parse_root_fields_lines > guards_validate_definition_base_fields_parse_root_fields_max )); then
  echo "[check_v10_large_file_budget] FAIL: baseFields/parse/rootFields.ts exceeded budget"
  exit 1
fi

if (( guards_validate_definition_base_fields_parse_mod_ids_lines > guards_validate_definition_base_fields_parse_mod_ids_max )); then
  echo "[check_v10_large_file_budget] FAIL: baseFields/parse/modIds.ts exceeded budget"
  exit 1
fi

if (( guards_validate_definition_base_fields_parse_activation_lines > guards_validate_definition_base_fields_parse_activation_max )); then
  echo "[check_v10_large_file_budget] FAIL: baseFields/parse/activation.ts exceeded budget"
  exit 1
fi

if (( guards_validate_definition_base_fields_parse_parse_lines > guards_validate_definition_base_fields_parse_parse_max )); then
  echo "[check_v10_large_file_budget] FAIL: baseFields/parse/parse.ts exceeded budget"
  exit 1
fi

echo "[check_v10_large_file_budget] PASS"
