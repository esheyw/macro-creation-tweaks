import { updateConditionalHooks } from "./hooks.mjs";
import { sortUserMacrosIntoFolders } from "./init.mjs";
export const fu = foundry.utils;
export const MODULE_ID = "macro-creation-tweaks";
export const SETTINGS = {
  "append-number": {
    config: true,
    default: true,
    hint: "MacroCreationTweaks.Setting.AppendNumber.Hint",
    name: "MacroCreationTweaks.Setting.AppendNumber.Name",
    scope: "world",
    type: Boolean,
    onChange: updateConditionalHooks,
  },
  "delete-empty": {
    config: true,
    default: true,
    hint: "MacroCreationTweaks.Setting.DeleteEmpty.Hint",
    name: "MacroCreationTweaks.Setting.DeleteEmpty.Name",
    scope: "world",
    type: Boolean,
    onChange: updateConditionalHooks,
  },
  "change-default-type": {
    config: true,
    default: true,
    hint: "MacroCreationTweaks.Setting.ChangeDefaultType.Hint",
    name: "MacroCreationTweaks.Setting.ChangeDefaultType.Name",
    scope: "world",
    type: Boolean,
    onChange: updateConditionalHooks,
  },
  "players-folders": {
    config: true,
    default: "no",
    scope: "world",
    type: String,
    hint: "MacroCreationTweaks.Setting.PlayersFolders.Hint",
    name: "MacroCreationTweaks.Setting.PlayersFolders.Name",
    choices: {
      root: "MacroCreationTweaks.Setting.PlayersFolders.Choices.Root",
      noroot: "MacroCreationTweaks.Setting.PlayersFolders.Choices.NoRoot",
      no: "No",
    },
    requiresReload: true,
    onChange: updateConditionalHooks,
  },
  "players-folder-root-name": {
    config: true,
    default: "Player Macros",
    scope: "world",
    type: String,
    // hint: "MacroCreationTweaks.Setting.PlayersFolderRootName.Hint",
    name: "MacroCreationTweaks.Setting.PlayersFolderRootName.Name",
  },
  "players-folder-root-color": {
    config: true,
    default: "#18591F",
    scope: "world",
    type: String,
    // hint: "MacroCreationTweaks.Setting.PlayersFolderRootColor.Hint",
    name: "MacroCreationTweaks.Setting.PlayersFolderRootColor.Name",
  },
  "sort-existing-macros": {
    config: true,
    default: "replaceme",
    type: String,
    scope: "world",
    hint: "MacroCreationTweaks.Setting.SortExistingMacros.Hint",
    name: "MacroCreationTweaks.Setting.SortExistingMacros.Name",
    replaceWith: {
      label: "MacroCreationTweaks.Setting.SortExistingMacros.ButtonLabel",
      action: sortUserMacrosIntoFolders,
    },
  },
  "players-folder-root-id": {
    config: false,
    default: "",
    type: String,
    scope: "world",
  },
};
