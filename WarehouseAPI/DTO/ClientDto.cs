using WarehouseAPI.Models.Enums;

namespace WarehouseAPI.DTO
{
    public record ClientDto(
        int Id,
        string Name,
        string Address,
        EntityStatus Status
    );
}