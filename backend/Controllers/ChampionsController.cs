using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TFTools.API.Data;
using TFTools.API.Models;

namespace TFTools.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChampionsController : ControllerBase
    {
        private readonly TFToolsDbContext _context;

        public ChampionsController(TFToolsDbContext context)
        {
            _context = context;
        }

        // GET: api/champions
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetChampions()
        {
            var champions = await _context.Champions
                .Include(c => c.Traits)
                .Include(c => c.Ability)
                .Include(c => c.Stats)
                .ToListAsync();

            var result = champions.Select(c => new
            {
                c.Id,
                c.Name,
                c.Cost,
                c.ImageUrl,
                c.Role,
                Traits = c.Traits.Select(t => new
                {
                    t.Id,
                    t.Name,
                    t.Color,
                    t.ImageUrl,
                    t.Description
                }),
                Ability = c.Ability == null ? null : new
                {
                    c.Ability.Name,
                    c.Ability.Description,
                    c.Ability.ImageUrl
                },
                Mana = c.Stats == null ? null : new
                {
                    Starting = c.Stats.StartingMana,
                    Total    = c.Stats.TotalMana
                }
            });

            return Ok(result);
        }

        // GET: api/champions/5
        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetChampion(int id)
        {
            var champion = await _context.Champions
                .Include(c => c.Traits)
                    .ThenInclude(t => t.Champions)
                .Include(c => c.Ability)
                .Include(c => c.Stats)
                .Include(c => c.RecommendedItems)
                    .ThenInclude(ri => ri.Item)
                        .ThenInclude(i => i.Component1)
                .Include(c => c.RecommendedItems)
                    .ThenInclude(ri => ri.Item)
                        .ThenInclude(i => i.Component2)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (champion == null)
            {
                return NotFound();
            }

            var result = new
            {
                champion.Id,
                champion.Name,
                champion.Cost,
                champion.ImageUrl,
                Traits = champion.Traits.Select(t => new
                {
                    t.Id,
                    t.Name,
                    t.Color,
                    t.ImageUrl,
                    t.Description,
                    Champions = t.Champions
                        .OrderBy(c => c.Cost)
                        .Select(c => new
                        {
                            c.Id,
                            c.Name,
                            c.ImageUrl,
                            c.Cost
                        })
                }),
                Ability = champion.Ability == null ? null : new
                {
                    champion.Ability.Name,
                    champion.Ability.Description,
                    champion.Ability.ImageUrl
                },
                Stats = champion.Stats == null ? null : new
                {
                    health1 = champion.Stats.Health1,
                    health2 = champion.Stats.Health2,
                    health3 = champion.Stats.Health3,
                    armor = champion.Stats.Armor,
                    damage1 = champion.Stats.Damage1,
                    damage2 = champion.Stats.Damage2,
                    damage3 = champion.Stats.Damage3,
                    attackSpeed = champion.Stats.AttackSpeed,
                    dps1 = champion.Stats.DPS1,
                    dps2 = champion.Stats.DPS2,
                    dps3 = champion.Stats.DPS3,
                    startingMana = champion.Stats.StartingMana,
                    totalMana = champion.Stats.TotalMana,
                    mr = champion.Stats.MR,
                    range = champion.Stats.Range
                },
                RecommendedItems = champion.RecommendedItems
                    .OrderBy(ri => ri.DisplayOrder)
                    .Select(ri => new
                    {
                        ri.Item.Id,
                        ri.Item.Name,
                        ri.Item.ImageUrl,
                        ri.Item.Description,
                        Component1 = ri.Item.Component1 == null ? null : new
                        {
                            ri.Item.Component1.Id,
                            ri.Item.Component1.Name,
                            ri.Item.Component1.ImageUrl
                        },
                        Component2 = ri.Item.Component2 == null ? null : new
                        {
                            ri.Item.Component2.Id,
                            ri.Item.Component2.Name,
                            ri.Item.Component2.ImageUrl
                        }
                    })
            };

            return Ok(result);
        }

        // GET: api/champions/cost/1
        [HttpGet("cost/{cost}")]
        public async Task<ActionResult<IEnumerable<object>>> GetChampionsByCost(int cost)
        {
            var champions = await _context.Champions
                .Include(c => c.Traits)
                .Where(c => c.Cost == cost)
                .ToListAsync();

            var result = champions.Select(c => new
            {
                c.Id,
                c.Name,
                c.Cost,
                c.ImageUrl,
                Traits = c.Traits.Select(t => new
                {
                    t.Id,
                    t.Name,
                    t.Color,
                    t.ImageUrl,
                    t.Description    
                })
            });

            return Ok(result);
        }
    }
}