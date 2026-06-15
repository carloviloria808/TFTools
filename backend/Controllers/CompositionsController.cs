using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using TFTools.API.Data;
using TFTools.API.Models;

namespace TFTools.API.Controllers
{
    public class StatsUpdateDto
    {
        public string?  Tier         { get; set; }
        public double?  Top4Rate     { get; set; }
        public double?  WinRate      { get; set; }
        public double?  PlayRate     { get; set; }
        public double?  AvgPlacement { get; set; }
    }

    public class CompUpdateDto
    {
        public string? Name          { get; set; }
        public string? Tier          { get; set; }
        public string? Description   { get; set; }
        public string? Playstyle     { get; set; }
        public string? Difficulty    { get; set; }
        public string? PatchVersion  { get; set; }
        public bool?   IsConditional { get; set; }
        public string? CarryImageUrl { get; set; }
        public string? Tips          { get; set; }
        public string? StageGuide    { get; set; }
        public string? ItemPriority  { get; set; }
        public string? EarlyUnits    { get; set; }
        public string? Gods          { get; set; }
        public string? Augments      { get; set; }
        public string? Trend         { get; set; }
    }

    public class BoardUpdateDto
    {
        public List<BoardChampionDto> Champions { get; set; } = new();
    }

    public class BoardChampionDto
    {
        public int  ChampionId { get; set; }
        public int  Row        { get; set; }
        public int  Col        { get; set; }
        public bool IsCarry    { get; set; }
        public int  StarLevel  { get; set; } = 1;
        public List<BoardItemDto> Items { get; set; } = new();
    }

    public class BoardItemDto
    {
        public int ItemId    { get; set; }
        public int SlotIndex { get; set; }
    }

    [ApiController]
    [Route("api/[controller]")]
    public class CompositionsController : ControllerBase
    {
        private readonly TFToolsDbContext _context;

        public CompositionsController(TFToolsDbContext context)
        {
            _context = context;
        }

        // Records a change-log entry and bumps the "last updated" setting.
        // Does NOT call SaveChanges — the caller saves once at the end.
        private async Task LogChange(int? compId, string name, string? tier, string changeType, string? note, bool dedupUpdated = false)
        {
            if (dedupUpdated && compId != null && note == null)
            {
                var last = await _context.CompositionChangeLogs
                    .Where(l => l.CompositionId == compId)
                    .OrderByDescending(l => l.Timestamp)
                    .FirstOrDefaultAsync();
                if (last != null && last.ChangeType == "updated"
                    && (DateTime.UtcNow - last.Timestamp).TotalHours < 6)
                {
                    // Collapse rapid successive edits into the existing entry
                    last.Timestamp = DateTime.UtcNow;
                }
                else
                {
                    _context.CompositionChangeLogs.Add(new CompositionChangeLog
                    { CompositionId = compId, Name = name, Tier = tier, ChangeType = changeType, Note = note });
                }
            }
            else
            {
                _context.CompositionChangeLogs.Add(new CompositionChangeLog
                { CompositionId = compId, Name = name, Tier = tier, ChangeType = changeType, Note = note });
            }

            var setting = await _context.Settings.FirstOrDefaultAsync(s => s.Key == "TierListLastUpdated");
            if (setting != null) setting.Value = DateTime.UtcNow.ToString("o");
            else _context.Settings.Add(new Setting { Key = "TierListLastUpdated", Value = DateTime.UtcNow.ToString("o") });
        }

