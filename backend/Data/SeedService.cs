using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using TFTools.API.Models;

namespace TFTools.API.Data
{
    // ── DTOs for the JSON seed file ───────────────────────────────────────────
    public class CompSeedEntry
    {
        public string Name       { get; set; } = string.Empty;
        public string Playstyle  { get; set; } = string.Empty;
        public string Difficulty { get; set; } = string.Empty;
        public string Tips       { get; set; } = string.Empty;
        public List<ChampSeedEntry> Champions { get; set; } = new();
    }

    public class ChampSeedEntry
    {
        public string       ChampionName { get; set; } = string.Empty;
        public int          Row          { get; set; }
        public int          Col          { get; set; }
        public bool         IsCarry      { get; set; }
        public List<string> Items        { get; set; } = new();
    }

    // ── Service ───────────────────────────────────────────────────────────────
    public static class SeedService
    {
        public static async Task SeedCompositionsAsync(TFToolsDbContext db, ILogger logger)
        {
            // Only seed if the table is completely empty
            if (await db.CompositionChampions.AnyAsync())
            {
                logger.LogInformation("Composition champions already seeded — skipping.");
                return;
            }

            // Load the JSON file from the build output directory
            var jsonPath = Path.Combine(AppContext.BaseDirectory, "Data", "Seeds", "compositions-seed.json");
            if (!File.Exists(jsonPath))
            {
                logger.LogWarning("Seed file not found at {Path} — skipping composition seed.", jsonPath);
                return;
            }

            List<CompSeedEntry> entries;
            try
            {
                var json = await File.ReadAllTextAsync(jsonPath);
                entries = JsonSerializer.Deserialize<List<CompSeedEntry>>(json,
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true })
                    ?? new List<CompSeedEntry>();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to parse compositions-seed.json");
                return;
            }

            // Pre-load lookup tables into memory (avoid N+1 queries)
            var champions = await db.Champions.ToListAsync();
            var items     = await db.Items.ToListAsync();
            var comps     = await db.Compositions.ToListAsync();

            int championsAdded = 0;
            int itemsAdded     = 0;
            int compsSkipped   = 0;

            foreach (var entry in entries)
            {
                // Match composition by name (trim both sides for safety)
                var comp = comps.FirstOrDefault(c =>
                    c.Name.Trim().Equals(entry.Name.Trim(), StringComparison.OrdinalIgnoreCase));

                if (comp == null)
                {
                    logger.LogWarning("Composition '{Name}' not found in DB — skipping.", entry.Name);
                    compsSkipped++;
                    continue;
                }

                // Optionally backfill empty Playstyle / Difficulty / Tips
                bool compDirty = false;
                if (string.IsNullOrWhiteSpace(comp.Playstyle) && !string.IsNullOrWhiteSpace(entry.Playstyle))
                { comp.Playstyle = entry.Playstyle; compDirty = true; }

                if (string.IsNullOrWhiteSpace(comp.Difficulty) && !string.IsNullOrWhiteSpace(entry.Difficulty))
                { comp.Difficulty = entry.Difficulty; compDirty = true; }

                if (string.IsNullOrWhiteSpace(comp.Tips) && !string.IsNullOrWhiteSpace(entry.Tips))
                { comp.Tips = entry.Tips; compDirty = true; }

                if (compDirty)
                    db.Compositions.Update(comp);

                // Insert each champion slot
                foreach (var champEntry in entry.Champions)
                {
                    var champion = champions.FirstOrDefault(c =>
                        c.Name.Trim().Equals(champEntry.ChampionName.Trim(), StringComparison.OrdinalIgnoreCase));

                    if (champion == null)
                    {
                        logger.LogWarning(
                            "  Champion '{ChampName}' not found for comp '{CompName}' — skipping slot.",
                            champEntry.ChampionName, entry.Name);
                        continue;
                    }

                    var cc = new CompositionChampion
                    {
                        CompositionId = comp.Id,
                        ChampionId    = champion.Id,
                        Row           = champEntry.Row,
                        Col           = champEntry.Col,
                        IsCarry       = champEntry.IsCarry,
                    };
                    db.CompositionChampions.Add(cc);
                    await db.SaveChangesAsync(); // persist so cc.Id is available
                    championsAdded++;

                    // Insert items for this slot
                    for (int slot = 0; slot < champEntry.Items.Count; slot++)
                    {
                        var itemName = champEntry.Items[slot];
                        var item = items.FirstOrDefault(i =>
                            i.Name.Trim().Equals(itemName.Trim(), StringComparison.OrdinalIgnoreCase));

                        if (item == null)
                        {
                            logger.LogWarning(
                                "  Item '{ItemName}' not found for {ChampName} in '{CompName}' — skipping.",
                                itemName, champEntry.ChampionName, entry.Name);
                            continue;
                        }

                        db.CompositionChampionItems.Add(new CompositionChampionItem
                        {
                            CompositionChampionId = cc.Id,
                            ItemId                = item.Id,
                            SlotIndex             = slot,
                        });
                        itemsAdded++;
                    }
                }

                await db.SaveChangesAsync();
                logger.LogInformation("  Seeded '{CompName}' ({Count} slots).",
                    comp.Name.Trim(), entry.Champions.Count);
            }

            logger.LogInformation(
                "Composition seed complete: {C} champion slots, {I} items added, {S} comps skipped.",
                championsAdded, itemsAdded, compsSkipped);
        }
    }
}
