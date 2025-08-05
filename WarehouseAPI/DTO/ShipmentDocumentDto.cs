using WarehouseAPI.Models.Enums;

namespace WarehouseAPI.DTO
{
    public record ShipmentDocumentDto
    {
        public int Id { get; init; }
        public string Number { get; init; }
        public DateTime Date { get; init; }
        public ShipmentDocumentStatus Status { get; init; }
        public ClientDto Client { get; init; }
        public List<ShipmentResourceDto> ShipmentResources { get; init; }

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