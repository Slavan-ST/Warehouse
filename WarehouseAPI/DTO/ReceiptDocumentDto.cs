using System;

namespace WarehouseAPI.DTO
{
    public record ReceiptDocumentDto
    {
        public int Id { get; init; }
        public string Number { get; init; }
        public DateTime Date { get; init; }
        public List<ReceiptResourceDto> ReceiptResources { get; init; }

        public ReceiptDocumentDto() { }

        public ReceiptDocumentDto(
            int id,
            string number,
            DateTime date,
            List<ReceiptResourceDto> receiptResources) : this()
        {
            Id = id;
            Number = number;
            Date = date;
            ReceiptResources = receiptResources;
        }
    }
}