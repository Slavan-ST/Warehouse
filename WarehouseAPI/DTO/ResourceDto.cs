using WarehouseAPI.Models.Enums;

namespace WarehouseAPI.DTO
{
    public record ResourceDto
    {
        public int Id { get; init; }
        public string Name { get; init; } = string.Empty;
        public EntityStatus Status { get; init; }

        public ResourceDto() { }

        public ResourceDto(int id, string name, EntityStatus status) : this()
        {
            Id = id;
            Name = name;
            Status = status;
        }
    }
}