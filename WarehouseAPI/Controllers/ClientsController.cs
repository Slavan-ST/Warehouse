using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using WarehouseAPI.Services;
using WarehouseAPI.DTO;
using WarehouseAPI.Models.Enums;
using Microsoft.Extensions.Logging;
using WarehouseAPI.Models;
using WarehouseAPI.DTO.Requests;

namespace WarehouseAPI.Controllers
{
    [ApiController]
    [Route("api/clients")]
    public class ClientsController : ControllerBase
    {
        private readonly ClientService _clientService;
        private readonly ILogger<ClientsController> _logger;

        public ClientsController(
            ClientService clientService,
            ILogger<ClientsController> logger)
        {
            _clientService = clientService;
            _logger = logger;
        }

        // GET: api/clients
        [HttpGet]
        public async Task<IActionResult> GetClients()
        {
            try
            {
                var clients = await _clientService.GetActiveClientsAsync();
                return Ok(clients);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении списка клиентов");
                return StatusCode(500, "Внутренняя ошибка сервера");
            }
        }

        // GET: api/clients/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetClient(int id)
        {
            if (id <= 0) return BadRequest("Некорректный ID");

            try
            {
                var client = await _clientService.GetByIdAsync(id);
                if (client == null)
                    return NotFound("Клиент не найден или архивирован");

                return Ok(client);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении клиента с ID {Id}", id);
                return StatusCode(500, "Внутренняя ошибка сервера");
            }
        }

        // POST: api/clients
        [HttpPost]
        public async Task<IActionResult> CreateClient([FromBody] CreateClientRequest request)
        {
            // Проверяем модель
            if (!ModelState.IsValid)
                return BadRequest(new { message = "Некорректные данные", errors = ModelState });

            try
            {
                // Передаем только нужные поля в сервис
                var result = await _clientService.CreateClientAsync(request.Name, request.Address);
                if (result.IsSuccess)
                {
                    // Возвращаем полный Dto, созданный сервисом
                    return CreatedAtAction(nameof(GetClient), new { id = result.Value.Id }, result.Value);
                }
                return BadRequest(new { message = result.Error });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при создании клиента");
                return StatusCode(500, "Внутренняя ошибка сервера");
            }
        }

        // PUT: api/clients/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateClient(int id, [FromBody] Client client)
        {
            if (id != client.Id || id <= 0 || !ModelState.IsValid)
                return BadRequest("Некорректные данные");

            try
            {
                var result = await _clientService.UpdateClientAsync(client);
                if (result.IsSuccess)
                    return NoContent();

                return BadRequest(new { message = result.Error });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при обновлении клиента с ID {Id}", id);
                return StatusCode(500, "Внутренняя ошибка сервера");
            }
        }

        // DELETE: api/clients/5 (архивация)
        [HttpDelete("{id}")]
        public async Task<IActionResult> ArchiveClient(int id)
        {
            if (id <= 0) return BadRequest("Некорректный ID");

            try
            {
                var result = await _clientService.ArchiveClientAsync(id);
                if (result.IsSuccess)
                    return NoContent();

                return NotFound(new { message = result.Error });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при архивации клиента с ID {Id}", id);
                return StatusCode(500, "Внутренняя ошибка сервера");
            }
        }

        // POST: api/clients/{id}/restore
        [HttpPost("{id}/restore")]
        public async Task<IActionResult> RestoreClient(int id)
        {
            var result = await _clientService.RestoreClientAsync(id);

            if (result.IsSuccess)
                return NoContent();

            if (result.Error.Contains("не найден"))
                return NotFound(new { message = result.Error });

            return BadRequest(new { message = result.Error });
        }
    }
}