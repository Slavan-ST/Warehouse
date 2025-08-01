using Microsoft.AspNetCore.Mvc;
using WarehouseAPI.Services;

namespace WarehouseAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ShipmentsController : ControllerBase
    {
        private readonly ShipmentDocumentService _shipmentService;
        private readonly ResourceService _resourceService;
        private readonly UnitOfMeasureService _unitService;
        private readonly ClientService _clientService;

        public ShipmentsController(
            ShipmentDocumentService shipmentService,
            ResourceService resourceService,
            UnitOfMeasureService unitService,
            ClientService clientService)
        {
            _shipmentService = shipmentService;
            _resourceService = resourceService;
            _unitService = unitService;
            _clientService = clientService;
        }

        [HttpGet]
        public async Task<IActionResult> GetShipments(
            [FromQuery] DateTime? fromDate,
            [FromQuery] DateTime? toDate,
            [FromQuery] string[] documentNumbers,
            [FromQuery] int[] resourceIds,
            [FromQuery] int[] unitIds)
        {
            var shipments = await _shipmentService.GetShipmentsWithResourcesAsync();

            // Фильтрация по дате
            if (fromDate.HasValue)
            {
                shipments = shipments.Where(s => s.Date >= fromDate.Value).ToList();
            }

            if (toDate.HasValue)
            {
                shipments = shipments.Where(s => s.Date <= toDate.Value).ToList();
            }

            // Фильтрация по номерам документов
            if (documentNumbers != null && documentNumbers.Length > 0)
            {
                shipments = shipments.Where(s => documentNumbers.Contains(s.Number)).ToList();
            }

            // Фильтрация по ресурсам и единицам измерения (в ресурсах документа)
            if (resourceIds != null && resourceIds.Length > 0 || unitIds != null && unitIds.Length > 0)
            {
                shipments = shipments.Where(s =>
                    s.ShipmentResources.Any(sr =>
                        (resourceIds == null || resourceIds.Length == 0 || resourceIds.Contains(sr.ResourceId)) &&
                        (unitIds == null || unitIds.Length == 0 || unitIds.Contains(sr.UnitOfMeasureId))
                    )
                ).ToList();
            }

            return Ok(shipments);
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
            var numbers = await _shipmentService.GetDocumentNumbersAsync();
            return Ok(numbers);
        }

        [HttpGet("clients")]
        public async Task<IActionResult> GetClients()
        {
            var clients = await _clientService.GetActiveClientsAsync();
            return Ok(clients);
        }
    }
}
