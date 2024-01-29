import { MODULE } from "./constants.mjs";
import { updateHooks } from "./hooks.mjs";

export function setting(path) {
  return game.settings.get(MODULE, path);
}
export function registerSettings() {
  game.settings.register(MODULE, "append-number", {
    config: true,
    default: true,
    hint: "MacroCreationTweaks.Setting.AppendNumber.Hint",
    name: "MacroCreationTweaks.Setting.AppendNumber.Name",
    scope: "world",
    type: Boolean,
    onChange: updateHooks,
  });
  game.settings.register(MODULE, "delete-empty", {
    config: true,
    default: true,
    hint: "MacroCreationTweaks.Setting.DeleteEmpty.Hint",
    name: "MacroCreationTweaks.Setting.DeleteEmpty.Name",
    scope: "world",
    type: Boolean,
    onChange: updateHooks,
  });
  game.settings.register(MODULE, "change-default-type", {
    config: true,
    default: true,
    hint: "MacroCreationTweaks.Setting.ChangeDefaultType.Hint",
    name: "MacroCreationTweaks.Setting.ChangeDefaultType.Name",
    scope: "world",
    type: Boolean,
    onChange: updateHooks,
  });
}
