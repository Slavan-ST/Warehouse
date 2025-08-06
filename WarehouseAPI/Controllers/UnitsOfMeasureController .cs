using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using WarehouseAPI.Services;
using WarehouseAPI.DTO;
using WarehouseAPI.Models.Enums;
using Microsoft.Extensions.Logging;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using WarehouseAPI.Models;
using WarehouseAPI.DTO.Requests;

namespace WarehouseAPI.Controllers
{
    [ApiController]
    [Route("api/units")]
    public class UnitsOfMeasureController : ControllerBase
    {
        private readonly UnitOfMeasureService _unitService;
        private readonly IMapper _mapper;
        private readonly ILogger<UnitsOfMeasureController> _logger;

        public UnitsOfMeasureController(
            UnitOfMeasureService unitService,
            IMapper mapper,
            ILogger<UnitsOfMeasureController> logger)
        {
            _unitService = unitService;
            _mapper = mapper;
            _logger = logger;
        }

        // GET: api/units?includeArchive=true
        [HttpGet]
        public async Task<IActionResult> GetUnits([FromQuery] bool includeArchive = false)
        {
            try
            {
                var query = _unitService.Query();

                var units = await query
                    .Select(u => new UnitOfMeasureDto(u.Id, u.Name, u.Status))
                    .ToListAsync();

                return Ok(units);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении списка единиц измерения");
                return StatusCode(500, "Внутренняя ошибка сервера");
            }
        }

        // GET: api/units/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetUnit(int id)
        {
            if (id <= 0) return BadRequest("Некорректный ID");

            try
            {
                var unit = await _unitService.GetByIdAsync(id);
                if (unit == null)
                    return NotFound("Единица измерения не найдена");

                if (unit.Status == EntityStatus.Archived)
                    return NotFound("Единица измерения архивирована");

                return Ok(unit);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении единицы измерения с ID {Id}", id);
                return StatusCode(500, "Внутренняя ошибка сервера");
            }
        }

        // POST: api/units
        [HttpPost]
        public async Task<IActionResult> CreateUnit([FromBody] CreateUnitOfMeasureRequest request)
        {
            // Проверяем модель
            if (!ModelState.IsValid)
                return BadRequest(new { message = "Некорректные данные", errors = ModelState });

            try
            {
                // Передаем только нужное поле в сервис
                var result = await _unitService.CreateUnitAsync(request.Name);
                if (result.IsSuccess)
                {
                    var dto = _mapper.Map<UnitOfMeasureDto>(result.Value);
                    return CreatedAtAction(nameof(GetUnit), new { id = dto.Id }, dto);
                }
                return BadRequest(new { message = result.Error });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при создании единицы измерения");
                return StatusCode(500, "Внутренняя ошибка сервера");
            }
        }

        // PUT: api/units/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUnit(int id, [FromBody] UnitOfMeasure unit)
        {
            if (id != unit.Id || id <= 0 || !ModelState.IsValid)
                return BadRequest("Некорректные данные");

            try
            {
                var result = await _unitService.UpdateUnitAsync(unit);
                if (result.IsSuccess)
                    return NoContent();

                return BadRequest(new { message = result.Error });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при обновлении единицы измерения с ID {Id}", id);
                return StatusCode(500, "Внутренняя ошибка сервера");
            }
        }

        // DELETE: api/units/5 (архивация)
        [HttpDelete("{id}")]
        public async Task<IActionResult> ArchiveUnit(int id)
        {
            if (id <= 0) return BadRequest("Некорректный ID");

            try
            {
                var result = await _unitService.ArchiveUnitAsync(id);
                if (result.IsSuccess)
                    return NoContent();

                return BadRequest(new { message = result.Error });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при архивации единицы измерения с ID {Id}", id);
                return StatusCode(500, "Внутренняя ошибка сервера");
            }
        }

        // POST: api/units/5/restore
        [HttpPost("{id}/restore")]
        public async Task<IActionResult> RestoreUnit(int id)
        {
            if (id <= 0) return BadRequest("Некорректный ID");

            try
            {
                var result = await _unitService.RestoreUnitAsync(id);
                if (result.IsSuccess)
                    return NoContent();

                return BadRequest(new { message = result.Error });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при восстановлении единицы измерения с ID {Id}", id);
                return StatusCode(500, "Внутренняя ошибка сервера");
            }
        }
    }
}