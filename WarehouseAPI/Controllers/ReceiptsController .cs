using Microsoft.AspNetCore.Mvc;
using WarehouseAPI.Models.Enums;
using WarehouseAPI.Models;
using WarehouseAPI.Services;

namespace WarehouseAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReceiptsController : ControllerBase
    {
        private readonly ReceiptDocumentService _receiptService;
        private readonly ResourceService _resourceService;
        private readonly UnitOfMeasureService _unitService;

        public ReceiptsController(
            ReceiptDocumentService receiptService,
            ResourceService resourceService,
            UnitOfMeasureService unitService)
        {
            _receiptService = receiptService;
            _resourceService = resourceService;
            _unitService = unitService;
        }

        [HttpGet]
        public async Task<IActionResult> GetReceipts(
            [FromQuery] DateTime? fromDate,
            [FromQuery] DateTime? toDate,
            [FromQuery] string[] documentNumbers,
            [FromQuery] int[] resourceIds,
            [FromQuery] int[] unitIds)
        {
            var receipts = await _receiptService.GetReceiptsWithResourcesAsync();

            // Фильтрация по дате
            if (fromDate.HasValue)
            {
                receipts = receipts.Where(r => r.Date >= fromDate.Value).ToList();
            }

            if (toDate.HasValue)
            {
                receipts = receipts.Where(r => r.Date <= toDate.Value).ToList();
            }

            // Фильтрация по номерам документов
            if (documentNumbers != null && documentNumbers.Length > 0)
            {
                receipts = receipts.Where(r => documentNumbers.Contains(r.Number)).ToList();
            }

            // Фильтрация по ресурсам и единицам измерения (в ресурсах документа)
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

        [HttpGet("resources")]
        public async Task<IActionResult> GetResources()
        {
            var resources = await _resourceService.GetActiveResourcesAsync();
            return Ok(resources);
        }

        [HttpGet("units")]
        public async Task<IActionResult> GetUnits()
        {
            var units = await _unitService.GetActiveUnitsAsync();
            return Ok(units);
        }

        [HttpGet("document-numbers")]
        public async Task<IActionResult> GetDocumentNumbers()
        {
            var numbers = await _receiptService.GetDocumentNumbersAsync();
            return Ok(numbers);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetReceipt(int id)
        {
            var result = await _receiptService.GetReceiptByIdAsync(id);

            if (result.IsSuccess)
                return Ok(result.Value);

            return NotFound(new { message = result.Error });
        }

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
                else
                {
                    return BadRequest(new { message = result.Error });
                }
            }
            catch (Exception ex)
            {
                // На случай неожиданных ошибок (например, DB)
                return StatusCode(500, new { message = "Произошла ошибка при сохранении поступления." });
            }
        }
    }
}
