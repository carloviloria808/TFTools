namespace TFTools.API.Models
{
    public class Item
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;           // e.g. "Infinity Edge"
        public string Description { get; set; } = string.Empty;    // What the item does
        public string ImageUrl { get; set; } = string.Empty;       // Item icon image
        public bool IsComponent { get; set; }                      // true = basic component, false = combined item

        // If this is a combined item, these store the IDs of the two components that make it
        // They are nullable (int?) because component items don't have recipes
        public int? Component1Id { get; set; }
        public int? Component2Id { get; set; }

        // Navigation properties to get the actual component Item objects
        public Item? Component1 { get; set; }
        public Item? Component2 { get; set; }

        public string TierRating { get; set; } = string.Empty;
    }
}