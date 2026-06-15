using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TFTools.API.Data;
using TFTools.API.Models;

namespace TFTools.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TraitsController : ControllerBase
    {
        private readonly TFToolsDbContext _context;

        public TraitsController(TFToolsDbContext context)
        {
            _context = context;
        }

        // GET: api/traits
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetTraits()
        {
            var traits = await _context.Traits
                .Include(t => t.Breakpoints)
                .Include(t => t.Champions)
                .ToListAsync();

            var result = traits.Select(t => new
            {
                t.Id,
                t.Name,
                t.Description,
                t.ImageUrl,
                t.Color,
                Breakpoints = t.Breakpoints.Select(bp => new
                {
                    bp.Id,
                    bp.UnitsRequired,
                    bp.Bonus
                }),
                Champions = t.Champions
                    .OrderBy(c => c.Cost)
                    .Select(c => new
                    {
                        c.Id,
                        c.Name,
                        c.ImageUrl,
                        c.Cost
                    })
            });

            return Ok(result);
        }

        // GET: api/traits/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Trait>> GetTrait(int id)
        {
            var trait = await _context.Traits
                .Include(t => t.Breakpoints)  // Also fetch breakpoints for this trait
                .FirstOrDefaultAsync(t => t.Id == id);

            if (trait == null)
            {
                return NotFound();
            }

            return trait;
        }
    }
}