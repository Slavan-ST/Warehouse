using WarehouseAPI.Models.Enums;

namespace WarehouseAPI.DTO
{
    public record ClientDto
    {
        public int Id { get; init; }
        public string Name { get; init; } = string.Empty;
        public string Address { get; init; } = string.Empty;
        public EntityStatus Status { get; init; }

        public ClientDto() { }

        public ClientDto(int id, string name, string address, EntityStatus status) : this()
        {
            Id = id;
            Name = name;
            Address = address;
            Status = status;
        }
    }
}