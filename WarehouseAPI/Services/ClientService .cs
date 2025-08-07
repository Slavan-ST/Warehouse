using CSharpFunctionalExtensions;
using Microsoft.EntityFrameworkCore;
using WarehouseAPI.Data;
using WarehouseAPI.Models;
using WarehouseAPI.Models.Enums;
using WarehouseAPI.DTO;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Mvc;

namespace WarehouseAPI.Services
{
    public class ClientService : BaseService<Client>
    {
        private readonly ILogger<ClientService> _logger;

        public ClientService(AppDbContext context, ILogger<ClientService> logger)
            : base(context, logger)
        {
            _logger = logger;
        }

        public async Task<Result<Client>> CreateClientAsync(string name, string address)
        {
            if (string.IsNullOrWhiteSpace(name))
                return Result.Failure<Client>("Имя клиента не может быть пустым");

            if (string.IsNullOrWhiteSpace(address))
                return Result.Failure<Client>("Адрес клиента не может быть пустым");

            if (await ExistsAsync(c => c.Name == name && c.Status == EntityStatus.Active))
                return Result.Failure<Client>("Клиент с таким наименованием уже существует");

            var client = new Client { Name = name, Address = address };
            _context.Clients.Add(client);

            try
            {
                await _context.SaveChangesAsync();
                _logger.LogInformation("Создан клиент с ID {ClientId}, имя: '{Name}'", client.Id, client.Name);
                return Result.Success(client);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при создании клиента с именем '{Name}'", name);
                return Result.Failure<Client>("Не удалось создать клиента");
            }
        }

        public async Task<Result> ArchiveClientAsync(int id)
        {
            var client = await _context.Clients.FindAsync(id);
            if (client == null)
                return Result.Success(); // Идемпотентность: нет — значит, уже удалён

            if (client.Status == EntityStatus.Archived)
                return Result.Success(); // Идемпотентность

            var isUsed = await _context.ShipmentDocuments.AnyAsync(sd => sd.ClientId == id);
            if (isUsed)
                return Result.Failure("Невозможно архивировать клиента, так как он используется в документах отгрузки");

            client.Status = EntityStatus.Archived;

            try
            {
                await _context.SaveChangesAsync();
                _logger.LogInformation("Клиент с ID {ClientId} архивирован", id);
                return Result.Success();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при архивации клиента с ID {ClientId}", id);
                return Result.Failure("Не удалось архивировать клиента");
            }
        }

        public async Task<Result> UpdateClientAsync(Client client)
        {
            if (client == null)
                return Result.Failure("Клиент не передан");

            if (string.IsNullOrWhiteSpace(client.Name))
                return Result.Failure("Имя клиента не может быть пустым");

            if (string.IsNullOrWhiteSpace(client.Address))
                return Result.Failure("Адрес клиента не может быть пустым");

            var existingInDb = await _context.Clients.FindAsync(client.Id);
            if (existingInDb == null || existingInDb.Status == EntityStatus.Archived)
                return Result.Failure("Клиент не найден или архивирован");

            // Проверка на дубликат имени
            var exists = await _context.Clients
                .AnyAsync(c => c.Name == client.Name
                            && c.Id != client.Id
                            && c.Status == EntityStatus.Active);

            if (exists)
                return Result.Failure("Клиент с таким наименованием уже существует");

            existingInDb.Name = client.Name;
            existingInDb.Address = client.Address;

            try
            {
                _context.Clients.Update(existingInDb);
                await _context.SaveChangesAsync();
                _logger.LogInformation("Клиент с ID {ClientId} обновлён", client.Id);
                return Result.Success();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при обновлении клиента с ID {ClientId}", client.Id);
                return Result.Failure("Не удалось обновить клиента");
            }
        }

        public async Task<List<ClientDto>> GetActiveClientsAsync()
        {
            try
            {
                return await _context.Clients
                    .Where(c => c.Status == EntityStatus.Active)
                    .Select(c => new ClientDto(
                        c.Id,
                        c.Name,
                        c.Address,
                        c.Status
                    ))
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении списка активных клиентов");
                return new List<ClientDto>();
            }
        }

        public async Task<List<ClientDto>> GetArchivedClientsAsync()
        {
            try
            {
                return await _context.Clients
                    .Where(c => c.Status == EntityStatus.Archived)
                    .Select(c => new ClientDto(
                        c.Id,
                        c.Name,
                        c.Address,
                        c.Status
                    ))
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении архивированных клиентов");
                return new List<ClientDto>();
            }
        }

        public async Task<ClientDto?> GetByIdAsync(int id)
        {
            try
            {
                return await _context.Clients
                    .Select(c => new ClientDto(
                        c.Id,
                        c.Name,
                        c.Address,
                        c.Status
                    ))
                    .FirstOrDefaultAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении клиента с ID {Id}", id);
                return null;
            }
        }

        // Если нужно получить клиента с отгрузками (редкий случай)
        public async Task<Client?> GetClientWithShipmentsAsync(int id)
        {
            return await _context.Clients
                .Include(c => c.ShipmentDocuments)
                .FirstOrDefaultAsync(c => c.Id == id);
        }

        // ClientService.cs

        public async Task<Result> RestoreClientAsync(int id)
        {
            if (id <= 0)
                return Result.Failure("Некорректный ID");

            var client = await _context.Clients.FindAsync(id);
            if (client == null)
                return Result.Failure("Клиент не найден");

            if (client.Status == EntityStatus.Active)
                return Result.Success(); // Идемпотентность

            // Проверяем, существует ли активный клиент с таким же именем
            var existsActiveWithSameName = await _context.Clients
                .AnyAsync(c => c.Name == client.Name &&
                               c.Id != id &&
                               c.Status == EntityStatus.Active);

            if (existsActiveWithSameName)
                return Result.Failure($"Клиент с наименованием '{client.Name}' уже существует");

            client.Status = EntityStatus.Active;

            try
            {
                await _context.SaveChangesAsync();
                _logger.LogInformation("Клиент с ID {ClientId} восстановлен из архива", id);
                return Result.Success();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при восстановлении клиента с ID {Id}", id);
                return Result.Failure("Не удалось восстановить клиента");
            }
        }
    }
}