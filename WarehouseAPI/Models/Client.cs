using System.ComponentModel.DataAnnotations;
using WarehouseAPI.Models.Enums;

namespace WarehouseAPI.Models
{
    public class Client
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(255)]
        public string Name { get; set; }

        [Required]
        public string Address { get; set; }

        [Required]
        public EntityStatus Status { get; set; } = EntityStatus.Active;

        public ICollection<ShipmentDocument> ShipmentDocuments { get; set; }
    }
}
