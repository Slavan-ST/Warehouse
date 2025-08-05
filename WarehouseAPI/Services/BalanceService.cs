using CSharpFunctionalExtensions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using WarehouseAPI.Data;
using WarehouseAPI.Models;
using WarehouseAPI.Models.Enums;
using System.Collections.Generic;
using System.Threading.Tasks;
using WarehouseAPI.DTO;

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

        public async Task<Result<List<BalanceDto>>> GetBalancesAsync()
        {
            try
            {
                var balances = await _context.Balances
                    .Include(b => b.Resource)
                    .Include(b => b.UnitOfMeasure)
                    .Where(b => b.Resource.Status == EntityStatus.Active &&
                                b.UnitOfMeasure.Status == EntityStatus.Active)
                    .Select(b => new BalanceDto(
                        b.Id,
                        b.ResourceId,
                        b.Resource.Name,
                        b.UnitOfMeasureId,
                        b.UnitOfMeasure.Name,
                        b.Quantity
                    ))
                    .ToListAsync();

                _logger.LogInformation("Получено {Count} активных остатков", balances.Count);
                return Result.Success(balances);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении остатков");
                return Result.Failure<List<BalanceDto>>("Не удалось получить остатки");
            }
        }

        public async Task<Result<decimal>> GetAvailableQuantityAsync(int resourceId, int unitId)
        {
            try
            {
                if (resourceId <= 0 || unitId <= 0)
                {
                    _logger.LogWarning("Попытка получить количество с некорректными ID: ResourceId={ResourceId}, UnitId={UnitId}",
                        resourceId, unitId);
                    return Result.Success(0m);
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

                if (balance == null ||
                    balance.ResourceStatus != EntityStatus.Active ||
                    balance.UnitStatus != EntityStatus.Active)
                {
                    return Result.Success(0m);
                }

                return Result.Success(balance.Quantity);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении количества для ResourceId={ResourceId}, UnitId={UnitId}",
                    resourceId, unitId);
                return Result.Failure<decimal>("Ошибка при получении количества");
            }
        }
    }
}