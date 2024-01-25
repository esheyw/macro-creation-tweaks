import { MODULE } from "./constants.mjs";
import { updateHooks } from "./hooks.mjs";

export function setting(path) {
  return game.settings.get(MODULE, path);
}
function localize(str) {
  return game.i18n.localize(str);
}
export function registerSettings() {
  game.settings.register(MODULE, "append-number", {
    config: true,
    default: true,
    hint: localize("MacroCreationTweaks.Setting.AppendNumber.Hint"),
    label: localize("MacroCreationTweaks.Setting.AppendNumber.Label"),
    scope: "world",
    type: Boolean,
    onChange: updateHooks,
  });
  game.settings.register(MODULE, "collision-attempts", {
    config: true,
    default: 10,
    hint: localize("MacroCreationTweaks.Setting.CollisionAttempts.Hint"),
    label: localize("MacroCreationTweaks.Setting.CollisionAttempts.Label"),
    scope: "world",
    type: Number,
    range: {
      min: 1,
      max: 100,
      step: 1,
    },
    onChange: updateHooks,
  });
  game.settings.register(MODULE, "delete-empty", {
    config: true,
    default: true,
    hint: localize("MacroCreationTweaks.Setting.DeleteEmpty.Hint"),
    label: localize("MacroCreationTweaks.Setting.DeleteEmpty.Label"),
    scope: "world",
    type: Boolean,
    onChange: updateHooks,
  });
}
