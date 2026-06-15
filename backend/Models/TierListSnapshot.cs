namespace TFTools.API.Models
{
    public class TierListSnapshot
    {
        public int Id { get; set; }
        public string PatchVersion { get; set; } = string.Empty;  // e.g. "17.4"
        public string Data { get; set; } = string.Empty;          // JSON array of comp snapshots
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
