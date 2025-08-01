using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace WarehouseAPI.Models
{
    public class ReceiptResource
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [ForeignKey("ReceiptDocument")]
        public int ReceiptDocumentId { get; set; }
        public ReceiptDocument ReceiptDocument { get; set; }

        [Required]
        [ForeignKey("Resource")]
        public int ResourceId { get; set; }
        public Resource Resource { get; set; }

        [Required]
        [ForeignKey("UnitOfMeasure")]
        public int UnitOfMeasureId { get; set; }
        public UnitOfMeasure UnitOfMeasure { get; set; }

        [Required]
        public decimal Quantity { get; set; }
    }
}
