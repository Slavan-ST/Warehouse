namespace WarehouseAPI.Controllers
{
    using Microsoft.AspNetCore.Mvc;
    using System.Threading.Tasks;
    using global::WarehouseAPI.Models.Enums;
    using global::WarehouseAPI.Services;
    using global::WarehouseAPI.Models;

    namespace WarehouseAPI.Controllers
    {
        [ApiController]
        [Route("api/[controller]")]
        public class ClientsController : ControllerBase
        {
            private readonly ClientService _clientService;

            public ClientsController(ClientService clientService)
            {
                _clientService = clientService;
            }

            // GET: api/clients
            [HttpGet]
            public async Task<IActionResult> GetClients()
            {
                var clients = await _clientService.GetActiveClientsAsync();
                return Ok(clients);
            }

            // GET: api/clients/5
            [HttpGet("{id}")]
            public async Task<IActionResult> GetClient(int id)
            {
                var client = await _clientService.GetByIdAsync(id);
                if (client == null || client.Status == EntityStatus.Archived)
                    return NotFound();
                return Ok(client);
            }

            // POST: api/clients
            [HttpPost]
            public async Task<IActionResult> CreateClient([FromBody] Client client)
            {
                if (!ModelState.IsValid) return BadRequest(ModelState);

                var result = await _clientService.CreateClientAsync(client.Name, client.Address);
                if (result.IsFailure)
                    return BadRequest(result.Error);

                return CreatedAtAction(nameof(GetClient), new { id = result.Value.Id }, result.Value);
            }

            // PUT: api/clients/5
            [HttpPut("{id}")]
            public async Task<IActionResult> UpdateClient(int id, [FromBody] Client client)
            {
                if (id != client.Id || !ModelState.IsValid) return BadRequest();

                var existing = await _clientService.GetByIdAsync(id);
                if (existing == null || existing.Status == EntityStatus.Archived)
                    return NotFound();

                existing.Name = client.Name;
                existing.Address = client.Address;

                var result = await _clientService.UpdateClientAsync(existing);
                if (result.IsFailure)
                    return BadRequest(result.Error);

                return NoContent();
            }

            // DELETE: api/clients/5 (архивация)
            [HttpDelete("{id}")]
            public async Task<IActionResult> ArchiveClient(int id)
            {
                var result = await _clientService.ArchiveClientAsync(id);
                if (result.IsFailure)
                    return NotFound(result.Error);

                return NoContent();
            }
        }
    }
}
