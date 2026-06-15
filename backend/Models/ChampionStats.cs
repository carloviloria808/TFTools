namespace TFTools.API.Models
{
    public class ChampionStats
    {
        public int Id { get; set; }

        // Health scales with star level
        public int Health1 { get; set; }
        public int Health2 { get; set; }
        public int Health3 { get; set; }

        public int Armor { get; set; }

        // Attack Damage scales with star level
        public int Damage1 { get; set; }
        public int Damage2 { get; set; }
        public int Damage3 { get; set; }

        public double AttackSpeed { get; set; }

        // DPS scales with star level
        public int DPS1 { get; set; }
        public int DPS2 { get; set; }
        public int DPS3 { get; set; }

        public int StartingMana { get; set; }
        public int TotalMana { get; set; }

        public int MR { get; set; }

        // Range in hexes (e.g. 1 = melee, 4 = long range)
        public int Range { get; set; }

        public int ChampionId { get; set; }
        public Champion Champion { get; set; } = null!;
    }
}
