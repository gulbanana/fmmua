export type Entry = {
    displayName: string,
    pattern: RegExp | null,
    content: string | string[]
};

type Category = {
    displayName: string;
    entries: Entry[]
}

let categories = [
    {
        displayName: "Rules",
        entries: [
            {
                displayName: "Ally",
                pattern: "ally",
                content: "An ally generally refers to your teammates, but not yourself. If you are Dominated, whoever is dominating you gets to determine who you consider an ally for the duration."
            },
            {
                displayName: "Attack",
                pattern: "attacking|attacks|an attack",
                content: [
                    "An attack is any Attack Action or any power that would normally cost an Attack Action, even if you are using it without spending one.",
                    "When a power or ability tells you to “make an attack,” you may use an Attack Action just as though you had spent one on your turn."
                ]
            },
            {
                displayName: "Buffer Points",
                pattern: "buffer points?",
                content: [
                    "Buffer points are noted separately from Hit Points, but act in the same way. When you take damage, remove any Buffer Points before removing Hit Points.",
                    "<b>Buffer points are not cumulative:</b> if you have Buffer Points from multiple sources, instead of adding them together, just take the highest value."
                ]
            },
            {
                displayName: "Difficult Terrain",
                pattern: "difficult terrain",
                content: "Difficult Terrain takes 2 squares of movement to enter. This applies to any form of movement, so if you are only shifting 1 square, you may not shift into Difficult Terrain. Flying creatures usually ignore Difficult Terrain, but it depends on the nature of the terrain."
            },
            {
                displayName: "Distance",
                pattern: null,
                content: "The number of squares separating two characters, counted by the shortest route, and ignoring terrain and obstacles. For example, adjacent creatures are a distance of 1 apart."
            },
            {
                displayName: "Escape",
                pattern: "escapes?",
                content: "Some Statuses are listed as “escape ends.” These can be ended by attempting to escape, exactly as you would from being Grabbed. That is, you must spend a Move Action to roll a Saving Throw. If you succeed, the Status ends. You automatically escape from any Grab or similar Status if the creature Grabbing you is Incapacitated."
            },
            {
                displayName: "Flanking",
                pattern: "flank(ing)?",
                content: "When you and an ally are both adjacent to the same creature and on opposite sides or opposite diagonals of that creature, then you are flanking it. You both have Advantage on melee attacks against it."
            },
            {
                displayName: "Forced Movement",
                pattern: "forced movement",
                content: "This includes throws, pushes, pulls, slides and involuntary teleports. It does not grant Opportunities. When using Forced Movement, you may elect to move the target fewer spaces than specified. If any Forced Movement would bring the creature into damaging terrain or into a zone that deals damage or applies a negative effect, it may elect to roll a Saving Throw to roll to safety. If it succeeds, it falls Prone at the edge of the Zone. If it fails, the Forced Movement continues but it falls Prone anyway."
            },
            {
                displayName: "Interrupt",
                pattern: null,
                content: "An Interrupt is an action that is triggered. It is resolved before the triggering event."
            },
            {
                displayName: "Ongoing Damage",
                pattern: "ongoing (\\w+ |\\w+ \\w+ )?damage",
                content: "When you have Ongoing X Damage, you take X damage at the start of your turn. There is one exception: if taking the damage would bring you down to 0 HP or less, you may take one final action (of any sort) before taking the damage. If that action removes the Status, you are saved and may continue your turn. Multiple instances of Ongoing Damage are cumulative, unless they are from the same source (the same power or trait). If a creature gains ongoing damage during its turn, it immediately takes that damage."
            },
            {
                displayName: "Opportunity",
                pattern: "opportunit(y|ies)",
                content: [
                    "Certain actions cause you to grant your opponents an Opportunity. When you provoke an Opportunity, your opponent takes the chance to strike at you, and you take damage. When you are granted an Opportunity, you may deal 2 damage to the enemy who granted it. This damage happens as an Interrupt, i.e. before the triggering action is resolved.",
                    "<ul><li>When you make a ranged attack, you grant an Opportunity to every adjacent enemy. (Note that using a ranged Role Action does not grant an Opportunity.)</li><li>When you leave your square without shifting (see Movement) you grant an Opportunity to every adjacent enemy.</li><li>Some characters have special abilities which let them use Opportunities in a different way or gain Opportunities at different times. Such abilities are always explained in the specific rules for that creature or character.</li></ul>",
                    "You may only take advantage of at most one Opportunity granted to you by each creature per turn."
                ]
            },
            {
                displayName: "Pull",
                pattern: "pull",
                content: "When you pull a creature, you move it the specified number of squares. Each square must bring it closer to you (i.e. reduce the distance between you). See Forced Movement."
            },
            {
                displayName: "Push",
                pattern: "push",
                content: "When you push a creature, you move it the specified number of squares. Each square must move it farther from you (i.e. increase the distance between you). See Forced Movement."
            },
            {
                displayName: "Reach N",
                pattern: "reach( \\d+)?",
                content: "When a creature has Reach N, it may make melee attacks against any creature within N squares. Leaving any square within a creature’s reach without shifting grants it an Opportunity, unless your movement brings you closer to it. You don’t give the thug a chance when you approach, but you do when you run away."
            },
            {
                displayName: "Reaction",
                pattern: null,
                content: "A Reaction is an action that is triggered. It is resolved after the triggering event."
            },
            {
                displayName: "Recharge",
                pattern: "recharged?",
                content: "When a spent Encounter Power is recharged, it no longer counts as spent and can be used again."
            },
            {
                displayName: "Saving Throw",
                pattern: "saving throw|save ends",
                content: "Roll a die. On a 4-6 you succeed, on a 1-3 you fail. Statuses that are denoted “save ends” mean that you get to roll a Saving Throw at the end of your turn, but some powers or abilities might grant you a Saving Throw earlier than that."
            },
            {
                displayName: "Slide",
                pattern: "slide",
                content: "When you slide a creature, you move it the specified number of squares in any direction or combination of directions you like. See Forced Movement."
            },
            {
                displayName: "Teleport",
                pattern: "teleport",
                content: "A Teleport counts as a Shift (if you do it) or a Slide (if you do it to another creature) except that it ignores all intervening terrain and creatures. Teleporting never grants Opportunities. Teleporting automatically escapes Grabs. Essentially, teleporting allows you to ignore terrain and all the usual consequences of leaving a square."
            },
            {
                displayName: "Throw",
                pattern: "(?<!saving )throw",
                content: "Throw is identical to Push except that it ignores most terrain and creatures between the start and end of the Push. See Forced Movement."
            },
            {
                displayName: "Zone",
                pattern: "zones?",
                content: "A Zone is simply a region of the battlefield with an ongoing effect. Zones apply their effect or damage to a given target no more than once per round (i.e. once it has experienced the effect, it cannot experience it again until the start of its next turn, assuming it only has one turn per round). So moving in and out and in again is no diferent than moving in once. If a creature is forced into a Zone that deals damage or applies a negative effect, it may elect to roll a Saving Throw to roll to safety. If it succeeds, it falls Prone at the edge of the Zone. If it fails, the Forced Movement continues but it falls Prone anyway."
            },
        ]
    },
    { 
        displayName: "Statuses", 
        entries: [
            {
                displayName: "Blinded",
                pattern: "blinded",
                content: "A Blinded creature cannot see clearly, but it has not necessarily been rendered fully blind. Thus all of its attacks have Disadvantage. All melee attacks against it are made with Advantage. A Blinded creature cannot take advantage of Opportunities granted to it, nor use Miss Triggers."
            },
            {
                displayName: "Bloodied",
                pattern: "bloodied",
                content: "A Bloodied creature has fewer than half its Hit Points remaining."
            },
            {
                displayName: "Dazed",
                pattern: "dazed",
                content: "A Dazed creature does not get its full complement of actions on its turn. It may only take one action: Attack, Move, or Role. It may not take advantage of Opportunities granted to it, nor use Miss Triggers."
            },
            {
                displayName: "Deafened",
                pattern: "deafened",
                content: "A Deafened creature cannot hear. It automatically fails any rolls that require hearing and has Disadvantage on rolls that use hearing but not exclusively."
            },
            {
                displayName: "Distracted",
                pattern: "distracted",
                content: "A Distracted creature may not use Miss Triggers or Role Actions or take advantage of Opportunities."
            },
            {
                displayName: "Dominated",
                pattern: "dominated",
                content: [
                    "A Dominated creature may not take advantage of Opportunities granted to it, nor use Miss Triggers. When it starts its turn, the creature dominating it gives it a very brief command. It must attempt to follow those directions to the best of its abilities. When a player character is Dominated, it is up to the player how to go about achieving the GM’s command. They must make the attempt in good faith. Be a good sport. Movement while Dominated does not grant Opportunities.",
                    "<i>Alternate (less fuzzy) version:</i> A Dominated creature is Dazed. Its one action is chosen and targeted by whoever is dominating it. Only At-Will actions may be chosen."
                ]
            },
            {
                displayName: "Flying",
                pattern: "flying",
                content: "A Flying creature may not be the target of Melee attacks except those used by other Flying creatures. A Flying creature may not make melee attacks against non-Flying targets, nor does it count for Flanking against them. Moving while Flying does not grant Opportunities except to other Flying creatures. However, gaining the Flying Status does grant Opportunities to any adjacent creatures as you take off. While Flying, you do not gain Opportunities for non-Flying creatures’ movement. You can choose to stop Flying at any time. If a Flying character is knocked Prone, they lose the Flying Status."
            },
            {
                displayName: "Frenzied",
                pattern: "frenzied",
                content: "When Frenzied on your turn, roll a die. On a 1, it is as though you were Dominated; on a 2, you must run towards whatever Frenzied you as directly as possible, then make a Melee Basic Attack against it with Disadvantage if it is within range; on a 3 or 4 you must Charge towards whatever Frenzied you if you are in range, or move your speed towards it and make a Ranged Basic Attack if you are not; on a 5-6 you may take your turn normally, but only use Basic Attacks. After this roll and action have been resolved, you end your turn. The roll counts as a “panic roll” and this Status is an inversion of the more common Panicked Status. If you are both Panicked and Frenzied, roll both Panic Rolls and follow the lower result (tie goes to Panic). Do not grant Opportunities for actions that are not under your control."
            },
            {
                displayName: "Grabbed",
                pattern: "grab(bed|s)?",
                content: [
                    "A Grabbed creature is Immobilized and cannot take advantage of Opportunities nor Miss Triggers. To escape a Grab, you must spend a Move Action to roll a Saving Throw and if you succeed you escape. Most creatures cannot Grab more than two other creatures at a time. You automatically escape from any Grab if the creature Grabbing you is Incapacitated.",
                    "While Grabbing an enemy, you may try to move, dragging it with you. Spend a Move Action and make an Opposed Roll. If you have multiple enemies Grabbed, you only make one Opposed Roll and they use the Helping rules. If you win by 3 or more, move your speed freely. If you win by 1 or 2, you may move as though Slowed, or take 2 damage to move freely. If you tie, you move as though Slowed and you and the Grabbed creature each take 2 damage. If you lose by 1 or 2, you may move as though Slowed, or the enemy may choose to take 2 damage to escape. If you lose by 3 or more, the enemy escapes.",
                    "Forced Movement that moves the Grabber out of reach from their victim or that would move the Grabbed creature out of reach gives the Grabbed creature a free escape attempt. If it succeeds, complete the Forced Movement, otherwise the Grabbed creature remains Grabbed and, if necessary, is dragged along by the Grabber."
                ]
            },
            {
                displayName: "Guarded",
                pattern: "guarded",
                content: "When a creature is Guarded, attacks against the creature that roll a 6 are treated as 5s, and 4s are treated as 3s. Guarded overrides attack roll bonuses: an attacker can boost their roll up to a 6 (using a Miss Token, for instance), but Guarded will bump it right back down to a 5."
            },
            {
                displayName: "Harried",
                pattern: "harried",
                content: "A Harried creature has Disadvantage on all its Saving Throws, rolls to escape, and panic rolls (see Panicked). You cannot end the Harried effect or attempt to save against it at the end of your turn until you have finished all your other Saving Throws."
            },
            {
                displayName: "Immobilized",
                pattern: "immobilized",
                content: "An Immobilized creature cannot move except by teleporting."
            },
            {
                displayName: "Incapacitated",
                pattern: "incapacitated",
                content: "When you are Incapacitated, you fall Prone and are Stunned. Marks, Grabs, and other Statuses you are actively maintaining end."
            },
            {
                displayName: "Invisible",
                pattern: "invisible",
                content: "While Invisible, you cannot be seen."
            },
            {
                displayName: "Marked by X",
                pattern: "mark(ed|s)?",
                content: "If you make an attack that does not include X as a target, you grant X an Opportunity (so long as you are within range of its longest-ranged attack). If you shift out of a square within X’s reach (usually any adjacent square), you grant X an Opportunity unless your shift moved you closer to X. If the creature Marking you is incapacitated, the Mark ends."
            },
            {
                displayName: "Panicked",
                pattern: "panick?(ed|ing)",
                content: "When Panicked on your turn, roll a die. On a 1, it is as though you were Dominated; on a 2, you must run away from whatever Panicked you as directly as possible, while making a Ranged Basic Attack against it with Disadvantage if it is within range; on a 3 or 4 you must take cover from the source of your fear, then make a Ranged Basic Attack against it if it is within range (if you are already behind cover, you must still move at least one square. If there is no cover within your speed, treat this as a 2); on a 5-6 you may take your turn normally, but only use Basic Attacks. After this roll and action have been resolved, you end your turn. Do not grant Opportunities for actions that are not under your control."
            },
            {
                displayName: "Phasing",
                pattern: "phasing",
                content: "Phasing creatures can move through obstacles and terrain, but may not end their turn in an object."
            },
            {
                displayName: "Prone",
                pattern: "(knocked )?prone",
                content: "All melee attacks against you while you are Prone have Advantage. You cannot take advantage of Opportunities nor Miss Triggers. You may not move nor shift normally. You must crawl or stand up as a Move Action. When you crawl, you move as though you were Slowed. Attacking while Prone grants Opportunities to all adjacent creatures. While Prone, treat Low Cover as Full Cover."
            },
            {
                displayName: "Regenerate X",
                pattern: "regenerate( \\d+)?",
                content: "A creature with this Status Regenerates X Hit Points at the start of each of its turns. Regeneration generally does not combine with things that add to or subtract from the effectiveness of healing or regaining HP."
            },
            {
                displayName: "Resist X",
                pattern: "resist( \\d+)?( all?)",
                content: "A creature that resists X damage totals all the damage it receives at any one time and subtracts X before reducing its Hit Points. So an attack that does damage on its damage line, immediately as an effect, and because of a Class or Role feature only has X subtracted from the total once, not three times. By contrast, an attack that does damage on its damage line and more damage later as an effect is resisted on both occasions. Resistances from multiple sources are cumulative, but not those from the same source."
            },
            {
                displayName: "Restrained",
                pattern: "restrained",
                content: "A Restrained creature is Immobilized and has Disadvantage on all its attacks. It may not take advantage of Opportunities nor Miss Triggers."
            },
            {
                displayName: "Slowed",
                pattern: "slowed",
                content: "A Slowed creature has its speed reduced to 2 and cannot spend a Move Action to shift."
            },
            {
                displayName: "Stunned",
                pattern: "stunned",
                content: "A Stunned creature may not take actions except those labeled “No Action” nor take advantage of Opportunities, nor use Miss Triggers. It cannot flank."
            },
            {
                displayName: "Vulnerable X",
                pattern: "vulnerable( \\d+( all?))?",
                content: "A creature that has Vulnerable X damage totals all the damage it receives at any one time and adds X before reducing its Hit Points. So an attack that does damage on its damage line, immediately as an effect, and because of a Class or Role feature only has X added to the total once, not three times. By contrast, an attack that does damage on its damage line and more damage later as an effect does the extra damage on both occasions. Vulnerabilities from multiple sources are cumulative, but not those from the same source. Usually creatures are only vulnerable to certain types of attacks, such as a robot having Vulnerable 2 to electric attacks. When any attack gives the target Vulnerability as an Effect, the Vulnerability does not apply to damage from that attack, but only to future damage."
            },
            {
                displayName: "Weakened",
                pattern: "weakened",
                content: [
                    "When a Weakened creature attacks and does damage, it sums up all its damage resulting from its attack and halves it, rounding down, before reducing its target’s Hit Points.",
                    "If you are Weakened and your victim is Vulnerable to or Resists your damage, the Vulnerability or Resistance are added on <i>after</i> halving the damage."
                ]
            }
        ]
    },
    {
        displayName: "Sight and Targetting",
        entries: [
            {
                displayName: "Concealed",
                pattern: "concealed( to you)?|cannot be seen",
                content: "When a target is <i>concealed</i>, all Ranged and Melee attacks against it have Disadvantage. When a target <i>cannot be seen</i>, you cannot target it with Ranged and Melee attacks or Opportunities. Targets that <i>cannot be seen</i> always briefly reveal their position when they attack, even if they remain Invisible. If you wish to attack such a creature, you must ready an action to attack it when it reveals itself."
            },
            {
                displayName: "Obscured",
                pattern: "(completely )?obscured", 
                content: "When an area is <i>obscured</i>, all creatures in the area are concealed. If your only sight-lines to a creature pass through an <i>obscured</i> area, that creature is concealed to you. This rule counts the square you are in as part of your sight-lines. So in particular all creatures are considered concealed to a character in an <i>obscured</i> square. When an area is <i>completely obscured</i>, the above is all true except that you may replace concealed with cannot be seen."
            },
            {
                displayName: "Hidden",
                pattern: "hidden",
                content: [
                    "<i>Hidden</i> simply means that your enemies do not know where you are. They can’t target you and you have Advantage on your attacks against them. If you take any action that would reveal your position such as leaving cover, using an Opportunity, or making an attack, you are still considered <i>Hidden</i> until the action is fully resolved. So you can Charge out of cover at an enemy and still have Advantage on that attack, but if you move and then attack, your attack does not have Advantage. If you use a power that allows you to make multiple attacks, you only have Advantage on the first.",
                    "To become <i>Hidden</i> you must be out of sight for a full round. You must also be out of sight in a place where you could actually move around while remaining out of sight. You can’t hide behind a tree and expect the enemy to just forget where you are. Once you are <i>Hidden</i> you need not remain out of sight so long as you keep to cover or concealment. If you want to dart from one piece of cover to another without being seen, you must make a Skill Roll as you move, and the GM is within their rights to disallow such an action if your movement is directly where the enemy would be looking — right across a hallway, say."
                ]
            }
        ]
    }
];

export default categories.map(c => {
    return {
        displayName: c.displayName,
        entries: c.entries.map(e => {
            return {
                displayName: e.displayName,
                content: e.content,
                pattern: e.pattern == null ? null : new RegExp("\\W(" + e.pattern + ")\\W", "ig")
            } as Entry
        })    
    }
}) as Category[];