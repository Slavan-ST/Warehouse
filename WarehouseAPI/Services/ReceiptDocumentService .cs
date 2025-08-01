using CSharpFunctionalExtensions;
using Microsoft.EntityFrameworkCore;
using WarehouseAPI.Data;
using WarehouseAPI.Models;
using WarehouseAPI.Models.Enums;

namespace WarehouseAPI.Services
{
    public class ReceiptDocumentService : BaseService<ReceiptDocument>
    {
        public ReceiptDocumentService(AppDbContext context, ILogger<ReceiptDocumentService> logger) : base(context, logger) { }

        public async Task<Result<ReceiptDocument>> CreateReceiptDocumentAsync(string number, DateTime date)
        {
            if (await ExistsAsync(rd => rd.Number == number))
                return Result.Failure<ReceiptDocument>("Документ с таким номером уже существует");

            var document = new ReceiptDocument { Number = number, Date = date };
            _context.ReceiptDocuments.Add(document);
            await _context.SaveChangesAsync();

            return Result.Success(document);
        }

        public async Task<Result> AddResourceToReceiptAsync(int documentId, int resourceId, int unitId, decimal quantity)
        {
            var resource = await _context.Resources.FindAsync(resourceId);
            var unit = await _context.UnitsOfMeasure.FindAsync(unitId);

            if (resource == null || unit == null || resource.Status == EntityStatus.Archived || unit.Status == EntityStatus.Archived)
                return Result.Failure("Ресурс или единица измерения не найдены или в архиве");

            var receiptResource = new ReceiptResource
            {
                ReceiptDocumentId = documentId,
                ResourceId = resourceId,
                UnitOfMeasureId = unitId,
                Quantity = quantity
            };

            _context.ReceiptResources.Add(receiptResource);
            await _context.SaveChangesAsync();

            await UpdateBalanceAsync(resourceId, unitId, quantity);

            return Result.Success();
        }

        public async Task<Result> RemoveReceiptDocumentAsync(int id)
        {
            var document = await _context.ReceiptDocuments
                .Include(rd => rd.ReceiptResources)
                .FirstOrDefaultAsync(rd => rd.Id == id);

            if (document == null)
                return Result.Failure("Документ не найден");

            // Проверяем, что на складе достаточно ресурсов для отмены поступления
            foreach (var resource in document.ReceiptResources)
            {
                var balance = await _context.Balances
                    .FirstOrDefaultAsync(b => b.ResourceId == resource.ResourceId && b.UnitOfMeasureId == resource.UnitOfMeasureId);

                if (balance == null || balance.Quantity < resource.Quantity)
                    return Result.Failure($"Недостаточно ресурсов {resource.ResourceId} для отмены поступления");
            }

            // Уменьшаем баланс
            foreach (var resource in document.ReceiptResources)
            {
                await UpdateBalanceAsync(resource.ResourceId, resource.UnitOfMeasureId, -resource.Quantity);
            }

            _context.ReceiptResources.RemoveRange(document.ReceiptResources);
            _context.ReceiptDocuments.Remove(document);
            await _context.SaveChangesAsync();

            return Result.Success();
        }

        private async Task UpdateBalanceAsync(int resourceId, int unitId, decimal quantity)
        {
            var balance = await _context.Balances
                .FirstOrDefaultAsync(b => b.ResourceId == resourceId && b.UnitOfMeasureId == unitId);

            if (balance == null)
            {
                balance = new Balance
                {
                    ResourceId = resourceId,
                    UnitOfMeasureId = unitId,
                    Quantity = quantity
                };
                _context.Balances.Add(balance);
            }
            else
            {
                balance.Quantity += quantity;
            }

            await _context.SaveChangesAsync();
        }

        public async Task<List<ReceiptDocument>> GetReceiptsWithResourcesAsync()
        {
            return await _context.ReceiptDocuments
                .Include(rd => rd.ReceiptResources)
                    .ThenInclude(rr => rr.Resource)
                .Include(rd => rd.ReceiptResources)
                    .ThenInclude(rr => rr.UnitOfMeasure)
                .OrderByDescending(rd => rd.Date)
                .ToListAsync();
        }

        public async Task<List<string>> GetDocumentNumbersAsync()
        {
            return await _context.ReceiptDocuments
                .Select(rd => rd.Number)
                .Distinct()
                .ToListAsync();
        }

        
    }
}
