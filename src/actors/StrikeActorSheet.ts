import StrikeActorData from "./StrikeActorData.js";
import StrikeActor from "./StrikeActor.js";

// base class with common listeners for item management
export default class StrikeActorSheet extends ActorSheet<StrikeActorData, StrikeActor> {
    activateListeners(html: JQuery<HTMLElement>) {
        super.activateListeners(html);

        html.find('.item-add').click(ev => this.onItemAdd($(ev.currentTarget).parents(".items")));
        html.find('.item-delete').click(ev => this.onItemDelete($(ev.currentTarget).parents(".item")));
        html.find('.item-display').click(ev => this.onItemDisplay($(ev.currentTarget).parents(".item")));
        html.find('.item-edit').click(ev => this.onItemEdit($(ev.currentTarget).parents(".item")));
        html.find('.item-use').click(ev => this.onItemUse($(ev.currentTarget).parents(".item")));
        
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

            new ResizeObserver(() => resizeFloat(3)).observe(textContainer);
            resizeFloat(3);
        }
    }

    onItemAdd(html: JQuery) {
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
            item.display(this.actor);
        }
    }

    onItemEdit(html: JQuery) {
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
        const itemId = html.data("itemId");
        const item = this.actor.getOwnedItem(itemId);

        if (item == null) {
            ui.notifications.error(game.i18n.format("fmmua.error.ItemIdNotFound", {
                actor: this.actor.name,
                item: itemId
            }));
        } else {
            item.use(this.actor);
        }
    }
}