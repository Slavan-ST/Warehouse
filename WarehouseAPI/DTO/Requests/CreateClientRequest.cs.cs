namespace WarehouseAPI.DTO.Requests
{
    public record CreateClientRequest(
        string Name,
        string Address
    );
}