        // Auto-archives the current tier list the first time a comp's patch version
        // moves to a new patch. Snapshot is labeled with the OLD patch.
        // Does NOT call SaveChanges — the caller saves once at the end.
        private async Task MaybeSnapshotOnPatchChange(string newPatch)
        {
            // Determine the current patch (setting, or majority vote among comps)
            var majority = await _context.Compositions.AsNoTracking()
                .GroupBy(c => c.PatchVersion)
                .OrderByDescending(g => g.Count())
                .Select(g => g.Key)
                .FirstOrDefaultAsync();

            var setting = await _context.Settings.FirstOrDefaultAsync(s => s.Key == "CurrentPatch");
            var currentPatch = setting?.Value ?? majority;
            if (currentPatch == null) return;

            if (newPatch == currentPatch)
            {
                if (setting == null)
                    _context.Settings.Add(new Setting { Key = "CurrentPatch", Value = currentPatch });
                return;
            }

            // Only snapshot if the board still genuinely reflects the old patch
            // (guards against accidental edits / reverts creating bogus archives)
            if (majority == currentPatch)
            {
                var comps = await _context.Compositions.AsNoTracking()
                    .Select(c => new
                    {
                        c.Id, c.Name, c.Tier, c.Description, c.CarryImageUrl,
                        c.Playstyle, c.Difficulty, c.IsConditional,
                        c.Top4Rate, c.WinRate, c.PlayRate, c.AvgPlacement,
                    })
                    .ToListAsync();
                var json = JsonSerializer.Serialize(comps,
                    new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });

                // Upsert — a re-transition replaces the snapshot with the latest end-state
                var existing = await _context.TierListSnapshots
                    .FirstOrDefaultAsync(s => s.PatchVersion == currentPatch);
                if (existing != null)
                {
                    existing.Data = json;
                    existing.CreatedAt = DateTime.UtcNow;
                }
                else
                {
                    _context.TierListSnapshots.Add(new TierListSnapshot
                    { PatchVersion = currentPatch, Data = json });
                }
            }

            if (setting != null) setting.Value = newPatch;
            else _context.Settings.Add(new Setting { Key = "CurrentPatch", Value = newPatch });
        }

        // GET: api/compositions/archive
        [HttpGet("archive")]
        public async Task<ActionResult<IEnumerable<object>>> GetArchiveList()
        {
            var snaps = await _context.TierListSnapshots
                .OrderByDescending(s => s.CreatedAt)
                .Select(s => new { s.PatchVersion, s.CreatedAt, s.Data })
                .ToListAsync();

            return snaps.Select(s => new
            {
                patchVersion = s.PatchVersion,
                createdAt    = s.CreatedAt,
                compCount    = JsonSerializer.Deserialize<List<JsonElement>>(s.Data)!.Count,
            }).ToList<object>();
        }

        // GET: api/compositions/archive/17.4
        [HttpGet("archive/{patch}")]
        public async Task<ActionResult<object>> GetArchiveSnapshot(string patch)
        {
            var snap = await _context.TierListSnapshots
                .FirstOrDefaultAsync(s => s.PatchVersion == patch);
            if (snap == null) return NotFound();

            return new
            {
                patchVersion = snap.PatchVersion,
                createdAt    = snap.CreatedAt,
                comps        = JsonSerializer.Deserialize<List<JsonElement>>(snap.Data),
            };
        }

        // GET: api/compositions/history
        [HttpGet("history")]
        public async Task<ActionResult<IEnumerable<object>>> GetHistory()
        {
            var logs = await _context.CompositionChangeLogs
                .OrderByDescending(l => l.Timestamp)
                .Take(100)
                .ToListAsync();

            var compIds = logs.Where(l => l.CompositionId != null)
                              .Select(l => l.CompositionId!.Value).Distinct().ToList();
            var comps = await _context.Compositions
                .Where(c => compIds.Contains(c.Id))
                .Select(c => new { c.Id, c.Name, c.Tier, c.CarryImageUrl })
                .ToListAsync();
            var compMap = comps.ToDictionary(c => c.Id);

            return logs.Select(l =>
            {
                var exists = l.CompositionId != null && compMap.ContainsKey(l.CompositionId.Value);
                var cur = exists ? compMap[l.CompositionId!.Value] : null;
                return new
                {
                    l.Id,
                    l.CompositionId,
                    name          = cur?.Name ?? l.Name,
                    tier          = (cur?.Tier ?? l.Tier)?.Trim(),
                    carryImageUrl = cur?.CarryImageUrl,
                    changeType    = l.ChangeType,
                    l.Note,
                    l.Timestamp,
                    stillExists   = exists,
                };
            }).ToList<object>();
        }

