using WarehouseAPI.Models.Enums;

namespace WarehouseAPI.DTO
{
    public record UnitOfMeasureDto
    {
        public int Id { get; init; }
        public string Name { get; init; }
        public EntityStatus Status { get; init; }

        public UnitOfMeasureDto() { }

        public UnitOfMeasureDto(int id, string name, EntityStatus status) : this()
        {
            Id = id;
            Name = name;
            Status = status;
        }
    }
}