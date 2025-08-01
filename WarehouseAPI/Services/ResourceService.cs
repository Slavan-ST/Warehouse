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
            if (await ExistsAsync(r => r.Name == name && r.Status == EntityStatus.Active))
                return Result.Failure<Resource>("Ресурс с таким названием уже существует");

            var resource = new Resource { Name = name };
            _context.Resources.Add(resource);
            await _context.SaveChangesAsync();

            return Result.Success(resource);
        }

        public async Task<Result> ArchiveResourceAsync(int id)
        {
            var resource = await _context.Resources.FindAsync(id);
            if (resource == null)
                return Result.Failure("Ресурс не найден");

            var isUsed = await IsUsedInRelationships(id,
                _context.Balances.Where(b => b.ResourceId == id),
                _context.ReceiptResources.Where(rr => rr.ResourceId == id),
                _context.ShipmentResources.Where(sr => sr.ResourceId == id));

            if (isUsed)
                return Result.Failure("Невозможно удалить ресурс, так как он используется в системе");

            resource.Status = EntityStatus.Archived;
            await _context.SaveChangesAsync();

            return Result.Success();
        }

        public async Task<List<Resource>> GetActiveResourcesAsync()
        {
            return await _context.Resources
                .Where(r => r.Status == EntityStatus.Active)
                .ToListAsync();
        }
    }
}
