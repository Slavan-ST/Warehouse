// WarehouseAPI/Controllers/UnitsOfMeasureController.cs

using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using global::WarehouseAPI.Models;
using global::WarehouseAPI.Services;
using WarehouseAPI.Models.Enums;
using Microsoft.EntityFrameworkCore;

namespace WarehouseAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UnitsOfMeasureController : ControllerBase
    {
        private readonly UnitOfMeasureService _unitService;

        public UnitsOfMeasureController(UnitOfMeasureService unitService)
        {
            _unitService = unitService;
        }

        // GET: api/units
        [HttpGet]
        public async Task<IActionResult> GetUnits([FromQuery] bool includeArchive = false)
        {
            var query = _unitService.Query(); // Используем базовый Query() из BaseService
            if (!includeArchive)
            {
                query = query.Where(u => u.Status == EntityStatus.Active);
            }

            var units = await query.ToListAsync();
            return Ok(units);
        }

        // GET: api/units/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetUnit(int id)
        {
            var unit = await _unitService.GetByIdAsync(id);
            if (unit == null || unit.Status == EntityStatus.Archived)
                return NotFound();

            return Ok(unit);
        }

        // POST: api/units
        [HttpPost]
        public async Task<IActionResult> CreateUnit([FromBody] UnitOfMeasure unit)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _unitService.CreateUnitAsync(unit.Name);
            if (result.IsFailure)
                return BadRequest(result.Error);

            return CreatedAtAction(nameof(GetUnit), new { id = result.Value.Id }, result.Value);
        }

        // PUT: api/units/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUnit(int id, [FromBody] UnitOfMeasure unit)
        {
            if (id != unit.Id || !ModelState.IsValid)
                return BadRequest();

            var existing = await _unitService.GetByIdAsync(id);
            if (existing == null || existing.Status == EntityStatus.Archived)
                return NotFound();

            existing.Name = unit.Name;

            var result = await _unitService.UpdateUnitAsync(existing);
            if (result.IsFailure)
                return BadRequest(result.Error);

            return NoContent();
        }

        // DELETE: api/units/5 (архивация)
        [HttpDelete("{id}")]
        public async Task<IActionResult> ArchiveUnit(int id)
        {
            var result = await _unitService.ArchiveUnitAsync(id);
            if (result.IsFailure)
                return NotFound(result.Error);

            return NoContent();
        }

        // POST: api/units/5/restore
        [HttpPost("{id}/restore")]
        public async Task<IActionResult> RestoreUnit(int id)
        {
            var result = await _unitService.RestoreUnitAsync(id);
            if (result.IsFailure)
                return NotFound(result.Error);

            return NoContent();
        }
    }
}