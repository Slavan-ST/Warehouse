using WarehouseAPI.Models.Enums;

namespace WarehouseAPI.DTO
{
    public record ResourceDto(
        int Id,
        string Name,
        EntityStatus Status
    );
}