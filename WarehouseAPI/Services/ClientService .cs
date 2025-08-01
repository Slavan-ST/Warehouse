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
                .Where(c => c.Status == EntityStatus.Active)
                .ToListAsync();
        }
    }
}
