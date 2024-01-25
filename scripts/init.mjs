import { MODULE } from "./constants.mjs";
import { updateHooks } from "./hooks.mjs";
import { registerSettings } from "./settings.mjs";
export const getModule = () => game.modules.get(MODULE);

Hooks.once("init", () => {
  const modObject = getModule();
  modObject.hookIDs ??= {};
  registerSettings();
});
Hooks.once("setup", () => {
  updateHooks();
});
