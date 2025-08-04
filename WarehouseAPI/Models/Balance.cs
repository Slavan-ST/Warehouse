using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace WarehouseAPI.Models
{
    public class Balance
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [ForeignKey("Resource")]
        public int ResourceId { get; set; }


        [JsonIgnore]
        public Resource Resource { get; set; }

        [Required]
        [ForeignKey("UnitOfMeasure")]
        public int UnitOfMeasureId { get; set; }


        [JsonIgnore]
        public UnitOfMeasure UnitOfMeasure { get; set; }

        [Required]
        public decimal Quantity { get; set; }
    }
}
