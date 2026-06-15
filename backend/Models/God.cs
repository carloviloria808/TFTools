namespace TFTools.API.Models
{
    public class God
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Specialty { get; set; } = string.Empty;  // e.g. "God of Opulence"
        public string ImageUrl { get; set; } = string.Empty;

        // A god has multiple stage offerings
        public ICollection<GodOffering> Offerings { get; set; } = new List<GodOffering>();
    }
}