        // GET: api/compositions
        // Lightweight list for the tier list page
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetCompositions()
        {
            var comps = await _context.Compositions
                .Include(c => c.CompositionChampions)
                    .ThenInclude(cc => cc.Champion)
                .ToListAsync();

            return comps.Select(c => new
            {
                c.Id,
                c.Name,
                c.Tier,
                c.Description,
                c.PatchVersion,
                c.IsConditional,
                c.CarryImageUrl,
                c.Playstyle,
                c.Difficulty,
                c.Top4Rate,
                c.WinRate,
                c.PlayRate,
                c.AvgPlacement,
                c.Trend,
                champions = c.CompositionChampions.Select(cc => new
                {
                    cc.Champion.Id,
                    cc.Champion.Name,
                    cc.Champion.Cost,
                    cc.Champion.ImageUrl,
                    cc.IsCarry,
                    cc.StarLevel
                })
            }).ToList<object>();
        }

        // GET: api/compositions/5
        // Full detail for the composition detail page
        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetComposition(int id)
        {
            var composition = await _context.Compositions
                .Include(c => c.CompositionChampions)
                    .ThenInclude(cc => cc.Champion)
                        .ThenInclude(ch => ch.Traits)
                            .ThenInclude(t => t.Breakpoints)
                .Include(c => c.CompositionChampions)
                    .ThenInclude(cc => cc.Items)
                        .ThenInclude(ci => ci.Item)
                            .ThenInclude(i => i.Component1)
                .Include(c => c.CompositionChampions)
                    .ThenInclude(cc => cc.Items)
                        .ThenInclude(ci => ci.Item)
                            .ThenInclude(i => i.Component2)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (composition == null)
                return NotFound();

            return new
            {
                composition.Id,
                composition.Name,
                composition.Tier,
                composition.Description,
                composition.Playstyle,
                composition.Difficulty,
                composition.Tips,
                composition.PatchVersion,
                composition.IsConditional,
                composition.CarryImageUrl,
                composition.Top4Rate,
                composition.WinRate,
                composition.PlayRate,
                composition.AvgPlacement,
                composition.Trend,
                augments = string.IsNullOrEmpty(composition.Augments)
                    ? (object)new List<object>()
                    : JsonSerializer.Deserialize<List<JsonElement>>(composition.Augments),
                itemPriority = string.IsNullOrEmpty(composition.ItemPriority)
                    ? (object)new List<object>()
                    : JsonSerializer.Deserialize<List<JsonElement>>(composition.ItemPriority),
                earlyUnits = string.IsNullOrEmpty(composition.EarlyUnits)
                    ? (object)new List<object>()
                    : JsonSerializer.Deserialize<List<JsonElement>>(composition.EarlyUnits),
                gods = string.IsNullOrEmpty(composition.Gods)
                    ? (object)new List<object>()
                    : JsonSerializer.Deserialize<List<JsonElement>>(composition.Gods),
                stageGuide = string.IsNullOrEmpty(composition.StageGuide)
                    ? (object)new List<object>()
                    : JsonSerializer.Deserialize<List<JsonElement>>(composition.StageGuide),
                champions = composition.CompositionChampions.Select(cc => new
                {
                    cc.Id,
                    cc.Row,
                    cc.Col,
                    cc.IsCarry,
                    cc.StarLevel,
                    champion = new
                    {
                        cc.Champion.Id,
                        cc.Champion.Name,
                        cc.Champion.Cost,
                        cc.Champion.ImageUrl,
                        traits = cc.Champion.Traits.Select(t => new
                        {
                            t.Id,
                            t.Name,
                            t.ImageUrl,
                            breakpoints = t.Breakpoints
                                .OrderBy(bp => bp.UnitsRequired)
                                .Select(bp => new { bp.UnitsRequired })
                        })
                    },
                    items = cc.Items.OrderBy(i => i.SlotIndex).Select(ci => new
                    {
                        ci.Item.Id,
                        ci.Item.Name,
                        ci.Item.ImageUrl,
                        ci.Item.Description,
                        component1 = ci.Item.Component1 == null ? null : new
                        {
                            ci.Item.Component1.Id,
                            ci.Item.Component1.Name,
                            ci.Item.Component1.ImageUrl
                        },
                        component2 = ci.Item.Component2 == null ? null : new
                        {
                            ci.Item.Component2.Id,
                            ci.Item.Component2.Name,
                            ci.Item.Component2.ImageUrl
                        }
                    })
                })
            };
        }

