namespace WarehouseAPI.DTO
{
    public record ShipmentResourceDto
    {
        public int Id { get; init; }
        public int ShipmentDocumentId { get; init; }
        public int ResourceId { get; init; }
        public string ResourceName { get; init; }
        public int UnitOfMeasureId { get; init; }
        public string UnitName { get; init; }
        public decimal Quantity { get; init; }

        public ShipmentResourceDto() { }

        public ShipmentResourceDto(
            int id,
            int shipmentDocumentId,
            int resourceId,
            string resourceName,
            int unitOfMeasureId,
            string unitName,
            decimal quantity) : this()
        {
            Id = id;
            ShipmentDocumentId = shipmentDocumentId;
            ResourceId = resourceId;
            ResourceName = resourceName;
            UnitOfMeasureId = unitOfMeasureId;
            UnitName = unitName;
            Quantity = quantity;
        }
    }
}