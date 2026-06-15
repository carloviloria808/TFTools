namespace TFTools.API.Models
{
    public class CompositionChangeLog
    {
        public int Id { get; set; }
        public int? CompositionId { get; set; }                 // null if the comp was deleted
        public string Name { get; set; } = string.Empty;        // snapshot of comp name at change time
        public string? Tier { get; set; }                       // snapshot of tier
        public string ChangeType { get; set; } = string.Empty;  // "added" | "updated" | "removed"
        public string? Note { get; set; }                       // e.g. "Tier B → A"
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}
