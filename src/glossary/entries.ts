export default [
    {
        displayName: "Dominated",
        pattern: /dominated?/ig,
        content: "A Dominated creature may not take advantage of Opportunities granted to it, nor use Miss Triggers. When it starts its turn, the creature dominating it gives it a very brief command. It must attempt to follow those directions to the best of its abilities. When a player character is Dominated, it is up to the player how to go about achieving the GM’s command. They must make the attempt in good faith. Be a good sport. Movement while Dominated does not grant Opportunities."
    },
    {
        displayName: "Flanking",
        pattern: /flank(ing)?/ig,
        content: "When you and an ally are both adjacent to the same creature and on opposite sides or opposite diagonals of that creature, then you are flanking it. You both have Advantage on melee attacks against it."
    },
    {
        displayName: "Incapacitated",
        pattern: /incapacitated?/ig,
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
];