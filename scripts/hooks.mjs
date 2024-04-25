import { MODULE_ID } from './constants.mjs';
import { getUserMacros, mctlog, updateUserFolder } from './functions.mjs';
import { MHL } from './init.mjs';

export function preSortMacro(document, data, options, userID) {
  const folderID = game.users.get(userID).getFlag(MODULE_ID, 'macro-folder');
  if (!folderID) return;
  document.updateSource({
    folder: folderID,
  });
}
export async function sortMacro(document, options, userID) {
  const { doc, isRealGM } = MHL();
  if (document.folder) return;
  if (game.user !== game.users.activeGM) return;
  const user = doc(userID, 'User');
  if (isRealGM(user)) return;
  const folder = await updateUserFolder(user);
  if (folder) {
    document.update({ folder });
  }
}
export async function deleteFolderIfEmpty(document, data, userID) {
  const { doc, isRealGM } = MHL();
  if (game.user !== game.users.activeGM || document.pack) return;
  const user = doc(document.author, 'User');
  if (isRealGM(user)) return;
  const macros = getUserMacros(user);
  if (!macros.length) await updateUserFolder(user, { teardown: true });
}
export function appendNumber(document, data) {
  if (data.name === 'New Macro') {
    document.updateSource({
      name: Macro.implementation.defaultName(),
    });
  }
}
export function changeDefaultType(document) {
  document.updateSource({
    type: 'script',
  });
}
export function deleteEmpty(app) {
  const doc = app.object;
  if (doc.isOwner && doc.command === '') doc.delete();
}
