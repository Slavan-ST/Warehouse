namespace WarehouseAPI.DTO
{
    public record ReceiptResourceDto(
        int Id,
        int ReceiptDocumentId,
        int ResourceId,
        string ResourceName,
        int UnitOfMeasureId,
        string UnitName,
        decimal Quantity
    );
}