using WarehouseAPI.Data;
using WarehouseAPI.Models.Enums;
using WarehouseAPI.Models;
using CSharpFunctionalExtensions;
using Microsoft.EntityFrameworkCore;

namespace WarehouseAPI.Services
{
    public class UnitOfMeasureService : BaseService<UnitOfMeasure>
    {
        public UnitOfMeasureService(AppDbContext context, ILogger<UnitOfMeasureService> logger) : base(context, logger) { }

        public async Task<Result<UnitOfMeasure>> CreateUnitAsync(string name)
        {
            if (await ExistsAsync(u => u.Name == name && u.Status == EntityStatus.Active))
                return Result.Failure<UnitOfMeasure>("Единица измерения с таким названием уже существует");

            var unit = new UnitOfMeasure { Name = name };
            _context.UnitsOfMeasure.Add(unit);
            await _context.SaveChangesAsync();

            return Result.Success(unit);
        }

        public async Task<Result> ArchiveUnitAsync(int id)
        {
            var unit = await _context.UnitsOfMeasure.FindAsync(id);
            if (unit == null)
                return Result.Failure("Единица измерения не найдена");

            var isUsed = await IsUsedInRelationships(id,
                _context.Balances.Where(b => b.UnitOfMeasureId == id),
                _context.ReceiptResources.Where(rr => rr.UnitOfMeasureId == id),
                _context.ShipmentResources.Where(sr => sr.UnitOfMeasureId == id));

            if (isUsed)
                return Result.Failure("Невозможно удалить единицу измерения, так как она используется в системе");

            unit.Status = EntityStatus.Archived;
            await _context.SaveChangesAsync();

            return Result.Success();
        }

        public async Task<List<UnitOfMeasure>> GetActiveUnitsAsync()
        {
            return await _context.UnitsOfMeasure
                .Where(u => u.Status == EntityStatus.Active)
                .ToListAsync();
        }

        // WarehouseAPI/Services/UnitOfMeasureService.cs

        public async Task<Result> RestoreUnitAsync(int id)
        {
            var unit = await _context.UnitsOfMeasure.FindAsync(id);
            if (unit == null || unit.Status == EntityStatus.Active)
                return Result.Failure("Единица измерения не найдена или уже активна");

            unit.Status = EntityStatus.Active;
            try
            {
                await _context.SaveChangesAsync();
                return Result.Success();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при восстановлении единицы измерения с ID {UnitId}", id);
                return Result.Failure("Ошибка при восстановлении");
            }
        }

        public async Task<UnitOfMeasure?> GetByIdAsync(int id)
        {
            return await _context.UnitsOfMeasure
                .Where(u => u.Id == id)
                .FirstOrDefaultAsync();
        }

        public async Task<Result> UpdateUnitAsync(UnitOfMeasure unit)
        {
            try
            {
                // Проверим, существует ли активная единица с таким именем (кроме текущей)
                var exists = await _context.UnitsOfMeasure
                    .AnyAsync(u => u.Name == unit.Name
                               && u.Id != unit.Id
                               && u.Status == EntityStatus.Active);

                if (exists)
                    return Result.Failure("Единица измерения с таким названием уже существует");

                _context.UnitsOfMeasure.Update(unit);
                await _context.SaveChangesAsync();

                return Result.Success();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при обновлении единицы измерения с ID {UnitId}", unit.Id);
                return Result.Failure("Ошибка при сохранении изменений");
            }
        }
    }
}
