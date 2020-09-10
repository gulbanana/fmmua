type Entry = {
    displayName: string,
    pattern: RegExp,
    content: string | string[]
};

type Entries = Record<string, Entry[]>;

export default {
    "Statuses": [
        {
            displayName: "Blinded",
            pattern: /blinded/ig,
            content: "A Blinded creature cannot see clearly, but it has not necessarily been rendered fully blind. Thus all of its attacks have Disadvantage. All melee attacks against it are made with Advantage. A Blinded creature cannot take advantage of Opportunities granted to it, nor use Miss Triggers."
        },
        {
            displayName: "Bloodied",
            pattern: /bloodied/ig,
            content: "A Bloodied creature has fewer than half its Hit Points remaining."
        },
        {
            displayName: "Dazed",
            pattern: /dazed/ig,
            content: "A Dazed creature does not get its full complement of actions on its turn. It may only take one action: Attack, Move, or Role. It may not take advantage of Opportunities granted to it, nor use Miss Triggers."
        },
        {
            displayName: "Deafened",
            pattern: /deafened/ig,
            content: "A Deafened creature cannot hear. It automatically fails any rolls that require hearing and has Disadvantage on rolls that use hearing but not exclusively."
        },
        {
            displayName: "Distracted",
            pattern: /distracted/ig,
            content: "A Distracted creature may not use Miss Triggers or Role Actions or take advantage of Opportunities."
        },
        {
            displayName: "Dominated",
            pattern: /dominated/ig,
            content: [
                "A Dominated creature may not take advantage of Opportunities granted to it, nor use Miss Triggers. When it starts its turn, the creature dominating it gives it a very brief command. It must attempt to follow those directions to the best of its abilities. When a player character is Dominated, it is up to the player how to go about achieving the GM’s command. They must make the attempt in good faith. Be a good sport. Movement while Dominated does not grant Opportunities.",
                "<i>Alternate (less fuzzy) version:</i> A Dominated creature is Dazed. Its one action is chosen and targeted by whoever is dominating it. Only At-Will actions may be chosen."
            ]
        },
        {
            displayName: "Flying",
            pattern: /flying/ig,
            content: "A Flying creature may not be the target of Melee attacks except those used by other Flying creatures. A Flying creature may not make melee attacks against non-Flying targets, nor does it count for Flanking against them. Moving while Flying does not grant Opportunities except to other Flying creatures. However, gaining the Flying Status does grant Opportunities to any adjacent creatures as you take off. While Flying, you do not gain Opportunities for non-Flying creatures’ movement. You can choose to stop Flying at any time. If a Flying character is knocked Prone, they lose the Flying Status."
        },
        {
            displayName: "Frenzied",
            pattern: /frenzied/ig,
            content: "When Frenzied on your turn, roll a die. On a 1, it is as though you were Dominated; on a 2, you must run towards whatever Frenzied you as directly as possible, then make a Melee Basic Attack against it with Disadvantage if it is within range; on a 3 or 4 you must Charge towards whatever Frenzied you if you are in range, or move your speed towards it and make a Ranged Basic Attack if you are not; on a 5-6 you may take your turn normally, but only use Basic Attacks. After this roll and action have been resolved, you end your turn. The roll counts as a “panic roll” and this Status is an inversion of the more common Panicked Status. If you are both Panicked and Frenzied, roll both Panic Rolls and follow the lower result (tie goes to Panic). Do not grant Opportunities for actions that are not under your control."
        },
        {
            displayName: "Grabbed",
            pattern: /grab(bed|s)?/ig,
            content: [
                "A Grabbed creature is Immobilized and cannot take advantage of Opportunities nor Miss Triggers. To escape a Grab, you must spend a Move Action to roll a Saving Throw and if you succeed you escape. Most creatures cannot Grab more than two other creatures at a time. You automatically escape from any Grab if the creature Grabbing you is Incapacitated.",
                "While Grabbing an enemy, you may try to move, dragging it with you. Spend a Move Action and make an Opposed Roll. If you have multiple enemies Grabbed, you only make one Opposed Roll and they use the Helping rules. If you win by 3 or more, move your speed freely. If you win by 1 or 2, you may move as though Slowed, or take 2 damage to move freely. If you tie, you move as though Slowed and you and the Grabbed creature each take 2 damage. If you lose by 1 or 2, you may move as though Slowed, or the enemy may choose to take 2 damage to escape. If you lose by 3 or more, the enemy escapes.",
                "Forced Movement that moves the Grabber out of reach from their victim or that would move the Grabbed creature out of reach gives the Grabbed creature a free escape attempt. If it succeeds, complete the Forced Movement, otherwise the Grabbed creature remains Grabbed and, if necessary, is dragged along by the Grabber."
            ]
        },
        {
            displayName: "Incapacitated",
            pattern: /incapacitated/ig,
            content: "When you are Incapacitated, you fall Prone and are Stunned. Marks, Grabs, and other Statuses you are actively maintaining end."
        },
        {
            displayName: "Marked by X",
            pattern: /mark(ed|s)?/ig,
            content: "If you make an attack that does not include X as a target, you grant X an Opportunity (so long as you are within range of its longest-ranged attack). If you shift out of a square within X’s reach (usually any adjacent square), you grant X an Opportunity unless your shift moved you closer to X. If the creature Marking you is incapacitated, the Mark ends."
        },
        {
            displayName: "Prone",
            pattern: /(knocked )?prone/ig,
            content: "All melee attacks against you while you are Prone have Advantage. You cannot take advantage of Opportunities nor Miss Triggers. You may not move nor shift normally. You must crawl or stand up as a Move Action. When you crawl, you move as though you were Slowed. Attacking while Prone grants Opportunities to all adjacent creatures. While Prone, treat Low Cover as Full Cover."
        },
        {
            displayName: "Slowed",
            pattern: /slowed/ig,
            content: "A Slowed creature has its speed reduced to 2 and cannot spend a Move Action to shift."
        },
        {
            displayName: "Stunned",
            pattern: /stunned/ig,
            content: "A Stunned creature may not take actions except those labeled “No Action” nor take advantage of Opportunities, nor use Miss Triggers. It cannot flank."
        }
    ],
    "Rules": [
        {
            displayName: "Ally",
            pattern: /ally/ig,
            content: "An ally generally refers to your teammates, but not yourself. If you are Dominated, whoever is dominating you gets to determine who you consider an ally for the duration."
        },
        {
            displayName: "Attack",
            pattern: /attack(s|ing)?/ig,
            content: [
                "An attack is any Attack Action or any power that would normally cost an Attack Action, even if you are using it without spending one.",
                "When a power or ability tells you to “make an attack,” you may use an Attack Action just as though you had spent one on your turn."
            ]
        },
        {
            displayName: "Buffer Points",
            pattern: /buffer points?/ig,
            content: [
                "Buffer points are noted separately from Hit Points, but act in the same way. When you take damage, remove any Buffer Points before removing Hit Points.",
                "<b>Buffer points are not cumulative:</b> if you have Buffer Points from multiple sources, instead of adding them together, just take the highest value."
            ]
        },
        {
            displayName: "Difficult Terrain",
            pattern: /difficult terrain/ig,
            content: "Difficult Terrain takes 2 squares of movement to enter. This applies to any form of movement, so if you are only shifting 1 square, you may not shift into Difficult Terrain. Flying creatures usually ignore Difficult Terrain, but it depends on the nature of the terrain."
        },
        {
            displayName: "Escape",
            pattern: /escape/ig,
            content: "Some Statuses are listed as “escape ends.” These can be ended by attempting to escape, exactly as you would from being Grabbed. That is, you must spend a Move Action to roll a Saving Throw. If you succeed, the Status ends. You automatically escape from any Grab or similar Status if the creature Grabbing you is Incapacitated."
        },
        {
            displayName: "Flanking",
            pattern: /flank(ing)?/ig,
            content: "When you and an ally are both adjacent to the same creature and on opposite sides or opposite diagonals of that creature, then you are flanking it. You both have Advantage on melee attacks against it."
        },
        {
            displayName: "Forced Movement",
            pattern: /forced movement/ig,
            content: "This includes throws, pushes, pulls, slides and involuntary teleports. It does not grant Opportunities. When using Forced Movement, you may elect to move the target fewer spaces than specified. If any Forced Movement would bring the creature into damaging terrain or into a zone that deals damage or applies a negative effect, it may elect to roll a Saving Throw to roll to safety. If it succeeds, it falls Prone at the edge of the Zone. If it fails, the Forced Movement continues but it falls Prone anyway."
        }
    ]
} as Entries;