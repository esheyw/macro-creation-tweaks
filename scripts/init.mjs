import { MODULE_ID } from "./constants.mjs";
import { updateHooks, HOOKS } from "./hooks.mjs";
import { registerSettings, updateSettingsCache } from "./settings.mjs";
export const MODULE = () => game.modules.get(MODULE_ID);

Hooks.once("init", () => {
  const modObject = MODULE();
  game.mct = {
    updateHooks,
    updateSettingsCache,
    modObject,
    HOOKS,
  };
  modObject.hookIDs ??= {};
  modObject.settings ??= {};
  registerSettings();
});
Hooks.once("setup", () => {
  updateSettingsCache();
  updateHooks();
});
