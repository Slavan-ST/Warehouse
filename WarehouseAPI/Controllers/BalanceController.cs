using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using WarehouseAPI.Services;
using WarehouseAPI.DTO;
using Microsoft.Extensions.Logging;

namespace WarehouseAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BalanceController : ControllerBase
    {
        private readonly BalanceService _balanceService;
        private readonly ILogger<BalanceController> _logger;

        public BalanceController(
            BalanceService balanceService,
            ILogger<BalanceController> logger)
        {
            _balanceService = balanceService;
            _logger = logger;
        }


        [HttpGet("test")]
        public IActionResult Test()
        {
            return Ok(new { Test = "Привет, мир!" });
        }

        // GET: api/balance?resourceIds=1,2&unitIds=3,4
        [HttpGet]
        public async Task<IActionResult> GetBalances(
            [FromQuery] int[] resourceIds,
            [FromQuery] int[] unitIds)
        {
            try
            {
                var result = await _balanceService.GetBalancesAsync();
                if (result.IsFailure)
                    return StatusCode(500, new { message = result.Error });

                var balances = result.Value;

                // Фильтрация по ресурсам
                if (resourceIds != null && resourceIds.Length > 0)
                {
                    _logger.LogInformation("Фильтрация остатков по ResourceIds: [{ResourceIds}]", string.Join(",", resourceIds));
                    balances = balances.Where(b => resourceIds.Contains(b.ResourceId)).ToList();
                }

                // Фильтрация по единицам измерения
                if (unitIds != null && unitIds.Length > 0)
                {
                    _logger.LogInformation("Фильтрация остатков по UnitIds: [{UnitIds}]", string.Join(",", unitIds));
                    balances = balances.Where(b => unitIds.Contains(b.UnitOfMeasureId)).ToList();
                }

                return Ok(balances);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Неизвестная ошибка при получении остатков");
                return StatusCode(500, "Внутренняя ошибка сервера");
            }
        }

        // GET: api/balance/available?resourceId=1&unitId=2
        [HttpGet("available")]
        public async Task<IActionResult> GetAvailableQuantity(
            [FromQuery] int resourceId,
            [FromQuery] int unitId)
        {
            if (resourceId <= 0 || unitId <= 0)
                return BadRequest("ResourceId и UnitId должны быть больше 0");

            try
            {
                var result = await _balanceService.GetAvailableQuantityAsync(resourceId, unitId);
                if (result.IsFailure)
                    return StatusCode(500, new { message = result.Error });

                return Ok(new { resourceId, unitId, availableQuantity = result.Value });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении доступного количества для ResourceId={ResourceId}, UnitId={UnitId}",
                    resourceId, unitId);
                return StatusCode(500, "Внутренняя ошибка сервера");
            }
        }
    }
}