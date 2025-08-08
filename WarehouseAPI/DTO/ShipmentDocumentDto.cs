using WarehouseAPI.Models.Enums;

namespace WarehouseAPI.DTO
{
    public record ShipmentDocumentDto
    {
        public int Id { get; init; }
        public string Number { get; init; } = string.Empty;
        public DateTime Date { get; init; }
        public ShipmentDocumentStatus Status { get; init; }
        public ClientDto Client { get; init; } = null!;
        public List<ShipmentResourceDto> ShipmentResources { get; init; } = null!;

        public ShipmentDocumentDto() { }

        public ShipmentDocumentDto(
            int id,
            string number,
            DateTime date,
            ShipmentDocumentStatus status,
            ClientDto client,
            List<ShipmentResourceDto> shipmentResources) : this()
        {
            Id = id;
            Number = number;
            Date = date;
            Status = status;
            Client = client;
            ShipmentResources = shipmentResources;
        }
    }
}