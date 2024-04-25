import { MODULE_ID } from './constants.mjs';
import { MHL, SM } from './init.mjs';
import { setting } from './settings.mjs';

export function mctlog(loggable, options = {}) {
  options.mod = 'MCT';
  return MHL().modLog(loggable, options);
}
export function MCTBanner(text, options = {}) {
  options.mod = 'MCT';
  return MHL().modBanner(text, options);
}
export function MCTError(text, options = {}) {
  options.mod = 'MCT';
  return MHL().modError(text, options);
}
export async function updateRootFolder() {
  const { doc, activeRealGM } = MHL();
  if (game.user !== activeRealGM()) return;
  const playersFoldersSetting = setting('players-folders');
  const settingID = setting('players-folder-root-id');
  const existingRootFolder = doc(settingID, 'Folder') ?? game.folders.find(f => f.getFlag(MODULE_ID, 'root'));
  if (playersFoldersSetting === 'root') {
    const name = setting('players-folder-root-name');
    const color = setting('players-folder-root-color');
    const rootFolder = existingRootFolder
      ? existingRootFolder
      : await Folder.create({
          name,
          type: 'Macro',
          sorting: 'm',
          color,
          flags: {
            [MODULE_ID]: {
              root: true,
            },
          },
        });
    await SM().set('players-folder-root-id', rootFolder.id);
  } else if (existingRootFolder) {
    await SM().set('players-folder-root-id', '');
    await existingRootFolder.delete();
  }
  await updateUserFolders({ teardown: playersFoldersSetting === 'no' });
}
export function getUserMacros(user) {
  user = MHL().doc(user, 'User');
  return game.macros.filter(m => m.author?.id === user.id);
}

export async function updateUserFolder(user, { teardown = false } = {}) {
  const func = 'updateUserFolder';
  const doc = MHL().doc;
  user = doc(user, 'User');
  //TODO: make an error message
  if (!user) return;
  const root = doc(setting('players-folder-root-id'), 'Folder');
  const macros = getUserMacros(user);
  const flagFolderID = user.getFlag(MODULE_ID, 'macro-folder');
  const existingFolder = doc(flagFolderID, 'Folder');
  if (teardown) {
    if (existingFolder) {
      const macroUpdates = existingFolder.contents.map(m => ({ _id: m._id, folder: null }));
      await Macro.implementation.updateDocuments(macroUpdates);
      await existingFolder.delete();
    }
    await user.unsetFlag(MODULE_ID, 'macro-folder');
    return;
  }
  const playerFolderData = {
    name: user.name,
    type: 'Macro',
    sorting: existingFolder ? existingFolder.sorting : 'm',
    color: user.color,
    folder: root?.id ?? null,
  };
  if (macros.length) {
    if (existingFolder) {
      return await existingFolder.update(playerFolderData);
    } else {
      const newFolder = await Folder.implementation.create(playerFolderData);
      await user.setFlag(MODULE_ID, 'macro-folder', newFolder.id);
      return newFolder;
    }
  } else {
    if (existingFolder) await existingFolder.delete();
    if (flagFolderID) await user.unsetFlag(MODULE_ID, 'macro-folder');
  }
}
export async function updateUserFolders({ teardown = false } = {}) {
  if (game.user !== game.users.activeGM) return;
  const nonGMs = game.users.filter(user => !MHL().isRealGM(user));
  for (const user of nonGMs) {
    updateUserFolder(user, { teardown });
  }
}

export async function sortUserMacrosIntoFolders() {
  const func = `sortUserMacrosIntoFolders`;
  const { doc, isRealGM } = MHL();
  const playersFoldersSetting = setting('players-folders');
  if (!playersFoldersSetting.includes('root')) {
    MCTBanner(`MacroCreationTweaks.Warning.PrematureSortAttempt`, {
      type: 'warn',
      func,
      log: { playersFoldersSetting },
    });
    return;
  }
  const nonGMs = game.users.filter(user => !isRealGM(user));
  const updates = [];
  for (const user of nonGMs) {
    const authored = getUserMacros(user);
    if (authored.length) await updateUserFolder(user);
    const userFolderID = user.getFlag(MODULE_ID, 'macro-folder');
    const userFolder = doc(userFolderID, 'Folder');

    if (!userFolder) {
      if (!authored.length) continue;
    }
    const unfoldered = authored.filter(m => m.folder?.id !== userFolderID);
    if (unfoldered.length > 0) updates.push(...unfoldered.map(m => ({ _id: m._id, folder: userFolderID })));
  }
  if (updates.length) {
    MCTBanner(`MacroCreationTweaks.Info.SortingMacros`, {
      context: { count: updates.length },
      type: 'info',
      log: { updates },
    });
    Macro.implementation.updateDocuments(updates);
  } else {
    MCTBanner(`MacroCreationTweaks.Info.AllSorted`, { type: 'info' });
  }
  const unauthored = game.macros.filter(m => !m.author);
  if (unauthored.length) {
    MCTBanner(`MacroCreationTweaks.Error.UnauthoredFound`, { type: 'error', func, log: { unauthored } });
  }
}
