using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using WarehouseAPI.Services;
using WarehouseAPI.DTO;
using Microsoft.Extensions.Logging;
using AutoMapper;
using WarehouseAPI.Models;
using WarehouseAPI.DTO.Requests;

namespace WarehouseAPI.Controllers
{
    [ApiController]
    [Route("api/resources")]
    public class ResourcesController : ControllerBase
    {
        private readonly ResourceService _resourceService;
        private readonly IMapper _mapper;
        private readonly ILogger<ResourcesController> _logger;

        public ResourcesController(
            ResourceService resourceService,
            IMapper mapper,
            ILogger<ResourcesController> logger)
        {
            _resourceService = resourceService;
            _mapper = mapper;
            _logger = logger;
        }

        // GET: api/resources?includeArchive=true
        [HttpGet]
        public async Task<IActionResult> GetResources([FromQuery] bool includeArchive = false)
        {
            try
            {
                var resources = includeArchive
                    ? await _resourceService.GetAllAsync()
                    : await _resourceService.GetActiveResourcesAsync();

                return Ok(resources);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении ресурсов");
                return StatusCode(500, "Внутренняя ошибка сервера");
            }
        }

        // GET: api/resources/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetResource(int id)
        {
            if (id <= 0) return BadRequest("Некорректный ID");

            try
            {
                var resource = await _resourceService.GetByIdAsync(id);
                if (resource == null)
                    return NotFound("Ресурс не найден или архивирован");

                return Ok(resource);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении ресурса с ID {Id}", id);
                return StatusCode(500, "Внутренняя ошибка сервера");
            }
        }

        // POST: api/resources
        [HttpPost]
        [HttpPost]
        public async Task<IActionResult> CreateResource([FromBody] CreateResourceRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { message = "Некорректные данные", errors = ModelState });
            }

            var result = await _resourceService.CreateResourceAsync(request);
            if (result.IsSuccess)
            {
                return Ok(result.Value);
            }

            return BadRequest(new { message = result.Error });
        }

        // PUT: api/resources/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateResource(int id, [FromBody] Resource resource)
        {
            if (id != resource.Id || id <= 0 || !ModelState.IsValid)
                return BadRequest("Некорректные данные");

            try
            {
                var result = await _resourceService.UpdateResourceAsync(resource);
                if (result.IsSuccess)
                    return NoContent();

                return BadRequest(new { message = result.Error });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при обновлении ресурса с ID {Id}", id);
                return StatusCode(500, "Внутренняя ошибка сервера");
            }
        }

        // DELETE: api/resources/5 (архивация)
        [HttpDelete("{id}")]
        public async Task<IActionResult> ArchiveResource(int id)
        {
            if (id <= 0) return BadRequest("Некорректный ID");

            try
            {
                var result = await _resourceService.ArchiveResourceAsync(id);
                if (result.IsSuccess)
                    return NoContent();

                return NotFound(new { message = result.Error });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при архивации ресурса с ID {Id}", id);
                return StatusCode(500, "Внутренняя ошибка сервера");
            }
        }

        // POST: api/resources/5/restore
        [HttpPost("{id}/restore")]
        public async Task<IActionResult> RestoreResource(int id)
        {
            if (id <= 0) return BadRequest("Некорректный ID");

            try
            {
                var result = await _resourceService.RestoreResourceAsync(id);
                if (result.IsSuccess)
                    return NoContent();

                return NotFound(new { message = result.Error });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при восстановлении ресурса с ID {Id}", id);
                return StatusCode(500, "Внутренняя ошибка сервера");
            }
        }

        // GET: api/resources/active
        [HttpGet("active")]
        public async Task<IActionResult> GetActiveResources()
        {
            try
            {
                var resources = await _resourceService.GetActiveResourcesAsync();
                return Ok(resources);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении активных ресурсов");
                return StatusCode(500, "Внутренняя ошибка сервера");
            }
        }

        // GET: api/resources/archive
        [HttpGet("archive")]
        public async Task<IActionResult> GetArchivedResources()
        {
            try
            {
                var resources = await _resourceService.GetArchivedResourcesAsync();
                return Ok(resources);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении архивированных ресурсов");
                return StatusCode(500, "Внутренняя ошибка сервера");
            }
        }
    }
}