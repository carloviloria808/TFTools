using Microsoft.EntityFrameworkCore;
using TFTools.API.Models;

namespace TFTools.API.Data
{
    public class TFToolsDbContext : DbContext
    {
        public TFToolsDbContext(DbContextOptions<TFToolsDbContext> options) : base(options)
        {
        }

        public DbSet<Champion> Champions { get; set; }
        public DbSet<Trait> Traits { get; set; }
        public DbSet<TraitBreakpoint> TraitBreakpoints { get; set; }
        public DbSet<Item> Items { get; set; }
        public DbSet<Composition> Compositions { get; set; }
        public DbSet<CompositionChampion> CompositionChampions { get; set; }
        public DbSet<CompositionChampionItem> CompositionChampionItems { get; set; }
        public DbSet<God> Gods { get; set; }
        public DbSet<GodOffering> GodOfferings { get; set; }
        public DbSet<Augment> Augments { get; set; }
        public DbSet<ChampionAbility> ChampionAbilities { get; set; }
        public DbSet<ChampionStats> ChampionStats { get; set; }
        public DbSet<ChampionRecommendedItem> ChampionRecommendedItems { get; set; }
        public DbSet<Setting> Settings { get; set; }
        public DbSet<CompositionChangeLog> CompositionChangeLogs { get; set; }
        public DbSet<TierListSnapshot> TierListSnapshots { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Settings table uses Key as primary key
            modelBuilder.Entity<Setting>().HasKey(s => s.Key);

            // Item self-relationships (component recipe)
            modelBuilder.Entity<Item>()
                .HasOne(i => i.Component1)
                .WithMany()
                .HasForeignKey(i => i.Component1Id)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Item>()
                .HasOne(i => i.Component2)
                .WithMany()
                .HasForeignKey(i => i.Component2Id)
                .OnDelete(DeleteBehavior.Restrict);

            // CompositionChampion → Composition
            modelBuilder.Entity<CompositionChampion>()
                .HasOne(cc => cc.Composition)
                .WithMany(c => c.CompositionChampions)
                .HasForeignKey(cc => cc.CompositionId)
                .OnDelete(DeleteBehavior.Cascade);

            // CompositionChampion → Champion
            modelBuilder.Entity<CompositionChampion>()
                .HasOne(cc => cc.Champion)
                .WithMany()
                .HasForeignKey(cc => cc.ChampionId)
                .OnDelete(DeleteBehavior.Restrict);

            // CompositionChampionItem → CompositionChampion
            modelBuilder.Entity<CompositionChampionItem>()
                .HasOne(ci => ci.CompositionChampion)
                .WithMany(cc => cc.Items)
                .HasForeignKey(ci => ci.CompositionChampionId)
                .OnDelete(DeleteBehavior.Cascade);

            // CompositionChampionItem → Item
            modelBuilder.Entity<CompositionChampionItem>()
                .HasOne(ci => ci.Item)
                .WithMany()
                .HasForeignKey(ci => ci.ItemId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
