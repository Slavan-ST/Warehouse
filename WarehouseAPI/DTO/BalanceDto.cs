namespace WarehouseAPI.DTO
{
    public record BalanceDto
    {
        public int Id { get; init; }
        public int ResourceId { get; init; }
        public string ResourceName { get; init; }
        public int UnitOfMeasureId { get; init; }
        public string UnitName { get; init; }
        public decimal Quantity { get; init; }

        public BalanceDto() { }

        public BalanceDto(int id, int resourceId, string resourceName, int unitOfMeasureId, string unitName, decimal quantity) : this()
        {
            Id = id;
            ResourceId = resourceId;
            ResourceName = resourceName;
            UnitOfMeasureId = unitOfMeasureId;
            UnitName = unitName;
            Quantity = quantity;
        }
    }
}