export default interface StrikeItemData {    
    source: "feat" | "role" | "class" | null;
    text: string; // HTML
    script: string | null;
}