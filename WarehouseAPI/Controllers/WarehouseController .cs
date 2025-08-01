using Microsoft.AspNetCore.Mvc;
using WarehouseAPI.Services;

namespace WarehouseAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class WarehouseController : ControllerBase
    {
        private readonly BalanceService _balanceService;
        private readonly ResourceService _resourceService;
        private readonly UnitOfMeasureService _unitService;

        public WarehouseController(
            BalanceService balanceService,
            ResourceService resourceService,
            UnitOfMeasureService unitService)
        {
            _balanceService = balanceService;
            _resourceService = resourceService;
            _unitService = unitService;
        }

        [HttpGet("balances")]
        public async Task<IActionResult> GetBalances([FromQuery] int[] resourceIds, [FromQuery] int[] unitIds)
        {
            var balances = await _balanceService.GetBalancesAsync();

            // Фильтрация
            if (resourceIds != null && resourceIds.Length > 0)
            {
                balances = balances.Where(b => resourceIds.Contains(b.ResourceId)).ToList();
            }

            if (unitIds != null && unitIds.Length > 0)
            {
                balances = balances.Where(b => unitIds.Contains(b.UnitOfMeasureId)).ToList();
            }

            return Ok(balances);
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
    }
}
