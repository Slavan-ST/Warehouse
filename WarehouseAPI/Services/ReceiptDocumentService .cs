using CSharpFunctionalExtensions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using WarehouseAPI.Data;
using WarehouseAPI.Models;
using WarehouseAPI.Models.Enums;

namespace WarehouseAPI.Services
{
    public class ReceiptDocumentService : BaseService<ReceiptDocument>
    {
        private readonly ILogger<ReceiptDocumentService> _logger;

        public ReceiptDocumentService(AppDbContext context, ILogger<ReceiptDocumentService> logger)
            : base(context, logger)
        {
            _logger = logger;
        }

        public async Task<Result<ReceiptDocument>> CreateReceiptWithResourcesAsync(
            string number,
            DateTime date,
            List<ReceiptResource> resources)
        {
            if (string.IsNullOrWhiteSpace(number))
                return Result.Failure<ReceiptDocument>("Номер документа не может быть пустым");

            if (date == default)
                return Result.Failure<ReceiptDocument>("Дата не может быть пустой");

            if (resources == null || !resources.Any())
                return Result.Failure<ReceiptDocument>("Документ должен содержать хотя бы один ресурс");

            // Проверка уникальности номера
            if (await ExistsAsync(rd => rd.Number == number))
                return Result.Failure<ReceiptDocument>("Документ с таким номером уже существует");

            // Проверка ресурсов и единиц измерения
            foreach (var rr in resources)
            {
                if (rr.Quantity <= 0)
                    return Result.Failure<ReceiptDocument>($"Количество для ресурса {rr.ResourceId} должно быть больше 0");

                var resource = await _context.Resources.FindAsync(rr.ResourceId);
                var unit = await _context.UnitsOfMeasure.FindAsync(rr.UnitOfMeasureId);

                if (resource?.Status != EntityStatus.Active)
                    return Result.Failure<ReceiptDocument>($"Ресурс с ID {rr.ResourceId} не найден или архивирован");

                if (unit?.Status != EntityStatus.Active)
                    return Result.Failure<ReceiptDocument>($"Единица измерения с ID {rr.UnitOfMeasureId} не найдена или архивирована");
            }

            // Используем транзакцию
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // Создаём документ
                var document = new ReceiptDocument
                {
                    Number = number,
                    Date = date,
                    ReceiptResources = new List<ReceiptResource>()
                };

                _context.ReceiptDocuments.Add(document);
                await _context.SaveChangesAsync(); // чтобы получить ID

                // Добавляем ресурсы
                document.ReceiptResources = resources.Select(rr => new ReceiptResource
                {
                    ReceiptDocumentId = document.Id,
                    ResourceId = rr.ResourceId,
                    UnitOfMeasureId = rr.UnitOfMeasureId,
                    Quantity = rr.Quantity
                }).ToList();

                await _context.SaveChangesAsync();

                // Обновляем баланс
                foreach (var rr in document.ReceiptResources)
                {
                    await UpdateBalanceAsync(rr.ResourceId, rr.UnitOfMeasureId, rr.Quantity);
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                _logger.LogInformation("Создан документ поступления ID {DocumentId}, номер '{Number}'", document.Id, number);
                return Result.Success(document);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Ошибка при создании документа поступления с номером '{Number}'", number);
                return Result.Failure<ReceiptDocument>("Не удалось создать документ поступления");
            }
        }

        public async Task<Result> RemoveReceiptDocumentAsync(int id)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var document = await _context.ReceiptDocuments
                    .Include(rd => rd.ReceiptResources)
                    .ThenInclude(rr => rr.Resource)
                    .Include(rd => rd.ReceiptResources)
                    .ThenInclude(rr => rr.UnitOfMeasure)
                    .FirstOrDefaultAsync(rd => rd.Id == id);

                if (document == null)
                    return Result.Failure("Документ не найден");

                // Проверяем, что баланс позволяет отменить поступление
                foreach (var rr in document.ReceiptResources)
                {
                    var balance = await _context.Balances
                        .FirstOrDefaultAsync(b => b.ResourceId == rr.ResourceId && b.UnitOfMeasureId == rr.UnitOfMeasureId);

                    if (balance == null || balance.Quantity < rr.Quantity)
                        return Result.Failure($"Недостаточно ресурсов {rr.ResourceId} для отмены поступления");
                }

                // Уменьшаем баланс
                foreach (var rr in document.ReceiptResources)
                {
                    await UpdateBalanceAsync(rr.ResourceId, rr.UnitOfMeasureId, -rr.Quantity);
                }

                _context.ReceiptResources.RemoveRange(document.ReceiptResources);
                _context.ReceiptDocuments.Remove(document);

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                _logger.LogInformation("Удалён документ поступления ID {DocumentId}", id);
                return Result.Success();
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Ошибка при удалении документа поступления с ID {DocumentId}", id);
                return Result.Failure("Не удалось удалить документ поступления");
            }
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
        }

        public async Task<Result<ReceiptDocument>> GetReceiptByIdAsync(int id)
        {
            try
            {
                var receipt = await _context.ReceiptDocuments
                    .Include(rd => rd.ReceiptResources)
                        .ThenInclude(rr => rr.Resource)
                    .Include(rd => rd.ReceiptResources)
                        .ThenInclude(rr => rr.UnitOfMeasure)
                    .FirstOrDefaultAsync(rd => rd.Id == id);

                if (receipt == null)
                    return Result.Failure<ReceiptDocument>($"Документ поступления с ID {id} не найден.");

                return Result.Success(receipt);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении документа поступления с ID {Id}", id);
                return Result.Failure<ReceiptDocument>("Не удалось получить документ");
            }
        }

        public async Task<List<ReceiptDocument>> GetReceiptsWithResourcesAsync()
        {
            try
            {
                return await _context.ReceiptDocuments
                    .Include(rd => rd.ReceiptResources)
                        .ThenInclude(rr => rr.Resource)
                    .Include(rd => rd.ReceiptResources)
                        .ThenInclude(rr => rr.UnitOfMeasure)
                    .OrderByDescending(rd => rd.Date)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении списка документов поступления");
                throw;
            }
        }

        public async Task<List<string>> GetDocumentNumbersAsync()
        {
            try
            {
                return await _context.ReceiptDocuments
                    .Select(rd => rd.Number)
                    .Distinct()
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении номеров документов поступления");
                return new List<string>();
            }
        }
    }
}