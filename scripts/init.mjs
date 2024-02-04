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
  const updates = [];
  for (const user of nonGMs) {
    const userFolderID = user.getFlag(MODULE_ID, "macro-folder");
    if (!game.folders.get(userFolderID)) return ui.notifications.warn(`Please do not attempt to sort until after reloading once player folders are enabled.`);
    const authored = game.macros.filter((m) => m.author?.id === user.id && m.folder?.id !== userFolderID);
    if (authored.length > 0) updates.push(...authored.map((m) => ({ _id: m._id, folder: userFolderID })));
  } 
  if (updates.length) {
    ui.notifications.info(`Sorting ${updates.length} macros into user folders.`);
    Macro.implementation.updateDocuments(updates);
  } else {
    ui.notifications.info(`All player-authored macros are already sorted.`);
  }
  const unauthored = game.macros.filter((m) => !m.author);
  if (unauthored.length) {
    ui.notifications.error('Some macros were found that lack owners and were ignored, see console for list');
    console.error(unauthored);
  }
}

export async function newUserMacrosIntoFolders() {
  if (!setting("players-folders").includes("root")) return;
  const nonGMs = game.users.filter((user) => user.role !== CONST.USER_ROLES.GAMEMASTER);
  const [unauthored, authored] = game.macros.contents.partition((m) => game.users.contents.includes(m.author));
  if (unauthored.length) {
    const [unowned, owned] = unauthored.partition((m) => {
      const ownerIDs = Object.entries(m.ownership)
        .filter(([_, level]) => level === CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER)
        .map(([userID, _]) => userID);
      const existingOwners = ownerIDs.map((id) => game.users.get(id)).filter((o) => o);
      const nonGMOwners = existingOwners.filter((o) => o.role !== CONST.USER_ROLES.GAMEMASTER);
      return !!nonGMOwners.length;
    });
    const templateData = {
      unowned: unowned.map((m) => ({
        name: m.name,
      })),
      owned: owned.map((m) => ({
        name: m.name,
        owners: Object.entries(m.ownership)
          .filter(
            ([userID, level]) =>
              level === CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER &&
              game.users.get(userID)?.role !== CONST.USER_ROLES.GAMEMASTER
          )
          .map(([userID, _]) => game.users.get(userID)?.name ?? null)
          .filter((name) => name)
          .join(", "),
      })),
    };
    const template = `
    <style>
    .mct-unauthored-macros .macro-group {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      grid-gap: 2px;
    }
    .mct-unauthored-macros span {
      border: 1px solid green;
    }
    .mct-unauthored-macros h3 {
      width: 100%;
      clear:both;
    }
    .mct-unauthored-macros {
      
    }
    </style>
    <div class="mct-unauthored-macros">
    <h1>Unsortable Macros</h1>    
    One or more macros were found to have no valid <code>author</code> field
    {{#if unowned.length}}
    <h3>Not owned by any existing user in this world:</h3>
    <div class="macro-group">
      {{#each unowned}}<span>{{name}}</span>{{/each}}    
    </div>
    {{/if}}
    {{#if owned.length}}
    <h3>Owned by one or more existing world users:</h3>
    <div class="macro-group">
      {{#each owned}}<span>{{name}} (owners: {{owners}})</span>{{/each}}     
    </div>
    {{/if}}
    </div>
    `;
    const content = Handlebars.compile(template)(templateData);
    const r = await Dialog.wait({
      title: "Broken Macros",
      content,
      buttons: {
        del: {
          label: "Delete",
          icon: `<i class="fa-solid fa-trash"></i>`,
        },
        ignore: {
          label: "Ignore",
          icon: '<i class="fa-solid fa-forward"></i>',
        },
      },
    });
    console.warn(r);
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
