import { getModule } from "./init.mjs";
import { setting } from "./settings.mjs";
import { log } from "./constants.mjs";

function appendNumber(document, data, options, userID) {
  if (data.name === "New Macro") {
    let newname = "";
    let i = 0;
    const limit = setting('collision-attempts');
    do {
      newname = "New Macro " + Math.floor(Math.random() * 100);
      i++;
    } while (game.macros.getName(newname) && i < limit);

    document.updateSource({
      name: newname,
      type: "script",
    });
  }
}

function deleteEmpty(app) {
  log(app)
  if (app.object.command === "") app.object.delete();
}

export function updateHooks() {
  const modObject = getModule();
  if (setting("append-number")) {
    modObject.hookIDs["append-number"] = Hooks.on("preCreateMacro", appendNumber);
  } else {
    const appendNumberHookID = modObject.hookIDs["append-number"] ?? null;
    if (appendNumberHookID) {
      Hooks.off("preCreateMacro", appendNumberHookID);
    }
  }

  if (setting("delete-empty")) {
    modObject.hookIDs["delete-empty"] = Hooks.on("closeMacroConfig", deleteEmpty);
  } else {
    const deleteEmptyHookID = modObject.hookIDs["delete-empty"] ?? null;
    if (deleteEmptyHookID) {
      Hooks.off("closeMacroConfig", deleteEmptyHookID);
    }
  }
}
