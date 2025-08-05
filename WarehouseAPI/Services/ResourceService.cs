using WarehouseAPI.Data;
using WarehouseAPI.Models.Enums;
using WarehouseAPI.Models;
using CSharpFunctionalExtensions;
using Microsoft.EntityFrameworkCore;


namespace WarehouseAPI.Services
{
    public class ResourceService : BaseService<Resource>
    {
        public ResourceService(AppDbContext context, ILogger<ResourceService> logger) : base(context, logger) { }

        public async Task<Result<Resource>> CreateResourceAsync(string name)
        {
            if (string.IsNullOrWhiteSpace(name))
                return Result.Failure<Resource>("Имя ресурса не может быть пустым");

            if (await ExistsAsync(r => r.Name == name && r.Status == EntityStatus.Active))
                return Result.Failure<Resource>("Ресурс с таким названием уже существует");

            var resource = new Resource { Name = name };
            _context.Resources.Add(resource);

            try
            {
                await _context.SaveChangesAsync();
                return Result.Success(resource);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при сохранении нового ресурса с именем '{Name}'", name);
                return Result.Failure<Resource>("Не удалось создать ресурс");
            }
        }

        public async Task<Result> ArchiveResourceAsync(int id)
        {
            var resource = await _context.Resources.FindAsync(id);
            if (resource == null)
                return Result.Failure("Ресурс не найден");

            if (resource.Status == EntityStatus.Archived)
                return Result.Success(); // Идемпотентность: повторная архивация — OK

            var isUsed = await IsUsedInRelationships(id,
                _context.Balances.Where(b => b.ResourceId == id),
                _context.ReceiptResources.Where(rr => rr.ResourceId == id),
                _context.ShipmentResources.Where(sr => sr.ResourceId == id));

            if (isUsed)
                return Result.Failure("Невозможно архивировать ресурс, так как он используется в документах");

            resource.Status = EntityStatus.Archived;

            try
            {
                await _context.SaveChangesAsync();
                return Result.Success();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при архивации ресурса с ID {Id}", id);
                return Result.Failure("Не удалось архивировать ресурс");
            }
        }

        public async Task<List<Resource>> GetActiveResourcesAsync()
        {
            return await _context.Resources
                .Where(r => r.Status == EntityStatus.Active)
                .ToListAsync();
        }

        // Добавим методы из BaseService, если их нет
        // Например: GetByIdAsync, GetAllAsync, UpdateAsync — они должны быть в BaseService<Resource>
    }
}
