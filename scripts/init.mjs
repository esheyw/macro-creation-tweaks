import { MODULE_ID } from './constants.mjs';
import { updateRootFolder } from './functions.mjs';
import { SETTINGS } from './settings.mjs';
export const MODULE = () => game.modules.get(MODULE_ID);
export const SM = () => MODULE().settingsManager;
export const MHL = () => game.modules.get('macro-helper-library').api;

Hooks.once('init', async () => {
  const mod = MODULE();
  const MHLSettingsManager = MHL().util.MHLSettingsManager;
  mod.settingsManager = new MHLSettingsManager(MODULE_ID);
});
Hooks.once('i18nInit', () => {
  const mod = MODULE();
  mod.settingsManager.registerSettings(SETTINGS);
});

Hooks.once('ready', () => {
  updateRootFolder();
});
