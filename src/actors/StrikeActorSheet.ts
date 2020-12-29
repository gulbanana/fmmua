import StrikeActorData from "./StrikeActorData.js";
import StrikeActor from "./StrikeActor.js";
import PowerData from "../items/PowerData.js";

// base class with common listeners for item management
export default class StrikeActorSheet extends ActorSheet<StrikeActorData, StrikeActor> {
    getData() {
        let data = super.getData() as any;

        data.effects = data.actor.effects;

        return data;
    }
    
    activateListeners(html: JQuery<HTMLElement>) {
        super.activateListeners(html);

        html.find('.item-add').click(ev => this.onItemAdd($(ev.currentTarget).parents(".items")));
        html.find('.item-delete').click(ev => this.onItemDelete($(ev.currentTarget).parents(".item")));
        html.find('.item-display').click(ev => this.onItemDisplay($(ev.currentTarget).parents(".item")));
        html.find('.item-edit').click(ev => this.onItemEdit($(ev.currentTarget).parents(".item")));
        html.find('.item-use').click(ev => this.onItemUse($(ev.currentTarget).parents(".item")));
        
        html.find('.effect-add').click(ev => this.onEffectAdd($(ev.currentTarget).parents(".effects")));
        html.find('.effect-edit').click(ev => this.onEffectEdit($(ev.currentTarget).parents(".effect")));
        html.find('.effect-delete').click(ev => this.onEffectDelete($(ev.currentTarget).parents(".effect")));

        html.find(".trait > .text").each((_index, div) => {
            //@ts-ignore - types for tippy/popper would probably require a bundler
            tippy(div, { 
                content: div.innerHTML,
                allowHTML: true,
                delay: [400, 0]
            });
        });
    }

    resizeFloats(html: JQuery) {        
        // mostly-functional hack to get a bottom-right float
        var textContainers = html.find(".power-card > .text");
        for (let textContainer of textContainers) {
            var commands = textContainer.getElementsByClassName("commands")[0] as HTMLElement;
            
            let resizeFloat = (max: number) => {
                let outerHeight = textContainer.offsetHeight;
                commands.style.height = `${outerHeight}px`;
                (commands.style as any).shapeOutside = `inset(${outerHeight-17}px 0 0 0)`;

                if (max > 0 && outerHeight != textContainer.offsetHeight) {
                    resizeFloat(max - 1);
                }
            }

            resizeFloat(3);
        }
    }

    onItemAdd(html: JQuery) {
        if (!this.isEditable) {
            return;
        }

        const itemType = html.data("itemType");
        const itemSource = html.data("itemSource");

        this.actor.createOwnedItem({
            type: itemType,
            name: "New " + itemType.charAt(0).toUpperCase() + itemType.slice(1),
            data: {
                source: itemSource
            }
        });
    }

    onItemDelete(html: JQuery) {
        if (!this.isEditable) {
            return;
        }

        const itemId = html.data("itemId");
        const item = this.actor.getOwnedItem(itemId);

        if (item == null) {
            ui.notifications.error(game.i18n.format("fmmua.error.ItemIdNotFound", {
                actor: this.actor.name,
                item: itemId
            }));
        } else {
            html.slideUp(200, () => {
                this.actor.deleteOwnedItem(itemId);
            });
        }
    }

    onItemDisplay(html: JQuery) {
        const itemId = html.data("itemId");
        const item = this.actor.getOwnedItem(itemId);

        if (item == null) {
            ui.notifications.error(game.i18n.format("fmmua.error.ItemIdNotFound", {
                actor: this.actor.name,
                item: itemId
            }));
        } else {
            this.actor.display(item);
        }
    }

    onItemEdit(html: JQuery) {
        if (!this.isEditable) {
            return;
        }

        const itemId = html.data("itemId");
        const item = this.actor.getOwnedItem(itemId);

        if (item == null) {
            ui.notifications.error(game.i18n.format("fmmua.error.ItemIdNotFound", {
                actor: this.actor.name,
                item: itemId
            }));
        } else {
            item.sheet.render(true);
        }
    }

    onItemUse(html: JQuery) {
        if (!this.isEditable) {
            return;
        }

        const itemId = html.data("itemId");
        const item = this.actor.getOwnedItem(itemId);

        if (item == null) {
            ui.notifications.error(game.i18n.format("fmmua.error.ItemIdNotFound", {
                actor: this.actor.name,
                item: itemId
            }));
        } else {
            this.actor.use(item);
        }
    }

    onEffectAdd(html: JQuery) {
        if (!this.isEditable) {
            return;
        }

        this.actor.createEmbeddedEntity("ActiveEffect", {});
    }

    onEffectEdit(html: JQuery) {
        if (!this.isEditable) {
            return;
        }

        const effectId = html.data("effectId");
        const effect = this.actor.getEmbeddedEntity("ActiveEffect", effectId);

        if (effect == null) {
            ui.notifications.error(game.i18n.format("fmmua.error.ItemIdNotFound", {
                actor: this.actor.name,
                item: effectId
            }));
        } else {
            effect.sheet.render(true);
        }
    }

    onEffectDelete(html: JQuery) {
        if (!this.isEditable) {
            return;
        }

        const effectId = html.data("effectId");
        const effect = this.actor.getEmbeddedEntity("ActiveEffect", effectId);

        if (effect == null) {
            ui.notifications.error(game.i18n.format("fmmua.error.ItemIdNotFound", {
                actor: this.actor.name,
                item: effectId
            }));
        } else {
            html.slideUp(200, () => {
                this.actor.deleteEmbeddedEntity("ActiveEffect", effectId);
            });
        }
    }

    comparePowers(a: ItemData<PowerData>, b: ItemData<PowerData>): number {
        let result = sourceToKey(a.data) - sourceToKey(b.data);
        if (result != 0) return result;

        result = usageToKey(a.data) - usageToKey(b.data);
        if (result != 0) return result;

        result = actionToKey(a.data) - actionToKey(b.data);
        if (result != 0) return result;

        return a.name.localeCompare(b.name);
    }
}

function sourceToKey(power: PowerData) {
    switch (power.source) {
        case null:
            return 0;
        
        case "feat":
            return 0;

        case "role":
            return 1;

        case "class":
            return 2;        
    }
}

function usageToKey(power: PowerData) {
    switch (power.usage) {
        case "custom":
            return 0;

        case "encounter":
            return 1;

        case "at-will":
            return 2;
    }
}

function actionToKey(power: PowerData) {
    switch (power.action) {
        case "none":
            return -1;
        case "free":
            return 0;
        case "move":
            return 1;
        case "role":          
            return 2;
        case "attack":
            return 3;
        case "interrupt":
            return 4;
        case "reaction":
            return 5;
    }
}