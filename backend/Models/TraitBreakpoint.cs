namespace TFTools.API.Models
{
    public class TraitBreakpoint
    {
        public int Id { get; set; }
        public int UnitsRequired { get; set; }    // e.g. 2, 4, 6, 9
        public string Bonus { get; set; } = string.Empty;  // e.g. "Dark Stars create a black hole that consumes enemies at 8% max health"

        // This links the breakpoint back to its parent Trait
        // Every breakpoint belongs to one Trait
        public int TraitId { get; set; }
        public Trait Trait { get; set; } = null!;
    }
}