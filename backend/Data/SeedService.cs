using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using TFTools.API.Models;

namespace TFTools.API.Data
{
    // Seeds the database from the JSON files in Data/Seeds (exported from the
    // original SQL Server database). Each table is only seeded if it's empty,
    // so this is safe to run on every startup. IDs are preserved from the
    // source so foreign keys line up; identity sequences are re-synced at the
    // end so future inserts (e.g. from the admin panel) don't collide.
    public static class SeedService
    {
        private static readonly JsonSerializerOptions JsonOpts = BuildOptions();

        private static JsonSerializerOptions BuildOptions()
        {
            var o = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            // Postgres "timestamp with time zone" rejects DateTimes with an
            // Unspecified kind, so force every parsed DateTime to UTC.
            o.Converters.Add(new UtcDateTimeConverter());
            return o;
        }

        public static async Task SeedAllAsync(TFToolsDbContext db, ILogger logger)
        {
            var dir = Path.Combine(AppContext.BaseDirectory, "Data", "Seeds");
            if (!Directory.Exists(dir))
            {
                logger.LogWarning("Seed directory not found at {Dir} — skipping seed.", dir);
                return;
            }

            // ── Insert order respects foreign-key dependencies ──
            await SeedTable<Champion>(db, dir, "Champions.json", logger);
            await SeedTable<Trait>(db, dir, "Traits.json", logger);
            await SeedTable<Item>(db, dir, "Items.json", logger);
            await SeedTable<God>(db, dir, "Gods.json", logger);
            await SeedTable<Augment>(db, dir, "Augments.json", logger);
            await SeedTable<Composition>(db, dir, "Compositions.json", logger);
            await SeedTable<Setting>(db, dir, "Settings.json", logger);
            await SeedTable<ChampionAbility>(db, dir, "ChampionAbilities.json", logger);
            await SeedTable<ChampionStats>(db, dir, "ChampionStats.json", logger);
            await SeedTable<ChampionRecommendedItem>(db, dir, "ChampionRecommendedItems.json", logger);
            await SeedChampionTrait(db, dir, "ChampionTrait.json", logger);
            await SeedTable<TraitBreakpoint>(db, dir, "TraitBreakpoints.json", logger);
            await SeedTable<GodOffering>(db, dir, "GodOfferings.json", logger);
            await SeedTable<CompositionChampion>(db, dir, "CompositionChampions.json", logger);
            await SeedTable<CompositionChampionItem>(db, dir, "CompositionChampionItems.json", logger);
            await SeedTable<TierListSnapshot>(db, dir, "TierListSnapshots.json", logger);
            await SeedTable<CompositionChangeLog>(db, dir, "CompositionChangeLogs.json", logger);

            await ResetSequences(db, logger,
                "Champions", "Traits", "Items", "Gods", "Augments", "Compositions",
                "ChampionAbilities", "ChampionStats", "ChampionRecommendedItems",
                "TraitBreakpoints", "GodOfferings", "CompositionChampions",
                "CompositionChampionItems", "TierListSnapshots", "CompositionChangeLogs");
        }

        private static async Task SeedTable<T>(TFToolsDbContext db, string dir, string file, ILogger logger)
            where T : class
        {
            var set = db.Set<T>();
            if (await set.AnyAsync())
            {
                logger.LogInformation("{Table} already has data — skipping.", typeof(T).Name);
                return;
            }

            var path = Path.Combine(dir, file);
            if (!File.Exists(path))
            {
                logger.LogWarning("Seed file {File} not found — skipping {Table}.", file, typeof(T).Name);
                return;
            }

            List<T> rows;
            try
            {
                var json = await File.ReadAllTextAsync(path);
                rows = JsonSerializer.Deserialize<List<T>>(json, JsonOpts) ?? new();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to parse {File}", file);
                return;
            }

            if (rows.Count == 0) return;

            await set.AddRangeAsync(rows);
            await db.SaveChangesAsync();
            logger.LogInformation("Seeded {Count} rows into {Table}.", rows.Count, typeof(T).Name);
        }

        // The Champion↔Trait many-to-many uses a shadow join table with no
        // entity class, so it's seeded with raw SQL.
        private static async Task SeedChampionTrait(TFToolsDbContext db, string dir, string file, ILogger logger)
        {
            var existing = await db.Database
                .SqlqueryCount("SELECT COUNT(*)::int AS \"Value\" FROM \"ChampionTrait\"");
            if (existing > 0)
            {
                logger.LogInformation("ChampionTrait already has data — skipping.");
                return;
            }

            var path = Path.Combine(dir, file);
            if (!File.Exists(path))
            {
                logger.LogWarning("Seed file {File} not found — skipping ChampionTrait.", file);
                return;
            }

            List<ChampionTraitRow> rows;
            try
            {
                var json = await File.ReadAllTextAsync(path);
                rows = JsonSerializer.Deserialize<List<ChampionTraitRow>>(json, JsonOpts) ?? new();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to parse {File}", file);
                return;
            }

            if (rows.Count == 0) return;

            var values = new List<string>(rows.Count);
            var args = new List<object>(rows.Count * 2);
            int p = 0;
            foreach (var r in rows)
            {
                values.Add($"({{{p}}},{{{p + 1}}})");
                args.Add(r.ChampionsId);
                args.Add(r.TraitsId);
                p += 2;
            }

            var sql = "INSERT INTO \"ChampionTrait\" (\"ChampionsId\",\"TraitsId\") VALUES "
                      + string.Join(",", values);
            await db.Database.ExecuteSqlRawAsync(sql, args.ToArray());
            logger.LogInformation("Seeded {Count} rows into ChampionTrait.", rows.Count);
        }

        // Advance each identity sequence to the current max id so the next
        // generated id doesn't collide with a seeded row.
        private static async Task ResetSequences(TFToolsDbContext db, ILogger logger, params string[] tables)
        {
            foreach (var t in tables)
            {
                var sql =
                    $"SELECT setval(pg_get_serial_sequence('\"{t}\"', 'Id'), m) " +
                    $"FROM (SELECT MAX(\"Id\") AS m FROM \"{t}\") s WHERE m IS NOT NULL;";
                try
                {
                    await db.Database.ExecuteSqlRawAsync(sql);
                }
                catch (Exception ex)
                {
                    logger.LogWarning(ex, "Could not reset identity sequence for {Table}.", t);
                }
            }
        }

        private sealed class ChampionTraitRow
        {
            public int ChampionsId { get; set; }
            public int TraitsId { get; set; }
        }
    }

    // Parses JSON dates as UTC so they're valid for Postgres timestamptz columns.
    internal sealed class UtcDateTimeConverter : JsonConverter<DateTime>
    {
        public override DateTime Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
            => DateTime.SpecifyKind(reader.GetDateTime(), DateTimeKind.Utc);

        public override void Write(Utf8JsonWriter writer, DateTime value, JsonSerializerOptions options)
            => writer.WriteStringValue(value.ToUniversalTime());
    }

    internal static class DatabaseScalarExtensions
    {
        public static async Task<int> SqlqueryCount(this Microsoft.EntityFrameworkCore.Infrastructure.DatabaseFacade db, string sql)
            => await db.SqlQueryRaw<int>(sql).FirstAsync();
    }
}
