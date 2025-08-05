namespace WarehouseAPI.DTO
{
    public record BalanceDto(
        int Id,
        int ResourceId,
        string ResourceName,
        int UnitOfMeasureId,
        string UnitName,
        decimal Quantity
    );
}