using CSharpFunctionalExtensions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using WarehouseAPI.Data;
using WarehouseAPI.Models;
using WarehouseAPI.Models.Enums;
using WarehouseAPI.DTO;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace WarehouseAPI.Services
{
    public class UnitOfMeasureService : BaseService<UnitOfMeasure>
    {

        public UnitOfMeasureService(AppDbContext context, ILogger<UnitOfMeasureService> logger)
            : base(context, logger)
        {

        }

        public async Task<Result<UnitOfMeasure>> CreateUnitAsync(string name)
        {
            if (string.IsNullOrWhiteSpace(name))
                return Result.Failure<UnitOfMeasure>("Название единицы измерения не может быть пустым");

            if (await ExistsAsync(u => u.Name == name && u.Status == EntityStatus.Active))
                return Result.Failure<UnitOfMeasure>("Единица измерения с таким названием уже существует");

            var unit = new UnitOfMeasure { Name = name };
            _context.UnitsOfMeasure.Add(unit);

            try
            {
                await _context.SaveChangesAsync();
                _logger.LogInformation("Создана единица измерения с ID {UnitId}, название: '{Name}'", unit.Id, unit.Name);
                return Result.Success(unit);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при создании единицы измерения с названием '{Name}'", name);
                return Result.Failure<UnitOfMeasure>("Не удалось сохранить единицу измерения");
            }
        }

        public async Task<Result> ArchiveUnitAsync(int id)
        {
            var unit = await _context.UnitsOfMeasure.FindAsync(id);
            if (unit == null)
                return Result.Failure("Единица измерения не найдена");

            if (unit.Status == EntityStatus.Archived)
                return Result.Success();

            var isUsed = await IsUsedInRelationships(id,
                _context.Balances.Where(b => b.UnitOfMeasureId == id),
                _context.ReceiptResources.Where(rr => rr.UnitOfMeasureId == id),
                _context.ShipmentResources.Where(sr => sr.UnitOfMeasureId == id));

            if (isUsed)
                return Result.Failure("Невозможно архивировать единицу измерения, так как она используется в документах");

            unit.Status = EntityStatus.Archived;

            try
            {
                await _context.SaveChangesAsync();
                _logger.LogInformation("Единица измерения с ID {UnitId} архивирована", id);
                return Result.Success();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при архивации единицы измерения с ID {UnitId}", id);
                return Result.Failure("Не удалось архивировать единицу измерения");
            }
        }

        public async Task<Result> RestoreUnitAsync(int id)
        {
            var unit = await _context.UnitsOfMeasure.FindAsync(id);
            if (unit == null)
                return Result.Failure("Единица измерения не найдена");

            if (unit.Status == EntityStatus.Active)
                return Result.Success();

            unit.Status = EntityStatus.Active;

            try
            {
                await _context.SaveChangesAsync();
                _logger.LogInformation("Единица измерения с ID {UnitId} восстановлена", id);
                return Result.Success();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при восстановлении единицы измерения с ID {UnitId}", id);
                return Result.Failure("Не удалось восстановить единицу измерения");
            }
        }

        public async Task<Result> UpdateUnitAsync(UnitOfMeasure unit)
        {
            if (unit == null)
                return Result.Failure("Единица измерения не передана");

            if (string.IsNullOrWhiteSpace(unit.Name))
                return Result.Failure("Название не может быть пустым");

            var existingInDb = await _context.UnitsOfMeasure.FindAsync(unit.Id);
            if (existingInDb == null || existingInDb.Status == EntityStatus.Archived)
                return Result.Failure("Единица измерения не найдена или архивирована");

            var exists = await _context.UnitsOfMeasure
                .AnyAsync(u => u.Name == unit.Name
                            && u.Id != unit.Id
                            && u.Status == EntityStatus.Active);

            if (exists)
                return Result.Failure("Единица измерения с таким названием уже существует");

            existingInDb.Name = unit.Name;

            try
            {
                _context.UnitsOfMeasure.Update(existingInDb);
                await _context.SaveChangesAsync();
                _logger.LogInformation("Единица измерения с ID {UnitId} обновлена", unit.Id);
                return Result.Success();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при обновлении единицы измерения с ID {UnitId}", unit.Id);
                return Result.Failure("Не удалось обновить единицу измерения");
            }
        }

        public async Task<List<UnitOfMeasureDto>> GetActiveUnitsAsync()
        {
            try
            {
                return await _context.UnitsOfMeasure
                    .Where(u => u.Status == EntityStatus.Active)
                    .Select(u => new UnitOfMeasureDto(u.Id, u.Name, u.Status))
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении списка активных единиц измерения");
                return new List<UnitOfMeasureDto>();
            }
        }

        public async Task<UnitOfMeasureDto?> GetByIdAsync(int id)
        {
            try
            {
                return await _context.UnitsOfMeasure
                    .Where(u => u.Id == id)
                    .Select(u => new UnitOfMeasureDto(u.Id, u.Name, u.Status))
                    .FirstOrDefaultAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении единицы измерения с ID {Id}", id);
                return null;
            }
        }


        public async Task<List<UnitOfMeasureDto>> GetArchivedUnitsAsync()
        {
            try
            {
                return await _context.UnitsOfMeasure
                    .Where(u => u.Status == EntityStatus.Archived)
                    .Select(u => new UnitOfMeasureDto(u.Id, u.Name, u.Status))
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении архивированных единиц измерения");
                return new List<UnitOfMeasureDto>();
            }
        }
    }


}