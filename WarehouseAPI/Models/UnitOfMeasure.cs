using System.ComponentModel.DataAnnotations;
using WarehouseAPI.Models.Enums;

namespace WarehouseAPI.Models
{
    public class UnitOfMeasure
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(255)]
        public string Name { get; set; }

        [Required]
        public EntityStatus Status { get; set; } = EntityStatus.Active;

        public ICollection<Balance> Balances { get; set; }
        public ICollection<ReceiptResource> ReceiptResources { get; set; }
        public ICollection<ShipmentResource> ShipmentResources { get; set; }
    }
}
