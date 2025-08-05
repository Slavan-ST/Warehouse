using CSharpFunctionalExtensions;
using Microsoft.EntityFrameworkCore;
using WarehouseAPI.Data;
using WarehouseAPI.Models;
using WarehouseAPI.Models.Enums;

namespace WarehouseAPI.Services
{
    public class ClientService : BaseService<Client>
    {
        public ClientService(AppDbContext context, ILogger<ClientService> logger) : base(context, logger) { }

        public async Task<Result<Client>> CreateClientAsync(string name, string address)
        {
            if (await ExistsAsync(c => c.Name == name && c.Status == EntityStatus.Active))
                return Result.Failure<Client>("Клиент с таким названием уже существует");

            var client = new Client { Name = name, Address = address };
            _context.Clients.Add(client);
            await _context.SaveChangesAsync();

            return Result.Success(client);
        }

        public async Task<Result> ArchiveClientAsync(int id)
        {
            var client = await _context.Clients.FindAsync(id);
            if (client == null)
                return Result.Failure("Клиент не найден");

            var isUsed = await _context.ShipmentDocuments
                .AnyAsync(sd => sd.ClientId == id);

            if (isUsed)
                return Result.Failure("Невозможно удалить клиента, так как он используется в документах отгрузки");

            client.Status = EntityStatus.Archived;
            await _context.SaveChangesAsync();

            return Result.Success();
        }

        public async Task<List<Client>> GetActiveClientsAsync()
        {
            return await _context.Clients
                .Include(c => c.ShipmentDocuments)
                .Where(c => c.Status == EntityStatus.Active)
                .ToListAsync();
        }

        public async Task<Client?> GetByIdAsync(int id)
        {
            return await _context.Clients
                .Include(c => c.ShipmentDocuments)
                .Where(c => c.Id == id)
                .FirstOrDefaultAsync();
        }

        // WarehouseAPI/Services/ClientService.cs

        public async Task<Result> UpdateClientAsync(Client client)
        {
            try
            {
                // Проверим, существует ли активный клиент с таким именем (кроме текущего)
                var exists = await _context.Clients
                    .AnyAsync(c => c.Name == client.Name
                                && c.Id != client.Id
                                && c.Status == EntityStatus.Active);

                if (exists)
                    return Result.Failure("Клиент с таким наименованием уже существует");

                _context.Clients.Update(client);
                await _context.SaveChangesAsync();

                return Result.Success();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при обновлении клиента с ID {ClientId}", client.Id);
                return Result.Failure("Ошибка при сохранении изменений клиента");
            }
        }
    }
}
