using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using WarehouseAPI.Models.Enums;

namespace WarehouseAPI.Models
{
    public class Resource
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(255)]
        public string Name { get; set; }

        [Required]
        public EntityStatus Status { get; set; } = EntityStatus.Active;


        [JsonIgnore]
        public ICollection<Balance> Balances { get; set; }

        [JsonIgnore]
        public ICollection<ReceiptResource> ReceiptResources { get; set; }

        [JsonIgnore]
        public ICollection<ShipmentResource> ShipmentResources { get; set; }
    }
}
