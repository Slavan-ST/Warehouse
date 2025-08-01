using CSharpFunctionalExtensions;
using Microsoft.EntityFrameworkCore;
using WarehouseAPI.Data;
using WarehouseAPI.Models;
using WarehouseAPI.Models.Enums;

namespace WarehouseAPI.Services
{
    public class ShipmentDocumentService : BaseService<ShipmentDocument>
    {
        public ShipmentDocumentService(AppDbContext context, ILogger<ShipmentDocumentService> logger) : base(context, logger) { }

        public async Task<Result<ShipmentDocument>> CreateShipmentDocumentAsync(string number, int clientId, DateTime date)
        {
            if (await ExistsAsync(sd => sd.Number == number))
                return Result.Failure<ShipmentDocument>("Документ с таким номером уже существует");

            var client = await _context.Clients.FindAsync(clientId);
            if (client == null || client.Status == EntityStatus.Archived)
                return Result.Failure<ShipmentDocument>("Клиент не найден или в архиве");

            var document = new ShipmentDocument
            {
                Number = number,
                ClientId = clientId,
                Date = date,
                Status = ShipmentDocumentStatus.Draft
            };

            _context.ShipmentDocuments.Add(document);
            await _context.SaveChangesAsync();

            return Result.Success(document);
        }

        public async Task<Result> AddResourceToShipmentAsync(int documentId, int resourceId, int unitId, decimal quantity)
        {
            var document = await _context.ShipmentDocuments.FindAsync(documentId);
            if (document == null)
                return Result.Failure("Документ не найден");

            if (document.Status != ShipmentDocumentStatus.Draft)
                return Result.Failure("Можно добавлять ресурсы только в черновик документа");

            var resource = await _context.Resources.FindAsync(resourceId);
            var unit = await _context.UnitsOfMeasure.FindAsync(unitId);

            if (resource == null || unit == null || resource.Status == EntityStatus.Archived || unit.Status == EntityStatus.Archived)
                return Result.Failure("Ресурс или единица измерения не найдены или в архиве");

            var shipmentResource = new ShipmentResource
            {
                ShipmentDocumentId = documentId,
                ResourceId = resourceId,
                UnitOfMeasureId = unitId,
                Quantity = quantity
            };

            _context.ShipmentResources.Add(shipmentResource);
            await _context.SaveChangesAsync();

            return Result.Success();
        }

        public async Task<Result> SignShipmentDocumentAsync(int id)
        {
            var document = await _context.ShipmentDocuments
                .Include(sd => sd.ShipmentResources)
                .FirstOrDefaultAsync(sd => sd.Id == id);

            if (document == null)
                return Result.Failure("Документ не найден");

            if (document.Status != ShipmentDocumentStatus.Draft)
                return Result.Failure("Можно подписывать только черновики документов");

            if (!document.ShipmentResources.Any())
                return Result.Failure("Документ отгрузки не может быть пустым");

            // Проверяем наличие ресурсов на складе
            foreach (var resource in document.ShipmentResources)
            {
                var balance = await _context.Balances
                    .FirstOrDefaultAsync(b => b.ResourceId == resource.ResourceId && b.UnitOfMeasureId == resource.UnitOfMeasureId);

                if (balance == null || balance.Quantity < resource.Quantity)
                    return Result.Failure($"Недостаточно ресурсов {resource.ResourceId} для отгрузки");
            }

            // Уменьшаем баланс
            foreach (var resource in document.ShipmentResources)
            {
                var balance = await _context.Balances
                    .FirstAsync(b => b.ResourceId == resource.ResourceId && b.UnitOfMeasureId == resource.UnitOfMeasureId);

                balance.Quantity -= resource.Quantity;
            }

            document.Status = ShipmentDocumentStatus.Signed;
            await _context.SaveChangesAsync();

            return Result.Success();
        }

        public async Task<Result> RevokeShipmentDocumentAsync(int id)
        {
            var document = await _context.ShipmentDocuments
                .Include(sd => sd.ShipmentResources)
                .FirstOrDefaultAsync(sd => sd.Id == id);

            if (document == null)
                return Result.Failure("Документ не найден");

            if (document.Status != ShipmentDocumentStatus.Signed)
                return Result.Failure("Можно отзывать только подписанные документы");

            // Возвращаем ресурсы на склад
            foreach (var resource in document.ShipmentResources)
            {
                var balance = await _context.Balances
                    .FirstOrDefaultAsync(b => b.ResourceId == resource.ResourceId && b.UnitOfMeasureId == resource.UnitOfMeasureId);

                if (balance == null)
                {
                    balance = new Balance
                    {
                        ResourceId = resource.ResourceId,
                        UnitOfMeasureId = resource.UnitOfMeasureId,
                        Quantity = resource.Quantity
                    };
                    _context.Balances.Add(balance);
                }
                else
                {
                    balance.Quantity += resource.Quantity;
                }
            }

            document.Status = ShipmentDocumentStatus.Revoked;
            await _context.SaveChangesAsync();

            return Result.Success();
        }

        public async Task<Result> RemoveShipmentDocumentAsync(int id)
        {
            var document = await _context.ShipmentDocuments
                .Include(sd => sd.ShipmentResources)
                .FirstOrDefaultAsync(sd => sd.Id == id);

            if (document == null)
                return Result.Failure("Документ не найден");

            if (document.Status != ShipmentDocumentStatus.Draft)
                return Result.Failure("Можно удалять только черновики документов");

            _context.ShipmentResources.RemoveRange(document.ShipmentResources);
            _context.ShipmentDocuments.Remove(document);
            await _context.SaveChangesAsync();

            return Result.Success();
        }
    }
}
