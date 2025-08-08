namespace WarehouseAPI.DTO
{
    public record ReceiptResourceDto
    {
        public int Id { get; init; }
        public int ReceiptDocumentId { get; init; }
        public int ResourceId { get; init; }
        public string ResourceName { get; init; } = string.Empty;
        public int UnitOfMeasureId { get; init; }
        public string UnitName { get; init; } = string.Empty;   
        public decimal Quantity { get; init; }

        public ReceiptResourceDto() { }

        public ReceiptResourceDto(
            int id,
            int receiptDocumentId,
            int resourceId,
            string resourceName,
            int unitOfMeasureId,
            string unitName,
            decimal quantity) : this()
        {
            Id = id;
            ReceiptDocumentId = receiptDocumentId;
            ResourceId = resourceId;
            ResourceName = resourceName;
            UnitOfMeasureId = unitOfMeasureId;
            UnitName = unitName;
            Quantity = quantity;
        }
    }
}