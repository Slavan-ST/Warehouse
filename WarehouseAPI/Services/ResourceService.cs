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
    public class ResourceService : BaseService<Resource>
    {
        private readonly ILogger<ResourceService> _logger;

        public ResourceService(AppDbContext context, ILogger<ResourceService> logger)
            : base(context, logger)
        {
            _logger = logger;
        }

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
                _logger.LogInformation("Создан ресурс с ID {ResourceId}, имя: '{Name}'", resource.Id, resource.Name);
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
                return Result.Success(); // Идемпотентность

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
                _logger.LogInformation("Ресурс с ID {ResourceId} архивирован", id);
                return Result.Success();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при архивации ресурса с ID {ResourceId}", id);
                return Result.Failure("Не удалось архивировать ресурс");
            }
        }

        public async Task<Result> RestoreResourceAsync(int id)
        {
            var resource = await _context.Resources.FindAsync(id);
            if (resource == null)
                return Result.Failure("Ресурс не найден");

            if (resource.Status == EntityStatus.Active)
                return Result.Success(); // Идемпотентность

            resource.Status = EntityStatus.Active;

            try
            {
                await _context.SaveChangesAsync();
                _logger.LogInformation("Ресурс с ID {ResourceId} восстановлен", id);
                return Result.Success();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при восстановлении ресурса с ID {ResourceId}", id);
                return Result.Failure("Не удалось восстановить ресурс");
            }
        }

        public async Task<Result> UpdateResourceAsync(Resource resource)
        {
            if (resource == null)
                return Result.Failure("Ресурс не передан");

            if (string.IsNullOrWhiteSpace(resource.Name))
                return Result.Failure("Имя ресурса не может быть пустым");

            var existingInDb = await _context.Resources.FindAsync(resource.Id);
            if (existingInDb == null || existingInDb.Status == EntityStatus.Archived)
                return Result.Failure("Ресурс не найден или архивирован");

            // Проверка на дубликат имени
            var exists = await _context.Resources
                .AnyAsync(r => r.Name == resource.Name
                           && r.Id != resource.Id
                           && r.Status == EntityStatus.Active);

            if (exists)
                return Result.Failure("Ресурс с таким названием уже существует");

            existingInDb.Name = resource.Name;

            try
            {
                _context.Resources.Update(existingInDb);
                await _context.SaveChangesAsync();
                _logger.LogInformation("Ресурс с ID {ResourceId} обновлён", resource.Id);
                return Result.Success();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при обновлении ресурса с ID {ResourceId}", resource.Id);
                return Result.Failure("Не удалось обновить ресурс");
            }
        }

        public async Task<List<ResourceDto>> GetActiveResourcesAsync()
        {
            try
            {
                return await _context.Resources
                    .Where(r => r.Status == EntityStatus.Active)
                    .Select(r => new ResourceDto(
                        r.Id,
                        r.Name,
                        r.Status
                    ))
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении списка активных ресурсов");
                return new List<ResourceDto>();
            }
        }

        public async Task<ResourceDto?> GetByIdAsync(int id)
        {
            try
            {
                return await _context.Resources
                    .Where(r => r.Id == id && r.Status == EntityStatus.Active)
                    .Select(r => new ResourceDto(
                        r.Id,
                        r.Name,
                        r.Status
                    ))
                    .FirstOrDefaultAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении ресурса с ID {Id}", id);
                return null;
            }
        }

        public async Task<List<ResourceDto>> GetAllAsync()
        {
            try
            {
                return await _context.Resources
                    .Select(r => new ResourceDto(
                        r.Id,
                        r.Name,
                        r.Status
                    ))
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении всех ресурсов");
                return new List<ResourceDto>();
            }
        }
    }
}