using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using WarehouseAPI.Services;
using WarehouseAPI.DTO;
using WarehouseAPI.DTO.Requests;
using Microsoft.Extensions.Logging;
using AutoMapper;

namespace WarehouseAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ShipmentsController : ControllerBase
    {
        private readonly ShipmentDocumentService _shipmentService;
        private readonly IMapper _mapper;
        private readonly ILogger<ShipmentsController> _logger;

        public ShipmentsController(
            ShipmentDocumentService shipmentService,
            IMapper mapper,
            ILogger<ShipmentsController> logger)
        {
            _shipmentService = shipmentService;
            _mapper = mapper;
            _logger = logger;
        }

        // GET: api/shipments?fromDate=2025-01-01&toDate=2025-01-31&documentNumbers=RC001,RC002&resourceIds=1&unitIds=2
        [HttpGet]
        public async Task<IActionResult> GetShipments(
            [FromQuery] DateTime? fromDate,
            [FromQuery] DateTime? toDate,
            [FromQuery] string[] documentNumbers,
            [FromQuery] int[] resourceIds,
            [FromQuery] int[] unitIds)
        {
            try
            {
                var shipments = await _shipmentService.GetShipmentsWithResourcesAsync();

                if (fromDate.HasValue)
                    shipments = shipments.Where(s => s.Date >= fromDate.Value).ToList();

                if (toDate.HasValue)
                    shipments = shipments.Where(s => s.Date <= toDate.Value).ToList();

                if (documentNumbers?.Length > 0)
                    shipments = shipments.Where(s => documentNumbers.Contains(s.Number)).ToList();

                if (resourceIds?.Length > 0 || unitIds?.Length > 0)
                {
                    shipments = shipments.Where(s => s.ShipmentResources.Any(sr =>
                        (resourceIds == null || resourceIds.Contains(sr.ResourceId)) &&
                        (unitIds == null || unitIds.Contains(sr.UnitOfMeasureId))
                    )).ToList();
                }

                var dtos = _mapper.Map<List<ShipmentDocumentDto>>(shipments);
                return Ok(dtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении документов отгрузки");
                return StatusCode(500, "Внутренняя ошибка сервера");
            }
        }

        // GET: api/shipments/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetShipment(int id)
        {
            if (id <= 0) return BadRequest("Некорректный ID");

            try
            {
                var result = await _shipmentService.GetShipmentByIdAsync(id);
                if (result.IsFailure)
                    return NotFound(new { message = result.Error });

                var dto = _mapper.Map<ShipmentDocumentDto>(result.Value);
                return Ok(dto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении документа отгрузки с ID {Id}", id);
                return StatusCode(500, "Внутренняя ошибка сервера");
            }
        }

        // POST: api/shipments
        [HttpPost]
        public async Task<IActionResult> CreateShipment([FromBody] CreateShipmentDocumentRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var result = await _shipmentService.CreateShipmentWithResourcesAsync(
                    request.Number,
                    request.ClientId,
                    request.Date,
                    request.Resources
                );

                if (result.IsSuccess)
                {
                    var dto = _mapper.Map<ShipmentDocumentDto>(result.Value);
                    return CreatedAtAction(nameof(GetShipment), new { id = dto.Id }, dto);
                }

                return BadRequest(new { message = result.Error });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при создании документа отгрузки");
                return StatusCode(500, new { message = "Произошла ошибка при сохранении документа отгрузки." });
            }
        }

        // POST: api/shipments/5/sign
        [HttpPost("{id}/sign")]
        public async Task<IActionResult> SignShipment(int id)
        {
            if (id <= 0) return BadRequest("Некорректный ID");

            try
            {
                var result = await _shipmentService.SignShipmentDocumentAsync(id);
                if (result.IsSuccess)
                    return NoContent();

                return BadRequest(new { message = result.Error });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при подписании документа отгрузки с ID {Id}", id);
                return StatusCode(500, "Внутренняя ошибка сервера");
            }
        }

        // POST: api/shipments/5/revoke
        [HttpPost("{id}/revoke")]
        public async Task<IActionResult> RevokeShipment(int id)
        {
            if (id <= 0) return BadRequest("Некорректный ID");

            try
            {
                var result = await _shipmentService.RevokeShipmentDocumentAsync(id);
                if (result.IsSuccess)
                    return NoContent();

                return BadRequest(new { message = result.Error });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при отзыве документа отгрузки с ID {Id}", id);
                return StatusCode(500, "Внутренняя ошибка сервера");
            }
        }

        // DELETE: api/shipments/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteShipment(int id)
        {
            if (id <= 0) return BadRequest("Некорректный ID");

            try
            {
                var result = await _shipmentService.RemoveShipmentDocumentAsync(id);
                if (result.IsSuccess)
                    return NoContent();

                return NotFound(new { message = result.Error });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при удалении документа отгрузки с ID {Id}", id);
                return StatusCode(500, "Внутренняя ошибка сервера");
            }
        }
    }
}