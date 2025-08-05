using WarehouseAPI.Models.Enums;

namespace WarehouseAPI.DTO
{
    public record UnitOfMeasureDto(
        int Id,
        string Name,
        EntityStatus Status
    );
}