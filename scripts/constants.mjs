import { updateHooks } from "./hooks.mjs";

export const MODULE_ID = "macro-creation-tweaks";
export const SETTINGS = {
  "append-number": {
    config: true,
    default: true,
    hint: "MacroCreationTweaks.Setting.AppendNumber.Hint",
    name: "MacroCreationTweaks.Setting.AppendNumber.Name",
    scope: "world",
    type: Boolean,
    onChange: updateHooks,
  },
  "delete-empty": {
    config: true,
    default: true,
    hint: "MacroCreationTweaks.Setting.DeleteEmpty.Hint",
    name: "MacroCreationTweaks.Setting.DeleteEmpty.Name",
    scope: "world",
    type: Boolean,
    onChange: updateHooks,
  },
  "change-default-type": {
    config: true,
    default: true,
    hint: "MacroCreationTweaks.Setting.ChangeDefaultType.Hint",
    name: "MacroCreationTweaks.Setting.ChangeDefaultType.Name",
    scope: "world",
    type: Boolean,
    onChange: updateHooks,
  },
};
