using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using WarehouseAPI.Services;
using WarehouseAPI.Models;
using Microsoft.Extensions.Logging;

namespace WarehouseAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReceiptsController : ControllerBase
    {
        private readonly ReceiptDocumentService _receiptService;
        private readonly ILogger<ReceiptsController> _logger;

        public ReceiptsController(
            ReceiptDocumentService receiptService,
            ILogger<ReceiptsController> logger)
        {
            _receiptService = receiptService;
            _logger = logger;
        }

        // GET: api/receipts?fromDate=2025-01-01&toDate=2025-01-31&documentNumbers=RC001,RC002&resourceIds=1&unitIds=2
        [HttpGet]
        public async Task<IActionResult> GetReceipts(
            [FromQuery] DateTime? fromDate,
            [FromQuery] DateTime? toDate,
            [FromQuery] string[] documentNumbers,
            [FromQuery] int[] resourceIds,
            [FromQuery] int[] unitIds)
        {
            try
            {
                var receipts = await _receiptService.GetReceiptsWithResourcesAsync();

                // Фильтрация по дате
                if (fromDate.HasValue)
                    receipts = receipts.Where(r => r.Date >= fromDate.Value).ToList();

                if (toDate.HasValue)
                    receipts = receipts.Where(r => r.Date <= toDate.Value).ToList();

                // Фильтрация по номерам
                if (documentNumbers != null && documentNumbers.Length > 0)
                    receipts = receipts.Where(r => documentNumbers.Contains(r.Number)).ToList();

                // Фильтрация по ресурсам и единицам
                if (resourceIds != null && resourceIds.Length > 0 || unitIds != null && unitIds.Length > 0)
                {
                    receipts = receipts.Where(r =>
                        r.ReceiptResources.Any(rr =>
                            (resourceIds == null || resourceIds.Length == 0 || resourceIds.Contains(rr.ResourceId)) &&
                            (unitIds == null || unitIds.Length == 0 || unitIds.Contains(rr.UnitOfMeasureId))
                        )
                    ).ToList();
                }

                return Ok(receipts);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении документов поступления");
                return StatusCode(500, "Внутренняя ошибка сервера");
            }
        }

        // GET: api/receipts/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetReceipt(int id)
        {
            if (id <= 0) return BadRequest("Некорректный ID");

            try
            {
                var result = await _receiptService.GetReceiptByIdAsync(id);
                if (result.IsSuccess)
                    return Ok(result.Value);

                return NotFound(new { message = result.Error });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении документа поступления с ID {Id}", id);
                return StatusCode(500, "Внутренняя ошибка сервера");
            }
        }

        // POST: api/receipts
        [HttpPost]
        public async Task<IActionResult> CreateReceipt([FromBody] ReceiptDocument receipt)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var result = await _receiptService.CreateReceiptWithResourcesAsync(
                    receipt.Number,
                    receipt.Date,
                    receipt.ReceiptResources?.ToList() ?? new List<ReceiptResource>()
                );

                if (result.IsSuccess)
                {
                    return CreatedAtAction(nameof(GetReceipt), new { id = result.Value.Id }, result.Value);
                }

                return BadRequest(new { message = result.Error });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Неожиданная ошибка при создании документа поступления");
                return StatusCode(500, new { message = "Произошла ошибка при сохранении поступления." });
            }
        }

        // DELETE: api/receipts/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteReceipt(int id)
        {
            if (id <= 0) return BadRequest("Некорректный ID");

            try
            {
                var result = await _receiptService.RemoveReceiptDocumentAsync(id);
                if (result.IsSuccess)
                    return NoContent();

                return NotFound(new { message = result.Error });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при удалении документа поступления с ID {Id}", id);
                return StatusCode(500, "Внутренняя ошибка сервера");
            }
        }
    }
}api