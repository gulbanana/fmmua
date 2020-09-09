export default [
    {
        displayName: "Dominated",
        pattern: /dominated?/gi,
        content: "A Dominated creature may not take advantage of Opportunities granted to it, nor use Miss Triggers. When it starts its turn, the creature dominating it gives it a very brief command. It must attempt to follow those directions to the best of its abilities. When a player character is Dominated, it is up to the player how to go about achieving the GM’s command. They must make the attempt in good faith. Be a good sport. Movement while Dominated does not grant Opportunities."
    },
    {
        displayName: "Incapacitated",
        pattern: /incapacitated?/gi,
        content: "When you are Incapacitated, you fall Prone and are Stunned. Marks, Grabs, and other Statuses you are actively maintaining end."
    },
    {
        displayName: "Prone",
        pattern: /(knocked )?prone/ig,
        content: "All melee attacks against you while you are Prone have Advantage. You cannot take advantage of Opportunities nor Miss Triggers. You may not move nor shift normally. You must crawl or stand up as a Move Action. When you crawl, you move as though you were Slowed. Attacking while Prone grants Opportunities to all adjacent creatures. While Prone, treat Low Cover as Full Cover."
    }
];