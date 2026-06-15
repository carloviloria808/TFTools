namespace TFTools.API.Models
{
    public class Champion
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int Cost { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;

        // A champion can belong to multiple traits
        // e.g. Jinx is both a Rebel AND a Gunslinger
        public ICollection<Trait> Traits { get; set; } = new List<Trait>();

        public ChampionAbility? Ability { get; set; }
        public ChampionStats? Stats { get; set; }
        public ICollection<ChampionRecommendedItem> RecommendedItems { get; set; } = new List<ChampionRecommendedItem>();
    }
}