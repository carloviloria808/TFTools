using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TFTools.API.Data;
using TFTools.API.Models;

namespace TFTools.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GodsController : ControllerBase
    {
        private readonly TFToolsDbContext _context;

        public GodsController(TFToolsDbContext context)
        {
            _context = context;
        }

        // GET: api/gods
        [HttpGet]
        public async Task<ActionResult<IEnumerable<God>>> GetGods()
        {
            return await _context.Gods
                .Include(g => g.Offerings)  // Also fetch stage offerings
                .ToListAsync();
        }

        // GET: api/gods/5
        [HttpGet("{id}")]
        public async Task<ActionResult<God>> GetGod(int id)
        {
            var god = await _context.Gods
                .Include(g => g.Offerings)
                .FirstOrDefaultAsync(g => g.Id == id);

            if (god == null)
            {
                return NotFound();
            }

            return god;
        }
    }
}