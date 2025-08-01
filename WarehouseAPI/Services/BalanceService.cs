using WarehouseAPI.Data;
using WarehouseAPI.Models.Enums;
using WarehouseAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace WarehouseAPI.Services
{
    public class BalanceService
    {
        private readonly AppDbContext _context;

        public BalanceService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<Balance>> GetBalancesAsync()
        {
            return await _context.Balances
                .Include(b => b.Resource)
                .Include(b => b.UnitOfMeasure)
                .Where(b => b.Resource.Status == EntityStatus.Active && b.UnitOfMeasure.Status == EntityStatus.Active)
                .ToListAsync();
        }

        public async Task<decimal> GetAvailableQuantityAsync(int resourceId, int unitId)
        {
            var balance = await _context.Balances
                .FirstOrDefaultAsync(b => b.ResourceId == resourceId && b.UnitOfMeasureId == unitId);

            return balance?.Quantity ?? 0;
        }
    }
}
