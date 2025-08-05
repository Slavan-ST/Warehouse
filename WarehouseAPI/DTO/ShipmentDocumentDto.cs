using WarehouseAPI.Models.Enums;

namespace WarehouseAPI.DTO
{
    public record ShipmentDocumentDto(
        int Id,
        string Number,
        DateTime Date,
        ShipmentDocumentStatus Status,
        ClientDto Client,
        List<ShipmentResourceDto> ShipmentResources
    );
}