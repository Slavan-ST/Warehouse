namespace WarehouseAPI.DTO
{
    public record ShipmentResourceDto(
        int Id,
        int ShipmentDocumentId,
        int ResourceId,
        string ResourceName,
        int UnitOfMeasureId,
        string UnitName,
        decimal Quantity
    );
}