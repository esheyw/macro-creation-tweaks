import { MODULE_ID } from "./constants.mjs";
import { MODULE } from "./init.mjs";
import { setting } from "./settings.mjs";

export const HOOKS = new Map([
  ["change-default-type", { func: changeDefaultType, hook: "preCreateMacro" }],
  ["append-number", { func: appendNumber, hook: "preCreateMacro" }],
  ["delete-empty", { func: deleteEmpty, hook: "closeMacroConfig" }],
  ["players-folders", { func: sortMacro, hook: "preCreateMacro", test: (value) => value.includes("root") }],
]);
function sortMacro(document, data, options, userID) {
  const folderID = game.users.get(userID).getFlag(MODULE_ID, "macro-folder");
  if (!folderID) return;
  document.updateSource({
    folder: folderID,
  });
}
function appendNumber(document, data) {
  if (data.name === "New Macro") {
    document.updateSource({
      name: Macro.implementation.defaultName(),
    });
  }
}
function changeDefaultType(document) {
  document.updateSource({
    type: "script",
  });
}
function deleteEmpty(app) {
  const doc = app.object;
  if (doc.isOwner && doc.command === "") doc.delete();
}

async function resetSetting(event) {
  const div = event.target.closest("div[data-setting-id]");
  const inputs = Array.from(div.querySelectorAll("input, select"));
  const label = div.querySelector("label");
  const settingID = div.dataset.settingId;
  const defaultValue = game.settings.settings.get(settingID).default;
  const doReset = await Dialog.confirm({
    defaultYes: false,
    title: game.i18n.localize("MacroCreationTweaks.Reset.Title"),
    content: game.i18n.format("MacroCreationTweaks.Reset.Body", { setting: label.innerText, value: defaultValue }),
  });
  if (!doReset) return;
  for (const input of inputs) {
    if (input.tagName === "INPUT" && input.type === "checkbox") {
      input.checked = defaultValue;
    }
    input.value = defaultValue;
  }
  game.settings.set(MODULE_ID, settingID.split(".")[1], defaultValue);
  updateResetAnchor(event);
}

function updateResetAnchor(event) {
  const div = event.target.closest("div[data-setting-id]");
  const anchor = div.querySelector("a[data-reset-for]");
  const settingID = div.dataset.settingId;
  const defaultValue = game.settings.settings.get(settingID).default;
  const firstInput = div.querySelector("input, select");
  const currentValue = firstInput?.type === "checkbox" ? firstInput.checked : firstInput.value;
  if (currentValue === defaultValue) {
    anchor.style["filter"] = "blur(2px)";
    anchor.style["cursor"] = "not-allowed";
    anchor.dataset.tooltip = game.i18n.localize("MacroCreationTweaks.Reset.IsDefault");
    anchor.removeEventListener("click", resetSetting);
  } else {
    anchor.style["filter"] = "none";
    anchor.style["cursor"] = "pointer";
    anchor.dataset.tooltip = game.i18n.localize("MacroCreationTweaks.Reset.Tooltip");
    anchor.addEventListener("click", resetSetting);
  }
}

function addResetAnchors(moduleTab) {
  const settingDivs = Array.from(moduleTab.querySelectorAll(`[data-setting-id]`));
  for (const div of settingDivs) {
    const settingID = div.dataset.settingId;
    const label = div.querySelector("label");
    const firstInput = div.querySelector("input, select");
    // something's gone wrong or its a settings menu
    if (!firstInput) continue;
    // only time there should be more than one input per div is colorpickers, and they'll update the text field anyway.
    let anchor = div.querySelector("a[data-reset-for]");
    if (!anchor) {
      anchor = document.createElement("a");
      anchor.dataset.resetFor = settingID;
      anchor.style["padding-left"] = "0.5em";
      anchor.innerHTML = '<i class="fa-regular fa-arrow-rotate-left"></i>';
      anchor.dataset.tooltipDirection = "UP";
      label.append(anchor);
      firstInput.addEventListener("change", updateResetAnchor);
    }
    updateResetAnchor({ target: firstInput });
  }
}

