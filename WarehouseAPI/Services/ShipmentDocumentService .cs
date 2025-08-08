using CSharpFunctionalExtensions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using WarehouseAPI.Data;
using WarehouseAPI.Models;
using WarehouseAPI.Models.Enums;
using System.Collections.Generic;
using System.Threading.Tasks;
using WarehouseAPI.DTO.Requests;

namespace WarehouseAPI.Services
{
    public class ShipmentDocumentService : BaseService<ShipmentDocument>
    {

        public ShipmentDocumentService(AppDbContext context, ILogger<ShipmentDocumentService> logger)
            : base(context, logger)
        {

        }

        public async Task<Result<ShipmentDocument>> CreateShipmentWithResourcesAsync(
            string number,
            int clientId,
            DateTime date,
            List<CreateShipmentResourceRequest> resources)
        {
            if (string.IsNullOrWhiteSpace(number))
                return Result.Failure<ShipmentDocument>("Номер документа не может быть пустым");

            if (date == default)
                return Result.Failure<ShipmentDocument>("Дата не может быть пустой");

            if (await ExistsAsync(sd => sd.Number == number))
                return Result.Failure<ShipmentDocument>("Документ с таким номером уже существует");

            var client = await _context.Clients.FindAsync(clientId);
            if (client?.Status != EntityStatus.Active)
                return Result.Failure<ShipmentDocument>("Клиент не найден или архивирован");

            if (resources == null || !resources.Any())
                return Result.Failure<ShipmentDocument>("Документ отгрузки должен содержать хотя бы один ресурс");

            foreach (var sr in resources)
            {
                if (sr.Quantity <= 0)
                    return Result.Failure<ShipmentDocument>($"Количество для ресурса {sr.ResourceId} должно быть больше 0");

                var resource = await _context.Resources.FindAsync(sr.ResourceId);
                var unit = await _context.UnitsOfMeasure.FindAsync(sr.UnitOfMeasureId);

                if (resource?.Status != EntityStatus.Active)
                    return Result.Failure<ShipmentDocument>($"Ресурс с ID {sr.ResourceId} не найден или архивирован");

                if (unit?.Status != EntityStatus.Active)
                    return Result.Failure<ShipmentDocument>($"Единица измерения с ID {sr.UnitOfMeasureId} не найдена или архивирована");
            }

            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var document = new ShipmentDocument
                {
                    Number = number,
                    ClientId = clientId,
                    Date = date,
                    Status = ShipmentDocumentStatus.Draft
                };

                _context.ShipmentDocuments.Add(document);
                await _context.SaveChangesAsync();

                document.ShipmentResources = resources.Select(sr => new ShipmentResource
                {
                    ShipmentDocumentId = document.Id,
                    ResourceId = sr.ResourceId,
                    UnitOfMeasureId = sr.UnitOfMeasureId,
                    Quantity = sr.Quantity
                }).ToList();

                await _context.SaveChangesAsync();

                await transaction.CommitAsync();

                _logger.LogInformation("Создан документ отгрузки ID {DocumentId}, номер '{Number}'", document.Id, number);
                return Result.Success(document);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Ошибка при создании документа отгрузки с номером '{Number}'", number);
                return Result.Failure<ShipmentDocument>("Не удалось создать документ отгрузки");
            }
        }

        public async Task<Result> SignShipmentDocumentAsync(int id)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var document = await _context.ShipmentDocuments
                    .Include(sd => sd.ShipmentResources)
                        .ThenInclude(sr => sr.Resource)
                    .Include(sd => sd.ShipmentResources)
                        .ThenInclude(sr => sr.UnitOfMeasure)
                    .FirstOrDefaultAsync(sd => sd.Id == id);

                if (document == null)
                    return Result.Failure("Документ не найден");

                if (document.Status != ShipmentDocumentStatus.Draft)
                    return Result.Failure("Можно подписывать только черновики");

                if (!document.ShipmentResources.Any())
                    return Result.Failure("Документ отгрузки не может быть пустым");

                foreach (var sr in document.ShipmentResources)
                {
                    var balance = await _context.Balances
                        .FirstOrDefaultAsync(b => b.ResourceId == sr.ResourceId && b.UnitOfMeasureId == sr.UnitOfMeasureId);

                    if (balance == null || balance.Quantity < sr.Quantity)
                        return Result.Failure($"Недостаточно ресурсов {sr.ResourceId} для отгрузки");
                }

                foreach (var sr in document.ShipmentResources)
                {
                    var balance = await _context.Balances
                        .FirstAsync(b => b.ResourceId == sr.ResourceId && b.UnitOfMeasureId == sr.UnitOfMeasureId);
                    balance.Quantity -= sr.Quantity;
                }

