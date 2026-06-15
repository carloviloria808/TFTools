namespace TFTools.API.Models
{
    public class ChampionAbility
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;

        public int ChampionId { get; set; }
        public Champion Champion { get; set; } = null!;
    }
}
