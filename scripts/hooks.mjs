import { getModule } from "./init.mjs";
import { setting } from "./settings.mjs";

function appendNumber(document, data) {
  if (data.name === "New Macro") {
    document.updateSource({
      name: Macro.defaultName(),
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

export function updateHooks() {
  const { hookIDs } = getModule();
  const hooksMap = new Map([
    ["change-default-type", { func: changeDefaultType, hook: "preCreateMacro" }],
    ["append-number", { func: appendNumber, hook: "preCreateMacro" }],
    ["delete-empty", { func: deleteEmpty, hook: "closeMacroConfig" }],
  ]);
  for (const [settingName, data] of hooksMap) {
    const settingValue = setting(settingName);
    if (settingValue) {
      hookIDs[settingName] = Hooks.on(data.hook, data.func);
    } else {
      const hookID = hookIDs[settingName] ?? null;
      if (hookID) {
        Hooks.off(data.hook, hookID);
      }
    }
  }
}
