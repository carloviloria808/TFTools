namespace TFTools.API.Models
{
    public class CompositionChampion
    {
        public int Id { get; set; }

        // Which composition this belongs to
        public int CompositionId { get; set; }
        public Composition Composition { get; set; } = null!;

        // Which champion is placed
        public int ChampionId { get; set; }
        public Champion Champion { get; set; } = null!;

        // Board position (0-indexed: row 0-3, col 0-6)
        public int Row { get; set; }
        public int Col { get; set; }

        // Whether this champion is the main carry
        public bool IsCarry { get; set; }

        // Star level (1, 2, or 3)
        public int StarLevel { get; set; } = 1;

        // Items equipped on this champion
        public ICollection<CompositionChampionItem> Items { get; set; } = new List<CompositionChampionItem>();
    }
}
