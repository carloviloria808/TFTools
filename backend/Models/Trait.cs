namespace TFTools.API.Models
{
    public class Trait
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;  // General overview of the trait
        public string ImageUrl { get; set; } = string.Empty;
        public string Color { get; set; } = string.Empty;

        // A trait can have multiple breakpoints (2, 4, 6, 9 etc.)
        public ICollection<TraitBreakpoint> Breakpoints { get; set; } = new List<TraitBreakpoint>();

        // A trait can belong to multiple champions
        public ICollection<Champion> Champions { get; set; } = new List<Champion>();
    }
}