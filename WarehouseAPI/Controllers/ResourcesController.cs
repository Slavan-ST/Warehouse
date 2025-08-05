using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WarehouseAPI.Models.Enums;
using WarehouseAPI.Models;
using WarehouseAPI.Data;

namespace WarehouseAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ResourcesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ResourcesController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/resources?includeArchive=true
        [HttpGet]
        public async Task<IActionResult> GetResources([FromQuery] bool includeArchive = false)
        {
            var query = _context.Resources.AsQueryable();

            if (!includeArchive)
            {
                query = query.Where(r => r.Status == EntityStatus.Active);
            }

            var resources = await query.ToListAsync();
            return Ok(resources);
        }

        // GET: api/resources/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetResource(int id)
        {
            var resource = await _context.Resources.FindAsync(id);
            if (resource == null || resource.Status == EntityStatus.Archived)
                return NotFound();

            return Ok(resource);
        }

        // POST: api/resources
        [HttpPost]
        public async Task<IActionResult> CreateResource([FromBody] Resource resource)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            resource.Status = EntityStatus.Active; // по умолчанию активен
            _context.Resources.Add(resource);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetResource), new { id = resource.Id }, resource);
        }

        // PUT: api/resources/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateResource(int id, [FromBody] Resource resource)
        {
            if (id != resource.Id || !ModelState.IsValid) return BadRequest();

            var existing = await _context.Resources.FindAsync(id);
            if (existing == null || existing.Status == EntityStatus.Archived)
                return NotFound();

            existing.Name = resource.Name;
            // статус не меняем, только имя

            _context.Entry(existing).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/resources/5 (архивация)
        [HttpDelete("{id}")]
        public async Task<IActionResult> ArchiveResource(int id)
        {
            var resource = await _context.Resources.FindAsync(id);
            if (resource == null || resource.Status == EntityStatus.Archived)
                return NotFound();

            resource.Status = EntityStatus.Archived;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/resources/5/restore
        [HttpPost("{id}/restore")]
        public async Task<IActionResult> RestoreResource(int id)
        {
            var resource = await _context.Resources.FindAsync(id);
            if (resource == null || resource.Status == EntityStatus.Active)
                return NotFound();

            resource.Status = EntityStatus.Active;
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
