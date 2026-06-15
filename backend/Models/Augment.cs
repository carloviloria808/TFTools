namespace TFTools.API.Models
{
    public class Augment
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;         // e.g. "Boxing Lessons"
        public string Description { get; set; } = string.Empty;  // What the augment does
        public string Tier { get; set; } = string.Empty;         // "Silver", "Gold", or "Prismatic"
        public string ImageUrl { get; set; } = string.Empty;     // The augment icon image
        public string TierRating { get; set; } = string.Empty;  // "S", "A", "B", "C", "D", or "" for unrated
    }
}