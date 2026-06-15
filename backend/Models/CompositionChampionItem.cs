namespace TFTools.API.Models
{
    public class CompositionChampionItem
    {
        public int Id { get; set; }

        // Which CompositionChampion slot this item belongs to
        public int CompositionChampionId { get; set; }
        public CompositionChampion CompositionChampion { get; set; } = null!;

        // Which item it is
        public int ItemId { get; set; }
        public Item Item { get; set; } = null!;

        // Item slot (0, 1, 2)
        public int SlotIndex { get; set; }
    }
}