function addColorPickers(moduleTab) {
  const textInputs = Array.from(moduleTab.querySelectorAll('input[type="text"]'));
  for (const textInput of textInputs) {
    const div = textInput.closest("div[data-setting-id]");
    const settingName = div.dataset.settingId.split(".")[1];
    const defaultValue = game.settings.settings.get(div.dataset.settingId).default;
    if (!/^#[A-F0-9]{6}/i.test(defaultValue)) continue;
    const colorPicker = document.createElement("input");
    colorPicker.type = "color";
    colorPicker.style["max-width"] = "50px";
    colorPicker.dataset.edit = div.dataset.settingId;
    colorPicker.value = setting(settingName);
    colorPicker.addEventListener("change", (event) => {
      //force a reset anchor refresh; foundry's code for updating the text field runs too slowly?
      textInput.value = event.target.value;
      updateResetAnchor(event);
    });
    textInput.parentElement.append(colorPicker);
    textInput.pattern = "^#[A-Fa-f0-9]{6}";
    textInput.addEventListener("input", (event) => {
      //would love to support more than a string 6-character hex code, but input[type=color] yells about condensed and/or rgba on chrome
      if (event.target.value.length > 7) {
        event.target.value = event.target.value.substring(0, 7);
      }
      if (!/^#[A-F0-9]{6}/i.test(event.target.value)) {
        textInput.style["text-decoration"] = "underline wavy var(--color-level-error, red)";
        textInput.dataset.tooltipDirection = "UP";
        textInput.dataset.tooltip = game.i18n.localize("MacroCreationTweaks.ValidHexCode");
        return false;
      }
      textInput.dataset.tooltip = "";
      textInput.style["text-decoration"] = "none";
      colorPicker.value = event.target.value;
    });
  }
}
const settingVisibilityDependencies = new Map([
  ["players-folder-root-color", { dependsOn: "players-folders", test: (value) => value === "root" }],
  ["players-folder-root-name", { dependsOn: "players-folders", test: (value) => value === "root" }],
  ["sort-existing-macros", { dependsOn: "players-folders", test: (value) => value.includes("root") }],
]);
function addSettingVisibilityListeners(moduleTab) {
  const controlElements = new Set();
  for (const [setting, data] of settingVisibilityDependencies) {
    const controlDiv = moduleTab.querySelector(`[data-setting-id$="${data.dependsOn}"]`);
    const controlElement = controlDiv.querySelector("input, select");
    controlElements.add(controlElement);
    const subjectDiv = moduleTab.querySelector(`[data-setting-id$="${setting}"]`);
    const test = data.test ?? ((value) => !!value);
    controlElement.addEventListener("change", (event) => {
      subjectDiv.style.display = test(event.target.value) ? "flex" : "none";
    });        
  }
  //initial checks
  for (const el of controlElements) {
    el.dispatchEvent(new Event('change'));
  }
}

function replaceButtonSettings(moduleTab) {
  const textInputs = Array.from(moduleTab.querySelectorAll('input[type="text"]'));
  for (const textInput of textInputs) {
    const div = textInput.closest("div[data-setting-id]");
    div.classList.add('submenu')
    const settingInitialValues = game.settings.settings.get(div.dataset.settingId)
    if (settingInitialValues.default !== "replaceme") continue;
    const button = document.createElement('button')
    const labelText = game.i18n.localize(settingInitialValues.replaceWith.label)
    button.innerHTML= `<i class="fa-solid fa-arrow-down-triangle-square"></i><label>${labelText}</label>`;
    button.type = 'button';
    button.style['min-width'] = '75px';
    button.addEventListener('click', settingInitialValues.replaceWith.action)
    textInput.replaceWith(button);
  } 
}
export function registerPermanentHooks() {
  Hooks.on("renderSettingsConfig", (app, html, data) => {
    html = html instanceof jQuery ? html[0] : html;
    const moduleTab = html.querySelector(`[data-category="${MODULE_ID}"]`);
    //replace settings with buttons *before* applying refresh anchors
    replaceButtonSettings(moduleTab)
    addColorPickers(moduleTab);
    addResetAnchors(moduleTab);
    addSettingVisibilityListeners(moduleTab);    
  });
}
export function updateConditionalHooks() {
  const { hookIDs } = MODULE();
  for (const [settingName, data] of HOOKS) {
    const settingValue = setting(settingName);
    const active = "test" in data ? data.test(settingValue) : settingValue;
    if (active) {
      const existingHook = hookIDs[settingName] ?? null;
      if (existingHook) continue;
      hookIDs[settingName] = Hooks.on(data.hook, data.func);
    } else {
      const hookID = hookIDs[settingName] ?? null;
      if (hookID) {
        Hooks.off(data.hook, hookID);
        delete hookIDs[settingName];
      }
    }
  }
}
