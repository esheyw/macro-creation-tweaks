import { MODULE_ID, SETTINGS } from "./constants.mjs";
import { MODULE } from "./init.mjs";

export function registerSettings() {
  for (const [setting, data] of Object.entries(SETTINGS)) {
    const settingPath = setting.replace("_", ".");
    fu.setProperty(MODULE().settings, settingPath, data?.default ?? null);
    const originalOnChange = data?.onChange ?? null;
    data.onChange = (value) => {
      fu.setProperty(MODULE().settings, settingPath, value);
      if (originalOnChange) originalOnChange(value);
    };
    game.settings.register(MODULE_ID, setting, data);
  }
}

export function updateSettingsCache() {
  const modSettings = MODULE().settings;
  for (const setting of Object.keys(SETTINGS)) {
    const settingPath = setting.replace("_", ".");
    const value = game.settings.get(MODULE_ID, setting);
    fu.setProperty(modSettings, settingPath, value);
  }
}

export function setting(key) {
  const settingPath = key.replace("_", ".");
  const cached = fu.getProperty(MODULE().settings, settingPath);
  return cached !== undefined ? cached : game.settings.get(MODULE_ID, key);
}
