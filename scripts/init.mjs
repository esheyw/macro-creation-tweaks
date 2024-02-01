import { MODULE_ID } from "./constants.mjs";
import { registerPermanentHooks, updateConditionalHooks } from "./hooks.mjs";
import { registerSettings, updateSettingsCache, setting } from "./settings.mjs";
export const MODULE = () => game.modules.get(MODULE_ID);

Hooks.once("init", () => {
  const modObject = MODULE();
  modObject.hookIDs ??= {};
  modObject.settings ??= {};
  registerSettings();
});

async function updateUserFolders() {
  const root = setting("players-folder-root-id") || null;
  const nonGMs = game.users.filter((user) => user.role !== CONST.USER_ROLES.GAMEMASTER);
  const userUpdates = [];
  for (const user of nonGMs) {
    const flagID = user.getFlag(MODULE_ID, "macro-folder");
    const existingFolder = game.folders.get(flagID);
    const playerFolderData = {
      name: user.name,
      type: "Macro",
      sorting: existingFolder ? existingFolder.sorting : "m",
      color: user.color,
      folder: root,
    };
    if (existingFolder) {
      userUpdates.push({
        _id: user.id,
        [`flags.${MODULE_ID}.macro-folder`]: existingFolder.id,
      });
      existingFolder.update(playerFolderData);
    } else {
      const newFolder = await Folder.create(playerFolderData);
      userUpdates.push({
        _id: user.id,
        [`flags.${MODULE_ID}.macro-folder`]: newFolder.id,
      });
    }
  }
  await User.updateDocuments(userUpdates);
}

export async function sortUserMacrosIntoFolders() {
  if (!setting("players-folders").includes("root")) return;
  const nonGMs = game.users.filter((user) => user.role !== CONST.USER_ROLES.GAMEMASTER);
  const updates = nonGMs.reduce((acc, user) => {
    const userFolderID = user.getFlag(MODULE_ID, "macro-folder");
    //folder is a document reference if set
    const authored = game.macros.filter((m) => m.author.id === user.id && m.folder?.id !== userFolderID);
    if (authored.length > 0) acc.push(...authored.map((m) => ({ _id: m._id, folder: userFolderID })));
    return acc;
  }, []);
  if (updates.length) {
    ui.notifications.info(`Sorting ${updates.length} macros into user folders.`);
    Macro.implementation.updateDocuments(updates);
  } else {
    ui.notifications.info(`All player-authored macros are already sorted.`)
  }
}
Hooks.once("setup", () => {
  updateSettingsCache();
  registerPermanentHooks();
  updateConditionalHooks();
});

Hooks.once("ready", async () => {
  //assistant GMs can't edit world settings
  if (game.user.id !== game.users.activeGM.id || game.user.role !== CONST.USER_ROLES.GAMEMASTER) return;
  // Run-once code after here

  const playersFoldersSetting = setting("players-folders");
  const existingRootFolderID = setting("players-folder-root-id");
  const existingRootFolder =
    game.folders.get(existingRootFolderID) ?? game.folders.find((f) => f.getFlag(MODULE_ID, "root"));
  let rootFolder;
  switch (playersFoldersSetting) {
    case "root":
      rootFolder = existingRootFolder
        ? existingRootFolder
        : await Folder.create({
            name: setting("players-folder-root-name"),
            type: "Macro",
            sorting: "m",
            color: setting("players-folder-root-color"),
            flags: {
              [MODULE_ID]: {
                root: true,
              },
            },
          });
      await game.settings.set(MODULE_ID, "players-folder-root-id", rootFolder.id);
      updateSettingsCache();
    case "noroot": //deliberate passthrough; maybe bad pattern
      if (existingRootFolder && !rootFolder) {
        //passthrough, not start
        await game.settings.set(MODULE_ID, "players-folder-root-id", "");
        updateSettingsCache();
        await existingRootFolder.delete();
      }
      await updateUserFolders();
      break;
    case "no":
    default:
      break;
  }
});
