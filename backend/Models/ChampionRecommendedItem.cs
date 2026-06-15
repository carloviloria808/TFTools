namespace TFTools.API.Models
{
    public class ChampionRecommendedItem
    {
        public int Id { get; set; }
        public int DisplayOrder { get; set; }  // Controls the order items are shown

        public int ChampionId { get; set; }
        public Champion Champion { get; set; } = null!;

        public int ItemId { get; set; }
        public Item Item { get; set; } = null!;
    }
}
