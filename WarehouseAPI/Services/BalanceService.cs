using WarehouseAPI.Data;
using WarehouseAPI.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using WarehouseAPI.Models.Enums;

namespace WarehouseAPI.Services
{
    public class BalanceService
    {
        private readonly AppDbContext _context;
        private readonly ILogger<BalanceService> _logger;

        public BalanceService(AppDbContext context, ILogger<BalanceService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<List<Balance>> GetBalancesAsync()
        {
            try
            {
                var balances = await _context.Balances
                    .Include(b => b.Resource)
                    .Include(b => b.UnitOfMeasure)
                    .Where(b => b.Resource.Status == EntityStatus.Active &&
                                b.UnitOfMeasure.Status == EntityStatus.Active)
                    .ToListAsync();

                _logger.LogInformation("Получено {Count} активных остатков", balances.Count);
                return balances;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении остатков");
                throw; // Пусть контроллер решает, как обрабатывать
            }
        }

        public async Task<decimal> GetAvailableQuantityAsync(int resourceId, int unitId)
        {
            try
            {
                if (resourceId <= 0 || unitId <= 0)
                {
                    _logger.LogWarning("Попытка получить количество с некорректными ID: ResourceId={ResourceId}, UnitId={UnitId}",
                        resourceId, unitId);
                    return 0;
                }

                var balance = await _context.Balances
                    .Where(b => b.ResourceId == resourceId && b.UnitOfMeasureId == unitId)
                    .Select(b => new
                    {
                        b.Quantity,
                        ResourceStatus = b.Resource.Status,
                        UnitStatus = b.UnitOfMeasure.Status
                    })
                    .FirstOrDefaultAsync();

                if (balance == null)
                    return 0;

                if (balance.ResourceStatus != EntityStatus.Active ||
                    balance.UnitStatus != EntityStatus.Active)
                {
                    return 0;
                }

                return balance.Quantity;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении количества для ResourceId={ResourceId}, UnitId={UnitId}",
                    resourceId, unitId);
                return 0;
            }
        }
    }
}