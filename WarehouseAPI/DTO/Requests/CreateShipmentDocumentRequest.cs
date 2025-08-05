using WarehouseAPI.DTO.Requests;

namespace WarehouseAPI.DTO.Requests
{
    public record CreateShipmentResourceRequest(
        int ResourceId,
        int UnitOfMeasureId,
        decimal Quantity
    );
}

public record CreateShipmentDocumentRequest(
    string Number,
    DateTime Date,
    int ClientId,
    List<CreateShipmentResourceRequest> Resources
);