        // PATCH: api/compositions/5
        [HttpPatch("{id}")]
        public async Task<IActionResult> UpdateComposition(int id, [FromBody] CompUpdateDto dto)
        {
            var comp = await _context.Compositions.FindAsync(id);
            if (comp == null) return NotFound();

            var oldTier = comp.Tier?.Trim();

            // Archive the outgoing tier list before the first comp moves to a new patch
            if (dto.PatchVersion != null && dto.PatchVersion != comp.PatchVersion)
                await MaybeSnapshotOnPatchChange(dto.PatchVersion);

            if (dto.Name          != null) comp.Name          = dto.Name;
            if (dto.Tier          != null) comp.Tier          = dto.Tier;
            if (dto.Description   != null) comp.Description   = dto.Description;
            if (dto.Playstyle     != null) comp.Playstyle     = dto.Playstyle;
            if (dto.Difficulty    != null) comp.Difficulty    = dto.Difficulty;
            if (dto.PatchVersion  != null) comp.PatchVersion  = dto.PatchVersion;
            if (dto.IsConditional != null) comp.IsConditional = dto.IsConditional.Value;
            if (dto.CarryImageUrl != null) comp.CarryImageUrl = dto.CarryImageUrl;
            if (dto.Tips          != null) comp.Tips          = dto.Tips;
            if (dto.StageGuide    != null) comp.StageGuide    = dto.StageGuide;
            if (dto.ItemPriority  != null) comp.ItemPriority  = dto.ItemPriority;
            if (dto.EarlyUnits    != null) comp.EarlyUnits    = dto.EarlyUnits;
            if (dto.Gods          != null) comp.Gods          = dto.Gods;
            if (dto.Augments      != null) comp.Augments      = dto.Augments;
            if (dto.Trend         != null) comp.Trend         = dto.Trend == "none" ? null : dto.Trend;

            var newTier = comp.Tier?.Trim();
            string? note = (oldTier != newTier) ? $"Tier {oldTier} → {newTier}" : null;
            await LogChange(comp.Id, comp.Name, comp.Tier, "updated", note, dedupUpdated: true);

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // PATCH: api/compositions/5/stats
        [HttpPatch("{id}/stats")]
        public async Task<IActionResult> UpdateStats(int id, [FromBody] StatsUpdateDto dto)
        {
            var comp = await _context.Compositions.FindAsync(id);
            if (comp == null) return NotFound();

            var oldTier = comp.Tier?.Trim();

            if (dto.Tier        != null) comp.Tier         = dto.Tier;
            if (dto.Top4Rate    != null) comp.Top4Rate     = dto.Top4Rate;
            if (dto.WinRate     != null) comp.WinRate      = dto.WinRate;
            if (dto.PlayRate    != null) comp.PlayRate     = dto.PlayRate;
            if (dto.AvgPlacement!= null) comp.AvgPlacement = dto.AvgPlacement;

            // Only log stat edits when the tier actually changed (avoids noise)
            var newTier = comp.Tier?.Trim();
            if (dto.Tier != null && oldTier != newTier)
                await LogChange(comp.Id, comp.Name, comp.Tier, "updated", $"Tier {oldTier} → {newTier}");

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // GET: api/compositions/lastupdated
        [HttpGet("lastupdated")]
        public async Task<ActionResult<string>> GetLastUpdated()
        {
            var setting = await _context.Settings
                .FirstOrDefaultAsync(s => s.Key == "TierListLastUpdated");
            return Ok(setting?.Value ?? DateTime.UtcNow.ToString("o"));
        }

        // GET: api/compositions/tier/S
        [HttpGet("tier/{tier}")]
        public async Task<ActionResult<IEnumerable<object>>> GetCompositionsByTier(string tier)
        {
            var comps = await _context.Compositions
                .Include(c => c.CompositionChampions)
                    .ThenInclude(cc => cc.Champion)
                .Where(c => c.Tier == tier)
                .ToListAsync();

            return comps.Select(c => new
            {
                c.Id,
                c.Name,
                c.Tier,
                c.Description,
                c.PatchVersion,
                c.IsConditional,
                c.CarryImageUrl,
                c.Playstyle,
                c.Difficulty,
                c.Top4Rate,
                c.WinRate,
                c.PlayRate,
                c.AvgPlacement,
                champions = c.CompositionChampions.Select(cc => new
                {
                    cc.Champion.Id,
                    cc.Champion.Name,
                    cc.Champion.Cost,
                    cc.Champion.ImageUrl,
                    cc.IsCarry
                })
            }).ToList<object>();
        }

        // POST: api/compositions
        [HttpPost]
        public async Task<ActionResult<object>> CreateComposition()
        {
            var comp = new Composition
            {
                Name          = "New Composition",
                Tier          = "C",
                PatchVersion  = "17.5",
                Playstyle     = "Standard",
                Difficulty    = "Medium",
                IsConditional = false,
            };
            _context.Compositions.Add(comp);
            await _context.SaveChangesAsync();

            await LogChange(comp.Id, comp.Name, comp.Tier, "added", null);
            await _context.SaveChangesAsync();

            return Ok(new { comp.Id, comp.Name, comp.Tier, comp.PatchVersion, comp.Playstyle, comp.Difficulty, comp.IsConditional });
        }

        // DELETE: api/compositions/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteComposition(int id)
        {
            var comp = await _context.Compositions.FindAsync(id);
            if (comp == null) return NotFound();

            await LogChange(comp.Id, comp.Name, comp.Tier, "removed", null);
            _context.Compositions.Remove(comp);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // PUT: api/compositions/5/board
        // Replaces all champions + items for a composition
        [HttpPut("{id}/board")]
        public async Task<IActionResult> UpdateBoard(int id, [FromBody] BoardUpdateDto dto)
        {
            var comp = await _context.Compositions.FindAsync(id);
            if (comp == null) return NotFound();

            // Remove all existing champions (cascade deletes their items too)
            var existing = await _context.CompositionChampions
                .Where(cc => cc.CompositionId == id)
                .ToListAsync();
            _context.CompositionChampions.RemoveRange(existing);

            // Insert new champions with their items
            foreach (var ch in dto.Champions)
            {
                var cc = new CompositionChampion
                {
                    CompositionId = id,
                    ChampionId    = ch.ChampionId,
                    Row           = ch.Row,
                    Col           = ch.Col,
                    IsCarry       = ch.IsCarry,
                    StarLevel     = ch.StarLevel > 0 ? ch.StarLevel : 1,
                    Items         = ch.Items.Select(item => new CompositionChampionItem
                    {
                        ItemId    = item.ItemId,
                        SlotIndex = item.SlotIndex,
                    }).ToList()
                };
                _context.CompositionChampions.Add(cc);
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