                document.Status = ShipmentDocumentStatus.Signed;
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                _logger.LogInformation("Документ отгрузки с ID {DocumentId} подписан", id);
                return Result.Success();
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Ошибка при подписании документа отгрузки с ID {DocumentId}", id);
                return Result.Failure("Не удалось подписать документ отгрузки");
            }
        }

        public async Task<Result> RevokeShipmentDocumentAsync(int id)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var document = await _context.ShipmentDocuments
                    .Include(sd => sd.ShipmentResources)
                        .ThenInclude(sr => sr.Resource)
                    .Include(sd => sd.ShipmentResources)
                        .ThenInclude(sr => sr.UnitOfMeasure)
                    .FirstOrDefaultAsync(sd => sd.Id == id);

                if (document == null)
                    return Result.Failure("Документ не найден");

                if (document.Status != ShipmentDocumentStatus.Signed)
                    return Result.Failure("Можно отзывать только подписанные документы");

                foreach (var sr in document.ShipmentResources)
                {
                    var balance = await _context.Balances
                        .FirstOrDefaultAsync(b => b.ResourceId == sr.ResourceId && b.UnitOfMeasureId == sr.UnitOfMeasureId);

                    if (balance == null)
                    {
                        balance = new Balance
                        {
                            ResourceId = sr.ResourceId,
                            UnitOfMeasureId = sr.UnitOfMeasureId,
                            Quantity = sr.Quantity
                        };
                        _context.Balances.Add(balance);
                    }
                    else
                    {
                        balance.Quantity += sr.Quantity;
                    }
                }

                document.Status = ShipmentDocumentStatus.Revoked;
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                _logger.LogInformation("Документ отгрузки с ID {DocumentId} отозван", id);
                return Result.Success();
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Ошибка при отзыве документа отгрузки с ID {DocumentId}", id);
                return Result.Failure("Не удалось отозвать документ отгрузки");
            }
        }

        public async Task<Result> RemoveShipmentDocumentAsync(int id)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var document = await _context.ShipmentDocuments
                    .Include(sd => sd.ShipmentResources)
                    .FirstOrDefaultAsync(sd => sd.Id == id);

                if (document == null)
                    return Result.Failure("Документ не найден");

                if (document.Status != ShipmentDocumentStatus.Draft)
                    return Result.Failure("Можно удалять только черновики");

                _context.ShipmentResources.RemoveRange(document.ShipmentResources);
                _context.ShipmentDocuments.Remove(document);

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                _logger.LogInformation("Удалён документ отгрузки с ID {DocumentId}", id);
                return Result.Success();
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Ошибка при удалении документа отгрузки с ID {DocumentId}", id);
                return Result.Failure("Не удалось удалить документ отгрузки");
            }
        }

        public async Task<Result<ShipmentDocument>> GetShipmentByIdAsync(int id)
        {
            try
            {
                var shipment = await _context.ShipmentDocuments
                    .Include(sd => sd.Client)
                    .Include(sd => sd.ShipmentResources)
                        .ThenInclude(sr => sr.Resource)
                    .Include(sd => sd.ShipmentResources)
                        .ThenInclude(sr => sr.UnitOfMeasure)
                    .FirstOrDefaultAsync(sd => sd.Id == id);

                if (shipment == null)
                    return Result.Failure<ShipmentDocument>($"Документ отгрузки с ID {id} не найден.");

                return Result.Success(shipment);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении документа отгрузки с ID {Id}", id);
                return Result.Failure<ShipmentDocument>("Не удалось получить документ");
            }
        }

        public async Task<List<ShipmentDocument>> GetShipmentsWithResourcesAsync()
        {
            try
            {
                return await _context.ShipmentDocuments
                    .Include(sd => sd.Client)
                    .Include(sd => sd.ShipmentResources)
                        .ThenInclude(sr => sr.Resource)
                    .Include(sd => sd.ShipmentResources)
                        .ThenInclude(sr => sr.UnitOfMeasure)
                    .OrderByDescending(sd => sd.Date)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении списка документов отгрузки");
                return new List<ShipmentDocument>();
            }
        }

        public async Task<bool> DocumentNumberExistsAsync(string number, int excludeId = 0)
        {
            return await _context.ShipmentDocuments
                .AnyAsync(sd => sd.Number == number && sd.Id != excludeId);
        }

        public async Task<Result> UpdateShipmentDocumentAsync(
    int id,
    string number,
    int clientId,
    DateTime date,
    List<CreateShipmentResourceRequest> resources)
        {
            if (string.IsNullOrWhiteSpace(number))
                return Result.Failure("Номер документа не может быть пустым");

            if (resources == null || !resources.Any())
                return Result.Failure("Документ отгрузки должен содержать хотя бы один ресурс");

            var document = await _context.ShipmentDocuments
                .Include(sd => sd.ShipmentResources)
                .FirstOrDefaultAsync(sd => sd.Id == id);

            if (document == null)
                return Result.Failure("Документ не найден");

            // Проверка клиента
            var client = await _context.Clients.FindAsync(clientId);
            if (client?.Status != EntityStatus.Active)
                return Result.Failure("Клиент не найден или архивирован");

            // Валидация ресурсов и единиц измерения
            foreach (var sr in resources)
            {
                var resource = await _context.Resources.FindAsync(sr.ResourceId);
                var unit = await _context.UnitsOfMeasure.FindAsync(sr.UnitOfMeasureId);

                if (resource?.Status != EntityStatus.Active)
                    return Result.Failure($"Ресурс с ID {sr.ResourceId} не найден или архивирован");

                if (unit?.Status != EntityStatus.Active)
                    return Result.Failure($"Единица измерения с ID {sr.UnitOfMeasureId} не найдена или архивирована");
            }

            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // Обновляем заголовок
                document.Number = number;
                document.ClientId = clientId;
                document.Date = date;

                // Удаляем старые ресурсы
                _context.ShipmentResources.RemoveRange(document.ShipmentResources);
                await _context.SaveChangesAsync();

                // Добавляем новые
                document.ShipmentResources = resources.Select(r => new ShipmentResource
                {
                    ShipmentDocumentId = document.Id,
                    ResourceId = r.ResourceId,
                    UnitOfMeasureId = r.UnitOfMeasureId,
                    Quantity = r.Quantity
                }).ToList();

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                _logger.LogInformation("Документ отгрузки с ID {DocumentId} обновлён", id);
                return Result.Success();
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Ошибка при обновлении документа отгрузки с ID {DocumentId}", id);
                return Result.Failure("Не удалось обновить документ отгрузки");
            }
        }
    }
}