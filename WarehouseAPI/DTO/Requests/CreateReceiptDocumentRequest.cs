using WarehouseAPI.DTO.Requests;

namespace WarehouseAPI.DTO.Requests
{
    public record CreateReceiptResourceRequest(
        int ResourceId,
        int UnitOfMeasureId,
        decimal Quantity
    );
}

public record CreateReceiptDocumentRequest(
    string Number,
    DateTime Date,
    List<CreateReceiptResourceRequest> Resources
);