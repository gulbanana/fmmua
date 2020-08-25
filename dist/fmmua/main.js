var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import DebugDialog from "./scripts/apps/DebugDialog.js";
Hooks.once("init", function () {
    console.log("FMMUA: init");
});
Hooks.once("setup", function () {
    console.log("FMMUA: setup");
});
Hooks.once("ready", function () {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("FMMUA: ready");
        let result = yield DebugDialog.run();
    });
});
