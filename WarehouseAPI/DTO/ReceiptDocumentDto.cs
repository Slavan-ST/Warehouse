namespace WarehouseAPI.DTO
{
    public record ReceiptDocumentDto(
        int Id,
        string Number,
        DateTime Date,
        List<ReceiptResourceDto> ReceiptResources
    );
}