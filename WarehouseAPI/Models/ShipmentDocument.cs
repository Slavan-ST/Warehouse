using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using WarehouseAPI.Models.Enums;
using System.Text.Json.Serialization;

namespace WarehouseAPI.Models
{
    public class ShipmentDocument
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(50)]
        public string Number { get; set; }

        [Required]
        [ForeignKey("Client")]
        public int ClientId { get; set; }
        public Client Client { get; set; }

        [Required]
        public DateTime Date { get; set; }

        [Required]
        public ShipmentDocumentStatus Status { get; set; } = ShipmentDocumentStatus.Draft;

        public ICollection<ShipmentResource> ShipmentResources { get; set; }
    }
}
