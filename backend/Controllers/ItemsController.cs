using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TFTools.API.Data;
using TFTools.API.Models;

namespace TFTools.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ItemsController : ControllerBase
    {
        private readonly TFToolsDbContext _context;

        public ItemsController(TFToolsDbContext context)
        {
            _context = context;
        }

        // GET: api/items
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Item>>> GetItems()
        {
            // Include() tells EF Core to also fetch the component items
            // instead of just returning null for Component1 and Component2
            return await _context.Items
                .Include(i => i.Component1)
                .Include(i => i.Component2)
                .ToListAsync();
        }

        // GET: api/items/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Item>> GetItem(int id)
        {
            var item = await _context.Items
                .Include(i => i.Component1)
                .Include(i => i.Component2)
                .FirstOrDefaultAsync(i => i.Id == id);

            if (item == null)
            {
                return NotFound();
            }

            return item;
        }

        // GET: api/items/components
        // Gets only the basic component items (not combined items)
        [HttpGet("components")]
        public async Task<ActionResult<IEnumerable<Item>>> GetComponents()
        {
            return await _context.Items
                .Where(i => i.IsComponent == true)
                .ToListAsync();
        }

        // GET: api/items/combined
        // Gets only the combined items (not basic components)
        [HttpGet("combined")]
        public async Task<ActionResult<IEnumerable<Item>>> GetCombinedItems()
        {
            return await _context.Items
                .Include(i => i.Component1)
                .Include(i => i.Component2)
                .Where(i => i.IsComponent == false)
                .ToListAsync();
        }

        // GET: api/items/tierlist
        // Returns all rated items grouped by tier rating (S, A, B, C, D)
        [HttpGet("tierlist")]
        public async Task<ActionResult<object>> GetTierList()
        {
            var rated = await _context.Items
                .Include(i => i.Component1)
                .Include(i => i.Component2)
                .Where(i => i.TierRating != "" && i.IsComponent == false)
                .OrderBy(i => i.Name)
                .ToListAsync();

            var grouped = new[] { "S", "A", "B", "C", "D" }.ToDictionary(
                r => r,
                r => rated.Where(i => i.TierRating == r).Select(i => new
                {
                    i.Id,
                    i.Name,
                    i.Description,
                    i.ImageUrl,
                    i.TierRating,
                    Component1 = i.Component1 == null ? null : new { i.Component1.Name, i.Component1.ImageUrl },
                    Component2 = i.Component2 == null ? null : new { i.Component2.Name, i.Component2.ImageUrl }
                })
            );

            return Ok(grouped);
        }
    }
}