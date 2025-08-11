using System.ComponentModel.DataAnnotations;
using WarehouseAPI.Models.Enums;

namespace WarehouseAPI.Models
{
    public class ReceiptDocument
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(50)]
        public string Number { get; set; } = string.Empty;

        [Required]
        public DateTime Date { get; set; }

        [Required]
        public EntityStatus Status { get; set; } = EntityStatus.Active;

        public ICollection<ReceiptResource> ReceiptResources { get; set; } = null!;
    }
}