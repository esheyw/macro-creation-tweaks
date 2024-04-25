import {
  appendNumber,
  deleteEmpty,
  changeDefaultType,
  preSortMacro,
  sortMacro,
  deleteFolderIfEmpty,
} from './hooks.mjs';
import { mctlog, sortUserMacrosIntoFolders, updateRootFolder } from './functions.mjs';
import { MODULE, MHL } from './init.mjs';
import { fu } from './constants.mjs';
const debouncedRootFolder = fu.debounce(updateRootFolder, 350);
export const SETTINGS = {
  'append-number': {
    config: true,
    default: true,
    hint: 'MacroCreationTweaks.Setting.AppendNumber.Hint',
    name: 'MacroCreationTweaks.Setting.AppendNumber.Name',
    scope: 'world',
    type: Boolean,
    hooks: {
      action: appendNumber,
      hook: 'preCreateMacro',
    },
  },
  'delete-empty': {
    config: true,
    default: true,
    hint: 'MacroCreationTweaks.Setting.DeleteEmpty.Hint',
    name: 'MacroCreationTweaks.Setting.DeleteEmpty.Name',
    scope: 'world',
    type: Boolean,
    hooks: { action: deleteEmpty, hook: 'closeMacroConfig' },
  },
  'change-default-type': {
    config: true,
    default: true,
    hint: 'MacroCreationTweaks.Setting.ChangeDefaultType.Hint',
    name: 'MacroCreationTweaks.Setting.ChangeDefaultType.Name',
    scope: 'world',
    type: Boolean,
    hooks: {
      action: changeDefaultType,
      hook: 'preCreateMacro',
    },
  },
  'players-folders': {
    config: true,
    default: 'no',
    scope: 'world',
    type: String,
    hint: 'MacroCreationTweaks.Setting.PlayersFolders.Hint',
    name: 'MacroCreationTweaks.Setting.PlayersFolders.Name',
    choices: {
      root: 'MacroCreationTweaks.Setting.PlayersFolders.Choices.Root',
      noroot: 'MacroCreationTweaks.Setting.PlayersFolders.Choices.NoRoot',
      no: 'No',
    },
    hooks: [
      {
        action: preSortMacro,
        hook: 'preCreateMacro',
        test: value => value.includes('root'),
      },
      {
        action: sortMacro,
        hook: 'createMacro',
        test: value => value.includes('root'),
      },
      {
        action: deleteFolderIfEmpty,
        hook: 'deleteMacro',
        test: value => value.includes('root'),
      },
    ],
    onChange: debouncedRootFolder,
    group: 'MacroCreationTweaks.SettingGroup.Sorting',
  },
  'players-folder-root-name': {
    config: true,
    default: 'Player Macros',
    scope: 'world',
    type: String,
    // hint: "MacroCreationTweaks.Setting.PlayersFolderRootName.Hint",
    name: 'MacroCreationTweaks.Setting.PlayersFolderRootName.Name',
    visibility: {
      dependsOn: 'players-folders',
      test: value => value === 'root',
    },
    onChange: debouncedRootFolder,
    group: 'MacroCreationTweaks.SettingGroup.Sorting',
  },
  'players-folder-root-color': {
    config: true,
    default: '#18591F',
    scope: 'world',
    type: String,
    // hint: "MacroCreationTweaks.Setting.PlayersFolderRootColor.Hint",
    name: 'MacroCreationTweaks.Setting.PlayersFolderRootColor.Name',
    visibility: {
      dependsOn: 'players-folders',
      test: value => value === 'root',
    },
    colorPicker: true,
    onChange: debouncedRootFolder,
    group: 'MacroCreationTweaks.SettingGroup.Sorting',
  },
  'sort-existing-macros': {
    config: true,
    default: 'replaceme',
    type: String,
    scope: 'world',
    hint: 'MacroCreationTweaks.Setting.SortExistingMacros.Hint',
    name: 'MacroCreationTweaks.Setting.SortExistingMacros.Name',
    button: {
      label: 'MacroCreationTweaks.Setting.SortExistingMacros.ButtonLabel',
      action: sortUserMacrosIntoFolders,
      icon: 'fa-solid fa-arrow-down-z-a',
    },
    visibility: {
      dependsOn: 'players-folders',
      test: (formValue, savedValue, visible) => {
        if (visible && !formValue.includes('root')) return false;
        return savedValue.includes('root');
      },
    },
    group: 'MacroCreationTweaks.SettingGroup.Sorting',
  },
  'players-folder-root-id': {
    config: false,
    type: String,
    scope: 'world',
    default: null,
  },
};

export function setting(key) {
  const SM = MODULE()?.settingsManager;
  if (SM?.initialized && game?.user) {
    return SM.get(key);
  }
  return undefined;
}
