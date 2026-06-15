namespace TFTools.API.Models
{
    public class GodOffering
    {
        public int Id { get; set; }
        public string Stage { get; set; } = string.Empty;     // e.g. "Stage 2", "Stage 4-7 Perk"
        public string Offerings { get; set; } = string.Empty; // e.g. "6 gold, 8 XP, 5 Rerolls"

        // Links back to the parent God
        public int GodId { get; set; }
        public God God { get; set; } = null!;
    }
}