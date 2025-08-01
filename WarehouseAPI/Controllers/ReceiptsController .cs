using Microsoft.AspNetCore.Mvc;
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
    }
}
