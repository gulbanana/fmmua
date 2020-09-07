import StrikeData from "./StrikeData.js";
import StrikeActor from "./StrikeActor.js";
import StrikeItemData from "../items/StrikeData.js";
import PowerData from "../items/PowerData.js";

class SheetSection {
    traits: ItemData<StrikeItemData>[] = [];
    powers: ItemData<StrikeItemData>[] = [];
}

type SheetData = ActorSheetData<StrikeData> & {
    feats: ItemData<StrikeItemData>[];
    role: ItemData<StrikeItemData>[]
    class: ItemData<StrikeItemData>[];
    powers: ItemData<PowerData>[];
};

export default class CharacterSheet extends ActorSheet<StrikeData, StrikeActor> {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["fmmua", "sheet", "actor", "character"],
            width: 1200,
            height: 900,
            template: "systems/fmmua/actors/CharacterSheet.html"
        });
    }

    getData() {
        let data = super.getData() as SheetData;
        
        data.feats = [];
        data.role = [];
        data.class = [];
        data.powers = [];

        data.items.forEach((item: ItemData<StrikeItemData>) => {
            switch (item.type) {
                case "trait":
                    switch (item.data.source) {
                        case "feat":
                            data.feats.push(item);
                            break;

                        case "role":
                            data.role.push(item);
                            break;

                        case "class":
                            data.class.push(item);
                            break;
                            
                        default:
                            data.feats.push(item);
                            break;
                    }
                    break;

                case "power":
                    data.powers.push(item as ItemData<PowerData>);
                    break;
            }
        });

        data.powers.sort((a, b) => {
            if (sortBySource(a.data.source) < sortBySource(b.data.source)) {
                return -1;
            } else {
                return 0;
            }
        })

        return data;
    }

    activateListeners(html: JQuery<HTMLElement>) {
        super.activateListeners(html);

        html.find('.item-edit').click(ev => {
            const container = $(ev.currentTarget).parents(".item");
            const itemId = container.data("itemId");
            const item = this.actor.getOwnedItem(itemId);

            if (item == null) {
                ui.notifications.error(game.i18n.format("fmmua.error.ItemIdNotFound", {
                    actor: this.actor.name,
                    item: itemId
                }));
            } else {
                item.sheet.render(true);
            }
        });

        html.find('.item-delete').click(ev => {
            const container = $(ev.currentTarget).parents(".item");
            const itemId = container.data("itemId");
            const item = this.actor.getOwnedItem(itemId);

            if (item == null) {
                ui.notifications.error(game.i18n.format("fmmua.error.ItemIdNotFound", {
                    actor: this.actor.name,
                    item: itemId
                }));
            } else {
                container.slideUp(200, () => {
                    this.actor.deleteOwnedItem(itemId);
                });
            }
        });

        html.find('.item-add').click(async ev => {
            const container = $(ev.currentTarget).parents(".items");
            const itemType = container.data("itemType");
            const itemSource = container.data("itemSource");

            this.actor.createOwnedItem({
                type: itemType,
                data: {
                    source: itemSource
                }
            });
        });
    }
}

function returnsSource() {
    return ({} as PowerData).source;
}

function sortBySource(source: ReturnType<typeof returnsSource>) {
    switch (source) {
        case "feat":
            return 0;

        case "role":
            return 1;

        case "class":
            return 2;

        default:
            return -1;
    }
}