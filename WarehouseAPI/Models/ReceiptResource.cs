using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace WarehouseAPI.Models
{
    public class ReceiptResource
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [ForeignKey("ReceiptDocument")]
        public int ReceiptDocumentId { get; set; }
        public ReceiptDocument ReceiptDocument { get; set; } = null!;

        [Required]
        [ForeignKey("Resource")]
        public int ResourceId { get; set; }
        public Resource Resource { get; set; } = null!;

        [Required]
        [ForeignKey("UnitOfMeasure")]
        public int UnitOfMeasureId { get; set; }
        public UnitOfMeasure UnitOfMeasure { get; set; } = null!;

        [Required]
        public decimal Quantity { get; set; }
    }
}
