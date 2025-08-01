﻿using System.ComponentModel.DataAnnotations;

namespace WarehouseAPI.Models
{
    public class ReceiptDocument
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(50)]
        public string Number { get; set; }

        [Required]
        public DateTime Date { get; set; }

        public ICollection<ReceiptResource> ReceiptResources { get; set; }
    }
}
