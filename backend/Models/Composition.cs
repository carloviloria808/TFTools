namespace TFTools.API.Models
{
    public class Composition
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;           // e.g. "Dark Star Jhin"
        public string Tier { get; set; } = string.Empty;           // "S", "A", "B", "C", "D", or "X"
        public string Description { get; set; } = string.Empty;    // Short summary
        public string PatchVersion { get; set; } = string.Empty;   // e.g. "17.2"
        public bool IsConditional { get; set; }                    // true = situational / X tier
        public string CarryImageUrl { get; set; } = string.Empty;  // Main carry portrait

        // New detail fields
        public string Playstyle { get; set; } = string.Empty;      // e.g. "Fast 9", "Reroll", "Standard"
        public string Difficulty { get; set; } = string.Empty;     // "Easy", "Medium", "Hard"
        public string Tips { get; set; } = string.Empty;           // How-to-play tips
        public string? Augments { get; set; }                       // JSON array of recommended augment names
        public string? ItemPriority { get; set; }                   // JSON array of {name, imageUrl}
        public string? EarlyUnits { get; set; }                     // JSON array of {name, imageUrl}
        public string? Gods { get; set; }                           // JSON array of {name, imageUrl}
        public string? StageGuide { get; set; }                     // JSON array of {stage, description}

        public string? Trend { get; set; }                     // null | "up" | "down" | "new"

        // Live stats (manually curated each patch)
        public double? Top4Rate { get; set; }                       // e.g. 0.58 → "58%"
        public double? WinRate { get; set; }                        // e.g. 0.14 → "14%"
        public double? PlayRate { get; set; }                       // e.g. 0.04 → "4%"
        public double? AvgPlacement { get; set; }                   // e.g. 3.8

        // Champions on the board with their positions and items
        public ICollection<CompositionChampion> CompositionChampions { get; set; } = new List<CompositionChampion>();
    }
}
