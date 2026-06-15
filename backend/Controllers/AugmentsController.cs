using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TFTools.API.Data;
using TFTools.API.Models;

namespace TFTools.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AugmentsController : ControllerBase
    {
        private readonly TFToolsDbContext _context;

        public AugmentsController(TFToolsDbContext context)
        {
            _context = context;
        }

        // GET: api/augments
        // Returns all augments
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Augment>>> GetAugments()
        {
            return await _context.Augments.ToListAsync();
        }

        // GET: api/augments/5
        // Returns one specific augment by ID
        [HttpGet("{id}")]
        public async Task<ActionResult<Augment>> GetAugment(int id)
        {
            var augment = await _context.Augments.FindAsync(id);

            if (augment == null)
            {
                return NotFound();
            }

            return augment;
        }

        // GET: api/augments/tier/Gold
        // Returns all augments of a specific tier e.g. Silver, Gold, Prismatic
        [HttpGet("tier/{tier}")]
        public async Task<ActionResult<IEnumerable<Augment>>> GetAugmentsByTier(string tier)
        {
            return await _context.Augments
                .Where(a => a.Tier == tier)
                .ToListAsync();
        }

        // GET: api/augments/tierlist
        // Returns all rated augments grouped by tier rating (S, A, B, C, D)
        [HttpGet("tierlist")]
        public async Task<ActionResult<object>> GetTierList()
        {
            var rated = await _context.Augments
                .Where(a => a.TierRating != "")
                .OrderBy(a => a.Name)
                .ToListAsync();

            var grouped = new[] { "S", "A", "B", "C", "D" }.ToDictionary(
                r => r,
                r => rated.Where(a => a.TierRating == r).Select(a => new
                {
                    a.Id,
                    a.Name,
                    a.Description,
                    a.Tier,
                    a.ImageUrl,
                    a.TierRating
                })
            );

            return Ok(grouped);
        }
    }
}