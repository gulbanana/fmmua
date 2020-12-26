import StrikeActor from "../actors/StrikeActor.js";
import PowerData from "../items/PowerData.js";
import StrikeItem from "../items/StrikeItem.js";
import Cancellation from "./Cancellation.js";
import MacroHost from "./MacroHost.js";
import MacroSheet from "./MacroSheet.js";

export function _init() {
    CONFIG.Macro.sheetClass = MacroSheet;
 
    Hooks.on("hotbarDrop", onHotbarDrop);
    Hooks.on("preUpdateOwnedItem", onPreUpdateOwnedItem);

    let api = new MacroHost();
    let pps = Object.getOwnPropertyNames(api)
    let fns = Object.getOwnPropertyNames(Object.getPrototypeOf(api)).filter(e => e !== "constructor");
    let params = pps.concat(fns).filter(p => !p.startsWith("_"));

    let lang = hljs.getLanguage("javascript");
    lang.keywords.params = "";
    for (let param of params) {
        lang.keywords.params = `${lang.keywords.params} ${param}`;
    }

    window.addEventListener("unhandledrejection", onUnhandledRejection);
}

export async function execute(actor: StrikeActor, power: StrikeItem): Promise<boolean> {
    if (power.data.data.script && Macros.canUseScripts(game.user)) {                      
        let host = new MacroHost(actor, power);
        
        // the macro api as parameters (keys) and args (values) to f()
        let pps = Object.getOwnPropertyNames(host).filter(p => !p.startsWith("_")) as (keyof MacroHost)[];
        let fns = Object.getOwnPropertyNames(Object.getPrototypeOf(host)).filter(p => !p.startsWith("_") && p !== "constructor") as (keyof MacroHost)[];
        let params = pps.concat(fns) as string[];
        let args = pps.map(k => host[k])
           .concat(fns.map(k => (host[k] as Function).bind(host)));

        // final parameter is the function body
        params.push(`${power.data.data.script};\n return true;`);            

        // can't call/apply new() directly, but we can bind it
        let AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
        let AsyncFunctionWithParams = AsyncFunction.bind.apply(
            AsyncFunction,        // "this" for bind()
            [null as string|null] // "this" for bound constructor (first argument to bind())
            .concat(params)       // arguments for bound constructor (subsequent arguments to bind())
        );

        // create macro function f()
        let f = new AsyncFunctionWithParams();

        try {
            var result = await f.apply(power.data.data, args);
            if (result) {
                await host._drain();
                await host._commit();
                await host._toMessage();
            }
            return result;
        } catch (err) {
            if (!(err instanceof Cancellation)) {
                ui.notifications.error("There was an error in your macro syntax. See the console (F12) for details.");
                console.error(err);
            }

            return false;
        }
    } else {
        await actor.display(power);
    }

    return true;
}

type DropData = {
    type: "Item",
    actorId: string,
    data: ItemData<PowerData>
} | {
    type: "Actor" | "Scene"
}

async function onHotbarDrop(_hotbar: any, data: DropData, slot: number): Promise<boolean> {
    if (data.type != "Item" || data.data === undefined || data.data.type != "power") {
        return true;
    }

    let power = data.data;
    let script = `actor?.use(this.name)`;
    let macro = ui.hotbar.macros.map(m => m.macro).find(m => m != null && m.data.command == script && m.data.name == power.name);

    if (!macro) {
      macro = await Macro.create({
        name: power.name,
        type: "script",
        img: power.data.customImage || power.img,
        command: script,
        flags: { "fmmua.power": true }
      });
    }

    game.user.assignHotbarMacro(macro, slot);
    
    return false;
}

function onPreUpdateOwnedItem(actor: StrikeActor, itemData: Record<string, any>, updateData: Record<string, any>, _options: {diff: boolean}, userId: string) {
    if (itemData.type == "power" && updateData.name && updateData.name != itemData.name) {
        // try to find a corresponding macro and update it
        let script = `actor?.use(this.name)`;
        let macro = ui.hotbar.macros.map(m => m.macro).find(m => m != null && m.data.command == script && m.data.name == itemData.name);
        if (macro) {
            macro?.update({
                "name": updateData.name
            });
        }
    }
}

function onUnhandledRejection(ev: PromiseRejectionEvent) {
    // someone else has promised to handle the rejection
    if (ev.reason.deferred) {
        ev.preventDefault();
    }
}