using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using WarehouseAPI.Services;
using WarehouseAPI.DTO;
using WarehouseAPI.DTO.Requests;
using Microsoft.Extensions.Logging;
using AutoMapper;
using WarehouseAPI.Models;
using WarehouseAPI.Models.Enums;

namespace WarehouseAPI.Controllers
{
    [ApiController]
    [Route("api/receipts")]
    public class ReceiptsController : ControllerBase
    {
        private readonly ReceiptDocumentService _receiptService;
        private readonly IMapper _mapper;
        private readonly ILogger<ReceiptsController> _logger;

        public ReceiptsController(
            ReceiptDocumentService receiptService,
            IMapper mapper,
            ILogger<ReceiptsController> logger)
        {
            _receiptService = receiptService;
            _mapper = mapper;
            _logger = logger;
        }

        // GET: api/receipts?fromDate=2025-01-01&toDate=2025-01-31&documentNumbers=RC001,RC002&resourceIds=1&unitIds=2
        [HttpGet]
        public async Task<IActionResult> GetReceipts(
            [FromQuery] DateTime? fromDate,
            [FromQuery] DateTime? toDate,
            [FromQuery] string[] documentNumbers,
            [FromQuery] int[] resourceIds,
            [FromQuery] int[] unitIds)
        {
            try
            {
                var receipts = await _receiptService.GetReceiptsWithResourcesAsync();

                if (fromDate.HasValue)
                    receipts = receipts.Where(r => r.Date >= fromDate.Value).ToList();

                if (toDate.HasValue)
                    receipts = receipts.Where(r => r.Date <= toDate.Value).ToList();

                if (documentNumbers?.Length > 0)
                    receipts = receipts.Where(r => documentNumbers.Contains(r.Number)).ToList();

                if (resourceIds?.Length > 0 || unitIds?.Length > 0)
                {
                    receipts = receipts.Where(r => r.ReceiptResources.Any(rr =>
                        (resourceIds == null || resourceIds.Contains(rr.ResourceId)) &&
                        (unitIds == null || unitIds.Contains(rr.UnitOfMeasureId))
                    )).ToList();
                }

                var dtos = _mapper.Map<List<ReceiptDocumentDto>>(receipts);
                return Ok(dtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении документов поступления");
                return StatusCode(500, "Внутренняя ошибка сервера");
            }
        }

        // GET: api/receipts/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetReceipt(int id)
        {
            if (id <= 0) return BadRequest("Некорректный ID");

            try
            {
                var result = await _receiptService.GetReceiptByIdAsync(id);
                if (result.IsFailure)
                    return NotFound(new { message = result.Error });

                var dto = _mapper.Map<ReceiptDocumentDto>(result.Value);
                return Ok(dto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении документа поступления с ID {Id}", id);
                return StatusCode(500, "Внутренняя ошибка сервера");
            }
        }

        // POST: api/receipts
        [HttpPost]
        public async Task<IActionResult> CreateReceipt([FromBody] CreateReceiptDocumentRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var receiptDocument = new ReceiptDocument
                {
                    Number = request.Number,
                    Date = request.Date,
                    ReceiptResources = request.Resources.Select(r => new ReceiptResource
                    {
                        ResourceId = r.ResourceId,
                        UnitOfMeasureId = r.UnitOfMeasureId,
                        Quantity = r.Quantity
                    }).ToList()
                };

                var result = await _receiptService.CreateReceiptWithResourcesAsync(
                    receiptDocument.Number,
                    receiptDocument.Date,
                    receiptDocument.ReceiptResources.ToList()
                );

                if (result.IsFailure)
                    return BadRequest(new { message = result.Error });

                var dto = _mapper.Map<ReceiptDocumentDto>(result.Value);
                return CreatedAtAction(nameof(GetReceipt), new { id = dto.Id }, dto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при создании документа поступления");
                return StatusCode(500, new { message = "Произошла ошибка при сохранении поступления." });
            }
        }

        // DELETE: api/receipts/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteReceipt(int id)
        {
            if (id <= 0) return BadRequest("Некорректный ID");

            try
            {
                var result = await _receiptService.RemoveReceiptDocumentAsync(id);
                if (result.IsSuccess)
                    return NoContent();

                return NotFound(new { message = result.Error });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при удалении документа поступления с ID {Id}", id);
                return StatusCode(500, "Внутренняя ошибка сервера");
            }
        }



        // PUT: api/receipts/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateReceipt(int id, [FromBody] CreateReceiptDocumentRequest request)
        {
            if (id <= 0 || !ModelState.IsValid)
                return BadRequest("Некорректные данные");

            try
            {
                var result = await _receiptService.UpdateReceiptDocumentAsync(
                    id,
                    request.Number,
                    request.Date,
                    request.Resources
                );

                if (result.IsSuccess)
                    return NoContent(); // или Ok(result.Value), если хочешь вернуть обновлённый объект

                return BadRequest(new { message = result.Error });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при обновлении документа поступления с ID {Id}", id);
                return StatusCode(500, "Внутренняя ошибка сервера");
            }
        }
    }



}